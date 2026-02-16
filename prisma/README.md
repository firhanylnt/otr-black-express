# Prisma & Database

## Setup (Supabase / PostgreSQL)

1. **Env**: Pastikan `.env` berisi `DATABASE_URL` (connection string Supabase/PostgreSQL).

2. **Generate client** (setiap kali schema berubah):
   ```bash
   npx prisma generate
   ```

3. **Migration pertama** (membuat tabel di database):
   ```bash
   npx prisma migrate dev --name init
   ```
   Ini akan membuat folder `prisma/migrations` dan menjalankan SQL ke database.

4. **Seed** (data awal opsional):
   ```bash
   npm run db:seed
   ```
   Menambah admin (admin@otr.local / admin123), genre, mood, dan settings dasar.

## Perintah

- `npm run db:migrate:dev` — buat migration baru (dev) dan apply
- `npm run db:migrate` — apply migration (production/deploy)
- `npm run db:seed` — jalankan seed
- `npm run db:studio` — buka Prisma Studio (GUI database)

## Arsitektur

- **Schema**: `prisma/schema.prisma` (model & enum).
- **Migration**: `prisma/migrations/` (SQL per perubahan).
- **Seed**: `prisma/seed.ts` (data awal).
- **Client**: `src/lib/prisma.ts` (singleton PrismaClient).

Logic dan transaksi database ada di **services**; **controllers** memanggil service dan mengatur HTTP; **routes** hanya validasi + controller.
