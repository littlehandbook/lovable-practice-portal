
interface ErrorContext {
  userId?: string;
  tenantId?: string;
  userRole?: string;
  route?: string;
  action?: string;
}

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

class MonitoringService {
  private isEnabled: boolean;
  private userId?: string;
  private tenantId?: string;
  private userRole?: string;

  constructor() {
    this.isEnabled = true; // Will be configurable via env
  }

  // Initialize user context for monitoring
  setUserContext(userId: string, tenantId?: string, userRole?: string) {
    this.userId = userId;
    this.tenantId = tenantId;
    this.userRole = userRole;
  }

  // Log application errors with context
  logError(error: Error, context?: ErrorContext) {
    if (!this.isEnabled) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userId: context?.userId || this.userId,
      tenantId: context?.tenantId || this.tenantId,
      userRole: context?.userRole || this.userRole,
      route: context?.route || window.location.pathname,
      action: context?.action,
      userAgent: navigator.userAgent,
    };

    console.error('Application Error:', errorData);

    // Send to monitoring service (would integrate with Sentry in production)
    this.sendToMonitoring('error', errorData);
  }

  // Track custom metrics
  trackMetric(metric: MetricData) {
    if (!this.isEnabled) return;

    const metricData = {
      ...metric,
      timestamp: metric.timestamp || Date.now(),
      tags: {
        ...metric.tags,
        userId: this.userId,
        tenantId: this.tenantId,
        userRole: this.userRole,
      },
    };

    console.log('Metric:', metricData);
    this.sendToMonitoring('metric', metricData);
  }

  // Track API call performance
  trackApiCall(endpoint: string, method: string, duration: number, status: number) {
    this.trackMetric({
      name: 'api.request.duration',
      value: duration,
      tags: {
        endpoint,
        method,
        status: status.toString(),
        success: status < 400 ? 'true' : 'false',
      },
    });

    if (status >= 500) {
      this.trackMetric({
        name: 'api.error.5xx',
        value: 1,
        tags: { endpoint, method, status: status.toString() },
      });
    }
  }

  // Track user actions
  trackUserAction(action: string, details?: Record<string, any>) {
    this.trackMetric({
      name: 'user.action',
      value: 1,
      tags: {
        action,
        route: window.location.pathname,
        ...details,
      },
    });
  }

  // Track authentication events
  trackAuthEvent(event: 'login_success' | 'login_failure' | 'register_success' | 'register_failure', details?: Record<string, any>) {
    this.trackMetric({
      name: `auth.${event}`,
      value: 1,
      tags: {
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async sendToMonitoring(type: 'error' | 'metric', data: any) {
    try {
      // In production, this would send to your monitoring endpoint
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });
    } catch (error) {
      console.warn('Failed to send monitoring data:', error);
    }
  }
}

export const monitoring = new MonitoringService();

// Performance tracking decorator for API calls
export function trackApiPerformance<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  endpoint: string,
  method: string = 'GET'
): T {
  return (async (...args: any[]) => {
    const startTime = performance.now();
    let status = 200;

    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      monitoring.logError(error as Error, { action: `${method} ${endpoint}` });
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      monitoring.trackApiCall(endpoint, method, duration, status);
    }
  }) as T;
}

// Error boundary helper
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          monitoring.logError(error, context);
          throw error;
        });
      }
      return result;
    } catch (error) {
      monitoring.logError(error as Error, context);
      throw error;
    }
  }) as T;
}
