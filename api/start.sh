#!/bin/bash
# Start the Travel Guide API server
cd "$(dirname "$0")"
source .env 2>/dev/null
export PORT=${PORT:-3001}
echo "Starting Travel Guide API on port $PORT..."
node server.js
