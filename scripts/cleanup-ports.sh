#!/bin/bash

# Port cleanup script for NestJS development
# This script kills any processes using ports 3000 and 3001

echo "🧹 Cleaning up port 3000..."


# Kill processes on port 3000
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
    echo "   Killing process on port 3000 (PID: $PORT_3001_PID)"
    kill -9 $PORT_3000_PID
    sleep 1
else
    echo "   Port 3000 is free"
fi

# Kill any remaining node processes on our ports (more specific)
NODE_PIDS=$(lsof -ti:3000)
if [ ! -z "$NODE_PIDS" ]; then
    echo "   Killing remaining Node.js processes on ports 3000"
    kill -9 $NODE_PIDS
    sleep 1
fi

echo "✅ Port cleanup completed!"
echo "   Starting services automatically..."
