import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSecurityHeaders } from '@/lib/auth'

// クエリパラメータのバリデーションスキーマ
const categoryQuerySchema = z.object({
  includeProducts: z.string().optional().transform(val => val === 'true'),
  parentId: z.string().optional(),
  level: z.string().optional().transform(val => val ? parseInt(val) : undefined)
})

// カテゴリ一覧取得
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
    const validatedQuery = categoryQuerySchema.parse(queryObject)
    const { includeProducts, parentId, level } = validatedQuery

    // フィルター条件を構築
    const where: any = {
      isActive: true
    }

    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId
    }

    // カテゴリデータ取得
    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            nameJa: true,
            nameVi: true,
            slug: true
          }
        },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            nameJa: true,
            nameVi: true,
            slug: true,
            imageUrl: true,
            sortOrder: true,
            _count: {
              select: {
                products: {
                  where: { isActive: true }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        },
        ...(includeProducts && {
          products: {
            where: { isActive: true },
            select: {
              id: true,
              nameJa: true,
              nameVi: true,
              sku: true,
              price: true,
              stockQuantity: true,
              isFeatured: true,
              images: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
                select: {
                  imageUrl: true,
                  altText: true
                }
              }
            },
            take: 8,
            orderBy: [
              { isFeatured: 'desc' },
              { createdAt: 'desc' }
            ]
          }
        })
      },
      orderBy: { sortOrder: 'asc' }
    })

    // 階層構造を構築（レベル指定がある場合）
    let processedCategories = categories

    if (level !== undefined) {
      // 指定されたレベルのカテゴリのみを返す
      processedCategories = categories.filter((category: any) => {
        if (level === 0) return !category.parentId
        if (level === 1) return !!category.parentId && !category.parent?.parentId
        // より深い階層が必要な場合は追加実装
        return true
      })
    }

    // カテゴリ統計情報を追加
    const categoriesWithStats = processedCategories.map((category: any) => ({
      ...category,
      productCount: category._count.products,
      childrenCount: category.children.length,
      hasChildren: category.children.length > 0,
      _count: undefined // 内部カウントは除外
    }))

    // 階層構造のツリーを構築（parentIdがnullのもののみ）
    const buildCategoryTree = (categories: any[], parentId: string | null = null): any[] => {
      return categories
        .filter(category => category.parentId === parentId)
        .map(category => ({
          ...category,
          children: buildCategoryTree(categories, category.id)
        }))
    }

    const categoryTree = buildCategoryTree(categoriesWithStats)

    // カテゴリ統計
    const stats = {
      totalCategories: categoriesWithStats.length,
      rootCategories: categoriesWithStats.filter((c: any) => !c.parentId).length,
      categoriesWithProducts: categoriesWithStats.filter((c: any) => c.productCount > 0).length
    }

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithStats,
        categoryTree,
        stats
      }
    }, { headers })

  } catch (error) {
    console.error('Categories API error:', error)
    
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

// カテゴリ詳細取得（IDまたはSLUG指定）
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

    const where = id ? { id } : { slug }

    const category = await prisma.category.findUnique({
      where,
      include: {
        parent: {
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
        children: {
          where: { isActive: true },
          select: {
            id: true,
            nameJa: true,
            nameVi: true,
            slug: true,
            descriptionJa: true,
            descriptionVi: true,
            imageUrl: true,
            sortOrder: true,
            _count: {
              select: {
                products: {
                  where: { isActive: true }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        products: {
          where: { isActive: true },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          take: 20,
          orderBy: [
            { isFeatured: 'desc' },
            { createdAt: 'desc' }
          ]
        },
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!category || !category.isActive) {
      return NextResponse.json(
        { success: false, error: 'カテゴリが見つかりません' },
        { status: 404, headers }
      )
    }

    // パンくずリストを構築
    const buildBreadcrumbs = (category: any): any[] => {
      const breadcrumbs = []
      let current = category

      while (current) {
        breadcrumbs.unshift({
          id: current.id,
          nameJa: current.nameJa,
          nameVi: current.nameVi,
          slug: current.slug
        })
        current = current.parent
      }

      return breadcrumbs
    }

    // 商品にレビュー統計を追加
    const productsWithStats = category.products.map((product: any) => {
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

    const categoryWithDetails = {
      ...category,
      productCount: category._count.products,
      breadcrumbs: buildBreadcrumbs(category),
      products: productsWithStats,
      children: category.children.map((child: any) => ({
        ...child,
        productCount: child._count.products,
        _count: undefined
      })),
      _count: undefined
    }

    return NextResponse.json({
      success: true,
      data: { category: categoryWithDetails }
    }, { headers })

  } catch (error) {
    console.error('Category detail API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}