'use client'

import { useAuth as useAuthContext } from '@/contexts/AuthContext'

// 基本的な認証フック（コンテキストの再エクスポート）
export const useAuth = useAuthContext

// 追加のユーティリティフック
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading
  }
}

// ログイン状態に基づくリダイレクト処理
export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  
  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }
  
  const redirectToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }
  
  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin()
      return false
    }
    return true
  }
  
  const requireGuest = () => {
    if (!isLoading && isAuthenticated) {
      redirectToDashboard()
      return false
    }
    return true
  }
  
  return {
    redirectToLogin,
    redirectToDashboard,
    requireAuth,
    requireGuest,
    isLoading
  }
}

// ユーザー権限チェック
export function usePermissions() {
  const { user } = useAuth()
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // 基本的な権限チェック（必要に応じて拡張）
    switch (permission) {
      case 'view_profile':
        return true
      case 'edit_profile':
        return true
      case 'place_order':
        return true
      case 'view_orders':
        return true
      default:
        return false
    }
  }
  
  const canAccessRoute = (route: string): boolean => {
    if (!user) return false
    
    // ルートベースのアクセス制御
    const protectedRoutes = [
      '/profile',
      '/orders',
      '/wishlist',
      '/addresses'
    ]
    
    return protectedRoutes.includes(route)
  }
  
  return {
    hasPermission,
    canAccessRoute,
    isLoggedIn: !!user
  }
}

// フォーム状態管理用フック
export function useAuthForm() {
  const { login, register, isLoading } = useAuth()
  
  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password })
    return result
  }
  
  const handleRegister = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    preferredLanguage?: string
  }) => {
    const result = await register(data)
    return result
  }
  
  return {
    handleLogin,
    handleRegister,
    isLoading
  }
}

// ローカルストレージとの同期
export function useAuthStorage() {
  const { user, logout } = useAuth()
  
  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('token')
    }
  }
  
  const saveUserPreferences = (preferences: Record<string, any>) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferences))
    }
  }
  
  const getUserPreferences = (): Record<string, any> | null => {
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem(`user_preferences_${user.id}`)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }
  
  const handleLogoutWithCleanup = async () => {
    clearAuthData()
    await logout()
  }
  
  return {
    clearAuthData,
    saveUserPreferences,
    getUserPreferences,
    handleLogoutWithCleanup
  }
}

// セッション管理
export function useSession() {
  const { user, refreshUser, logout } = useAuth()
  
  const checkSessionValidity = async () => {
    try {
      await refreshUser()
      return true
    } catch (error) {
      console.error('Session check failed:', error)
      await logout()
      return false
    }
  }
  
  const extendSession = async () => {
    // セッション延長のロジック（必要に応じて実装）
    return await checkSessionValidity()
  }
  
  return {
    user,
    checkSessionValidity,
    extendSession,
    isSessionValid: !!user
  }
}

// 多言語対応
export function useAuthLanguage() {
  const { user } = useAuth()
  
  const getPreferredLanguage = (): 'ja' | 'vi' => {
    return user?.preferredLanguage as 'ja' | 'vi' || 'ja'
  }
  
  const isJapanese = getPreferredLanguage() === 'ja'
  const isVietnamese = getPreferredLanguage() === 'vi'
  
  return {
    preferredLanguage: getPreferredLanguage(),
    isJapanese,
    isVietnamese
  }
}