import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 データベースのシードを開始します...')

  // 管理者ユーザーを作成
  console.log('👤 管理者ユーザーを作成中...')
  const adminPassword = await bcrypt.hash('admin123456', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@vietfoodmarket.com' },
    update: {},
    create: {
      email: 'admin@vietfoodmarket.com',
      passwordHash: adminPassword,
      name: '管理者',
      role: 'super_admin',
      permissions: {
        products: { view: true, create: true, update: true, delete: true, import: true, export: true },
        orders: { view: true, update: true, cancel: true, refund: true },
        users: { view: true, update: true, delete: true },
        inventory: { view: true, adjust: true, receive: true },
        analytics: { view: true, export: true },
        settings: { view: true, update: true },
        admins: { view: true, create: true, update: true, delete: true }
      }
    }
  })

  // テストユーザーを作成
  console.log('👥 テストユーザーを作成中...')
  const userPassword = await bcrypt.hash('user123456', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: userPassword,
      firstName: '太郎',
      lastName: '田中',
      preferredLanguage: 'ja',
      emailVerified: true
    }
  })

  // ブランドを作成
  console.log('🏷️ ブランドを作成中...')
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'viet-garden' },
      update: {},
      create: {
        name: 'Viet Garden',
        slug: 'viet-garden',
        descriptionJa: 'ベトナム産の新鮮な野菜と果物を提供する信頼のブランド',
        descriptionVi: 'Thương hiệu uy tín cung cấp rau củ và trái cây tươi ngon từ Việt Nam',
        countryOrigin: 'Vietnam'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'saigon-spice' },
      update: {},
      create: {
        name: 'Saigon Spice',
        slug: 'saigon-spice',
        descriptionJa: 'サイゴンの伝統的な調味料とスパイスの専門ブランド',
        descriptionVi: 'Thương hiệu chuyên về gia vị và gia vị truyền thống Sài Gòn',
        countryOrigin: 'Vietnam'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'hanoi-fresh' },
      update: {},
      create: {
        name: 'Hanoi Fresh',
        slug: 'hanoi-fresh',
        descriptionJa: 'ハノイから直送される新鮮な食材',
        descriptionVi: 'Thực phẩm tươi sống được vận chuyển trực tiếp từ Hà Nội',
        countryOrigin: 'Vietnam'
      }
    })
  ])

  // カテゴリを作成
  console.log('📂 カテゴリを作成中...')
  const categories = await Promise.all([
    // 親カテゴリ
    prisma.category.upsert({
      where: { slug: 'fruits' },
      update: {},
      create: {
        nameJa: '果物',
        nameVi: 'Trái cây',
        slug: 'fruits',
        descriptionJa: 'ベトナム産の新鮮で美味しい果物',
        descriptionVi: 'Trái cây tươi ngon từ Việt Nam',
        sortOrder: 1
      }
    }),
    prisma.category.upsert({
      where: { slug: 'vegetables' },
      update: {},
      create: {
        nameJa: '野菜',
        nameVi: 'Rau củ',
        slug: 'vegetables',
        descriptionJa: 'ベトナム料理に欠かせない新鮮な野菜',
        descriptionVi: 'Rau củ tươi ngon không thể thiếu trong ẩm thực Việt Nam',
        sortOrder: 2
      }
    }),
    prisma.category.upsert({
      where: { slug: 'seasonings' },
      update: {},
      create: {
        nameJa: '調味料',
        nameVi: 'Gia vị',
        slug: 'seasonings',
        descriptionJa: 'ベトナム料理の味を決める伝統的な調味料',
        descriptionVi: 'Gia vị truyền thống quyết định hương vị món ăn Việt Nam',
        sortOrder: 3
      }
    }),
    prisma.category.upsert({
      where: { slug: 'frozen-foods' },
      update: {},
      create: {
        nameJa: '冷凍食品',
        nameVi: 'Thực phẩm đông lạnh',
        slug: 'frozen-foods',
        descriptionJa: '便利で美味しい冷凍食品',
        descriptionVi: 'Thực phẩm đông lạnh tiện lợi và ngon miệng',
        sortOrder: 4
      }
    }),
    prisma.category.upsert({
      where: { slug: 'snacks' },
      update: {},
      create: {
        nameJa: 'お菓子',
        nameVi: 'Bánh kẹo',
        slug: 'snacks',
        descriptionJa: 'ベトナムの伝統的なお菓子とスナック',
        descriptionVi: 'Bánh kẹo và snack truyền thống Việt Nam',
        sortOrder: 5
      }
    }),
    prisma.category.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: {
        nameJa: '飲料',
        nameVi: 'Đồ uống',
        slug: 'beverages',
        descriptionJa: 'ベトナムの伝統的な飲み物',
        descriptionVi: 'Đồ uống truyền thống Việt Nam',
        sortOrder: 6
      }
    })
  ])

  // 子カテゴリを作成
  console.log('📁 子カテゴリを作成中...')
  const subCategories = await Promise.all([
    // 果物の子カテゴリ
    prisma.category.upsert({
      where: { slug: 'tropical-fruits' },
      update: {},
      create: {
        nameJa: 'トロピカルフルーツ',
        nameVi: 'Trái cây nhiệt đới',
        slug: 'tropical-fruits',
        parentId: categories[0].id,
        sortOrder: 1
      }
    }),
    prisma.category.upsert({
      where: { slug: 'citrus-fruits' },
      update: {},
      create: {
        nameJa: '柑橘類',
        nameVi: 'Trái cây có múi',
        slug: 'citrus-fruits',
        parentId: categories[0].id,
        sortOrder: 2
      }
    }),
    // 野菜の子カテゴリ
    prisma.category.upsert({
      where: { slug: 'leafy-vegetables' },
      update: {},
      create: {
        nameJa: '葉物野菜',
        nameVi: 'Rau lá',
        slug: 'leafy-vegetables',
        parentId: categories[1].id,
        sortOrder: 1
      }
    }),
    prisma.category.upsert({
      where: { slug: 'herbs' },
      update: {},
      create: {
        nameJa: 'ハーブ',
        nameVi: 'Rau thơm',
        slug: 'herbs',
        parentId: categories[1].id,
        sortOrder: 2
      }
    })
  ])

  // 商品を作成
  console.log('🛍️ 商品を作成中...')
  const products = await Promise.all([
    // 果物
    prisma.product.create({
      data: {
        sku: 'FRUIT-MANGO-001',
        nameJa: 'ベトナム産マンゴー',
        nameVi: 'Xoài Việt Nam',
        descriptionJa: '甘くてジューシーなベトナム産の完熟マンゴー。そのまま食べても、デザートにしても美味しい。',
        descriptionVi: 'Xoài chín ngọt và mọng nước từ Việt Nam. Ngon khi ăn trực tiếp hoặc làm tráng miệng.',
        price: 680,
        costPrice: 400,
        stockQuantity: 50,
        categoryId: subCategories[0].id, // トロピカルフルーツ
        brandId: brands[0].id, // Viet Garden
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: '皮をむいてそのままお召し上がりください。',
        cookingInstructionsVi: 'Gọt vỏ và ăn trực tiếp.',
        storageType: 'refrigerated',
        shelfLifeDays: 7,
        weight: 0.5,
        isFeatured: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'FRUIT-DRAGON-001',
        nameJa: 'ドラゴンフルーツ',
        nameVi: 'Thanh long',
        descriptionJa: '見た目も美しいドラゴンフルーツ。さっぱりとした甘さで、ビタミンCが豊富。',
        descriptionVi: 'Thanh long đẹp mắt với vị ngọt thanh mát, giàu vitamin C.',
        price: 450,
        costPrice: 250,
        stockQuantity: 30,
        categoryId: subCategories[0].id,
        brandId: brands[0].id,
        spiceLevel: 0,
        allergenInfo: [],
        storageType: 'refrigerated',
        shelfLifeDays: 5,
        weight: 0.4,
        isFeatured: true
      }
    }),
    // 野菜
    prisma.product.create({
      data: {
        sku: 'VEG-PAKCHOI-001',
        nameJa: 'チンゲン菜',
        nameVi: 'Cải thìa',
        descriptionJa: 'シャキシャキとした食感が楽しめる新鮮なチンゲン菜。炒め物やスープに最適。',
        descriptionVi: 'Cải thìa tươi giòn, thích hợp cho món xào và canh.',
        price: 280,
        costPrice: 150,
        stockQuantity: 80,
        categoryId: subCategories[2].id, // 葉物野菜
        brandId: brands[2].id, // Hanoi Fresh
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: '炒め物やスープにご利用ください。',
        cookingInstructionsVi: 'Sử dụng để xào hoặc nấu canh.',
        storageType: 'refrigerated',
        shelfLifeDays: 3,
        weight: 0.3
      }
    }),
    prisma.product.create({
      data: {
        sku: 'HERB-CILANTRO-001',
        nameJa: 'パクチー',
        nameVi: 'Rau mùi',
        descriptionJa: 'ベトナム料理には欠かせない新鮮なパクチー。独特の香りが料理を引き立てます。',
        descriptionVi: 'Rau mùi tươi không thể thiếu trong ẩm thực Việt Nam. Mùi thơm đặc trưng làm tăng hương vị món ăn.',
        price: 180,
        costPrice: 80,
        stockQuantity: 100,
        categoryId: subCategories[3].id, // ハーブ
        brandId: brands[2].id,
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: 'フォーやバインミーのトッピングに。',
        cookingInstructionsVi: 'Dùng làm topping cho phở và bánh mì.',
        storageType: 'refrigerated',
        shelfLifeDays: 2,
        weight: 0.1,
        isFeatured: true
      }
    }),
    // 調味料
    prisma.product.create({
      data: {
        sku: 'SAUCE-FISHSAUCE-001',
        nameJa: 'ベトナム魚醤（ヌクマム）',
        nameVi: 'Nước mắm Việt Nam',
        descriptionJa: 'ベトナム料理の基本調味料。深いうま味が特徴の伝統的な魚醤。',
        descriptionVi: 'Gia vị cơ bản của ẩm thực Việt Nam. Nước mắm truyền thống với vị umami đậm đà.',
        price: 580,
        costPrice: 320,
        stockQuantity: 60,
        categoryId: categories[2].id, // 調味料
        brandId: brands[1].id, // Saigon Spice
        spiceLevel: 0,
        allergenInfo: ['fish'],
        cookingInstructionsJa: '炒め物、スープ、ドレッシングに少量ずつご使用ください。',
        cookingInstructionsVi: 'Sử dụng ít lượng cho món xào, canh và nước chấm.',
        storageType: 'ambient',
        shelfLifeDays: 365,
        weight: 0.5
      }
    }),
    prisma.product.create({
      data: {
        sku: 'SAUCE-CHILI-001',
        nameJa: 'ベトナムチリソース',
        nameVi: 'Tương ớt Việt Nam',
        descriptionJa: '程よい辛さのベトナム風チリソース。フォーや春巻きに最適。',
        descriptionVi: 'Tương ớt Việt Nam với độ cay vừa phải. Thích hợp cho phở và chả giò.',
        price: 380,
        costPrice: 200,
        stockQuantity: 40,
        categoryId: categories[2].id,
        brandId: brands[1].id,
        spiceLevel: 3,
        allergenInfo: [],
        cookingInstructionsJa: 'お好みの量を料理に加えてください。',
        cookingInstructionsVi: 'Thêm theo khẩu vị vào món ăn.',
        storageType: 'ambient',
        shelfLifeDays: 180,
        weight: 0.25,
        isFeatured: true
      }
    }),
    // 冷凍食品
    prisma.product.create({
      data: {
        sku: 'FROZEN-DUMPLING-001',
        nameJa: 'ベトナム風餃子（冷凍）',
        nameVi: 'Bánh bao Việt Nam (đông lạnh)',
        descriptionJa: 'ベトナム風の具材を使った手作り餃子。蒸すだけで本格的な味が楽しめます。',
        descriptionVi: 'Bánh bao thủ công với nhân Việt Nam. Chỉ cần hấp là có thể thưởng thức hương vị đích thực.',
        price: 680,
        costPrice: 400,
        stockQuantity: 25,
        categoryId: categories[3].id, // 冷凍食品
        brandId: brands[2].id,
        spiceLevel: 1,
        allergenInfo: ['wheat', 'soy'],
        cookingInstructionsJa: '冷凍のまま蒸し器で15分蒸してください。',
        cookingInstructionsVi: 'Hấp trực tiếp từ đông lạnh trong 15 phút.',
        storageType: 'frozen',
        shelfLifeDays: 90,
        weight: 0.6
      }
    }),
    // お菓子
    prisma.product.create({
      data: {
        sku: 'SNACK-RICEPAPER-001',
        nameJa: 'ベトナム風ライスペーパースナック',
        nameVi: 'Bánh tráng nướng',
        descriptionJa: 'カリカリに焼いたライスペーパーに特製ソースを塗った人気のスナック。',
        descriptionVi: 'Bánh tráng nướng giòn với nước chấm đặc biệt, món ăn vặt được yêu thích.',
        price: 320,
        costPrice: 180,
        stockQuantity: 70,
        categoryId: categories[4].id, // お菓子
        brandId: brands[1].id,
        spiceLevel: 2,
        allergenInfo: ['sesame'],
        storageType: 'ambient',
        shelfLifeDays: 30,
        weight: 0.15,
        isFeatured: true
      }
    }),
    // 飲料
    prisma.product.create({
      data: {
        sku: 'DRINK-COCONUT-001',
        nameJa: 'ベトナム産ココナッツウォーター',
        nameVi: 'Nước dừa Việt Nam',
        descriptionJa: '100%天然のココナッツウォーター。電解質が豊富で自然な甘さ。',
        descriptionVi: 'Nước dừa 100% tự nhiên. Giàu chất điện giải với vị ngọt tự nhiên.',
        price: 280,
        costPrice: 150,
        stockQuantity: 90,
        categoryId: categories[5].id, // 飲料
        brandId: brands[0].id,
        spiceLevel: 0,
        allergenInfo: [],
        storageType: 'ambient',
        shelfLifeDays: 180,
        weight: 0.33
      }
    }),
    // 追加商品
    prisma.product.create({
      data: {
        sku: 'HERB-LEMONGRASS-001',
        nameJa: 'レモングラス',
        nameVi: 'Sả',
        descriptionJa: 'ベトナム料理に欠かせないレモングラス。爽やかな香りでスープや炒め物に最適。',
        descriptionVi: 'Sả không thể thiếu trong ẩm thực Việt Nam. Hương thơm tươi mát, thích hợp cho canh và món xào.',
        price: 220,
        costPrice: 120,
        stockQuantity: 60,
        categoryId: subCategories[3].id, // ハーブ
        brandId: brands[2].id,
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: 'スープや炒め物に香り付けとして使用してください。',
        cookingInstructionsVi: 'Sử dụng để tạo hương thơm cho canh và món xào.',
        storageType: 'refrigerated',
        shelfLifeDays: 5,
        weight: 0.15,
        isFeatured: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'SPICE-STARANISE-001',
        nameJa: '八角（スターアニス）',
        nameVi: 'Hoa hồi',
        descriptionJa: 'フォーのスープに欠かせない八角。甘い香りが特徴的なスパイス。',
        descriptionVi: 'Hoa hồi không thể thiếu trong nước dùng phở. Gia vị có hương thơm ngọt đặc trưng.',
        price: 480,
        costPrice: 280,
        stockQuantity: 40,
        categoryId: categories[2].id, // 調味料
        brandId: brands[1].id,
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: 'スープの煮込みに2-3個入れてください。',
        cookingInstructionsVi: 'Cho 2-3 cái vào khi ninh nước dùng.',
        storageType: 'ambient',
        shelfLifeDays: 365,
        weight: 0.05
      }
    }),
    prisma.product.create({
      data: {
        sku: 'SPICE-TAMARIND-001',
        nameJa: 'タマリンド',
        nameVi: 'Me',
        descriptionJa: '酸味のあるタマリンド。スープや炒め物に深い味わいを加えます。',
        descriptionVi: 'Me có vị chua. Tạo hương vị đậm đà cho canh và món xào.',
        price: 350,
        costPrice: 200,
        stockQuantity: 35,
        categoryId: categories[2].id, // 調味料
        brandId: brands[1].id,
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: '水に浸してペースト状にしてご使用ください。',
        cookingInstructionsVi: 'Ngâm nước và nghiền thành dạng paste để sử dụng.',
        storageType: 'ambient',
        shelfLifeDays: 180,
        weight: 0.2
      }
    }),
    prisma.product.create({
      data: {
        sku: 'NOODLE-PHO-001',
        nameJa: 'フォー麺（乾麺）',
        nameVi: 'Bánh phở khô',
        descriptionJa: '本格的なフォー用の米麺。もちもちとした食感が特徴。',
        descriptionVi: 'Bánh phở gạo chính hiệu. Đặc trưng bởi độ dai mềm.',
        price: 420,
        costPrice: 250,
        stockQuantity: 80,
        categoryId: categories[4].id, // お菓子カテゴリを麺類として使用
        brandId: brands[2].id,
        spiceLevel: 0,
        allergenInfo: [],
        cookingInstructionsJa: '熱湯で3-5分茹でてください。',
        cookingInstructionsVi: 'Luộc trong nước sôi 3-5 phút.',
        storageType: 'ambient',
        shelfLifeDays: 365,
        weight: 0.4,
        isFeatured: true
      }
    })
  ])

  // 商品画像を追加
  console.log('🖼️ 商品画像を追加中...')
  const productImages = await Promise.all([
    // マンゴーの画像
    prisma.productImage.create({
      data: {
        productId: products[0].id,
        imageUrl: '/images/products/mango-1.svg',
        altText: 'ベトナム産マンゴー',
        sortOrder: 1
      }
    }),
    prisma.productImage.create({
      data: {
        productId: products[0].id,
        imageUrl: '/images/products/mango-2.svg',
        altText: 'カットしたマンゴー',
        sortOrder: 2
      }
    }),
    // ドラゴンフルーツの画像
    prisma.productImage.create({
      data: {
        productId: products[1].id,
        imageUrl: '/images/products/dragon-fruit-1.svg',
        altText: 'ドラゴンフルーツ',
        sortOrder: 1
      }
    }),
    // チンゲン菜の画像
    prisma.productImage.create({
      data: {
        productId: products[2].id,
        imageUrl: '/images/products/pakchoi-1.svg',
        altText: '新鮮なチンゲン菜',
        sortOrder: 1
      }
    }),
    // パクチーの画像
    prisma.productImage.create({
      data: {
        productId: products[3].id,
        imageUrl: '/images/products/cilantro-1.svg',
        altText: '新鮮なパクチー',
        sortOrder: 1
      }
    }),
    // 魚醤の画像
    prisma.productImage.create({
      data: {
        productId: products[4].id,
        imageUrl: '/images/products/fish-sauce-1.svg',
        altText: 'ベトナム魚醤（ヌクマム）',
        sortOrder: 1
      }
    }),
    // チリソースの画像
    prisma.productImage.create({
      data: {
        productId: products[5].id,
        imageUrl: '/images/products/chili-sauce-1.svg',
        altText: 'ベトナムチリソース',
        sortOrder: 1
      }
    }),
    // 餃子の画像
    prisma.productImage.create({
      data: {
        productId: products[6].id,
        imageUrl: '/images/products/dumpling-1.svg',
        altText: 'ベトナム風餃子（冷凍）',
        sortOrder: 1
      }
    }),
    // ライスペーパースナックの画像
    prisma.productImage.create({
      data: {
        productId: products[7].id,
        imageUrl: '/images/products/rice-paper-snack-1.svg',
        altText: 'ベトナム風ライスペーパースナック',
        sortOrder: 1
      }
    }),
    // ココナッツウォーターの画像
    prisma.productImage.create({
      data: {
        productId: products[8].id,
        imageUrl: '/images/products/coconut-water-1.svg',
        altText: 'ベトナム産ココナッツウォーター',
        sortOrder: 1
      }
    }),
    // 新しい商品の画像
    prisma.productImage.create({
      data: {
        productId: products[9].id, // レモングラス
        imageUrl: '/images/products/lemongrass-1.svg',
        altText: '新鮮なレモングラス',
        sortOrder: 1
      }
    }),
    prisma.productImage.create({
      data: {
        productId: products[10].id, // 八角
        imageUrl: '/images/products/star-anise-1.svg',
        altText: '八角（スターアニス）',
        sortOrder: 1
      }
    }),
    prisma.productImage.create({
      data: {
        productId: products[11].id, // タマリンド
        imageUrl: '/images/products/tamarind-1.svg',
        altText: 'タマリンド',
        sortOrder: 1
      }
    }),
    prisma.productImage.create({
      data: {
        productId: products[12].id, // フォー麺
        imageUrl: '/images/products/pho-noodles-1.svg',
        altText: 'フォー麺（乾麺）',
        sortOrder: 1
      }
    })
  ])

  // テスト用の住所を作成
  console.log('🏠 テスト用住所を作成中...')
  const address = await prisma.address.create({
    data: {
      userId: testUser.id,
      type: 'shipping',
      firstName: '太郎',
      lastName: '田中',
      postalCode: '150-0001',
      prefecture: '東京都',
      city: '渋谷区',
      addressLine1: '神宮前1-1-1',
      phone: '03-1234-5678',
      isDefault: true
    }
  })

  // テスト用のレビューを作成
  console.log('⭐ テスト用レビューを作成中...')
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: testUser.id,
        productId: products[0].id, // マンゴー
        rating: 5,
        title: '最高に美味しい！',
        comment: 'とても甘くてジューシーでした。また購入したいと思います。',
        isVerifiedPurchase: true,
        isApproved: true
      }
    }),
    prisma.review.create({
      data: {
        userId: testUser.id,
        productId: products[3].id, // パクチー
        rating: 4,
        title: '新鮮で香りが良い',
        comment: 'フォーに入れて食べました。とても新鮮で香りが良かったです。',
        isVerifiedPurchase: true,
        isApproved: true
      }
    })
  ])

  console.log('✅ シードデータの作成が完了しました！')
  console.log(`📊 作成されたデータ:`)
  console.log(`   - 管理者: 1名`)
  console.log(`   - テストユーザー: 1名`)
  console.log(`   - ブランド: ${brands.length}個`)
  console.log(`   - カテゴリ: ${categories.length + subCategories.length}個`)
  console.log(`   - 商品: ${products.length}個`)
  console.log(`   - 商品画像: ${productImages.length}枚`)
  console.log(`   - レビュー: ${reviews.length}件`)
  console.log(`   - 住所: 1件`)
  
  console.log('\n🔑 ログイン情報:')
  console.log('管理者: admin@vietfoodmarket.com / admin123456')
  console.log('テストユーザー: test@example.com / user123456')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの作成中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })