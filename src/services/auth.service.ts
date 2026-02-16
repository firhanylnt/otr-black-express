import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { config } from '../config.js'
import { toUserDto } from '../types/index.js'
import type { JwtPayload } from '../types/index.js'

const jwtSecret = config.jwt.secret
const jwtExpiresIn = config.jwt.expiresIn

export const authService = {
  async login(email: string, password: string): Promise<{ user: ReturnType<typeof toUserDto>; token: string } | null> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !bcrypt.compareSync(password, user.password)) return null
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions)
    return { user: toUserDto(user), token }
  },

  async register(data: { email: string; username: string; password: string; role?: string }): Promise<{ user: ReturnType<typeof toUserDto>; token: string }> {
    const hash = await bcrypt.hash(data.password, 10)
    const role = (data.role as 'user' | 'admin' | 'guest_creator' | 'resident') ?? 'user'
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hash,
        role,
      },
    })
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions)
    return { user: toUserDto(user), token }
  },

  async getProfile(userId: number): Promise<ReturnType<typeof toUserDto> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true, role: true, isSuspended: true, isVerified: true, createdAt: true, updatedAt: true },
    })
    return user ? toUserDto(user) : null
  },
}
