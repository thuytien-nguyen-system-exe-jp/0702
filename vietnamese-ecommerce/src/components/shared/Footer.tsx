import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FooterLink {
  href: string
  label: {
    ja: string
    vi: string
  }
}

interface FooterSection {
  title: {
    ja: string
    vi: string
  }
  links: FooterLink[]
}

interface FooterProps {
  language?: 'ja' | 'vi'
  className?: string
}

const defaultFooterSections: FooterSection[] = [
  {
    title: { ja: '商品カテゴリ', vi: 'Danh mục sản phẩm' },
    links: [
      { href: '/categories/noodles', label: { ja: '麺類', vi: 'Mì' } },
      { href: '/categories/sauces', label: { ja: '調味料', vi: 'Gia vị' } },
      { href: '/categories/frozen', label: { ja: '冷凍食品', vi: 'Thực phẩm đông lạnh' } },
      { href: '/categories/soup', label: { ja: 'スープ・ブロス', vi: 'Súp & Nước dùng' } }
    ]
  },
  {
    title: { ja: 'サポート', vi: 'Hỗ trợ' },
    links: [
      { href: '/contact', label: { ja: 'お問い合わせ', vi: 'Liên hệ' } },
      { href: '/shipping', label: { ja: '配送について', vi: 'Vận chuyển' } },
      { href: '/returns', label: { ja: '返品・交換', vi: 'Đổi trả' } },
      { href: '/faq', label: { ja: 'よくある質問', vi: 'Câu hỏi thường gặp' } }
    ]
  },
  {
    title: { ja: '会社情報', vi: 'Thông tin công ty' },
    links: [
      { href: '/about', label: { ja: '会社概要', vi: 'Giới thiệu' } },
      { href: '/privacy', label: { ja: 'プライバシーポリシー', vi: 'Chính sách bảo mật' } },
      { href: '/terms', label: { ja: '利用規約', vi: 'Điều khoản sử dụng' } },
      { href: '/legal', label: { ja: '特定商取引法', vi: 'Thông tin pháp lý' } }
    ]
  }
]

const socialLinks = [
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875zm-4.262 9.781c-2.379 0-4.262-1.883-4.262-4.262s1.883-4.262 4.262-4.262 4.262 1.883 4.262 4.262-1.883 4.262-4.262 4.262z"/>
      </svg>
    )
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  }
]

const Footer: React.FC<FooterProps> = ({ language = 'ja', className }) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ブランド情報 */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold text-red-400 mb-4 block">
              VietFood Market
            </Link>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {language === 'ja' 
                ? '本格ベトナム料理の食材を日本全国にお届けします。新鮮で高品質な商品をお楽しみください。'
                : 'Chúng tôi cung cấp nguyên liệu ẩm thực Việt Nam chính gốc đến khắp Nhật Bản. Hãy thưởng thức các sản phẩm tươi ngon và chất lượng cao.'
              }
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* フッターリンク */}
          {defaultFooterSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4 text-white">
                {section.title[language]}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                    >
                      {link.label[language]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ニュースレター登録 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="font-semibold mb-2">
                {language === 'ja' ? 'ニュースレター登録' : 'Đăng ký nhận tin'}
              </h4>
              <p className="text-gray-400 text-sm">
                {language === 'ja' 
                  ? '新商品やお得な情報をお届けします'
                  : 'Nhận thông tin sản phẩm mới và ưu đãi đặc biệt'
                }
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder={language === 'ja' ? 'メールアドレス' : 'Địa chỉ email'}
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                {language === 'ja' ? '登録' : 'Đăng ký'}
              </button>
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; {currentYear} VietFood Market. {language === 'ja' ? 'All rights reserved.' : 'Tất cả quyền được bảo lưu.'}
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
export type { FooterProps, FooterLink, FooterSection }