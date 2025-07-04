import React from 'react'
import { mockProducts } from '@/data/mockData'
import ProductDetailClient from './ProductDetailClient'

// 静的パラメータ生成関数（サーバーサイド）
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: `product-${product.id}`,
  }))
}

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailClient slug={params.slug} />
}