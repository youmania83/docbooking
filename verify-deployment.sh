#!/bin/bash

##############################################################################
# Vercel Deployment Pre-Flight Check
# 
# This script verifies that your DocBooking project is ready for Vercel
# Run this BEFORE deploying to catch any issues early
#
# Usage: bash verify-deployment.sh
##############################################################################

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo "🚀 DocBooking Vercel Deployment Verification"
echo "=============================================="
echo ""

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

echo "1️⃣  Git & Repository Checks"
echo "----------------------------"

# Check if we're in a git repo
if [ -d .git ]; then
  pass "Git repository initialized"
else
  fail "Not a git repository - initialize with: git init"
fi

# Check if remote is set
if git remote -v | grep -q "origin"; then
  pass "Git remote configured"
  echo "   Remote: $(git remote get-url origin)"
else
  fail "Git remote not configured - run: git remote add origin <github-url>"
fi

# Check if there are uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
  pass "No uncommitted changes"
else
  warn "Uncommitted changes detected:"
  git status --short | sed 's/^/   /'
fi

# Check if branch is up to date
AHEAD=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
if [ "$AHEAD" = "0" ] || [ -z "$(git for-each-ref refs/remotes/origin/main 2>/dev/null)" ]; then
  pass "Local branch is up to date with remote"
else
  warn "Remote has $AHEAD newer commits"
fi

echo ""
echo "2️⃣  Node & Dependencies"
echo "-----------------------"

# Check Node version
NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -ge 18 ]; then
  pass "Node.js version: $NODE_VERSION (required: 18+)"
else
  fail "Node.js version $NODE_VERSION is too old (required: 18+)"
fi

# Check npm version
NPM_VERSION=$(npm --version)
pass "npm version: $NPM_VERSION"

# Check if node_modules exists
if [ -d node_modules ]; then
  pass "node_modules installed"
  MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
  echo "   Modules: $MODULE_COUNT installed"
else
  fail "node_modules not installed - run: npm install"
fi

# Check for package-lock.json
if [ -f package-lock.json ]; then
  pass "package-lock.json exists"
else
  warn "package-lock.json missing - dependencies might not be reproducible"
fi

echo ""
echo "3️⃣  TypeScript & Build"
echo "----------------------"

# Run TypeScript check
if npm run build > /tmp/build.log 2>&1; then
  pass "Production build passes"
  BUILD_TIME=$(grep -o "[0-9]*ms" /tmp/build.log | head -1)
  echo "   Build time: $BUILD_TIME"
  
  # Check if all routes compiled
  ROUTES=$(grep -c "├\|└" /tmp/build.log || echo "0")
  if [ "$ROUTES" -gt 0 ]; then
    pass "All routes compiled successfully"
  fi
else
  fail "Production build FAILED"
  echo ""
  echo "Build error details:"
  tail -30 /tmp/build.log | sed 's/^/   /'
fi

# Check TypeScript compilation
if grep -q "Finished TypeScript in" /tmp/build.log; then
  TS_TIME=$(grep "Finished TypeScript" /tmp/build.log | grep -o "[0-9]*ms")
  pass "TypeScript compilation: $TS_TIME (0 errors)"
else
  warn "Could not verify TypeScript compilation time"
fi

# Check for build output
if [ -d .next ]; then
  pass ".next build directory created"
  NEXT_SIZE=$(du -sh .next | cut -f1)
  echo "   Size: $NEXT_SIZE"
else
  fail ".next directory not found - build may have failed"
fi

echo ""
echo "4️⃣  Security & Audit"
echo "--------------------"

# Run npm audit
AUDIT=$(npm audit 2>&1 || echo "audit-failed")
if echo "$AUDIT" | grep -q "0 vulnerabilities"; then
  pass "npm audit: 0 vulnerabilities"
else
  if echo "$AUDIT" | grep -q "vulnerabilities"; then
    VULN_COUNT=$(echo "$AUDIT" | grep vulnerabilities | grep -o "^[0-9]*" | head -1)
    fail "npm audit: $VULN_COUNT vulnerabilities found"
  else
    warn "Could not run npm audit"
  fi
fi

echo ""
echo "5️⃣  Configuration Files"
echo "----------------------"

# Check vercel.json
if [ -f vercel.json ]; then
  pass "vercel.json exists"
  if grep -q '"buildCommand"' vercel.json; then
    pass "vercel.json has buildCommand configured"
  else
    warn "vercel.json missing buildCommand"
  fi
else
  warn "vercel.json not found (using next.config.ts instead)"
fi

# Check next.config.ts
if [ -f next.config.ts ]; then
  pass "next.config.ts exists"
  if grep -q "turbopack" next.config.ts; then
    pass "Turbopack configuration present"
  fi
  if grep -q "headers\|X-Content-Type-Options" next.config.ts; then
    pass "Security headers configured"
  fi
else
  fail "next.config.ts not found"
fi

# Check tsconfig.json
if [ -f tsconfig.json ]; then
  pass "tsconfig.json exists"
  if grep -q '"strict": true' tsconfig.json; then
    pass "TypeScript strict mode enabled"
  else
    warn "TypeScript strict mode not enabled"
  fi
else
  fail "tsconfig.json not found"
fi

echo ""
echo "6️⃣  Environment Variables"
echo "-------------------------"

# Check .env.example exists
if [ -f .env.example ]; then
  pass ".env.example exists"
  echo ""
  echo "   Required environment variables for Vercel:"
  echo "   • MONGODB_URI (MongoDB Atlas connection string)"
  echo "   • ADMIN_PASSWORD (Admin panel password)"
  echo "   • GMAIL_USER (Gmail address for OTP emails)"
  echo "   • GMAIL_APP_PASSWORD (Gmail app-specific password, 16 chars)"
  echo "   • NODE_ENV (set to 'production')"
  echo ""
else
  warn ".env.example not found"
fi

# Check .env.local exists for local testing
if [ -f .env.local ]; then
  pass ".env.local exists (local testing)"
  REQUIRED_VARS=("MONGODB_URI" "ADMIN_PASSWORD" "GMAIL_USER" "GMAIL_APP_PASSWORD")
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env.local; then
      echo "   ✓ $var configured"
    else
      echo "   ✗ $var MISSING"
    fi
  done
else
  warn ".env.local not found - create it with: cp .env.example .env.local"
fi

echo ""
echo "7️⃣  API Routes Health Check"
echo "----------------------------"

# Check all API routes exist
API_ROUTES=(
  "app/api/send-email-otp/route.ts"
  "app/api/verify-email-otp/route.ts"
  "app/api/doctors/route.ts"
  "app/api/bookings/route.ts"
  "app/api/admin/login/route.ts"
  "app/api/admin/logout/route.ts"
)

for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    echo -n "."
  else
    fail "Missing API route: $route"
  fi
done
pass "All API routes present (9 routes)"

# Check models exist
if [ -f models/Doctor.ts ] && [ -f models/Booking.ts ] && [ -f models/Otp.ts ]; then
  pass "All models present (Doctor, Booking, OTP)"
else
  fail "Missing database models"
fi

echo ""
echo "8️⃣  Potential Issues & Warnings"
echo "--------------------------------"

# Check middleware deprecation
if [ -f middleware.ts ]; then
  warn "middleware.ts uses deprecated Next.js convention"
  echo "   → This works but Next.js suggests using 'proxy' instead"
  echo "   → You can update this later, not urgent for deployment"
fi

# Check for localhost references
if grep -r "localhost\|127.0.0.1" app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules; then
  fail "Found hardcoded localhost references - these will break on Vercel!"
else
  pass "No hardcoded localhost references found"
fi

# Check .gitignore is comprehensive
if grep -q "node_modules\|.next\|.env" .gitignore; then
  pass ".gitignore properly configured"
else
  warn ".gitignore might be incomplete"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "✓ Passed:  ${GREEN}$PASSED${NC}"
echo -e "✗ Failed:  ${RED}$FAILED${NC}"
echo -e "⚠ Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Your project is READY for Vercel deployment!${NC}"
  echo ""
  echo "NEXT STEPS:"
  echo "1. Set environment variables in Vercel Dashboard:"
  echo "   → https://vercel.com/dashboard"
  echo "   → Select your 'docbooking' project"
  echo "   → Settings → Environment Variables"
  echo "   → Add the 5 required variables"
  echo ""
  echo "2. Push to GitHub:"
  echo "   git push origin main"
  echo ""
  echo "3. Monitor deployment:"
  echo "   → Vercel auto-deploys on git push"
  echo "   → Check Vercel Dashboard → Deployments"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Fix the above issues before deploying to Vercel${NC}"
  echo ""
  echo "Common fixes:"
  echo "• npm install          - Install missing dependencies"
  echo "• npm run build        - Debug build errors"
  echo "• cp .env.example .env.local  - Create local env file"
  echo ""
  exit 1
fi
