import { prisma } from '../lib/prisma.js'

function toProgramDto(p: { id: number; title: string; slug: string; description: string | null; imageUrl: string | null; isActive: number; sortOrder: number; createdAt: Date; updatedAt: Date }) {
  return { id: p.id, title: p.title, slug: p.slug, description: p.description, imageUrl: p.imageUrl, isActive: Boolean(p.isActive), sortOrder: p.sortOrder, createdAt: p.createdAt, updatedAt: p.updatedAt }
}

function toEpisodeDto(e: { id: number; programId: number; title: string; slug: string; description: string | null; audioUrl: string | null; duration: number | null; publishedAt: string | null; sortOrder: number; createdAt: Date }) {
  return { id: e.id, programId: e.programId, title: e.title, slug: e.slug, description: e.description, audioUrl: e.audioUrl, duration: e.duration, publishedAt: e.publishedAt, sortOrder: e.sortOrder, createdAt: e.createdAt }
}

export const programService = {
  async list(includeInactive = false) {
    const rows = await prisma.program.findMany({
      where: includeInactive ? undefined : { isActive: 1 },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    })
    return rows.map(toProgramDto)
  },

  async getSchedule() {
    const [schedule, programs] = await Promise.all([
      prisma.programSchedule.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }),
      prisma.program.findMany({ where: { isActive: 1 } }),
    ])
    return { schedule, programs: programs.map(toProgramDto) }
  },

  async getBySlug(slug: string) {
    const p = await prisma.program.findUnique({ where: { slug } })
    return p ? toProgramDto(p) : null
  },

  async getById(id: number) {
    const p = await prisma.program.findUnique({ where: { id } })
    return p ? toProgramDto(p) : null
  },

  async getEpisodes(programId: number) {
    const rows = await prisma.programEpisode.findMany({
      where: { programId },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    })
    return rows.map(toEpisodeDto)
  },

  async create(data: { title: string; slug?: string; description?: string | null; imageUrl?: string | null; isActive?: boolean; sortOrder?: number }) {
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const p = await prisma.program.create({
      data: { title: data.title, slug, description: data.description ?? null, imageUrl: data.imageUrl ?? null, isActive: data.isActive !== false ? 1 : 0, sortOrder: data.sortOrder ?? 0 },
    })
    return toProgramDto(p)
  },

  async update(id: number, data: Partial<{ title: string; description: string; imageUrl: string; isActive: boolean; sortOrder: number }>) {
    const p = await prisma.program.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive ? 1 : 0 }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })
    return toProgramDto(p)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.program.deleteMany({ where: { id } })
    return result.count > 0
  },

  async createEpisode(programId: number, data: { title: string; slug?: string; description?: string | null; audioUrl?: string | null; duration?: number | null; publishedAt?: string | null; sortOrder?: number }) {
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const e = await prisma.programEpisode.create({
      data: { programId, title: data.title, slug, description: data.description ?? null, audioUrl: data.audioUrl ?? null, duration: data.duration ?? null, publishedAt: data.publishedAt ?? null, sortOrder: data.sortOrder ?? 0 },
    })
    return toEpisodeDto(e)
  },

  async createEpisodesBulk(programId: number, episodes: { title: string; slug?: string; description?: string | null; audioUrl?: string | null; duration?: number | null; publishedAt?: string | null; sortOrder?: number }[]) {
    await prisma.$transaction(
      episodes.map((ep) => {
        const slug = ep.slug || ep.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return prisma.programEpisode.create({
          data: { programId, title: ep.title, slug, description: ep.description ?? null, audioUrl: ep.audioUrl ?? null, duration: ep.duration ?? null, publishedAt: ep.publishedAt ?? null, sortOrder: ep.sortOrder ?? 0 },
        })
      })
    )
    return this.getEpisodes(programId)
  },

  async getEpisodeById(episodeId: number) {
    const e = await prisma.programEpisode.findUnique({ where: { id: episodeId } })
    return e ? toEpisodeDto(e) : null
  },

  async updateEpisode(episodeId: number, data: Partial<{ title: string; slug: string; description: string; audioUrl: string; duration: number; publishedAt: string; sortOrder: number }>) {
    const e = await prisma.programEpisode.update({
      where: { id: episodeId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })
    return toEpisodeDto(e)
  },

  async deleteEpisode(episodeId: number): Promise<boolean> {
    const result = await prisma.programEpisode.deleteMany({ where: { id: episodeId } })
    return result.count > 0
  },
}
