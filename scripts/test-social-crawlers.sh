#!/usr/bin/env bash
#
# Social Media Crawler Testing Script
# Tests all major social media crawlers to verify OpenGraph access
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
TEST_PATHS=(
  "/"
  "/articles"
  "/resources"
  "/support"
)

echo "=================================================="
echo "Social Media Crawler Access Test"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo ""

# Array of crawlers to test
declare -A CRAWLERS=(
  ["Facebook"]="facebookexternalhit/1.1"
  ["Twitter"]="Twitterbot/1.0"
  ["LinkedIn"]="LinkedInBot/1.0"
  ["Pinterest"]="Pinterest/0.2"
  ["Slack"]="Slackbot-LinkExpanding 1.0"
  ["Discord"]="Mozilla/5.0 (compatible; Discordbot/2.0)"
  ["WhatsApp"]="WhatsApp/2.0"
  ["Telegram"]="TelegramBot"
  ["Apple"]="Applebot/0.1"
  ["Google"]="Googlebot/2.1"
)

# Test function
test_crawler() {
  local crawler_name=$1
  local user_agent=$2
  local path=$3
  local url="${BASE_URL}${path}"
  
  echo -n "Testing $crawler_name on $path... "
  
  # Make request
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "User-Agent: $user_agent" \
    "$url")
  
  if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    return 0
  elif [ "$response" = "403" ]; then
    echo -e "${RED}✗ BLOCKED${NC} (HTTP $response)"
    return 1
  else
    echo -e "${YELLOW}⚠ UNEXPECTED${NC} (HTTP $response)"
    return 2
  fi
}

# Test malicious bot blocking
test_malicious_bot() {
  local bot_name=$1
  local user_agent=$2
  local path="/"
  local url="${BASE_URL}${path}"
  
  echo -n "Testing malicious bot blocking ($bot_name)... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "User-Agent: $user_agent" \
    "$url")
  
  if [ "$response" = "403" ]; then
    echo -e "${GREEN}✓ BLOCKED${NC} (HTTP $response)"
    return 0
  elif [ "$response" = "200" ]; then
    echo -e "${RED}✗ NOT BLOCKED${NC} (HTTP $response)"
    return 1
  else
    echo -e "${YELLOW}⚠ UNEXPECTED${NC} (HTTP $response)"
    return 2
  fi
}

# Test OpenGraph metadata presence
test_opengraph() {
  local path=$1
  local url="${BASE_URL}${path}"
  
  echo -n "Testing OpenGraph metadata on $path... "
  
  html=$(curl -s -H "User-Agent: facebookexternalhit/1.1" "$url")
  
  # Check for required OG tags
  if echo "$html" | grep -q 'property="og:title"' && \
     echo "$html" | grep -q 'property="og:description"' && \
     echo "$html" | grep -q 'property="og:image"' && \
     echo "$html" | grep -q 'property="og:url"'; then
    echo -e "${GREEN}✓ COMPLETE${NC}"
    return 0
  else
    echo -e "${RED}✗ INCOMPLETE${NC}"
    echo "Missing tags:"
    echo "$html" | grep -q 'property="og:title"' || echo "  - og:title"
    echo "$html" | grep -q 'property="og:description"' || echo "  - og:description"
    echo "$html" | grep -q 'property="og:image"' || echo "  - og:image"
    echo "$html" | grep -q 'property="og:url"' || echo "  - og:url"
    return 1
  fi
}

# Run tests
echo "=================================================="
echo "1. Testing Social Media Crawler Access"
echo "=================================================="
echo ""

total_tests=0
passed_tests=0
failed_tests=0

for crawler_name in "${!CRAWLERS[@]}"; do
  user_agent="${CRAWLERS[$crawler_name]}"
  
  for path in "${TEST_PATHS[@]}"; do
    ((total_tests++))
    if test_crawler "$crawler_name" "$user_agent" "$path"; then
      ((passed_tests++))
    else
      ((failed_tests++))
    fi
  done
  echo ""
done

echo "=================================================="
echo "2. Testing Malicious Bot Blocking"
echo "=================================================="
echo ""

declare -A MALICIOUS_BOTS=(
  ["Puppeteer"]="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/91.0.4472.114 Safari/537.36"
  ["Selenium"]="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 selenium"
  ["cURL"]="curl/7.68.0"
  ["wget"]="Wget/1.20.3"
  ["Python Requests"]="python-requests/2.25.1"
  ["Scrapy"]="Scrapy/2.5.0"
)

for bot_name in "${!MALICIOUS_BOTS[@]}"; do
  user_agent="${MALICIOUS_BOTS[$bot_name]}"
  ((total_tests++))
  if test_malicious_bot "$bot_name" "$user_agent"; then
    ((passed_tests++))
  else
    ((failed_tests++))
  fi
done
echo ""

echo "=================================================="
echo "3. Testing OpenGraph Metadata"
echo "=================================================="
echo ""

for path in "${TEST_PATHS[@]}"; do
  ((total_tests++))
  if test_opengraph "$path"; then
    ((passed_tests++))
  else
    ((failed_tests++))
  fi
done
echo ""

echo "=================================================="
echo "4. Testing robots.txt"
echo "=================================================="
echo ""

echo -n "Checking robots.txt accessibility... "
response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/robots.txt")
if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ ACCESSIBLE${NC}"
  ((total_tests++))
  ((passed_tests++))
else
  echo -e "${RED}✗ NOT ACCESSIBLE${NC} (HTTP $response)"
  ((total_tests++))
  ((failed_tests++))
fi

echo -n "Checking robots.txt content... "
robots=$(curl -s "${BASE_URL}/robots.txt")
if echo "$robots" | grep -q "User-agent: facebookexternalhit" && \
   echo "$robots" | grep -q "User-agent: Twitterbot" && \
   echo "$robots" | grep -q "Sitemap:"; then
  echo -e "${GREEN}✓ VALID${NC}"
  ((total_tests++))
  ((passed_tests++))
else
  echo -e "${RED}✗ INVALID${NC}"
  ((total_tests++))
  ((failed_tests++))
fi
echo ""

echo "=================================================="
echo "5. Testing API Endpoints"
echo "=================================================="
echo ""

echo -n "Testing crawler stats endpoint... "
response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/crawler-stats")
if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ ACCESSIBLE${NC}"
  ((total_tests++))
  ((passed_tests++))
else
  echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
  ((total_tests++))
  ((failed_tests++))
fi

echo -n "Testing OpenGraph test endpoint... "
response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/test-opengraph?url=/")
if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ ACCESSIBLE${NC}"
  ((total_tests++))
  ((passed_tests++))
else
  echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
  ((total_tests++))
  ((failed_tests++))
fi
echo ""

echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo "Total Tests: $total_tests"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$failed_tests${NC}"
echo ""

if [ $failed_tests -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
