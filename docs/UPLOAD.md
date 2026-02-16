# Upload file ke Cloudflare R2

Thumbnail, cover, banner, audio, dan image di API berupa **file** yang di-upload ke R2; backend menyimpan **URL** hasil upload ke database.

## 1. Endpoint upload standalone (sudah ada)

| Method | Path | Field | Jenis | Keterangan |
|--------|------|--------|--------|------------|
| POST | `/api/upload/image` | `file` | image (jpeg, png, gif, webp) | Upload image → return `{ url }` |
| POST | `/api/upload/audio` | `file` | audio: WAV, AAC, MP3, WMA, FLAC, PCM, MP4/M4A, OGG | Upload audio → return `{ url }` |

Client bisa: (1) upload file ke sini dulu, dapat URL, lalu kirim URL di body create/update, **atau** (2) kirim file langsung di payload create/update (multipart) — backend yang upload ke R2.

## 2. Endpoint create/update yang menerima file (payload = multipart)

Dari codebase (routes + controllers + services + Prisma schema):

| Modul | Endpoint | Field file (multipart) | Disimpan sebagai |
|-------|----------|------------------------|------------------|
| **Songs** | POST `/api/songs` | `cover`, `audio` | coverUrl, audioUrl |
| **Songs** | PATCH `/api/songs/:id` | `cover`, `audio` (opsional) | coverUrl, audioUrl |
| **Albums** | POST `/api/albums` | `cover` | coverUrl |
| **Albums** | PATCH `/api/albums/:id` | `cover` (opsional) | coverUrl |
| **Playlists** | POST `/api/playlists` | `cover` | coverUrl |
| **Playlists** | PATCH `/api/playlists/:id` | `cover` (opsional) | coverUrl |
| **Events** | POST `/api/events` | `cover`, `banner` | coverUrl, bannerUrl |
| **Events** | PATCH `/api/events/:id` | `cover`, `banner` (opsional) | coverUrl, bannerUrl |
| **Program** | POST `/api/program` | `image` | imageUrl |
| **Program** | PATCH `/api/program/:id` | `image` (opsional) | imageUrl |
| **Program episodes** | POST `/api/program/:id/episodes` | `audio` | audioUrl |
| **Program episodes** | PATCH `/api/program/episodes/:id` | `audio` (opsional) | audioUrl |
| **Products** | POST `/api/products` | `image` | imageUrl |
| **Products** | PATCH `/api/products/:id` | `image` (opsional) | imageUrl |
| **Highlights** | POST `/api/highlights` | `image`, `customImage` | image, customImage |
| **Highlights** | PATCH `/api/highlights/:id` | `image`, `customImage` (opsional) | image, customImage |

User avatar: jika nanti ada endpoint PATCH profile dengan avatar, field file = `avatar` → avatarUrl.

## 3. Alur

- Request **multipart/form-data**: field teks (title, description, dll.) + field file (cover, audio, dll.).
- Jika field file ada: validasi tipe (image/audio), upload ke R2, dapat URL, set ke body (coverUrl, audioUrl, dll.) lalu panggil service seperti biasa.
- Jika field file tidak ada: pakai field URL dari body (coverUrl, audioUrl) bila ada (backward compatible dengan client yang upload dulu ke `/upload/image` lalu kirim URL).
