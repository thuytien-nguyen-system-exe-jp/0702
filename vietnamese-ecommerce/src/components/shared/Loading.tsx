import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <svg
        className={cn(
          'animate-spin text-red-600',
          sizeClasses[size]
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

// ページ全体のローディング
const PageLoading: React.FC<{ text?: string }> = ({ text = '読み込み中...' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  )
}

// インライン要素のローディング
const InlineLoading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('inline-flex items-center', className)}>
      <Loading size="sm" />
    </div>
  )
}

// カードローディング（スケルトン）
const CardLoading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export { Loading, PageLoading, InlineLoading, CardLoading }
export type { LoadingProps }