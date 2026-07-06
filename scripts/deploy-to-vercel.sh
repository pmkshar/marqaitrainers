#!/bin/bash
# Deploy MarqAI Software Tutor to Vercel
# 
# Usage:
#   ./scripts/deploy-to-vercel.sh YOUR_VERCEL_TOKEN
#
# To create a token:
#   1. Go to https://vercel.com/account/tokens
#   2. Create a new token (name it "deploy-script")
#   3. Copy the token and pass it as the first argument

set -e

TOKEN="${1:?Usage: $0 VERCEL_TOKEN}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "==> Deploying to Vercel (production)..."
npx vercel deploy --prod --yes --token "$TOKEN"

echo "==> Done! Visit https://marqaitrainers.vercel.app"
