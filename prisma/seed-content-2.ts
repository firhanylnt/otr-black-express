import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── New media (20 fresh images added to public/media/) ───────────────
const IMG = {
  alexandru:  '/media/alexandru-acea-RQgKM1h2agA-unsplash.jpg',
  anthony:    '/media/anthony-jacobson-C_klNw2b3Xg-unsplash.jpg',
  arvind:     '/media/arvind-pillai-Yl4Y7COttGo-unsplash.jpg',
  ben:        '/media/ben-sweet-2LowviVHZ-E-unsplash.jpg',
  clay:       '/media/clay-banks-fEVaiLwWvlU-unsplash.jpg',
  emile:      '/media/emile-seguin-R9OueKOtGGU-unsplash.jpg',
  erikm:      '/media/erik-mclean-9y1cTVKe1IY-unsplash.jpg',
  fabrice:    '/media/fabrice-villard-Jrl_UQcZqOc-unsplash.jpg',
  jake:       '/media/jake-blucker-tMzCrBkM99Y-unsplash.jpg',
  jens:       '/media/jens-riesenberg-PZ7HxI8tW_E-unsplash.jpg',
  jeremy:     '/media/jeremy-thomas-rMmibFe4czY-unsplash.jpg',
  jonas:      '/media/jonas-leupe-P7kcWEYy4n8-unsplash.jpg',
  jrkorpa1:   '/media/jr-korpa-ZWDg7v2FPWE-unsplash.jpg',
  jrkorpa2:   '/media/jr-korpa-hfRoW7KE-8M-unsplash.jpg',
  namroud:    '/media/namroud-gorguis-FZWivbri0Xk-unsplash.jpg',
  phil:       '/media/phil-desforges-ArX9Vly-gWM-unsplash.jpg',
  sasha:      '/media/sasha-freemind-nXo2ZsKHTHg-unsplash.jpg',
  seyi:       '/media/seyi-ariyo-6YgYRcyQK_s-unsplash.jpg',
  storm:      '/media/stormseeker-rX12B5uX7QM-unsplash.jpg',
  susan:      '/media/susan-wilkinson-K5u5bXMGIwM-unsplash.jpg',
}

// ── Audio (only files confirmed present in public/audio/) ─────────────
const AUDIO = {
  dream:   '/audio/mixkit-beautiful-dream-493.mp3',
  cbpd:    '/audio/mixkit-cbpd-400.mp3',
  driving: '/audio/mixkit-driving-ambition-32.mp3',
  fright:  '/audio/mixkit-fright-night-871.mp3',
  gimme:   '/audio/mixkit-gimme-that-groove-872.mp3',
  hazy:    '/audio/mixkit-hazy-after-hours-132.mp3',
  hiphop:  '/audio/mixkit-hip-hop-02-738.mp3',
  serene:  '/audio/mixkit-serene-view-443.mp3',
  valley:  '/audio/mixkit-valley-sunset-127.mp3',
}

async function main() {
  const adminId = (await prisma.user.findUnique({ where: { email: 'admin@otr.local' } }))?.id
  if (!adminId) throw new Error('Run seed.ts first — admin user not found')

  // ── Resolve existing creator IDs ──────────────────────────────────────
  const getCreator = async (username: string) => {
    const u = await prisma.user.findUnique({ where: { username } })
    if (!u) throw new Error(`Creator not found: ${username} — run seed-content.ts first`)
    return u.id
  }

  const djUnderground  = await getCreator('dj_underground')
  const nightOwl       = await getCreator('night_owl')
  const soulKitchen    = await getCreator('soul_kitchen')
  const mcStreets      = await getCreator('mc_streets')
  const vinylDistrict  = await getCreator('vinyl_district')
  const djPavement     = await getCreator('dj_pavement')
  const blockParty     = await getCreator('block_party')
  const theNightShift  = await getCreator('the_night_shift')
  const theAlleyCats   = await getCreator('the_alley_cats')

  // ── New guest creators (for discover / full catalog variety) ──────────
  const hash = await bcrypt.hash('creator123', 10)
  const newGuests = [
    { email: 'lowkeycollective@otr.local', username: 'lowkey_collective', displayName: 'LOWKEY COLLECTIVE', bio: 'Lo-fi and downtempo from the basement.', avatarUrl: IMG.sasha   },
    { email: 'djsunrise@otr.local',        username: 'dj_sunrise',        displayName: 'DJ SUNRISE',        bio: 'Afrobeats and world music selector.',    avatarUrl: IMG.seyi    },
    { email: 'concretewave@otr.local',     username: 'concrete_wave',     displayName: 'CONCRETE WAVE',     bio: 'Punk-influenced electronic producer.',  avatarUrl: IMG.storm   },
    { email: 'deeproots@otr.local',        username: 'deep_roots',        displayName: 'DEEP ROOTS',        bio: 'Reggae and dub from the diaspora.',     avatarUrl: IMG.phil    },
  ]
  const newGuestIds: Record<string, number> = {}
  for (const u of newGuests) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hash, role: 'guest_creator', isVerified: 1 },
    })
    newGuestIds[u.username] = user.id
  }
  console.log(`Seeded ${newGuests.length} new guest creators`)

  // ── upsertContent helper ──────────────────────────────────────────────
  async function upsertContent(data: {
    slug: string
    title: string
    description: string
    type: 'track' | 'album' | 'mixtape' | 'playlist' | 'radio_show' | 'video'
    category: 'picks' | 'residents' | 'guests' | 'featured' | 'program'
    coverUrl: string
    audioUrl?: string
    youtubeEmbed?: string
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
        youtubeEmbed: data.youtubeEmbed ?? null,
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


  // ── Highlights (fixes #2 and #3 — hero banner + side cards) ──────────
  // The Highlight model has no contentId FK — routing is via the `link` field.
  // We seed 1 main + 2 side highlights pointing at existing content slugs.
  const highlightDefs = [
    {
      position: 'main' as const,
      sideIndex: null,
      title: 'MIDNIGHT FREQUENCIES',
      artist: 'DJ UNDERGROUND',
      image: IMG.jrkorpa1,
      tag: 'FEATURED MIX',
      type: 'mixtape',
      link: '/content/midnight-frequencies',
      active: 1,
      sortOrder: 0,
    },
    {
      position: 'side' as const,
      sideIndex: 0,
      title: 'WAREHOUSE SESSIONS VOL.1',
      artist: 'NIGHT OWL',
      image: IMG.storm,
      tag: 'RESIDENT PICK',
      type: 'mixtape',
      link: '/content/warehouse-sessions-vol1',
      active: 1,
      sortOrder: 1,
    },
    {
      position: 'side' as const,
      sideIndex: 1,
      title: 'SOUL SELECTIONS VOL.3',
      artist: 'SOUL KITCHEN',
      image: IMG.susan,
      tag: 'NEW RELEASE',
      type: 'mixtape',
      link: '/content/soul-selections-vol3',
      active: 1,
      sortOrder: 2,
    },
  ]

  for (const h of highlightDefs) {
    // Check by position+sideIndex to avoid duplicates on re-run
    const existing = await prisma.highlight.findFirst({
      where: { position: h.position, sideIndex: h.sideIndex ?? undefined },
    })
    if (!existing) {
      await prisma.highlight.create({ data: h })
    }
  }
  console.log(`Seeded ${highlightDefs.length} highlights`)

  // ── Featured content (fixes #16 and #17 — featured tab was near-empty) ─
  // These are the items that appear in archive/featured.vue grid + hero.
  // The frontend routes to /featured/${id} which doesn't exist yet,
  // but the content itself needs to exist so the tab isn't empty.
  const featuredContent = [
    {
      slug: 'otr-x-lowkey-collective',
      title: 'OTR × LOWKEY COLLECTIVE',
      desc: 'A collaborative project blending lo-fi textures with underground electronic. Recorded over three sessions in a basement studio.',
      cover: IMG.sasha,
      audio: AUDIO.hazy,
      dur: 3600,
      creator: newGuestIds['lowkey_collective'],
      tags: ['chill', 'hypnotic'],
      genres: ['lo-fi', 'electronic'],
    },
    {
      slug: 'otr-x-deep-roots',
      title: 'OTR × DEEP ROOTS',
      desc: 'Dub and reggae meets underground electronic. A cross-cultural collaboration rooted in rhythm and bass.',
      cover: IMG.phil,
      audio: AUDIO.driving,
      dur: 4200,
      creator: newGuestIds['deep_roots'],
      tags: ['groovy', 'hypnotic'],
      genres: ['reggae', 'dub'],
    },
    {
      slug: 'otr-x-concrete-wave',
      title: 'OTR × CONCRETE WAVE',
      desc: 'Punk energy channeled through synthesizers and drum machines. Raw, loud, and unapologetic.',
      cover: IMG.storm,
      audio: AUDIO.fright,
      dur: 2700,
      creator: newGuestIds['concrete_wave'],
      tags: ['energetic', 'dark'],
      genres: ['experimental', 'electronic'],
    },
    {
      slug: 'otr-x-dj-sunrise',
      title: 'OTR × DJ SUNRISE',
      desc: 'Afrobeats and world music woven into a seamless mix. Celebrating the global underground.',
      cover: IMG.seyi,
      audio: AUDIO.gimme,
      dur: 5400,
      creator: newGuestIds['dj_sunrise'],
      tags: ['groovy', 'party'],
      genres: ['world', 'electronic'],
    },
    {
      slug: 'otr-x-alley-cats-vol2',
      title: 'OTR × THE ALLEY CATS VOL.2',
      desc: 'The second chapter of our Harlem jazz collaboration. Deeper, darker, and more adventurous.',
      cover: IMG.namroud,
      audio: AUDIO.cbpd,
      dur: 4800,
      creator: theAlleyCats,
      tags: ['nostalgic', 'groovy'],
      genres: ['jazz', 'hip-hop'],
    },
    {
      slug: 'otr-x-vinyl-district-vol2',
      title: 'OTR × VINYL DISTRICT VOL.2',
      desc: 'Vinyl District returns with a second volume of certified floor-fillers from the crates.',
      cover: IMG.fabrice,
      audio: AUDIO.driving,
      dur: 5040,
      creator: vinylDistrict,
      tags: ['groovy', 'party'],
      genres: ['house', 'disco'],
    },
    {
      slug: 'otr-x-night-shift-vol3',
      title: 'OTR × THE NIGHT SHIFT VOL.3',
      desc: 'Brooklyn\'s nocturnal collective returns for a third chapter. Deeper, darker, more hypnotic.',
      cover: IMG.jrkorpa2,
      audio: AUDIO.hazy,
      dur: 6300,
      creator: theNightShift,
      tags: ['dark', 'hypnotic'],
      genres: ['electronic', 'techno'],
    },
    {
      slug: 'otr-x-block-party-summer',
      title: 'OTR × BLOCK PARTY SUMMER',
      desc: 'Block Party brings the heat. A summer collaboration recorded live on a Brooklyn rooftop.',
      cover: IMG.clay,
      audio: AUDIO.gimme,
      dur: 4500,
      creator: blockParty,
      tags: ['groovy', 'party'],
      genres: ['house', 'funk'],
    },
  ]

  for (const f of featuredContent) {
    await upsertContent({
      slug: f.slug, title: f.title, description: f.desc,
      type: 'mixtape', category: 'featured',
      coverUrl: f.cover, audioUrl: f.audio,
      duration: f.dur, releaseDate: '2026-02-15',
      creatorId: f.creator, tags: f.tags, genres: f.genres,
      plays: Math.floor(Math.random() * 10000) + 1000,
    })
  }
  console.log(`Seeded ${featuredContent.length} featured items`)


  // ── Tracks (singles) — 15 items across all categories ───────────────
  const extraTracks = [
    // picks
    { slug: 'lo-fi-morning-ritual',  title: 'LO-FI MORNING RITUAL',  desc: 'Soft beats and warm textures for a slow morning start.',           cover: IMG.ben,      audio: AUDIO.dream,   dur: 195, creator: newGuestIds['lowkey_collective'], tags: ['chill','morning'],       genres: ['lo-fi','ambient'],        cat: 'picks'     as const },
    { slug: 'afro-pulse',            title: 'AFRO PULSE',            desc: 'Afrobeats-influenced electronic with deep percussive grooves.',     cover: IMG.seyi,     audio: AUDIO.gimme,   dur: 212, creator: newGuestIds['dj_sunrise'],        tags: ['groovy','energetic'],    genres: ['world','electronic'],     cat: 'picks'     as const },
    { slug: 'dub-pressure',          title: 'DUB PRESSURE',          desc: 'Heavy bass and reverb-drenched dub from the underground.',         cover: IMG.emile,    audio: AUDIO.driving, dur: 228, creator: newGuestIds['deep_roots'],        tags: ['hypnotic','dark'],       genres: ['dub','reggae'],           cat: 'picks'     as const },
    { slug: 'neon-static',           title: 'NEON STATIC',           desc: 'Glitchy synth textures and fractured rhythms from the grid.',      cover: IMG.jeremy,   audio: AUDIO.fright,  dur: 203, creator: newGuestIds['concrete_wave'],     tags: ['dark','focused'],        genres: ['experimental','techno'],  cat: 'picks'     as const },
    { slug: 'golden-ratio',          title: 'GOLDEN RATIO',          desc: 'Warm analogue tones built around a perfect mathematical groove.',   cover: IMG.jens,     audio: AUDIO.serene,  dur: 247, creator: djPavement,                       tags: ['peaceful','focused'],    genres: ['ambient','electronic'],   cat: 'picks'     as const },
    // residents
    { slug: 'concrete-frequencies',  title: 'CONCRETE FREQUENCIES',  desc: 'Industrial textures and field recordings from the city grid.',     cover: IMG.jonas,    audio: AUDIO.fright,  dur: 204, creator: djPavement,                       tags: ['hypnotic','focused'],    genres: ['industrial','ambient'],   cat: 'residents' as const },
    { slug: 'soul-revival',          title: 'SOUL REVIVAL',          desc: 'A warm soul cut built around a vintage organ sample.',             cover: IMG.susan,    audio: AUDIO.serene,  dur: 237, creator: soulKitchen,                      tags: ['nostalgic','romantic'],  genres: ['soul','r&b'],             cat: 'residents' as const },
    { slug: 'block-cipher',          title: 'BLOCK CIPHER',          desc: 'Cryptic boom-bap with layered samples and sharp lyricism.',        cover: IMG.anthony,  audio: AUDIO.hiphop,  dur: 183, creator: mcStreets,                        tags: ['energetic','dark'],      genres: ['hip-hop'],                cat: 'residents' as const },
    { slug: 'disco-inferno-edit',    title: 'DISCO INFERNO EDIT',    desc: 'A Vinyl District edit of a classic disco record. Certified.',      cover: IMG.jake,     audio: AUDIO.driving, dur: 256, creator: vinylDistrict,                    tags: ['groovy','party'],        genres: ['disco','house'],          cat: 'residents' as const },
    { slug: 'techno-void',           title: 'TECHNO VOID',           desc: 'Stripped-back techno built from a single oscillator and silence.',  cover: IMG.jrkorpa1, audio: AUDIO.fright,  dur: 198, creator: nightOwl,                         tags: ['dark','hypnotic'],       genres: ['techno'],                 cat: 'residents' as const },
    // guests
    { slug: 'rooftop-sessions',      title: 'ROOFTOP SESSIONS',      desc: 'Block Party records live on a Brooklyn rooftop at sunset.',        cover: IMG.clay,     audio: AUDIO.valley,  dur: 221, creator: blockParty,                       tags: ['groovy','party'],        genres: ['house','funk'],           cat: 'guests'    as const },
    { slug: 'nocturnal-drift',       title: 'NOCTURNAL DRIFT',       desc: 'The Night Shift goes ambient. Slow, dark, and beautiful.',         cover: IMG.jrkorpa2, audio: AUDIO.serene,  dur: 309, creator: theNightShift,                    tags: ['chill','late-night'],    genres: ['ambient','electronic'],   cat: 'guests'    as const },
    { slug: 'harlem-shuffle',        title: 'HARLEM SHUFFLE',        desc: 'The Alley Cats bring jazz-funk energy to the dancefloor.',         cover: IMG.namroud,  audio: AUDIO.cbpd,    dur: 194, creator: theAlleyCats,                     tags: ['groovy','nostalgic'],    genres: ['jazz','funk'],            cat: 'guests'    as const },
    { slug: 'punk-synth-001',        title: 'PUNK SYNTH 001',        desc: 'Concrete Wave\'s debut single. Aggressive, fast, and loud.',       cover: IMG.storm,    audio: AUDIO.fright,  dur: 167, creator: newGuestIds['concrete_wave'],     tags: ['energetic','dark'],      genres: ['experimental'],           cat: 'guests'    as const },
    { slug: 'sunrise-afro-edit',     title: 'SUNRISE AFRO EDIT',     desc: 'DJ Sunrise edits a classic Afrobeats record for the club.',        cover: IMG.seyi,     audio: AUDIO.gimme,   dur: 243, creator: newGuestIds['dj_sunrise'],        tags: ['groovy','party'],        genres: ['world','house'],          cat: 'guests'    as const },
  ]

  for (const t of extraTracks) {
    await upsertContent({
      slug: t.slug, title: t.title, description: t.desc,
      type: 'track', category: t.cat,
      coverUrl: t.cover, audioUrl: t.audio,
      duration: t.dur, releaseDate: '2026-03-01',
      creatorId: t.creator, tags: t.tags, genres: t.genres,
      plays: Math.floor(Math.random() * 6000) + 200,
    })
  }
  console.log(`Seeded ${extraTracks.length} extra tracks`)

  // ── Mixtapes — 7 items ────────────────────────────────────────────────
  const extraMixtapes = [
    { slug: 'lo-fi-city-tapes',        title: 'LO-FI CITY TAPES',        desc: 'Lowkey Collective\'s debut tape. Hazy beats for rainy days.',      cover: IMG.ben,      audio: AUDIO.hazy,    dur: 3240, creator: newGuestIds['lowkey_collective'], tags: ['chill','melancholic'],   genres: ['lo-fi','ambient'],        cat: 'picks'     as const },
    { slug: 'world-underground-vol1',  title: 'WORLD UNDERGROUND VOL.1',  desc: 'DJ Sunrise curates a global underground journey.',                 cover: IMG.arvind,   audio: AUDIO.valley,  dur: 4500, creator: newGuestIds['dj_sunrise'],        tags: ['groovy','peaceful'],     genres: ['world','electronic'],     cat: 'guests'    as const },
    { slug: 'dub-chronicles',          title: 'DUB CHRONICLES',           desc: 'Deep Roots goes deep. Dub and reggae from the diaspora.',          cover: IMG.emile,    audio: AUDIO.driving, dur: 3900, creator: newGuestIds['deep_roots'],        tags: ['hypnotic','peaceful'],   genres: ['dub','reggae'],           cat: 'guests'    as const },
    { slug: 'punk-electronic-ep',      title: 'PUNK ELECTRONIC EP',       desc: 'Concrete Wave\'s debut EP. Four tracks of controlled chaos.',      cover: IMG.storm,    audio: AUDIO.fright,  dur: 1440, creator: newGuestIds['concrete_wave'],     tags: ['energetic','dark'],      genres: ['experimental','techno'],  cat: 'guests'    as const },
    { slug: 'underground-dispatch',    title: 'UNDERGROUND DISPATCH',     desc: 'DJ Underground\'s monthly dispatch. The best of the underground.', cover: IMG.jrkorpa1, audio: AUDIO.dream,   dur: 5400, creator: djUnderground,                    tags: ['chill','late-night'],    genres: ['electronic','ambient'],   cat: 'residents' as const },
    { slug: 'hip-hop-chronicles-v2',   title: 'HIP HOP CHRONICLES V.2',   desc: 'MC Streets returns with volume two. Harder, rawer, realer.',       cover: IMG.anthony,  audio: AUDIO.hiphop,  dur: 4320, creator: mcStreets,                        tags: ['energetic','groovy'],    genres: ['hip-hop'],                cat: 'residents' as const },
    { slug: 'soul-sunday-vol2',        title: 'SOUL SUNDAY VOL.2',        desc: 'Soul Kitchen\'s second Sunday selection. Warm and essential.',     cover: IMG.susan,    audio: AUDIO.serene,  dur: 3600, creator: soulKitchen,                      tags: ['nostalgic','romantic'],  genres: ['soul','r&b'],             cat: 'picks'     as const },
  ]

  for (const m of extraMixtapes) {
    await upsertContent({
      slug: m.slug, title: m.title, description: m.desc,
      type: 'mixtape', category: m.cat,
      coverUrl: m.cover, audioUrl: m.audio,
      duration: m.dur, releaseDate: '2026-03-15',
      creatorId: m.creator, tags: m.tags, genres: m.genres,
      plays: Math.floor(Math.random() * 12000) + 500,
    })
  }
  console.log(`Seeded ${extraMixtapes.length} extra mixtapes`)

  // ── Albums — 8 items (new type not in extraTracks/extraMixtapes) ──────
  const extraAlbums = [
    { slug: 'signal-and-noise-lp',     title: 'SIGNAL AND NOISE LP',      desc: 'Night Owl\'s debut long player. Eight tracks of pure warehouse techno.',          cover: IMG.jrkorpa2, audio: AUDIO.fright,  dur: 2880, creator: nightOwl,                         tags: ['dark','hypnotic'],       genres: ['techno','industrial'],    cat: 'residents' as const },
    { slug: 'frequency-modulation',    title: 'FREQUENCY MODULATION',     desc: 'DJ Pavement explores the space between field recording and deep house.',          cover: IMG.jonas,    audio: AUDIO.dream,   dur: 3240, creator: djPavement,                       tags: ['peaceful','hypnotic'],   genres: ['ambient','deep-house'],   cat: 'residents' as const },
    { slug: 'street-level-lp',         title: 'STREET LEVEL LP',          desc: 'MC Streets\' debut album. Ten tracks of raw boom-bap from the block.',            cover: IMG.anthony,  audio: AUDIO.hiphop,  dur: 2520, creator: mcStreets,                        tags: ['energetic','dark'],      genres: ['hip-hop'],                cat: 'residents' as const },
    { slug: 'crate-digger-anthology',  title: 'CRATE DIGGER ANTHOLOGY',   desc: 'Vinyl District\'s definitive collection. House, disco, and everything in between.', cover: IMG.jake,    audio: AUDIO.driving, dur: 4200, creator: vinylDistrict,                    tags: ['groovy','nostalgic'],    genres: ['house','disco','funk'],   cat: 'picks'     as const },
    { slug: 'warmth-lp',               title: 'WARMTH LP',                desc: 'Soul Kitchen\'s debut album. Soul, R&B, and gospel woven into one.',              cover: IMG.susan,    audio: AUDIO.serene,  dur: 3600, creator: soulKitchen,                      tags: ['nostalgic','romantic'],  genres: ['soul','r&b'],             cat: 'picks'     as const },
    { slug: 'lo-fi-portraits',         title: 'LO-FI PORTRAITS',          desc: 'Lowkey Collective\'s first album. Intimate, hazy, and deeply personal.',          cover: IMG.sasha,    audio: AUDIO.hazy,    dur: 2700, creator: newGuestIds['lowkey_collective'], tags: ['chill','melancholic'],   genres: ['lo-fi','indie'],          cat: 'guests'    as const },
    { slug: 'diaspora-sounds',         title: 'DIASPORA SOUNDS',          desc: 'Deep Roots\' debut album. Reggae, dub, and afrobeats from the diaspora.',         cover: IMG.phil,     audio: AUDIO.valley,  dur: 3120, creator: newGuestIds['deep_roots'],        tags: ['groovy','peaceful'],     genres: ['reggae','dub','world'],   cat: 'guests'    as const },
    { slug: 'otr-compilation-vol2',    title: 'OTR COMPILATION VOL.2',    desc: 'The second official OTR compilation. Every resident and guest, all in one place.', cover: IMG.alexandru, audio: AUDIO.cbpd,  dur: 5040, creator: djUnderground,                    tags: ['various','curated'],     genres: ['electronic','hip-hop'],   cat: 'featured'  as const },
  ]

  for (const a of extraAlbums) {
    await upsertContent({
      slug: a.slug, title: a.title, description: a.desc,
      type: 'album', category: a.cat,
      coverUrl: a.cover, audioUrl: a.audio,
      duration: a.dur, releaseDate: '2026-04-01',
      creatorId: a.creator, tags: a.tags, genres: a.genres,
      plays: Math.floor(Math.random() * 18000) + 1500,
    })
  }
  console.log(`Seeded ${extraAlbums.length} extra albums`)


  // ── Additional program episodes — more episodes for existing programs ──
  // Fills out the program detail pages so they have enough content.
  async function upsertEpisode(
    programSlug: string,
    slug: string,
    title: string,
    description: string,
    audioUrl: string | null,
    duration: number,
    publishedAt: string,
    sortOrder: number,
  ) {
    const program = await prisma.program.findUnique({ where: { slug: programSlug } })
    if (!program) return // program not seeded yet, skip
    const existing = await prisma.programEpisode.findUnique({
      where: { programId_slug: { programId: program.id, slug } },
    })
    if (existing) return
    return prisma.programEpisode.create({
      data: { programId: program.id, slug, title, description, audioUrl, duration, publishedAt, sortOrder },
    })
  }

  const extraEpisodes: {
    program: string
    slug: string
    title: string
    desc: string
    audio: string
    dur: number
    date: string
    order: number
  }[] = [
    // indie-alley-radio — extend to ep-10
    { program: 'indie-alley-radio', slug: 'ep-06', title: 'EP.06 — DEEP CUTS',       desc: 'Rare and overlooked tracks from the indie underground.',          audio: AUDIO.serene,  dur: 7200, date: '2025-10-10', order: 5 },
    { program: 'indie-alley-radio', slug: 'ep-07', title: 'EP.07 — COLLABORATIONS',  desc: 'Special episode featuring guest mixes from the community.',        audio: AUDIO.valley,  dur: 7200, date: '2025-10-17', order: 6 },
    { program: 'indie-alley-radio', slug: 'ep-08', title: 'EP.08 — LIVE SESSION',    desc: 'Recorded live at the OTR studio. No overdubs, no edits.',          audio: AUDIO.dream,   dur: 7200, date: '2025-10-24', order: 7 },
    { program: 'indie-alley-radio', slug: 'ep-09', title: 'EP.09 — YEAR IN REVIEW',  desc: 'Looking back at the best tracks of the year.',                    audio: AUDIO.hazy,    dur: 7200, date: '2025-10-31', order: 8 },
    { program: 'indie-alley-radio', slug: 'ep-10', title: 'EP.10 — NEW HORIZONS',    desc: 'Fresh sounds and new directions for the next chapter.',            audio: AUDIO.cbpd,    dur: 7200, date: '2025-11-07', order: 9 },
    // warehouse-sessions — extend to ep-08
    { program: 'warehouse-sessions', slug: 'ep-05', title: 'EP.05 — BACK TO BASICS', desc: 'Stripped back to the essentials. Kick, bass, and nothing else.',   audio: AUDIO.fright,  dur: 7200, date: '2025-10-04', order: 4 },
    { program: 'warehouse-sessions', slug: 'ep-06', title: 'EP.06 — GUEST TAKEOVER', desc: 'Night Shift takes over the warehouse for a full session.',          audio: AUDIO.hazy,    dur: 7200, date: '2025-10-11', order: 5 },
    { program: 'warehouse-sessions', slug: 'ep-07', title: 'EP.07 — INDUSTRIAL',     desc: 'Going harder. Industrial textures and relentless percussion.',      audio: AUDIO.driving, dur: 7200, date: '2025-10-18', order: 6 },
    { program: 'warehouse-sessions', slug: 'ep-08', title: 'EP.08 — CLOSING SET',    desc: 'The final set of the season. Dark, slow, and beautiful.',          audio: AUDIO.dream,   dur: 7200, date: '2025-10-25', order: 7 },
    // beats-and-streets — extend to ep-10
    { program: 'beats-and-streets', slug: 'ep-07', title: 'EP.07 — PRODUCERS',       desc: 'Spotlight on the producers behind the beats.',                    audio: AUDIO.hiphop,  dur: 7200, date: '2025-10-13', order: 6 },
    { program: 'beats-and-streets', slug: 'ep-08', title: 'EP.08 — THROWBACK',       desc: 'Classic hip-hop from the golden era. No skips.',                  audio: AUDIO.hiphop,  dur: 7200, date: '2025-10-20', order: 7 },
    { program: 'beats-and-streets', slug: 'ep-09', title: 'EP.09 — NEW SCHOOL',      desc: 'The next generation of hip-hop. Fresh faces and fresh sounds.',    audio: AUDIO.cbpd,    dur: 7200, date: '2025-10-27', order: 8 },
    { program: 'beats-and-streets', slug: 'ep-10', title: 'EP.10 — ANNIVERSARY',     desc: 'Ten episodes in. Celebrating with the best of the best.',         audio: AUDIO.gimme,   dur: 7200, date: '2025-11-03', order: 9 },
    // soul-kitchen — extend to ep-08
    { program: 'soul-kitchen', slug: 'ep-06', title: 'EP.06 — DEEP SOUL',            desc: 'Going deeper into the soul catalog. Rare and essential.',          audio: AUDIO.serene,  dur: 5400, date: '2025-10-12', order: 5 },
    { program: 'soul-kitchen', slug: 'ep-07', title: 'EP.07 — GOSPEL ROOTS',         desc: 'Tracing soul music back to its gospel origins.',                   audio: AUDIO.valley,  dur: 5400, date: '2025-10-19', order: 6 },
    { program: 'soul-kitchen', slug: 'ep-08', title: 'EP.08 — MODERN SOUL',          desc: 'Contemporary soul and R&B for the new generation.',               audio: AUDIO.dream,   dur: 5400, date: '2025-10-26', order: 7 },
    // friday-night-party — extend to ep-06
    { program: 'friday-night-party', slug: 'ep-04', title: 'EP.04 — FUNK NIGHT',     desc: 'All funk, all night. Vinyl District goes deep into the crates.',   audio: AUDIO.gimme,   dur: 14400, date: '2025-09-26', order: 3 },
    { program: 'friday-night-party', slug: 'ep-05', title: 'EP.05 — GUEST DJ',       desc: 'Block Party takes over the Friday Night Party.',                   audio: AUDIO.valley,  dur: 14400, date: '2025-10-03', order: 4 },
    { program: 'friday-night-party', slug: 'ep-06', title: 'EP.06 — CLASSICS ONLY',  desc: 'Nothing but classics. Every track a certified floor-filler.',      audio: AUDIO.driving, dur: 14400, date: '2025-10-10', order: 5 },
    // morning-frequencies — extend to ep-08
    { program: 'morning-frequencies', slug: 'ep-05', title: 'EP.05 — RAIN',          desc: 'Ambient textures for a rainy morning. Stay inside.',               audio: AUDIO.serene,  dur: 3600, date: '2025-09-05', order: 4 },
    { program: 'morning-frequencies', slug: 'ep-06', title: 'EP.06 — MEDITATION',    desc: 'Slow, minimal, and meditative. Start your day with intention.',    audio: AUDIO.dream,   dur: 3600, date: '2025-09-06', order: 5 },
    { program: 'morning-frequencies', slug: 'ep-07', title: 'EP.07 — WEEKEND',       desc: 'A longer, lazier morning mix for the weekend.',                    audio: AUDIO.hazy,    dur: 5400, date: '2025-09-07', order: 6 },
    { program: 'morning-frequencies', slug: 'ep-08', title: 'EP.08 — GOLDEN HOUR',   desc: 'Warm synths and soft percussion for the golden hour.',             audio: AUDIO.valley,  dur: 3600, date: '2025-09-08', order: 7 },
    // jazz-wednesdays — extend to ep-06
    { program: 'jazz-wednesdays', slug: 'ep-04', title: 'EP.04 — CONTEMPORARY',      desc: 'Modern jazz from the new generation of players.',                  audio: AUDIO.cbpd,    dur: 7200, date: '2025-09-24', order: 3 },
    { program: 'jazz-wednesdays', slug: 'ep-05', title: 'EP.05 — PIANO NIGHT',       desc: 'A full episode dedicated to jazz piano. Solo and ensemble.',       audio: AUDIO.serene,  dur: 7200, date: '2025-10-01', order: 4 },
    { program: 'jazz-wednesdays', slug: 'ep-06', title: 'EP.06 — GUEST QUARTET',     desc: 'The Alley Cats join for a live quartet session.',                  audio: AUDIO.valley,  dur: 7200, date: '2025-10-08', order: 5 },
    // after-hours — extend to ep-06
    { program: 'after-hours', slug: 'ep-05', title: 'EP.05 — VOID',                  desc: 'Minimal and empty. Just the music and the dark.',                  audio: AUDIO.fright,  dur: 7200, date: '2025-10-04', order: 4 },
    { program: 'after-hours', slug: 'ep-06', title: 'EP.06 — LAST CALL',             desc: 'The final episode of the season. Going out with a whisper.',       audio: AUDIO.serene,  dur: 7200, date: '2025-10-11', order: 5 },
  ]

  let episodeCount = 0
  for (const ep of extraEpisodes) {
    await upsertEpisode(ep.program, ep.slug, ep.title, ep.desc, ep.audio, ep.dur, ep.date, ep.order)
    episodeCount++
  }
  console.log(`Seeded ${episodeCount} extra program episodes`)

  // ── Picks table entries — wire content to the Pick join table ─────────
  // The picks tab in the admin uses the Pick model, not just content.category.
  // Seed Pick rows for all content with category='picks' so both paths work.
  const picksContent = await prisma.content.findMany({
    where: { category: 'picks', status: 'published' },
    select: { id: true, type: true },
  })

  let picksSeeded = 0
  for (const c of picksContent) {
    const existing = await prisma.pick.findUnique({
      where: { contentType_contentId: { contentType: c.type, contentId: c.id } },
    })
    if (!existing) {
      await prisma.pick.create({
        data: { contentType: c.type, contentId: c.id, isActive: 1, sortOrder: picksSeeded },
      })
      picksSeeded++
    }
  }
  console.log(`Seeded ${picksSeeded} pick entries`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
