import { prisma } from '../lib/prisma.js'

export const settingsService = {
  async getAll() {
    const rows = await prisma.setting.findMany({ select: { key: true, value: true } })
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  },

  async getByGroup(group: string) {
    const rows = await prisma.setting.findMany({
      where: { key: { startsWith: `${group}.` } },
      select: { key: true, value: true },
    })
    return Object.fromEntries(rows.map((r) => [r.key.replace(`${group}.`, ''), r.value]))
  },

  async upsertMany(items: { key: string; value: string }[]) {
    for (const { key, value } of items) {
      if (key) {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      }
    }
  },
}
