# GitHub Pagesデプロイ手順

## 🚀 自動デプロイの設定

### 1. GitHubリポジトリの作成

```bash
# GitHubで新しいリポジトリを作成後
git init
git add .
git commit -m "Initial commit: Vietnamese ecommerce site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vietnamese-ecommerce.git
git push -u origin main
```

### 2. GitHub Pages設定

1. GitHubリポジトリページで **Settings** タブをクリック
2. 左サイドバーの **Pages** をクリック
3. **Source** を **GitHub Actions** に設定
4. 保存

### 3. 自動デプロイの確認

- `main`ブランチにプッシュすると自動的にデプロイが開始されます
- **Actions** タブでビルド状況を確認できます
- デプロイ完了後、`https://YOUR_USERNAME.github.io/vietnamese-ecommerce` でアクセス可能

## 🔧 設定のカスタマイズ

### カスタムドメインを使用する場合

`next.config.js`を編集：

```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // カスタムドメインの場合は空文字列
  basePath: '',
  assetPrefix: '',
}
```

### サブディレクトリ名を変更する場合

リポジトリ名を変更するか、`next.config.js`の`basePath`と`assetPrefix`を更新：

```javascript
basePath: '/your-custom-path',
assetPrefix: '/your-custom-path/',
```

## 🛠️ ローカルでの静的ビルドテスト

```bash
# 静的ビルドを実行
npm run build

# outディレクトリが生成されることを確認
ls out/

# ローカルサーバーで確認（オプション）
npx serve out
```

## 📝 デプロイ時の注意事項

### 1. 環境変数
- 静的サイトでは環境変数は使用できません
- 必要な設定は`next.config.js`やコード内に直接記述

### 2. API Routes
- 静的エクスポートではAPI Routesは使用できません
- 現在はモックデータを使用

### 3. 画像最適化
- `images.unoptimized: true`を設定済み
- Next.js Image Optimizationは無効化

### 4. 動的ルーティング
- 静的サイトでは動的ルーティングに制限があります
- 必要に応じて`generateStaticParams`を使用

## 🔄 継続的デプロイ

### ワークフローファイル
`.github/workflows/deploy.yml`が自動デプロイを処理します：

- **トリガー**: `main`ブランチへのプッシュ
- **ビルド**: Node.js 18でビルド実行
- **デプロイ**: `out`ディレクトリをGitHub Pagesに公開

### デプロイ状況の確認

1. **Actions**タブでワークフローの実行状況を確認
2. **Settings > Pages**でデプロイされたURLを確認
3. エラーがある場合はActionsのログを確認

## 🐛 トラブルシューティング

### よくある問題

1. **404エラー**: `basePath`の設定を確認
2. **CSS/JSが読み込まれない**: `assetPrefix`の設定を確認
3. **画像が表示されない**: 画像パスとファイルの存在を確認
4. **ビルドエラー**: TypeScriptエラーやlintエラーを修正

### デバッグ方法

```bash
# ローカルでビルドエラーを確認
npm run build

# TypeScriptエラーを確認
npm run type-check

# Lintエラーを確認
npm run lint
```

## 📊 パフォーマンス最適化

### 実装済み最適化
- 静的サイト生成（SSG）
- 画像の最適化設定
- CSS/JSの最小化
- Gzip圧縮（GitHub Pages自動）

### 追加最適化案
- Service Worker実装
- PWA対応
- 画像のWebP変換
- CDN使用

---

🎉 デプロイが完了したら、美しいベトナム料理ECサイトをお楽しみください！