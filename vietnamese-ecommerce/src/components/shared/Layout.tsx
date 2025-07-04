'use client'

import React, { useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  headerProps?: {
    cartItemCount?: number
    isAuthenticated?: boolean
    userInfo?: {
      name: string
      avatar?: string
    }
  }
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showHeader = true,
  showFooter = true,
  headerProps = {}
}) => {
  const [language, setLanguage] = useState<'ja' | 'vi'>('ja')

  // 言語設定をローカルストレージから読み込み
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'ja' | 'vi'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // 言語変更ハンドラー
  const handleLanguageChange = (newLanguage: 'ja' | 'vi') => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    
    // HTMLのlang属性を更新
    document.documentElement.lang = newLanguage === 'ja' ? 'ja' : 'vi'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeader && (
        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          {...headerProps}
        />
      )}
      
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      
      {showFooter && (
        <Footer language={language} />
      )}
    </div>
  )
}

// 管理者レイアウト用のコンポーネント
const AdminLayout: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">管理画面</h2>
          </div>
          <nav className="mt-6">
            <div className="px-3">
              <ul className="space-y-1">
                <li>
                  <a
                    href="/admin"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    ダッシュボード
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/products"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    商品管理
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/orders"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    注文管理
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/users"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    ユーザー管理
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className={cn('flex-1 p-8', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}

// 認証ページ用のシンプルなレイアウト
const AuthLayout: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={cn('max-w-md w-full space-y-8', className)}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">VietFood Market</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

// エラーページ用のレイアウト
const ErrorLayout: React.FC<{
  children: React.ReactNode
  showBackButton?: boolean
  className?: string
}> = ({ children, showBackButton = true, className }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className={cn('max-w-md w-full text-center', className)}>
        {children}
        {showBackButton && (
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { Layout, AdminLayout, AuthLayout, ErrorLayout }
export type { LayoutProps }