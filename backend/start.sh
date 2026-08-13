#!/bin/sh
set -e

echo "Running in directory: $(pwd)"
cd /app || echo "Warning: /app directory not found, continuing in $(pwd)"

echo "Step 1: Downloading required models for LiveKit agents..."
uv run python src/agent.py download-files

echo "Step 2: Starting Uvicorn API in the background..."
uv run python -m uvicorn src.outbound_call_service:app --host 0.0.0.0 --port ${PORT:-8000} &

echo "Step 3: Starting Livekit Agent..."
uv run python src/agent.py start
