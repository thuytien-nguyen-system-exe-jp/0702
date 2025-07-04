# VietFood Market - ベトナム料理専門ECサイト

本格ベトナム料理の食材・調味料・冷凍食品を豊富に取り揃えたECサイトです。

## 🌟 特徴

- **本格的なベトナム料理食材**: 新鮮な野菜、果物、調味料、冷凍食品
- **美しいデザイン**: ベトナム国旗カラーを基調とした現代的なUI
- **レスポンシブ対応**: モバイル・タブレット・デスクトップに対応
- **静的サイト**: GitHub Pagesでホスティング可能

## 🚀 デモサイト

[https://yourusername.github.io/vietnamese-ecommerce](https://yourusername.github.io/vietnamese-ecommerce)

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + カスタムCSS
- **データベース**: Prisma + SQLite (開発用)
- **デプロイ**: GitHub Pages + GitHub Actions

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/vietnamese-ecommerce.git
cd vietnamese-ecommerce

# 依存関係をインストール
npm install

# データベースを初期化
npx prisma generate
npx prisma db push
npx prisma db seed

# 開発サーバーを起動
npm run dev
```

## 🌐 GitHub Pagesへのデプロイ

### 1. GitHubリポジトリの設定

1. GitHubでリポジトリを作成
2. Settings > Pages > Source を "GitHub Actions" に設定

### 2. 自動デプロイ

mainブランチにプッシュすると、GitHub Actionsが自動的にビルド・デプロイを実行します。

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. カスタムドメイン（オプション）

`next.config.js`の`basePath`と`assetPrefix`を調整してください：

```javascript
// カスタムドメインの場合
basePath: '',
assetPrefix: '',

// GitHub Pagesサブパスの場合
basePath: '/vietnamese-ecommerce',
assetPrefix: '/vietnamese-ecommerce/',
```

## 📁 プロジェクト構造

```
vietnamese-ecommerce/
├── .github/workflows/    # GitHub Actions設定
├── public/              # 静的ファイル
│   └── images/         # 商品画像
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # Reactコンポーネント
│   ├── contexts/       # React Context
│   ├── data/          # モックデータ
│   ├── hooks/         # カスタムフック
│   ├── lib/           # ユーティリティ
│   └── types/         # TypeScript型定義
├── prisma/            # データベーススキーマ
└── next.config.js     # Next.js設定
```

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: #da020e (ベトナム赤)
- **セカンダリ**: #ffcd00 (ベトナム黄)
- **背景**: グラデーション効果

### アニメーション
- フェードイン効果
- ホバーエフェクト
- シマーアニメーション
- 3D変形効果

## 🛒 機能

### 実装済み
- [x] 商品一覧・詳細表示
- [x] カテゴリ・ブランドフィルター
- [x] 価格・辛さレベルフィルター
- [x] ショッピングカート（ローカルストレージ）
- [x] レスポンシブデザイン
- [x] 静的サイト生成

### 今後の予定
- [ ] ユーザー認証
- [ ] 注文処理
- [ ] 決済システム
- [ ] 管理者機能
- [ ] レビューシステム

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、[Issues](https://github.com/yourusername/vietnamese-ecommerce/issues)を作成してください。

---

Made with ❤️ for Vietnamese food lovers