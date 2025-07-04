'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  user: {
    firstName: string | null
    lastName: string | null
    email: string
  }
  totalAmount: number
  status: string
  paymentStatus: string
  shippingStatus: string
  createdAt: string
  items: {
    product: {
      nameJa: string
      nameVi: string
    }
    quantity: number
    unitPrice: number
  }[]
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
  limit: number
}

interface OrderListProps {
  orders: Order[]
  pagination: Pagination
  loading?: boolean
  onPageChange: (page: number) => void
  onStatusUpdate: (orderId: string, status: string) => void
  onRefresh: () => void
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'shipped': return 'bg-purple-100 text-purple-800'
    case 'delivered': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending': return '注文確認中'
    case 'processing': return '処理中'
    case 'shipped': return '発送済み'
    case 'delivered': return '配達完了'
    case 'cancelled': return 'キャンセル'
    default: return status
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'paid': return 'bg-green-100 text-green-800'
    case 'failed': return 'bg-red-100 text-red-800'
    case 'refunded': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case 'pending': return '未払い'
    case 'paid': return '支払い済み'
    case 'failed': return '支払い失敗'
    case 'refunded': return '返金済み'
    default: return status
  }
}

export function OrderList({ 
  orders, 
  pagination, 
  loading = false, 
  onPageChange, 
  onStatusUpdate,
  onRefresh 
}: OrderListProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(o => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setStatusUpdateLoading(orderId)
    try {
      await onStatusUpdate(orderId, status)
    } finally {
      setStatusUpdateLoading(null)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
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
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                すべて選択 ({selectedOrders.length}件選択中)
              </span>
            </label>
            
            {selectedOrders.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // バルク操作の実装
                    console.log('Bulk export:', selectedOrders)
                  }}
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

      {/* 注文リスト */}
      <div className="divide-y divide-gray-200">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            注文が見つかりません
          </div>
        ) : (
          orders.map((order) => {
            const customerName = order.user.firstName && order.user.lastName
              ? `${order.user.firstName} ${order.user.lastName}`
              : order.user.email

            return (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* チェックボックス */}
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />

                  {/* 注文情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-gray-900 hover:text-red-600 transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                      
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusColor(order.status)
                      )}>
                        {getStatusText(order.status)}
                      </span>
                      
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getPaymentStatusColor(order.paymentStatus)
                      )}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      顧客: {customerName}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{order.items.length}商品</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>

                  {/* 金額・アクション */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      ¥{order.totalAmount.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* ステータス更新ドロップダウン */}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={statusUpdateLoading === order.id}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="pending">注文確認中</option>
                        <option value="processing">処理中</option>
                        <option value="shipped">発送済み</option>
                        <option value="delivered">配達完了</option>
                        <option value="cancelled">キャンセル</option>
                      </select>
                      
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 商品一覧（簡易表示） */}
                <div className="mt-3 ml-8">
                  <div className="text-xs text-gray-500">
                    商品: {order.items.map(item => 
                      `${item.product.nameJa} × ${item.quantity}`
                    ).join(', ')}
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