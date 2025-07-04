import { Prisma } from '@prisma/client'

// 基本的な型定義
export type User = Prisma.UserGetPayload<{}>
export type Product = Prisma.ProductGetPayload<{}>
export type Category = Prisma.CategoryGetPayload<{}>
export type Brand = Prisma.BrandGetPayload<{}>
export type Order = Prisma.OrderGetPayload<{}>
export type OrderItem = Prisma.OrderItemGetPayload<{}>
export type CartItem = Prisma.CartItemGetPayload<{}>
export type Address = Prisma.AddressGetPayload<{}>
export type Review = Prisma.ReviewGetPayload<{}>
export type Admin = Prisma.AdminGetPayload<{}>

// 拡張型定義
export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true
    brand: true
    images: true
    variants: true
    reviews: {
      include: {
        user: {
          select: {
            firstName: true
            lastName: true
            avatarUrl: true
          }
        }
      }
    }
  }
}>

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        images: true
        category: true
      }
    }
    productVariant: true
  }
}>

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: true
          }
        }
        productVariant: true
      }
    }
    shippingAddress: true
    billingAddress: true
    statusHistory: true
  }
}>

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: {
    children: true
    parent: true
  }
}>

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