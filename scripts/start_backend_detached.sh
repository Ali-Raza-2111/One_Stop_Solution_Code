#!/bin/bash
# Self-detaching backend starter
# Double-fork to fully detach from parent shell

export UV_CACHE_DIR=/home/z/my-project/.uv-cache
export DATABASE_URL=sqlite:///./app.db
cd /home/z/my-project/backend

# Double-fork: parent exits immediately, child becomes orphan under init
nohup /home/z/my-project/backend/.venv/bin/python main.py > /tmp/backend.log 2>&1 &
echo $! > /tmp/backend.pid
exit 0
