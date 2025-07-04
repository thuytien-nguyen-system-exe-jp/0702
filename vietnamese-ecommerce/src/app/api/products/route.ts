import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSecurityHeaders } from '@/lib/auth'

// クエリパラメータのバリデーションスキーマ
const productQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 12),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  spiceLevel: z.string().optional().transform(val => val ? val.split(',').map(Number) : undefined),
  storageType: z.string().optional().transform(val => val ? val.split(',') : undefined),
  inStock: z.string().optional().transform(val => val === 'true'),
  featured: z.string().optional().transform(val => val === 'true'),
  sortBy: z.enum(['name', 'price', 'created', 'popularity']).optional().default('created'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

// 商品一覧取得
export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const { searchParams } = new URL(request.url)
    
    // クエリパラメータをオブジェクトに変換
    const queryObject: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      queryObject[key] = value
    })

    // バリデーション
    const validatedQuery = productQuerySchema.parse(queryObject)
    const {
      page,
      limit,
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      spiceLevel,
      storageType,
      inStock,
      featured,
      sortBy,
      sortOrder
    } = validatedQuery

    // フィルター条件を構築
    const where: any = {
      isActive: true
    }

    if (category) {
      where.categoryId = category
    }

    if (brand) {
      where.brandId = brand
    }

    if (search) {
      where.OR = [
        { nameJa: { contains: search, mode: 'insensitive' } },
        { nameVi: { contains: search, mode: 'insensitive' } },
        { descriptionJa: { contains: search, mode: 'insensitive' } },
        { descriptionVi: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (spiceLevel && spiceLevel.length > 0) {
      where.spiceLevel = { in: spiceLevel }
    }

    if (storageType && storageType.length > 0) {
      where.storageType = { in: storageType }
    }

    if (inStock) {
      where.stockQuantity = { gt: 0 }
    }

    if (featured) {
      where.isFeatured = true
    }

    // ソート条件を構築
    const orderBy: any = {}
    switch (sortBy) {
      case 'name':
        orderBy.nameJa = sortOrder
        break
      case 'price':
        orderBy.price = sortOrder
        break
      case 'created':
        orderBy.createdAt = sortOrder
        break
      case 'popularity':
        // 人気度は注文数やレビュー数で判断（簡易版）
        orderBy.createdAt = sortOrder
        break
      default:
        orderBy.createdAt = 'desc'
    }

    // ページネーション計算
    const skip = (page - 1) * limit

    // 商品データ取得
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              nameJa: true,
              nameVi: true,
              slug: true
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 3
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              value: true,
              priceModifier: true,
              stockQuantity: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // レビュー平均評価を計算
    const productsWithRating = products.map((product: any) => {
      const ratings = product.reviews.map((r: any) => r.rating)
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
        : 0

      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
        reviews: undefined // レビュー詳細は除外
      }
    })

    // ページネーション情報
    const totalPages = Math.ceil(totalCount / limit)
    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit
    }

    // フィルター用のメタデータを取得
    const [categories, brands, priceRange] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          nameJa: true,
          nameVi: true,
          slug: true
        },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.product.aggregate({
        where: { isActive: true },
        _min: { price: true },
        _max: { price: true }
      })
    ])

    const filters = {
      categories,
      brands,
      priceRange: {
        min: Number(priceRange._min.price) || 0,
        max: Number(priceRange._max.price) || 10000
      },
      spiceLevels: [0, 1, 2, 3, 4, 5],
      storageTypes: ['frozen', 'refrigerated', 'ambient']
    }

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithRating,
        pagination,
        filters
      }
    }, { headers })

  } catch (error) {
    console.error('Products API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400, headers: getSecurityHeaders() }
      )
    }

    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 商品詳細取得（IDまたはSLUG指定）
export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const body = await request.json()
    const { id, slug } = body

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, error: 'IDまたはスラッグが必要です' },
        { status: 400, headers }
      )
    }

    const where = id ? { id } : { sku: slug }

    const product = await prisma.product.findUnique({
      where,
      include: {
        category: {
          select: {
            id: true,
            nameJa: true,
            nameVi: true,
            slug: true,
            parent: {
              select: {
                id: true,
                nameJa: true,
                nameVi: true,
                slug: true
              }
            }
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            descriptionJa: true,
            descriptionVi: true,
            logoUrl: true,
            countryOrigin: true
          }
        },
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404, headers }
      )
    }

    // レビュー統計を計算
    const ratings = product.reviews.map((r: any) => r.rating)
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
      : 0

    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratings.filter((r: number) => r === star).length
    }))

    // 関連商品を取得
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true
      },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })

    const productWithStats = {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      ratingDistribution,
      relatedProducts
    }

    return NextResponse.json({
      success: true,
      data: { product: productWithStats }
    }, { headers })

  } catch (error) {
    console.error('Product detail API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}