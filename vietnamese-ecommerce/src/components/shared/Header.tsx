'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Navigation, MobileMenu, MobileMenuButton } from './Navigation'
import { Button } from './Button'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface HeaderProps {
  language?: 'ja' | 'vi'
  onLanguageChange?: (language: 'ja' | 'vi') => void
  cartItemCount?: number
  isAuthenticated?: boolean
  userInfo?: {
    name: string
    avatar?: string
  }
  className?: string
}

const Header: React.FC<HeaderProps> = ({
  language = 'ja',
  onLanguageChange,
  cartItemCount,
  isAuthenticated = false,
  userInfo,
  className
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false)
  
  // カート状態を取得（CartProviderが利用可能な場合のみ）
  let cartState = null
  try {
    cartState = useCart().state
  } catch (error) {
    // CartProviderが設定されていない場合は無視
  }
  
  // propsで渡されたcartItemCountがあればそれを使用、なければカート状態から取得
  const actualCartItemCount = cartItemCount !== undefined ? cartItemCount : (cartState?.totalItems || 0)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  const handleLanguageChange = (newLanguage: 'ja' | 'vi') => {
    onLanguageChange?.(newLanguage)
  }

  return (
    <>
      <header className={cn('bg-white shadow-sm sticky top-0 z-40', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center">
              <MobileMenuButton onClick={toggleMobileMenu} />
              <Link href="/" className="text-2xl font-bold text-red-600 ml-2 md:ml-0">
                VietFood Market
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <Navigation language={language} />

            {/* 右側のアクション */}
            <div className="flex items-center space-x-4">
              {/* 検索ボタン */}
              <button className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* カートボタン */}
              <div className="relative">
                <Link href="/cart" className="text-gray-700 hover:text-red-600 relative p-2 rounded-md transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                  </svg>
                  {actualCartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {actualCartItemCount > 99 ? '99+' : actualCartItemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* 言語切り替え */}
              <div className="hidden sm:flex space-x-1">
                <button
                  onClick={() => handleLanguageChange('ja')}
                  className={cn(
                    'px-2 py-1 text-xs border rounded transition-colors',
                    language === 'ja'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  日本語
                </button>
                <button
                  onClick={() => handleLanguageChange('vi')}
                  className={cn(
                    'px-2 py-1 text-xs border rounded transition-colors',
                    language === 'vi'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  Tiếng Việt
                </button>
              </div>

              {/* ユーザーメニュー */}
              {isAuthenticated && userInfo ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
                  >
                    {userInfo.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {userInfo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="hidden md:block text-sm">{userInfo.name}</span>
                  </button>

                  {/* ユーザードロップダウンメニュー */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {language === 'ja' ? 'プロフィール' : 'Hồ sơ'}
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {language === 'ja' ? '注文履歴' : 'Lịch sử đơn hàng'}
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {language === 'ja' ? 'お気に入り' : 'Yêu thích'}
                      </Link>
                      <hr className="my-1" />
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          // ログアウト処理
                        }}
                      >
                        {language === 'ja' ? 'ログアウト' : 'Đăng xuất'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      {language === 'ja' ? 'ログイン' : 'Đăng nhập'}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">
                      {language === 'ja' ? '会員登録' : 'Đăng ký'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        language={language}
      />

      {/* オーバーレイ（ユーザーメニューを閉じるため） */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  )
}

export { Header }
export type { HeaderProps }