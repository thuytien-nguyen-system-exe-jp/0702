import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSecurityHeaders } from '@/lib/auth'

// 商品詳細取得（スラッグ指定）
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const headers = getSecurityHeaders()
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'スラッグが必要です' },
        { status: 400, headers }
      )
    }

    // 商品詳細を取得
    const product = await prisma.product.findUnique({
      where: { sku: slug },
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
          take: 20
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

    // 関連商品を取得（同じカテゴリの商品）
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
        },
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
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 8,
      orderBy: { createdAt: 'desc' }
    })

    // 関連商品の評価を計算
    const relatedProductsWithRating = relatedProducts.map((relatedProduct: any) => {
      const relatedRatings = relatedProduct.reviews.map((r: any) => r.rating)
      const relatedAverageRating = relatedRatings.length > 0
        ? relatedRatings.reduce((sum: number, rating: number) => sum + rating, 0) / relatedRatings.length
        : 0

      return {
        ...relatedProduct,
        averageRating: Math.round(relatedAverageRating * 10) / 10,
        reviewCount: relatedRatings.length,
        reviews: undefined // レビュー詳細は除外
      }
    })

    // 同じブランドの商品を取得
    const brandProducts = product.brandId ? await prisma.product.findMany({
      where: {
        brandId: product.brandId,
        id: { not: product.id },
        isActive: true
      },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        category: {
          select: {
            nameJa: true,
            nameVi: true
          }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    }) : []

    // 最近見た商品の候補（同じカテゴリの人気商品）
    const popularProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        isFeatured: true
      },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        category: {
          select: {
            nameJa: true,
            nameVi: true
          }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })

    // 商品の詳細情報を構築
    const productWithStats = {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      ratingDistribution,
      relatedProducts: relatedProductsWithRating,
      brandProducts,
      popularProducts,
      // 追加の商品情報
      nutritionalInfo: product.allergenInfo ? JSON.parse(product.allergenInfo as string) : null,
      seoMeta: product.seoMeta ? JSON.parse(product.seoMeta as string) : null,
      // 在庫状況
      stockStatus: product.stockQuantity > 0 ? 'in_stock' : 'out_of_stock',
      lowStock: product.stockQuantity > 0 && product.stockQuantity <= 5,
      // 配送情報
      shippingInfo: {
        storageType: product.storageType,
        weight: product.weight,
        dimensions: product.dimensions ? JSON.parse(product.dimensions as string) : null,
        shelfLifeDays: product.shelfLifeDays
      }
    }

    return NextResponse.json({
      success: true,
      data: { 
        product: productWithStats,
        meta: {
          title: product.nameJa,
          description: product.descriptionJa?.substring(0, 160),
          keywords: [
            product.nameJa,
            product.nameVi,
            product.category.nameJa,
            product.brand?.name
          ].filter(Boolean).join(', '),
          canonical: `/products/${product.sku}`
        }
      }
    }, { headers })

  } catch (error) {
    console.error('Product detail API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 商品詳細更新（管理者用）
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const headers = getSecurityHeaders()
    const { slug } = params
    const body = await request.json()

    // TODO: 管理者認証チェック
    // const authResult = await verifyAdminAuth(request)
    // if (!authResult.success) {
    //   return NextResponse.json(
    //     { success: false, error: '認証が必要です' },
    //     { status: 401, headers }
    //   )
    // }

    const product = await prisma.product.findUnique({
      where: { sku: slug }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404, headers }
      )
    }

    // 商品情報を更新
    const updatedProduct = await prisma.product.update({
      where: { sku: slug },
      data: {
        nameJa: body.nameJa || product.nameJa,
        nameVi: body.nameVi || product.nameVi,
        descriptionJa: body.descriptionJa || product.descriptionJa,
        descriptionVi: body.descriptionVi || product.descriptionVi,
        price: body.price !== undefined ? body.price : product.price,
        stockQuantity: body.stockQuantity !== undefined ? body.stockQuantity : product.stockQuantity,
        categoryId: body.categoryId || product.categoryId,
        brandId: body.brandId || product.brandId,
        spiceLevel: body.spiceLevel !== undefined ? body.spiceLevel : product.spiceLevel,
        allergenInfo: body.allergenInfo ? JSON.stringify(body.allergenInfo) : product.allergenInfo,
        cookingInstructionsJa: body.cookingInstructionsJa || product.cookingInstructionsJa,
        cookingInstructionsVi: body.cookingInstructionsVi || product.cookingInstructionsVi,
        storageType: body.storageType || product.storageType,
        shelfLifeDays: body.shelfLifeDays !== undefined ? body.shelfLifeDays : product.shelfLifeDays,
        weight: body.weight !== undefined ? body.weight : product.weight,
        dimensions: body.dimensions ? JSON.stringify(body.dimensions) : product.dimensions,
        isActive: body.isActive !== undefined ? body.isActive : product.isActive,
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : product.isFeatured,
        seoMeta: body.seoMeta ? JSON.stringify(body.seoMeta) : product.seoMeta,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: { product: updatedProduct }
    }, { headers })

  } catch (error) {
    console.error('Product update API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 商品削除（管理者用）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const headers = getSecurityHeaders()
    const { slug } = params

    // TODO: 管理者認証チェック
    // const authResult = await verifyAdminAuth(request)
    // if (!authResult.success) {
    //   return NextResponse.json(
    //     { success: false, error: '認証が必要です' },
    //     { status: 401, headers }
    //   )
    // }

    const product = await prisma.product.findUnique({
      where: { sku: slug }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404, headers }
      )
    }

    // 商品を非アクティブにする（物理削除ではなく論理削除）
    await prisma.product.update({
      where: { sku: slug },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '商品が削除されました'
    }, { headers })

  } catch (error) {
    console.error('Product delete API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}