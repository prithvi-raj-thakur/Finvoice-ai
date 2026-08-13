#!/bin/sh
set -e
export HF_HOME="/app/.cache/huggingface"

echo "Running in directory: $(pwd)"
cd /app || echo "Warning: /app directory not found, continuing in $(pwd)"

echo "Step 1: Downloading required models for LiveKit agents..."
uv run python src/agent.py download-files

echo "Step 1.5: Running turn detector diagnostics..."
uv run python -c "
import logging; logging.basicConfig(level=logging.DEBUG)
print('Initializing turn detector manually to catch exceptions...')
from livekit.plugins.turn_detector.multilingual import MultilingualModel
try:
    runner = MultilingualModel()._runner_class()
    runner.initialize()
    print('Turn detector initialized successfully!')
except Exception as e:
    import traceback
    traceback.print_exc()
    print('FAILED TO INITIALIZE TURN DETECTOR')
    exit(1)
"

echo "Step 2: Starting Uvicorn API in the background..."
uv run python -m uvicorn src.outbound_call_service:app --host 0.0.0.0 --port ${PORT:-8000} &

echo "Step 3: Starting Livekit Agent..."
uv run python src/agent.py start
