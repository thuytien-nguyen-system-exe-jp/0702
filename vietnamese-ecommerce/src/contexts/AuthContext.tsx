'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, LoginCredentials, RegisterData } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // 認証状態をチェック（静的サイト用）
  const checkAuthStatus = async () => {
    try {
      // 静的サイトでは認証機能は無効
      // ローカルストレージから状態を復元（オプション）
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ログイン（静的サイト用 - デモ機能）
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // 静的サイトでは実際の認証は行わない
      // デモ用のダミーユーザー
      if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
        const demoUser = {
          id: 'demo-user',
          email: 'demo@example.com',
          firstName: 'デモ',
          lastName: 'ユーザー',
          preferredLanguage: 'ja' as const,
          avatarUrl: undefined
        }
        setUser(demoUser)
        localStorage.setItem('auth_user', JSON.stringify(demoUser))
        return { success: true }
      } else {
        return { success: false, error: '静的サイトではデモ用ログインのみ利用可能です（demo@example.com / demo123）' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'ログインエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  // 登録（静的サイト用 - 無効化）
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      return { success: false, error: '静的サイトでは新規登録は利用できません' }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: '登録機能は利用できません' }
    } finally {
      setIsLoading(false)
    }
  }

  // ログアウト（静的サイト用）
  const logout = async () => {
    try {
      setIsLoading(true)
      setUser(null)
      localStorage.removeItem('auth_user')
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // ユーザー情報を再取得
  const refreshUser = async () => {
    await checkAuthStatus()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// カスタムフック
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 管理者認証用のコンテキスト
interface AdminAuthContextType {
  admin: any | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!admin

  // 初期化時に管理者情報を取得
  useEffect(() => {
    checkAdminAuthStatus()
  }, [])

  // 管理者認証状態をチェック（静的サイト用 - 無効化）
  const checkAdminAuthStatus = async () => {
    try {
      // 静的サイトでは管理者機能は無効
      setAdmin(null)
    } catch (error) {
      console.error('Admin auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 管理者ログイン（静的サイト用 - 無効化）
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      return { success: false, error: '静的サイトでは管理者機能は利用できません' }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: '管理者機能は利用できません' }
    } finally {
      setIsLoading(false)
    }
  }

  // 管理者ログアウト（静的サイト用）
  const logout = async () => {
    try {
      setIsLoading(true)
      setAdmin(null)
    } catch (error) {
      console.error('Admin logout error:', error)
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// 管理者認証用カスタムフック
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}