import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@otr.local' },
    update: {},
    create: {
      email: 'admin@otr.local',
      username: 'admin',
      password: hash,
      displayName: 'Admin',
      role: 'admin',
      isVerified: 1,
    },
  })

  console.log('Seeded admin:', admin.email)

  await prisma.genre.upsert({
    where: { slug: 'electronic' },
    update: {},
    create: { name: 'Electronic', slug: 'electronic' },
  })
  await prisma.genre.upsert({
    where: { slug: 'house' },
    update: {},
    create: { name: 'House', slug: 'house' },
  })
  await prisma.genre.upsert({
    where: { slug: 'techno' },
    update: {},
    create: { name: 'Techno', slug: 'techno' },
  })
  console.log('Seeded genres')

  await prisma.mood.upsert({
    where: { slug: 'chill' },
    update: {},
    create: { name: 'Chill', slug: 'chill' },
  })
  await prisma.mood.upsert({
    where: { slug: 'energetic' },
    update: {},
    create: { name: 'Energetic', slug: 'energetic' },
  })
  console.log('Seeded moods')

  await prisma.setting.upsert({
    where: { key: 'site.name' },
    update: {},
    create: { key: 'site.name', value: 'OTR', type: 'string' },
  })
  await prisma.setting.upsert({
    where: { key: 'site.description' },
    update: {},
    create: { key: 'site.description', value: 'Online Radio', type: 'string' },
  })
  console.log('Seeded settings')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
