
#!/usr/bin/env bash

# Database Performance Suite Runner
# Executes all performance monitoring and maintenance scripts

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case "$status" in
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
    esac
}

# Function to run SQL script
run_sql_script() {
    local script_name=$1
    local description=$2
    
    print_status "INFO" "Running $description..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$script_name"; then
        print_status "SUCCESS" "$description completed"
        return 0
    else
        print_status "ERROR" "$description failed"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  monitor     - Run performance monitoring (default)"
    echo "  maintain    - Run database maintenance"
    echo "  archive     - Run archive and cleanup"
    echo "  schedule    - Set up scheduled maintenance jobs"
    echo "  all         - Run all operations in sequence"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo ""
    echo "Environment Variables:"
    echo "  DB_HOST     Database host (default: localhost)"
    echo "  DB_PORT     Database port (default: 5432)"
    echo "  DB_NAME     Database name (default: postgres)"
    echo "  DB_USER     Database user (default: postgres)"
}

# Parse command line arguments
VERBOSE=false
COMMAND="monitor"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        monitor|maintain|archive|schedule|all)
            COMMAND=$1
            shift
            ;;
        *)
            print_status "ERROR" "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
print_status "INFO" "Database Performance Suite"
print_status "INFO" "Target: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

case "$COMMAND" in
    monitor)
        run_sql_script "$SCRIPT_DIR/db-performance-monitor.sql" "Performance Monitoring"
        ;;
    maintain)
        run_sql_script "$SCRIPT_DIR/db-maintenance.sql" "Database Maintenance"
        ;;
    archive)
        print_status "WARNING" "Archive operations will permanently move old data"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_sql_script "$SCRIPT_DIR/db-archive-cleanup.sql" "Archive and Cleanup"
        else
            print_status "INFO" "Archive operation cancelled"
        fi
        ;;
    schedule)
        print_status "WARNING" "This will set up automated maintenance jobs"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_sql_script "$SCRIPT_DIR/db-scheduled-maintenance.sql" "Scheduled Maintenance Setup"
        else
            print_status "INFO" "Scheduled maintenance setup cancelled"
        fi
        ;;
    all)
        print_status "INFO" "Running complete performance suite..."
        echo ""
        
        # Run monitoring first
        run_sql_script "$SCRIPT_DIR/db-performance-monitor.sql" "Performance Monitoring"
        echo ""
        
        # Run maintenance
        run_sql_script "$SCRIPT_DIR/db-maintenance.sql" "Database Maintenance"
        echo ""
        
        # Ask about archive
        print_status "WARNING" "Archive operations will permanently move old data"
        read -p "Run archive and cleanup? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_sql_script "$SCRIPT_DIR/db-archive-cleanup.sql" "Archive and Cleanup"
        else
            print_status "INFO" "Skipping archive operations"
        fi
        echo ""
        
        # Ask about scheduling
        print_status "WARNING" "This will set up automated maintenance jobs"
        read -p "Set up scheduled maintenance? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_sql_script "$SCRIPT_DIR/db-scheduled-maintenance.sql" "Scheduled Maintenance Setup"
        else
            print_status "INFO" "Skipping scheduled maintenance setup"
        fi
        ;;
esac

echo ""
print_status "SUCCESS" "Performance suite completed!"

if [ "$VERBOSE" = true ]; then
    echo ""
    print_status "INFO" "Available scripts:"
    ls -la "$SCRIPT_DIR"/*.sql
fi

