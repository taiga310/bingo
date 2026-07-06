# 📦 E&R ビンゴ - ZIP 配布ガイド

このガイドは、`bingo.zip` ファイルを他の人に配布するときの説明書です。

---

## 📥 他の人に渡すもの

### 最小限：

1. **`bingo.zip` ファイル**
   - ダウンロード方法: `/Users/taiga/Claude Code/bingo.zip`
   - ファイルサイズ: 約 33KB

### あわせて説明：

「このアプリは 70人規模のリアルタイムビンゴゲームです。あなたの PC で実行して、参加者に QR コードを共有してください。」

---

## 📋 配布フロー

### ステップ 1: ZIP ファイルを渡す

- メール添付
- Google Drive 共有
- Dropbox リンク
- USB メモリ

どの方法でも OK です

### ステップ 2: 相手が受け取ったら

メッセージで以下を送信：

```
【E&R ビンゴ セットアップガイド】

1. ZIP ファイルを展開
2. ターミナルで以下を実行：
   cd bingo
   ./setup.sh
3. 完了したら：
   ./run_public.sh
4. 表示された URL を参加者に共有

詳細は ZIP 内の "SETUP_OTHER_PC.md" を見てください。
```

---

## ✅ 他の人がやることチェックリスト

### 初回セットアップ（1回だけ）
- [ ] ZIP ファイルを展開
- [ ] `./setup.sh` を実行
- [ ] Python と ngrok がインストールされたか確認

### ビンゴ会当日
- [ ] `./run_public.sh` を実行
- [ ] 出力された URL をコピー
- [ ] QR コード表示ページ（`/qr`）をプロジェクターに映す

### トラブル時
- [ ] ZIP 内の `SETUP_OTHER_PC.md` の「トラブル対処」を確認

---

## 📚 ZIP 内のファイル一覧

| ファイル | 説明 |
|---|---|
| **README.md** | アプリの概要 |
| **SETUP_OTHER_PC.md** | セットアップ手順（重要）|
| **PARTICIPANT.md** | 参加者向けガイド |
| **MAINTAINER.md** | 主催者向けガイド（GitHub版）|
| **setup.sh** | 自動セットアップスクリプト |
| **run_public.sh** | 起動スクリプト |
| **app.py** | Flask アプリケーション |
| **config.py** | 設定ファイル |
| **static/** | CSS / JavaScript |
| **templates/** | HTML テンプレート |
| **data/** | 名前リスト、ゲーム状態 |

---

## 🎯 推奨される配布先

### ✅ 向いている
- 次のイベント幹事
- E&R の別チーム
- 友人のビンゴ会

### ❌ 向かない
- インターネット環境がない PC
- Python がインストールできない PC
- テザリングが使えない PC

---

## 💡 Tips

### 修正・改善したい場合

ZIP から配布する前に、以下を編集できます：

- **参加者向けメッセージ**: `static/js/mascot.js` の `MESSAGES` オブジェクト
- **デザイン色**: `static/css/main.css` の `:root` セクション
- **名前リスト**: `data/names.json` を編集

### 同じ名前を使い回したい場合

1. `data/names.json` を事前に編集
2. ZIP を作成
3. 配布

毎回ビンゴ会で `./setup.sh` は不要（1回で OK）

次のビンゴ会では `./run_public.sh` だけ実行

---

## 🆘 相手がトラブったとき

### よくある質問

**Q: ngrok コマンドが見つからない**  
A: ZIP 内の `SETUP_OTHER_PC.md` の「ngrok をインストール」セクションを実行

**Q: Permission denied エラー**  
A: `chmod +x ./run_public.sh ./setup.sh` を実行

**Q: URL が出ない**  
A: ターミナルをスクロールアップして確認。または `ctrl+C` で停止して再度実行

---

楽しいビンゴ会を！🎉🧚
