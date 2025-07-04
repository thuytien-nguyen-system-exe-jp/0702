'use client'

import React, { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils'

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

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
  limit: number
}

interface UserListProps {
  users: User[]
  pagination: Pagination
  loading?: boolean
  onPageChange: (page: number) => void
  onUserAction: (userId: string, action: string, data?: any) => void
  onRefresh: () => void
}

export function UserList({ 
  users, 
  pagination, 
  loading = false, 
  onPageChange, 
  onUserAction,
  onRefresh 
}: UserListProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    setActionLoading(userId)
    try {
      await onUserAction(userId, action, data)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return

    try {
      await onUserAction('', 'bulk', { action, userIds: selectedUsers })
      setSelectedUsers([])
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const getLanguageText = (language: string) => {
    switch (language) {
      case 'ja': return '日本語'
      case 'vi': return 'ベトナム語'
      default: return language
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー・バルクアクション */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                すべて選択 ({selectedUsers.length}件選択中)
              </span>
            </label>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  有効化
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  無効化
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  CSV出力
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {pagination.totalCount}件中 {((pagination.currentPage - 1) * pagination.limit) + 1}-
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}件を表示
          </div>
        </div>
      </div>

      {/* ユーザーリスト */}
      <div className="divide-y divide-gray-200">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            ユーザーが見つかりません
          </div>
        ) : (
          users.map((user) => {
            const displayName = user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email

            return (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* チェックボックス */}
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />

                  {/* アバター */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* ユーザー情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {displayName}
                      </h3>
                      
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {user.isActive ? '有効' : '無効'}
                      </span>
                      
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        user.emailVerified
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      )}>
                        {user.emailVerified ? 'メール認証済み' : 'メール未認証'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      {user.email}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>言語: {getLanguageText(user.preferredLanguage)}</span>
                      <span>注文数: {user._count.orders}件</span>
                      <span>登録日: {formatDate(user.createdAt)}</span>
                      {user.lastLoginAt && (
                        <span>最終ログイン: {formatDate(user.lastLoginAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* アクション */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      {/* ステータス切り替え */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === user.id}
                        onClick={() => handleUserAction(
                          user.id, 
                          user.isActive ? 'deactivate' : 'activate'
                        )}
                      >
                        {user.isActive ? '無効化' : '有効化'}
                      </Button>
                      
                      {/* メール認証 */}
                      {!user.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === user.id}
                          onClick={() => handleUserAction(user.id, 'sendVerificationEmail')}
                        >
                          認証メール送信
                        </Button>
                      )}
                      
                      {/* パスワードリセット */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === user.id}
                        onClick={() => handleUserAction(user.id, 'sendPasswordReset')}
                      >
                        パスワードリセット
                      </Button>
                      
                      {/* 詳細表示 */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // ユーザー詳細モーダルまたはページを開く
                          console.log('Show user details:', user.id)
                        }}
                      >
                        詳細
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              ページ {pagination.currentPage} / {pagination.totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => onPageChange(pagination.currentPage - 1)}
              >
                前へ
              </Button>
              
              {/* ページ番号 */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + Math.max(1, pagination.currentPage - 2)
                  if (page > pagination.totalPages) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={cn(
                        'px-3 py-1 text-sm rounded',
                        page === pagination.currentPage
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => onPageChange(pagination.currentPage + 1)}
              >
                次へ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}