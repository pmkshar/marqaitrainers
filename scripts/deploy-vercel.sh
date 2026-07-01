#!/bin/bash
# Deploy MarqAI Software Tutor to Vercel
# 
# Prerequisites:
#   1. A Vercel API token from https://vercel.com/account/tokens
#   2. Run: chmod +x scripts/deploy-vercel.sh
#
# Usage:
#   ./scripts/deploy-vercel.sh YOUR_VERCEL_TOKEN

set -e

TOKEN="${1:?Usage: $0 VERCEL_TOKEN}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Deploying to Vercel (production)..."
npx vercel deploy --prod --yes --token "$TOKEN"

echo ""
echo "==> Done! Your site is live at: https://marqaitrainers.vercel.app"
echo "==> Changes deployed:"
echo "    - AI Tutor: Persistent left sidebar with profile icon"
echo "    - AI Tutor: Voice controls (read aloud)"
echo "    - AI Tutor: Collapsible sidebar (minimize to icon strip)"
echo "    - AI Tutor: Floating button when closed (with pulse animation)"
echo "    - AI Tutor: Robust fallback when LLM unavailable"
echo "    - Indian Language TTS (Google Translate fallback)"
echo "    - Slide switching fix (AbortController)"
echo "    - Corporate Dashboard (full CandidateDashboard access)"
echo "    - Subscription Gating (Request Access → Admin Approve)"
