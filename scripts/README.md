
# Scripts Directory

This directory contains various utility scripts for API testing, database maintenance, and system monitoring.

## Contents

### API Testing
- `smoke-test.sh` - Bash-based API endpoint testing
- `smoke-test.js` - Node.js-based API testing with enhanced features
- `package.json` - NPM configuration for Node.js scripts

### Database Management
- `cleanup-database.sql` - Remove legacy database roles and credentials
- `db-performance-monitor.sql` - Monitor index usage and performance metrics
- `db-maintenance.sql` - Routine vacuum, analyze, and maintenance
- `db-archive-cleanup.sql` - Archive old data and cleanup schema
- `db-scheduled-maintenance.sql` - Set up automated maintenance jobs
- `run-performance-suite.sh` - Unified database performance script runner

### Migration Support
- **See `../db/` directory for Flyway migrations**

## Quick Reference

### API Smoke Tests
```bash
# Test API endpoints
./scripts/smoke-test.sh

# With authentication
JWT_TOKEN="your-token" ./scripts/smoke-test.sh

# Node.js version with more features
cd scripts && npm run test
```

### Database Performance Suite
```bash
# Monitor performance
./scripts/run-performance-suite.sh monitor

# Run maintenance
./scripts/run-performance-suite.sh maintain

# Archive old data
./scripts/run-performance-suite.sh archive

# Run everything
./scripts/run-performance-suite.sh all
```

### Database Cleanup
```bash
# Remove legacy roles
psql -f scripts/cleanup-database.sql
```

## Documentation

- **API Testing**: See detailed documentation in this file
- **Database Performance**: See `performance-README.md` for comprehensive guide
- **Database Migrations**: See `../db/README.md` for migration procedures

## Environment Setup

Most scripts support these environment variables:

```bash
# API Testing
export BASE_URL="https://your-api.example.com/api"
export JWT_TOKEN="your-jwt-token"

# Database Operations  
export DB_HOST="your-db-host"
export DB_PORT="5432"
export DB_NAME="your-database"
export DB_USER="your-username"
export PGPASSWORD="your-password"
```

## Integration

These scripts are designed to integrate with:
- **CI/CD pipelines** (GitHub Actions, GitLab CI)
- **Monitoring systems** (Prometheus, Grafana)
- **Automated deployment processes**
- **Database maintenance schedules**

See individual script documentation for specific integration examples.

