'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProductList } from '@/components/admin/ProductList'
import { Button } from '@/components/shared/Button'
import { Loading } from '@/components/shared/Loading'

interface Product {
  id: string
  sku: string
  nameJa: string
  nameVi: string
  price: number
  stockQuantity: number
  isActive: boolean
  category: {
    nameJa: string
    nameVi: string
  }
  brand?: {
    name: string
  }
  images: {
    imageUrl: string
  }[]
  _count: {
    reviews: number
    orderItems: number
  }
  createdAt: string
}

interface ProductsData {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
    limit: number
  }
}

export default function AdminProducts() {
  const [data, setData] = useState<ProductsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1
  })

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        action: 'products',
        page: filters.page.toString(),
        limit: '20'
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/admin?${params}`)
      
      if (!response.ok) {
        throw new Error('商品データの取得に失敗しました')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || '商品データの取得に失敗しました')
      }
    } catch (error) {
      console.error('Products fetch error:', error)
      setError('商品データの読み込みに失敗しました')
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
          <Button onClick={fetchProducts}>再読み込み</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
            <p className="text-gray-600 mt-2">商品の追加、編集、削除を行えます</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新商品追加
            </Button>
          </Link>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="商品名、SKUで検索..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">すべてのカテゴリ</option>
                {/* カテゴリオプションは実装時に追加 */}
              </select>
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
            
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchProducts} className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                更新
              </Button>
            </div>
          </div>
        </div>

        {/* 商品リスト */}
        {data && (
          <ProductList
            products={data.products}
            pagination={data.pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onRefresh={fetchProducts}
          />
        )}
      </div>
    </AdminLayout>
  )
}