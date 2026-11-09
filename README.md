# SDIT Al-Ikhlas Serpong

Aplikasi website sekolah dengan Next.js App Router, TypeScript, PostgreSQL, Prisma, Auth.js, dan Tailwind CSS. Konten resmi sekolah tidak ditebak: profil, kontak, foto, berita, dan periode PPDB berasal dari database dan perlu dilengkapi administrator.

## Kebutuhan

- Node.js 20.9 atau lebih baru (disarankan Node.js LTS).
- pnpm 10 atau lebih baru.
- PostgreSQL 14 atau lebih baru.
- Akun Cloudinary untuk unggahan gambar CMS.

## Menjalankan lokal

```bash
pnpm install
cp .env.example .env
```

Atur `DATABASE_URL`, `AUTH_SECRET` (hasilkan dengan `openssl rand -base64 32`), `NEXTAUTH_URL`, `APP_URL`, dan kredensial Cloudinary di `.env`. Buat database PostgreSQL kosong, lalu jalankan:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Seed selalu membuat role dan profil sekolah kosong. Seed hanya membuat akun `SUPER_ADMIN` bila `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` diisi eksplisit; gunakan kata sandi unik minimal 12 karakter, kemudian kosongkan variabel bootstrap itu. Tidak ada akun atau data siswa demo bawaan.

Website tersedia di `http://localhost:3000`, login admin di `/admin/login`. Dashboard mengelola profil sekolah, administrator, berita/kategori, pengumuman, galeri, prestasi, guru, agenda, dan PPDB. Cloudinary hanya digunakan untuk gambar website; dokumen PPDB disimpan privat di `PRIVATE_UPLOAD_DIR` dan tidak dapat diakses sebagai URL publik.

## Migrasi dan operasi

- `pnpm db:dev` — membuat/menerapkan migrasi saat pengembangan lokal.
- `pnpm db:migrate` — menerapkan migrasi yang sudah dikomit (deployment).
- `pnpm db:seed` — bootstrap role dan profil sekolah; akun admin hanya bila env bootstrap diatur.
- `pnpm build && pnpm start` — build dan server production.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` — pemeriksaan sebelum rilis.

File konfigurasi VPS tersedia di `ops/`. Panduan deployment, backup, pemulihan, administrasi, dan endpoint API ada di `docs/`.

## Konten dan privasi

- Jangan mengisi identitas sekolah, kontak, prestasi, foto, atau cerita resmi tanpa data dari sekolah.
- Hak akses dicek di server. Dokumen hanya bisa diunduh oleh `SUPER_ADMIN` atau `ADMIN_PPDB`; setiap unduhan dicatat.
- Cek status PPDB memerlukan nomor pendaftaran dan kode akses acak yang ditampilkan satu kali setelah pendaftaran. Simpan keduanya.
- Batas unggah aplikasi maksimal 5 MB per file (dapat diturunkan lewat `MAX_UPLOAD_SIZE_MB`); Nginx membatasi ukuran total request.
- Rate limit autentikasi dan endpoint PPDB disimpan di PostgreSQL agar berlaku lintas worker PM2.

## Struktur inti

- `src/app/(public)` — website publik dan PPDB.
- `src/app/admin` — login, dashboard, berita, serta operasional PPDB.
- `src/app/api` — route handlers dengan autentikasi, otorisasi, validasi Zod, dan audit.
- `src/lib` — Prisma, autentikasi, authorization, validasi, dan penyimpanan privat.
- `prisma/schema.prisma` dan `prisma/migrations` — model serta migrasi PostgreSQL.
- `prisma/seed.ts` — bootstrap aman untuk role/profil sekolah.
