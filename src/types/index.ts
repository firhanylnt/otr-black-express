export type { UserRole, ContentType, ContentStatus, EventStatus } from '@prisma/client'

export interface JwtPayload {
  userId: number
  email: string
  role: string
}

export interface UserDto {
  id: number
  email: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  role: string
  status: 'active' | 'suspended'
  isAdmin: boolean
  isCreator: boolean
  isResident: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}


export interface ApiMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// UserDto from a record with snake_case or camelCase
export function toUserDto(u: {
  id: number
  email: string
  username: string
  displayName?: string | null
  display_name?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatar_url?: string | null
  role: string
  isSuspended?: boolean
  is_suspended?: boolean
  isVerified?: number
  is_verified?: number
  createdAt?: Date
  created_at?: Date
  updatedAt?: Date
  updated_at?: Date
}): UserDto {
  const suspended = Boolean(u.isSuspended ?? u.is_suspended ?? false)
  const role = String(u.role ?? '')
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName ?? u.display_name ?? null,
    bio: u.bio ?? null,
    avatarUrl: u.avatarUrl ?? u.avatar_url ?? null,
    role,
    status: suspended ? 'suspended' : 'active',
    isAdmin: role === 'admin',
    isCreator: role === 'guest_creator' || role === 'resident',
    isResident: role === 'resident',
    isVerified: Boolean(u.isVerified ?? u.is_verified ?? 0),
    createdAt: (u.createdAt ?? u.created_at) as Date,
    updatedAt: (u.updatedAt ?? u.updated_at) as Date,
  }
}
