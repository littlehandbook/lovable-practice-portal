
# Database Migrations

This folder contains Flyway migration scripts for managing database schema changes.

## Migration Naming Convention

All migration files must follow the pattern: `V<version>__<description>.sql`

Examples:
- `V1__initial_schema.sql`
- `V2__add_user_roles.sql`
- `V3__drop_legacy_stored_procedures.sql`

## Running Migrations

Migrations are automatically applied via GitHub Actions when:
1. Changes are pushed to the `main` branch
2. Files in `db/migrations/` are modified

### Manual Migration (Local Development)

If you need to run migrations manually:

```bash
# Install Flyway CLI
# Download from: https://flywaydb.org/download/

# Run migrations
flyway migrate \
  -url="your_database_url" \
  -user="your_username" \
  -password="your_password" \
  -locations="filesystem:db/migrations"
```

## Best Practices

1. **Idempotent Scripts**: Use `IF EXISTS` and `IF NOT EXISTS` clauses
2. **Transaction Wrapping**: Wrap changes in `BEGIN;` and `COMMIT;`
3. **One Feature Per File**: Keep migrations focused and atomic
4. **Test Before Commit**: Validate migrations against a copy of production data
5. **Rollback Strategy**: Consider creating rollback scripts for complex changes

## Current Migrations

- `V3__drop_legacy_stored_procedures.sql`: Removes legacy stored procedures as part of microservices refactoring

## Rollback Instructions

To rollback to a previous version:

```bash
# Check current version
flyway info

# Rollback to specific version (if supported)
# Note: Flyway requires Flyway Teams edition for automatic rollbacks
# For manual rollback, create a new migration that reverses changes
```
