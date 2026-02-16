# Kebutuhan CRUD API – `otr-new-version-black/pages/admin/*`

Dokumen ini memetakan **setiap halaman admin** ke kebutuhan CRUD/API dan status backend. Prefix API: `/api` (atau sesuai `config.apiPrefix`).

---

## 1. Dashboard – `pages/admin/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| Stats users | GET | `/users/stats` | - | ✅ |
| List creators | GET | `/creators` | `limit=100` | ✅ |
| List residents | GET | `/residents` | `limit=100` | ✅ |
| Stats songs | GET | `/songs/stats` | - | ✅ |
| Event mendatang | GET | `/events/upcoming` | - | ✅ |
| Stats subscribers | GET | `/subscribers/stats` | - | ✅ |
| Pending songs | GET | `/songs/pending` | - | ✅ |
| Approve song | PATCH | `/songs/:id/approve` | - | ✅ |
| Reject song | PATCH | `/songs/:id/reject` | `{ reason }` | ✅ |
| Analytics | GET | `/history/admin/analytics` | - | ✅ |

---

## 2. Users – `pages/admin/users/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/users` | `status, search, page, limit` | ✅ |
| Stats | GET | `/users/stats` | - | ✅ |
| Update status (suspend) | PATCH | `/users/:id/status` | `{ status: 'suspended' }` | ✅ |
| Update status (activate) | PATCH | `/users/:id/status` | `{ status: 'active' }` | ✅ |

---

## 3. Creators – `pages/admin/creators/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/creators` | `status, search, page, limit` | ✅ |
| Get by id | GET | `/creators/:id` | - | ✅ |
| Update status (suspend) | PATCH | `/creators/:id/status` | `{ status: 'suspended' }` | ✅ |
| Update status (active) | PATCH | `/creators/:id/status` | `{ status: 'active' }` | ✅ |
| Upgrade to resident | PATCH | `/creators/:id/upgrade` | - | ✅ |

---

## 4. Residents – `pages/admin/residents/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/residents` | `status, search, page, limit` | ✅ |
| List creators (untuk pilih) | GET | `/creators` | `limit=100` | ✅ |
| Tambah residents | POST | `/residents` | `{ creatorIds: string[] }` | ✅ |
| Hapus resident | DELETE | `/residents/:id` | - | ✅ |

---

## 5. Admins – `pages/admin/admins/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/users` | `role=admin`, `limit=100` | ✅ |
| Create | POST | `/auth/register` | `{ ..., role: 'admin' }` | ✅ (perlu dukungan role di register) |
| Update | PATCH | `/users/:id` | body profile | ✅ |
| Update status (inactive) | PATCH | `/users/:id/status` | `{ status: 'inactive' }` | ✅ (inactive = suspended) |
| Update status (active) | PATCH | `/users/:id/status` | `{ status: 'active' }` | ✅ |

---

## 6. Songs – `pages/admin/songs/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List (admin) | GET | `/songs/admin` | `status, genre, search, page, limit` | ✅ |
| List pending | GET | `/songs/pending` | - | ✅ |
| Get by id | GET | `/songs/:id` | - | ✅ |
| Update | PATCH | `/songs/:id` | body + optional multipart (cover, audio) | ✅ |
| Hide | PATCH | `/songs/:id/hide` | - | ✅ |
| Publish | PATCH | `/songs/:id/publish` | - | ✅ |
| Delete | DELETE | `/songs/:id` | - | ✅ |
| Approve | PATCH | `/songs/:id/approve` | - | ✅ |
| Reject | PATCH | `/songs/:id/reject` | `{ reason }` | ✅ |
| List genres | GET | `/genres` | - | ✅ |
| List moods | GET | `/moods` | - | ✅ |
| Upload image (cover edit) | POST | `/upload/image` | multipart `file` | ✅ |

---

## 7. Songs Create – `pages/admin/songs/create.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List genres | GET | `/genres` | - | ✅ |
| List moods | GET | `/moods` | - | ✅ |
| Upload image (cover) | POST | `/upload/image` | multipart `file` | ✅ |
| Upload audio | POST | `/upload/audio` | multipart `file` | ✅ |
| Create song | POST | `/songs` | body + multipart `cover`, `audio` | ✅ |

---

## 8. Playlists – `pages/admin/playlists/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/playlists` | `limit=100` | ✅ |
| Get by id | GET | `/playlists/:id` | - | ✅ |
| Create | POST | `/playlists` | body + optional `cover` file | ✅ |
| Update | PATCH | `/playlists/:id` | body + optional `cover` file | ✅ |
| Delete | DELETE | `/playlists/:id` | - | ✅ |

---

## 9. Events – `pages/admin/events/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/events` | `status, search, page, limit` | ✅ |
| Delete | DELETE | `/events/:id` | - | ✅ |

---

## 10. Events Create – `pages/admin/events/create.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| Create event | POST | `/events` | body + multipart `cover`, `banner` | ✅ (frontend saat ini masih simulate; perlu wire ke API) |
| Update event | PATCH | `/events/:id` | body + optional files | ✅ |

---

## 11. Program – `pages/admin/program/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/program` | `includeInactive=true` | ✅ |
| Get by id | GET | `/program/:id` | - | ✅ |
| Create | POST | `/program` | body + optional `image` file | ✅ |
| Update | PATCH | `/program/:id` | body + optional `image` file | ✅ |
| Delete | DELETE | `/program/:id` | - | ✅ |
| Get episodes | GET | `/program/:id/episodes` | - | ✅ |
| Create episode | POST | `/program/:id/episodes` | body + optional `audio` file | ✅ |
| Create bulk episodes | POST | `/program/:id/episodes/bulk` | body array | ✅ |
| Update episode | PATCH | `/program/episodes/:episodeId` | body + optional `audio` file | ✅ |
| Delete episode | DELETE | `/program/episodes/:episodeId` | - | ✅ |
| Upload image (thumbnail episode) | POST | `/upload/image` | multipart `file` | ✅ |

Catatan: Frontend mengirim `thumbnailUrl` di update episode; backend bisa simpan di field yang ada atau tambah field `thumbnailUrl` di ProgramEpisode bila perlu.

---

## 12. Shop (Products) – `pages/admin/shop/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/products` | `includeInactive=true` | ✅ |
| Get by id | GET | `/products/:id` | - | ✅ |
| Create | POST | `/products` | body + optional `image` file | ✅ |
| Update | PATCH | `/products/:id` | body + optional `image` file | ✅ |
| Delete | DELETE | `/products/:id` | - | ✅ |

---

## 13. Picks – `pages/admin/picks/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/picks` | `limit=100` | ✅ |
| Get by id | GET | `/picks/:id` | - | ✅ |
| Update | PATCH | `/picks/:id` | `{ curatorNote?, sortOrder?, isActive? }` | ✅ |
| Remove | DELETE | `/picks/:id` | - | ✅ |

---

## 14. Picks Upload – `pages/admin/picks/upload.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List songs | GET | `/songs` | `limit=100` | ✅ |
| List playlists (opsional) | GET | `/playlists` | `limit=100` | ✅ |
| Add pick | POST | `/picks` | `{ contentType, contentId, curatorNote? }` | ✅ |

---

## 15. Highlights – `pages/admin/highlights/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/highlights` | - | ✅ |
| Get by id | GET | `/highlights/:id` | - | ✅ |
| Create | POST | `/highlights` | body + optional `image`, `customImage` files | ✅ |
| Update | PATCH | `/highlights/:id` | body + optional files | ✅ |
| Toggle | PATCH | `/highlights/:id/toggle` | - | ✅ |
| Delete | DELETE | `/highlights/:id` | - | ✅ |
| Upload image | POST | `/upload/image` | multipart `file` | ✅ |

---

## 16. Master Data (Genres & Moods) – `pages/admin/master-data/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List genres | GET | `/genres` | `includeInactive=true` | ✅ |
| Create genre | POST | `/genres` | body | ✅ |
| Update genre | PATCH | `/genres/:id` | body | ✅ |
| Toggle genre | PATCH | `/genres/:id/toggle` | - | ✅ |
| Delete genre | DELETE | `/genres/:id` | - | ✅ |
| List moods | GET | `/moods` | `includeInactive=true` | ✅ |
| Create mood | POST | `/moods` | body | ✅ |
| Update mood | PATCH | `/moods/:id` | body | ✅ |
| Toggle mood | PATCH | `/moods/:id/toggle` | - | ✅ |
| Delete mood | DELETE | `/moods/:id` | - | ✅ |

---

## 17. About – `pages/admin/about/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| Get settings by group | GET | `/settings/about` | - | ✅ |
| Update settings | POST | `/settings` | array `[{ key, value }, ...]` | ✅ |

---

## 18. Settings – `pages/admin/settings/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| Get all settings | GET | `/settings` | - | ✅ |
| Update (general) | POST | `/settings` | array `[{ key, value }, ...]` | ✅ |
| Update (stream) | POST | `/settings` | array | ✅ |
| Update (other groups) | POST | `/settings` | array | ✅ |

---

## 19. Subscribers – `pages/admin/subscribers/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| List | GET | `/subscribers` | `status, search, page, limit` | ✅ |
| Stats | GET | `/subscribers/stats` | - | ✅ |
| Subscribe (manual) | POST | `/subscribers/subscribe` | `{ email, name?, source? }` | ✅ |
| Unsubscribe | POST | `/subscribers/unsubscribe` | `{ email }` | ✅ |
| Delete | DELETE | `/subscribers/:id` | - | ✅ |

---

## 20. Analytics – `pages/admin/analytics/index.vue`

| Aksi | Method | Path | Query/Body | Backend |
|------|--------|------|------------|--------|
| Admin analytics | GET | `/history/admin/analytics` | - | ✅ |
| List songs (fallback) | GET | `/songs` | `limit=100` | ✅ |
| Song stats | GET | `/songs/stats` | - | ✅ |

---

## Ringkasan

- Semua endpoint yang dipakai oleh `pages/admin/*` **sudah ada** di backend (routes + controllers).
- **Auth**: Login/register di `/auth`; admin-only route pakai `adminOnly` middleware.
- **Query params**: `getAll` di frontend mengirim `page`, `limit`, `status`, `search`, dll. sesuai tabel di atas; backend sudah mendukung.
- **Status user/admin**: Backend menerima `status: 'active' | 'suspended' | 'inactive'` (inactive = suspended).
- **File upload**: Create/update content (songs, events, playlists, program, products, highlights) bisa kirim file via multipart; lihat `docs/UPLOAD.md`.

Satu hal yang perlu di frontend: **events/create.vue** saat ini hanya simulasi submit; perlu memanggil `api.events.create()` / `api.events.update()` dengan payload + FormData (cover, banner) sesuai API di atas.
