import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAdmin, getSecurityHeaders, hashPassword } from '@/lib/auth'

// 管理者ログインスキーマ
const adminLoginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください')
})

// 統計データ取得
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
    const action = searchParams.get('action')

    if (action === 'stats') {
      return await getAdminStats(headers)
    } else if (action === 'products') {
      return await getProductsForAdmin(request, headers)
    } else if (action === 'orders') {
      return await getOrdersForAdmin(request, headers)
    } else if (action === 'users') {
      return await getUsersForAdmin(request, headers)
    } else {
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400, headers }
      )
    }
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 管理者操作（作成、更新など）
export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const body = await request.json()
    const { action } = body

    if (action === 'login') {
      return await handleAdminLogin(body, headers)
    }

    // その他のアクションは認証が必要
    const admin = await getAuthenticatedAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: '管理者認証が必要です' },
        { status: 401, headers }
      )
    }

    switch (action) {
      case 'create_product':
        return await createProduct(body, admin, headers)
      case 'update_product':
        return await updateProduct(body, admin, headers)
      case 'update_order_status':
        return await updateOrderStatus(body, admin, headers)
      default:
        return NextResponse.json(
          { success: false, error: '無効なアクションです' },
          { status: 400, headers }
        )
    }
  } catch (error) {
    console.error('Admin POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 管理者ログイン処理
async function handleAdminLogin(body: any, headers: Record<string, string>) {
  const validatedData = adminLoginSchema.parse(body)
  const { email, password } = validatedData

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      name: true,
      role: true,
      permissions: true,
      isActive: true
    }
  })

  if (!admin || !admin.isActive) {
    return NextResponse.json(
      { success: false, error: '管理者アカウントが見つかりません' },
      { status: 401, headers }
    )
  }

  const bcrypt = require('bcryptjs')
  const isValidPassword = await bcrypt.compare(password, admin.passwordHash)
  if (!isValidPassword) {
    return NextResponse.json(
      { success: false, error: 'パスワードが正しくありません' },
      { status: 401, headers }
    )
  }

  // JWTトークン生成
  const jwt = require('jsonwebtoken')
  const token = jwt.sign(
    { userId: admin.id, email: admin.email, role: 'admin' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '8h' }
  )

  // 最終ログイン時刻を更新
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  })

  const response = NextResponse.json({
    success: true,
    data: {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      },
      token
    },
    message: '管理者ログインに成功しました'
  }, { headers })

  // HTTPOnlyクッキーにトークンを設定
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 // 8時間
  })

  return response
}

// 統計データ取得
async function getAdminStats(headers: Record<string, string>) {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  const [
    todayOrders,
    monthOrders,
    lastMonthOrders,
    totalProducts,
    activeUsers,
    todaySales,
    monthSales,
    lastMonthSales
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: startOfToday } }
    }),
    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    }),
    prisma.product.count({
      where: { isActive: true }
    }),
    prisma.user.count({
      where: { isActive: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { totalAmount: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { totalAmount: true }
    })
  ])

  // 変化率を計算
  const ordersChange = lastMonthOrders > 0 
    ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100 
    : 0

  const salesChange = Number(lastMonthSales._sum.totalAmount) > 0 
    ? ((Number(monthSales._sum.totalAmount) - Number(lastMonthSales._sum.totalAmount)) / Number(lastMonthSales._sum.totalAmount)) * 100 
    : 0

  // 過去7日間の売上チャート
  const salesChart = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const [dayOrders, daySales] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay }
        },
        _sum: { totalAmount: true }
      })
    ])

    salesChart.push({
      date: startOfDay.toISOString().split('T')[0],
      sales: Number(daySales._sum.totalAmount) || 0,
      orders: dayOrders
    })
  }

  const stats = {
    todaySales: Number(todaySales._sum.totalAmount) || 0,
    todayOrders,
    totalProducts,
    activeUsers,
    salesChange: Math.round(salesChange * 10) / 10,
    ordersChange: Math.round(ordersChange * 10) / 10,
    productsChange: 0, // 実装が必要な場合は追加
    usersChange: 0, // 実装が必要な場合は追加
    salesChart
  }

  return NextResponse.json({
    success: true,
    data: { stats }
  }, { headers })
}

// 商品管理データ取得
async function getProductsForAdmin(request: NextRequest, headers: Record<string, string>) {
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

// 注文管理データ取得
async function getOrdersForAdmin(request: NextRequest, headers: Record<string, string>) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')

  const where: any = {}
  if (status) {
    where.status = status
  }

  const skip = (page - 1) * limit

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                nameJa: true,
                nameVi: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
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
    data: { orders, pagination }
  }, { headers })
}

// ユーザー管理データ取得
async function getUsersForAdmin(request: NextRequest, headers: Record<string, string>) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')

  const where: any = {}
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ]
  }

  const skip = (page - 1) * limit

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredLanguage: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
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
    data: { users, pagination }
  }, { headers })
}

// 商品作成（簡易版）
async function createProduct(body: any, admin: any, headers: Record<string, string>) {
  // 実装は必要に応じて追加
  return NextResponse.json({
    success: false,
    error: '商品作成機能は未実装です'
  }, { status: 501, headers })
}

// 商品更新（簡易版）
async function updateProduct(body: any, admin: any, headers: Record<string, string>) {
  // 実装は必要に応じて追加
  return NextResponse.json({
    success: false,
    error: '商品更新機能は未実装です'
  }, { status: 501, headers })
}

// 注文ステータス更新
async function updateOrderStatus(body: any, admin: any, headers: Record<string, string>) {
  const { orderId, status, notes } = body

  if (!orderId || !status) {
    return NextResponse.json(
      { success: false, error: '注文IDとステータスが必要です' },
      { status: 400, headers }
    )
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { 
      status,
      updatedAt: new Date()
    }
  })

  // ステータス履歴を追加
  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status,
      notes: notes || `管理者 ${admin.name} によりステータスが更新されました`
    }
  })

  return NextResponse.json({
    success: true,
    data: { order },
    message: '注文ステータスが更新されました'
  }, { headers })
}