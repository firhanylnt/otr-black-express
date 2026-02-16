# OTR Black Backend

Backend API untuk project **otr-new-version-black** (Nuxt). Dibangun dengan Express.js, PostgreSQL (Prisma), Cloudflare R2 untuk semua upload file, siap deploy ke Vercel.

## Fitur

- **Auth**: Register, Login, JWT, profile, check
- **Songs/Content**: CRUD, approve/reject, publish, stats, my-songs
- **Albums & Playlists**: CRUD (content type album/playlist)
- **Events**: CRUD, upcoming, past
- **Genres & Moods**: CRUD, toggle active
- **Users, Creators, Residents**: Admin list, status, upgrade
- **Subscribers**: Subscribe/unsubscribe, list, stats
- **Products**: CRUD
- **Program**: CRUD, schedule, episodes (bulk)
- **Picks & Highlights**: CRUD, toggle
- **Settings**: Get all, by group, update (key-value)
- **Upload file**: Semua file (gambar, audio) diarahkan ke **Cloudflare R2** — endpoint standalone + multipart di create/update content
- **History**: Log play, my history, update, sync, admin analytics

## Security

- Helmet, CORS, rate limit (API + auth)
- JWT untuk route yang dilindungi
- Admin-only untuk route sensitif
- Validasi input (express-validator) pada auth/register

---

## Setup

```bash
cp .env.example .env
# Edit .env: DATABASE_URL (wajib), JWT_SECRET (wajib), R2_* jika pakai upload
npm install
npx prisma generate
npm run build
npm start
```

Default: `http://localhost:3005`, prefix API: `/api` (contoh: `POST /api/auth/login`).

---

## Migration (Database)

Database memakai **PostgreSQL** (Supabase atau host lain). Schema dikelola dengan Prisma.

### Pertama kali / development

1. Set `DATABASE_URL` di `.env` (connection string PostgreSQL).
2. Buat tabel dan apply migration:
   ```bash
   npx prisma migrate dev --name init
   ```
   Ini membuat folder `prisma/migrations` dan menjalankan SQL ke database.

   **Alternatif** (tanpa riwayat migration, sync schema langsung):
   ```bash
   npx prisma db push
   ```

### Production / deploy

```bash
npx prisma migrate deploy
```

Script di `package.json`:

- `npm run db:migrate:dev` — buat migration baru + apply (dev)
- `npm run db:migrate` — apply migration yang ada (production)

---

## Seeder (Data awal)

Setelah migration, jalankan seed untuk data awal (admin, genre, mood, settings):

```bash
npm run db:seed
```

Seed akan:

- Membuat user admin: `admin@otr.local` / `admin123` (ganti di production)
- Mengisi tabel genre & mood
- Mengisi settings dasar

File seed: `prisma/seed.ts`. Konfigurasi Prisma: `"prisma": { "seed": "tsx prisma/seed.ts" }` di `package.json`.

Perintah lain:

- `npm run db:studio` — buka Prisma Studio (GUI database)

---

## Upload file → Cloudflare R2

Semua kebutuhan upload file (gambar, audio) diarahkan ke **Cloudflare R2**. Tidak ada penyimpanan file di disk server.

### Konfigurasi

Set di `.env`:

| Variable | Keterangan |
|----------|------------|
| R2_ACCOUNT_ID | Cloudflare account ID |
| R2_ACCESS_KEY_ID | R2 API token access key |
| R2_SECRET_ACCESS_KEY | R2 API token secret |
| R2_BUCKET_NAME | Nama bucket |
| R2_PUBLIC_URL | URL publik bucket (untuk URL file yang disimpan) |

Jika R2 tidak dikonfigurasi, endpoint upload mengembalikan 503.

### Cara upload

1. **Standalone** (upload dulu, dapat URL, lalu kirim URL di body create/update):
   - `POST /api/upload/image` — field `file` (image)
   - `POST /api/upload/audio` — field `file` (audio)

2. **Multipart di create/update** — kirim file langsung bersama form:
   - Songs: `cover`, `audio` → POST/PATCH `/api/songs`
   - Albums / Playlists: `cover` → POST/PATCH `/api/albums`, `/api/playlists`
   - Events: `cover`, `banner` → POST/PATCH `/api/events`
   - Program: `image` → POST/PATCH `/api/program`; episode: `audio` → POST/PATCH episode
   - Products: `image` → POST/PATCH `/api/products`
   - Highlights: `image`, `customImage` → POST/PATCH `/api/highlights`

Detail field dan response: lihat `docs/UPLOAD.md`.

---

## Env

| Variable | Wajib | Keterangan |
|----------|--------|------------|
| DATABASE_URL | Ya | Connection string PostgreSQL (Supabase, dll.) |
| JWT_SECRET | Ya | Minimal 32 karakter |
| PORT | Tidak | Default 3005 |
| API_PREFIX | Tidak | Default /api |
| CORS_ORIGIN | Tidak | Asal frontend (comma-separated) |
| FRONTEND_URL | Tidak | Untuk redirect, dll. |
| R2_ACCOUNT_ID | Untuk upload | Cloudflare R2 |
| R2_ACCESS_KEY_ID | Untuk upload | R2 API token |
| R2_SECRET_ACCESS_KEY | Untuk upload | R2 API token |
| R2_BUCKET_NAME | Untuk upload | Nama bucket |
| R2_PUBLIC_URL | Untuk upload | URL publik bucket |

---

## Deploy Vercel

1. Push repo ke Git, import project di Vercel.
2. Set env vars di Vercel: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `R2_*` jika pakai upload.
3. Build command: `npm run build`. Output: `dist/`.
4. Serverless entry: sesuaikan ke `dist/index.js` atau konfigurasi Vercel Anda.

Gunakan **PostgreSQL eksternal** (Supabase, Neon, dll.) untuk production; jangan pakai SQLite di serverless.

---

## Integrasi Frontend

Di project **otr-new-version-black**, set di `.env`:

- Development: `NUXT_PUBLIC_API_BASE=http://localhost:3005/api`
- Production: `NUXT_PUBLIC_API_BASE=https://<your-backend>/api`

---

## Docs

- `docs/UPLOAD.md` — daftar endpoint upload & field multipart
- `docs/ADMIN-CRUD-API.md` — kebutuhan CRUD API untuk halaman admin
- `prisma/README.md` — ringkasan Prisma, migration, seed
