'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavigationItem {
  href: string
  label: {
    ja: string
    vi: string
  }
  icon?: React.ReactNode
}

interface NavigationProps {
  items?: NavigationItem[]
  language?: 'ja' | 'vi'
  className?: string
  mobile?: boolean
}

const defaultNavigationItems: NavigationItem[] = [
  {
    href: '/products',
    label: { ja: '商品一覧', vi: 'Sản phẩm' }
  },
  {
    href: '/categories',
    label: { ja: 'カテゴリ', vi: 'Danh mục' }
  },
  {
    href: '/recipes',
    label: { ja: 'レシピ', vi: 'Công thức' }
  },
  {
    href: '/about',
    label: { ja: '会社概要', vi: 'Giới thiệu' }
  }
]

const Navigation: React.FC<NavigationProps> = ({
  items = defaultNavigationItems,
  language = 'ja',
  className,
  mobile = false
}) => {
  const pathname = usePathname()

  if (mobile) {
    return (
      <nav className={cn('flex flex-col space-y-2', className)}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block px-4 py-2 text-base font-medium rounded-md transition-colors',
              pathname === item.href
                ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
            )}
          >
            <div className="flex items-center">
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label[language]}
            </div>
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className={cn('hidden md:flex space-x-8', className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors relative py-2',
            pathname === item.href
              ? 'text-red-600'
              : 'text-gray-700 hover:text-red-600'
          )}
        >
          {item.label[language]}
          {pathname === item.href && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
          )}
        </Link>
      ))}
    </nav>
  )
}

// モバイルメニューコンポーネント
const MobileMenu: React.FC<{
  isOpen: boolean
  onClose: () => void
  items?: NavigationItem[]
  language?: 'ja' | 'vi'
}> = ({ isOpen, onClose, items = defaultNavigationItems, language = 'ja' }) => {
  if (!isOpen) return null

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="text-xl font-bold text-red-600" onClick={onClose}>
            VietFood Market
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <Navigation items={items} language={language} mobile />
          <div className="mt-6 pt-6 border-t">
            <div className="space-y-2">
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={onClose}
              >
                {language === 'ja' ? 'ログイン' : 'Đăng nhập'}
              </Link>
              <Link
                href="/auth/register"
                className="block px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md text-center"
                onClick={onClose}
              >
                {language === 'ja' ? '会員登録' : 'Đăng ký'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ハンバーガーメニューボタン
const MobileMenuButton: React.FC<{
  onClick: () => void
  className?: string
}> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'md:hidden p-2 text-gray-700 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md',
        className
      )}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

export { Navigation, MobileMenu, MobileMenuButton }
export type { NavigationItem, NavigationProps }