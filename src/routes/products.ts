import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { productImageUpload } from '../middleware/upload.js'
import { productController } from '../controllers/product.controller.js'

const router = Router()

router.get('/', (req, res) => productController.list(req, res))
router.get('/:id', (req, res) => productController.getById(req, res))
router.post('/', authMiddleware, adminOnly, productImageUpload, (req, res) => productController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, productImageUpload, (req, res) => productController.update(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => productController.delete(req, res))

export default router
