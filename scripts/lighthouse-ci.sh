#!/bin/bash

# Lighthouse CI Helper Script
# Sets up environment-specific configuration for Lighthouse CI testing
# Usage: ./scripts/lighthouse-ci.sh [staging|production|local]

set -e

ENVIRONMENT=${1:-local}
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case $ENVIRONMENT in
  "staging")
    export LIGHTHOUSE_BASE_URL="https://staging.driplo.com"
    echo "🟡 Running Lighthouse CI against staging environment"
    ;;
  "production")
    export LIGHTHOUSE_BASE_URL="https://driplo.com"
    echo "🔴 Running Lighthouse CI against production environment"
    ;;
  "local"|*)
    export LIGHTHOUSE_BASE_URL="http://localhost:4173"
    echo "🟢 Running Lighthouse CI against local environment"
    ;;
esac

echo "Base URL: $LIGHTHOUSE_BASE_URL"

# Check if we need to start local server
if [[ $ENVIRONMENT == "local" ]]; then
  echo "📦 Building and starting local server..."
  cd "$BASE_DIR/apps/web"
  
  # Check if server is already running
  if curl -s "$LIGHTHOUSE_BASE_URL" > /dev/null 2>&1; then
    echo "✅ Local server is already running at $LIGHTHOUSE_BASE_URL"
  else
    echo "🚀 Starting local server..."
    npm run build
    npm run preview &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to be ready..."
    for i in {1..30}; do
      if curl -s "$LIGHTHOUSE_BASE_URL" > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
      fi
      if [[ $i == 30 ]]; then
        echo "❌ Server failed to start within 30 seconds"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
      fi
      sleep 1
    done
  fi
fi

# Run Lighthouse CI
echo "🔍 Running Lighthouse CI..."
if [[ $ENVIRONMENT == "local" ]]; then
  cd "$BASE_DIR"
  lhci autorun
else
  cd "$BASE_DIR"
  # Use CI config with environment variables
  envsubst < .lighthouserc.ci.json > .lighthouserc.temp.json
  lhci autorun --config=.lighthouserc.temp.json
  rm .lighthouserc.temp.json
fi

# Clean up local server if we started it
if [[ $ENVIRONMENT == "local" && -n $SERVER_PID ]]; then
  echo "🧹 Stopping local server..."
  kill $SERVER_PID 2>/dev/null || true
fi

echo "✅ Lighthouse CI completed!"