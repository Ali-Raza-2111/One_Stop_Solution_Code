#!/bin/bash
# Self-detaching backend starter
# Uses /home/z/.venv/bin/python3 (shared venv with deps installed)
# Overrides DATABASE_URL via env var to bypass root .env (Prisma format)

# Kill any stale backend on port 8000
fuser -k 8000/tcp 2>/dev/null || true
sleep 1

cd /home/z/my-project/backend

# Force correct SQLite URL — env vars take precedence over .env file in pydantic-settings
export DATABASE_URL="sqlite:///./app.db"
export SECRET_KEY="dev-secret-key-change-in-production-shahid-branch"
export DEBUG="True"
export HOST="0.0.0.0"
export PORT="8000"
export CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"

nohup /home/z/.venv/bin/python3 main.py > /tmp/backend.log 2>&1 &
echo $! > /tmp/backend.pid
sleep 3
echo "Started backend PID: $(cat /tmp/backend.pid)"
echo "Logs: /tmp/backend.log"
