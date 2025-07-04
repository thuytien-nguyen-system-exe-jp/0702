'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/shared/Button'
import { QuantitySelector } from '@/components/shared/QuantitySelector'
import { PriceDisplay, ShippingIncludedPrice } from '@/components/shared/PriceDisplay'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const {
    state,
    updateQuantity,
    removeFromCart,
    clearCart,
    getShippingCost,
    getFinalTotal,
    getAmountForFreeShipping,
    checkStock
  } = useCart()

  const [language] = useState<'ja' | 'vi'>('ja')
  const [stockErrors, setStockErrors] = useState<string[]>([])
  const [isCheckingStock, setIsCheckingStock] = useState(false)

  // 在庫チェック
  const handleStockCheck = async () => {
    setIsCheckingStock(true)
    try {
      const result = await checkStock()
      setStockErrors(result.outOfStockItems)
    } catch (error) {
      console.error('Stock check failed:', error)
    } finally {
      setIsCheckingStock(false)
    }
  }

  useEffect(() => {
    if (state.items.length > 0) {
      handleStockCheck()
    }
  }, [state.items.length])

  // カートが空の場合
  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              カートは空です
            </h1>
            <p className="text-gray-600 mb-8">
              お気に入りの商品を見つけて、カートに追加してみましょう
            </p>
            <Link href="/products">
              <Button size="lg">
                商品を探す
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const subtotal = state.totalAmount
  const tax = Math.round(subtotal * 0.1)
  const shipping = getShippingCost()
  const total = getFinalTotal()
  const amountForFreeShipping = getAmountForFreeShipping()

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ショッピングカート</h1>
          <p className="text-gray-600">
            {state.totalItems}個の商品がカートに入っています
          </p>
        </div>

        {/* 送料無料まであといくら */}
        {amountForFreeShipping > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <span className="font-medium">¥{amountForFreeShipping.toLocaleString()}</span>
              以上のお買い物で送料無料になります！
            </p>
          </div>
        )}

        {/* 在庫エラー */}
        {stockErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium mb-2">在庫不足の商品があります</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {stockErrors.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* カートアイテム一覧 */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-4">
                  {/* 商品画像 */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].imageUrl}
                        alt={item.product.images[0].altText || item.product.nameJa}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🥢
                      </div>
                    )}
                  </div>

                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link 
                          href={`/products/${item.product.sku}`}
                          className="text-lg font-medium text-gray-900 hover:text-red-600 line-clamp-2"
                        >
                          {language === 'ja' ? item.product.nameJa : item.product.nameVi}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {language === 'ja' ? item.product.category.nameJa : item.product.category.nameVi}
                        </p>
                        {item.productVariant && (
                          <p className="text-sm text-gray-600">
                            {item.productVariant.name}: {item.productVariant.value}
                          </p>
                        )}
                      </div>
                      
                      {/* 削除ボタン */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        aria-label="商品を削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* 価格と数量 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <PriceDisplay
                          price={item.product.price + (item.productVariant?.priceModifier || 0)}
                          size="md"
                          language={language}
                        />
                        
                        {/* 数量選択 */}
                        <QuantitySelector
                          value={item.quantity}
                          min={1}
                          max={Math.min(99, item.productVariant?.stockQuantity ?? item.product.stockQuantity)}
                          onChange={(quantity) => updateQuantity(item.id, quantity)}
                          size="sm"
                          language={language}
                        />
                      </div>

                      {/* 小計 */}
                      <div className="text-right">
                        <PriceDisplay
                          price={(item.product.price + (item.productVariant?.priceModifier || 0)) * item.quantity}
                          size="lg"
                          className="font-bold"
                          language={language}
                        />
                      </div>
                    </div>

                    {/* 在庫情報 */}
                    <div className="mt-2 text-xs text-gray-600">
                      在庫: {item.productVariant?.stockQuantity ?? item.product.stockQuantity}個
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* カートをクリア */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                カートを空にする
              </button>
              
              <Link href="/products">
                <Button variant="outline">
                  買い物を続ける
                </Button>
              </Link>
            </div>
          </div>

          {/* 注文サマリー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">注文サマリー</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">小計 ({state.totalItems}個)</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">消費税 (10%)</span>
                  <span>¥{tax.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">送料</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">無料</span>
                    ) : (
                      `¥${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>合計</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
              </div>

              {/* 在庫チェックボタン */}
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={handleStockCheck}
                disabled={isCheckingStock}
              >
                {isCheckingStock ? '在庫確認中...' : '在庫を確認'}
              </Button>

              {/* レジに進むボタン */}
              <Button
                className="w-full"
                size="lg"
                disabled={stockErrors.length > 0 || state.isLoading}
              >
                {stockErrors.length > 0 ? '在庫不足のため注文できません' : 'レジに進む'}
              </Button>

              {/* 支払い方法 */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">お支払い方法</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>💳</span>
                    <span>クレジットカード</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏪</span>
                    <span>コンビニ決済</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏦</span>
                    <span>銀行振込</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>電子マネー</span>
                  </div>
                </div>
              </div>

              {/* セキュリティ情報 */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>SSL暗号化により安全に保護されています</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* おすすめ商品 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">こちらもおすすめ</h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              カートの商品と一緒によく購入される商品をご提案します
            </p>
            <Link href="/products">
              <Button variant="outline">
                おすすめ商品を見る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}