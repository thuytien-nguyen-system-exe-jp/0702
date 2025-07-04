'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CartItemWithProduct } from '@/types'

// カートアイテムの型定義
export interface CartItem {
  id: string
  productId: string
  productVariantId?: string
  quantity: number
  product: {
    id: string
    sku: string
    nameJa: string
    nameVi: string
    price: number
    stockQuantity: number
    images: {
      imageUrl: string
      altText: string | null
    }[]
    category: {
      nameJa: string
      nameVi: string
    }
  }
  productVariant?: {
    id: string
    name: string
    value: string
    priceModifier: number
    stockQuantity: number
  }
}

// カート状態の型定義
export interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isLoading: boolean
  error: string | null
}

// カートアクションの型定義
export type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { productId: string; productVariantId?: string; quantity: number; product: CartItem['product']; productVariant?: CartItem['productVariant'] } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }

// 初期状態
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null
}

// カートリデューサー
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'SET_ITEMS':
      const items = action.payload
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = items.reduce((sum, item) => {
        const price = item.product.price + (item.productVariant?.priceModifier || 0)
        return sum + (price * item.quantity)
      }, 0)
      return {
        ...state,
        items,
        totalItems,
        totalAmount,
        isLoading: false,
        error: null
      }

    case 'ADD_ITEM':
      const { productId, productVariantId, quantity, product, productVariant } = action.payload
      const existingItemIndex = state.items.findIndex(
        item => item.productId === productId && item.productVariantId === productVariantId
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // 既存アイテムの数量を更新
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // 新しいアイテムを追加
        const newItem: CartItem = {
          id: `${productId}-${productVariantId || 'default'}-${Date.now()}`,
          productId,
          productVariantId,
          quantity,
          product,
          productVariant
        }
        newItems = [...state.items, newItem]
      }

      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const newTotalAmount = newItems.reduce((sum, item) => {
        const price = item.product.price + (item.productVariant?.priceModifier || 0)
        return sum + (price * item.quantity)
      }, 0)

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalAmount: newTotalAmount,
        error: null
      }

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0)

      const updatedTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const updatedTotalAmount = updatedItems.reduce((sum, item) => {
        const price = item.product.price + (item.productVariant?.priceModifier || 0)
        return sum + (price * item.quantity)
      }, 0)

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedTotalItems,
        totalAmount: updatedTotalAmount,
        error: null
      }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload.id)
      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      const filteredTotalAmount = filteredItems.reduce((sum, item) => {
        const price = item.product.price + (item.productVariant?.priceModifier || 0)
        return sum + (price * item.quantity)
      }, 0)

      return {
        ...state,
        items: filteredItems,
        totalItems: filteredTotalItems,
        totalAmount: filteredTotalAmount,
        error: null
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        error: null
      }

    default:
      return state
  }
}

// カートコンテキストの型定義
interface CartContextType {
  state: CartState
  addToCart: (productId: string, quantity: number, productVariantId?: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  loadCart: () => Promise<void>
  syncWithServer: () => Promise<void>
}

// カートコンテキスト
const CartContext = createContext<CartContextType | undefined>(undefined)

// カートプロバイダーのProps
interface CartProviderProps {
  children: ReactNode
}

// ローカルストレージキー
const CART_STORAGE_KEY = 'vietfood_cart'

// カートプロバイダー
export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // ローカルストレージからカートを読み込み
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: 'SET_ITEMS', payload: cartData.items || [] })
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error)
      dispatch({ type: 'SET_ERROR', payload: 'カートの読み込みに失敗しました' })
    }
  }

  // ローカルストレージにカートを保存
  const saveCartToStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }))
    } catch (error) {
      console.error('Failed to save cart to storage:', error)
    }
  }

  // 商品詳細を取得
  const fetchProductDetails = async (productId: string, productVariantId?: string) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId })
    })

    if (!response.ok) {
      throw new Error('商品情報の取得に失敗しました')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || '商品情報の取得に失敗しました')
    }

    const product = data.data.product
    const productVariant = productVariantId
      ? product.variants.find((v: any) => v.id === productVariantId)
      : undefined

    return {
      product: {
        id: product.id,
        sku: product.sku,
        nameJa: product.nameJa,
        nameVi: product.nameVi,
        price: product.price,
        stockQuantity: product.stockQuantity,
        images: product.images,
        category: product.category
      },
      productVariant
    }
  }

  // カートに商品を追加
  const addToCart = async (productId: string, quantity: number, productVariantId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { product, productVariant } = await fetchProductDetails(productId, productVariantId)

      // 在庫チェック
      const availableStock = productVariant?.stockQuantity ?? product.stockQuantity
      if (availableStock < quantity) {
        throw new Error('在庫が不足しています')
      }

      dispatch({
        type: 'ADD_ITEM',
        payload: {
          productId,
          productVariantId,
          quantity,
          product,
          productVariant
        }
      })

    } catch (error) {
      console.error('Failed to add to cart:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'カートへの追加に失敗しました'
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // 数量を更新
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  // カートから商品を削除
  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }

  // カートをクリア
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  // カートを読み込み
  const loadCart = async () => {
    loadCartFromStorage()
  }

  // サーバーと同期（認証済みユーザーの場合）
  const syncWithServer = async () => {
    // TODO: 認証済みユーザーの場合、サーバーのカートと同期
    // 現在はローカルストレージのみ使用
  }

  // カート状態が変更されたらローカルストレージに保存
  useEffect(() => {
    if (state.items.length > 0 || state.totalItems === 0) {
      saveCartToStorage(state.items)
    }
  }, [state.items])

  // 初回読み込み
  useEffect(() => {
    loadCart()
  }, [])

  const contextValue: CartContextType = {
    state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    syncWithServer
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// カートコンテキストを使用するためのフック
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}