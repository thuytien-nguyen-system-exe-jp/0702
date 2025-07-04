import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('管理者データのシードを開始します...')

  // 管理者アカウントの作成
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@vietfood.com' },
    update: {},
    create: {
      email: 'admin@vietfood.com',
      passwordHash: adminPassword,
      name: '管理者',
      role: 'super_admin',
      permissions: {
        products: {
          view: true,
          create: true,
          update: true,
          delete: true,
          import: true,
          export: true
        },
        orders: {
          view: true,
          update: true,
          cancel: true,
          refund: true
        },
        users: {
          view: true,
          update: true,
          delete: true
        },
        inventory: {
          view: true,
          adjust: true,
          receive: true
        },
        analytics: {
          view: true,
          export: true
        },
        settings: {
          view: true,
          update: true
        },
        admins: {
          view: true,
          create: true,
          update: true,
          delete: true
        }
      },
      isActive: true
    }
  })

  console.log('管理者アカウントが作成されました:', admin.email)

  // サンプルカテゴリの作成
  const categories = [
    {
      nameJa: '調味料・スパイス',
      nameVi: 'Gia vị & Gia vị',
      slug: 'seasonings-spices',
      descriptionJa: 'ベトナム料理に欠かせない調味料とスパイス',
      descriptionVi: 'Gia vị và gia vị không thể thiếu trong ẩm thực Việt Nam'
    },
    {
      nameJa: '麺類',
      nameVi: 'Mì',
      slug: 'noodles',
      descriptionJa: 'フォーやブンなどのベトナム麺類',
      descriptionVi: 'Các loại mì Việt Nam như phở, bún'
    },
    {
      nameJa: '冷凍食品',
      nameVi: 'Thực phẩm đông lạnh',
      slug: 'frozen-foods',
      descriptionJa: '冷凍の春巻きや餃子など',
      descriptionVi: 'Chả giò đông lạnh, bánh bao và các loại khác'
    },
    {
      nameJa: '飲み物',
      nameVi: 'Đồ uống',
      slug: 'beverages',
      descriptionJa: 'ベトナムコーヒーやお茶',
      descriptionVi: 'Cà phê Việt Nam và trà'
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  console.log('カテゴリが作成されました')

  // サンプルブランドの作成
  const brands = [
    {
      name: 'Chin-Su',
      slug: 'chin-su',
      descriptionJa: 'ベトナムの有名調味料ブランド',
      descriptionVi: 'Thương hiệu gia vị nổi tiếng của Việt Nam',
      countryOrigin: 'Vietnam'
    },
    {
      name: 'Maggi',
      slug: 'maggi',
      descriptionJa: '国際的な食品ブランド',
      descriptionVi: 'Thương hiệu thực phẩm quốc tế',
      countryOrigin: 'Switzerland'
    },
    {
      name: 'Trung Nguyen',
      slug: 'trung-nguyen',
      descriptionJa: 'ベトナムコーヒーの老舗ブランド',
      descriptionVi: 'Thương hiệu cà phê lâu đời của Việt Nam',
      countryOrigin: 'Vietnam'
    }
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand
    })
  }

  console.log('ブランドが作成されました')

  // サンプル商品の作成
  const nuocMamCategory = await prisma.category.findUnique({
    where: { slug: 'seasonings-spices' }
  })

  const chinSuBrand = await prisma.brand.findUnique({
    where: { slug: 'chin-su' }
  })

  if (nuocMamCategory && chinSuBrand) {
    const sampleProducts = [
      {
        sku: 'VF-NM-001',
        nameJa: 'ヌクマム（魚醤）500ml',
        nameVi: 'Nước mắm 500ml',
        descriptionJa: 'ベトナム料理に欠かせない伝統的な魚醤です。深いコクと旨味が特徴で、炒め物や煮物、つけダレなど幅広くお使いいただけます。',
        descriptionVi: 'Nước mắm truyền thống không thể thiếu trong ẩm thực Việt Nam. Có vị đậm đà và umami đặc trưng, có thể sử dụng rộng rãi cho xào, nấu, chấm.',
        price: 680,
        costPrice: 400,
        stockQuantity: 50,
        categoryId: nuocMamCategory.id,
        brandId: chinSuBrand.id,
        spiceLevel: 0,
        allergenInfo: ['魚'],
        storageType: 'ambient',
        shelfLifeDays: 730,
        weight: 500,
        isActive: true,
        isFeatured: true,
        createdById: admin.id
      },
      {
        sku: 'VF-PHO-001',
        nameJa: 'フォー麺（乾麺）400g',
        nameVi: 'Bánh phở khô 400g',
        descriptionJa: '本格的なベトナムフォーを作るための米麺です。コシがあり、スープによく絡みます。',
        descriptionVi: 'Bánh phở gạo để làm phở Việt Nam chính hiệu. Có độ dai và thấm gia vị tốt.',
        price: 450,
        costPrice: 250,
        stockQuantity: 30,
        categoryId: (await prisma.category.findUnique({ where: { slug: 'noodles' } }))?.id,
        spiceLevel: 0,
        allergenInfo: [],
        storageType: 'ambient',
        shelfLifeDays: 365,
        weight: 400,
        isActive: true,
        isFeatured: false,
        createdById: admin.id
      }
    ]

    for (const product of sampleProducts) {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {},
        create: product
      })
    }

    console.log('サンプル商品が作成されました')
  }

  console.log('管理者データのシードが完了しました')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })