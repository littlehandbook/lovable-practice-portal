
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Clock, Users } from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  errorRate: number;
  lastUpdated: string;
}

interface MetricsSummary {
  totalRequests: number;
  errorCount: number;
  avgLatency: number;
  activeUsers: number;
}

export function MonitoringDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary>({
    totalRequests: 0,
    errorCount: 0,
    avgLatency: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceHealth();
    fetchMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServiceHealth();
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchServiceHealth = async () => {
    try {
      const response = await fetch('/api/monitoring/health');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch service health:', error);
      // Mock data for demonstration
      setServices([
        { name: 'Auth Service', status: 'healthy', latency: 45, errorRate: 0.1, lastUpdated: new Date().toISOString() },
        { name: 'User Service', status: 'healthy', latency: 32, errorRate: 0.0, lastUpdated: new Date().toISOString() },
        { name: 'Branding Service', status: 'warning', latency: 180, errorRate: 2.1, lastUpdated: new Date().toISOString() },
        { name: 'Twilio Service', status: 'healthy', latency: 95, errorRate: 0.3, lastUpdated: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Mock data for demonstration
      setMetrics({
        totalRequests: 15420,
        errorCount: 23,
        avgLatency: 89,
        activeUsers: 142,
      });
    }
  };

  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="p-6">Loading monitoring data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <Badge variant="outline">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Count</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.errorCount / metrics.totalRequests) * 100).toFixed(2)}% error rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">P95 response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Real-time status of all microservices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(service.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.latency}ms</p>
                    <p className="text-xs text-muted-foreground">Latency</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.errorRate}%</p>
                    <p className="text-xs text-muted-foreground">Error Rate</p>
                  </div>
                  <Badge variant={getStatusVariant(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
