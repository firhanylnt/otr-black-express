import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { authMiddleware } from '../middleware/auth.js'
import { uploadToR2, validateImageType, validateAudioType } from '../services/r2.js'
import { isR2Configured } from '../config.js'

const router = Router()
const memory = multer.memoryStorage()
const upload = multer({ storage: memory, limits: { fileSize: 50 * 1024 * 1024 } }) // 50MB

router.post('/image', authMiddleware, upload.single('file'), async (req, res) => {
  if (!isR2Configured()) {
    return res.status(503).json({ success: false, message: 'Upload service not configured' })
  }
  const file = req.file
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file' })
  }
  if (!validateImageType(file.mimetype)) {
    return res.status(400).json({ success: false, message: 'Invalid image type' })
  }
  const ext = file.originalname.split('.').pop() || 'jpg'
  const key = `images/${randomUUID()}.${ext}`
  try {
    const url = await uploadToR2(key, file.buffer, file.mimetype)
    return res.json({ success: true, url })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Upload failed' })
  }
})

router.post('/audio', authMiddleware, upload.single('file'), async (req, res) => {
  if (!isR2Configured()) {
    return res.status(503).json({ success: false, message: 'Upload service not configured' })
  }
  const file = req.file
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file' })
  }
  if (!validateAudioType(file.mimetype)) {
    return res.status(400).json({ success: false, message: 'Invalid audio type' })
  }
  const ext = file.originalname.split('.').pop() || 'mp3'
  const key = `audio/${randomUUID()}.${ext}`
  try {
    const url = await uploadToR2(key, file.buffer, file.mimetype)
    return res.json({ success: true, url })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Upload failed' })
  }
})

export default router
