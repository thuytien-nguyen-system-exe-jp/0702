'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/shared/Button'
import { CardLoading } from '@/components/shared/Loading'
import ProductCard from '@/components/shared/ProductCard'

interface Product {
  id: string
  sku: string
  nameJa: string
  nameVi: string
  price: number
  stockQuantity: number
  spiceLevel: number | null
  isFeatured: boolean
  category: {
    nameJa: string
    nameVi: string
    slug: string
  }
  brand?: {
    name: string
    slug: string
  }
  images: {
    imageUrl: string
    altText: string | null
  }[]
  averageRating: number
  reviewCount: number
}

interface ProductFilters {
  categories: {
    id: string
    nameJa: string
    nameVi: string
    slug: string
  }[]
  brands: {
    id: string
    name: string
    slug: string
  }[]
  priceRange: {
    min: number
    max: number
  }
  spiceLevels: number[]
  storageTypes: string[]
}

const sortOptions = [
  { value: 'created', label: '新着順' },
  { value: 'price', label: '価格の安い順' },
  { value: 'popularity', label: '人気順' }
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<ProductFilters | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // フィルター状態
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('')
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([])
  const [sortBy, setSortBy] = useState('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 商品データを取得
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder
      })

      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedBrand) params.append('brand', selectedBrand)
      if (selectedSpiceLevels.length > 0) {
        params.append('spiceLevel', selectedSpiceLevels.join(','))
      }

      // 価格範囲の処理
      if (selectedPriceRange) {
        const [min, max] = selectedPriceRange.split('-').map(Number)
        if (min) params.append('minPrice', min.toString())
        if (max) params.append('maxPrice', max.toString())
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
        setFilters(data.data.filters)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.totalCount)
      } else {
        setError(data.error || '商品の取得に失敗しました')
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
      console.error('Products fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedCategory, selectedBrand, selectedPriceRange, selectedSpiceLevels, sortBy, sortOrder])

  // 辛さレベルの選択処理
  const handleSpiceLevelChange = (level: number, checked: boolean) => {
    if (checked) {
      setSelectedSpiceLevels([...selectedSpiceLevels, level])
    } else {
      setSelectedSpiceLevels(selectedSpiceLevels.filter(l => l !== level))
    }
    setCurrentPage(1)
  }

  // ソート変更処理
  const handleSortChange = (value: string) => {
    setSortBy(value)
    if (value === 'price') {
      setSortOrder('asc')
    } else {
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }


  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">商品一覧</h1>
          <p className="text-gray-600">
            本格ベトナム料理の食材・調味料・冷凍食品を豊富に取り揃えています
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* サイドバー（フィルター） */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card-gradient rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 text-gradient">カテゴリで絞り込み</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ''}
                    onChange={(e) => {
                      setSelectedCategory('')
                      setCurrentPage(1)
                    }}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">すべて</span>
                </label>
                {filters?.categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{category.nameJa}</span>
                  </label>
                ))}
              </div>

              {filters?.brands && filters.brands.length > 0 && (
                <>
                  <hr className="my-6" />
                  <h3 className="text-lg font-semibold mb-4 text-gradient">ブランド</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value=""
                        checked={selectedBrand === ''}
                        onChange={(e) => {
                          setSelectedBrand('')
                          setCurrentPage(1)
                        }}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">すべて</span>
                    </label>
                    {filters.brands.map((brand) => (
                      <label key={brand.id} className="flex items-center">
                        <input
                          type="radio"
                          name="brand"
                          value={brand.id}
                          checked={selectedBrand === brand.id}
                          onChange={(e) => {
                            setSelectedBrand(e.target.value)
                            setCurrentPage(1)
                          }}
                          className="mr-3 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <hr className="my-6" />

              <h3 className="text-lg font-semibold mb-4 text-gradient">価格帯</h3>
              <div className="space-y-2">
                {[
                  { value: '', label: 'すべて' },
                  { value: '0-500', label: '¥500未満' },
                  { value: '500-1000', label: '¥500 - ¥1,000' },
                  { value: '1000-2000', label: '¥1,000 - ¥2,000' },
                  { value: '2000-', label: '¥2,000以上' }
                ].map((range) => (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.value}
                      checked={selectedPriceRange === range.value}
                      onChange={(e) => {
                        setSelectedPriceRange(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{range.label}</span>
                  </label>
                ))}
              </div>

              <hr className="my-6" />

              <h3 className="text-lg font-semibold mb-4 text-gradient">辛さレベル</h3>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSpiceLevels.includes(level)}
                      onChange={(e) => handleSpiceLevelChange(level, e.target.checked)}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center spice-indicator">
                      {level === 0 ? (
                        <span>辛くない</span>
                      ) : (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xs ${i < level ? 'text-red-500' : 'text-gray-300'}`}>
                              🌶️
                            </span>
                          ))}
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1">
            {/* ソート・表示オプション */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600 font-medium">
                <span className="text-gradient font-bold">{totalCount}</span>件の商品が見つかりました
              </p>
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus-ring hover-lift transition-all duration-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 商品グリッド */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <CardLoading key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <div key={product.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">条件に一致する商品が見つかりませんでした</p>
                <Button
                  className="hover-lift"
                  onClick={() => {
                    setSelectedCategory('')
                    setSelectedBrand('')
                    setSelectedPriceRange('')
                    setSelectedSpiceLevels([])
                    setCurrentPage(1)
                  }}
                >
                  フィルターをリセット
                </Button>
              </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    前へ
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 hover-lift ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    次へ
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  )
}