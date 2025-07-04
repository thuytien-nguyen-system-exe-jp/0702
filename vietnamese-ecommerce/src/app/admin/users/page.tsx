'use client'

import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { UserList } from '@/components/admin/UserList'
import { Button } from '@/components/shared/Button'
import { Loading } from '@/components/shared/Loading'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  preferredLanguage: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
  _count: {
    orders: number
  }
}

interface UsersData {
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
    limit: number
  }
}

export default function AdminUsers() {
  const [data, setData] = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    language: '',
    emailVerified: '',
    page: 1
  })

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        action: 'users',
        page: filters.page.toString(),
        limit: '20'
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.language) params.append('language', filters.language)
      if (filters.emailVerified) params.append('emailVerified', filters.emailVerified)

      const response = await fetch(`/api/admin?${params}`)
      
      if (!response.ok) {
        throw new Error('ユーザーデータの取得に失敗しました')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'ユーザーデータの取得に失敗しました')
      }
    } catch (error) {
      console.error('Users fetch error:', error)
      setError('ユーザーデータの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId,
          ...data
        }),
      })

      const result = await response.json()

      if (result.success) {
        fetchUsers() // リフレッシュ
      } else {
        throw new Error(result.error || 'ユーザー操作に失敗しました')
      }
    } catch (error) {
      console.error('User action error:', error)
      alert('ユーザー操作に失敗しました')
    }
  }

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers}>再読み込み</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="text-gray-600 mt-2">ユーザーの管理、ステータス変更を行えます</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={fetchUsers}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              更新
            </Button>
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV出力
            </Button>
          </div>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="名前、メールアドレスで検索..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべて</option>
                <option value="active">有効</option>
                <option value="inactive">無効</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                言語設定
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべて</option>
                <option value="ja">日本語</option>
                <option value="vi">ベトナム語</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メール認証
              </label>
              <select
                value={filters.emailVerified}
                onChange={(e) => handleFilterChange('emailVerified', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべて</option>
                <option value="true">認証済み</option>
                <option value="false">未認証</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchUsers} className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                更新
              </Button>
            </div>
          </div>
        </div>

        {/* ユーザーリスト */}
        {data && (
          <UserList
            users={data.users}
            pagination={data.pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onUserAction={handleUserAction}
            onRefresh={fetchUsers}
          />
        )}
      </div>
    </AdminLayout>
  )
}