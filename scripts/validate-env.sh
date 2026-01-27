#!/bin/bash
# Validate environment variables for deployment
# Usage: ./scripts/validate-env.sh [env-file]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to .env if no file specified
ENV_FILE="${1:-.env}"

echo -e "${BLUE}=== Environment Variables Validation ===${NC}"
echo "Checking: $ENV_FILE"
echo ""

# Check if file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ Error: $ENV_FILE not found${NC}"
    exit 1
fi

# Load environment file
set -a
source "$ENV_FILE"
set +a

ERRORS=0
WARNINGS=0

# Helper functions
check_required() {
    local var_name="$1"
    local var_value="${!var_name}"
    local description="$2"

    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ $var_name is not set${NC}"
        echo "  $description"
        ((ERRORS++))
        return 1
    fi
    return 0
}

check_min_length() {
    local var_name="$1"
    local var_value="${!var_name}"
    local min_length="$2"
    local description="$3"

    if [ ${#var_value} -lt $min_length ]; then
        echo -e "${RED}✗ $var_name is too short (${#var_value} chars, minimum $min_length)${NC}"
        echo "  $description"
        ((ERRORS++))
        return 1
    fi
    return 0
}

check_default_value() {
    local var_name="$1"
    local var_value="${!var_name}"
    local default_pattern="$2"

    if [[ "$var_value" =~ $default_pattern ]]; then
        echo -e "${YELLOW}⚠ $var_name appears to use a default/placeholder value${NC}"
        echo "  Value: $var_value"
        ((WARNINGS++))
        return 1
    fi
    return 0
}

check_url_format() {
    local var_name="$1"
    local var_value="${!var_name}"

    # Check if it ends with a slash
    if [[ "$var_value" =~ /$ ]]; then
        echo -e "${YELLOW}⚠ $var_name should not end with a slash${NC}"
        echo "  Value: $var_value"
        ((WARNINGS++))
        return 1
    fi

    # Check if it starts with http/https
    if [[ ! "$var_value" =~ ^https?:// ]]; then
        echo -e "${RED}✗ $var_name must start with http:// or https://${NC}"
        echo "  Value: $var_value"
        ((ERRORS++))
        return 1
    fi

    return 0
}

# Section: Database
echo -e "${BLUE}[Database]${NC}"
check_required "POSTGRES_DB" "PostgreSQL database name"
check_required "POSTGRES_USER" "PostgreSQL username"
if check_required "POSTGRES_PASSWORD" "PostgreSQL password"; then
    check_min_length "POSTGRES_PASSWORD" 20 "Use strong passwords (20+ characters)"
    check_default_value "POSTGRES_PASSWORD" "CHANGE_ME|password|123"
fi
if check_required "DATABASE_URL" "PostgreSQL connection string"; then
    if [[ "$DATABASE_URL" =~ @localhost: ]]; then
        echo -e "${YELLOW}⚠ DATABASE_URL uses localhost - is this correct for your deployment?${NC}"
        ((WARNINGS++))
    fi
fi
echo ""

# Section: Redis
echo -e "${BLUE}[Redis]${NC}"
if check_required "REDIS_PASSWORD" "Redis password"; then
    check_min_length "REDIS_PASSWORD" 20 "Use strong passwords (20+ characters)"
    check_default_value "REDIS_PASSWORD" "CHANGE_ME|password|123"
fi
check_required "REDIS_URL" "Redis connection string"
echo ""

# Section: JWT
echo -e "${BLUE}[JWT Configuration]${NC}"
if check_required "JWT_SECRET" "JWT signing secret"; then
    check_min_length "JWT_SECRET" 32 "JWT_SECRET must be at least 32 characters"
    check_default_value "JWT_SECRET" "CHANGE_ME|secret"
fi
check_required "JWT_ACCESS_EXPIRES_IN" "Access token expiration"
check_required "JWT_REFRESH_EXPIRES_IN" "Refresh token expiration"
echo ""

# Section: Setup Key
echo -e "${BLUE}[Super Admin Setup]${NC}"
if check_required "SETUP_KEY" "Super admin setup key"; then
    check_min_length "SETUP_KEY" 16 "SETUP_KEY must be at least 16 characters"
    check_default_value "SETUP_KEY" "CHANGE_ME|setup"
fi
echo ""

# Section: CORS
echo -e "${BLUE}[CORS Configuration]${NC}"
if check_required "CORS_ORIGIN" "Allowed CORS origin"; then
    if [ "$NODE_ENV" = "production" ] && [ "$CORS_ORIGIN" = "*" ]; then
        echo -e "${RED}✗ CORS_ORIGIN cannot be '*' in production${NC}"
        echo "  Set it to your frontend domain (e.g., https://app.example.com)"
        ((ERRORS++))
    elif [ "$CORS_ORIGIN" != "*" ]; then
        check_url_format "CORS_ORIGIN"
    fi
fi
echo ""

# Section: API URL
echo -e "${BLUE}[Frontend Configuration]${NC}"
if check_required "VITE_API_URL" "API URL for frontend"; then
    check_url_format "VITE_API_URL"
fi
echo ""

# Section: Email (Optional)
echo -e "${BLUE}[Email Service - Optional]${NC}"
if [ -n "$RESEND_API_KEY" ]; then
    echo -e "${GREEN}✓ RESEND_API_KEY is set${NC}"
    check_required "EMAIL_FROM" "Email sender address"
else
    echo -e "${YELLOW}⚠ RESEND_API_KEY not set - email features will be disabled${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo -e "${BLUE}=== Validation Summary ===${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Your environment configuration looks good."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo "Your configuration will work but consider addressing the warnings."
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    [ $WARNINGS -gt 0 ] && echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Please fix the errors before deploying."
    exit 1
fi
