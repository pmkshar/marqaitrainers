#!/bin/bash
# verify-features.sh — Pre-deploy check to ensure all critical features are present
# Run this before pushing to git / deploying to Vercel
# No set -e — we want to continue even if individual checks fail

PASS=0
FAIL=0

check() {
  local label="$1"
  local file="$2"
  local pattern="$3"
  if rg -q "$pattern" "$file" 2>/dev/null; then
    echo "  ✅ $label"
    ((PASS++))
  else
    echo "  ❌ $label — MISSING in $file"
    ((FAIL++))
  fi
}

echo "🔍 Verifying MarqAI critical features..."
echo ""

# ---- Corporate Portal ----
echo "🏢 Corporate Portal:"
check "CorporatePortal component"   "src/components/corporate-portal.tsx" "export function CorporatePortal"
check "Corp Admin quick login"      "src/components/auth-modal.tsx"      "Corp Admin"
check "Corp Emp quick login"        "src/components/auth-modal.tsx"      "Corp Emp"
check "5-column quick login grid"   "src/components/auth-modal.tsx"      "grid-cols-5"
check "CorporatePortal in page.tsx" "src/app/page.tsx"                   "CorporatePortal"
check "Corporate view routing"       "src/app/page.tsx"                   "view.name === 'corporate'"
check "Corporate nav link"           "src/components/navbar.tsx"          "openCorporate"
check "Corporate user dropdown"      "src/components/navbar.tsx"          "corporate_admin"

# ---- Course Material Download ----
echo ""
echo "📥 Course Material Download:"
check "Download button in course detail"  "src/components/course-detail.tsx" "Download.*Material|downloadCourseMaterial"
check "Download function"                 "src/components/course-detail.tsx" "downloadCourseMaterial"

# ---- Corporate Types ----
echo ""
echo "📋 Corporate Types:"
check "CorporateSubscription type"  "src/lib/types.ts"  "CorporateSubscription"
check "CorporatePlanModel type"     "src/lib/types.ts"  "CorporatePlanModel"
check "subscribedCourseIds"         "src/lib/types.ts"  "subscribedCourseIds"
check "employeeRestrictedCourseIds" "src/lib/types.ts"  "employeeRestrictedCourseIds"
check "corporate_admin RoleKey"     "src/lib/types.ts"  "corporate_admin"
check "corporate_user RoleKey"      "src/lib/types.ts"  "corporate_user"
check "approvedCourseIds on User"   "src/lib/types.ts"  "approvedCourseIds"

# ---- Store ----
echo ""
echo "🏪 Store:"
check "INR default currency"        "src/lib/store.ts"  "currency: 'INR'"
check "IN default country"          "src/lib/store.ts"  "country: 'IN'"
check "Asia/Kolkata timezone"       "src/lib/store.ts"  "Asia/Kolkata"
check "GPS locale detection"        "src/lib/store.ts"  "detectLocaleFromGps"
check "Corporate seed data"         "src/lib/store.ts"  "SEED_CORPORATES"
check "Skill matrix seed"           "src/lib/store.ts"  "SEED_SKILL_MATRIX"
check "AI interview reports seed"   "src/lib/store.ts"  "SEED_AI_INTERVIEW_REPORTS"

# ---- Locale ----
echo ""
echo "🌍 Locale / i18n:"
check "LanguageCurrencySwitcher"     "src/components/language-currency-switcher.tsx" "export function LanguageCurrencySwitcher"
check "Locale settings in dashboard" "src/components/dashboard.tsx"                "Language.*Currency|locale"
check "GPS detection in page.tsx"    "src/app/page.tsx"                            "detectLocaleFromGps"

# ---- Summary ----
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: $PASS passed, $FAIL failed"
if [ $FAIL -gt 0 ]; then
  echo "  ⚠️  Some features are missing — DO NOT DEPLOY until fixed!"
  exit 1
else
  echo "  ✅ All critical features verified — safe to deploy"
  exit 0
fi
