import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import { readFileSync, readdirSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────
const ACCOUNT_ID   = process.env.R2_ACCOUNT_ID!
const ACCESS_KEY   = process.env.R2_ACCESS_KEY_ID!
const SECRET_KEY   = process.env.R2_SECRET_ACCESS_KEY!
const BUCKET       = process.env.R2_BUCKET_NAME ?? 'otr-storage'
const PUBLIC_URL   = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY || !PUBLIC_URL) {
  console.error('Missing R2 env vars. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL')
  process.exit(1)
}

const MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.m4a':  'audio/x-m4a',
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
})

const prisma = new PrismaClient()

// ── Helpers ───────────────────────────────────────────────────────────────────
async function existsInR2(key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function upload(localPath: string, key: string, mime: string): Promise<string> {
  const already = await existsInR2(key)
  if (already) {
    console.log(`  skip  ${key} (already in R2)`)
    return `${PUBLIC_URL}/${key}`
  }
  const body = readFileSync(localPath)
  await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: mime }))
  const url = `${PUBLIC_URL}/${key}`
  console.log(`  up    ${key}`)
  return url
}

// ── Upload all files in a local dir to R2 ────────────────────────────────────
async function uploadDir(localDir: string, r2Prefix: string): Promise<Map<string, string>> {
  // returns: localRelPath (/media/foo.jpg) -> r2 public URL
  const mapping = new Map<string, string>()
  let files: string[]
  try {
    files = readdirSync(localDir)
  } catch {
    console.warn(`  warn  ${localDir} not found, skipping`)
    return mapping
  }
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const mime = MIME[ext]
    if (!mime) { console.log(`  skip  ${file} (unknown type)`); continue }
    const localPath = join(localDir, file)
    const key = `${r2Prefix}/${file}`
    const url = await upload(localPath, key, mime)
    // local seed path uses /media/ or /audio/ prefix
    const localKey = r2Prefix === 'images' ? `/media/${file}` : `/audio/${file}`
    mapping.set(localKey, url)
  }
  return mapping
}

// ── Update DB URLs ────────────────────────────────────────────────────────────
async function updateDb(mapping: Map<string, string>) {
  let updated = 0

  // Content: coverUrl, audioUrl
  const contents = await prisma.content.findMany({
    select: { id: true, coverUrl: true, audioUrl: true },
  })
  for (const c of contents) {
    const newCover = c.coverUrl ? mapping.get(c.coverUrl) : undefined
    const newAudio = c.audioUrl ? mapping.get(c.audioUrl) : undefined
    if (newCover || newAudio) {
      await prisma.content.update({
        where: { id: c.id },
        data: {
          ...(newCover ? { coverUrl: newCover } : {}),
          ...(newAudio ? { audioUrl: newAudio } : {}),
        },
      })
      updated++
    }
  }

  // User: avatarUrl
  const users = await prisma.user.findMany({ select: { id: true, avatarUrl: true } })
  for (const u of users) {
    const newAvatar = u.avatarUrl ? mapping.get(u.avatarUrl) : undefined
    if (newAvatar) {
      await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: newAvatar } })
      updated++
    }
  }

  // Program: imageUrl
  const programs = await prisma.program.findMany({ select: { id: true, imageUrl: true } })
  for (const p of programs) {
    const newImg = p.imageUrl ? mapping.get(p.imageUrl) : undefined
    if (newImg) {
      await prisma.program.update({ where: { id: p.id }, data: { imageUrl: newImg } })
      updated++
    }
  }

  // ProgramEpisode: audioUrl
  const episodes = await prisma.programEpisode.findMany({ select: { id: true, audioUrl: true } })
  for (const e of episodes) {
    const newAudio = e.audioUrl ? mapping.get(e.audioUrl) : undefined
    if (newAudio) {
      await prisma.programEpisode.update({ where: { id: e.id }, data: { audioUrl: newAudio } })
      updated++
    }
  }

  console.log(`\nDB: updated ${updated} rows`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const publicDir = join(__dirname, '..', 'public')

  console.log('Uploading images...')
  const imgMap = await uploadDir(join(publicDir, 'media'), 'images')

  console.log('\nUploading audio...')
  const audioMap = await uploadDir(join(publicDir, 'audio'), 'audio')

  const combined = new Map([...imgMap, ...audioMap])
  console.log(`\nUploaded ${combined.size} files total`)

  console.log('\nUpdating DB URLs...')
  await updateDb(combined)

  await prisma.$disconnect()
  console.log('\nDone.')
}

main().catch(e => { console.error(e); process.exit(1) })
