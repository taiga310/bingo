# Configuration for Bingo App
import os

CENTER_NAME = "森本"  # 表示時に削除線がつきます
CENTER_MESSAGE = "最初にここを叩いてください！"
ADMIN_PASSWORD = os.getenv('BINGO_ADMIN_PASSWORD', 'bingo2026')
PORT = 5001
