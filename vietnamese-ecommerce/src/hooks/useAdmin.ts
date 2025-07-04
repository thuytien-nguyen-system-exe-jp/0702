'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions: any
}

export function useAdmin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdmin(data.data.admin)
        } else {
          setError(data.error)
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      setError('認証エラーが発生しました')
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setAdmin(null)
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!admin || !admin.permissions) return false
    
    const permissions = admin.permissions as any
    return permissions[resource]?.[action] === true
  }

  return {
    admin,
    loading,
    error,
    logout,
    hasPermission,
    isAuthenticated: !!admin
  }
}