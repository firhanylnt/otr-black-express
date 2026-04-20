import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
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
  console.log('Seeded admin')

  // Genres (18)
  const genres = [
    { name: 'Electronic', slug: 'electronic' },
    { name: 'Hip-Hop', slug: 'hip-hop' },
    { name: 'House', slug: 'house' },
    { name: 'Techno', slug: 'techno' },
    { name: 'Ambient', slug: 'ambient' },
    { name: 'Jazz', slug: 'jazz' },
    { name: 'Soul', slug: 'soul' },
    { name: 'Funk', slug: 'funk' },
    { name: 'Disco', slug: 'disco' },
    { name: 'Experimental', slug: 'experimental' },
    { name: 'Drum & Bass', slug: 'drum-bass' },
    { name: 'Dub', slug: 'dub' },
    { name: 'World', slug: 'world' },
    { name: 'Industrial', slug: 'industrial' },
    { name: 'R&B', slug: 'rnb' },
    { name: 'Reggae', slug: 'reggae' },
    { name: 'Lo-Fi', slug: 'lo-fi' },
    { name: 'Indie', slug: 'indie' },
  ]
  for (const g of genres) {
    await prisma.genre.upsert({ where: { slug: g.slug }, update: {}, create: g })
  }
  console.log(`Seeded ${genres.length} genres`)

  // Moods (16)
  const moods = [
    { name: 'Chill', slug: 'chill' },
    { name: 'Energetic', slug: 'energetic' },
    { name: 'Melancholic', slug: 'melancholic' },
    { name: 'Uplifting', slug: 'uplifting' },
    { name: 'Dark', slug: 'dark' },
    { name: 'Dreamy', slug: 'dreamy' },
    { name: 'Groovy', slug: 'groovy' },
    { name: 'Focused', slug: 'focused' },
    { name: 'Nostalgic', slug: 'nostalgic' },
    { name: 'Romantic', slug: 'romantic' },
    { name: 'Late Night', slug: 'late-night' },
    { name: 'Morning', slug: 'morning' },
    { name: 'Party', slug: 'party' },
    { name: 'Workout', slug: 'workout' },
    { name: 'Peaceful', slug: 'peaceful' },
    { name: 'Hypnotic', slug: 'hypnotic' },
  ]
  for (const m of moods) {
    await prisma.mood.upsert({ where: { slug: m.slug }, update: {}, create: m })
  }
  console.log(`Seeded ${moods.length} moods`)

  // Event types
  const eventTypes = [
    { name: 'Party', slug: 'party' },
    { name: 'Market', slug: 'market' },
    { name: 'Showcase', slug: 'showcase' },
    { name: 'Broadcast', slug: 'broadcast' },
    { name: 'Special', slug: 'special' },
  ]
  const eventTypeMap: Record<string, number> = {}
  for (const et of eventTypes) {
    const record = await prisma.eventType.upsert({ where: { slug: et.slug }, update: {}, create: et })
    eventTypeMap[et.slug] = record.id
  }
  console.log(`Seeded ${eventTypes.length} event types`)

  // Events (12 — 2 upcoming, 10 past)
  const events = [
    {
      slug: 'otr-night-underground-sessions',
      title: 'OTR NIGHT: UNDERGROUND SESSIONS',
      venue: 'Warehouse 23',
      city: 'Brooklyn',
      country: 'US',
      startDate: '2026-01-18T22:00:00Z',
      ticketUrl: 'https://tickets.example.com',
      isFree: 0,
      status: 'upcoming' as const,
      coverUrl: 'https://images.unsplash.com/photo-1569017388730-020b5f80a004?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'vinyl-market-otr',
      title: 'VINYL MARKET × OTR',
      venue: 'The Lot',
      city: 'Manhattan',
      country: 'US',
      startDate: '2026-01-25T14:00:00Z',
      isFree: 1,
      status: 'upcoming' as const,
      coverUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['market'],
    },
    {
      slug: 'new-years-countdown',
      title: "NEW YEAR'S COUNTDOWN",
      venue: 'Rooftop NYC',
      city: 'Manhattan',
      country: 'US',
      startDate: '2025-12-31T22:00:00Z',
      ticketUrl: 'https://tickets.example.com',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'warehouse-winter-rave',
      title: 'WAREHOUSE WINTER RAVE',
      venue: 'Secret Location',
      city: 'Brooklyn',
      country: 'US',
      startDate: '2025-12-28T23:00:00Z',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'indie-alley-showcase',
      title: 'INDIE ALLEY SHOWCASE',
      venue: 'Mercury Lounge',
      city: 'Manhattan',
      country: 'US',
      startDate: '2025-12-20T20:00:00Z',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['showcase'],
    },
    {
      slug: 'holiday-beats-special',
      title: 'HOLIDAY BEATS SPECIAL',
      venue: 'Studio OTR',
      city: 'Brooklyn',
      country: 'US',
      startDate: '2025-12-15T19:00:00Z',
      isFree: 1,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['broadcast'],
    },
    {
      slug: 'resident-night-vol-3',
      title: 'RESIDENT NIGHT VOL. 3',
      venue: 'Club Underground',
      city: 'Bronx',
      country: 'US',
      startDate: '2025-12-10T21:00:00Z',
      ticketUrl: 'https://tickets.example.com',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'bass-culture-takeover',
      title: 'BASS CULTURE TAKEOVER',
      venue: 'Elsewhere',
      city: 'Brooklyn',
      country: 'US',
      startDate: '2025-11-28T22:00:00Z',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'thanksgiving-eve-jam',
      title: 'THANKSGIVING EVE JAM',
      venue: 'Public Records',
      city: 'Brooklyn',
      country: 'US',
      startDate: '2025-11-26T20:00:00Z',
      isFree: 1,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'electronic-dimensions',
      title: 'ELECTRONIC DIMENSIONS',
      venue: 'Knockdown Center',
      city: 'Queens',
      country: 'US',
      startDate: '2025-11-15T21:00:00Z',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['showcase'],
    },
    {
      slug: 'halloween-warehouse-party',
      title: 'HALLOWEEN WAREHOUSE PARTY',
      venue: 'The Lot Radio',
      city: 'Brooklyn',
      country: 'US',
      startDate: '2025-10-31T22:00:00Z',
      ticketUrl: 'https://tickets.example.com',
      isFree: 0,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['party'],
    },
    {
      slug: 'otr-anniversary-celebration',
      title: 'OTR ANNIVERSARY CELEBRATION',
      venue: 'Studio OTR + Online',
      city: 'New York',
      country: 'US',
      startDate: '2025-10-20T18:00:00Z',
      isFree: 1,
      status: 'past' as const,
      coverUrl: 'https://images.unsplash.com/photo-1533158388470-9a56699990c6?w=800&h=1000&fit=crop',
      eventTypeId: eventTypeMap['special'],
    },
  ]
  for (const e of events) {
    await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: e })
  }
  console.log(`Seeded ${events.length} events`)

  // Settings
  const settings = [
    { key: 'site.name', value: 'OTR', type: 'string' as const },
    { key: 'site.description', value: 'Online Radio', type: 'string' as const },
  ]
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s })
  }
  console.log('Seeded settings')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
