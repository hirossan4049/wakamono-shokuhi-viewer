# 若者食費ビューアー (Wakamono Shokuhi Viewer)

## 概要
商品データをJSONファイルから読み込み、一覧表示・検索・フィルタリング・ソートができるReactアプリケーションです。GitHub Pagesで公開されており、Mantine UIを使用した美しいUIデザインが特徴です。

## 機能

### 📂 ファイルアップロード
- JSONファイルのドラッグ&ドロップアップロード
- ファイル形式の自動検証
- エラーハンドリング

### 🔍 検索・フィルタリング
- 商品名、ID、詳細での部分一致検索
- カテゴリ別フィルタリング
- 価格範囲でのフィルタリング

### 📊 ソート機能
- 名前（昇順・降順）
- 価格（安い順・高い順）
- カテゴリ（昇順・降順）

### 📱 レスポンシブデザイン
- デスクトップ、タブレット、スマートフォン対応
- グリッドレイアウトの自動調整

## 使用技術

- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Mantine UI 8** - コンポーネントライブラリ
- **GitHub Pages** - ホスティング
- **GitHub Actions** - CI/CD

## JSONデータ形式

```json
{
  "products": [
    {
      "name": "商品名",
      "id": "商品ID",
      "category": "カテゴリ名",
      "thumb": "サムネイル画像",
      "images": ["画像1", "画像2"],
      "detail": "商品詳細",
      "detail_url": "詳細URL",
      "totals": 価格総額,
      "items": [
        {
          "name": "アイテム名",
          "price": 単価,
          "amount": 数量,
          "url": "アイテムURL"
        }
      ]
    }
  ]
}
```

## 開発環境のセットアップ

### 必要なソフトウェア
- Node.js 18以上
- npm

### インストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm start
```
http://localhost:3000 でアプリケーションが起動します。

### ビルド
```bash
npm run build
```

### テスト
```bash
npm test
```

## GitHub Pagesへのデプロイ

### 自動デプロイ
- `main` ブランチへのプッシュで自動的にGitHub Pagesにデプロイされます
- GitHub Actionsワークフローが自動実行されます

### 手動デプロイ
```bash
npm run deploy
```

## サンプルデータ

`/public/sample-data.json` にサンプルデータが含まれています。アプリケーションの動作確認にご利用ください。

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の作成を歓迎します。

## デモ

🚀 **ライブデモ**: https://hirossan4049.github.io/wakamono-shokuhi-viewer

## スクリーンショット

### メイン画面（ファイルアップロード）
![メイン画面](./docs/main-screen.png)

### 商品一覧表示
![商品一覧](./docs/product-list.png)

### フィルタ・ソート機能
![フィルタ機能](./docs/filters.png)