'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/shared/Button'
import { Loading } from '@/components/shared/Loading'

interface Category {
  id: string
  nameJa: string
  nameVi: string
}

interface Brand {
  id: string
  name: string
}

interface ProductFormData {
  sku: string
  nameJa: string
  nameVi: string
  descriptionJa: string
  descriptionVi: string
  price: number
  costPrice: number
  stockQuantity: number
  categoryId: string
  brandId: string
  spiceLevel: number
  allergenInfo: string[]
  cookingInstructionsJa: string
  cookingInstructionsVi: string
  storageType: string
  shelfLifeDays: number
  weight: number
  isActive: boolean
  isFeatured: boolean
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  loading?: boolean
  mode: 'create' | 'edit'
}

const initialFormData: ProductFormData = {
  sku: '',
  nameJa: '',
  nameVi: '',
  descriptionJa: '',
  descriptionVi: '',
  price: 0,
  costPrice: 0,
  stockQuantity: 0,
  categoryId: '',
  brandId: '',
  spiceLevel: 0,
  allergenInfo: [],
  cookingInstructionsJa: '',
  cookingInstructionsVi: '',
  storageType: 'ambient',
  shelfLifeDays: 0,
  weight: 0,
  isActive: true,
  isFeatured: false
}

const storageTypes = [
  { value: 'frozen', label: '冷凍' },
  { value: 'refrigerated', label: '冷蔵' },
  { value: 'ambient', label: '常温' }
]

const spiceLevels = [
  { value: 0, label: '辛くない' },
  { value: 1, label: '微辛' },
  { value: 2, label: '小辛' },
  { value: 3, label: '中辛' },
  { value: 4, label: '大辛' },
  { value: 5, label: '激辛' }
]

const commonAllergens = [
  '小麦', '卵', '乳', '落花生', 'えび', 'かに', 'そば', '大豆'
]

export function ProductForm({ initialData, onSubmit, loading = false, mode }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    ...initialFormData,
    ...initialData
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [formLoading, setFormLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchFormData()
  }, [])

  const fetchFormData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands')
      ])

      if (categoriesRes.ok && brandsRes.ok) {
        const [categoriesData, brandsData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json()
        ])

        if (categoriesData.success) setCategories(categoriesData.data)
        if (brandsData.success) setBrands(brandsData.data)
      }
    } catch (error) {
      console.error('Form data fetch error:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    const newAllergens = checked
      ? [...formData.allergenInfo, allergen]
      : formData.allergenInfo.filter(a => a !== allergen)
    
    handleChange('allergenInfo', newAllergens)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.sku.trim()) newErrors.sku = 'SKUは必須です'
    if (!formData.nameJa.trim()) newErrors.nameJa = '商品名（日本語）は必須です'
    if (!formData.nameVi.trim()) newErrors.nameVi = '商品名（ベトナム語）は必須です'
    if (formData.price <= 0) newErrors.price = '価格は0より大きい値を入力してください'
    if (!formData.categoryId) newErrors.categoryId = 'カテゴリを選択してください'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submit error:', error)
    }
  }

  if (formLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="例: VF-PHO-001"
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">カテゴリを選択</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nameJa}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品名（日本語） <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nameJa}
              onChange={(e) => handleChange('nameJa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="例: フォー・ボー（牛肉フォー）"
            />
            {errors.nameJa && <p className="mt-1 text-sm text-red-600">{errors.nameJa}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品名（ベトナム語） <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nameVi}
              onChange={(e) => handleChange('nameVi', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="例: Phở Bò"
            />
            {errors.nameVi && <p className="mt-1 text-sm text-red-600">{errors.nameVi}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ブランド
            </label>
            <select
              value={formData.brandId}
              onChange={(e) => handleChange('brandId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">ブランドを選択</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              辛さレベル
            </label>
            <select
              value={formData.spiceLevel}
              onChange={(e) => handleChange('spiceLevel', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {spiceLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品説明（日本語）
            </label>
            <textarea
              value={formData.descriptionJa}
              onChange={(e) => handleChange('descriptionJa', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="商品の詳細説明を入力してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品説明（ベトナム語）
            </label>
            <textarea
              value={formData.descriptionVi}
              onChange={(e) => handleChange('descriptionVi', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Mô tả chi tiết sản phẩm"
            />
          </div>
        </div>
      </div>

      {/* 価格・在庫情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">価格・在庫情報</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              販売価格（円） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="0"
              step="0.01"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              仕入価格（円）
            </label>
            <input
              type="number"
              value={formData.costPrice}
              onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              在庫数量
            </label>
            <input
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* 商品詳細 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">商品詳細</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              保存方法
            </label>
            <select
              value={formData.storageType}
              onChange={(e) => handleChange('storageType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {storageTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              賞味期限（日数）
            </label>
            <input
              type="number"
              value={formData.shelfLifeDays}
              onChange={(e) => handleChange('shelfLifeDays', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              重量（g）
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {/* アレルゲン情報 */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            アレルゲン情報
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {commonAllergens.map(allergen => (
              <label key={allergen} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allergenInfo.includes(allergen)}
                  onChange={(e) => handleAllergenChange(allergen, e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">{allergen}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 調理方法 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              調理方法（日本語）
            </label>
            <textarea
              value={formData.cookingInstructionsJa}
              onChange={(e) => handleChange('cookingInstructionsJa', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="調理方法を入力してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              調理方法（ベトナム語）
            </label>
            <textarea
              value={formData.cookingInstructionsVi}
              onChange={(e) => handleChange('cookingInstructionsVi', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Hướng dẫn nấu ăn"
            />
          </div>
        </div>
      </div>

      {/* 設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">設定</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700">商品を有効にする</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => handleChange('isFeatured', e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700">おすすめ商品として表示する</span>
          </label>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? '保存中...' : mode === 'create' ? '商品を作成' : '変更を保存'}
        </Button>
      </div>
    </form>
  )
}