import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedAdmin, getSecurityHeaders } from '@/lib/auth'

// 管理者認証状態確認
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

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    }, { headers })
  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}