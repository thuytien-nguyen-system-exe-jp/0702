import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VietFood Market - ベトナム料理専門ECサイト',
  description: 'ベトナム料理の食材・調味料・冷凍食品を日本全国に販売するECサイト',
  keywords: 'ベトナム料理, 食材, 調味料, 冷凍食品, フォー, 春巻き',
  authors: [{ name: 'VietFood Market' }],
  openGraph: {
    title: 'VietFood Market - ベトナム料理専門ECサイト',
    description: 'ベトナム料理の食材・調味料・冷凍食品を日本全国に販売するECサイト',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: 'vi_VN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}