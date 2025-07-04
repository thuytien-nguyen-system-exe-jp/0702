import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { AuthUser } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = '7d'

// モックユーザーデータ（静的サイト用）
const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    preferredLanguage: 'ja',
    avatarUrl: null,
    isActive: true,
    hashedPassword: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.LVtOy' // password: demo123
  }
]

const mockAdmins = [
  {
    id: 'admin1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
    isActive: true,
    hashedPassword: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.LVtOy' // password: admin123
  }
]

// パスワードハッシュ化
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// パスワード検証
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWTトークン生成
export function generateToken(payload: { userId: string; email: string; role?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// JWTトークン検証
export function verifyToken(token: string): { userId: string; email: string; role?: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    return null
  }
}

// リクエストからトークンを取得
export function getTokenFromRequest(request: NextRequest): string | null {
  // Authorization ヘッダーから取得
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Cookieから取得
  const token = request.cookies.get('auth-token')?.value
  return token || null
}

// 認証されたユーザー情報を取得（モック版）
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  try {
    const user = mockUsers.find(u => u.id === decoded.userId && u.isActive)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredLanguage: user.preferredLanguage,
      avatarUrl: user.avatarUrl || undefined
    }
  } catch (error) {
    console.error('Error fetching authenticated user:', error)
    return null
  }
}

// 認証チェック（成功/失敗の結果を返す）
export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return { success: false, error: '認証が必要です' }
    }
    return { success: true, user }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { success: false, error: '認証エラーが発生しました' }
  }
}

// 管理者認証チェック
export async function verifyAdminAuth(request: NextRequest): Promise<{ success: boolean; admin?: any; error?: string }> {
  try {
    const admin = await getAuthenticatedAdmin(request)
    if (!admin) {
      return { success: false, error: '管理者認証が必要です' }
    }
    return { success: true, admin }
  } catch (error) {
    console.error('Admin auth verification error:', error)
    return { success: false, error: '管理者認証エラーが発生しました' }
  }
}

// 管理者認証（モック版）
export async function getAuthenticatedAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded || decoded.role !== 'admin') return null

  try {
    const admin = mockAdmins.find(a => a.id === decoded.userId && a.isActive)
    if (!admin) return null

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive
    }
  } catch (error) {
    console.error('Error fetching authenticated admin:', error)
    return null
  }
}

// モック認証関数（静的サイト用）
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const user = mockUsers.find(u => u.email === email && u.isActive)
  if (!user) return null

  const isValidPassword = await verifyPassword(password, user.hashedPassword)
  if (!isValidPassword) return null

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    preferredLanguage: user.preferredLanguage,
    avatarUrl: user.avatarUrl || undefined
  }
}

// モック管理者認証関数（静的サイト用）
export async function authenticateAdmin(email: string, password: string) {
  const admin = mockAdmins.find(a => a.email === email && a.isActive)
  if (!admin) return null

  const isValidPassword = await verifyPassword(password, admin.hashedPassword)
  if (!isValidPassword) return null

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions,
    isActive: admin.isActive
  }
}

// 入力値のサニタイゼーション
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// メールアドレスの検証
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// パスワード強度の検証
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'パスワードは8文字以上である必要があります' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'パスワードには小文字を含める必要があります' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'パスワードには大文字を含める必要があります' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'パスワードには数字を含める必要があります' }
  }

  return { valid: true }
}

// レート制限チェック（簡易版）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

// セキュリティヘッダーの設定
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  }
}