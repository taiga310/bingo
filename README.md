# 🎯 E&R ビンゴアプリ

70人規模のリアルタイムビンゴゲーム。スマートフォンで参加できます。

## 特徴

- 📱 **Web ベース** - iPhone/Android 両対応
- 🧚 **妖精森本** - ゲームを盛り上げるキャラクター
- 🎨 **青×白デザイン** - モダンで見やすい
- ⚡ **リアルタイム** - ngrok で即座に共有可能
- 💾 **データ永続化** - ページ再読み込みしてもビンゴカード保持

---

# 🚀 セットアップガイド（他の人向け）

## 前置き

あなたが主催者として、自分の PC でビンゴアプリを実行します。  
参加者はスマートフォンで QR コードをスキャンして参加できます。

---

## 📋 ステップ 1: このリポジトリをダウンロード

### 方法 A: ZIP ファイル（推奨・簡単）

1. このページの右側の緑の「Code」ボタンをクリック
2. 「Download ZIP」をクリック
3. ファイルが自動ダウンロードされる（`bingo-main.zip`）
4. 右下に「ダウンロード完了」が表示される
5. ZIP を展開（ダブルクリック）

### 方法 B: ターミナルで Git クローン

```bash
git clone https://github.com/taiga310/bingo.git
cd bingo
```

---

## 💻 ステップ 2: セットアップスクリプトを実行

### 全環境共通（推奨）

**ターミナル / コマンドプロンプトを開いて：**

```bash
cd bingo
python setup.py
```

または

```bash
python3 setup.py
```

**成功時の出力：**
```
🎯 E&R Bingo Setup
==================
✓ Python 3.9.0
✓ Virtual environment ready
✓ Dependencies installed
✓ ngrok version 3.39.0

✅ セットアップ完了

次のステップ:
  python run_public.py
```

---

### Mac / Linux（代替方法）

Bash スクリプトを使う場合：

```bash
cd bingo
./setup.sh
```

### Windows（代替方法）

PowerShell を管理者として実行：

```powershell
cd bingo
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🔐 ステップ 3: 管理者パスワード設定（重要）

**本番イベント前に、パスワードを変更してください。**

ターミナルで以下を実行：

```bash
export BINGO_ADMIN_PASSWORD="あなたの秘密のパスワード"
```

Windows の場合：

```cmd
set BINGO_ADMIN_PASSWORD=あなたの秘密のパスワード
```

**注意：デフォルトは `bingo2026` ですが、ngrok URL が流出するとログインされるリスクがあります。**

---

## 🎮 ステップ 4: アプリを起動

**ターミナル / コマンドプロンプトで以下を実行：**

```bash
python run_public.py
```

または

```bash
python3 run_public.py
```

**実行後、以下のような画面が表示されます：**

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

**重要：この URL をコピーします（参加者に共有）**

---

## 📱 ステップ 4: QR コードを表示

ブラウザ（Chrome や Safari）を開いて、以下にアクセス：

```
https://xxxxxxx-xxxxxxx.ngrok-free.dev/qr
```

（上の URL の `xxxxxxx-xxxxxxx` の部分を ステップ 3 の URL に置き換える）

**QR コード画面が表示される** → プロジェクターに映す

---

## 👥 ステップ 5: 参加者に QR コードをスキャンさせる

参加者のスマートフォンで：

1. カメラアプリを起動
2. QR コードを読み込む
3. 自動でブラウザが開く
4. 「カードを受け取る」をタップ
5. ビンゴ！

---

## ⏹️ 終了方法

ビンゴ会が終わったら：

**ターミナルで `Ctrl+C` を押す**

```
^C
Shutting down ngrok...
✅ Server stopped
```

---

# 📚 詳しいドキュメント

| ファイル | 説明 |
|---|---|
| **SETUP_OTHER_PC.md** | 次のイベント用に別 PC でセットアップする方法 |
| **PARTICIPANT.md** | 参加者向けガイド（スマートフォンでの操作） |
| **MAINTAINER.md** | GitHub での管理方法 |

---

## 必須

- Python 3.7+
- ngrok（[https://ngrok.com](https://ngrok.com)）
- Mac/Linux の場合：`brew install ngrok`

## URL 一覧

| 用途 | URL |
|---|---|
| ランディングページ | `/` |
| ビンゴカード | `/card?seed=<uuid>` |
| QR コード表示 | `/qr` |
| API: 名前リスト | `/api/names` |
| API: ゲーム状態 | `/api/state` |
| API: QR コード | `/api/qr-code` |

## カスタマイズ

### 名前リストを変更

`data/names.json` を編集：

```json
{
  "names": ["太郎", "花子", "次郎", ...],
  "center": "森本",
  "center_message": "最初にここを叩いてください！"
}
```

### デザインを変更

`static/css/main.css` 内の `:root` 色を編集

```css
:root {
  --primary-blue: #2563eb;
  --accent-blue: #60a5fa;
  --text-white: #ffffff;
}
```

## トラブル対処

| 問題 | 解決策 |
|---|---|
| ngrok が見つからない | `brew install ngrok` でインストール |
| ポート 5001 が使用中 | `lsof -i :5001` で確認、別プロセス終了 |
| QR コード表示されない | ブラウザをシークレット/プライベートモードで再度開く |

## ライセンス

MIT

## 作成者

E&R チーム
