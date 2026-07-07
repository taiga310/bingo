#!/usr/bin/env python3
"""
E&R Bingo App - Cross-platform Setup Script
Supports: Mac, Linux, Windows
"""

import subprocess
import sys
import os
import platform

# OS の判定
IS_WINDOWS = platform.system() == "Windows"
IS_MAC = platform.system() == "Darwin"
IS_LINUX = platform.system() == "Linux"

def print_header(text):
    """ヘッダーを表示"""
    print("\n🎯 " + text)
    print("=" * 50)

def run_command(cmd, description=""):
    """コマンドを実行"""
    if description:
        print(f"\n📦 {description}...")

    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"❌ エラー: {e.stderr}")
        return False

def check_python():
    """Python が存在するか確認"""
    print_header("Python 確認")

    if IS_WINDOWS:
        cmd = "python --version"
    else:
        cmd = "python3 --version"

    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✓ {version}")
            return True
    except Exception:
        pass

    print("❌ Python が見つかりません")
    print("\nインストール方法:")
    if IS_WINDOWS:
        print("  1. https://www.python.org/downloads/ にアクセス")
        print("  2. Windows 版をダウンロード")
        print("  3. インストーラーを実行（『Add Python to PATH』にチェック）")
    elif IS_MAC:
        print("  brew install python3")
    else:
        print("  apt install python3 python3-venv")
    print()
    return False

def create_venv():
    """venv を作成"""
    print_header("Virtual Environment 作成")

    if os.path.exists("venv"):
        print("✓ venv は既に存在します")
        return True

    print("📦 Creating virtual environment...")

    if IS_WINDOWS:
        cmd = "python -m venv venv"
    else:
        cmd = "python3 -m venv venv"

    if not run_command(cmd):
        print("❌ venv 作成に失敗しました\n")
        return False

    print("✓ Virtual environment ready")
    return True

def install_dependencies():
    """依存パッケージをインストール"""
    print_header("依存パッケージをインストール")

    if IS_WINDOWS:
        python_exe = os.path.join("venv", "Scripts", "python.exe")
        pip_exe = os.path.join("venv", "Scripts", "pip.exe")
    else:
        python_exe = os.path.join("venv", "bin", "python")
        pip_exe = os.path.join("venv", "bin", "pip")

    # requirements.txt からインストール
    cmd = f"{pip_exe} install -r requirements.txt"
    if not run_command(cmd, "requirements.txt をインストール"):
        print("❌ 依存パッケージのインストールに失敗しました\n")
        return False

    print("✓ Dependencies installed")
    return True

def check_ngrok():
    """ngrok が存在するか確認"""
    print_header("ngrok 確認")

    try:
        result = subprocess.run("ngrok --version", shell=True, capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✓ {version}")
            return True
    except Exception:
        pass

    print("⚠️  ngrok が見つかりません")
    print("\nインストール方法:")
    if IS_WINDOWS:
        print("  1. https://ngrok.com/download からダウンロード")
        print("  2. ZIP を展開")
        print("  3. ngrok.exe を C:\\Program Files\\ に保存")
        print("  4. PATH に追加（環境変数設定）")
    elif IS_MAC:
        print("  brew install ngrok")
    else:
        print("  apt install ngrok")

    print("\n⚠️  ngrok がないと run_public.py は起動できません")
    print()
    return False

def main():
    """メイン処理"""
    print_header("E&R Bingo Setup")
    print(f"Platform: {platform.system()}\n")

    # Python 確認
    if not check_python():
        sys.exit(1)

    # venv 作成
    if not create_venv():
        sys.exit(1)

    # 依存パッケージインストール
    if not install_dependencies():
        sys.exit(1)

    # ngrok 確認
    has_ngrok = check_ngrok()

    # 完了メッセージ
    print_header("✅ セットアップ完了")
    print("\n次のステップ:")
    print("  python run_public.py")
    print("\nまたは:")
    print("  python3 run_public.py")
    print()

    if not has_ngrok:
        print("⚠️  ngrok をインストールしてから実行してください\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
