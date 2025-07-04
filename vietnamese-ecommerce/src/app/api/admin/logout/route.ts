import { NextRequest, NextResponse } from 'next/server'
import { getSecurityHeaders } from '@/lib/auth'

// 管理者ログアウト
export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders()
    
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました'
    }, { headers })

    // クッキーを削除
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { success: false, error: 'ログアウトエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}