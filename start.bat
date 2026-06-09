@echo off
echo Starting PrivateCopilot...

echo Starting Backend...
start cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services started.
