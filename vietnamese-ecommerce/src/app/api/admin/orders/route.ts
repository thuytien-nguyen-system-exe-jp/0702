import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedAdmin, getSecurityHeaders } from '@/lib/auth'

// 注文ステータス更新スキーマ
const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, '注文IDは必須です'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional()
})

// 注文更新
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

    if (action === 'updateStatus') {
      return await updateOrderStatus(data, admin, headers)
    } else if (action === 'updatePaymentStatus') {
      return await updatePaymentStatus(data, admin, headers)
    } else if (action === 'updateShippingStatus') {
      return await updateShippingStatus(data, admin, headers)
    } else if (action === 'addNote') {
      return await addOrderNote(data, admin, headers)
    } else if (action === 'refund') {
      return await processRefund(data, admin, headers)
    } else {
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400, headers }
      )
    }
  } catch (error) {
    console.error('Admin orders API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 注文取得
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
      return await getOrder(id, headers)
    } else {
      return await getOrders(request, headers)
    }
  } catch (error) {
    console.error('Admin orders GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// 注文ステータス更新処理
async function updateOrderStatus(data: any, admin: any, headers: Record<string, string>) {
  const validatedData = updateOrderStatusSchema.parse(data)
  const { orderId, status, notes } = validatedData

  // 注文の存在確認
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!existingOrder) {
    return NextResponse.json(
      { success: false, error: '注文が見つかりません' },
      { status: 404, headers }
    )
  }

  // ステータス変更の妥当性チェック
  if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
    return NextResponse.json(
      { success: false, error: 'キャンセルされた注文のステータスは変更できません' },
      { status: 400, headers }
    )
  }

  if (existingOrder.status === 'delivered' && status !== 'delivered') {
    return NextResponse.json(
      { success: false, error: '配達完了した注文のステータスは変更できません' },
      { status: 400, headers }
    )
  }

  // 注文ステータス更新
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { 
      status,
      updatedAt: new Date(),
      // 発送済みの場合は発送日を設定
      ...(status === 'shipped' && !existingOrder.shippedAt && { shippedAt: new Date() }),
      // 配達完了の場合は配達日を設定
      ...(status === 'delivered' && !existingOrder.deliveredAt && { deliveredAt: new Date() }),
      // キャンセルの場合はキャンセル日を設定
      ...(status === 'cancelled' && !existingOrder.cancelledAt && { cancelledAt: new Date() })
    }
  })

  // ステータス履歴を追加
  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status,
      notes: notes || `管理者 ${admin.name} によりステータスが「${getStatusText(status)}」に更新されました`
    }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE_ORDER_STATUS',
      resourceType: 'ORDER',
      resourceId: orderId,
      oldData: { status: existingOrder.status },
      newData: { status, notes }
    }
  })

  return NextResponse.json({
    success: true,
    data: { order },
    message: `注文ステータスが「${getStatusText(status)}」に更新されました`
  }, { headers })
}

// 支払いステータス更新処理
async function updatePaymentStatus(data: any, admin: any, headers: Record<string, string>) {
  const { orderId, paymentStatus, notes } = data

  if (!orderId || !paymentStatus) {
    return NextResponse.json(
      { success: false, error: '注文IDと支払いステータスが必要です' },
      { status: 400, headers }
    )
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { 
      paymentStatus,
      updatedAt: new Date()
    }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE_PAYMENT_STATUS',
      resourceType: 'ORDER',
      resourceId: orderId,
      newData: { paymentStatus, notes }
    }
  })

  return NextResponse.json({
    success: true,
    data: { order },
    message: '支払いステータスが更新されました'
  }, { headers })
}

// 配送ステータス更新処理
async function updateShippingStatus(data: any, admin: any, headers: Record<string, string>) {
  const { orderId, shippingStatus, trackingNumber, notes } = data

  if (!orderId || !shippingStatus) {
    return NextResponse.json(
      { success: false, error: '注文IDと配送ステータスが必要です' },
      { status: 400, headers }
    )
  }

  const updateData: any = { 
    shippingStatus,
    updatedAt: new Date()
  }

  if (trackingNumber) {
    updateData.trackingNumber = trackingNumber
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'UPDATE_SHIPPING_STATUS',
      resourceType: 'ORDER',
      resourceId: orderId,
      newData: { shippingStatus, trackingNumber, notes }
    }
  })

  return NextResponse.json({
    success: true,
    data: { order },
    message: '配送ステータスが更新されました'
  }, { headers })
}

// 注文メモ追加処理
async function addOrderNote(data: any, admin: any, headers: Record<string, string>) {
  const { orderId, notes } = data

  if (!orderId || !notes) {
    return NextResponse.json(
      { success: false, error: '注文IDとメモが必要です' },
      { status: 400, headers }
    )
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { 
      notes: notes,
      updatedAt: new Date()
    }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'ADD_ORDER_NOTE',
      resourceType: 'ORDER',
      resourceId: orderId,
      newData: { notes }
    }
  })

  return NextResponse.json({
    success: true,
    data: { order },
    message: 'メモが追加されました'
  }, { headers })
}

// 返金処理
async function processRefund(data: any, admin: any, headers: Record<string, string>) {
  const { orderId, amount, reason } = data

  if (!orderId || !amount) {
    return NextResponse.json(
      { success: false, error: '注文IDと返金額が必要です' },
      { status: 400, headers }
    )
  }

  // 注文の存在確認
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    return NextResponse.json(
      { success: false, error: '注文が見つかりません' },
      { status: 404, headers }
    )
  }

  if (order.paymentStatus !== 'paid') {
    return NextResponse.json(
      { success: false, error: '支払い済みの注文のみ返金できます' },
      { status: 400, headers }
    )
  }

  // 返金処理（実際の決済システムとの連携が必要）
  // ここでは簡易的にステータス更新のみ
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { 
      paymentStatus: 'refunded',
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date()
    }
  })

  // 管理者ログを記録
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'PROCESS_REFUND',
      resourceType: 'ORDER',
      resourceId: orderId,
      newData: { amount, reason }
    }
  })

  return NextResponse.json({
    success: true,
    data: { order: updatedOrder },
    message: '返金処理が完了しました'
  }, { headers })
}

// 単一注文取得
async function getOrder(id: string, headers: Record<string, string>) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              nameJa: true,
              nameVi: true,
              sku: true,
              images: {
                take: 1,
                orderBy: { sortOrder: 'asc' }
              }
            }
          },
          productVariant: true
        }
      },
      shippingAddress: true,
      billingAddress: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!order) {
    return NextResponse.json(
      { success: false, error: '注文が見つかりません' },
      { status: 404, headers }
    )
  }

  return NextResponse.json({
    success: true,
    data: { order }
  }, { headers })
}

// 注文一覧取得
async function getOrders(request: NextRequest, headers: Record<string, string>) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const paymentStatus = searchParams.get('paymentStatus')
  const shippingStatus = searchParams.get('shippingStatus')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where: any = {}
  
  if (status) {
    where.status = status
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus
  }

  if (shippingStatus) {
    where.shippingStatus = shippingStatus
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }
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

// ステータステキスト取得
function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return '注文確認中'
    case 'processing': return '処理中'
    case 'shipped': return '発送済み'
    case 'delivered': return '配達完了'
    case 'cancelled': return 'キャンセル'
    default: return status
  }
}