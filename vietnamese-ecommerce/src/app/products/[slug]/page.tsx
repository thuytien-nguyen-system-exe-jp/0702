'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/shared/Button'
import { Loading } from '@/components/shared/Loading'
import { QuantitySelector, StockQuantitySelector } from '@/components/shared/QuantitySelector'
import { PriceDisplay, TaxIncludedPrice } from '@/components/shared/PriceDisplay'
import { StarRating, RatingDistribution } from '@/components/shared/StarRating'
import ProductCard from '@/components/shared/ProductCard'
import { useCart } from '@/hooks/useCart'

interface ProductDetail {
  id: string
  sku: string
  nameJa: string
  nameVi: string
  descriptionJa: string | null
  descriptionVi: string | null
  price: number
  stockQuantity: number
  spiceLevel: number | null
  allergenInfo: any
  cookingInstructionsJa: string | null
  cookingInstructionsVi: string | null
  storageType: string | null
  shelfLifeDays: number | null
  weight: number | null
  dimensions: any
  isFeatured: boolean
  category: {
    id: string
    nameJa: string
    nameVi: string
    slug: string
    parent?: {
      id: string
      nameJa: string
      nameVi: string
      slug: string
    }
  }
  brand?: {
    id: string
    name: string
    slug: string
    descriptionJa: string | null
    descriptionVi: string | null
    logoUrl: string | null
    countryOrigin: string | null
  }
  images: {
    id: string
    imageUrl: string
    altText: string | null
    sortOrder: number
  }[]
  variants: {
    id: string
    name: string
    value: string
    priceModifier: number
    stockQuantity: number
    isActive: boolean
  }[]
  reviews: {
    id: string
    rating: number
    title: string | null
    comment: string | null
    images: any
    isVerifiedPurchase: boolean
    createdAt: string
    user: {
      firstName: string | null
      lastName: string | null
      avatarUrl: string | null
    }
  }[]
  averageRating: number
  reviewCount: number
  ratingDistribution: {
    star: number
    count: number
  }[]
  relatedProducts: any[]
  brandProducts: any[]
  popularProducts: any[]
  stockStatus: string
  lowStock: boolean
  shippingInfo: {
    storageType: string | null
    weight: number | null
    dimensions: any
    shelfLifeDays: number | null
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description')
  const [language] = useState<'ja' | 'vi'>('ja')

  const { addToCart, isInCart, getItemQuantity, state: cartState } = useCart()

  // 商品詳細を取得
  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${slug}`)
      const data = await response.json()

      if (data.success) {
        setProduct(data.data.product)
      } else {
        setError(data.error || '商品の取得に失敗しました')
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
      console.error('Product fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  // 選択されたバリアントの情報を取得
  const variant = selectedVariant 
    ? product?.variants.find(v => v.id === selectedVariant)
    : undefined

  // 実際の価格を計算
  const actualPrice = product ? product.price + (variant?.priceModifier || 0) : 0

  // 在庫数を取得
  const availableStock = variant?.stockQuantity ?? product?.stockQuantity ?? 0

  // カートに追加処理
  const handleAddToCart = async () => {
    if (!product || availableStock === 0) return

    try {
      await addToCart(product.id, quantity, selectedVariant || undefined)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  // カート内の数量を取得
  const cartQuantity = product ? getItemQuantity(product.id, selectedVariant || undefined) : 0

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading />
        </div>
      </Layout>
    )
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || '商品が見つかりません'}</p>
            <Link href="/products">
              <Button>商品一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const productName = language === 'ja' ? product.nameJa : product.nameVi
  const productDescription = language === 'ja' ? product.descriptionJa : product.descriptionVi
  const categoryName = language === 'ja' ? product.category.nameJa : product.category.nameVi

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずナビ */}
        <nav className="flex mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">ホーム</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-red-600">商品一覧</Link>
          <span className="mx-2">/</span>
          {product.category.parent && (
            <>
              <Link href={`/categories/${product.category.parent.slug}`} className="hover:text-red-600">
                {language === 'ja' ? product.category.parent.nameJa : product.category.parent.nameVi}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <Link href={`/categories/${product.category.slug}`} className="hover:text-red-600">
            {categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{productName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* 商品画像 */}
          <div className="space-y-4">
            {/* メイン画像 */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex].imageUrl}
                  alt={product.images[selectedImageIndex].altText || productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🥢
                </div>
              )}
              
              {/* バッジ */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFeatured && (
                  <span className="bg-red-600 text-white text-sm px-3 py-1 rounded font-medium">
                    おすすめ
                  </span>
                )}
                {availableStock === 0 && (
                  <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded font-medium">
                    在庫切れ
                  </span>
                )}
                {product.lowStock && availableStock > 0 && (
                  <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded font-medium">
                    残りわずか
                  </span>
                )}
              </div>
            </div>

            {/* サムネイル画像 */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-red-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || productName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 商品情報 */}
          <div className="space-y-6">
            {/* カテゴリ・ブランド */}
            <div className="flex flex-wrap gap-2">
              <Link 
                href={`/categories/${product.category.slug}`}
                className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
              >
                {categoryName}
              </Link>
              {product.brand && (
                <Link 
                  href={`/brands/${product.brand.slug}`}
                  className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100"
                >
                  {product.brand.name}
                </Link>
              )}
            </div>

            {/* 商品名 */}
            <h1 className="text-3xl font-bold text-gray-900">{productName}</h1>

            {/* 評価 */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-4">
                <StarRating
                  rating={product.averageRating}
                  showValue
                  showCount
                  reviewCount={product.reviewCount}
                  language={language}
                />
              </div>
            )}

            {/* 価格 */}
            <div className="space-y-2">
              <PriceDisplay
                price={actualPrice}
                originalPrice={variant?.priceModifier !== 0 ? product.price : undefined}
                size="xl"
                language={language}
              />
              <TaxIncludedPrice
                price={actualPrice}
                size="sm"
                language={language}
              />
            </div>

            {/* 辛さレベル */}
            {product.spiceLevel && product.spiceLevel > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">辛さレベル:</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < product.spiceLevel! ? 'text-red-500' : 'text-gray-300'}`}
                    >
                      🌶️
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* バリアント選択 */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  サイズ・バリエーション
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">標準</option>
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.value} 
                      {variant.priceModifier !== 0 && (
                        <span className="ml-1">
                          ({variant.priceModifier > 0 ? '+' : ''}¥{variant.priceModifier})
                        </span>
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 数量選択 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">数量</label>
              <StockQuantitySelector
                value={quantity}
                onChange={setQuantity}
                stockQuantity={availableStock}
                max={Math.min(99, availableStock)}
                language={language}
              />
            </div>

            {/* カートに追加ボタン */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                disabled={availableStock === 0 || cartState.isLoading}
                onClick={handleAddToCart}
              >
                {cartState.isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    追加中...
                  </div>
                ) : availableStock === 0 ? (
                  '在庫切れ'
                ) : cartQuantity > 0 ? (
                  `さらに追加 (現在: ${cartQuantity}個)`
                ) : (
                  'カートに追加'
                )}
              </Button>

              {cartQuantity > 0 && (
                <Link href="/cart">
                  <Button variant="outline" className="w-full">
                    カートを見る ({cartQuantity}個)
                  </Button>
                </Link>
              )}
            </div>

            {/* 配送情報 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">配送について</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• 5,000円以上で送料無料</p>
                <p>• 冷凍・冷蔵商品は専用便でお届け</p>
                <p>• 通常2-3営業日でお届け</p>
                {product.shippingInfo.storageType && (
                  <p>• 保存方法: {product.shippingInfo.storageType === 'frozen' ? '冷凍' : product.shippingInfo.storageType === 'refrigerated' ? '冷蔵' : '常温'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="mb-12">
          {/* タブナビゲーション */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { key: 'description', label: '商品詳細' },
                { key: 'reviews', label: `レビュー (${product.reviewCount})` },
                { key: 'shipping', label: '配送・返品' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div className="space-y-6">
                {productDescription && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">商品説明</h3>
                    <p className="text-gray-700 whitespace-pre-line">{productDescription}</p>
                  </div>
                )}

                {product.cookingInstructionsJa && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">調理方法</h3>
                    <p className="text-gray-700 whitespace-pre-line">{product.cookingInstructionsJa}</p>
                  </div>
                )}

                {product.allergenInfo && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">アレルギー情報</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        アレルギー物質を含む可能性があります。詳細は商品パッケージをご確認ください。
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">商品仕様</h3>
                    <dl className="space-y-2 text-sm">
                      {product.weight && (
                        <>
                          <dt className="font-medium text-gray-900">重量</dt>
                          <dd className="text-gray-700">{product.weight}g</dd>
                        </>
                      )}
                      {product.shelfLifeDays && (
                        <>
                          <dt className="font-medium text-gray-900">賞味期限</dt>
                          <dd className="text-gray-700">{product.shelfLifeDays}日</dd>
                        </>
                      )}
                      {product.storageType && (
                        <>
                          <dt className="font-medium text-gray-900">保存方法</dt>
                          <dd className="text-gray-700">
                            {product.storageType === 'frozen' ? '冷凍保存' : 
                             product.storageType === 'refrigerated' ? '冷蔵保存' : '常温保存'}
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>

                  {product.brand && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">ブランド情報</h3>
                      <div className="space-y-2">
                        <p className="font-medium">{product.brand.name}</p>
                        {product.brand.countryOrigin && (
                          <p className="text-sm text-gray-600">原産国: {product.brand.countryOrigin}</p>
                        )}
                        {product.brand.descriptionJa && (
                          <p className="text-sm text-gray-700">{product.brand.descriptionJa}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {product.reviewCount > 0 ? (
                  <>
                    {/* レビュー統計 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {product.averageRating}
                        </div>
                        <StarRating rating={product.averageRating} size="lg" />
                        <p className="text-sm text-gray-600 mt-2">
                          {product.reviewCount}件のレビュー
                        </p>
                      </div>
                      <div>
                        <RatingDistribution
                          distribution={product.ratingDistribution}
                          totalReviews={product.reviewCount}
                          language={language}
                        />
                      </div>
                    </div>

                    {/* レビュー一覧 */}
                    <div className="space-y-6">
                      {product.reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {review.user.avatarUrl ? (
                                <Image
                                  src={review.user.avatarUrl}
                                  alt="ユーザーアバター"
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {(review.user.firstName || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {review.user.firstName || 'ユーザー'}
                                </span>
                                {review.isVerifiedPurchase && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    購入済み
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                                </span>
                              </div>
                              {review.title && (
                                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                              )}
                              {review.comment && (
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {product.reviews.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline">
                          すべてのレビューを見る
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">まだレビューがありません</p>
                    <p className="text-sm text-gray-400">
                      この商品を購入された方は、ぜひレビューをお聞かせください
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">配送について</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>• 通常2-3営業日でお届けいたします</p>
                    <p>• 5,000円以上のご注文で送料無料</p>
                    <p>• 冷凍・冷蔵商品は専用便でお届けします</p>
                    <p>• 配送日時の指定が可能です</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">返品・交換について</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>• 商品到着後7日以内にご連絡ください</p>
                    <p>• 未開封・未使用の商品に限ります</p>
                    <p>• 冷凍・冷蔵商品は返品をお受けできません</p>
                    <p>• 返送料はお客様負担となります</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 関連商品 */}
        {product.relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">関連商品</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}