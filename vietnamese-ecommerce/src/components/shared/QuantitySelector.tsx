'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showInput?: boolean
  onChange: (value: number) => void
  onBlur?: () => void
  className?: string
  language?: 'ja' | 'vi'
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = 'md',
  showInput = true,
  onChange,
  onBlur,
  className,
  language = 'ja'
}) => {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isFocused, setIsFocused] = useState(false)

  // 外部からのvalue変更を反映
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString())
    }
  }, [value, isFocused])

  // サイズに応じたスタイル
  const sizeClasses = {
    sm: {
      button: 'h-8 w-8 text-sm',
      input: 'h-8 text-sm px-2',
      container: 'gap-1'
    },
    md: {
      button: 'h-10 w-10 text-base',
      input: 'h-10 text-base px-3',
      container: 'gap-2'
    },
    lg: {
      button: 'h-12 w-12 text-lg',
      input: 'h-12 text-lg px-4',
      container: 'gap-3'
    }
  }

  const currentSize = sizeClasses[size]

  // 値を増加
  const increment = () => {
    const newValue = Math.min(max, value + step)
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  // 値を減少
  const decrement = () => {
    const newValue = Math.max(min, value - step)
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  // 入力値の変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)

    // 数値のみ許可
    if (/^\d*$/.test(inputVal)) {
      const numValue = parseInt(inputVal) || 0
      if (numValue >= min && numValue <= max) {
        onChange(numValue)
      }
    }
  }

  // 入力フィールドのフォーカス処理
  const handleInputFocus = () => {
    setIsFocused(true)
  }

  // 入力フィールドのブラー処理
  const handleInputBlur = () => {
    setIsFocused(false)
    
    // 値を正規化
    let numValue = parseInt(inputValue) || min
    numValue = Math.max(min, Math.min(max, numValue))
    
    setInputValue(numValue.toString())
    
    if (numValue !== value) {
      onChange(numValue)
    }
    
    onBlur?.()
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      increment()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      decrement()
    } else if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  // 最小値・最大値チェック
  const canDecrement = value > min && !disabled
  const canIncrement = value < max && !disabled

  return (
    <div className={cn(
      'flex items-center',
      currentSize.container,
      className
    )}>
      {/* 減少ボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={!canDecrement}
        onClick={decrement}
        className={cn(
          'flex-shrink-0 rounded-full border-gray-300 hover:border-red-500 hover:text-red-600',
          currentSize.button,
          !canDecrement && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={language === 'ja' ? '数量を減らす' : 'Giảm số lượng'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>

      {/* 数量表示/入力 */}
      {showInput ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'border border-gray-300 rounded text-center font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
            currentSize.input,
            'w-16 min-w-0',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          aria-label={language === 'ja' ? '数量' : 'Số lượng'}
          min={min}
          max={max}
        />
      ) : (
        <div className={cn(
          'flex items-center justify-center font-medium text-gray-900',
          currentSize.input,
          'w-16 min-w-0'
        )}>
          {value}
        </div>
      )}

      {/* 増加ボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={!canIncrement}
        onClick={increment}
        className={cn(
          'flex-shrink-0 rounded-full border-gray-300 hover:border-red-500 hover:text-red-600',
          currentSize.button,
          !canIncrement && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={language === 'ja' ? '数量を増やす' : 'Tăng số lượng'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </Button>
    </div>
  )
}

// プリセット数量選択ボタン
interface QuickQuantityProps {
  quantities: number[]
  currentQuantity: number
  onSelect: (quantity: number) => void
  disabled?: boolean
  className?: string
  language?: 'ja' | 'vi'
}

export const QuickQuantity: React.FC<QuickQuantityProps> = ({
  quantities,
  currentQuantity,
  onSelect,
  disabled = false,
  className,
  language = 'ja'
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <span className="text-sm text-gray-600 self-center">
        {language === 'ja' ? 'よく使う数量:' : 'Số lượng thường dùng:'}
      </span>
      {quantities.map((qty) => (
        <Button
          key={qty}
          variant={currentQuantity === qty ? 'primary' : 'outline'}
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(qty)}
          className="min-w-0 px-3"
        >
          {qty}
        </Button>
      ))}
    </div>
  )
}

// 在庫表示付き数量選択
interface StockQuantitySelectorProps extends QuantitySelectorProps {
  stockQuantity: number
  showStockInfo?: boolean
}

export const StockQuantitySelector: React.FC<StockQuantitySelectorProps> = ({
  stockQuantity,
  showStockInfo = true,
  max,
  language = 'ja',
  ...props
}) => {
  const actualMax = Math.min(max || 99, stockQuantity)
  
  return (
    <div className="space-y-2">
      <QuantitySelector
        {...props}
        max={actualMax}
        language={language}
      />
      
      {showStockInfo && (
        <div className="text-xs text-gray-600">
          {stockQuantity > 0 ? (
            <span>
              {language === 'ja' ? '在庫' : 'Còn lại'}: {stockQuantity}
              {language === 'ja' ? '個' : ' sản phẩm'}
            </span>
          ) : (
            <span className="text-red-600">
              {language === 'ja' ? '在庫切れ' : 'Hết hàng'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default QuantitySelector