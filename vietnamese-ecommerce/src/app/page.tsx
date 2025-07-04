import Link from 'next/link'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/shared/Button'

export default function HomePage() {
  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="section-hero text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
            本格ベトナム料理を<br />ご自宅で
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            新鮮な食材と本場の調味料で、本格的なベトナム料理をお楽しみください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <Link href="/products">
              <Button size="lg" className="text-lg px-8 py-3 hover-lift">
                商品を見る
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-3 hover-lift">
                レシピを見る
              </Button>
            </Link>
          </div>
        </div>
        {/* 装飾的な要素 */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white opacity-10 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white opacity-5 rounded-full animate-pulse"></div>
      </section>

      {/* 特集カテゴリ */}
      <section className="section-features py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient">
            人気カテゴリ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'フォー・麺類', emoji: '🍜', count: '25商品', href: '/categories/noodles' },
              { name: '調味料・ソース', emoji: '🥄', count: '40商品', href: '/categories/sauces' },
              { name: '冷凍食品', emoji: '🧊', count: '30商品', href: '/categories/frozen' },
              { name: 'スープ・ブロス', emoji: '🍲', count: '15商品', href: '/categories/soup' }
            ].map((category, index) => (
              <Link key={index} href={category.href} className="group">
                <div className="card-gradient rounded-xl shadow-sm hover-lift p-6 text-center transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-warm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{category.emoji}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-red-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特集商品 */}
      <section className="section-products py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient">
            おすすめ商品
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'フォー・ボー（牛肉フォー）', price: '¥1,200', originalPrice: '¥1,500', spiceLevel: 2, emoji: '🍜' },
              { name: 'ヌクマム（魚醤）', price: '¥800', originalPrice: null, spiceLevel: 0, emoji: '🐟' },
              { name: '冷凍生春巻き（10個入り）', price: '¥1,800', originalPrice: '¥2,000', spiceLevel: 1, emoji: '🥬' },
              { name: 'バインミー用パン（5個入り）', price: '¥600', originalPrice: null, spiceLevel: 0, emoji: '🥖' }
            ].map((product, index) => (
              <div key={index} className="product-card hover-lift">
                <div className="aspect-square bg-gradient-warm rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <span className="text-6xl">{product.emoji}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-3 text-sm line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="price-display text-lg">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    {product.spiceLevel > 0 && (
                      <div className="flex items-center spice-indicator">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < product.spiceLevel ? 'text-red-500' : 'text-gray-300'}`}>
                            🌶️
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="w-full hover-lift">
                    カートに追加
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ベトナム料理について */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl font-bold mb-6 text-gradient">
                本格ベトナム料理の魅力
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                ベトナム料理は、新鮮なハーブと野菜、バランスの取れた味付けが特徴です。
                フォーやバインミー、生春巻きなど、健康的で美味しい料理を、
                本場の食材と調味料でご自宅でお楽しみいただけます。
              </p>
              <div className="space-y-4">
                {[
                  '新鮮で高品質な食材',
                  '本場ベトナムから直輸入',
                  '冷凍・冷蔵配送で新鮮さをキープ'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center animate-fadeInUp" style={{animationDelay: `${0.2 * (index + 1)}s`}}>
                    <div className="w-8 h-8 bg-gradient-green rounded-full flex items-center justify-center mr-3 hover-lift">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-warm aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden hover-lift">
              <span className="text-8xl">🍲</span>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-200 opacity-30"></div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}