'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  showValue?: boolean
  showCount?: boolean
  reviewCount?: number
  precision?: number
  onChange?: (rating: number) => void
  className?: string
  language?: 'ja' | 'vi'
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showValue = false,
  showCount = false,
  reviewCount,
  precision = 1,
  onChange,
  className,
  language = 'ja'
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  // サイズに応じたスタイル
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  // 星をクリックした時の処理
  const handleStarClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue)
    }
  }

  // 星にホバーした時の処理
  const handleStarHover = (starValue: number) => {
    if (interactive) {
      setHoverRating(starValue)
    }
  }

  // ホバーを離れた時の処理
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null)
    }
  }

  // 表示する評価値（ホバー中はホバー値、そうでなければ実際の評価値）
  const displayRating = hoverRating !== null ? hoverRating : rating

  // 星の配列を生成
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1
    const isFilled = starValue <= displayRating
    const isPartiallyFilled = starValue > displayRating && starValue - 1 < displayRating
    const fillPercentage = isPartiallyFilled ? ((displayRating - (starValue - 1)) * 100) : 0

    return (
      <div
        key={index}
        className={cn(
          'relative cursor-pointer transition-transform',
          interactive && 'hover:scale-110',
          !interactive && 'cursor-default'
        )}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
      >
        {/* 背景の星（空の星） */}
        <svg
          className={cn(
            sizeClasses[size],
            'text-gray-300'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* 塗りつぶしの星 */}
        {(isFilled || isPartiallyFilled) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              width: isPartiallyFilled ? `${fillPercentage}%` : '100%'
            }}
          >
            <svg
              className={cn(
                sizeClasses[size],
                'text-yellow-400'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>
    )
  })

  return (
    <div 
      className={cn('flex items-center gap-1', className)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 星の表示 */}
      <div className="flex items-center gap-0.5">
        {stars}
      </div>

      {/* 評価値の表示 */}
      {showValue && (
        <span className={cn(
          'font-medium text-gray-700 ml-1',
          textSizeClasses[size]
        )}>
          {displayRating.toFixed(precision === 1 ? 0 : 1)}
        </span>
      )}

      {/* レビュー数の表示 */}
      {showCount && reviewCount !== undefined && (
        <span className={cn(
          'text-gray-500 ml-1',
          size === 'xs' ? 'text-xs' : 'text-sm'
        )}>
          ({reviewCount}{language === 'ja' ? '件' : ' đánh giá'})
        </span>
      )}
    </div>
  )
}

// 評価分布表示コンポーネント
interface RatingDistributionProps {
  distribution: Array<{
    star: number
    count: number
  }>
  totalReviews: number
  className?: string
  language?: 'ja' | 'vi'
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  totalReviews,
  className,
  language = 'ja'
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((star) => {
        const item = distribution.find(d => d.star === star)
        const count = item?.count || 0
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 w-12">
              <span>{star}</span>
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <span className="text-gray-600 w-8 text-right">
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// 簡易評価表示コンポーネント
interface SimpleRatingProps {
  rating: number
  maxRating?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export const SimpleRating: React.FC<SimpleRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'sm',
  className
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('text-yellow-500', sizeClasses[size])}>★</span>
      <span className={cn('font-medium text-gray-700', sizeClasses[size])}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

// 評価入力フォームコンポーネント
interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  required?: boolean
  disabled?: boolean
  className?: string
  language?: 'ja' | 'vi'
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  size = 'md',
  required = false,
  disabled = false,
  className,
  language = 'ja'
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {language === 'ja' ? '評価' : 'Đánh giá'}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <StarRating
        rating={value}
        interactive={!disabled}
        onChange={onChange}
        size={size}
        showValue
        language={language}
      />
      
      {value === 0 && required && (
        <p className="text-red-500 text-xs">
          {language === 'ja' ? '評価を選択してください' : 'Vui lòng chọn đánh giá'}
        </p>
      )}
    </div>
  )
}

export default StarRating