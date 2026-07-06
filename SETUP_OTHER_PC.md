# 💻 E&R ビンゴ - 他の PC でのセットアップガイド

あなたも主催者用 PC として、E&R ビンゴを実行できます。

このガイドに従って、あなたの PC でセットアップしてください。

---

## 前提条件

以下が必要です：

- Mac / Linux / Windows
- Python 3.7 以上
- ngrok（無料）
- インターネット接続

---

## ステップ 1: ngrok をインストール

### Mac の場合

```bash
brew install ngrok
```

### Windows の場合

1. https://ngrok.com/download にアクセス
2. Windows 版をダウンロード
3. ZIP を展開して、`C:\Program Files\ngrok` に保存
4. PATH に追加（環境変数設定）

### Linux の場合

```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok-agent-v3-linux.zip -o ngrok.zip
unzip ngrok.zip -d /usr/local/bin
chmod +x /usr/local/bin/ngrok
```

### ngrok がインストールされたか確認

```bash
ngrok --version
```

バージョン情報が表示されれば OK

---

## ステップ 2: ビンゴアプリをダウンロード

### 方法 A: Git を使う（推奨）

```bash
git clone https://github.com/ユーザー名/bingo.git
cd bingo
```

### 方法 B: ZIP でダウンロード

GitHub ページから「Code」→「Download ZIP」

展開後：

```bash
cd bingo
```

---

## ステップ 3: セットアップスクリプトを実行

```bash
./setup.sh
```

このスクリプトが自動的に以下を行います：

- ✅ Python 仮想環境作成
- ✅ 依存パッケージインストール
- ✅ ngrok チェック

出力例：

```
🎯 E&R Bingo Setup
==================
✓ Python found: Python 3.9.0
✓ Virtual environment ready
✓ Dependencies installed
✓ ngrok found: ngrok version 3.39.0

✅ セットアップ完了！
```

---

## ステップ 4: ビンゴアプリを起動

```bash
./run_public.sh
```

出力例：

```
🎯 E&R Bingo Server
===================
✓ Flask server started (PID: 12345)
📡 Starting ngrok tunnel...

✅ Server is now publicly accessible!

📱 Share this URL with your phone/other devices:

   https://xxxxxxx-xxxxxxx.ngrok-free.dev

Direct links:
   Landing:  https://xxxxxxx-xxxxxxx.ngrok-free.dev/
   Card:     https://xxxxxxx-xxxxxxx.ngrok-free.dev/card?seed=test-123

⏸️  Press CTRL+C to stop the server
```

**この URL を参加者に共有してください！**

---

## ステップ 5: QR コードを表示

ブラウザで以下にアクセス：

```
https://xxxxxxx-xxxxxxx.ngrok-free.dev/qr
```

プロジェクターに映して、参加者に QR コードをスキャンさせます

---

## ビンゴ会当日の流れ

1. ✅ PC を起動
2. ✅ テザリングを ON（社用携帯など）
3. ✅ `./run_public.sh` を実行
4. ✅ QR コードをプロジェクターに映す
5. ✅ 参加者に QR コードをスキャンさせる
6. ✅ ビンゴ開始！

ビンゴ終了後：
- ターミナルで `Ctrl+C` を押して停止

---

## トラブル対処

### 「Permission denied」エラー

```bash
chmod +x ./run_public.sh
chmod +x ./setup.sh
```

### 「command not found: ngrok」

ngrok がインストールされていません。

ステップ 1 を見直してください。

### 「Port 5001 in use」

別のプロセスが使用中です：

```bash
# Mac / Linux の場合
lsof -i :5001

# プロセス ID を確認して停止
kill <PID>
```

### 「git command not found」

Git をインストール：

- Mac: `brew install git`
- Windows: https://git-scm.com/download/win
- Linux: `apt install git`

---

## 次回以降

セットアップは 1 回で OK。

次のビンゴ会の時は：

```bash
cd bingo
./run_public.sh
```

これだけです！

---

## 質問がある場合

主催者に連絡してください：

- セットアップがうまくいかない
- ビンゴ会当日にトラブルが起きた
- 機能をカスタマイズしたい

---

楽しいビンゴ会を！🎉🧚
