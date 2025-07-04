'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './Button'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    sku: string
    nameJa: string
    nameVi: string
    price: number
    stockQuantity: number
    spiceLevel: number | null
    isFeatured: boolean
    category: {
      nameJa: string
      nameVi: string
      slug: string
    }
    brand?: {
      name: string
      slug: string
    }
    images: {
      imageUrl: string
      altText: string | null
    }[]
    averageRating: number
    reviewCount: number
    variants?: {
      id: string
      name: string
      value: string
      priceModifier: number
      stockQuantity: number
    }[]
  }
  language?: 'ja' | 'vi'
  showQuickAdd?: boolean
  className?: string
  onAddToCart?: (productId: string, quantity: number, variantId?: string) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language = 'ja',
  showQuickAdd = true,
  className,
  onAddToCart
}) => {
  const { addToCart, isInCart, getItemQuantity, state } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string>('')

  const productName = language === 'ja' ? product.nameJa : product.nameVi
  const categoryName = language === 'ja' ? product.category.nameJa : product.category.nameVi

  // 選択されたバリアントの情報を取得
  const variant = selectedVariant 
    ? product.variants?.find(v => v.id === selectedVariant)
    : undefined

  // 実際の価格を計算
  const actualPrice = product.price + (variant?.priceModifier || 0)

  // 在庫数を取得
  const availableStock = variant?.stockQuantity ?? product.stockQuantity

  // カートに追加処理
  const handleAddToCart = async () => {
    if (isAdding || availableStock === 0) return

    try {
      setIsAdding(true)
      
      if (onAddToCart) {
        onAddToCart(product.id, 1, selectedVariant || undefined)
      } else {
        await addToCart(product.id, 1, selectedVariant || undefined)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // カート内の数量を取得
  const cartQuantity = getItemQuantity(product.id, selectedVariant || undefined)

  return (
    <div className={cn(
      'product-card group',
      className
    )}>
      {/* 商品画像 */}
      <div className="aspect-square bg-gradient-warm rounded-t-xl relative overflow-hidden">
        <Link href={`/products/${product.sku}`}>
          {product.images.length > 0 ? (
            <Image
              src={product.images[0].imageUrl}
              alt={product.images[0].altText || productName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🥢
            </div>
          )}
        </Link>

        {/* バッジ */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
              {language === 'ja' ? 'おすすめ' : 'Đề xuất'}
            </span>
          )}
          {availableStock === 0 && (
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded font-medium">
              {language === 'ja' ? '在庫切れ' : 'Hết hàng'}
            </span>
          )}
          {availableStock > 0 && availableStock <= 5 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">
              {language === 'ja' ? '残りわずか' : 'Sắp hết'}
            </span>
          )}
        </div>

        {/* カート数量表示 */}
        {cartQuantity > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
            {cartQuantity}
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="p-4">
        {/* カテゴリ・ブランド */}
        <div className="mb-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {categoryName}
          </span>
          {product.brand && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {product.brand.name}
            </span>
          )}
        </div>

        {/* 商品名 */}
        <Link href={`/products/${product.sku}`}>
          <h3 className="font-semibold mb-2 text-sm line-clamp-2 hover:text-red-600 transition-colors">
            {productName}
          </h3>
        </Link>

        {/* バリアント選択 */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">
                {language === 'ja' ? 'サイズを選択' : 'Chọn kích thước'}
              </option>
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.value} 
                  {variant.priceModifier !== 0 && (
                    <span className="ml-1">
                      ({variant.priceModifier > 0 ? '+' : ''}¥{variant.priceModifier})
                    </span>
                  )}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 価格・辛さレベル */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="price-display text-lg">
              ¥{actualPrice.toLocaleString()}
            </span>
            {variant?.priceModifier !== 0 && (
              <span className="text-xs text-gray-500 line-through">
                ¥{product.price.toLocaleString()}
              </span>
            )}
          </div>
          {product.spiceLevel && product.spiceLevel > 0 && (
            <div className="flex items-center spice-indicator">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < product.spiceLevel! ? 'text-red-500' : 'text-gray-300'}`}
                >
                  🌶️
                </span>
              ))}
            </div>
          )}
        </div>

        {/* レビュー */}
        {product.reviewCount > 0 && (
          <div className="flex items-center mb-3 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{product.averageRating}</span>
            </div>
            <span className="ml-2 text-xs">
              ({product.reviewCount}{language === 'ja' ? '件' : ' đánh giá'})
            </span>
          </div>
        )}

        {/* 在庫情報 */}
        <div className="mb-3 text-xs text-gray-600">
          {availableStock > 0 ? (
            <span>
              {language === 'ja' ? '在庫' : 'Còn lại'}: {availableStock}{language === 'ja' ? '個' : ' sản phẩm'}
            </span>
          ) : (
            <span className="text-red-600">
              {language === 'ja' ? '在庫切れ' : 'Hết hàng'}
            </span>
          )}
        </div>

        {/* アクションボタン */}
        {showQuickAdd && (
          <div className="space-y-2">
            <Button
              className="w-full hover-lift"
              size="sm"
              disabled={availableStock === 0 || isAdding || state.isLoading}
              onClick={handleAddToCart}
            >
              {isAdding || state.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  {language === 'ja' ? '追加中...' : 'Đang thêm...'}
                </div>
              ) : availableStock === 0 ? (
                language === 'ja' ? '在庫切れ' : 'Hết hàng'
              ) : cartQuantity > 0 ? (
                language === 'ja' ? 'さらに追加' : 'Thêm nữa'
              ) : (
                language === 'ja' ? 'カートに追加' : 'Thêm vào giỏ'
              )}
            </Button>

            <Link href={`/products/${product.sku}`}>
              <Button variant="outline" size="sm" className="w-full hover-lift">
                {language === 'ja' ? '詳細を見る' : 'Xem chi tiết'}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard