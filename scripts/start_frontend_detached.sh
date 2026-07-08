#!/bin/bash
# Self-detaching frontend starter
cd /home/z/my-project/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
echo $! > /tmp/frontend.pid
exit 0
