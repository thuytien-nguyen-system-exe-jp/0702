'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { OrderList } from '@/components/admin/OrderList'
import { Button } from '@/components/shared/Button'
import { Loading } from '@/components/shared/Loading'

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

interface OrdersData {
  orders: Order[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
    limit: number
  }
}

export default function AdminOrders() {
  const [data, setData] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    shippingStatus: '',
    dateFrom: '',
    dateTo: '',
    page: 1
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        action: 'orders',
        page: filters.page.toString(),
        limit: '20'
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.shippingStatus) params.append('shippingStatus', filters.shippingStatus)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/admin?${params}`)
      
      if (!response.ok) {
        throw new Error('注文データの取得に失敗しました')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || '注文データの取得に失敗しました')
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
      setError('注文データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          orderId,
          status
        }),
      })

      const result = await response.json()

      if (result.success) {
        fetchOrders() // リフレッシュ
      } else {
        throw new Error(result.error || 'ステータス更新に失敗しました')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('ステータス更新に失敗しました')
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
          <Button onClick={fetchOrders}>再読み込み</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">注文管理</h1>
            <p className="text-gray-600 mt-2">注文の確認、ステータス更新を行えます</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={fetchOrders}>
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

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                注文ステータス
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべて</option>
                <option value="pending">注文確認中</option>
                <option value="processing">処理中</option>
                <option value="shipped">発送済み</option>
                <option value="delivered">配達完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支払いステータス
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべて</option>
                <option value="pending">未払い</option>
                <option value="paid">支払い済み</option>
                <option value="failed">支払い失敗</option>
                <option value="refunded">返金済み</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配送ステータス
              </label>
              <select
                value={filters.shippingStatus}
                onChange={(e) => handleFilterChange('shippingStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべて</option>
                <option value="pending">配送準備中</option>
                <option value="shipped">発送済み</option>
                <option value="delivered">配達完了</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                注文日（開始）
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                注文日（終了）
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* 注文リスト */}
        {data && (
          <OrderList
            orders={data.orders}
            pagination={data.pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onStatusUpdate={handleStatusUpdate}
            onRefresh={fetchOrders}
          />
        )}
      </div>
    </AdminLayout>
  )
}