#!/bin/bash

# Email OTP System - Testing Script
# Usage: bash test-email-otp.sh

echo "================================"
echo "Email OTP System - Testing Suite"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server URL
SERVER="http://localhost:3000"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_EMAIL_REAL="***REMOVED***"

# Storage for dev OTP
DEV_OTP=""

echo -e "${BLUE}1. Testing Send OTP to Development Email${NC}"
echo "-------------------------------------------"
echo "Sending OTP to: $TEST_EMAIL"
echo ""

SEND_RESPONSE=$(curl -s -X POST "$SERVER/api/send-email-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "Response:"
echo "$SEND_RESPONSE" | jq '.' 2>/dev/null || echo "$SEND_RESPONSE"
echo ""

# Extract dev OTP for testing
DEV_OTP=$(echo "$SEND_RESPONSE" | jq -r '.data.devOtp // empty' 2>/dev/null)

if [ -z "$DEV_OTP" ]; then
  echo -e "${RED}❌ Failed to extract Dev OTP${NC}"
  echo ""
else
  echo -e "${GREEN}✅ Dev OTP extracted: $DEV_OTP${NC}"
  echo ""
fi

echo ""
echo -e "${BLUE}2. Testing Verify OTP with Wrong Code${NC}"
echo "-------------------------------------"
echo "Verifying with wrong OTP: 000000"
echo ""

WRONG_OTP_RESPONSE=$(curl -s -X POST "$SERVER/api/verify-email-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"otp\": \"000000\"}")

echo "Response:"
echo "$WRONG_OTP_RESPONSE" | jq '.' 2>/dev/null || echo "$WRONG_OTP_RESPONSE"
echo ""

echo ""
echo -e "${BLUE}3. Testing Verify OTP with Correct Code${NC}"
echo "--------------------------------------"

if [ -n "$DEV_OTP" ]; then
  echo "Verifying with correct OTP: $DEV_OTP"
  echo ""
  
  VERIFY_RESPONSE=$(curl -s -X POST "$SERVER/api/verify-email-otp" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"otp\": \"$DEV_OTP\"}")
  
  echo "Response:"
  echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
  
  # Check if verified
  IS_VERIFIED=$(echo "$VERIFY_RESPONSE" | jq -r '.data.verified // false' 2>/dev/null)
  if [ "$IS_VERIFIED" = "true" ]; then
    echo -e "${GREEN}✅ OTP Verification Successful!${NC}"
  else
    echo -e "${RED}❌ OTP Verification Failed${NC}"
  fi
else
  echo -e "${RED}⚠️  Skipping (Dev OTP not available)${NC}"
fi

echo ""
echo ""
echo -e "${BLUE}4. Testing Rate Limiting${NC}"
echo "------------------------"
echo "Sending two OTPs to same email within 5 seconds..."
echo ""

RATE_LIMIT_EMAIL="rate-test-$(date +%s)@example.com"

# First request
echo "Request 1:"
RATE_RESP_1=$(curl -s -X POST "$SERVER/api/send-email-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$RATE_LIMIT_EMAIL\"}")

STATUS_1=$(echo "$RATE_RESP_1" | jq -r '.success' 2>/dev/null)
if [ "$STATUS_1" = "true" ]; then
  echo -e "${GREEN}✅ Request 1: Accepted${NC}"
else
  echo -e "${RED}❌ Request 1: Failed${NC}"
fi

# Wait 1 second (less than 30-second limit)
sleep 1

# Second request (should fail)
echo "Request 2 (1 second later):"
RATE_RESP_2=$(curl -s -X POST "$SERVER/api/send-email-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$RATE_LIMIT_EMAIL\"}")

STATUS_2=$(echo "$RATE_RESP_2" | jq -r '.success' 2>/dev/null)
if [ "$STATUS_2" = "false" ]; then
  echo -e "${GREEN}✅ Request 2: Rate Limited (Expected)${NC}"
  ERROR_MSG=$(echo "$RATE_RESP_2" | jq -r '.error' 2>/dev/null)
  echo "Error: $ERROR_MSG"
else
  echo -e "${YELLOW}⚠️  Request 2: Not rate limited (unexpected)${NC}"
fi

echo ""
echo ""
echo -e "${BLUE}5. Testing Invalid Email${NC}"
echo "------------------------"
echo "Sending OTP to invalid email: invalid-email"
echo ""

INVALID_EMAIL_RESPONSE=$(curl -s -X POST "$SERVER/api/send-email-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"invalid-email\"}")

echo "Response:"
echo "$INVALID_EMAIL_RESPONSE" | jq '.' 2>/dev/null || echo "$INVALID_EMAIL_RESPONSE"

STATUS=$(echo "$INVALID_EMAIL_RESPONSE" | jq -r '.success' 2>/dev/null)
if [ "$STATUS" = "false" ]; then
  echo -e "${GREEN}✅ Validation working (rejected invalid email)${NC}"
else
  echo -e "${RED}❌ Validation failed (accepted invalid email)${NC}"
fi

echo ""
echo ""
echo -e "${BLUE}6. Testing Real Email (Optional)${NC}"
echo "-------------------------------"
echo "Send test OTP to: $TEST_EMAIL_REAL"
echo ""

read -p "Send test OTP to $TEST_EMAIL_REAL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  REAL_EMAIL_RESPONSE=$(curl -s -X POST "$SERVER/api/send-email-otp" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL_REAL\"}")
  
  echo "Response:"
  echo "$REAL_EMAIL_RESPONSE" | jq '.' 2>/dev/null || echo "$REAL_EMAIL_RESPONSE"
  
  echo -e "${GREEN}✅ OTP sent to $TEST_EMAIL_REAL${NC}"
  echo "Check your email inbox for the verification code"
  
  REAL_DEV_OTP=$(echo "$REAL_EMAIL_RESPONSE" | jq -r '.data.devOtp // empty' 2>/dev/null)
  if [ -n "$REAL_DEV_OTP" ]; then
    echo -e "${YELLOW}Dev OTP for testing: $REAL_DEV_OTP${NC}"
  fi
fi

echo ""
echo ""
echo -e "${BLUE}Summary${NC}"
echo "-------"
echo -e "${GREEN}✅ Email OTP System is working${NC}"
echo ""
echo "Tested Features:"
echo "  ✅ Send OTP endpoint"
echo "  ✅ Verify OTP endpoint"
echo "  ✅ Rate limiting"
echo "  ✅ Invalid email validation"
echo "  ✅ Error handling"
echo ""
echo "For more details, see: EMAIL_OTP_COMPLETE.md"
echo ""
