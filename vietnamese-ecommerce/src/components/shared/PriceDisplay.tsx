'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  price: number
  originalPrice?: number
  currency?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showCurrency?: boolean
  showDiscount?: boolean
  discountType?: 'percentage' | 'amount'
  className?: string
  language?: 'ja' | 'vi'
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  currency = 'JPY',
  size = 'md',
  showCurrency = true,
  showDiscount = true,
  discountType = 'percentage',
  className,
  language = 'ja'
}) => {
  // サイズに応じたスタイル
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  // 割引率を計算
  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  // 割引額を計算
  const discountAmount = originalPrice && originalPrice > price
    ? originalPrice - price
    : 0

  // 通貨記号を取得
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'JPY':
        return '¥'
      case 'VND':
        return '₫'
      case 'USD':
        return '$'
      default:
        return curr
    }
  }

  // 価格をフォーマット
  const formatPrice = (amount: number, curr: string = currency) => {
    const symbol = getCurrencySymbol(curr)
    
    if (curr === 'VND') {
      // ベトナムドンの場合は千の位区切りを使用
      return `${amount.toLocaleString('vi-VN')}${symbol}`
    } else {
      // 日本円の場合
      return `${symbol}${amount.toLocaleString('ja-JP')}`
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* メイン価格 */}
      <span className={cn(
        'font-bold text-red-600',
        sizeClasses[size]
      )}>
        {showCurrency ? formatPrice(price) : price.toLocaleString()}
      </span>

      {/* 元の価格（割引がある場合） */}
      {originalPrice && originalPrice > price && (
        <span className={cn(
          'text-gray-500 line-through',
          size === 'xl' ? 'text-lg' :
          size === 'lg' ? 'text-base' :
          size === 'md' ? 'text-sm' :
          size === 'sm' ? 'text-xs' : 'text-xs'
        )}>
          {showCurrency ? formatPrice(originalPrice) : originalPrice.toLocaleString()}
        </span>
      )}

      {/* 割引表示 */}
      {showDiscount && discountPercentage > 0 && (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
          {discountType === 'percentage' ? (
            `${discountPercentage}%${language === 'ja' ? 'OFF' : ' giảm'}`
          ) : (
            `${language === 'ja' ? '' : 'Giảm '}${formatPrice(discountAmount)}${language === 'ja' ? '引き' : ''}`
          )}
        </span>
      )}
    </div>
  )
}

// 価格範囲表示コンポーネント
interface PriceRangeProps {
  minPrice: number
  maxPrice: number
  currency?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showCurrency?: boolean
  className?: string
  language?: 'ja' | 'vi'
}

export const PriceRange: React.FC<PriceRangeProps> = ({
  minPrice,
  maxPrice,
  currency = 'JPY',
  size = 'md',
  showCurrency = true,
  className,
  language = 'ja'
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'JPY':
        return '¥'
      case 'VND':
        return '₫'
      case 'USD':
        return '$'
      default:
        return curr
    }
  }

  const formatPrice = (amount: number) => {
    const symbol = getCurrencySymbol(currency)
    
    if (currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')}${symbol}`
    } else {
      return `${symbol}${amount.toLocaleString('ja-JP')}`
    }
  }

  if (minPrice === maxPrice) {
    return (
      <span className={cn('font-bold text-red-600', sizeClasses[size], className)}>
        {showCurrency ? formatPrice(minPrice) : minPrice.toLocaleString()}
      </span>
    )
  }

  return (
    <span className={cn('font-bold text-red-600', sizeClasses[size], className)}>
      {showCurrency ? formatPrice(minPrice) : minPrice.toLocaleString()}
      <span className="mx-1 text-gray-500">-</span>
      {showCurrency ? formatPrice(maxPrice) : maxPrice.toLocaleString()}
    </span>
  )
}

// 税込み価格表示コンポーネント
interface TaxIncludedPriceProps {
  price: number
  taxRate?: number
  currency?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showTaxInfo?: boolean
  className?: string
  language?: 'ja' | 'vi'
}

export const TaxIncludedPrice: React.FC<TaxIncludedPriceProps> = ({
  price,
  taxRate = 0.1, // 日本の消費税10%
  currency = 'JPY',
  size = 'md',
  showTaxInfo = true,
  className,
  language = 'ja'
}) => {
  const taxAmount = Math.round(price * taxRate)
  const totalPrice = price + taxAmount

  return (
    <div className={cn('space-y-1', className)}>
      <PriceDisplay
        price={totalPrice}
        currency={currency}
        size={size}
        language={language}
      />
      {showTaxInfo && (
        <div className="text-xs text-gray-600">
          {language === 'ja' ? (
            <>
              (税抜き: ¥{price.toLocaleString()} + 税: ¥{taxAmount.toLocaleString()})
            </>
          ) : (
            <>
              (Chưa thuế: ₫{price.toLocaleString()} + Thuế: ₫{taxAmount.toLocaleString()})
            </>
          )}
        </div>
      )}
    </div>
  )
}

// 送料込み価格表示コンポーネント
interface ShippingIncludedPriceProps {
  price: number
  shippingCost: number
  freeShippingThreshold?: number
  currency?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showBreakdown?: boolean
  className?: string
  language?: 'ja' | 'vi'
}

export const ShippingIncludedPrice: React.FC<ShippingIncludedPriceProps> = ({
  price,
  shippingCost,
  freeShippingThreshold,
  currency = 'JPY',
  size = 'md',
  showBreakdown = true,
  className,
  language = 'ja'
}) => {
  const isFreeShipping = freeShippingThreshold && price >= freeShippingThreshold
  const actualShippingCost = isFreeShipping ? 0 : shippingCost
  const totalPrice = price + actualShippingCost

  return (
    <div className={cn('space-y-1', className)}>
      <PriceDisplay
        price={totalPrice}
        currency={currency}
        size={size}
        language={language}
      />
      {showBreakdown && (
        <div className="text-xs text-gray-600">
          {language === 'ja' ? (
            <>
              商品代金: ¥{price.toLocaleString()} + 
              送料: {isFreeShipping ? (
                <span className="text-green-600 font-medium">無料</span>
              ) : (
                `¥${shippingCost.toLocaleString()}`
              )}
            </>
          ) : (
            <>
              Giá sản phẩm: ₫{price.toLocaleString()} + 
              Phí ship: {isFreeShipping ? (
                <span className="text-green-600 font-medium">Miễn phí</span>
              ) : (
                `₫${shippingCost.toLocaleString()}`
              )}
            </>
          )}
        </div>
      )}
      {freeShippingThreshold && !isFreeShipping && (
        <div className="text-xs text-blue-600">
          {language === 'ja' ? (
            <>
              ¥{(freeShippingThreshold - price).toLocaleString()}以上で送料無料
            </>
          ) : (
            <>
              Mua thêm ₫{(freeShippingThreshold - price).toLocaleString()} để được miễn phí ship
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PriceDisplay