
# API Smoke Tests & Database Cleanup Scripts

This directory contains scripts for testing API authentication guards and cleaning up database credentials after microservices migration.

## API Smoke Tests

### Purpose
These scripts test all API endpoints to verify:
- Public endpoints return appropriate responses without authentication
- Auth endpoints work correctly for login/register flows  
- Protected endpoints properly require authentication (401/403 without token, success with valid token)

### Files
- `smoke-test.sh` - Bash version using curl
- `smoke-test.js` - Node.js version with enhanced features
- `package.json` - NPM scripts for running tests

### Usage

#### Bash Version
```bash
# Make executable
chmod +x scripts/smoke-test.sh

# Run against local development server
./scripts/smoke-test.sh

# Run against specific environment
BASE_URL="https://staging.example.com/api" ./scripts/smoke-test.sh

# Run with authentication token
JWT_TOKEN="your-jwt-token-here" ./scripts/smoke-test.sh
```

#### Node.js Version
```bash
# Install dependencies (if needed)
cd scripts && npm install

# Run basic tests
npm run test

# Run with verbose output
npm run test:verbose

# Run against staging
npm run test:staging

# Run with authentication
JWT_TOKEN="your-jwt-token-here" npm run test

# Run against custom environment
BASE_URL="https://your-api.com/api" JWT_TOKEN="token" npm run test
```

### Environment Variables
- `BASE_URL` - API base URL (default: http://localhost:5173/api)
- `JWT_TOKEN` - Authentication token for protected endpoints
- `TIMEOUT` - Request timeout in milliseconds (default: 5000)
- `VERBOSE` - Enable verbose output (true/false)

### Expected Results

#### Without JWT Token
- Public endpoints: 200 OK
- Auth endpoints: 405 Method Not Allowed (GET not supported)
- Protected endpoints: 401 Unauthorized

#### With Valid JWT Token  
- Public endpoints: 200 OK
- Auth endpoints: 405 Method Not Allowed (GET not supported)
- Protected endpoints: 200 OK (or appropriate success code)

### Integration with CI/CD
Add to your deployment pipeline:

```yaml
# GitHub Actions example
- name: Run API Smoke Tests
  run: |
    cd scripts
    JWT_TOKEN="${{ secrets.TEST_JWT_TOKEN }}" \
    BASE_URL="${{ vars.STAGING_API_URL }}" \
    npm run test
```

## Database Cleanup

### Purpose
Remove legacy database users and roles that are no longer needed after migrating to microservices architecture.

### Files
- `cleanup-database.sql` - SQL script for removing legacy roles and privileges

### Usage
```bash
# Connect to your database
psql -h your-db-host -U your-admin-user -d your-database

# Run the cleanup script
\i scripts/cleanup-database.sql
```

### What It Does
1. **Audits existing roles** - Shows all custom database roles and their privileges
2. **Removes legacy RPC user** - Safely drops the `rpc_user` role if it exists
3. **Identifies orphaned privileges** - Finds grants to non-existent roles
4. **Verifies cleanup** - Shows remaining roles after cleanup

### Safety Features
- Wrapped in transactions for safe rollback
- Checks for role existence before attempting to drop
- Provides detailed logging of all actions
- Only removes explicitly identified legacy roles

### Customization
Edit the script to add removal of other legacy roles specific to your setup:

```sql
-- Add to the script
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'your_legacy_role') THEN
        REVOKE ALL ON SCHEMA public FROM your_legacy_role;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM your_legacy_role;
        DROP ROLE your_legacy_role;
        RAISE NOTICE 'Dropped role: your_legacy_role';
    END IF;
END
$$;
```

## Security Considerations

### For API Tests
- Never commit JWT tokens to version control
- Use environment variables or secrets management
- Rotate test tokens regularly
- Use dedicated test accounts with minimal privileges

### For Database Cleanup
- Always test on non-production environments first
- Backup your database before running cleanup scripts
- Verify application functionality after role removal
- Document which roles were removed and why

## Troubleshooting

### API Test Failures
- **Connection refused**: Check if API server is running
- **401 on protected endpoints**: Verify JWT token is valid and not expired
- **Unexpected status codes**: Check API server logs for errors

### Database Cleanup Issues
- **Permission denied**: Ensure you're connected as a superuser or role owner
- **Role cannot be dropped**: Check for active connections using the role
- **Dependencies exist**: Some roles may have dependencies that need to be removed first

## Extending the Tests

### Adding New Endpoints
1. Add to the appropriate section in the smoke test scripts
2. Specify expected status code for authenticated/unauthenticated requests
3. Include descriptive test name

### Adding Custom Validations
For the Node.js version, you can extend the `testEndpoint` function to:
- Check response headers
- Validate response body structure
- Test specific error messages
- Measure response times
