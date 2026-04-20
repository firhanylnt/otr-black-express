import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Media paths (served from otr-v2/public/) ─────────────────────────
const IMG = {
  atul:       '/media/atul-pandey-Jx9B0mdGb94-unsplash.jpg',
  disenador:  '/media/disenador-2026-SXA09icqfuI-unsplash.jpg',
  dmytro:     '/media/dmytro-koplyk-ueMME9Eao18-unsplash.jpg',
  erik:       '/media/erik-karits-1HJeg98e-Rs-unsplash.jpg',
  francesco:  '/media/francesco-ungaro-oym4V7s46cc-unsplash.jpg',
  jensen1:    '/media/jensen-ragoonath-dPg3TlWPZ9E-unsplash.jpg',
  jensen2:    '/media/jensen-ragoonath-oh2iXAXWHt8-unsplash.jpg',
  julien:     '/media/julien-PK8HIDIH4gU-unsplash.jpg',
  kellen1:    '/media/kellen-riggin-Bc0-ShnKHhU-unsplash.jpg',
  kellen2:    '/media/kellen-riggin-yXNOqgvbTEc-unsplash.jpg',
  kristian:   '/media/kris-tian-SInL08DE8vg-unsplash.jpg',
  loc:        '/media/loc-dang-ZqznBx8W2g0-unsplash.jpg',
  mohammed:   '/media/mohammed-kara-GrdAJU6Jl88-unsplash.jpg',
  natalia:    '/media/natalia-grela--6XD-t-jTKI-unsplash.jpg',
  nikita:     '/media/nikita-pishchugin-mKjwhKls3u0-unsplash.jpg',
  patrick:    '/media/patrick-shaun-4meQsTrOla4-unsplash.jpg',
  pawel1:     '/media/pawel-czerwinski-3U0bhdxRJcI-unsplash.jpg',
  pawel2:     '/media/pawel-czerwinski-M95RTPQCB5A-unsplash.jpg',
  rick:       '/media/rick-rothenberg-xScKo-lzpm0-unsplash.jpg',
  robert:     '/media/robert-clark-zXElWn305tw-unsplash.jpg',
  sandip1:    '/media/sandip-kalal-91nZwaM5fz8-unsplash.jpg',
  sandip2:    '/media/sandip-kalal-91nZwaM5fz8-unsplash.jpg',
  universtock:'/media/universtock-UVPRU8HSdS8-unsplash.jpg',
  uran:       '/media/uran-wang-TVORvlpH2ZY-unsplash.jpg',
  ys:         '/media/y-s-GWyTDU_Lajc-unsplash.jpg',
  yuwei:      '/media/yuwei-c-8rHYCDF7wW8-unsplash.jpg',
}

const AUDIO = {
  dream:      '/audio/mixkit-beautiful-dream-493.mp3',
  cbpd:       '/audio/mixkit-cbpd-400.mp3',
  urban:      '/audio/mixkit-deep-urban-623.mp3',
  driving:    '/audio/mixkit-driving-ambition-32.mp3',
  fright:     '/audio/mixkit-fright-night-871.mp3',
  gimme:      '/audio/mixkit-gimme-that-groove-872.mp3',
  hazy:       '/audio/mixkit-hazy-after-hours-132.mp3',
  hiphop:     '/audio/mixkit-hip-hop-02-738.mp3',
  serene:     '/audio/mixkit-serene-view-443.mp3',
  silent:     '/audio/mixkit-silent-descent-614.mp3',
  sun:        '/audio/mixkit-sun-and-his-daughter-580.mp3',
  valley:     '/audio/mixkit-valley-sunset-127.mp3',
}

async function main() {
  // ── Creator users (6 residents + 3 guests) ──────────────────────────
  const hash = await bcrypt.hash('creator123', 10)

  const residentUsers = [
    { email: 'djunderground@otr.local', username: 'dj_underground', displayName: 'DJ UNDERGROUND', bio: 'Jakarta-based selector and underground music curator.', avatarUrl: IMG.atul },
    { email: 'nightowl@otr.local',      username: 'night_owl',      displayName: 'NIGHT OWL',      bio: 'Techno enthusiast and warehouse party veteran.',        avatarUrl: IMG.jensen1 },
    { email: 'soulkitchen@otr.local',   username: 'soul_kitchen',   displayName: 'SOUL KITCHEN',   bio: 'Collective dedicated to preserving soul music.',       avatarUrl: IMG.natalia },
    { email: 'mcstreets@otr.local',     username: 'mc_streets',     displayName: 'MC STREETS',     bio: 'Hip-hop head and beat maker from the streets.',        avatarUrl: IMG.mohammed },
    { email: 'vinyldistrict@otr.local', username: 'vinyl_district', displayName: 'VINYL DISTRICT', bio: 'Veteran DJ and vinyl collector. House and disco.',      avatarUrl: IMG.rick },
    { email: 'djpavement@otr.local',    username: 'dj_pavement',    displayName: 'DJ PAVEMENT',    bio: 'Field recording artist and deep house producer.',      avatarUrl: IMG.uran },
  ]

  const guestUsers = [
    { email: 'blockparty@otr.local',    username: 'block_party',    displayName: 'BLOCK PARTY',    bio: 'Trio making noise on rooftops and parking garages.',   avatarUrl: IMG.kellen1 },
    { email: 'thenightshift@otr.local', username: 'the_night_shift',displayName: 'THE NIGHT SHIFT',bio: 'Nocturnal electronic collective from Brooklyn.',        avatarUrl: IMG.pawel1 },
    { email: 'alleycats@otr.local',     username: 'the_alley_cats', displayName: 'THE ALLEY CATS', bio: 'Jazz-hip-hop fusion collective from Harlem.',           avatarUrl: IMG.yuwei },
  ]

  const createdResidents: Record<string, number> = {}
  for (const u of residentUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hash, role: 'resident', isVerified: 1 },
    })
    createdResidents[u.username] = user.id
  }

  const createdGuests: Record<string, number> = {}
  for (const u of guestUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hash, role: 'guest_creator', isVerified: 1 },
    })
    createdGuests[u.username] = user.id
  }

  console.log(`Seeded ${residentUsers.length} residents, ${guestUsers.length} guests`)

  // ── Helper ───────────────────────────────────────────────────────────
  const adminId = (await prisma.user.findUnique({ where: { email: 'admin@otr.local' } }))!.id

  async function upsertContent(data: {
    slug: string
    title: string
    description: string
    type: 'track' | 'album' | 'mixtape' | 'playlist' | 'radio_show' | 'video'
    category: 'picks' | 'residents' | 'guests' | 'featured' | 'program'
    coverUrl: string
    audioUrl?: string
    duration: number
    releaseDate: string
    creatorId: number
    tags: string[]
    genres: string[]
    plays?: number
    isHighlighted?: boolean
    isFeaturedHome?: boolean
  }) {
    return prisma.content.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        coverUrl: data.coverUrl,
        audioUrl: data.audioUrl ?? null,
        duration: data.duration,
        releaseDate: data.releaseDate,
        status: 'published',
        creatorId: data.creatorId,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        tags: JSON.stringify(data.tags),
        genres: JSON.stringify(data.genres),
        plays: data.plays ?? 0,
        isHighlighted: data.isHighlighted ? 1 : 0,
        isFeaturedHome: data.isFeaturedHome ? 1 : 0,
      },
    })
  }

  // ── Tracks (12 singles) ──────────────────────────────────────────────
  const tracks = [
    { slug: 'beautiful-dream',    title: 'BEAUTIFUL DREAM',    desc: 'Ethereal ambient drift for late-night introspection.',          cover: IMG.dmytro,      audio: AUDIO.dream,   dur: 213, creator: createdResidents['dj_underground'], tags: ['dreamy','late-night'],  genres: ['ambient','electronic'],  cat: 'picks'    as const },
    { slug: 'deep-urban-pulse',   title: 'DEEP URBAN PULSE',   desc: 'Gritty city textures layered over a hypnotic groove.',          cover: IMG.pawel2,      audio: AUDIO.urban,   dur: 198, creator: createdResidents['dj_pavement'],   tags: ['hypnotic','dark'],      genres: ['electronic','house'],    cat: 'residents'as const },
    { slug: 'driving-ambition',   title: 'DRIVING AMBITION',   desc: 'High-energy cut built for peak-hour dancefloors.',              cover: IMG.kellen2,     audio: AUDIO.driving, dur: 245, creator: createdResidents['night_owl'],     tags: ['energetic','party'],    genres: ['techno','electronic'],   cat: 'residents'as const },
    { slug: 'fright-night',       title: 'FRIGHT NIGHT',       desc: 'Dark industrial textures from the warehouse underground.',       cover: IMG.pawel1,      audio: AUDIO.fright,  dur: 187, creator: createdResidents['night_owl'],     tags: ['dark','hypnotic'],      genres: ['industrial','techno'],   cat: 'picks'    as const },
    { slug: 'gimme-that-groove',  title: 'GIMME THAT GROOVE',  desc: 'Irresistible funk-laced house that demands movement.',          cover: IMG.jensen2,     audio: AUDIO.gimme,   dur: 231, creator: createdResidents['vinyl_district'], tags: ['groovy','party'],       genres: ['house','funk'],          cat: 'residents'as const },
    { slug: 'hazy-after-hours',   title: 'HAZY AFTER HOURS',   desc: 'Slow-burning lo-fi for the walk home at 5am.',                  cover: IMG.loc,         audio: AUDIO.hazy,    dur: 264, creator: createdResidents['dj_underground'], tags: ['chill','late-night'],   genres: ['lo-fi','ambient'],       cat: 'picks'    as const },
    { slug: 'hip-hop-02',         title: 'HIP HOP 02',         desc: 'Raw boom-bap energy straight from the block.',                  cover: IMG.mohammed,    audio: AUDIO.hiphop,  dur: 178, creator: createdResidents['mc_streets'],    tags: ['energetic','groovy'],   genres: ['hip-hop'],               cat: 'residents'as const },
    { slug: 'serene-view',        title: 'SERENE VIEW',        desc: 'Ambient soundscape inspired by rooftop sunrises.',              cover: IMG.erik,        audio: AUDIO.serene,  dur: 302, creator: createdResidents['dj_pavement'],   tags: ['peaceful','morning'],   genres: ['ambient'],               cat: 'picks'    as const },
    { slug: 'silent-descent',     title: 'SILENT DESCENT',     desc: 'Minimal techno built from field recordings and silence.',       cover: IMG.nikita,      audio: AUDIO.silent,  dur: 219, creator: createdResidents['night_owl'],     tags: ['hypnotic','focused'],   genres: ['techno','experimental'], cat: 'residents'as const },
    { slug: 'sun-and-daughter',   title: 'SUN AND HIS DAUGHTER',desc: 'Warm jazz-soul fusion with a nostalgic afternoon glow.',       cover: IMG.ys,          audio: AUDIO.sun,     dur: 287, creator: createdResidents['soul_kitchen'],  tags: ['nostalgic','romantic'],  genres: ['jazz','soul'],           cat: 'residents'as const },
    { slug: 'valley-sunset',      title: 'VALLEY SUNSET',      desc: 'Dreamy synth-pop drifting between dusk and dark.',              cover: IMG.universtock, audio: AUDIO.valley,  dur: 241, creator: createdGuests['block_party'],      tags: ['dreamy','melancholic'],  genres: ['electronic','indie'],    cat: 'guests'   as const },
    { slug: 'cbpd-groove',        title: 'CBPD GROOVE',        desc: 'Percussion-forward club track with deep sub pressure.',         cover: IMG.robert,      audio: AUDIO.cbpd,    dur: 193, creator: createdGuests['the_night_shift'],  tags: ['energetic','dark'],     genres: ['techno','drum-bass'],    cat: 'guests'   as const },
  ]

  for (const t of tracks) {
    await upsertContent({
      slug: t.slug, title: t.title, description: t.desc,
      type: 'track', category: t.cat,
      coverUrl: t.cover, audioUrl: t.audio,
      duration: t.dur, releaseDate: '2026-01-01',
      creatorId: t.creator, tags: t.tags, genres: t.genres,
      plays: Math.floor(Math.random() * 8000) + 500,
    })
  }
  console.log(`Seeded ${tracks.length} tracks`)

  // ── Mixtapes ─────────────────────────────────────────────────────────
  const mixtapes = [
    { slug: 'midnight-frequencies',      title: 'MIDNIGHT FREQUENCIES',      desc: 'A curated collection of late-night sounds from across the underground spectrum.',  cover: IMG.pawel1,      audio: AUDIO.hazy,    dur: 4212, creator: createdResidents['dj_underground'], tags: ['late-night','chill'],    genres: ['ambient','electronic'],  cat: 'picks'     as const },
    { slug: 'warehouse-sessions-vol1',   title: 'WAREHOUSE SESSIONS VOL.1',  desc: 'Raw, unfiltered cuts from underground warehouse parties across the city.',         cover: IMG.kellen2,     audio: AUDIO.fright,  dur: 5580, creator: createdResidents['night_owl'],     tags: ['dark','hypnotic'],       genres: ['techno','industrial'],   cat: 'residents' as const },
    { slug: 'bronx-beats-radio-45',      title: 'BRONX BEATS RADIO #45',     desc: 'Two hours of uncut hip-hop from the block. No skips.',                             cover: IMG.mohammed,    audio: AUDIO.hiphop,  dur: 8100, creator: createdResidents['mc_streets'],    tags: ['energetic','groovy'],    genres: ['hip-hop'],               cat: 'residents' as const },
    { slug: 'soul-selections-vol3',      title: 'SOUL SELECTIONS VOL.3',     desc: 'Warm soul and R&B selections to ease into your Sunday.',                           cover: IMG.natalia,     audio: AUDIO.sun,     dur: 3960, creator: createdResidents['soul_kitchen'],  tags: ['nostalgic','romantic'],  genres: ['soul','r&b'],            cat: 'picks'     as const },
    { slug: 'block-party-mix-summer',    title: 'BLOCK PARTY MIX — SUMMER',  desc: 'The ultimate summer soundtrack from the Block Party collective.',                  cover: IMG.kellen1,     audio: AUDIO.gimme,   dur: 3300, creator: createdGuests['block_party'],      tags: ['groovy','party'],        genres: ['house','funk'],          cat: 'guests'    as const },
    { slug: 'night-shift-vol2',          title: 'THE NIGHT SHIFT VOL.2',     desc: 'Nocturnal electronic selections for the small hours.',                             cover: IMG.pawel2,      audio: AUDIO.urban,   dur: 6120, creator: createdGuests['the_night_shift'],  tags: ['dark','hypnotic'],       genres: ['electronic','techno'],   cat: 'guests'    as const },
    { slug: 'vinyl-district-classics',   title: 'VINYL DISTRICT CLASSICS',   desc: 'Throwback house and disco from the crates. Certified floor-fillers.',              cover: IMG.rick,        audio: AUDIO.driving, dur: 4500, creator: createdResidents['vinyl_district'], tags: ['groovy','nostalgic'],    genres: ['house','disco'],         cat: 'residents' as const },
    { slug: 'otr-featured-mix-001',      title: 'OTR FEATURED MIX 001',      desc: 'The first in our featured collaboration series. Handpicked by the OTR team.',     cover: IMG.disenador,   audio: AUDIO.serene,  dur: 5040, creator: createdResidents['dj_pavement'],   tags: ['chill','peaceful'],      genres: ['ambient','electronic'],  cat: 'featured'  as const },
    { slug: 'alley-cats-jazz-session',   title: 'ALLEY CATS JAZZ SESSION',   desc: 'Live jazz-hip-hop fusion recorded in a Harlem basement.',                          cover: IMG.yuwei,       audio: AUDIO.cbpd,    dur: 3780, creator: createdGuests['the_alley_cats'],   tags: ['groovy','nostalgic'],    genres: ['jazz','hip-hop'],        cat: 'guests'    as const },
    { slug: 'pavement-field-recordings', title: 'PAVEMENT FIELD RECORDINGS', desc: 'City sounds woven into deep house. Recorded on the streets of Jakarta.',          cover: IMG.uran,        audio: AUDIO.dream,   dur: 4860, creator: createdResidents['dj_pavement'],   tags: ['hypnotic','peaceful'],   genres: ['deep-house','ambient'],  cat: 'picks'     as const },
  ]

  for (const m of mixtapes) {
    await upsertContent({
      slug: m.slug, title: m.title, description: m.desc,
      type: 'mixtape', category: m.cat,
      coverUrl: m.cover, audioUrl: m.audio,
      duration: m.dur, releaseDate: '2026-01-15',
      creatorId: m.creator, tags: m.tags, genres: m.genres,
      plays: Math.floor(Math.random() * 15000) + 1000,
    })
  }
  console.log(`Seeded ${mixtapes.length} mixtapes`)

  // ── Albums ────────────────────────────────────────────────────────────
  const albums = [
    { slug: 'concrete-jungle-ep',        title: 'CONCRETE JUNGLE EP',        desc: 'Five tracks of raw boom-bap from the streets. No features, no filler.',           cover: IMG.mohammed,    dur: 1320, creator: createdResidents['mc_streets'],    tags: ['energetic','dark'],      genres: ['hip-hop'],               cat: 'residents' as const },
    { slug: 'street-symphony',           title: 'STREET SYMPHONY',           desc: 'The Alley Cats debut album. Jazz and hip-hop collide in Harlem.',                  cover: IMG.yuwei,       dur: 2640, creator: createdGuests['the_alley_cats'],   tags: ['groovy','nostalgic'],    genres: ['jazz','hip-hop'],        cat: 'guests'    as const },
    { slug: 'deep-house-chronicles',     title: 'DEEP HOUSE CHRONICLES',     desc: 'Vinyl District digs deep. Eight tracks of pure house music.',                     cover: IMG.rick,        dur: 2880, creator: createdResidents['vinyl_district'], tags: ['groovy','party'],        genres: ['house','deep-house'],    cat: 'residents' as const },
    { slug: 'otr-compilation-vol1',      title: 'OTR COMPILATION VOL.1',     desc: 'The first official OTR compilation. Residents and guests, all in one place.',     cover: IMG.disenador,   dur: 4200, creator: createdResidents['dj_underground'], tags: ['various','curated'],     genres: ['electronic','hip-hop'],  cat: 'featured'  as const },
    { slug: 'ambient-city-lp',           title: 'AMBIENT CITY LP',           desc: 'DJ Pavement\'s debut long player. Field recordings meet deep house.',             cover: IMG.uran,        dur: 3600, creator: createdResidents['dj_pavement'],   tags: ['peaceful','hypnotic'],   genres: ['ambient','deep-house'],  cat: 'picks'     as const },
    { slug: 'techno-underground-ep',     title: 'TECHNO UNDERGROUND EP',     desc: 'Night Owl goes deep. Four tracks of warehouse-ready techno.',                     cover: IMG.nikita,      dur: 1560, creator: createdResidents['night_owl'],     tags: ['dark','energetic'],      genres: ['techno'],                cat: 'residents' as const },
  ]

  for (const a of albums) {
    await upsertContent({
      slug: a.slug, title: a.title, description: a.desc,
      type: 'album', category: a.cat,
      coverUrl: a.cover,
      duration: a.dur, releaseDate: '2026-02-01',
      creatorId: a.creator, tags: a.tags, genres: a.genres,
      plays: Math.floor(Math.random() * 20000) + 2000,
    })
  }
  console.log(`Seeded ${albums.length} albums`)

  // ── Radio Shows ───────────────────────────────────────────────────────
  const radioShows = [
    { slug: 'indie-alley-radio-ep12',    title: 'INDIE ALLEY RADIO EP.12',   desc: 'Episode 12 of our flagship radio show. The best indie selections this month.',   cover: IMG.atul,        audio: AUDIO.valley,  dur: 7200, creator: createdResidents['dj_underground'], tags: ['chill','late-night'],    genres: ['indie','electronic'],    cat: 'program'   as const },
    { slug: 'warehouse-radio-ep08',      title: 'WAREHOUSE RADIO EP.08',     desc: 'Eight episodes in and Night Owl is still going harder than ever.',               cover: IMG.kellen2,     audio: AUDIO.silent,  dur: 7200, creator: createdResidents['night_owl'],     tags: ['dark','hypnotic'],       genres: ['techno','industrial'],   cat: 'program'   as const },
    { slug: 'soul-kitchen-radio-ep05',   title: 'SOUL KITCHEN RADIO EP.05',  desc: 'Soul Kitchen brings the warmth. Soul, R&B, and neo-soul for Sunday mornings.',   cover: IMG.natalia,     audio: AUDIO.sun,     dur: 5400, creator: createdResidents['soul_kitchen'],  tags: ['nostalgic','romantic'],  genres: ['soul','r&b'],            cat: 'program'   as const },
    { slug: 'beats-streets-ep22',        title: 'BEATS & STREETS EP.22',     desc: 'MC Streets on the mic for two hours of uncut hip-hop and beats.',                cover: IMG.mohammed,    audio: AUDIO.hiphop,  dur: 7200, creator: createdResidents['mc_streets'],    tags: ['energetic','groovy'],    genres: ['hip-hop'],               cat: 'program'   as const },
    { slug: 'friday-night-party-ep15',   title: 'FRIDAY NIGHT PARTY EP.15',  desc: 'Vinyl District kicks off the weekend. House, disco, and everything in between.',  cover: IMG.rick,        audio: AUDIO.gimme,   dur: 14400,creator: createdResidents['vinyl_district'], tags: ['groovy','party'],        genres: ['house','disco'],         cat: 'program'   as const },
    { slug: 'morning-frequencies-ep30',  title: 'MORNING FREQUENCIES EP.30', desc: 'Thirty episodes of ambient and chill to start your day right.',                  cover: IMG.erik,        audio: AUDIO.serene,  dur: 3600, creator: createdResidents['dj_pavement'],   tags: ['peaceful','morning'],    genres: ['ambient'],               cat: 'program'   as const },
  ]

  for (const r of radioShows) {
    await upsertContent({
      slug: r.slug, title: r.title, description: r.desc,
      type: 'radio_show', category: r.cat,
      coverUrl: r.cover, audioUrl: r.audio,
      duration: r.dur, releaseDate: '2026-03-01',
      creatorId: r.creator, tags: r.tags, genres: r.genres,
      plays: Math.floor(Math.random() * 12000) + 800,
    })
  }
  console.log(`Seeded ${radioShows.length} radio shows`)

  // ── Programs (show series) + Episodes ────────────────────────────────
  async function upsertProgram(slug: string, title: string, description: string, imageUrl: string, sortOrder: number) {
    return prisma.program.upsert({
      where: { slug },
      update: {},
      create: { slug, title, description, imageUrl, isActive: 1, sortOrder },
    })
  }

  async function upsertEpisode(programId: number, slug: string, title: string, description: string, audioUrl: string | null, duration: number, publishedAt: string, sortOrder: number) {
    const existing = await prisma.programEpisode.findUnique({ where: { programId_slug: { programId, slug } } })
    if (existing) return existing
    return prisma.programEpisode.create({
      data: { programId, slug, title, description, audioUrl, duration, publishedAt, sortOrder },
    })
  }

  const programDefs = [
    { slug: 'indie-alley-radio',    title: 'INDIE ALLEY RADIO',    desc: 'Live from the underground. The best in indie and alternative sounds every Friday.',  img: IMG.atul,        order: 1 },
    { slug: 'warehouse-sessions',   title: 'WAREHOUSE SESSIONS',   desc: 'Electronic and techno straight from the warehouse. Dark, hypnotic, relentless.',     img: IMG.kellen2,     order: 2 },
    { slug: 'soul-kitchen',         title: 'SOUL KITCHEN',         desc: 'Soul, R&B, and neo-soul selections to warm your heart and move your feet.',          img: IMG.natalia,     order: 3 },
    { slug: 'beats-and-streets',    title: 'BEATS & STREETS',      desc: 'Hip-hop and beats from the block. Raw, unfiltered, authentic.',                      img: IMG.mohammed,    order: 4 },
    { slug: 'friday-night-party',   title: 'FRIDAY NIGHT PARTY',   desc: 'Kicking off the weekend with house, disco, and party vibes.',                        img: IMG.rick,        order: 5 },
    { slug: 'morning-frequencies',  title: 'MORNING FREQUENCIES',  desc: 'Curated morning selections to start your day right with ambient and chill sounds.',  img: IMG.erik,        order: 6 },
    { slug: 'jazz-wednesdays',      title: 'JAZZ WEDNESDAYS',      desc: 'Contemporary and classic jazz explorations every Wednesday evening.',                 img: IMG.ys,          order: 7 },
    { slug: 'after-hours',          title: 'AFTER HOURS',          desc: 'Deep into the night with underground sounds and late night vibes.',                   img: IMG.pawel1,      order: 8 },
  ]

  const episodeDefs: Record<string, { slug: string; title: string; desc: string; audio: string | null; dur: number; date: string }[]> = {
    'indie-alley-radio': [
      { slug: 'ep-01', title: 'EP.01 — ORIGINS',        desc: 'Where it all started. The first episode of Indie Alley Radio.',          audio: AUDIO.valley,  dur: 7200, date: '2025-09-05' },
      { slug: 'ep-02', title: 'EP.02 — UNDERGROUND',    desc: 'Digging deeper into the underground scene.',                              audio: AUDIO.dream,   dur: 7200, date: '2025-09-12' },
      { slug: 'ep-03', title: 'EP.03 — LATE NIGHTS',    desc: 'For the ones still up at 3am.',                                          audio: AUDIO.hazy,    dur: 7200, date: '2025-09-19' },
      { slug: 'ep-04', title: 'EP.04 — CITY SOUNDS',    desc: 'Field recordings and electronic textures from the city.',                 audio: AUDIO.urban,   dur: 7200, date: '2025-09-26' },
      { slug: 'ep-05', title: 'EP.05 — GUEST MIX',      desc: 'Special guest mix from Block Party.',                                    audio: AUDIO.gimme,   dur: 7200, date: '2025-10-03' },
    ],
    'warehouse-sessions': [
      { slug: 'ep-01', title: 'EP.01 — OPENING NIGHT',  desc: 'The first session from the warehouse. Raw and unfiltered.',              audio: AUDIO.fright,  dur: 7200, date: '2025-09-06' },
      { slug: 'ep-02', title: 'EP.02 — DARK MATTER',    desc: 'Industrial textures and hypnotic grooves.',                              audio: AUDIO.silent,  dur: 7200, date: '2025-09-13' },
      { slug: 'ep-03', title: 'EP.03 — PEAK HOUR',      desc: 'High-energy cuts for the peak of the night.',                           audio: AUDIO.driving, dur: 7200, date: '2025-09-20' },
      { slug: 'ep-04', title: 'EP.04 — CLOSING SET',    desc: 'The wind-down. Still dark, but softer.',                                audio: AUDIO.serene,  dur: 7200, date: '2025-09-27' },
    ],
    'soul-kitchen': [
      { slug: 'ep-01', title: 'EP.01 — SUNDAY BRUNCH',  desc: 'Smooth soul and R&B to ease into your Sunday morning.',                 audio: AUDIO.sun,     dur: 5400, date: '2025-09-07' },
      { slug: 'ep-02', title: 'EP.02 — CLASSICS',       desc: 'Timeless soul classics from the archives.',                             audio: AUDIO.valley,  dur: 5400, date: '2025-09-14' },
      { slug: 'ep-03', title: 'EP.03 — NEO SOUL',       desc: 'Contemporary neo-soul and R&B selections.',                             audio: AUDIO.dream,   dur: 5400, date: '2025-09-21' },
      { slug: 'ep-04', title: 'EP.04 — LIVE SESSION',   desc: 'Recorded live at the Soul Kitchen studio.',                             audio: AUDIO.hazy,    dur: 5400, date: '2025-09-28' },
      { slug: 'ep-05', title: 'EP.05 — COLLABORATIONS', desc: 'Soul Kitchen meets The Alley Cats for a special joint session.',        audio: AUDIO.cbpd,    dur: 5400, date: '2025-10-05' },
    ],
    'beats-and-streets': [
      { slug: 'ep-01', title: 'EP.01 — FROM THE BLOCK', desc: 'MC Streets brings the heat from day one.',                              audio: AUDIO.hiphop,  dur: 7200, date: '2025-09-01' },
      { slug: 'ep-02', title: 'EP.02 — BOOM BAP',       desc: 'Classic boom-bap energy. No features, no filler.',                     audio: AUDIO.urban,   dur: 7200, date: '2025-09-08' },
      { slug: 'ep-03', title: 'EP.03 — FREESTYLE',      desc: 'An hour of freestyles and unreleased beats.',                          audio: AUDIO.gimme,   dur: 7200, date: '2025-09-15' },
      { slug: 'ep-04', title: 'EP.04 — COLLABS',        desc: 'Guest appearances from the underground hip-hop scene.',                 audio: AUDIO.driving, dur: 7200, date: '2025-09-22' },
      { slug: 'ep-05', title: 'EP.05 — INSTRUMENTALS',  desc: 'Beat tape edition. All instrumentals, no vocals.',                     audio: AUDIO.cbpd,    dur: 7200, date: '2025-09-29' },
      { slug: 'ep-06', title: 'EP.06 — LIVE CYPHER',    desc: 'Recorded live. Six MCs, one mic, no edits.',                           audio: AUDIO.hiphop,  dur: 7200, date: '2025-10-06' },
    ],
    'friday-night-party': [
      { slug: 'ep-01', title: 'EP.01 — OPENING NIGHT',  desc: 'The first Friday Night Party. House and disco from the crates.',        audio: AUDIO.gimme,   dur: 14400, date: '2025-09-05' },
      { slug: 'ep-02', title: 'EP.02 — DISCO FEVER',    desc: 'All disco, all night. Vinyl District goes deep.',                       audio: AUDIO.valley,  dur: 14400, date: '2025-09-12' },
      { slug: 'ep-03', title: 'EP.03 — HOUSE MUSIC',    desc: 'Pure house music from Chicago to Jakarta.',                             audio: AUDIO.driving, dur: 14400, date: '2025-09-19' },
    ],
    'morning-frequencies': [
      { slug: 'ep-01', title: 'EP.01 — SUNRISE',        desc: 'Ambient and chill to greet the morning.',                              audio: AUDIO.serene,  dur: 3600, date: '2025-09-01' },
      { slug: 'ep-02', title: 'EP.02 — COFFEE',         desc: 'Lo-fi and downtempo for your morning coffee.',                         audio: AUDIO.dream,   dur: 3600, date: '2025-09-02' },
      { slug: 'ep-03', title: 'EP.03 — FOCUS',          desc: 'Minimal and focused. Good for work.',                                  audio: AUDIO.hazy,    dur: 3600, date: '2025-09-03' },
      { slug: 'ep-04', title: 'EP.04 — NATURE',         desc: 'Field recordings and ambient textures from nature.',                   audio: AUDIO.valley,  dur: 3600, date: '2025-09-04' },
    ],
    'jazz-wednesdays': [
      { slug: 'ep-01', title: 'EP.01 — STANDARDS',      desc: 'Classic jazz standards reimagined for the modern ear.',                audio: AUDIO.sun,     dur: 7200, date: '2025-09-03' },
      { slug: 'ep-02', title: 'EP.02 — FUSION',         desc: 'Jazz meets electronic. Unexpected and essential.',                     audio: AUDIO.cbpd,    dur: 7200, date: '2025-09-10' },
      { slug: 'ep-03', title: 'EP.03 — LIVE AT OTR',    desc: 'Recorded live at the OTR studio. No overdubs.',                       audio: AUDIO.hazy,    dur: 7200, date: '2025-09-17' },
    ],
    'after-hours': [
      { slug: 'ep-01', title: 'EP.01 — 2AM',            desc: 'The city is quiet. The music is not.',                                 audio: AUDIO.silent,  dur: 7200, date: '2025-09-06' },
      { slug: 'ep-02', title: 'EP.02 — DEEP',           desc: 'Going deeper. Minimal, hypnotic, relentless.',                        audio: AUDIO.urban,   dur: 7200, date: '2025-09-13' },
      { slug: 'ep-03', title: 'EP.03 — SUNRISE SET',    desc: 'The last set before dawn. Still going.',                              audio: AUDIO.dream,   dur: 7200, date: '2025-09-20' },
      { slug: 'ep-04', title: 'EP.04 — CLOSING TIME',   desc: 'The final hour. Slow, dark, and beautiful.',                          audio: AUDIO.serene,  dur: 7200, date: '2025-09-27' },
    ],
  }

  let totalEpisodes = 0
  for (const pd of programDefs) {
    const program = await upsertProgram(pd.slug, pd.title, pd.desc, pd.img, pd.order)
    const eps = episodeDefs[pd.slug] ?? []
    for (let i = 0; i < eps.length; i++) {
      const ep = eps[i]
      await upsertEpisode(program.id, ep.slug, ep.title, ep.desc, ep.audio, ep.dur, ep.date, i)
      totalEpisodes++
    }
  }
  console.log(`Seeded ${programDefs.length} programs, ${totalEpisodes} episodes`)

}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
