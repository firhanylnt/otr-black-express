import { prisma } from '../lib/prisma.js'

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0m'
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}

export const historyService = {
  async logPlay(userId: number, songId: number, duration?: number, position?: number) {
    await prisma.$transaction([
      prisma.playHistory.create({
        data: {
          user: { connect: { id: userId } },
          content: { connect: { id: songId } },
          duration: duration ?? 0,
          position: position ?? 0,
        },
      }),
      prisma.content.update({
        where: { id: songId },
        data: { plays: { increment: 1 } },
      }),
    ])
  },

  async getMyHistory(userId: number, limit = 50, offset = 0) {
    const rows = await prisma.playHistory.findMany({
      where: { userId },
      include: {
        content: {
          select: { title: true, slug: true, coverUrl: true, audioUrl: true, duration: true },
        },
      },
      orderBy: { playedAt: 'desc' },
      take: limit,
      skip: offset,
    })
    return rows.map((h) => ({
      ...h,
      title: h.content.title,
      slug: h.content.slug,
      cover_url: h.content.coverUrl,
      audio_url: h.content.audioUrl,
      duration: h.content.duration,
    }))
  },

  async updateProgress(userId: number, songId: number, currentPosition: number, duration?: number, listenedDuration?: number, incrementPlay?: boolean) {
    const contentId = Number(songId)
    if (!Number.isFinite(contentId) || contentId < 1) return
    await prisma.playHistory.create({
      data: {
        user: { connect: { id: userId } },
        content: { connect: { id: contentId } },
        position: currentPosition,
        listenedDuration: listenedDuration ?? 0,
        duration: duration ?? 0,
      },
    })
    if (incrementPlay) {
      await prisma.content.update({
        where: { id: contentId },
        data: { plays: { increment: 1 } },
      })
    }
  },

  async syncHistory(userId: number, history: { songId: string; position: number; duration?: number; listenedDuration?: number }[]) {
    for (const h of history) {
      const contentId = Number(h.songId)
      if (!Number.isFinite(contentId) || contentId < 1) continue
      await prisma.playHistory.create({
        data: {
          user: { connect: { id: userId } },
          content: { connect: { id: contentId } },
          position: h.position ?? 0,
          duration: h.duration ?? 0,
          listenedDuration: h.listenedDuration ?? 0,
        },
      })
    }
  },

  async getAnalytics() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const [totalPlays, totalHistory, uniqueListeners, todayRows, weekRows, sumDuration, topSongs, topListeners] = await Promise.all([
      prisma.content.aggregate({ _sum: { plays: true } }).then((r) => r._sum.plays ?? 0),
      prisma.playHistory.count(),
      prisma.playHistory.groupBy({ by: ['userId'], _count: true }).then((rows) => rows.length),
      prisma.playHistory.count({ where: { playedAt: { gte: todayStart } } }),
      prisma.playHistory.groupBy({
        by: ['userId'],
        where: { playedAt: { gte: weekStart } },
        _count: { id: true },
      }).then((rows) => ({ plays: rows.reduce((s, r) => s + r._count.id, 0), listeners: rows.length })),
      prisma.playHistory.aggregate({ _sum: { duration: true } }).then((r) => r._sum.duration ?? 0),
      this.getTopSongs(10),
      this.getTopListeners(10),
    ])
    const totalDurationFormatted = formatDuration(sumDuration)
    return {
      overview: {
        totalPlays,
        uniqueListeners,
        totalHistory,
        totalDuration: sumDuration,
        totalDurationFormatted,
        uniqueSongsPlayed: await prisma.playHistory.groupBy({ by: ['contentId'], _count: true }).then((rows) => rows.length),
      },
      today: { plays: todayRows, activeListeners: 0 },
      thisWeek: weekRows,
      topSongs: topSongs.map((s) => ({
        songId: s.id,
        totalPlays: s.plays,
        uniqueListeners: 0,
        song: { id: s.id, title: s.title, coverUrl: s.coverUrl, creator: s.creator },
      })),
      topListeners,
      trends: [],
    }
  },

  async getTopSongs(limit = 10) {
    const rows = await prisma.content.findMany({
      where: { type: { in: ['track', 'album', 'mixtape'] } },
      orderBy: { plays: 'desc' },
      take: limit,
      include: { creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    })
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      plays: r.plays,
      coverUrl: r.coverUrl,
      creator: r.creator,
    }))
  },

  async getTopListeners(limit = 10) {
    const rows = await prisma.playHistory.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    })
    const userIds = rows.map((r) => r.userId)
    const users = userIds.length ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    }) : []
    const userMap = new Map(users.map((u) => [u.id, u]))
    return rows.map((r) => ({
      userId: r.userId,
      totalPlays: r._count.id,
      user: userMap.get(r.userId) ?? null,
    }))
  },

  async getDailyPlays(days = 30) {
    const start = new Date()
    start.setDate(start.getDate() - days)
    const rows = await prisma.$queryRaw<{ day: Date; plays: bigint }[]>`
      SELECT date(played_at) as day, COUNT(*)::bigint as plays
      FROM play_history
      WHERE played_at >= ${start}
      GROUP BY date(played_at)
      ORDER BY day
    `
    return rows.map((r) => ({ day: r.day, plays: Number(r.plays) }))
  },
}
