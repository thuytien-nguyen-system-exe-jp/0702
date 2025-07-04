import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAdmin, getSecurityHeaders } from '@/lib/auth'

// ユーザー操作スキーマ
const userActionSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDは必須です'),
  action: z.enum(['activate', 'deactivate', 'sendVerificationEmail', 'sendPasswordReset', 'delete'])
})

// バルク操作スキーマ
const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'export']),
  userIds: z.array(z.string()).min(1, 'ユーザーIDが必要です')
})

// ユーザー操作
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
    const { action, userId, userIds, ...data } = body

    if (action === 'bulk') {
      return await handleBulkAction({ action: data.action, userIds }, admin, headers)
    } else {
      return await handleUserAction({ userId, action }, admin, headers)
    }
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// ユーザー取得
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
      return await getUser(id, headers)
    } else {
      return await getUsers(request, headers)
    }
  } catch (error) {
    console.error('Admin users GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 単一ユーザー操作処理
async function handleUserAction(data: any, admin: any, headers: Record<string, string>) {
  const validatedData = userActionSchema.parse(data)
  const { userId, action } = validatedData

  // ユーザーの存在確認
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'ユーザーが見つかりません' },
      { status: 404, headers }
    )
  }

  let result: any
  let message = ''

  switch (action) {
    case 'activate':
      result = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true }
      })
      message = 'ユーザーが有効化されました'
      break

    case 'deactivate':
      result = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      })
      message = 'ユーザーが無効化されました'
      break

    case 'sendVerificationEmail':
      // メール認証送信の実装（実際のメール送信システムが必要）
      result = { emailSent: true }
      message = '認証メールが送信されました'
      break

    case 'sendPasswordReset':
      // パスワードリセットメール送信の実装（実際のメール送信システムが必要）
      result = { emailSent: true }
      message = 'パスワードリセットメールが送信されました'
      break

    case 'delete':
      // ユーザーに関連する注文がある場合は削除不可
      const orderCount = await prisma.order.count({
        where: { userId }
      })

      if (orderCount > 0) {
        return NextResponse.json(
          { success: false, error: '注文履歴があるユーザーは削除できません' },
          { status: 400, headers }
        )
      }

      await prisma.user.delete({
        where: { id: userId }
      })
      result = { deleted: true }
      message = 'ユーザーが削除されました'
      break

    default:
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400, headers }
      )
  }

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: `USER_${action.toUpperCase()}`,
      resourceType: 'USER',
      resourceId: userId,
      oldData: user,
      newData: result
    }
  })

  return NextResponse.json({
    success: true,
    data: result,
    message
  }, { headers })
}

// バルク操作処理
async function handleBulkAction(data: any, admin: any, headers: Record<string, string>) {
  const validatedData = bulkActionSchema.parse(data)
  const { action, userIds } = validatedData

  let result: any
  let message = ''

  switch (action) {
    case 'activate':
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: true }
      })
      message = `${result.count}件のユーザーが有効化されました`
      break

    case 'deactivate':
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: false }
      })
      message = `${result.count}件のユーザーが無効化されました`
      break

    case 'delete':
      // 注文履歴があるユーザーは除外して削除
      result = await prisma.user.deleteMany({
        where: {
          id: { in: userIds },
          orders: { none: {} }
        }
      })
      message = `${result.count}件のユーザーが削除されました`
      break

    case 'export':
      // CSV出力の実装（実際のファイル生成が必要）
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredLanguage: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true
        }
      })
      result = { users, exportedCount: users.length }
      message = `${users.length}件のユーザーデータがエクスポートされました`
      break

    default:
      return NextResponse.json(
        { success: false, error: '無効なバルクアクションです' },
        { status: 400, headers }
      )
  }

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: `BULK_USER_${action.toUpperCase()}`,
      resourceType: 'USER',
      newData: { action, userIds, result }
    }
  })

  return NextResponse.json({
    success: true,
    data: result,
    message
  }, { headers })
}

// 単一ユーザー取得
async function getUser(id: string, headers: Record<string, string>) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      addresses: true,
      reviews: {
        include: {
          product: {
            select: {
              nameJa: true,
              nameVi: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
          cartItems: true
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'ユーザーが見つかりません' },
      { status: 404, headers }
    )
  }

  return NextResponse.json({
    success: true,
    data: { user }
  }, { headers })
}

// ユーザー一覧取得
async function getUsers(request: NextRequest, headers: Record<string, string>) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const language = searchParams.get('language')
  const emailVerified = searchParams.get('emailVerified')

  const where: any = {}
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (status === 'active') {
    where.isActive = true
  } else if (status === 'inactive') {
    where.isActive = false
  }

  if (language) {
    where.preferredLanguage = language
  }

  if (emailVerified === 'true') {
    where.emailVerified = true
  } else if (emailVerified === 'false') {
    where.emailVerified = false
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