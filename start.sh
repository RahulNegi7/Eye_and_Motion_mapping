#!/bin/bash

echo "Starting Backend Server (Flask)..."
cd backend
source ../.venv/bin/activate
python flask_server.py &
BACKEND_PID=$!
cd ..

echo "Starting Frontend Server (React)..."
cd frontend
npm start
FRONTEND_PID=$!
cd ..

# When the user presses Ctrl+C, kill both processes
trap "kill -9 $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo "Both servers are running! Press Ctrl+C to stop them."
wait
