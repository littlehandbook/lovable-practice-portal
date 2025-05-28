
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { monitoring } from '@/utils/monitoring';

export function useMonitoring() {
  const { user } = useAuth();

  // Initialize monitoring context when user changes
  useEffect(() => {
    if (user) {
      monitoring.setUserContext(
        user.user_id,
        user.tenant_id,
        user.role
      );
    }
  }, [user]);

  // Track page views
  useEffect(() => {
    monitoring.trackUserAction('page_view', {
      route: window.location.pathname,
      referrer: document.referrer,
    });
  }, []);

  const trackError = useCallback((error: Error, context?: any) => {
    monitoring.logError(error, {
      ...context,
      route: window.location.pathname,
    });
  }, []);

  const trackUserAction = useCallback((action: string, details?: Record<string, any>) => {
    monitoring.trackUserAction(action, details);
  }, []);

  const trackAuthEvent = useCallback((event: 'login_success' | 'login_failure' | 'register_success' | 'register_failure', details?: Record<string, any>) => {
    monitoring.trackAuthEvent(event, details);
  }, []);

  return {
    trackError,
    trackUserAction,
    trackAuthEvent,
  };
}
