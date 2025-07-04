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

  // 認証状態をチェック
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.user) {
          setUser(data.data.user)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ログイン
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (data.success && data.data.user) {
        setUser(data.data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'ログインに失敗しました' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'ネットワークエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  // 登録
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success && result.data.user) {
        setUser(result.data.user)
        return { success: true }
      } else {
        return { success: false, error: result.error || '登録に失敗しました' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'ネットワークエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  // ログアウト
  const logout = async () => {
    try {
      setIsLoading(true)
      
      await fetch('/api/auth?action=logout', {
        method: 'POST',
        credentials: 'include'
      })

      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // エラーが発生してもローカル状態はクリア
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

  // 管理者認証状態をチェック
  const checkAdminAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.admin) {
          setAdmin(data.data.admin)
        }
      }
    } catch (error) {
      console.error('Admin auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 管理者ログイン
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          ...credentials
        })
      })

      const data = await response.json()

      if (data.success && data.data.admin) {
        setAdmin(data.data.admin)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'ログインに失敗しました' }
      }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: 'ネットワークエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  // 管理者ログアウト
  const logout = async () => {
    try {
      setIsLoading(true)
      
      await fetch('/api/auth?action=logout', {
        method: 'POST',
        credentials: 'include'
      })

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