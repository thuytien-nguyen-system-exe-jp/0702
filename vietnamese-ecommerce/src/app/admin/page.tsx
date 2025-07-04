'use client'

import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { SalesChart } from '@/components/admin/SalesChart'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { Button } from '@/components/shared/Button'
import { Loading } from '@/components/shared/Loading'
import Link from 'next/link'

interface DashboardData {
  stats: {
    todaySales: number
    todayOrders: number
    totalProducts: number
    activeUsers: number
    salesChange: number
    ordersChange: number
    productsChange: number
    usersChange: number
    salesChart: {
      date: string
      sales: number
      orders: number
    }[]
  }
  recentOrders: any[]
  lowStockProducts: {
    id: string
    nameJa: string
    stockQuantity: number
    reservedQuantity: number
  }[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('/api/admin?action=stats'),
        fetch('/api/admin?action=orders&limit=5')
      ])

      if (!statsResponse.ok || !ordersResponse.ok) {
        throw new Error('データの取得に失敗しました')
      }

      const [statsData, ordersData] = await Promise.all([
        statsResponse.json(),
        ordersResponse.json()
      ])

      if (statsData.success && ordersData.success) {
        setData({
          stats: statsData.data.stats,
          recentOrders: ordersData.data.orders,
          lowStockProducts: [] // 実装予定
        })
      } else {
        throw new Error('データの取得に失敗しました')
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError('ダッシュボードデータの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
          <Button onClick={fetchDashboardData}>再読み込み</Button>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">データがありません</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* ページヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-2">VietFood Market の運営状況を確認できます</p>
        </div>

        {/* 統計カード */}
        <DashboardStats stats={data.stats} />

        {/* 売上グラフ */}
        <SalesChart data={data.stats.salesChart} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近の注文 */}
          <RecentOrders orders={data.recentOrders} />

          {/* 在庫不足商品 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">在庫不足商品</h2>
                <Link href="/admin/products">
                  <Button variant="outline" size="sm">
                    在庫管理
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {data.lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  在庫不足の商品はありません
                </div>
              ) : (
                <div className="space-y-4">
                  {data.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-gray-900">{product.nameJa}</p>
                        <p className="text-sm text-gray-600">予約済み: {product.reservedQuantity}個</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{product.stockQuantity}個</p>
                        <Button variant="primary" size="sm">
                          発注
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Button className="h-20 flex flex-col items-center justify-center w-full">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新商品追加
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center w-full">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                注文管理
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center w-full">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                ユーザー管理
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center w-full">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                売上分析
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}