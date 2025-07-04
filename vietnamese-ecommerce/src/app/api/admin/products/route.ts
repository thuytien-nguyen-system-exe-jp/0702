import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAdmin, getSecurityHeaders } from '@/lib/auth'

// 商品作成スキーマ
const createProductSchema = z.object({
  sku: z.string().min(1, 'SKUは必須です'),
  nameJa: z.string().min(1, '商品名（日本語）は必須です'),
  nameVi: z.string().min(1, '商品名（ベトナム語）は必須です'),
  descriptionJa: z.string().optional(),
  descriptionVi: z.string().optional(),
  price: z.number().positive('価格は0より大きい値を入力してください'),
  costPrice: z.number().optional(),
  stockQuantity: z.number().int().min(0, '在庫数量は0以上の整数を入力してください'),
  categoryId: z.string().min(1, 'カテゴリは必須です'),
  brandId: z.string().optional(),
  spiceLevel: z.number().int().min(0).max(5).optional(),
  allergenInfo: z.array(z.string()).optional(),
  cookingInstructionsJa: z.string().optional(),
  cookingInstructionsVi: z.string().optional(),
  storageType: z.enum(['frozen', 'refrigerated', 'ambient']).optional(),
  shelfLifeDays: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional()
})

// 商品更新スキーマ
const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, '商品IDは必須です')
})

// 商品作成
export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const admin = await getAuthenticatedAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '管理者認証が必要です' },
        { status: 401, headers }
      )
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create') {
      return await createProduct(data, admin, headers)
    } else if (action === 'update') {
      return await updateProduct(data, admin, headers)
    } else if (action === 'delete') {
      return await deleteProduct(data, admin, headers)
    } else if (action === 'bulk') {
      return await bulkAction(data, admin, headers)
    } else {
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400, headers }
      )
    }
  } catch (error) {
    console.error('Admin products API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 商品取得
export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const admin = await getAuthenticatedAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '管理者認証が必要です' },
        { status: 401, headers }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      return await getProduct(id, headers)
    } else {
      return await getProducts(request, headers)
    }
  } catch (error) {
    console.error('Admin products GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 商品作成処理
async function createProduct(data: any, admin: any, headers: Record<string, string>) {
  const validatedData = createProductSchema.parse(data)

  // SKUの重複チェック
  const existingProduct = await prisma.product.findUnique({
    where: { sku: validatedData.sku }
  })

  if (existingProduct) {
    return NextResponse.json(
      { success: false, error: 'このSKUは既に使用されています' },
      { status: 400, headers }
    )
  }

  // カテゴリの存在確認
  const category = await prisma.category.findUnique({
    where: { id: validatedData.categoryId }
  })

  if (!category) {
    return NextResponse.json(
      { success: false, error: '指定されたカテゴリが見つかりません' },
      { status: 400, headers }
    )
  }

  // ブランドの存在確認（指定されている場合）
  if (validatedData.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: validatedData.brandId }
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: '指定されたブランドが見つかりません' },
        { status: 400, headers }
      )
    }
  }

  const product = await prisma.product.create({
    data: {
      ...validatedData,
      costPrice: validatedData.costPrice || 0,
      spiceLevel: validatedData.spiceLevel || 0,
      allergenInfo: validatedData.allergenInfo || [],
      storageType: validatedData.storageType || 'ambient',
      shelfLifeDays: validatedData.shelfLifeDays || 0,
      weight: validatedData.weight || 0,
      isActive: validatedData.isActive ?? true,
      isFeatured: validatedData.isFeatured ?? false,
      createdById: admin.id
    },
    include: {
      category: true,
      brand: true,
      images: true
    }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE',
      resourceType: 'PRODUCT',
      resourceId: product.id,
      newData: product
    }
  })

  return NextResponse.json({
    success: true,
    data: { product },
    message: '商品が作成されました'
  }, { headers })
}

// 商品更新処理
async function updateProduct(data: any, admin: any, headers: Record<string, string>) {
  const validatedData = updateProductSchema.parse(data)
  const { id, ...updateData } = validatedData

  // 商品の存在確認
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  })

  if (!existingProduct) {
    return NextResponse.json(
      { success: false, error: '商品が見つかりません' },
      { status: 404, headers }
    )
  }

  // SKUの重複チェック（変更される場合）
  if (updateData.sku && updateData.sku !== existingProduct.sku) {
    const duplicateProduct = await prisma.product.findUnique({
      where: { sku: updateData.sku }
    })

    if (duplicateProduct) {
      return NextResponse.json(
        { success: false, error: 'このSKUは既に使用されています' },
        { status: 400, headers }
      )
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      updatedById: admin.id
    },
    include: {
      category: true,
      brand: true,
      images: true
    }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE',
      resourceType: 'PRODUCT',
      resourceId: product.id,
      oldData: existingProduct,
      newData: product
    }
  })

  return NextResponse.json({
    success: true,
    data: { product },
    message: '商品が更新されました'
  }, { headers })
}

// 商品削除処理
async function deleteProduct(data: any, admin: any, headers: Record<string, string>) {
  const { id } = data

  if (!id) {
    return NextResponse.json(
      { success: false, error: '商品IDが必要です' },
      { status: 400, headers }
    )
  }

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    return NextResponse.json(
      { success: false, error: '商品が見つかりません' },
      { status: 404, headers }
    )
  }

  // 注文に含まれている商品は削除できない
  const orderItems = await prisma.orderItem.findFirst({
    where: { productId: id }
  })

  if (orderItems) {
    return NextResponse.json(
      { success: false, error: '注文に含まれている商品は削除できません' },
      { status: 400, headers }
    )
  }

  await prisma.product.delete({
    where: { id }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'DELETE',
      resourceType: 'PRODUCT',
      resourceId: id,
      oldData: product
    }
  })

  return NextResponse.json({
    success: true,
    message: '商品が削除されました'
  }, { headers })
}

// バルク操作処理
async function bulkAction(data: any, admin: any, headers: Record<string, string>) {
  const { action, productIds } = data

  if (!action || !productIds || !Array.isArray(productIds)) {
    return NextResponse.json(
      { success: false, error: '無効なバルク操作データです' },
      { status: 400, headers }
    )
  }

  let updateData: any = {}
  let logAction = ''

  switch (action) {
    case 'activate':
      updateData = { isActive: true }
      logAction = 'BULK_ACTIVATE'
      break
    case 'deactivate':
      updateData = { isActive: false }
      logAction = 'BULK_DEACTIVATE'
      break
    case 'delete':
      // バルク削除の場合は別処理
      const deleteResult = await prisma.product.deleteMany({
        where: {
          id: { in: productIds },
          // 注文に含まれていない商品のみ削除
          orderItems: { none: {} }
        }
      })

      await prisma.adminLog.create({
        data: {
          adminId: admin.id,
          action: 'BULK_DELETE',
          resourceType: 'PRODUCT',
          newData: { deletedCount: deleteResult.count, productIds }
        }
      })

      return NextResponse.json({
        success: true,
        data: { deletedCount: deleteResult.count },
        message: `${deleteResult.count}件の商品が削除されました`
      }, { headers })
    default:
      return NextResponse.json(
        { success: false, error: '無効なバルク操作です' },
        { status: 400, headers }
      )
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: updateData
  })

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: logAction,
      resourceType: 'PRODUCT',
      newData: { updatedCount: result.count, productIds, updateData }
    }
  })

  return NextResponse.json({
    success: true,
    data: { updatedCount: result.count },
    message: `${result.count}件の商品が更新されました`
  }, { headers })
}

// 単一商品取得
async function getProduct(id: string, headers: Record<string, string>) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      images: true,
      variants: true,
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      },
      _count: {
        select: {
          reviews: true,
          orderItems: true
        }
      }
    }
  })

  if (!product) {
    return NextResponse.json(
      { success: false, error: '商品が見つかりません' },
      { status: 404, headers }
    )
  }

  return NextResponse.json({
    success: true,
    data: { product }
  }, { headers })
}

// 商品一覧取得
async function getProducts(request: NextRequest, headers: Record<string, string>) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const status = searchParams.get('status')

  const where: any = {}
  
  if (search) {
    where.OR = [
      { nameJa: { contains: search, mode: 'insensitive' } },
      { nameVi: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category) {
    where.categoryId = category
  }

  if (status === 'active') {
    where.isActive = true
  } else if (status === 'inactive') {
    where.isActive = false
  }

  const skip = (page - 1) * limit

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            nameJa: true,
            nameVi: true
          }
        },
        brand: {
          select: {
            name: true
          }
        },
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ])

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasNext: page < Math.ceil(totalCount / limit),
    hasPrev: page > 1,
    limit
  }

  return NextResponse.json({
    success: true,
    data: { products, pagination }
  }, { headers })
}