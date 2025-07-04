'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProduct() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...formData
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin/products')
      } else {
        throw new Error(result.error || '商品の作成に失敗しました')
      }
    } catch (error) {
      console.error('Product creation error:', error)
      alert('商品の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新商品追加</h1>
          <p className="text-gray-600 mt-2">新しい商品を追加します</p>
        </div>

        {/* 商品フォーム */}
        <ProductForm
          onSubmit={handleSubmit}
          loading={loading}
          mode="create"
        />
      </div>
    </AdminLayout>
  )
}