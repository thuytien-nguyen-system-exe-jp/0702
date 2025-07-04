'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/shared/Layout'
import { CardLoading } from '@/components/shared/Loading'

interface Category {
  id: string
  nameJa: string
  nameVi: string
  slug: string
  descriptionJa: string | null
  descriptionVi: string | null
  imageUrl: string | null
  parentId: string | null
  productCount: number
  childrenCount: number
  hasChildren: boolean
  children: Category[]
}

interface CategoryStats {
  totalCategories: number
  rootCategories: number
  categoriesWithProducts: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<Category[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // カテゴリアイコンのマッピング
  const getCategoryIcon = (slug: string): string => {
    const iconMap: Record<string, string> = {
      'fruits': '🍎',
      'tropical-fruits': '🥭',
      'citrus-fruits': '🍊',
      'vegetables': '🥬',
      'leafy-vegetables': '🥬',
      'herbs': '🌿',
      'seasonings': '🥄',
      'frozen-foods': '🥟',
      'snacks': '🍪',
      'beverages': '☕',
      'noodles': '🍜',
      'rice': '🍚',
      'soup': '🍲'
    }
    return iconMap[slug] || '🥢'
  }

  // カテゴリデータを取得
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.data.categories)
        setCategoryTree(data.data.categoryTree)
        setStats(data.data.stats)
      } else {
        setError(data.error || 'カテゴリの取得に失敗しました')
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
      console.error('Categories fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // カテゴリカードコンポーネント
  const CategoryCard = ({ category, featured = false }: { category: Category; featured?: boolean }) => (
    <Link
      href={`/products?category=${category.id}`}
      className={`group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        featured ? 'transform hover:scale-105' : ''
      }`}
    >
      <div className={`${featured ? 'aspect-[4/3]' : 'aspect-square'} bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center relative`}>
        <span className={`${featured ? 'text-6xl' : 'text-4xl'} group-hover:scale-110 transition-transform duration-300`}>
          {getCategoryIcon(category.slug)}
        </span>
        <div className="absolute top-4 right-4 bg-red-600 text-white text-sm px-3 py-1 rounded-full">
          {category.productCount}商品
        </div>
      </div>
      <div className={`${featured ? 'p-6' : 'p-4'}`}>
        <h3 className={`${featured ? 'text-xl' : 'text-lg'} font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors`}>
          {category.nameJa}
        </h3>
        {category.descriptionJa && (
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {category.descriptionJa}
          </p>
        )}
        {category.hasChildren && (
          <div className="flex flex-wrap gap-2">
            {category.children.slice(0, 3).map((child) => (
              <span
                key={child.id}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {child.nameJa}
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="text-xs text-gray-500">
                +{category.children.length - 3}
              </span>
            )}
          </div>
        )}
        {!featured && !category.hasChildren && (
          <div className="text-sm text-red-600 font-medium">
            {category.productCount}商品
          </div>
        )}
      </div>
    </Link>
  )

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">商品カテゴリ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            本格ベトナム料理に必要な食材を、カテゴリ別に分かりやすくご紹介します。
            お探しの商品を簡単に見つけることができます。
          </p>
          {stats && (
            <div className="flex justify-center space-x-8 mt-6 text-sm text-gray-600">
              <span>{stats.totalCategories}カテゴリ</span>
              <span>{stats.categoriesWithProducts}カテゴリに商品あり</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-16">
            {/* 人気カテゴリのローディング */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">メインカテゴリ</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <CardLoading key={i} />
                ))}
              </div>
            </section>
            
            {/* その他カテゴリのローディング */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">サブカテゴリ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <CardLoading key={i} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* メインカテゴリ（親カテゴリ） */}
            {categoryTree.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">メインカテゴリ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryTree.map((category) => (
                    <CategoryCard key={category.id} category={category} featured={true} />
                  ))}
                </div>
              </section>
            )}

            {/* サブカテゴリ */}
            {categories.filter(cat => cat.parentId !== null).length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">サブカテゴリ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories
                    .filter(cat => cat.parentId !== null)
                    .map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
              </section>
            )}

            {/* カテゴリ検索のヒント */}
            <section className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">お探しの商品が見つからない場合</h2>
                <p className="text-gray-600 mb-6">
                  商品検索機能を使って、商品名や料理名から直接検索することもできます
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    全商品を見る
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-6 py-3 border border-red-600 text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors"
                  >
                    商品を検索
                  </Link>
                </div>
              </div>
            </section>

            {/* ベトナム料理について */}
            <section className="mt-16 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ベトナム料理の特徴</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌿</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">新鮮なハーブ</h3>
                  <p className="text-gray-600 text-sm">
                    コリアンダー、バジル、ミントなど、新鮮なハーブが料理の風味を引き立てます
                  </p>
                </div>
                <div className="p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">バランスの取れた味</h3>
                  <p className="text-gray-600 text-sm">
                    甘味、酸味、塩味、辛味、うま味の5つの味のバランスが絶妙です
                  </p>
                </div>
                <div className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💪</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ヘルシー</h3>
                  <p className="text-gray-600 text-sm">
                    野菜中心で油を控えめに使用し、健康的な料理が多いのが特徴です
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  )
}