'use client'

import { useCart as useCartContext } from '@/contexts/CartContext'
import { useCallback } from 'react'

// カートフックの拡張機能
export function useCart() {
  const cartContext = useCartContext()

  // 商品がカートに入っているかチェック
  const isInCart = useCallback((productId: string, productVariantId?: string) => {
    return cartContext.state.items.some(
      item => item.productId === productId && item.productVariantId === productVariantId
    )
  }, [cartContext.state.items])

  // カート内の特定商品の数量を取得
  const getItemQuantity = useCallback((productId: string, productVariantId?: string) => {
    const item = cartContext.state.items.find(
      item => item.productId === productId && item.productVariantId === productVariantId
    )
    return item?.quantity || 0
  }, [cartContext.state.items])

  // カート内の特定商品のアイテムIDを取得
  const getItemId = useCallback((productId: string, productVariantId?: string) => {
    const item = cartContext.state.items.find(
      item => item.productId === productId && item.productVariantId === productVariantId
    )
    return item?.id
  }, [cartContext.state.items])

  // 商品の合計価格を計算
  const getItemTotal = useCallback((productId: string, productVariantId?: string) => {
    const item = cartContext.state.items.find(
      item => item.productId === productId && item.productVariantId === productVariantId
    )
    if (!item) return 0

    const price = item.product.price + (item.productVariant?.priceModifier || 0)
    return price * item.quantity
  }, [cartContext.state.items])

  // カートの統計情報を取得
  const getCartStats = useCallback(() => {
    const { items, totalItems, totalAmount } = cartContext.state
    
    return {
      itemCount: items.length,
      totalItems,
      totalAmount,
      isEmpty: items.length === 0,
      hasItems: items.length > 0
    }
  }, [cartContext.state])

  // 税込み価格を計算（日本の消費税10%）
  const getTaxIncludedAmount = useCallback(() => {
    const taxRate = 0.1 // 10%
    return Math.round(cartContext.state.totalAmount * (1 + taxRate))
  }, [cartContext.state.totalAmount])

  // 送料を計算（簡易版）
  const getShippingCost = useCallback(() => {
    const freeShippingThreshold = 5000 // 5000円以上で送料無料
    const standardShippingCost = 500 // 標準送料500円
    
    if (cartContext.state.totalAmount >= freeShippingThreshold) {
      return 0
    }
    return standardShippingCost
  }, [cartContext.state.totalAmount])

  // 最終合計金額を計算（商品代金 + 税金 + 送料）
  const getFinalTotal = useCallback(() => {
    const subtotal = cartContext.state.totalAmount
    const tax = Math.round(subtotal * 0.1)
    const shipping = getShippingCost()
    return subtotal + tax + shipping
  }, [cartContext.state.totalAmount, getShippingCost])

  // 送料無料まであといくらかを計算
  const getAmountForFreeShipping = useCallback(() => {
    const freeShippingThreshold = 5000
    const remaining = freeShippingThreshold - cartContext.state.totalAmount
    return remaining > 0 ? remaining : 0
  }, [cartContext.state.totalAmount])

  // カートアイテムをカテゴリ別にグループ化
  const getItemsByCategory = useCallback(() => {
    const grouped = cartContext.state.items.reduce((acc, item) => {
      const categoryName = item.product.category.nameJa
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(item)
      return acc
    }, {} as Record<string, typeof cartContext.state.items>)

    return grouped
  }, [cartContext.state.items])

  // 在庫チェック
  const checkStock = useCallback(async () => {
    const outOfStockItems: string[] = []
    
    for (const item of cartContext.state.items) {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.productId })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const product = data.data.product
            const availableStock = item.productVariantId
              ? product.variants.find((v: any) => v.id === item.productVariantId)?.stockQuantity || 0
              : product.stockQuantity

            if (availableStock < item.quantity) {
              outOfStockItems.push(item.product.nameJa)
            }
          }
        }
      } catch (error) {
        console.error('Stock check failed for item:', item.id, error)
      }
    }

    return {
      hasOutOfStock: outOfStockItems.length > 0,
      outOfStockItems
    }
  }, [cartContext.state.items])

  // バルク操作：複数商品を一度に追加
  const addMultipleToCart = useCallback(async (items: Array<{
    productId: string
    quantity: number
    productVariantId?: string
  }>) => {
    for (const item of items) {
      await cartContext.addToCart(item.productId, item.quantity, item.productVariantId)
    }
  }, [cartContext])

  // カートの内容をエクスポート（注文時などに使用）
  const exportCartData = useCallback(() => {
    return {
      items: cartContext.state.items.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.product.price + (item.productVariant?.priceModifier || 0),
        totalPrice: (item.product.price + (item.productVariant?.priceModifier || 0)) * item.quantity
      })),
      summary: {
        subtotal: cartContext.state.totalAmount,
        tax: Math.round(cartContext.state.totalAmount * 0.1),
        shipping: getShippingCost(),
        total: getFinalTotal()
      }
    }
  }, [cartContext.state, getShippingCost, getFinalTotal])

  return {
    // 基本的なカート操作
    ...cartContext,
    
    // 拡張機能
    isInCart,
    getItemQuantity,
    getItemId,
    getItemTotal,
    getCartStats,
    getTaxIncludedAmount,
    getShippingCost,
    getFinalTotal,
    getAmountForFreeShipping,
    getItemsByCategory,
    checkStock,
    addMultipleToCart,
    exportCartData
  }
}

// 型エクスポート
export type { CartItem } from '@/contexts/CartContext'