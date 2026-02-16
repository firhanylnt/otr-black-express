# Admin API – Coverage untuk otr-new-version-black/pages/admin

Backend ini menyediakan API untuk halaman admin (Nuxt). Ringkasan endpoint dan response yang dipakai admin.

## Dashboard (`/admin`)

| Kebutuhan frontend | Endpoint backend | Keterangan |
|-------------------|------------------|------------|
| `api.users.getStats()` | GET `/api/users/stats` | Response: `total`, `recentSignups` (atau `thisWeek`) |
| `api.creators.getAll()` | GET `/api/creators` | List guest_creator + resident |
| `api.residents.getAll()` | GET `/api/residents` | List resident only |
| `api.songs.getStats()` | GET `/api/songs/stats` | Response: `total`, `pending`, `totalPlays`, `totalSongs`, `pendingCount` |
| `api.events.getUpcoming()` | GET `/api/events/upcoming` | Event mendatang |
| `api.subscribers.getStats()` | GET `/api/subscribers/stats` | |
| `api.songs.getPending()` | GET `/api/songs/pending` | Konten pending review |
| `api.songs.approve(id)` | PATCH `/api/songs/:id/approve` | |
| `api.songs.reject(id, reason)` | PATCH `/api/songs/:id/reject` | Body: `{ reason }` |
| `api.history.getAdminAnalytics()` | GET `/api/history/admin/analytics` | Response: `overview`, `today`, `thisWeek`, `topSongs`, `topListeners` |

## Users (`/admin/users`)

| Kebutuhan frontend | Endpoint backend |
|-------------------|------------------|
| `api.users.getAll({ status, search, page, limit })` | GET `/api/users?status=&search=&page=&limit=` |
| `api.users.getStats()` | GET `/api/users/stats` |
| `api.users.updateStatus(id, 'suspended')` | PATCH `/api/users/:id/status` body `{ status: 'suspended' }` |
| `api.users.updateStatus(id, 'active')` | PATCH `/api/users/:id/status` body `{ status: 'active' }` |

User response menyertakan `status: 'active' | 'suspended'` (dari field `isSuspended` di DB).

## Creators (`/admin/creators`)

| Kebutuhan frontend | Endpoint backend |
|-------------------|------------------|
| `api.creators.getAll(params)` | GET `/api/creators` |
| `api.creators.getById(id)` | GET `/api/creators/:id` |
| `api.creators.updateStatus(id, 'suspended' \| 'active')` | Belum: saat ini backend hanya ubah role. Bisa pakai status user (isSuspended) nanti. |
| `api.creators.upgradeToResident(id)` | PATCH `/api/creators/:id/upgrade` |

## Residents (`/admin/residents`)

| Kebutuhan frontend | Endpoint backend |
|-------------------|------------------|
| `api.residents.getAll(params)` | GET `/api/residents` |
| `api.residents.add(creatorIds)` | POST `/api/residents` body `{ creatorIds: string[] }` |
| `api.residents.remove(id)` | DELETE `/api/residents/:id` |

## Songs (`/admin/songs`, create, pending)

| Kebutuhan frontend | Endpoint backend |
|-------------------|------------------|
| `api.songs.getAdmin({ status, genre, search, page, limit })` | GET `/api/songs/admin` |
| `api.songs.getPending()` | GET `/api/songs/pending` |
| `api.songs.getById(id)` | GET `/api/songs/:id` |
| `api.songs.create(data)` | POST `/api/songs` (multipart: cover, audio) |
| `api.songs.update(id, data)` | PATCH `/api/songs/:id` |
| `api.songs.approve(id)` | PATCH `/api/songs/:id/approve` |
| `api.songs.reject(id, reason)` | PATCH `/api/songs/:id/reject` |
| `api.songs.hide(id)` | PATCH `/api/songs/:id/hide` |
| `api.songs.publish(id)` | PATCH `/api/songs/:id/publish` |
| `api.songs.delete(id)` | DELETE `/api/songs/:id` |
| `api.genres.getAll()` | GET `/api/genres` |
| `api.moods.getAll()` | GET `/api/moods` |

## Events, Playlists, Program, Shop, Picks, Highlights, Settings, Subscribers, Admins

Semua modul ini punya endpoint yang selaras dengan `useApi()` di frontend (GET list, GET by id, POST create, PATCH update, DELETE). Lihat `src/routes/` untuk path lengkap.

## Analytics (`/admin/analytics`)

| Kebutuhan frontend | Endpoint backend |
|-------------------|------------------|
| `api.history.getAdminAnalytics()` | GET `/api/history/admin/analytics` |
| Response shape | `{ overview: { totalPlays, uniqueListeners, totalDurationFormatted }, today: { plays }, thisWeek, topSongs, topListeners }` |

## Perubahan yang baru ditambahkan (untuk cover admin)

1. **User**: Field `isSuspended` di schema; `getStats` mengembalikan `recentSignups` / `thisWeek`; `updateStatus` menerima `status: 'active' | 'suspended'`; list user filter `status=active|suspended`; response user ada `status`.
2. **Songs getStats**: Menambah `totalPlays`, `totalSongs`, `pendingCount` agar dashboard admin bisa menampilkan angka yang benar.
3. **History getAnalytics**: Response diubah ke bentuk `overview`, `today`, `thisWeek`, `topSongs`, `topListeners` agar halaman analytics admin bisa pakai langsung.

Setelah perubahan schema (User.isSuspended), jalankan:

```bash
npx prisma db push
# atau
npx prisma migrate dev --name add_user_is_suspended
```
