import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { config, isR2Configured } from '../config.js'

let client: S3Client | null = null

function getClient(): S3Client {
  if (!client) {
    if (!isR2Configured()) throw new Error('R2 not configured')
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    })
  }
  return client
}

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// WAV, AAC, MP3, WMA, FLAC, PCM, MP4 (and common variants)
const ALLOWED_AUDIO = [
  'audio/mpeg',       // MP3
  'audio/mp3',        // MP3 (some clients)
  'audio/wav',        // WAV
  'audio/x-wav',      // WAV
  'audio/wave',       // WAV
  'audio/aac',        // AAC
  'audio/mp4',        // AAC/MP4 audio
  'audio/x-m4a',      // M4A
  'audio/x-ms-wma',   // WMA
  'audio/wma',        // WMA
  'audio/flac',       // FLAC
  'audio/L16',        // PCM 16-bit
  'audio/pcm',        // PCM
  'video/mp4',        // MP4 (audio or video)
  'audio/ogg',        // OGG (kept for compatibility)
]

export function validateImageType(mimetype: string): boolean {
  return ALLOWED_IMAGE.includes(mimetype)
}

export function validateAudioType(mimetype: string): boolean {
  return ALLOWED_AUDIO.includes(mimetype)
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const c = getClient()
  await c.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  const base = config.r2.publicUrl.replace(/\/$/, '')
  return `${base}/${key}`
}

/** Upload a single multer file to R2. folder = 'images' or 'audio'. Returns public URL. */
export async function uploadFileToR2(
  file: Express.Multer.File,
  folder: 'images' | 'audio'
): Promise<string> {
  if (folder === 'audio') {
    if (!validateAudioType(file.mimetype)) throw new Error(`Invalid audio type: ${file.mimetype}`)
  } else {
    if (!validateImageType(file.mimetype)) throw new Error(`Invalid image type: ${file.mimetype}`)
  }
  const ext = file.originalname.split('.').pop() || (folder === 'audio' ? 'mp3' : 'jpg')
  const key = `${folder}/${randomUUID()}.${ext}`
  return uploadToR2(key, file.buffer, file.mimetype)
}
