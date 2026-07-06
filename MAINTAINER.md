# 🎯 E&R ビンゴ - 主催者向けセットアップガイド

## GitHub にアップロードする手順（最初の 1 回だけ）

### ステップ 1: GitHub アカウント確認

- GitHub アカウントがない場合は作成: https://github.com/signup
- ログイン済みか確認

### ステップ 2: 新しいリポジトリを作成

1. GitHub にログイン
2. 右上の「+」アイコン → 「New repository」をクリック
3. リポジトリ名: `bingo` または `er-bingo`
4. 説明: `E&R Bingo App - 70人規模のリアルタイムビンゴゲーム`
5. 「Public」を選択（他の人がアクセスできるようにするため）
6. 「Create repository」をクリック

### ステップ 3: GitHub にアップロード

以下のコマンドを **順番に** 実行：

```bash
cd "/Users/taiga/Claude Code/bingo"
```

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit: E&R Bingo App - Web-based bingo game for 70 people"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/あなたのGitHubユーザー名/bingo.git
```

```bash
git push -u origin main
```

**注意**: `あなたのGitHubユーザー名` を実際のユーザー名に置き換えてください

### ステップ 4: GitHub で確認

ブラウザで `https://github.com/あなたのGitHubユーザー名/bingo` にアクセス

すべてのファイルが表示されれば成功！

---

## ビンゴ会当日の流れ

### 朝（ビンゴ会の 30分前）

```bash
cd "/Users/taiga/Claude Code/bingo"
./run_public.sh
```

出力例：
```
✅ Server is now publicly accessible!

📱 Share this URL with your phone/other devices:

   https://uplifted-viewer-headfirst.ngrok-free.dev

Direct links:
   Landing:  https://uplifted-viewer-headfirst.ngrok-free.dev/
   Card:     https://uplifted-viewer-headfirst.ngrok-free.dev/card?seed=test-123
```

新しい URL が表示される → これを参加者に共有

### ビンゴ会中

- PC は起動したまま
- テザリングは ON のまま
- 参加者のスマートフォンで QR コードをスキャン

### 終了後

```bash
# ターミナルで Ctrl+C を押す
# または

pkill -f ngrok
```

---

## トラブル対処（主催者向け）

### 「git command not found」エラー

Mac の場合：
```bash
xcode-select --install
```

### 「Permission denied」エラー

以下を実行：
```bash
chmod +x /Users/taiga/Claude\ Code/bingo/run_public.sh
chmod +x /Users/taiga/Claude\ Code/bingo/setup.sh
```

### ngrok が起動しない

```bash
# ngrok がインストールされているか確認
which ngrok

# インストールされていない場合
brew install ngrok
```

### ポート 5001 が使用中

```bash
lsof -i :5001
# PID が表示される → kill <PID>
```

---

## ビンゴ会後のビジネスロジック変更

### 名前リストを変更する場合

`data/names.json` を編集して Git に反映：

```bash
cd "/Users/taiga/Claude Code/bingo"

# ファイルを編集
# data/names.json を開いて名前を変更

# 変更をコミット
git add data/names.json
git commit -m "Update name list for next event"
git push
```

### デザインをカスタマイズする場合

色を変更: `static/css/main.css` の `:root` セクション

メッセージを変更: `static/js/mascot.js` の `this.MESSAGES`

変更後：
```bash
git add static/css/main.css static/js/mascot.js
git commit -m "Update design and messages"
git push
```

---

## 次のビンゴ会の準備

当日朝、参加者に以下を共有するだけ：

```bash
./run_public.sh
```

実行すると新しい ngrok URL が生成される → QR コードをプロジェクターに映す

簡単！
