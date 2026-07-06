#!/bin/bash
# run_public.sh - Start bingo server and expose via ngrok

set -e

BINGO_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV="$BINGO_DIR/../venv"
PORT=5001

echo "🎯 E&R Bingo Server"
echo "==================="

# Kill any existing Python processes on port 5001
pkill -f "python app.py" 2>/dev/null || true
sleep 1

# Start Flask server in background
cd "$BINGO_DIR"
"$VENV/bin/python" app.py > /tmp/bingo_server.log 2>&1 &
FLASK_PID=$!
echo "✓ Flask server started (PID: $FLASK_PID)"
sleep 2

# Start ngrok tunnel
echo "📡 Starting ngrok tunnel..."
ngrok http $PORT --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 4

# Get the ngrok URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to get ngrok URL."
  echo "🔍 ngrok log:"
  cat /tmp/ngrok.log | tail -30
  kill $FLASK_PID $NGROK_PID 2>/dev/null || true
  exit 1
fi

echo ""
echo "✅ Server is now publicly accessible!"
echo ""
echo "📱 Share this URL with your phone/other devices:"
echo ""
echo "   $NGROK_URL"
echo ""
echo "Direct links:"
echo "   Landing:  $NGROK_URL/"
echo "   Card:     $NGROK_URL/card?seed=test-123"
echo ""
echo "⏸️  Press Ctrl+C to stop the server"
echo ""

# Keep scripts running
trap "echo ''; echo '🛑 Stopping servers...'; kill $FLASK_PID $NGROK_PID 2>/dev/null || true; exit 0" SIGINT

# Wait for both processes
wait
