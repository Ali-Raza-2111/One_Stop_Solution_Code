#!/bin/bash
# Persistent backend starter
export UV_CACHE_DIR=/home/z/my-project/.uv-cache
unset DATABASE_URL
cd /home/z/my-project/backend
exec uv run main.py
