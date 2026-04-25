import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface GuestSeed {
  email: string
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  password: string
  content: {
    title: string
    slug: string
    type: 'track' | 'album' | 'mixtape'
    genres: string
    tags: string
    coverUrl: string
  }
}

const guests: GuestSeed[] = [
  {
    email: 'guest.koru@otr.local',
    username: 'koru',
    displayName: 'KORU',
    bio: 'Berlin-based house producer. Warm grooves, deep low-end, late-night sets.',
    avatarUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    password: 'guest123',
    content: {
      title: 'Late Bloom',
      slug: 'koru-late-bloom',
      type: 'track',
      genres: 'House',
      tags: 'Groovy, Dreamy',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    },
  },
  {
    email: 'guest.vesta@otr.local',
    username: 'vesta',
    displayName: 'VESTA',
    bio: 'Techno selector from Lisbon. Industrial textures and hypnotic rhythm.',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    password: 'guest123',
    content: {
      title: 'Iron Garden',
      slug: 'vesta-iron-garden',
      type: 'mixtape',
      genres: 'Techno',
      tags: 'Dark, Energetic',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80',
    },
  },
  {
    email: 'guest.haru@otr.local',
    username: 'haru',
    displayName: 'HARU',
    bio: 'Tokyo ambient composer. Field recordings layered with synth pads.',
    avatarUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    password: 'guest123',
    content: {
      title: 'Quiet Cities',
      slug: 'haru-quiet-cities',
      type: 'album',
      genres: 'Ambient',
      tags: 'Chill, Nostalgic',
      coverUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    },
  },
]

async function main() {
  console.log('Seeding guest_creator users + sample published content (idempotent)...\n')

  for (const g of guests) {
    const passwordHash = await bcrypt.hash(g.password, 10)

    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        username: g.username,
        password: passwordHash,
        displayName: g.displayName,
        bio: g.bio,
        avatarUrl: g.avatarUrl,
        role: 'guest_creator',
        isVerified: 1,
      },
    })

    const content = await prisma.content.upsert({
      where: { slug: g.content.slug },
      update: {},
      create: {
        title: g.content.title,
        slug: g.content.slug,
        type: g.content.type,
        category: 'guests',
        coverUrl: g.content.coverUrl,
        creatorId: user.id,
        status: 'published',
        genres: g.content.genres,
        tags: g.content.tags,
        reviewedAt: new Date(),
      },
    })

    console.log(`  user ${user.username} (id=${user.id}) -> content "${content.title}" (id=${content.id}, genre=${content.genres})`)
  }

  const total = await prisma.user.count({ where: { role: 'guest_creator' } })
  console.log(`\nDone. Total guest_creator users in DB: ${total}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
