import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/shared/Button'

export const metadata: Metadata = {
  title: 'レシピ一覧 - VietFood Market',
  description: 'ベトナム料理のレシピ集。フォー、生春巻き、バインミーなど本格的なベトナム料理の作り方をご紹介',
  keywords: 'ベトナム料理, レシピ, フォー, 生春巻き, バインミー, 作り方',
}

// 仮のレシピデータ
const recipes = [
  {
    id: 'pho-bo',
    title: 'フォー・ボー（牛肉フォー）',
    description: 'ベトナムの代表的な麺料理。香り豊かなスープと柔らかい牛肉が絶品',
    image: '/images/recipes/pho-bo.jpg',
    cookingTime: 120,
    difficulty: 'medium',
    servings: 4,
    category: 'main',
    region: 'north',
    spiceLevel: 2,
    tags: ['麺料理', '牛肉', 'スープ', '人気'],
    ingredients: [
      { name: '牛骨', amount: '1kg', productId: 'beef-bones' },
      { name: 'フォー麺', amount: '400g', productId: 'pho-noodles' },
      { name: '牛肉薄切り', amount: '200g', productId: 'beef-slices' },
      { name: 'ヌクマム', amount: '大さじ3', productId: 'nuoc-mam' }
    ],
    featured: true
  },
  {
    id: 'goi-cuon',
    title: '生春巻き（ゴイクン）',
    description: '新鮮な野菜とエビを透明なライスペーパーで包んだヘルシーな一品',
    image: '/images/recipes/goi-cuon.jpg',
    cookingTime: 30,
    difficulty: 'easy',
    servings: 4,
    category: 'appetizer',
    region: 'south',
    spiceLevel: 0,
    tags: ['前菜', 'エビ', 'ヘルシー', '簡単'],
    ingredients: [
      { name: 'ライスペーパー', amount: '12枚', productId: 'rice-paper' },
      { name: 'エビ', amount: '12尾', productId: 'shrimp' },
      { name: 'レタス', amount: '6枚', productId: 'lettuce' },
      { name: 'ピーナッツソース', amount: '適量', productId: 'peanut-sauce' }
    ],
    featured: true
  },
  {
    id: 'banh-mi',
    title: 'バインミー',
    description: 'フランスパンにベトナム風の具材を挟んだサンドイッチ',
    image: '/images/recipes/banh-mi.jpg',
    cookingTime: 20,
    difficulty: 'easy',
    servings: 2,
    category: 'main',
    region: 'south',
    spiceLevel: 1,
    tags: ['サンドイッチ', '豚肉', '簡単', 'ランチ'],
    ingredients: [
      { name: 'バインミー用パン', amount: '2個', productId: 'banh-mi-bread' },
      { name: '豚肉', amount: '150g', productId: 'pork' },
      { name: 'なます', amount: '適量', productId: 'pickled-vegetables' },
      { name: 'パクチー', amount: '適量', productId: 'cilantro' }
    ],
    featured: true
  },
  {
    id: 'bun-bo-hue',
    title: 'ブン・ボー・フエ',
    description: 'フエ地方の辛いスープ麺。レモングラスの香りが特徴的',
    image: '/images/recipes/bun-bo-hue.jpg',
    cookingTime: 180,
    difficulty: 'hard',
    servings: 4,
    category: 'main',
    region: 'central',
    spiceLevel: 4,
    tags: ['麺料理', '辛い', 'スープ', '本格的'],
    ingredients: [
      { name: 'ブン麺', amount: '400g', productId: 'bun-noodles' },
      { name: '牛肉', amount: '300g', productId: 'beef' },
      { name: 'レモングラス', amount: '3本', productId: 'lemongrass' },
      { name: 'チリオイル', amount: '大さじ2', productId: 'chili-oil' }
    ],
    featured: false
  },
  {
    id: 'com-tam',
    title: 'コムタム（砕き米）',
    description: '砕き米に焼き豚や目玉焼きをのせたベトナムの定番料理',
    image: '/images/recipes/com-tam.jpg',
    cookingTime: 45,
    difficulty: 'medium',
    servings: 2,
    category: 'main',
    region: 'south',
    spiceLevel: 1,
    tags: ['米料理', '豚肉', '卵', '定番'],
    ingredients: [
      { name: '砕き米', amount: '2カップ', productId: 'broken-rice' },
      { name: '豚肉', amount: '200g', productId: 'pork' },
      { name: '卵', amount: '2個', productId: 'eggs' },
      { name: 'ヌクマム', amount: '大さじ2', productId: 'nuoc-mam' }
    ],
    featured: false
  },
  {
    id: 'che-ba-mau',
    title: 'チェー・バー・マウ',
    description: '3色のベトナム風ぜんざい。ココナッツミルクが決め手',
    image: '/images/recipes/che-ba-mau.jpg',
    cookingTime: 60,
    difficulty: 'medium',
    servings: 4,
    category: 'dessert',
    region: 'south',
    spiceLevel: 0,
    tags: ['デザート', 'ココナッツ', '豆', '冷たい'],
    ingredients: [
      { name: '緑豆', amount: '100g', productId: 'mung-beans' },
      { name: '小豆', amount: '100g', productId: 'red-beans' },
      { name: 'ココナッツミルク', amount: '400ml', productId: 'coconut-milk' },
      { name: 'タピオカ', amount: '50g', productId: 'tapioca' }
    ],
    featured: false
  }
]

const featuredRecipes = recipes.filter(recipe => recipe.featured)
const categories = [
  { id: 'all', name: 'すべて', count: recipes.length },
  { id: 'main', name: 'メイン料理', count: recipes.filter(r => r.category === 'main').length },
  { id: 'appetizer', name: '前菜', count: recipes.filter(r => r.category === 'appetizer').length },
  { id: 'soup', name: 'スープ', count: recipes.filter(r => r.category === 'soup').length },
  { id: 'dessert', name: 'デザート', count: recipes.filter(r => r.category === 'dessert').length }
]

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '簡単'
    case 'medium': return '普通'
    case 'hard': return '難しい'
    default: return '普通'
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-600 bg-green-100'
    case 'medium': return 'text-yellow-600 bg-yellow-100'
    case 'hard': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export default function RecipesPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ベトナム料理レシピ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            本格的なベトナム料理を自宅で作ってみませんか？
            初心者から上級者まで楽しめるレシピを豊富にご用意しています。
          </p>
        </div>

        {/* 人気レシピ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">人気レシピ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center relative">
                  <span className="text-6xl">🍜</span>
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                    {recipe.spiceLevel > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 flex items-center">
                        {[...Array(recipe.spiceLevel)].map((_, i) => (
                          <span key={i} className="text-xs">🌶️</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {recipe.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {recipe.cookingTime}分
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {recipe.servings}人分
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* カテゴリフィルター */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        {/* 全レシピ一覧 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">全レシピ</h2>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option value="newest">新着順</option>
              <option value="popular">人気順</option>
              <option value="time-short">調理時間短い順</option>
              <option value="time-long">調理時間長い順</option>
              <option value="difficulty-easy">簡単順</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center relative">
                  <span className="text-4xl">🍜</span>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {recipe.cookingTime}分
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {recipe.servings}人分
                    </span>
                    {recipe.spiceLevel > 0 && (
                      <span className="flex items-center">
                        {[...Array(Math.min(recipe.spiceLevel, 3))].map((_, i) => (
                          <span key={i} className="text-xs">🌶️</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <Button size="sm" className="w-full">
                    レシピを見る
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* レシピ投稿の案内 */}
        <section className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">あなたのレシピも投稿しませんか？</h2>
          <p className="text-gray-600 mb-6">
            オリジナルのベトナム料理レシピをコミュニティと共有して、
            みんなで美味しい料理を楽しみましょう
          </p>
          <Button>
            レシピを投稿する
          </Button>
        </section>
      </div>
    </Layout>
  )
}