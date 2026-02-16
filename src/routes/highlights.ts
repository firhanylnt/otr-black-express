import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { highlightUpload } from '../middleware/upload.js'
import { highlightController } from '../controllers/highlight.controller.js'

const router = Router()

router.get('/', (req, res) => highlightController.list(req, res))
router.get('/active', (req, res) => highlightController.listActive(req, res))
router.get('/:id', (req, res) => highlightController.getById(req, res))
router.post('/', authMiddleware, adminOnly, highlightUpload, (req, res) => highlightController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, highlightUpload, (req, res) => highlightController.update(req, res))
router.patch('/:id/toggle', authMiddleware, adminOnly, (req, res) => highlightController.toggle(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => highlightController.delete(req, res))

export default router
