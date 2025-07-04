'use client'

import React from 'react'
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
  createdAt: string
  items: {
    product: {
      nameJa: string
      nameVi: string
    }
    quantity: number
  }[]
}

interface RecentOrdersProps {
  orders: Order[]
  loading?: boolean
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

export function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近の注文</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="space-y-2 text-right">
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の注文</h2>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              すべて見る
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            注文がありません
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const customerName = order.user.firstName && order.user.lastName
                ? `${order.user.firstName} ${order.user.lastName}`
                : order.user.email

              return (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
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
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{customerName}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {order.items.length}商品 • {new Date(order.createdAt).toLocaleDateString('ja-JP', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ¥{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}