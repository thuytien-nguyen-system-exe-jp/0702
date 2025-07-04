// 静的サイト用のモックデータ

export const mockProducts = [
  {
    id: '1',
    sku: 'FRUIT-MANGO-001',
    nameJa: 'ベトナム産マンゴー',
    nameVi: 'Xoài Việt Nam',
    price: 680,
    stockQuantity: 50,
    spiceLevel: 0,
    isFeatured: true,
    category: {
      nameJa: 'トロピカルフルーツ',
      nameVi: 'Trái cây nhiệt đới',
      slug: 'tropical-fruits'
    },
    brand: {
      name: 'Viet Garden',
      slug: 'viet-garden'
    },
    images: [
      {
        imageUrl: '/images/products/mango-1.svg',
        altText: 'ベトナム産マンゴー'
      }
    ],
    averageRating: 4.8,
    reviewCount: 24
  },
  {
    id: '2',
    sku: 'FRUIT-DRAGON-001',
    nameJa: 'ドラゴンフルーツ',
    nameVi: 'Thanh long',
    price: 450,
    stockQuantity: 30,
    spiceLevel: 0,
    isFeatured: true,
    category: {
      nameJa: 'トロピカルフルーツ',
      nameVi: 'Trái cây nhiệt đới',
      slug: 'tropical-fruits'
    },
    brand: {
      name: 'Viet Garden',
      slug: 'viet-garden'
    },
    images: [
      {
        imageUrl: '/images/products/dragon-fruit-1.svg',
        altText: 'ドラゴンフルーツ'
      }
    ],
    averageRating: 4.5,
    reviewCount: 18
  },
  {
    id: '3',
    sku: 'VEG-PAKCHOI-001',
    nameJa: 'チンゲン菜',
    nameVi: 'Cải thìa',
    price: 280,
    stockQuantity: 80,
    spiceLevel: 0,
    isFeatured: false,
    category: {
      nameJa: '葉物野菜',
      nameVi: 'Rau lá',
      slug: 'leafy-vegetables'
    },
    brand: {
      name: 'Hanoi Fresh',
      slug: 'hanoi-fresh'
    },
    images: [
      {
        imageUrl: '/images/products/pakchoi-1.svg',
        altText: '新鮮なチンゲン菜'
      }
    ],
    averageRating: 4.2,
    reviewCount: 12
  },
  {
    id: '4',
    sku: 'HERB-CILANTRO-001',
    nameJa: 'パクチー',
    nameVi: 'Rau mùi',
    price: 180,
    stockQuantity: 100,
    spiceLevel: 0,
    isFeatured: true,
    category: {
      nameJa: 'ハーブ',
      nameVi: 'Rau thơm',
      slug: 'herbs'
    },
    brand: {
      name: 'Hanoi Fresh',
      slug: 'hanoi-fresh'
    },
    images: [
      {
        imageUrl: '/images/products/cilantro-1.svg',
        altText: '新鮮なパクチー'
      }
    ],
    averageRating: 4.7,
    reviewCount: 31
  },
  {
    id: '5',
    sku: 'SAUCE-FISHSAUCE-001',
    nameJa: 'ベトナム魚醤（ヌクマム）',
    nameVi: 'Nước mắm Việt Nam',
    price: 580,
    stockQuantity: 60,
    spiceLevel: 0,
    isFeatured: false,
    category: {
      nameJa: '調味料',
      nameVi: 'Gia vị',
      slug: 'seasonings'
    },
    brand: {
      name: 'Saigon Spice',
      slug: 'saigon-spice'
    },
    images: [
      {
        imageUrl: '/images/products/fish-sauce-1.svg',
        altText: 'ベトナム魚醤（ヌクマム）'
      }
    ],
    averageRating: 4.9,
    reviewCount: 45
  },
  {
    id: '6',
    sku: 'SAUCE-CHILI-001',
    nameJa: 'ベトナムチリソース',
    nameVi: 'Tương ớt Việt Nam',
    price: 380,
    stockQuantity: 40,
    spiceLevel: 3,
    isFeatured: true,
    category: {
      nameJa: '調味料',
      nameVi: 'Gia vị',
      slug: 'seasonings'
    },
    brand: {
      name: 'Saigon Spice',
      slug: 'saigon-spice'
    },
    images: [
      {
        imageUrl: '/images/products/chili-sauce-1.svg',
        altText: 'ベトナムチリソース'
      }
    ],
    averageRating: 4.6,
    reviewCount: 28
  },
  {
    id: '7',
    sku: 'FROZEN-DUMPLING-001',
    nameJa: 'ベトナム風餃子（冷凍）',
    nameVi: 'Bánh bao Việt Nam (đông lạnh)',
    price: 680,
    stockQuantity: 25,
    spiceLevel: 1,
    isFeatured: false,
    category: {
      nameJa: '冷凍食品',
      nameVi: 'Thực phẩm đông lạnh',
      slug: 'frozen-foods'
    },
    brand: {
      name: 'Hanoi Fresh',
      slug: 'hanoi-fresh'
    },
    images: [
      {
        imageUrl: '/images/products/dumpling-1.svg',
        altText: 'ベトナム風餃子（冷凍）'
      }
    ],
    averageRating: 4.4,
    reviewCount: 19
  },
  {
    id: '8',
    sku: 'SNACK-RICEPAPER-001',
    nameJa: 'ベトナム風ライスペーパースナック',
    nameVi: 'Bánh tráng nướng',
    price: 320,
    stockQuantity: 70,
    spiceLevel: 2,
    isFeatured: true,
    category: {
      nameJa: 'お菓子',
      nameVi: 'Bánh kẹo',
      slug: 'snacks'
    },
    brand: {
      name: 'Saigon Spice',
      slug: 'saigon-spice'
    },
    images: [
      {
        imageUrl: '/images/products/rice-paper-snack-1.svg',
        altText: 'ベトナム風ライスペーパースナック'
      }
    ],
    averageRating: 4.3,
    reviewCount: 22
  },
  {
    id: '9',
    sku: 'DRINK-COCONUT-001',
    nameJa: 'ベトナム産ココナッツウォーター',
    nameVi: 'Nước dừa Việt Nam',
    price: 280,
    stockQuantity: 90,
    spiceLevel: 0,
    isFeatured: false,
    category: {
      nameJa: '飲料',
      nameVi: 'Đồ uống',
      slug: 'beverages'
    },
    brand: {
      name: 'Viet Garden',
      slug: 'viet-garden'
    },
    images: [
      {
        imageUrl: '/images/products/coconut-water-1.svg',
        altText: 'ベトナム産ココナッツウォーター'
      }
    ],
    averageRating: 4.1,
    reviewCount: 15
  }
]

export const mockCategories = [
  {
    id: '1',
    nameJa: '果物',
    nameVi: 'Trái cây',
    slug: 'fruits'
  },
  {
    id: '2',
    nameJa: '野菜',
    nameVi: 'Rau củ',
    slug: 'vegetables'
  },
  {
    id: '3',
    nameJa: '調味料',
    nameVi: 'Gia vị',
    slug: 'seasonings'
  },
  {
    id: '4',
    nameJa: '冷凍食品',
    nameVi: 'Thực phẩm đông lạnh',
    slug: 'frozen-foods'
  },
  {
    id: '5',
    nameJa: 'お菓子',
    nameVi: 'Bánh kẹo',
    slug: 'snacks'
  },
  {
    id: '6',
    nameJa: '飲料',
    nameVi: 'Đồ uống',
    slug: 'beverages'
  }
]

export const mockBrands = [
  {
    id: '1',
    name: 'Viet Garden',
    slug: 'viet-garden'
  },
  {
    id: '2',
    name: 'Saigon Spice',
    slug: 'saigon-spice'
  },
  {
    id: '3',
    name: 'Hanoi Fresh',
    slug: 'hanoi-fresh'
  }
]