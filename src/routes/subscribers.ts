import { Router, type Request } from 'express'
import { body, validationResult } from 'express-validator'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { subscriberController } from '../controllers/subscriber.controller.js'

const router = Router()

router.post('/subscribe', body('email').isEmail().normalizeEmail(), async (req: Request, res) => {
  const errs = validationResult(req)
  if (!errs.isEmpty()) return res.status(400).json({ success: false, message: errs.array()[0]?.msg })
  return subscriberController.subscribe(req, res)
})
router.post('/unsubscribe', body('email').isEmail().normalizeEmail(), async (req: Request, res) => {
  const errs = validationResult(req)
  if (!errs.isEmpty()) return res.status(400).json({ success: false, message: errs.array()[0]?.msg })
  return subscriberController.unsubscribe(req, res)
})
router.get('/', authMiddleware, adminOnly, (req, res) => subscriberController.list(req, res))
router.get('/stats', authMiddleware, adminOnly, (req, res) => subscriberController.getStats(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => subscriberController.delete(req, res))

export default router
