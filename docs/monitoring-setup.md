
# Monitoring & Observability Setup

This document outlines the observability stack for the therapist-client portal microservices.

## Required Environment Variables

Add these to your microservices environment configuration:

```bash
# Datadog APM
DD_API_KEY=your_datadog_api_key
DD_APP_KEY=your_datadog_app_key
DD_SITE=datadoghq.com
DD_SERVICE=therapist-portal
DD_ENV=production
DD_VERSION=1.0.0
DD_TRACE_ENABLED=true

# Sentry Error Tracking
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# Custom Metrics
METRICS_ENABLED=true
ALERTS_WEBHOOK_URL=your_slack_webhook_url
```

## Datadog APM Configuration

### Service Map Tags
Each microservice should include these tags:
- `tenant_id`: For customer-specific analysis
- `user_role`: therapist, client, admin
- `service_type`: auth, user, branding, twilio
- `api_version`: v1, v2, etc.

### Key Metrics to Track
- `auth.login.success_count`
- `auth.login.failure_count`
- `auth.register.success_count`
- `auth.register.failure_count`
- `rpc.upsert_failure_total`
- `http.request.duration`
- `http.status.5xx`

## Alert Thresholds

### Critical Alerts
- HTTP 5xx rate > 5% over 5 minutes
- Auth failure rate > 20% over 2 minutes
- Service latency P95 > 2000ms over 5 minutes

### Warning Alerts
- HTTP 5xx rate > 1% over 10 minutes
- Auth failure rate > 10% over 5 minutes
- Service latency P95 > 1000ms over 10 minutes

## Dashboard Panels

### Auth Failures Panel
```json
{
  "title": "Authentication Failures",
  "type": "timeseries",
  "metrics": ["auth.login.failure_count", "auth.register.failure_count"],
  "groupBy": ["tenant_id", "error_type"]
}
```

### RPC Errors Panel
```json
{
  "title": "RPC Operation Failures",
  "type": "toplist",
  "metric": "rpc.upsert_failure_total",
  "groupBy": ["service", "operation"]
}
```

### Service Health Panel
```json
{
  "title": "Service Overview",
  "type": "heatmap",
  "metrics": {
    "throughput": "http.request.count",
    "error_rate": "http.status.5xx / http.request.count",
    "latency": "http.request.duration.p95"
  }
}
```
