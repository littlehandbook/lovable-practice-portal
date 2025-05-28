
#!/usr/bin/env bash

# API Smoke Tests for Auth Guards
# Tests all endpoints to verify proper authentication and authorization

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:5173/api}"
JWT="${JWT_TOKEN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${YELLOW}ℹ️  $message${NC}"
    fi
}

# Function to test endpoint
test_endpoint() {
    local path=$1
    local expected_code=$2
    local description=$3
    local auth_header=""
    
    # Add auth header if JWT token is provided and endpoint expects authentication
    if [ -n "$JWT" ] && [ "$expected_code" -ne 401 ] && [ "$expected_code" -ne 403 ]; then
        auth_header="-H \"Authorization: Bearer $JWT\""
    fi
    
    # Make the request
    local actual_code
    actual_code=$(eval "curl -s -o /dev/null -w \"%{http_code}\" \"$BASE_URL$path\" $auth_header")
    
    if [ "$actual_code" -eq "$expected_code" ]; then
        print_status "PASS" "$path ($description): $actual_code"
        return 0
    else
        print_status "FAIL" "$path ($description): got $actual_code, expected $expected_code"
        return 1
    fi
}

echo "🚀 Starting API Smoke Tests"
echo "Base URL: $BASE_URL"
if [ -n "$JWT" ]; then
    echo "Using JWT token for authenticated requests"
else
    echo "⚠️  No JWT token provided - only testing unauthenticated endpoints"
fi
echo "----------------------------------------"

# Track test results
total_tests=0
failed_tests=0

# Define endpoints with expected status codes
# Format: path expected_code description

# Public endpoints (should return 200 without auth)
endpoints_public=(
    "/health 200 Health_check_endpoint"
    "/public/info 200 Public_information_endpoint"
)

# Auth endpoints (should work without token for login/register)
endpoints_auth=(
    "/auth/login 405 Login_endpoint_POST_only"
    "/auth/register 405 Register_endpoint_POST_only"
    "/auth/verify-email 405 Email_verification_POST_only"
)

# Protected endpoints (should return 401/403 without auth, 200+ with auth)
if [ -n "$JWT" ]; then
    # With JWT token, expect success codes
    endpoints_protected=(
        "/users/me 200 Current_user_profile"
        "/users 200 Users_list"
        "/tenants 200 Tenants_list"
        "/clients 200 Clients_list"
        "/sessions 200 Sessions_list"
        "/documents 200 Documents_list"
        "/branding 200 Branding_settings"
        "/roles 200 Roles_list"
        "/user-roles 200 User_roles_list"
        "/page-permissions 200 Page_permissions_list"
        "/configurations 200 Configurations_list"
    )
else
    # Without JWT token, expect auth errors
    endpoints_protected=(
        "/users/me 401 Current_user_profile_requires_auth"
        "/users 401 Users_list_requires_auth"
        "/tenants 401 Tenants_list_requires_auth"
        "/clients 401 Clients_list_requires_auth"
        "/sessions 401 Sessions_list_requires_auth"
        "/documents 401 Documents_list_requires_auth"
        "/branding 401 Branding_settings_require_auth"
        "/roles 401 Roles_list_requires_auth"
        "/user-roles 401 User_roles_list_requires_auth"
        "/page-permissions 401 Page_permissions_requires_auth"
        "/configurations 401 Configurations_require_auth"
    )
fi

# Run public endpoint tests
echo "📂 Testing Public Endpoints"
for endpoint in "${endpoints_public[@]}"; do
    IFS=' ' read -r path expected_code description <<< "$endpoint"
    ((total_tests++))
    if ! test_endpoint "$path" "$expected_code" "$description"; then
        ((failed_tests++))
    fi
done

echo ""
echo "🔐 Testing Auth Endpoints"
for endpoint in "${endpoints_auth[@]}"; do
    IFS=' ' read -r path expected_code description <<< "$endpoint"
    ((total_tests++))
    if ! test_endpoint "$path" "$expected_code" "$description"; then
        ((failed_tests++))
    fi
done

echo ""
echo "🛡️  Testing Protected Endpoints"
for endpoint in "${endpoints_protected[@]}"; do
    IFS=' ' read -r path expected_code description <<< "$endpoint"
    ((total_tests++))
    if ! test_endpoint "$path" "$expected_code" "$description"; then
        ((failed_tests++))
    fi
done

echo ""
echo "----------------------------------------"
echo "📊 Test Summary"
echo "Total tests: $total_tests"
echo "Passed: $((total_tests - failed_tests))"
echo "Failed: $failed_tests"

if [ $failed_tests -eq 0 ]; then
    print_status "PASS" "All smoke tests passed! 🎉"
    exit 0
else
    print_status "FAIL" "$failed_tests test(s) failed"
    exit 1
fi
