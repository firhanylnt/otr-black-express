import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { authController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post(
  '/login',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errs = validationResult(req)
    if (!errs.isEmpty()) return res.status(400).json({ success: false, message: errs.array()[0]?.msg })
    return authController.login(req, res)
  }
)

router.post(
  '/register',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('username').trim().isLength({ min: 2, max: 50 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errs = validationResult(req)
    if (!errs.isEmpty()) return res.status(400).json({ success: false, message: errs.array()[0]?.msg })
    return authController.register(req, res)
  }
)

router.get('/profile', authMiddleware, (req, res) => authController.profile(req, res))
router.get('/check', authMiddleware, (req, res) => authController.check(req, res))

export default router
