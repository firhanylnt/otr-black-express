import multer from 'multer'

const memory = multer.memoryStorage()
const limit50 = 50 * 1024 * 1024   // 50MB (images)
const limit100 = 100 * 1024 * 1024 // 100MB (audio)

/** Untuk POST/PATCH songs: field cover (image) + audio (file) */
export const songUpload = multer({ storage: memory, limits: { fileSize: limit100 } }).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
])

/** Satu image (cover / banner / image) */
export const singleImageUpload = multer({ storage: memory, limits: { fileSize: limit50 } }).fields([
  { name: 'cover', maxCount: 1 },
])

/** Album/Playlist: cover */
export const coverUpload = multer({ storage: memory, limits: { fileSize: limit50 } }).fields([
  { name: 'cover', maxCount: 1 },
])

/** Event: cover + banner */
export const eventUpload = multer({ storage: memory, limits: { fileSize: limit50 } }).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
])

/** Program: image. Episode: audio */
export const programImageUpload = multer({ storage: memory, limits: { fileSize: limit50 } }).fields([
  { name: 'image', maxCount: 1 },
])
export const episodeAudioUpload = multer({ storage: memory, limits: { fileSize: limit100 } }).fields([
  { name: 'audio', maxCount: 1 },
])

/** Product: image */
export const productImageUpload = multer({ storage: memory, limits: { fileSize: limit50 } }).fields([
  { name: 'image', maxCount: 1 },
])

/** Highlight: image + customImage */
export const highlightUpload = multer({ storage: memory, limits: { fileSize: limit50 } }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'customImage', maxCount: 1 },
])
