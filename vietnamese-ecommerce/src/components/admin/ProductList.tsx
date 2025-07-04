'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils'

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

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
  limit: number
}

interface ProductListProps {
  products: Product[]
  pagination: Pagination
  loading?: boolean
  onPageChange: (page: number) => void
  onRefresh: () => void
}

export function ProductList({ 
  products, 
  pagination, 
  loading = false, 
  onPageChange, 
  onRefresh 
}: ProductListProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) return

    try {
      // バルク操作の実装
      console.log(`Bulk action: ${action} for products:`, selectedProducts)
      // API呼び出し実装予定
      onRefresh()
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded"></div>
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
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                すべて選択 ({selectedProducts.length}件選択中)
              </span>
            </label>
            
            {selectedProducts.length > 0 && (
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
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  削除
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

      {/* 商品リスト */}
      <div className="divide-y divide-gray-200">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            商品が見つかりません
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                {/* チェックボックス */}
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />

                {/* 商品画像 */}
                <div className="flex-shrink-0">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0].imageUrl}
                      alt={product.nameJa}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 商品情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium text-gray-900 hover:text-red-600 transition-colors truncate"
                    >
                      {product.nameJa}
                    </Link>
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {product.isActive ? '有効' : '無効'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    SKU: {product.sku} | カテゴリ: {product.category.nameJa}
                    {product.brand && ` | ブランド: ${product.brand.name}`}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>在庫: {product.stockQuantity}個</span>
                    <span>レビュー: {product._count.reviews}件</span>
                    <span>販売数: {product._count.orderItems}件</span>
                  </div>
                </div>

                {/* 価格・アクション */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    ¥{product.price.toLocaleString()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        編集
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // 商品詳細表示の実装
                        window.open(`/products/${product.sku}`, '_blank')
                      }}
                    >
                      表示
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
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