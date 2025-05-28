
# Database Performance & Cleanup Suite

This directory contains comprehensive database performance monitoring, maintenance, and cleanup scripts for optimizing your PostgreSQL database.

## Scripts Overview

### Core Scripts
- `db-performance-monitor.sql` - Index usage verification and performance metrics
- `db-maintenance.sql` - Vacuum, analyze, and routine maintenance
- `db-archive-cleanup.sql` - Data archival and schema cleanup
- `db-scheduled-maintenance.sql` - Automated maintenance job setup
- `run-performance-suite.sh` - Unified script runner

## Quick Start

### 1. Make the runner executable
```bash
chmod +x scripts/run-performance-suite.sh
```

### 2. Run performance monitoring
```bash
# Basic monitoring
./scripts/run-performance-suite.sh monitor

# With custom database connection
DB_HOST=your-host DB_USER=your-user ./scripts/run-performance-suite.sh monitor
```

### 3. Run maintenance operations
```bash
# Database maintenance
./scripts/run-performance-suite.sh maintain

# Archive old data (with confirmation)
./scripts/run-performance-suite.sh archive

# Set up automated jobs
./scripts/run-performance-suite.sh schedule

# Run everything
./scripts/run-performance-suite.sh all
```

## Detailed Usage

### Performance Monitoring (`db-performance-monitor.sql`)

**Purpose**: Verify index usage and identify optimization opportunities

**What it checks**:
- Index scan statistics for `tbl_branding` and other tables
- Unused indexes that could be dropped
- Table statistics (dead tuples, vacuum history)
- Slow query patterns (requires `pg_stat_statements`)
- Autovacuum configuration

**Usage**:
```bash
psql -h localhost -U postgres -d your_db -f scripts/db-performance-monitor.sql
```

**Key Metrics**:
- **Index Usage**: `idx_scan` shows how often each index is used
- **Dead Tuple Percentage**: High percentages indicate need for vacuum
- **Unused Indexes**: `idx_scan = 0` suggests potential for removal

### Database Maintenance (`db-maintenance.sql`)

**Purpose**: Perform routine database maintenance

**Operations**:
- `VACUUM ANALYZE` on all tables
- Targeted maintenance on high-traffic tables
- Identification of tables needing full vacuum
- Index bloat assessment
- Statistics updates

**Usage**:
```bash
psql -h localhost -U postgres -d your_db -f scripts/db-maintenance.sql
```

**Best Practices**:
- Run during low-traffic periods
- Monitor for tables with >20% dead tuples
- Consider `VACUUM FULL` for heavily bloated tables (with downtime)

### Archive & Cleanup (`db-archive-cleanup.sql`)

**Purpose**: Archive old data and remove unused schema artifacts

**Operations**:
- Creates `archive` schema for historical data
- Archives audit logs older than 2 years
- Archives completed sessions older than 3 years
- Removes orphaned records
- Drops unused triggers and suggests index removal

**Usage**:
```bash
# Review what will be archived first
psql -h localhost -U postgres -d your_db -f scripts/db-archive-cleanup.sql
```

**⚠️ Warning**: This script permanently moves data. Always backup first!

### Scheduled Maintenance (`db-scheduled-maintenance.sql`)

**Purpose**: Set up automated maintenance jobs using `pg_cron`

**Schedules**:
- **Daily** (2 AM UTC): Vacuum analyze on core tables
- **Weekly** (Sunday 3 AM UTC): Full statistics update
- **Monthly** (1st at 1 AM UTC): Archive old data
- **Weekly** (Saturday 4 AM UTC): Cleanup orphaned records

**Prerequisites**:
```sql
-- Requires pg_cron extension (superuser privileges needed)
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**Management**:
```sql
-- View scheduled jobs
SELECT * FROM cron.job WHERE database = current_database();

-- View job execution history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Unschedule a job
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'daily-vacuum-analyze';
```

## Environment Variables

Configure database connection:

```bash
export DB_HOST=your-database-host
export DB_PORT=5432
export DB_NAME=your-database-name
export DB_USER=your-username
export PGPASSWORD=your-password  # For automated scripts
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Database Maintenance

on:
  schedule:
    - cron: '0 6 * * 0'  # Weekly on Sundays at 6 AM UTC

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Database Maintenance
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_USER: ${{ secrets.DB_USER }}
          PGPASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_NAME: ${{ secrets.DB_NAME }}
        run: |
          ./scripts/run-performance-suite.sh maintain
```

### Production Deployment

1. **Pre-deployment**: Run performance monitoring
2. **Post-deployment**: Run maintenance operations
3. **Weekly**: Archive old data
4. **Monthly**: Review and optimize based on metrics

## Monitoring & Alerting

### Key Metrics to Track

1. **Index Usage**:
   - Unused indexes (candidates for removal)
   - Low-usage indexes (review necessity)

2. **Table Health**:
   - Dead tuple percentage (>20% needs attention)
   - Table bloat (size vs. expected size)

3. **Query Performance**:
   - Average execution time trends
   - Most expensive queries

### Alert Thresholds

```sql
-- Example monitoring queries for alerting
SELECT 
  relname,
  ROUND(100.0 * n_dead_tup / GREATEST(n_live_tup + n_dead_tup, 1), 2) as dead_pct
FROM pg_stat_user_tables 
WHERE ROUND(100.0 * n_dead_tup / GREATEST(n_live_tup + n_dead_tup, 1), 2) > 20;
```

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   - Ensure database user has sufficient privileges
   - Some operations require superuser access

2. **Lock Conflicts**:
   - Run maintenance during low-traffic periods
   - Use `VACUUM` instead of `VACUUM FULL` for concurrent access

3. **Archive Schema Issues**:
   - Verify archive schema exists and has proper permissions
   - Check disk space before large archive operations

4. **pg_cron Not Available**:
   - Extension requires superuser privileges to install
   - Consider alternative scheduling (crontab, systemd timers)

### Getting Help

- Check PostgreSQL logs for detailed error messages
- Use `\d+ table_name` to inspect table structure
- Monitor `pg_stat_activity` for blocking queries

## Best Practices

1. **Always backup before major operations**
2. **Test scripts on non-production first**
3. **Monitor performance metrics regularly**
4. **Adjust schedules based on your traffic patterns**
5. **Review unused indexes before dropping them**
6. **Keep archive retention policies aligned with business needs**

