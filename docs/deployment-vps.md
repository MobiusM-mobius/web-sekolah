# Deployment VPS (Ubuntu 24.04)

## 1. Prasyarat server

Pasang Node.js LTS (minimal 20.9), pnpm, PostgreSQL, Nginx, PM2, dan Certbot dari repository resmi masing-masing. Buat database dan role PostgreSQL dengan hak minimum pada database aplikasi; jangan gunakan superuser PostgreSQL untuk aplikasi.

## 2. Konfigurasi aplikasi

Checkout repository ke `/var/www/sdit-alikhlas`, kemudian:

```bash
cd /var/www/sdit-alikhlas
pnpm install --frozen-lockfile
cp .env.example .env
chmod 600 .env
```

Isi `.env` dengan secret acak (`openssl rand -base64 32`), `DATABASE_URL` TLS/loopback sesuai topologi, `AUTH_SECRET`, `NEXTAUTH_URL`, `APP_URL`, `PRIVATE_UPLOAD_DIR` pada disk privat (contoh `/var/lib/sdit-alikhlas/ppdb-documents`), dan kredensial Cloudinary. Jangan menyimpan dokumen PPDB di `public/` atau folder yang dilayani Nginx. Buat folder privat hanya untuk user aplikasi dengan mode `0700`.

Buat akun bootstrap dengan env sementara `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` yang kuat, lalu jalankan migrasi dan seed:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Hapus kedua nilai `SEED_ADMIN_*` setelah bootstrap. Verifikasi akun dapat login sebelum membuka akses publik.

## 3. Build dan PM2

```bash
pnpm build
pm2 start ops/ecosystem.config.cjs --env production --update-env
pm2 save
pm2 startup
```

PM2 menjalankan dua worker; rate limit disimpan di PostgreSQL, bukan memori proses. Pastikan koneksi pool database cukup untuk jumlah worker. Untuk deploy selanjutnya: backup database, `git pull`, `pnpm install --frozen-lockfile`, `pnpm db:migrate`, `pnpm build`, lalu `pm2 reload sdit-al-ikhlas --update-env`.

## 4. Nginx dan HTTPS

Salin `ops/nginx.conf` ke `sites-available`, ganti `example.invalid` dengan domain resmi, aktifkan symlink, cek `nginx -t`, lalu reload Nginx. Konfigurasi contoh mengarahkan HTTP ke aplikasi lokal `127.0.0.1:3000` dan membatasi body request menjadi 25 MB. Terbitkan sertifikat setelah DNS mengarah ke server:

```bash
sudo certbot --nginx -d domain-sekolah.example
```

Ikuti konfigurasi TLS Certbot dan verifikasi pembaruan otomatis sertifikat. Jangan membuka port aplikasi Node.js ke internet; hanya Nginx yang menerima trafik publik.

## 5. Verifikasi setelah rilis

- Periksa `pm2 status`, `pm2 logs sdit-al-ikhlas`, dan log Nginx.
- Uji login/logout, halaman publik, unggah gambar Cloudinary, pendaftaran PPDB, cek status, perubahan status admin, dan unduhan dokumen privat.
- Pastikan direktori dokumen tidak dapat diakses dari HTTP dan file izin hanya dapat dibaca user aplikasi.
- Atur backup terenkripsi/off-site dan uji pemulihan berkala.
- Pantau ruang disk, log, koneksi PostgreSQL, dan masa berlaku secret/akun Cloudinary.
