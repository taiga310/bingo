#!/bin/bash
# E&R Bingo App - One-time Setup Script

set -e

echo "🎯 E&R Bingo Setup"
echo "=================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 が見つかりません。インストールしてください。"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Create venv
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "✓ Virtual environment ready"

# Activate venv
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -r requirements.txt
pip install qrcode

echo "✓ Dependencies installed"

# Check ngrok
if ! command -v ngrok &> /dev/null; then
    echo "⚠️  ngrok が見つかりません。"
    echo "以下のコマンドで ngrok をインストールしてください："
    echo "  brew install ngrok  (Mac)"
    echo "  choco install ngrok  (Windows)"
    echo "  apt install ngrok  (Linux)"
    exit 1
fi

echo "✓ ngrok found: $(ngrok --version)"

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "起動コマンド:"
echo "  ./run_public.sh"
echo ""
echo "ブラウザでアクセス:"
echo "  http://localhost:5001/qr  (QRコード表示)"
