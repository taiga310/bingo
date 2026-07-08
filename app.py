#!/usr/bin/env python3
"""
Bingo App - Flask server
Serves the real-time bingo game for up to 70 players
"""

import json
import os
import hashlib
import random
from pathlib import Path
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, Response, stream_with_context, send_file
import threading
import io
import base64

# Import config
import config

# Initialize Flask app
app = Flask(__name__)
app.secret_key = config.ADMIN_PASSWORD  # For sessions

# Paths
DATA_DIR = Path(__file__).parent / "data"
NAMES_FILE = DATA_DIR / "names.json"
STATE_FILE = DATA_DIR / "game_state.json"

# Global state for SSE
sse_clients = []
sse_lock = threading.Lock()

def load_names():
    """Load names.json"""
    with open(NAMES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_names(data):
    """Save names.json"""
    with open(NAMES_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_game_state():
    """Load game_state.json"""
    with open(STATE_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_game_state(data):
    """Save game_state.json atomically"""
    temp_file = str(STATE_FILE) + '.tmp'
    with open(temp_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(temp_file, STATE_FILE)

def generate_card_cells(seed: str, names: list, center: str) -> list:
    """
    Generate bingo card cells from seed.
    Same seed always produces same layout.
    Center cell is now random like other cells.

    Args:
        seed: UUID string
        names: list of ~30 names (must not include center)
        center: center cell name (unused now, kept for compatibility)

    Returns:
        list of 9 cell dicts
    """
    # Derive deterministic int from seed
    seed_int = int(hashlib.sha256(seed.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed_int)

    # Select 9 random names (including center position)
    selected = rng.sample(names, min(9, len(names)))

    # Fallback: pad with names if not enough
    if len(selected) < 9:
        selected = (selected * 2)[:9]

    # Build cell objects
    cells = []
    for i, name in enumerate(selected):
        row, col = divmod(i, 3)
        cells.append({
            "index": i,
            "row": row,
            "col": col,
            "name": name,
            "is_center": (i == 4)
        })

    return cells

def notify_all_sse_clients():
    """Notify all SSE clients to reconnect"""
    with sse_lock:
        for event in sse_clients:
            event.set()

# Routes

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/qr')
def qr():
    """QR Code display page"""
    return render_template('qr.html')

@app.route('/test')
def test():
    """Debug test page"""
    return render_template('test.html')

@app.route('/card')
def card():
    """Player bingo card"""
    seed = request.args.get('seed')
    if not seed:
        return redirect(url_for('index'))

    names_data = load_names()
    cells = generate_card_cells(seed, names_data['names'], names_data['center'])

    return render_template('card.html',
                          seed=seed,
                          cells=cells,
                          config=names_data)

@app.route('/api/names')
def api_names():
    """Get names.json"""
    names_data = load_names()
    return jsonify(names_data)

@app.route('/api/state')
def api_state():
    """Get current game state (for polling)"""
    state = load_game_state()
    return jsonify(state)

@app.route('/admin')
def admin():
    """Admin panel"""
    if not session.get('admin'):
        return redirect(url_for('admin_login'))

    names_data = load_names()
    state = load_game_state()

    return render_template('admin.html',
                          names=names_data['names'],
                          drawn=state['drawn'],
                          center=names_data['center'])

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login"""
    if request.method == 'POST':
        password = request.form.get('password', '')
        if password == config.ADMIN_PASSWORD:
            session['admin'] = True
            return redirect(url_for('admin'))
        else:
            return render_template('admin_login.html', error='パスワードが間違っています')

    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin', None)
    return redirect(url_for('index'))

@app.route('/admin/upload', methods=['POST'])
def admin_upload():
    """Upload and parse Excel file"""
    if not session.get('admin'):
        return jsonify({'error': 'Not authorized'}), 403

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({'error': 'Excel file required'}), 400

    try:
        import openpyxl

        # Read Excel file
        workbook = openpyxl.load_workbook(file.stream)
        sheet = workbook.active

        names = []
        for row in sheet.iter_rows(min_row=2, min_col=1, max_col=1):
            cell_value = row[0].value
            if cell_value and isinstance(cell_value, str):
                name = cell_value.strip()
                if name and name != config.CENTER_NAME:
                    names.append(name)

        if len(names) < 9:
            return jsonify({'error': 'At least 9 names required (excluding center)'}), 400

        # Save updated names
        names_data = load_names()
        names_data['names'] = names
        save_names(names_data)

        return jsonify({
            'success': True,
            'count': len(names),
            'names': names[:10]  # Return first 10 for preview
        })

    except Exception as e:
        return jsonify({'error': f'Error reading file: {str(e)}'}), 400

@app.route('/admin/draw', methods=['POST'])
def admin_draw():
    """Draw a name"""
    if not session.get('admin'):
        return jsonify({'error': 'Not authorized'}), 403

    names_data = load_names()
    state = load_game_state()

    all_names = names_data['names']
    drawn = state['drawn']

    # Get undrawn names
    undrawn = [n for n in all_names if n not in drawn]

    if not undrawn:
        return jsonify({'error': 'All names already drawn'}), 400

    # Draw random name
    drawn_name = random.choice(undrawn)
    drawn.append(drawn_name)

    # Update state
    state['drawn'] = drawn
    state['active'] = True
    state['updated_at'] = datetime.now().isoformat()
    save_game_state(state)

    # Notify SSE clients
    notify_all_sse_clients()

    return jsonify({
        'name': drawn_name,
        'drawn': drawn,
        'remaining': len(undrawn) - 1
    })

@app.route('/admin/reset', methods=['POST'])
def admin_reset():
    """Reset game"""
    if not session.get('admin'):
        return jsonify({'error': 'Not authorized'}), 403

    state = {
        'drawn': [],
        'active': False,
        'updated_at': datetime.now().isoformat()
    }
    save_game_state(state)

    # Notify SSE clients
    notify_all_sse_clients()

    return jsonify({'success': True})

@app.route('/api/qr-code')
def api_qr_code():
    """Generate and return QR code image for ngrok URL"""
    try:
        import qrcode
        import urllib.request

        # Try to get ngrok URL
        url = None
        try:
            with urllib.request.urlopen('http://localhost:4040/api/tunnels', timeout=2) as response:
                tunnels = json.loads(response.read())
                if tunnels.get('tunnels'):
                    url = tunnels['tunnels'][0]['public_url']
        except:
            pass

        # Fallback to current host if ngrok not available
        if not url:
            url = request.host_url.rstrip('/')

        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/png')
    except Exception as e:
        print(f"QR code error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/events')
def sse_stream():
    """SSE stream for real-time updates"""
    client_event = threading.Event()

    with sse_lock:
        sse_clients.append(client_event)

    def generate():
        try:
            # Send current state immediately on connect
            state = load_game_state()
            yield f"event: state\ndata: {json.dumps(state, ensure_ascii=False)}\n\n"

            while True:
                # Wait for update or timeout
                client_event.wait(timeout=30)

                if client_event.is_set():
                    client_event.clear()
                    state = load_game_state()
                    yield f"event: state\ndata: {json.dumps(state, ensure_ascii=False)}\n\n"
                else:
                    # Heartbeat
                    yield ": heartbeat\n\n"

        finally:
            with sse_lock:
                sse_clients.remove(client_event)

    return Response(stream_with_context(generate()),
                    mimetype='text/event-stream',
                    headers={
                        'Cache-Control': 'no-cache',
                        'X-Accel-Buffering': 'no'
                    })

@app.template_filter('tojson')
def tojson_filter(obj):
    """Convert to JSON in templates"""
    return json.dumps(obj, ensure_ascii=False)

if __name__ == '__main__':
    # Create data directory if needed
    DATA_DIR.mkdir(exist_ok=True)

    # Run Flask
    app.run(
        host='0.0.0.0',
        port=config.PORT,
        debug=True,
        threaded=True
    )
