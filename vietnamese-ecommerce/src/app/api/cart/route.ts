import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSecurityHeaders, verifyAuth } from '@/lib/auth'

// カートアイテム追加のバリデーションスキーマ
const addToCartSchema = z.object({
  productId: z.string().min(1, '商品IDが必要です'),
  productVariantId: z.string().optional(),
  quantity: z.number().min(1, '数量は1以上である必要があります').max(99, '数量は99以下である必要があります')
})

// カートアイテム更新のバリデーションスキーマ
const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1, 'カートアイテムIDが必要です'),
  quantity: z.number().min(0, '数量は0以上である必要があります').max(99, '数量は99以下である必要があります')
})

// カートアイテム削除のバリデーションスキーマ
const removeFromCartSchema = z.object({
  cartItemId: z.string().min(1, 'カートアイテムIDが必要です')
})

// カート内容取得
export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    
    // 認証チェック（オプション - ゲストユーザーも許可）
    const authResult = await verifyAuth(request)
    
    if (!authResult.success) {
      // ゲストユーザーの場合は空のカートを返す
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          summary: {
            totalItems: 0,
            subtotal: 0,
            tax: 0,
            shipping: 500, // デフォルト送料
            total: 500
          }
        }
      }, { headers })
    }

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: '認証情報が無効です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user.id

    // ユーザーのカートアイテムを取得
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
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
          }
        },
        productVariant: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // カート合計を計算
    let subtotal = 0
    const processedItems = cartItems.map((item: any) => {
      const unitPrice = item.product.price + (item.productVariant?.priceModifier || 0)
      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice

      return {
        id: item.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        product: {
          id: item.product.id,
          sku: item.product.sku,
          nameJa: item.product.nameJa,
          nameVi: item.product.nameVi,
          price: item.product.price,
          stockQuantity: item.product.stockQuantity,
          images: item.product.images,
          category: item.product.category
        },
        productVariant: item.productVariant ? {
          id: item.productVariant.id,
          name: item.productVariant.name,
          value: item.productVariant.value,
          priceModifier: item.productVariant.priceModifier,
          stockQuantity: item.productVariant.stockQuantity
        } : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    })

    // 税金と送料を計算
    const tax = Math.round(subtotal * 0.1) // 10%の消費税
    const freeShippingThreshold = 5000
    const shipping = subtotal >= freeShippingThreshold ? 0 : 500
    const total = subtotal + tax + shipping

    const summary = {
      totalItems: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal,
      tax,
      shipping,
      total,
      freeShippingThreshold,
      amountForFreeShipping: Math.max(0, freeShippingThreshold - subtotal)
    }

    return NextResponse.json({
      success: true,
      data: {
        items: processedItems,
        summary
      }
    }, { headers })

  } catch (error) {
    console.error('Cart GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// カートに商品を追加
export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const body = await request.json()

    // バリデーション
    const validatedData = addToCartSchema.parse(body)
    const { productId, productVariantId, quantity } = validatedData

    // 認証チェック
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401, headers }
      )
    }

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: '認証情報が無効です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user.id

    // 商品の存在と在庫をチェック
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: productVariantId ? {
          where: { id: productVariantId }
        } : false
      }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: '商品が見つかりません' },
        { status: 404, headers }
      )
    }

    // バリアントが指定されている場合のチェック
    let variant = null
    if (productVariantId) {
      variant = product.variants?.[0]
      if (!variant || !variant.isActive) {
        return NextResponse.json(
          { success: false, error: 'バリアントが見つかりません' },
          { status: 404, headers }
        )
      }
    }

    // 在庫チェック
    const availableStock = variant?.stockQuantity ?? product.stockQuantity
    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: '在庫が不足しています' },
        { status: 400, headers }
      )
    }

    // 既存のカートアイテムをチェック
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        productVariantId: productVariantId || null
      }
    })

    let cartItem
    if (existingCartItem) {
      // 既存アイテムの数量を更新
      const newQuantity = existingCartItem.quantity + quantity
      
      // 新しい数量での在庫チェック
      if (availableStock < newQuantity) {
        return NextResponse.json(
          { success: false, error: '在庫が不足しています' },
          { status: 400, headers }
        )
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { 
          quantity: newQuantity,
          updatedAt: new Date()
        }
      })
    } else {
      // 新しいカートアイテムを作成
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          productVariantId: productVariantId || null,
          quantity
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: { cartItem },
      message: 'カートに追加しました'
    }, { headers })

  } catch (error) {
    console.error('Cart POST API error:', error)
    
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

// カートアイテムの数量を更新
export async function PUT(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const body = await request.json()

    // バリデーション
    const validatedData = updateCartItemSchema.parse(body)
    const { cartItemId, quantity } = validatedData

    // 認証チェック
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401, headers }
      )
    }

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: '認証情報が無効です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user.id

    // カートアイテムの存在チェック
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId
      },
      include: {
        product: true,
        productVariant: true
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'カートアイテムが見つかりません' },
        { status: 404, headers }
      )
    }

    // 数量が0の場合は削除
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      })

      return NextResponse.json({
        success: true,
        message: 'カートから削除しました'
      }, { headers })
    }

    // 在庫チェック
    const availableStock = cartItem.productVariant?.stockQuantity ?? cartItem.product.stockQuantity
    if (availableStock < quantity) {
      return NextResponse.json(
        { success: false, error: '在庫が不足しています' },
        { status: 400, headers }
      )
    }

    // 数量を更新
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { 
        quantity,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: { cartItem: updatedCartItem },
      message: '数量を更新しました'
    }, { headers })

  } catch (error) {
    console.error('Cart PUT API error:', error)
    
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

// カートアイテムを削除
export async function DELETE(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')

    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: 'カートアイテムIDが必要です' },
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

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: '認証情報が無効です' },
        { status: 401, headers }
      )
    }

    const userId = authResult.user.id

    // カートアイテムの存在チェック
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'カートアイテムが見つかりません' },
        { status: 404, headers }
      )
    }

    // カートアイテムを削除
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    return NextResponse.json({
      success: true,
      message: 'カートから削除しました'
    }, { headers })

  } catch (error) {
    console.error('Cart DELETE API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}