# ベトナム料理専門ECサイト 包括的設計書

## 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ設計](#2-システムアーキテクチャ設計)
3. [データベース設計](#3-データベース設計)
4. [ユーザー画面設計](#4-ユーザー画面設計)
5. [管理者画面設計](#5-管理者画面設計)
6. [API設計](#6-api設計)
7. [セキュリティ設計](#7-セキュリティ設計)
8. [パフォーマンス最適化](#8-パフォーマンス最適化)
9. [多言語対応](#9-多言語対応)
10. [デプロイメント戦略](#10-デプロイメント戦略)

---

## 1. プロジェクト概要

### 1.1 基本情報
- **サイト名**: VietFood Market
- **目的**: ベトナム料理の食材・調味料・冷凍食品を日本全国に販売するECサイト
- **ターゲット**: 日本在住のベトナム人、ベトナム料理愛好家、アジア料理愛好家
- **想定規模**: 月間50万PV、月間10,000〜50,000オーダー

### 1.2 技術スタック
```mermaid
graph TB
    subgraph "Frontend"
        A[Next.js 14 App Router]
        B[TypeScript]
        C[Tailwind CSS]
        D[React Hook Form]
        E[Zustand State Management]
    end
    
    subgraph "Backend"
        F[Next.js API Routes]
        G[Prisma ORM]
        H[PostgreSQL]
        I[Redis Cache]
    end
    
    subgraph "External Services"
        J[Stripe Payment]
        K[AWS S3 Storage]
        L[SendGrid Email]
        M[Google Analytics]
        N[Sentry Monitoring]
    end
    
    A --> F
    F --> G
    G --> H
    F --> I
    F --> J
    F --> K
    F --> L
    A --> M
    A --> N
```

---

## 2. システムアーキテクチャ設計

### 2.1 全体アーキテクチャ
```mermaid
graph TB
    subgraph "User Interface Layer"
        A1[ユーザー画面<br/>Next.js App]
        A2[管理者画面<br/>Next.js Admin App]
    end
    
    subgraph "API Gateway Layer"
        B1[Public API<br/>/api/public/*]
        B2[Protected API<br/>/api/protected/*]
        B3[Admin API<br/>/api/admin/*]
    end
    
    subgraph "Business Logic Layer"
        C1[Product Service]
        C2[User Service]
        C3[Order Service]
        C4[Cart Service]
        C5[Admin Service]
    end
    
    subgraph "Data Access Layer"
        D1[Prisma ORM]
        D2[Redis Cache]
        D3[File Storage]
    end
    
    subgraph "Database Layer"
        E1[PostgreSQL<br/>Primary DB]
        E2[AWS S3<br/>File Storage]
    end
    
    A1 --> B1
    A1 --> B2
    A2 --> B3
    B1 --> C1
    B1 --> C2
    B2 --> C3
    B2 --> C4
    B3 --> C5
    C1 --> D1
    C2 --> D1
    C3 --> D1
    C4 --> D2
    C5 --> D1
    D1 --> E1
    D3 --> E2
```

### 2.2 ディレクトリ構造
```
vietnamese-ecommerce/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (user)/            # ユーザー画面グループ
│   │   │   ├── page.tsx       # ホームページ
│   │   │   ├── products/      # 商品関連ページ
│   │   │   ├── cart/          # カート
│   │   │   ├── checkout/      # チェックアウト
│   │   │   ├── account/       # アカウント管理
│   │   │   └── orders/        # 注文履歴
│   │   ├── admin/             # 管理者画面グループ
│   │   │   ├── page.tsx       # 管理者ダッシュボード
│   │   │   ├── products/      # 商品管理
│   │   │   ├── orders/        # 注文管理
│   │   │   ├── users/         # ユーザー管理
│   │   │   ├── analytics/     # 分析
│   │   │   └── settings/      # システム設定
│   │   ├── api/               # API Routes
│   │   │   ├── public/        # 公開API
│   │   │   ├── protected/     # 認証必須API
│   │   │   └── admin/         # 管理者API
│   │   ├── auth/              # 認証関連
│   │   └── globals.css
│   ├── components/
│   │   ├── user/              # ユーザー画面コンポーネント
│   │   ├── admin/             # 管理者画面コンポーネント
│   │   └── shared/            # 共通コンポーネント
│   ├── lib/                   # ユーティリティ
│   ├── hooks/                 # カスタムフック
│   ├── stores/                # 状態管理
│   ├── types/                 # TypeScript型定義
│   └── styles/                # スタイル
├── prisma/                    # データベーススキーマ
├── public/                    # 静的ファイル
└── docs/                      # ドキュメント
```

---

## 3. データベース設計

### 3.1 ERD（Entity Relationship Diagram）
```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ CartItem : has
    User ||--o{ Review : writes
    User ||--o{ Address : has
    User ||--o{ Wishlist : has
    
    Product ||--o{ CartItem : contains
    Product ||--o{ OrderItem : contains
    Product ||--o{ Review : receives
    Product ||--o{ ProductImage : has
    Product ||--o{ ProductVariant : has
    Product ||--o{ Wishlist : contains
    Product }|--|| Category : belongs_to
    Product }|--|| Brand : belongs_to
    
    Order ||--o{ OrderItem : contains
    Order }|--|| Address : ships_to
    Order }|--|| PaymentMethod : paid_with
    Order ||--o{ OrderStatusHistory : has
    
    Category ||--o{ Category : parent_child
    
    Admin ||--o{ AdminLog : creates
    
    User {
        string id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        string preferred_language
        datetime created_at
        datetime updated_at
        datetime last_login_at
        boolean is_active
        boolean email_verified
        string avatar_url
    }
    
    Admin {
        string id PK
        string email UK
        string password_hash
        string name
        string role
        json permissions
        datetime created_at
        datetime updated_at
        datetime last_login_at
        boolean is_active
        string created_by_id FK
    }
    
    Product {
        string id PK
        string sku UK
        string name_ja
        string name_vi
        text description_ja
        text description_vi
        decimal price
        decimal cost_price
        integer stock_quantity
        integer reserved_quantity
        string category_id FK
        string brand_id FK
        integer spice_level
        json allergen_info
        text cooking_instructions_ja
        text cooking_instructions_vi
        string storage_type
        integer shelf_life_days
        decimal weight
        json dimensions
        boolean is_active
        boolean is_featured
        integer sort_order
        json seo_meta
        datetime created_at
        datetime updated_at
        string created_by_id FK
        string updated_by_id FK
    }
    
    Category {
        string id PK
        string name_ja
        string name_vi
        string slug UK
        text description_ja
        text description_vi
        string parent_id FK
        string image_url
        integer sort_order
        boolean is_active
        json seo_meta
        datetime created_at
        datetime updated_at
    }
    
    Brand {
        string id PK
        string name
        string slug UK
        text description_ja
        text description_vi
        string logo_url
        string country_origin
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    Order {
        string id PK
        string order_number UK
        string user_id FK
        decimal subtotal
        decimal shipping_cost
        decimal tax_amount
        decimal discount_amount
        decimal total_amount
        string currency
        string status
        string payment_status
        string shipping_status
        string shipping_address_id FK
        string billing_address_id FK
        string payment_method_id FK
        string shipping_method
        string tracking_number
        text notes
        json metadata
        datetime created_at
        datetime updated_at
        datetime shipped_at
        datetime delivered_at
        datetime cancelled_at
    }
    
    OrderItem {
        string id PK
        string order_id FK
        string product_id FK
        string product_variant_id FK
        integer quantity
        decimal unit_price
        decimal total_price
        json product_snapshot
        datetime created_at
    }
    
    CartItem {
        string id PK
        string user_id FK
        string product_id FK
        string product_variant_id FK
        integer quantity
        datetime created_at
        datetime updated_at
    }
    
    Address {
        string id PK
        string user_id FK
        string type
        string first_name
        string last_name
        string company
        string postal_code
        string prefecture
        string city
        string address_line1
        string address_line2
        string phone
        boolean is_default
        datetime created_at
        datetime updated_at
    }
    
    Review {
        string id PK
        string user_id FK
        string product_id FK
        string order_id FK
        integer rating
        string title
        text comment
        json images
        boolean is_verified_purchase
        boolean is_approved
        datetime created_at
        datetime updated_at
    }
    
    AdminLog {
        string id PK
        string admin_id FK
        string action
        string resource_type
        string resource_id
        json old_data
        json new_data
        string ip_address
        string user_agent
        datetime created_at
    }
```

### 3.2 主要テーブル詳細

#### 3.2.1 商品テーブル（Products）
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name_ja VARCHAR(255) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    description_ja TEXT,
    description_vi TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
    allergen_info JSONB,
    cooking_instructions_ja TEXT,
    cooking_instructions_vi TEXT,
    storage_type VARCHAR(20) CHECK (storage_type IN ('frozen', 'refrigerated', 'ambient')),
    shelf_life_days INTEGER,
    weight DECIMAL(8,3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    seo_meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_id UUID REFERENCES admins(id),
    updated_by_id UUID REFERENCES admins(id)
);

-- インデックス
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_products_search_ja ON products USING gin(to_tsvector('japanese', name_ja || ' ' || COALESCE(description_ja, '')));
CREATE INDEX idx_products_search_vi ON products USING gin(to_tsvector('simple', name_vi || ' ' || COALESCE(description_vi, '')));
```

#### 3.2.2 注文テーブル（Orders）
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'JPY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    shipping_status VARCHAR(20) DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'preparing', 'shipped', 'delivered')),
    shipping_address_id UUID REFERENCES addresses(id),
    billing_address_id UUID REFERENCES addresses(id),
    payment_method_id UUID,
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

---

## 4. ユーザー画面設計

### 4.1 画面構成
```mermaid
graph TD
    A[ホームページ] --> B[商品一覧]
    A --> C[商品検索]
    A --> D[カテゴリ一覧]
    
    B --> E[商品詳細]
    C --> E
    D --> B
    
    E --> F[カートに追加]
    F --> G[ショッピングカート]
    
    G --> H[チェックアウト]
    H --> I[配送先入力]
    I --> J[決済方法選択]
    J --> K[注文確認]
    K --> L[注文完了]
    
    A --> M[ログイン/会員登録]
    M --> N[マイページ]
    N --> O[注文履歴]
    N --> P[プロフィール設定]
    N --> Q[配送先管理]
    N --> R[お気に入り]
```

### 4.2 主要画面詳細設計

#### 4.2.1 ホームページ
```typescript
// src/app/(user)/page.tsx
interface HomePageProps {
  featuredProducts: Product[];
  categories: Category[];
  banners: Banner[];
  recentlyViewed?: Product[];
}

const HomePage = ({ featuredProducts, categories, banners }: HomePageProps) => {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <HeroSection banners={banners} />
      
      {/* カテゴリ一覧 */}
      <CategoryGrid categories={categories} />
      
      {/* 特集商品 */}
      <FeaturedProducts products={featuredProducts} />
      
      {/* 新着商品 */}
      <NewArrivals />
      
      {/* おすすめ商品 */}
      <RecommendedProducts />
      
      {/* ベトナム料理レシピ */}
      <RecipeSection />
    </div>
  );
};
```

**レイアウト構成**:
- ヘッダー（ナビゲーション、検索バー、カート、言語切替）
- メインコンテンツエリア
- フッター（会社情報、リンク、SNS）

#### 4.2.2 商品一覧ページ
```typescript
// src/app/(user)/products/page.tsx
interface ProductListPageProps {
  products: Product[];
  categories: Category[];
  filters: FilterOptions;
  pagination: PaginationInfo;
}

const ProductListPage = ({ products, categories, filters, pagination }: ProductListPageProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* サイドバー（フィルター） */}
        <aside className="lg:w-1/4">
          <ProductFilters 
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>
        
        {/* メインコンテンツ */}
        <main className="lg:w-3/4">
          {/* ソート・表示切替 */}
          <ProductListHeader 
            totalCount={pagination.totalCount}
            sortOptions={sortOptions}
            viewMode={viewMode}
            onSortChange={handleSortChange}
            onViewModeChange={setViewMode}
          />
          
          {/* 商品グリッド */}
          <ProductGrid 
            products={products}
            viewMode={viewMode}
          />
          
          {/* ページネーション */}
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
};
```

**フィルター機能**:
- カテゴリ
- 価格帯
- 辛さレベル
- アレルギー情報
- 配送方法
- ブランド
- 在庫状況

#### 4.2.3 商品詳細ページ
```typescript
// src/app/(user)/products/[id]/page.tsx
interface ProductDetailPageProps {
  product: ProductWithDetails;
  relatedProducts: Product[];
  reviews: Review[];
}

const ProductDetailPage = ({ product, relatedProducts, reviews }: ProductDetailPageProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 商品画像 */}
        <div>
          <ProductImageGallery images={product.images} />
        </div>
        
        {/* 商品情報 */}
        <div>
          <ProductInfo product={product} />
          <ProductVariants variants={product.variants} />
          <AddToCartSection product={product} />
          <ProductTabs 
            description={product.description}
            cookingInstructions={product.cookingInstructions}
            nutritionalInfo={product.nutritionalInfo}
            shippingInfo={product.shippingInfo}
          />
        </div>
      </div>
      
      {/* レビュー */}
      <ProductReviews reviews={reviews} />
      
      {/* 関連商品 */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
};
```

#### 4.2.4 ショッピングカート
```typescript
// src/app/(user)/cart/page.tsx
const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { total, subtotal, shipping, tax } = useCartCalculation(items);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ショッピングカート</h1>
      
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* カート商品一覧 */}
          <div className="lg:col-span-2">
            <CartItemList 
              items={items}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          </div>
          
          {/* 注文サマリー */}
          <div className="lg:col-span-1">
            <CartSummary 
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
            <CheckoutButton disabled={items.length === 0} />
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 4.2.5 チェックアウトフロー
```mermaid
flowchart TD
    A[カート確認] --> B[ログイン確認]
    B --> C{ログイン済み？}
    C -->|Yes| D[配送先選択]
    C -->|No| E[ログイン/会員登録]
    E --> D
    D --> F[配送方法選択]
    F --> G[決済方法選択]
    G --> H[注文内容確認]
    H --> I[決済処理]
    I --> J{決済成功？}
    J -->|Yes| K[注文完了]
    J -->|No| L[エラー表示]
    L --> G
```

### 4.3 レスポンシブデザイン

#### 4.3.1 ブレークポイント設定
```css
/* tailwind.config.js */
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

#### 4.3.2 モバイル最適化
- タッチフレンドリーなボタンサイズ（最小44px）
- スワイプジェスチャー対応
- モバイル専用ナビゲーション
- 画像の遅延読み込み
- オフライン対応（PWA）

---

## 5. 管理者画面設計

### 5.1 管理者画面構成
```mermaid
graph TD
    A[管理者ログイン] --> B[ダッシュボード]
    
    B --> C[商品管理]
    B --> D[注文管理]
    B --> E[ユーザー管理]
    B --> F[在庫管理]
    B --> G[売上分析]
    B --> H[システム設定]
    B --> I[管理者管理]
    
    C --> C1[商品一覧]
    C --> C2[商品追加/編集]
    C --> C3[カテゴリ管理]
    C --> C4[ブランド管理]
    C --> C5[商品インポート/エクスポート]
    
    D --> D1[注文一覧]
    D --> D2[注文詳細]
    D --> D3[配送管理]
    D --> D4[返品・交換管理]
    
    E --> E1[ユーザー一覧]
    E --> E2[ユーザー詳細]
    E --> E3[レビュー管理]
    
    F --> F1[在庫一覧]
    F --> F2[在庫調整]
    F --> F3[入荷管理]
    F --> F4[在庫アラート]
    
    G --> G1[売上レポート]
    G --> G2[商品分析]
    G --> G3[顧客分析]
    G --> G4[トラフィック分析]
```

### 5.2 管理者権限設計

#### 5.2.1 ロール定義
```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  VIEWER = 'viewer'
}

interface AdminPermissions {
  products: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    import: boolean;
    export: boolean;
  };
  orders: {
    view: boolean;
    update: boolean;
    cancel: boolean;
    refund: boolean;
  };
  users: {
    view: boolean;
    update: boolean;
    delete: boolean;
  };
  inventory: {
    view: boolean;
    adjust: boolean;
    receive: boolean;
  };
  analytics: {
    view: boolean;
    export: boolean;
  };
  settings: {
    view: boolean;
    update: boolean;
  };
  admins: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

const rolePermissions: Record<AdminRole, AdminPermissions> = {
  [AdminRole.SUPER_ADMIN]: {
    // 全権限
    products: { view: true, create: true, update: true, delete: true, import: true, export: true },
    orders: { view: true, update: true, cancel: true, refund: true },
    users: { view: true, update: true, delete: true },
    inventory: { view: true, adjust: true, receive: true },
    analytics: { view: true, export: true },
    settings: { view: true, update: true },
    admins: { view: true, create: true, update: true, delete: true }
  },
  [AdminRole.ADMIN]: {
    // 管理者権限（管理者管理以外）
    products: { view: true, create: true, update: true, delete: true, import: true, export: true },
    orders: { view: true, update: true, cancel: true, refund: true },
    users: { view: true, update: true, delete: false },
    inventory: { view: true, adjust: true, receive: true },
    analytics: { view: true, export: true },
    settings: { view: true, update: false },
    admins: { view: false, create: false, update: false, delete: false }
  },
  // ... 他のロール定義
};
```

### 5.3 主要管理画面詳細設計

#### 5.3.1 ダッシュボード
```typescript
// src/app/admin/page.tsx
const AdminDashboard = () => {
  const { data: stats } = useAdminStats();
  const { data: recentOrders } = useRecentOrders();
  const { data: lowStockProducts } = useLowStockProducts();
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">管理者ダッシュボード</h1>
      
      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="今日の売上"
          value={`¥${stats.todaySales.toLocaleString()}`}
          change={stats.salesChange}
          icon={<YenIcon />}
        />
        <StatsCard 
          title="今日の注文数"
          value={stats.todayOrders}
          change={stats.ordersChange}
          icon={<OrderIcon />}
        />
        <StatsCard 
          title="総商品数"
          value={stats.totalProducts}
          change={stats.productsChange}
          icon={<ProductIcon />}
        />
        <StatsCard 
          title="アクティブユーザー"
          value={stats.activeUsers}
          change={stats.usersChange}
          icon={<UserIcon />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 売上チャート */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">売上推移</h2>
          <SalesChart data={stats.salesChart} />
        </div>
        
        {/* 最近の注文 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">最近の注文</h2>
          <RecentOrdersList orders={recentOrders} />
        </div>
        
        {/* 在庫アラート */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">在庫アラート</h2>
          <LowStockAlert products={lowStockProducts} />
        </div>
        
        {/* クイックアクション */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">クイックアクション</h2>
          <QuickActions />

#### 5.3.2 商品管理
```typescript
// src/app/admin/products/page.tsx
const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/admin/products/import')}>
            インポート
          </Button>
          <Button onClick={() => router.push('/admin/products/new')}>
            新規商品追加
          </Button>
        </div>
      </div>
      
      {/* フィルター・検索 */}
      <ProductFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      {/* 一括操作 */}
      {selectedProducts.length > 0 && (
        <BulkActions 
          selectedCount={selectedProducts.length}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          onBulkActivate={handleBulkActivate}
        />
      )}
      
      {/* 商品テーブル */}
      <ProductTable 
        products={products}
        selectedProducts={selectedProducts}
        onSelectionChange={setSelectedProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
      
      {/* ページネーション */}
      <Pagination />
    </div>
  );
};
```

**商品編集フォーム**:
```typescript
// src/app/admin/products/[id]/edit/page.tsx
const ProductEditForm = ({ product }: { product: Product }) => {
  const form = useForm<ProductFormData>({
    defaultValues: product,
    resolver: zodResolver(productSchema)
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name_ja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品名（日本語）</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_vi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品名（ベトナム語）</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>価格（円）</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>在庫数</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* ベトナム料理特有情報 */}
      <Card>
        <CardHeader>
          <CardTitle>ベトナム料理情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="spice_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>辛さレベル</FormLabel>
                  <FormControl>
                    <SpiceLevelSelector {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storage_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>保存方法</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frozen">冷凍</SelectItem>
                        <SelectItem value="refrigerated">冷蔵</SelectItem>
                        <SelectItem value="ambient">常温</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="allergen_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>アレルギー情報</FormLabel>
                <FormControl>
                  <AllergenSelector {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
      {/* 画像管理 */}
      <Card>
        <CardHeader>
          <CardTitle>商品画像</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader 
            images={form.watch('images')}
            onImagesChange={(images) => form.setValue('images', images)}
            maxImages={10}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
};
```

#### 5.3.3 注文管理
```typescript
// src/app/admin/orders/page.tsx
const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({});
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">注文管理</h1>
        <div className="flex gap-4">
          <Button onClick={handleExportOrders}>
            注文データエクスポート
          </Button>
        </div>
      </div>
      
      {/* フィルター */}
      <OrderFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      {/* 注文テーブル */}
      <OrderTable 
        orders={orders}
        onStatusUpdate={handleStatusUpdate}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};
```

#### 5.3.4 売上分析
```typescript
// src/app/admin/analytics/page.tsx
const AnalyticsPage = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">売上分析</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="sales">売上</TabsTrigger>
          <TabsTrigger value="products">商品</TabsTrigger>
          <TabsTrigger value="customers">顧客</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>売上推移</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>注文状況</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>人気商品</CardTitle>
              </CardHeader>
              <CardContent>
                <TopProductsList />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>顧客分析</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerAnalytics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sales">
          <SalesAnalytics />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductAnalytics />
        </TabsContent>
        
        <TabsContent value="customers">
          <CustomerAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

---

## 6. API設計

### 6.1 API構成
```mermaid
graph TB
    subgraph "Public APIs"
        A1[/api/public/products]
        A2[/api/public/categories]
        A3[/api/public/search]
        A4[/api/public/auth]
    end
    
    subgraph "Protected APIs"
        B1[/api/protected/cart]
        B2[/api/protected/orders]
        B3[/api/protected/profile]
        B4[/api/protected/reviews]
    end
    
    subgraph "Admin APIs"
        C1[/api/admin/products]
        C2[/api/admin/orders]
        C3[/api/admin/users]
        C4[/api/admin/analytics]
        C5[/api/admin/settings]
    end
```

### 6.2 主要API仕様

#### 6.2.1 商品API
```typescript
// GET /api/public/products
interface ProductListRequest {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  spiceLevel?: number[];
  storageType?: string;
  sortBy?: 'price' | 'name' | 'created_at' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

interface ProductListResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: Category[];
    priceRange: { min: number; max: number };
    spiceLevels: number[];
    storageTypes: string[];
  };
}

// GET /api/public/products/[id]
interface ProductDetailResponse {
  product: ProductWithDetails;
  relatedProducts: Product[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}
```

#### 6.2.2 カートAPI
```typescript
// POST /api/protected/cart/add
interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface AddToCartResponse {
  success: boolean;
  cartItem: CartItem;
  cartTotal: number;
}

// GET /api/protected/cart
interface CartResponse {
  items: CartItemWithProduct[];
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    itemCount: number;
  };
}
```

#### 6.2.3 注文API
```typescript
// POST /api/protected/orders
interface CreateOrderRequest {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethod: string;
  paymentMethodId: string;
  notes?: string;
}

interface CreateOrderResponse {
  order: Order;
  paymentIntent?: {
    clientSecret: string;
    paymentIntentId: string;
  };
}
```

---

## 7. セキュリティ設計

### 7.1 認証・認可

#### 7.1.1 JWT実装
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  permissions?: string[];
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
    issuer: 'vietfood-market',
    audience: 'vietfood-users'
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### 7.2 データ保護

#### 7.2.1 入力検証
```typescript
// lib/validation.ts
import { z } from 'zod';

export const productSchema = z.object({
  name_ja: z.string().min(1).max(255),
  name_vi: z.string().min(1).max(255),
  description_ja: z.string().optional(),
  description_vi: z.string().optional(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
  category_id: z.string().uuid(),
  spice_level: z.number().int().min(0).max(5),
  storage_type: z.enum(['frozen', 'refrigerated', 'ambient']),
  allergen_info: z.array(z.string()).optional(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1),
  shippingAddressId: z.string().uuid(),
  shippingMethod: z.string(),
  paymentMethodId: z.string()
});
```

### 7.3 セキュリティヘッダー
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: *.cloudinary.com",
      "connect-src 'self' *.stripe.com api.cloudinary.com"
    ].join('; ')
  }
];
```

---

## 8. パフォーマンス最適化

### 8.1 フロントエンド最適化

#### 8.1.1 Next.js最適化設定
```typescript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false
};
```

#### 8.1.2 コード分割・遅延読み込み
```typescript
// 動的インポート例
import dynamic from 'next/dynamic';

const ProductReviews = dynamic(() => import('./ProductReviews'), {
  loading: () => <ReviewsSkeleton />,
  ssr: false
});

const AdminAnalytics = dynamic(() => import('./AdminAnalytics'), {
  loading: () => <AnalyticsSkeleton />
});
```

### 8.2 データベース最適化

#### 8.2.1 インデックス戦略
```sql
-- 商品検索用インデックス
CREATE INDEX CONCURRENTLY idx_products_search_ja 
ON products USING gin(to_tsvector('japanese', name_ja || ' ' || COALESCE(description_ja, '')));

CREATE INDEX CONCURRENTLY idx_products_category_active 
ON products(category_id, is_active);

CREATE INDEX CONCURRENTLY idx_products_price 
ON products(price);

-- 注文関連インデックス
CREATE INDEX CONCURRENTLY idx_orders_user_created 
ON orders(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_orders_status 
ON orders(status);
```

#### 8.2.2 キャッシュ戦略
```typescript
// Redis キャッシュ実装
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedProducts(category: string) {
  const cacheKey = `products:${category}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const products = await getProductsByCategory(category);
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  
  return products;
}
```

---

## 9. 多言語対応

### 9.1 国際化設定
```typescript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'vi'],
    localeDetection: true,
  },
  fallbackLng: {
    default: ['ja'],
    vi: ['ja'],
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  keySeparator: '.',
  nsSeparator: ':',
  pluralSeparator: '_',
  contextSeparator: '_',
};
```

### 9.2 翻訳ファイル構造
```
public/
├── locales/
│   ├── ja/
│   │   ├── common.json
│   │   ├── products.json
│   │   ├── cart.json
│   │   ├── checkout.json
│   │   └── admin.json
│   └── vi/
│       ├── common.json
│       ├── products.json
│       ├── cart.json
│       ├── checkout.json
│       └── admin.json
```

### 9.3 多言語コンポーネント
```typescript
// components/LanguageSwitcher.tsx
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  const switchLanguage = (locale: string) => {
    router.push(router.asPath, router.asPath, { locale });
  };
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLanguage('ja')}
        className={`px-3 py-1 rounded ${
          i18n.language === 'ja' ? 'bg-red-600 text-white' : 'bg-gray-200'
        }`}
      >
        日本語
      </button>
      <button
        onClick={() => switchLanguage('vi')}
        className={`px-3 py-1 rounded ${
          i18n.language === 'vi' ? 'bg-red-600 text-white' : 'bg-gray-200'
        }`}
      >
        Tiếng Việt
      </button>
    </div>
  );
};
```

---

## 10. デプロイメント戦略

### 10.1 インフラ構成
```mermaid
graph TB
    subgraph "Production Environment"
        A[Vercel Frontend]
        B[AWS RDS PostgreSQL]
        C[AWS S3 Storage]
        D[CloudFront CDN]
        E[AWS ElastiCache Redis]
    end
    
    subgraph "CI/CD Pipeline"
        F[GitHub Actions]
        G[Automated Testing]
        H[Build & Deploy]
    end
    
    subgraph "Monitoring"
        I[Vercel Analytics]
        J[Sentry Error Tracking]
        K[DataDog APM]
    end
    
    F --> G
    G --> H
    H --> A
    A --> B
    A --> E
    C --> D
```

### 10.2 環境設定

#### 10.2.1 環境変数
```bash
# .env.production
DATABASE_URL="postgresql://user:password@host:5432/vietfood_prod"
REDIS_URL="redis://redis-host:6379"
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
SENDGRID_API_KEY="SG...."
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
SENTRY_DSN="https://...@sentry.io/..."
```

#### 10.2.2 CI/CD パイプライン
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 10.3 監視・ログ

#### 10.3.1 エラー監視
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // 機密情報をフィルタリング
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  },
});
```

#### 10.3.2 パフォーマンス監視
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const AnalyticsProvider = ({ children }) => {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
};
```

---

## 11. ベトナム料理特有の考慮事項

### 11.1 商品カテゴリ詳細設計

#### 11.1.1 カテゴリ階層
```mermaid
graph TD
    A[ベトナム料理] --> B[麺類]
    A --> C[スープ・ブロス]
    A --> D[調味料・ソース]
    A --> E[冷凍食品]
    A --> F[乾物・香辛料]
    A --> G[飲料・デザート]
    
    B --> B1[フォー麺]
    B --> B2[ブン麺]
    B --> B3[ミー麺]
    B --> B4[バインホイ]
    
    C --> C1[フォーブロス]
    C --> C2[ブンボーフエスープ]
    C --> C3[カインチュア]
    
    D --> D1[ヌクマム]
    D --> D2[チリソース]
    D --> D3[ホイシンソース]
    D --> D4[タマリンドペースト]
    
    E --> E1[冷凍春巻き]
    E --> E2[冷凍バインミー]
    E --> E3[冷凍チェー]
    
    F --> F1[スターアニス]
    F --> F2[シナモン]
    F --> F3[レモングラス]
    F --> F4[ライスペーパー]
```

#### 11.1.2 商品属性詳細
```typescript
interface VietnameseProductAttributes {
  // 基本情報
  spiceLevel: 1 | 2 | 3 | 4 | 5; // 辛さレベル
  region: 'north' | 'central' | 'south'; // 地域（北部・中部・南部）
  
  // 調理情報
  cookingTime: number; // 調理時間（分）
  servingSize: number; // 何人前
  difficulty: 'easy' | 'medium' | 'hard'; // 調理難易度
  
  // 保存・配送
  storageType: 'frozen' | 'refrigerated' | 'ambient';
  shelfLife: number; // 賞味期限（日数）
  temperatureRange?: {
    min: number;
    max: number;
  };
  
  // 栄養・アレルギー
  allergens: string[]; // アレルギー情報
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    fiber?: number;
  };
  
  // 特別な属性
  halal: boolean; // ハラル対応
  vegetarian: boolean; // ベジタリアン対応
  vegan: boolean; // ビーガン対応
  glutenFree: boolean; // グルテンフリー
  
  // 調理方法
  cookingMethods: ('boil' | 'steam' | 'fry' | 'grill' | 'raw')[];
  
  // 推奨の組み合わせ
  recommendedWith?: string[]; // 他商品のID
  
  // 季節性
  seasonal?: 'spring' | 'summer' | 'autumn' | 'winter';
}
```

### 11.2 配送方法別詳細設計

#### 11.2.1 配送タイプ管理
```typescript
interface ShippingMethod {
  id: string;
  name: { ja: string; vi: string };
  type: 'frozen' | 'refrigerated' | 'ambient';
  basePrice: number;
  freeShippingThreshold: number;
  deliveryDays: number;
  availableRegions: string[];
  temperatureRange?: {
    min: number;
    max: number;
  };
  restrictions?: {
    maxWeight: number;
    maxDimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

const shippingMethods: ShippingMethod[] = [
  {
    id: 'frozen',
    name: { ja: '冷凍便', vi: 'Giao hàng đông lạnh' },
    type: 'frozen',
    basePrice: 1200,
    freeShippingThreshold: 8000,
    deliveryDays: 2,
    availableRegions: ['all'],
    temperatureRange: { min: -18, max: -15 },
    restrictions: {
      maxWeight: 20,
      maxDimensions: { length: 60
, width: 40, height: 30 }
    }
  },
  {
    id: 'refrigerated',
    name: { ja: '冷蔵便', vi: 'Giao hàng lạnh' },
    type: 'refrigerated',
    basePrice: 800,
    freeShippingThreshold: 5000,
    deliveryDays: 1,
    availableRegions: ['all'],
    temperatureRange: { min: 2, max: 8 },
    restrictions: {
      maxWeight: 15,
      maxDimensions: { length: 50, width: 35, height: 25 }
    }
  },
  {
    id: 'ambient',
    name: { ja: '常温便', vi: 'Giao hàng thường' },
    type: 'ambient',
    basePrice: 500,
    freeShippingThreshold: 3000,
    deliveryDays: 1,
    availableRegions: ['all'],
    restrictions: {
      maxWeight: 25,
      maxDimensions: { length: 80, width: 60, height: 40 }
    }
  }
];
```

#### 11.2.2 配送料計算ロジック
```typescript
// lib/shipping.ts
interface ShippingCalculationParams {
  items: CartItem[];
  destination: Address;
  preferredMethod?: string;
}

interface ShippingOption {
  method: ShippingMethod;
  cost: number;
  estimatedDelivery: Date;
  available: boolean;
  reason?: string;
}

export const calculateShipping = async (
  params: ShippingCalculationParams
): Promise<ShippingOption[]> => {
  const { items, destination } = params;
  
  // 商品の配送タイプを分析
  const shippingTypes = analyzeShippingTypes(items);
  const totalWeight = calculateTotalWeight(items);
  const totalValue = calculateTotalValue(items);
  
  const options: ShippingOption[] = [];
  
  for (const method of shippingMethods) {
    // 配送タイプの互換性チェック
    const compatible = checkCompatibility(shippingTypes, method.type);
    if (!compatible.isCompatible) {
      options.push({
        method,
        cost: 0,
        estimatedDelivery: new Date(),
        available: false,
        reason: compatible.reason
      });
      continue;
    }
    
    // 重量・サイズ制限チェック
    if (totalWeight > method.restrictions?.maxWeight!) {
      options.push({
        method,
        cost: 0,
        estimatedDelivery: new Date(),
        available: false,
        reason: '重量制限を超えています'
      });
      continue;
    }
    
    // 配送料計算
    let cost = method.basePrice;
    
    // 無料配送閾値チェック
    if (totalValue >= method.freeShippingThreshold) {
      cost = 0;
    }
    
    // 地域別追加料金
    const regionSurcharge = getRegionSurcharge(destination.prefecture, method);
    cost += regionSurcharge;
    
    // 配送予定日計算
    const estimatedDelivery = calculateDeliveryDate(method.deliveryDays);
    
    options.push({
      method,
      cost,
      estimatedDelivery,
      available: true
    });
  }
  
  return options;
};
```

### 11.3 レシピ・調理方法統合

#### 11.3.1 レシピデータベース設計
```typescript
interface Recipe {
  id: string;
  title: { ja: string; vi: string };
  description: { ja: string; vi: string };
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: number; // 分
  servings: number;
  region: 'north' | 'central' | 'south';
  category: 'main' | 'appetizer' | 'soup' | 'dessert' | 'drink';
  
  ingredients: {
    productId?: string; // 販売商品との紐付け
    name: { ja: string; vi: string };
    amount: string;
    optional: boolean;
  }[];
  
  instructions: {
    step: number;
    description: { ja: string; vi: string };
    image?: string;
    duration?: number; // この工程の所要時間
  }[];
  
  tips: {
    ja: string;
    vi: string;
  }[];
  
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  
  images: string[];
  videoUrl?: string;
  
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 11.3.2 レシピ機能実装
```typescript
// components/RecipeCard.tsx
const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ja' | 'vi';
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={recipe.images[0]}
          alt={recipe.title[currentLang]}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">
            {recipe.difficulty === 'easy' ? '簡単' : 
             recipe.difficulty === 'medium' ? '普通' : '上級'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {recipe.title[currentLang]}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description[currentLang]}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.cookingTime}分
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings}人前
            </span>
          </div>
          <RegionBadge region={recipe.region} />
        </div>
        
        {/* 必要な商品リンク */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">必要な材料:</p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients
              .filter(ing => ing.productId)
              .slice(0, 3)
              .map(ingredient => (
                <Link
                  key={ingredient.productId}
                  href={`/products/${ingredient.productId}`}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100"
                >
                  {ingredient.name[currentLang]}
                </Link>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 12. 実装フェーズ計画

### 12.1 開発スケジュール

```mermaid
gantt
    title ベトナム料理ECサイト開発スケジュール
    dateFormat  YYYY-MM-DD
    section フェーズ1: 基盤構築
    プロジェクトセットアップ    :2024-01-01, 3d
    データベース設計・構築      :2024-01-04, 5d
    認証システム構築           :2024-01-09, 7d
    基本UIコンポーネント       :2024-01-16, 10d
    
    section フェーズ2: コア機能
    商品カタログ機能           :2024-01-26, 14d
    ショッピングカート         :2024-02-09, 10d
    注文システム              :2024-02-19, 12d
    決済連携                 :2024-03-03, 8d
    
    section フェーズ3: 管理機能
    管理者パネル              :2024-03-11, 14d
    在庫管理システム           :2024-03-25, 10d
    分析・レポート機能         :2024-04-04, 8d
    
    section フェーズ4: 最適化
    パフォーマンス最適化       :2024-04-12, 10d
    セキュリティ強化           :2024-04-22, 7d
    多言語対応完成            :2024-04-29, 8d
    
    section フェーズ5: テスト・デプロイ
    総合テスト               :2024-05-07, 10d
    本番環境構築              :2024-05-17, 5d
    本番デプロイ              :2024-05-22, 3d
```

### 12.2 技術的マイルストーン

#### フェーズ1: 基盤構築（3-4週間）
**目標**: 開発環境とコア技術スタックの確立

**成果物**:
- Next.js 14プロジェクトセットアップ
- PostgreSQL + Prismaデータベース構築
- NextAuth.js認証システム
- Tailwind CSSデザインシステム
- 基本的なページルーティング

**技術的要件**:
```typescript
// 完了基準
interface Phase1Deliverables {
  projectSetup: {
    nextjsVersion: '14.x';
    typescriptConfig: boolean;
    eslintConfig: boolean;
    prettierConfig: boolean;
  };
  database: {
    prismaSchema: boolean;
    migrations: boolean;
    seedData: boolean;
  };
  authentication: {
    nextAuthConfig: boolean;
    jwtImplementation: boolean;
    userRegistration: boolean;
    userLogin: boolean;
  };
  ui: {
    tailwindSetup: boolean;
    componentLibrary: boolean;
    responsiveLayout: boolean;
  };
}
```

#### フェーズ2: コア機能開発（6-8週間）
**目標**: ECサイトの基本機能実装

**成果物**:
- 商品カタログ・検索・フィルタリング
- ショッピングカート機能
- チェックアウトフロー
- 注文管理システム
- Stripe決済連携

#### フェーズ3: 管理機能・最適化（4-6週間）
**目標**: 管理者機能とパフォーマンス最適化

**成果物**:
- 管理者ダッシュボード
- 商品・在庫管理
- 注文管理システム
- 売上分析機能
- パフォーマンス最適化

#### フェーズ4: 多言語・特殊機能（3-4週間）
**目標**: ベトナム料理特有機能と多言語対応

**成果物**:
- 完全な多言語対応
- ベトナム料理特有の商品属性
- 配送方法別管理
- レシピ統合機能

#### フェーズ5: テスト・デプロイ（2-3週間）
**目標**: 本番環境デプロイと品質保証

**成果物**:
- 自動テストスイート
- パフォーマンステスト
- セキュリティテスト
- 本番環境デプロイ

### 12.3 品質保証計画

#### 12.3.1 テスト戦略
```typescript
// テストピラミッド
interface TestStrategy {
  unitTests: {
    coverage: '90%以上';
    tools: ['Jest', 'React Testing Library'];
    focus: ['ビジネスロジック', 'ユーティリティ関数', 'コンポーネント'];
  };
  integrationTests: {
    coverage: '80%以上';
    tools: ['Jest', 'Supertest'];
    focus: ['API エンドポイント', 'データベース操作', '外部サービス連携'];
  };
  e2eTests: {
    coverage: '主要フロー100%';
    tools: ['Playwright', 'Cypress'];
    focus: ['ユーザージャーニー', 'クリティカルパス', 'クロスブラウザ'];
  };
  performanceTests: {
    tools: ['Lighthouse', 'WebPageTest'];
    metrics: ['LCP < 2.5s', 'FID < 100ms', 'CLS < 0.1'];
  };
}
```

#### 12.3.2 コード品質管理
```typescript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};

// husky pre-commit hooks
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 13. 運用・保守計画

### 13.1 監視・アラート

#### 13.1.1 システム監視
```typescript
// 監視項目
interface MonitoringMetrics {
  performance: {
    responseTime: '< 500ms';
    throughput: '> 1000 req/min';
    errorRate: '< 1%';
    availability: '> 99.9%';
  };
  business: {
    orderConversionRate: '> 3%';
    cartAbandonmentRate: '< 70%';
    averageOrderValue: 'トレンド監視';
    dailyActiveUsers: 'トレンド監視';
  };
  infrastructure: {
    cpuUsage: '< 80%';
    memoryUsage: '< 85%';
    diskUsage: '< 90%';
    databaseConnections: '< 80% of max';
  };
}
```

#### 13.1.2 ログ管理
```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vietfood-ecommerce' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### 13.2 バックアップ・災害復旧

#### 13.2.1 データバックアップ戦略
```yaml
# バックアップ計画
backup_strategy:
  database:
    frequency: "毎日 2:00 AM JST"
    retention: "30日間"
    type: "フルバックアップ"
    location: "AWS S3 (別リージョン)"
    
  files:
    frequency: "毎日 3:00 AM JST"
    retention: "30日間"
    type: "増分バックアップ"
    location: "AWS S3 (別リージョン)"
    
  configuration:
    frequency: "変更時"
    retention: "無期限"
    type: "Git リポジトリ"
    location: "GitHub"
```

### 13.3 セキュリティ更新

#### 13.3.1 定期セキュリティチェック
```typescript
// セキュリティチェックリスト
interface SecurityChecklist {
  monthly: [
    '依存関係の脆弱性スキャン',
    'SSL証明書の有効期限確認',
    'アクセスログの異常検知',
    '管理者アカウントの監査'
  ];
  quarterly: [
    'ペネトレーションテスト',
    'セキュリティポリシーの見直し',
    'インシデント対応手順の確認',
    'バックアップ復旧テスト'
  ];
  annually: [
    '外部セキュリティ監査',
    'コンプライアンス確認',
    'セキュリティ研修の実施',
    '災害復旧計画の見直し'
  ];
}
```

---

## 14. 結論

### 14.1 設計書サマリー

本設計書では、Next.js 14を基盤としたベトナム料理専門ECサイトの包括的な設計を行いました。主な特徴は以下の通りです：

**技術的特徴**:
- モダンなNext.js 14 App Routerアーキテクチャ
- TypeScriptによる型安全な開発
- Prisma ORMによる効率的なデータベース管理
- 完全なレスポンシブデザイン対応

**ビジネス機能**:
- 包括的な商品カタログ・検索システム
- 直感的なショッピングカート・チェックアウト
- 強力な管理者パネル・分析機能
- 多言語対応（日本語・ベトナム語）

**ベトナム料理特化機能**:
- 辛さレベル・アレルギー情報管理
- 配送方法別管理（冷凍・冷蔵・常温）
- レシピ統合・調理方法案内
- 地域別商品分類

**セキュリティ・パフォーマンス**:
- 多層防御セキュリティ設計
- 最適化されたパフォーマンス戦略
- スケーラブルなインフラ構成
- 包括的な監視・運用計画

### 14.2 実装推奨事項

1. **段階的開発**: フェーズ分けされた開発計画に従い、MVP（最小実行可能製品）から始めて段階的に機能を拡張

2. **品質重視**: 各フェーズでの十分なテスト実装と品質保証

3. **ユーザーフィードバック**: 早期からのユーザーテストとフィードバック収集

4. **継続的改善**: 運用開始後の継続的な機能改善とパフォーマンス最適化

### 14.3 成功指標

**技術指標**:
- ページ読み込み速度: 2秒以内
- 稼働率: 99.9%以上
- セキュリティインシデント: ゼロ

**ビジネス指標**:
- 月間アクティブユーザー: 10,000人以上
- 注文コンバージョン率: 3%以上
- 顧客満足度: 4.5/5.0以上

この設計書は、実装チームが効率的かつ確実にベトナム料理専門ECサイトを構築するための詳細なガイドラインとして機能します。各セクションの技術仕様と実装例を参考に、高品質なECプラットフォームの構築を進めることができます。