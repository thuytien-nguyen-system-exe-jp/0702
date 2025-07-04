import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSecurityHeaders, verifyAuth } from '@/lib/auth'

// レビュー投稿のバリデーションスキーマ
const createReviewSchema = z.object({
  productId: z.string().min(1, '商品IDが必要です'),
  orderId: z.string().optional(),
  rating: z.number().min(1, '評価は1以上である必要があります').max(5, '評価は5以下である必要があります'),
  title: z.string().max(100, 'タイトルは100文字以内である必要があります').optional(),
  comment: z.string().max(1000, 'コメントは1000文字以内である必要があります').optional(),
  images: z.array(z.string()).max(5, '画像は5枚まで投稿できます').optional()
})

// レビュー更新のバリデーションスキーマ
const updateReviewSchema = z.object({
  reviewId: z.string().min(1, 'レビューIDが必要です'),
  rating: z.number().min(1, '評価は1以上である必要があります').max(5, '評価は5以下である必要があります').optional(),
  title: z.string().max(100, 'タイトルは100文字以内である必要があります').optional(),
  comment: z.string().max(1000, 'コメントは1000文字以内である必要があります').optional(),
  images: z.array(z.string()).max(5, '画像は5枚まで投稿できます').optional()
})

// レビュー一覧取得
export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const { searchParams } = new URL(request.url)
    
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'created'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const rating = searchParams.get('rating')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: '商品IDが必要です' },
        { status: 400, headers }
      )
    }

    // フィルター条件を構築
    const where: any = {
      productId,
      isApproved: true
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // ソート条件を構築
    const orderBy: any = {}
    switch (sortBy) {
      case 'rating':
        orderBy.rating = sortOrder
        break
      case 'helpful':
        // TODO: いいね機能実装時に追加
        orderBy.createdAt = sortOrder
        break
      case 'created':
      default:
        orderBy.createdAt = sortOrder
        break
    }

    // ページネーション計算
    const skip = (page - 1) * limit

    // レビューデータ取得
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    // レビュー統計を計算
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true
      },
      _count: {
        rating: true
      }
    })

    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratingStats.find((stat: any) => stat.rating === star)?._count.rating || 0
    }))

    const totalReviews = ratingStats.reduce((sum: number, stat: any) => sum + stat._count.rating, 0)
    const averageRating = totalReviews > 0
      ? ratingStats.reduce((sum: number, stat: any) => sum + (stat.rating * stat._count.rating), 0) / totalReviews
      : 0

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

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        }
      }
    }, { headers })

  } catch (error) {
    console.error('Reviews GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// レビュー投稿
export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const body = await request.json()

    // バリデーション
    const validatedData = createReviewSchema.parse(body)
    const { productId, orderId, rating, title, comment, images } = validatedData

    // 認証チェック
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user!.id

    // 商品の存在チェック
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404, headers }
      )
    }

    // 既存レビューのチェック（1商品につき1レビューまで）
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'この商品には既にレビューを投稿済みです' },
        { status: 400, headers }
      )
    }

    // 注文履歴チェック（購入済み商品かどうか）
    let isVerifiedPurchase = false
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          items: {
            some: {
              productId
            }
          }
        }
      })
      isVerifiedPurchase = !!order
    }

    // レビューを作成
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId: orderId || null,
        rating,
        title: title || null,
        comment: comment || null,
        images: images ? JSON.stringify(images) : null,
        isVerifiedPurchase,
        isApproved: false // 管理者承認待ち
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { review },
      message: 'レビューを投稿しました。承認後に表示されます。'
    }, { headers })

  } catch (error) {
    console.error('Review POST API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'リクエストデータが無効です', details: error.errors },
        { status: 400, headers: getSecurityHeaders() }
      )
    }

    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// レビュー更新
export async function PUT(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const body = await request.json()

    // バリデーション
    const validatedData = updateReviewSchema.parse(body)
    const { reviewId, rating, title, comment, images } = validatedData

    // 認証チェック
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user!.id

    // レビューの存在チェック
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'レビューが見つかりません' },
        { status: 404, headers }
      )
    }

    // レビューを更新
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating !== undefined ? rating : review.rating,
        title: title !== undefined ? title : review.title,
        comment: comment !== undefined ? comment : review.comment,
        images: images !== undefined ? JSON.stringify(images) : review.images,
        isApproved: false, // 再承認待ち
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { review: updatedReview },
      message: 'レビューを更新しました。再承認後に表示されます。'
    }, { headers })

  } catch (error) {
    console.error('Review PUT API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'リクエストデータが無効です', details: error.errors },
        { status: 400, headers: getSecurityHeaders() }
      )
    }

    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// レビュー削除
export async function DELETE(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'レビューIDが必要です' },
        { status: 400, headers }
      )
    }

    // 認証チェック
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user!.id

    // レビューの存在チェック
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'レビューが見つかりません' },
        { status: 404, headers }
      )
    }

    // レビューを削除
    await prisma.review.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({
      success: true,
      message: 'レビューを削除しました'
    }, { headers })

  } catch (error) {
    console.error('Review DELETE API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}