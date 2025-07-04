import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  getAuthenticatedUser,
  sanitizeInput,
  isValidEmail,
  isValidPassword,
  checkRateLimit,
  getSecurityHeaders
} from '@/lib/auth'

// バリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください')
})

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  firstName: z.string().min(1, '名前を入力してください'),
  lastName: z.string().min(1, '姓を入力してください'),
  preferredLanguage: z.enum(['ja', 'vi']).optional()
})

// ログイン
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    // セキュリティヘッダーを設定
    const headers = getSecurityHeaders()

    if (action === 'login') {
      return await handleLogin(request, headers)
    } else if (action === 'register') {
      return await handleRegister(request, headers)
    } else if (action === 'logout') {
      return await handleLogout(request, headers)
    } else {
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400, headers }
      )
    }
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

// ログイン処理
async function handleLogin(request: NextRequest, headers: Record<string, string>) {
  try {
    const body = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // レート制限チェック
    if (!checkRateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: 'ログイン試行回数が上限に達しました。15分後に再試行してください。' },
        { status: 429, headers }
      )
    }

    // バリデーション
    const validatedData = loginSchema.parse(body)
    const email = sanitizeInput(validatedData.email.toLowerCase())
    const password = validatedData.password

    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        preferredLanguage: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401, headers }
      )
    }

    // パスワード検証
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401, headers }
      )
    }

    // JWTトークン生成
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    // 最終ログイン時刻を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // レスポンス作成
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          preferredLanguage: user.preferredLanguage,
          avatarUrl: user.avatarUrl
        },
        token
      },
      message: 'ログインに成功しました'
    }, { headers })

    // HTTPOnlyクッキーにトークンを設定
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7日間
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400, headers }
      )
    }
    throw error
  }
}

// 登録処理
async function handleRegister(request: NextRequest, headers: Record<string, string>) {
  try {
    const body = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // レート制限チェック
    if (!checkRateLimit(`register:${clientIP}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: '登録試行回数が上限に達しました。1時間後に再試行してください。' },
        { status: 429, headers }
      )
    }

    // バリデーション
    const validatedData = registerSchema.parse(body)
    const email = sanitizeInput(validatedData.email.toLowerCase())
    const password = validatedData.password
    const firstName = sanitizeInput(validatedData.firstName)
    const lastName = sanitizeInput(validatedData.lastName)
    const preferredLanguage = validatedData.preferredLanguage || 'ja'

    // パスワード強度チェック
    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400, headers }
      )
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        { status: 409, headers }
      )
    }

    // パスワードハッシュ化
    const passwordHash = await hashPassword(password)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        preferredLanguage
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredLanguage: true,
        avatarUrl: true
      }
    })

    // JWTトークン生成
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    // レスポンス作成
    const response = NextResponse.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'アカウントが正常に作成されました'
    }, { headers })

    // HTTPOnlyクッキーにトークンを設定
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7日間
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400, headers }
      )
    }
    throw error
  }
}

// ログアウト処理
async function handleLogout(request: NextRequest, headers: Record<string, string>) {
  const response = NextResponse.json({
    success: true,
    message: 'ログアウトしました'
  }, { headers })

  // クッキーを削除
  response.cookies.delete('auth-token')

  return response
}

// 現在のユーザー情報取得
export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401, headers }
      )
    }

    return NextResponse.json({
      success: true,
      data: { user }
    }, { headers })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}