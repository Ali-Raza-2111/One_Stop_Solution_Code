#!/usr/bin/env bash
# Start both backend (FastAPI on 8000) and frontend (Vite on 3000)
# Usage:  bash scripts/dev.sh
# Stop:   Ctrl+C  (kills both)

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Cleanup any old processes on these ports
pkill -f "uvicorn app.main" 2>/dev/null || true
pkill -f "vite.*--port=3000" 2>/dev/null || true
sleep 1

# Traps so Ctrl+C cleans both
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM EXIT

# ---- Backend ----
echo "🚀 Starting backend on http://localhost:8000 ..."
cd "$ROOT_DIR/backend"
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi
# Force our local SQLite DB (override any system DATABASE_URL)
export DATABASE_URL="sqlite:///./app.db"
nohup uvicorn app.main:app --port=8000 --host=0.0.0.0 --reload > /tmp/oss-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# ---- Frontend ----
echo "🚀 Starting frontend on http://localhost:3000 ..."
cd "$ROOT_DIR/frontend"
nohup ./node_modules/.bin/vite --port=3000 --host=0.0.0.0 > /tmp/oss-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for both to come up
echo ""
echo "⏳ Waiting for servers to come up ..."
sleep 5

echo ""
echo "==========================================="
echo "✅  Backend  : http://localhost:8000"
echo "    Docs     : http://localhost:8000/docs"
echo "✅  Frontend : http://localhost:3000"
echo "==========================================="
echo ""
echo "Logs:"
echo "  backend  → /tmp/oss-backend.log"
echo "  frontend → /tmp/oss-frontend.log"
echo ""
echo "Press Ctrl+C to stop both."

# Tail both logs in foreground so Ctrl+C works
tail -f /tmp/oss-backend.log /tmp/oss-frontend.log
