#!/usr/bin/env python3
"""
E&R Bingo App - Cross-platform Launcher
Supports: Mac, Linux, Windows
"""

import subprocess
import sys
import os
import time
import json
import urllib.request
import platform
import signal

# スクリプトのディレクトリに移動
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# OS の判定
IS_WINDOWS = platform.system() == "Windows"
IS_MAC = platform.system() == "Darwin"
IS_LINUX = platform.system() == "Linux"

# venv のパス
VENV_DIR = "venv"
if IS_WINDOWS:
    PYTHON_EXE = os.path.join(VENV_DIR, "Scripts", "python.exe")
else:
    PYTHON_EXE = os.path.join(VENV_DIR, "bin", "python")

def print_header(text):
    """ヘッダーを表示"""
    print("\n🎯 " + text)
    print("=" * 50)

def check_venv():
    """venv が存在するか確認"""
    if not os.path.exists(VENV_DIR):
        print_header("❌ venv が見つかりません")
        print("\n以下を実行してセットアップしてください:\n")
        if IS_WINDOWS:
            print("  python -m venv venv")
            print("  venv\\Scripts\\activate")
            print("  pip install -r requirements.txt")
        else:
            print("  python3 -m venv venv")
            print("  source venv/bin/activate")
            print("  pip install -r requirements.txt")
        print()
        sys.exit(1)

def check_python():
    """Python が venv に存在するか確認"""
    if not os.path.exists(PYTHON_EXE):
        print_header("❌ Python executable が見つかりません")
        print(f"Expected: {PYTHON_EXE}\n")
        print("./setup.sh を実行してください\n")
        sys.exit(1)

def start_flask():
    """Flask サーバーを起動"""
    print_header("Flask サーバーを起動中...")

    try:
        # 全環境で shell=True で実行
        cmd = f"{PYTHON_EXE} app.py"
        return subprocess.Popen(cmd, shell=True)
    except Exception as e:
        print_header("❌ Flask 起動エラー")
        print(f"Error: {e}\n")
        sys.exit(1)

def start_ngrok():
    """ngrok トンネルを起動"""
    print_header("ngrok トンネルを起動中...")

    try:
        if IS_WINDOWS:
            return subprocess.Popen(
                ["ngrok", "http", "5001"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True
            )
        else:
            return subprocess.Popen(
                ["ngrok", "http", "5001"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
    except FileNotFoundError:
        print_header("❌ ngrok が見つかりません")
        print("\nngrok をインストールしてください:")
        if IS_WINDOWS:
            print("  1. https://ngrok.com/download からダウンロード")
            print("  2. ZIP を展開")
            print("  3. ngrok.exe を PATH に追加")
        elif IS_MAC:
            print("  brew install ngrok")
        else:
            print("  apt install ngrok  (Ubuntu/Debian)")
        print()
        sys.exit(1)

def get_ngrok_url(max_wait=30):
    """ngrok の URL を取得"""
    print("\n待機中...", end="", flush=True)

    for i in range(max_wait):
        try:
            with urllib.request.urlopen("http://localhost:4040/api/tunnels", timeout=2) as response:
                data = json.loads(response.read().decode())
                if data.get("tunnels"):
                    for tunnel in data["tunnels"]:
                        if tunnel["proto"] == "https":
                            print(" ✓")
                            return tunnel["public_url"]
        except Exception:
            pass

        time.sleep(1)
        print(".", end="", flush=True)

    print(" ⚠️")
    return None

def main():
    """メイン処理"""
    print_header("E&R Bingo Server")
    print(f"Platform: {platform.system()}\n")

    # venv 確認
    check_venv()
    check_python()

    # Flask 起動
    flask_proc = start_flask()
    time.sleep(3)  # Flask が起動するまで待つ

    # ngrok 起動
    ngrok_proc = start_ngrok()
    time.sleep(2)

    # ngrok URL を取得
    ngrok_url = get_ngrok_url()

    if ngrok_url:
        print_header("✅ Server is now publicly accessible!")
        print(f"\n📱 Share this URL with your phone/other devices:\n")
        print(f"   {ngrok_url}\n")
        print(f"QR Code page:\n   {ngrok_url}/qr\n")
        print(f"Direct card link:\n   {ngrok_url}/card\n")
    else:
        print_header("⚠️ Warning")
        print("ngrok URL を取得できませんでしたが、ローカルではアクセス可能です")
        print("http://localhost:5001 でアクセスしてください\n")

    print("=" * 50)
    print("⏸️  Press CTRL+C to stop the server\n")

    # Ctrl+C で終了
    try:
        flask_proc.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down...")
        print("   Terminating Flask...", end="", flush=True)
        flask_proc.terminate()
        time.sleep(1)
        print(" ✓")

        print("   Terminating ngrok...", end="", flush=True)
        ngrok_proc.terminate()
        time.sleep(1)
        print(" ✓")

        print("\n✅ Server stopped\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
