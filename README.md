# 🎯 E&R ビンゴアプリ

70人規模のリアルタイムビンゴゲーム。スマートフォンで参加できます。

## 特徴

- 📱 **Web ベース** - iPhone/Android 両対応
- 🧚 **妖精森本** - ゲームを盛り上げるキャラクター
- 🎨 **青×白デザイン** - モダンで見やすい
- ⚡ **リアルタイム** - ngrok で即座に共有可能
- 💾 **データ永続化** - ページ再読み込みしてもビンゴカード保持

## セットアップ

### 必須

- Python 3.7+
- ngrok（[https://ngrok.com](https://ngrok.com)）
- Mac/Linux の場合：`brew install ngrok`

### インストール

```bash
./setup.sh
```

### 起動

```bash
./run_public.sh
```

コマンド実行後、ngrok URL が表示されます。

## 使い方

### 参加者用

1. QR コードをスキャン（または URL を直接入力）
2. 「カードを受け取る」をタップ
3. セルをタップしてマーク
4. 3×3 揃ったらビンゴ！

### 主催者用

- `http://localhost:5001/qr` でプロジェクターに QR コード表示
- 参加者に共有（2時間有効）

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
