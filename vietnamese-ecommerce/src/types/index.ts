// 基本的な型定義（静的サイト用）
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  preferredLanguage: string
  avatarUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  sku?: string
  barcode?: string
  weight?: number
  dimensions?: string
  categoryId: string
  brandId?: string
  isActive: boolean
  isFeatured: boolean
  stockQuantity: number
  lowStockThreshold: number
  images: string[]
  tags: string[]
  attributes: Record<string, any>
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  imageUrl?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: string
  totalAmount: number
  subtotalAmount: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  currency: string
  paymentStatus: string
  paymentMethod?: string
  shippingMethod?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productVariantId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  userId?: string
  sessionId?: string
  productId: string
  productVariantId?: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  userId: string
  type: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  title?: string
  content?: string
  isVerified: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Admin {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 拡張型定義
export interface ProductWithDetails extends Product {
  category: Category
  brand?: Brand
  reviews: (Review & {
    user: {
      firstName?: string
      lastName?: string
      avatarUrl?: string
    }
  })[]
}

export interface CartItemWithProduct extends CartItem {
  product: Product & {
    images: string[]
    category: Category
  }
}

export interface OrderWithDetails extends Order {
  items: (OrderItem & {
    product: Product & {
      images: string[]
    }
  })[]
  shippingAddress?: Address
  billingAddress?: Address
}

export interface CategoryWithChildren extends Category {
  children: Category[]
  parent?: Category
}

// ベトナム料理特有の型定義
export interface VietnameseProductAttributes {
  spiceLevel: 0 | 1 | 2 | 3 | 4 | 5
  region: 'north' | 'central' | 'south'
  cookingTime?: number
  servingSize?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  storageType: 'frozen' | 'refrigerated' | 'ambient'
  shelfLife?: number
  temperatureRange?: {
    min: number
    max: number
  }
  allergens: string[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sodium: number
    fiber?: number
  }
  halal: boolean
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  cookingMethods: ('boil' | 'steam' | 'fry' | 'grill' | 'raw')[]
  recommendedWith?: string[]
  seasonal?: 'spring' | 'summer' | 'autumn' | 'winter'
}

// 配送関連の型定義
export interface ShippingMethod {
  id: string
  name: { ja: string; vi: string }
  type: 'frozen' | 'refrigerated' | 'ambient'
  basePrice: number
  freeShippingThreshold: number
  deliveryDays: number
  availableRegions: string[]
  temperatureRange?: {
    min: number
    max: number
  }
  restrictions?: {
    maxWeight: number
    maxDimensions: {
      length: number
      width: number
      height: number
    }
  }
}

export interface ShippingOption {
  method: ShippingMethod
  cost: number
  estimatedDelivery: Date
  available: boolean
  reason?: string
}

// フィルター関連の型定義
export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  spiceLevel?: number[]
  storageType?: string[]
  allergens?: string[]
  inStock?: boolean
  featured?: boolean
  search?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
  limit: number
}

// API レスポンス型定義
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProductListResponse {
  products: Product[]
  pagination: PaginationInfo
  filters: {
    categories: Category[]
    brands: Brand[]
    priceRange: { min: number; max: number }
    spiceLevels: number[]
    storageTypes: string[]
  }
}

// 認証関連の型定義
export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  preferredLanguage: string
  avatarUrl?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  preferredLanguage?: string
}

// 管理者権限の型定義
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  VIEWER = 'viewer'
}

export interface AdminPermissions {
  products: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
    import: boolean
    export: boolean
  }
  orders: {
    view: boolean
    update: boolean
    cancel: boolean
    refund: boolean
  }
  users: {
    view: boolean
    update: boolean
    delete: boolean
  }
  inventory: {
    view: boolean
    adjust: boolean
    receive: boolean
  }
  analytics: {
    view: boolean
    export: boolean
  }
  settings: {
    view: boolean
    update: boolean
  }
  admins: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
}

// レシピ関連の型定義
export interface Recipe {
  id: string
  title: { ja: string; vi: string }
  description: { ja: string; vi: string }
  difficulty: 'easy' | 'medium' | 'hard'
  cookingTime: number
  servings: number
  region: 'north' | 'central' | 'south'
  category: 'main' | 'appetizer' | 'soup' | 'dessert' | 'drink'
  ingredients: {
    productId?: string
    name: { ja: string; vi: string }
    amount: string
    optional: boolean
  }[]
  instructions: {
    step: number
    description: { ja: string; vi: string }
    image?: string
    duration?: number
  }[]
  tips: {
    ja: string
    vi: string
  }[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  images: string[]
  videoUrl?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// 多言語対応の型定義
export type Language = 'ja' | 'vi'

export interface MultiLanguageText {
  ja: string
  vi: string
}

// エラー型定義
export interface AppError {
  code: string
  message: string
  details?: any
}

// 統計・分析関連の型定義
export interface SalesStats {
  todaySales: number
  todayOrders: number
  totalProducts: number
  activeUsers: number
  salesChange: number
  ordersChange: number
  productsChange: number
  usersChange: number
  salesChart: {
    date: string
    sales: number
    orders: number
  }[]
}