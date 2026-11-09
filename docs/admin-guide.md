# Panduan administrator

## Akun dan role

Akun administrator dibuat melalui bootstrap seed terkontrol atau oleh `SUPER_ADMIN` di `/admin/admins`. Role tersedia `SUPER_ADMIN`, `ADMIN_WEBSITE`, `ADMIN_PPDB`, dan `EDITOR`; role aktif diperiksa dari database pada setiap akses admin. Jangan berbagi akun antarpetugas. Sistem mencegah penonaktifan atau penurunan role `SUPER_ADMIN` terakhir yang aktif.

## Dashboard

`/admin` menampilkan ringkasan berita, pendaftar, grafik pendaftaran enam bulan, dan audit aktivitas. Menu dibatasi sesuai role.

## Modul konten

Administrator website dan editor dapat mengelola pengumuman, album galeri/foto, prestasi, data guru, dan agenda akademik. Setiap konten dapat dicari, diubah, ditampilkan/disembunyikan, atau dihapus setelah konfirmasi. Gambar diunggah ke Cloudinary melalui formulir aman. Kategori berita dikelola administrator website.

## Berita

`/admin/berita` mendukung membuat, mengedit, mencari, memublikasikan, dan menghapus berita. Editor konten berita berupa teks aman (bukan HTML mentah). Gambar dapat diunggah ke Cloudinary; bila kredensial belum tersedia, konfigurasi Cloudinary terlebih dahulu. Slug dibuat otomatis dari judul bila tidak ditentukan.

## PPDB

1. Buat periode dan tahun ajaran di `/admin/ppdb/periode`; atur waktu, kuota, keterangan, informasi biaya, serta persyaratan.
2. Awali baris persyaratan dengan `?` jika dokumen opsional. File yang diizinkan adalah JPG, PNG, atau PDF, maksimal 5 MB per dokumen.
3. Jadikan satu periode aktif. Formulir hanya muncul selama tanggal pembukaan dan penutupan.
4. Pantau daftar pendaftar, buka detail, unduh dokumen terproteksi, ubah status, dan beri catatan kepada orang tua.
5. Ekspor CSV untuk dibuka di spreadsheet. File ekspor memuat data pribadi, jadi simpan hanya pada media yang disetujui sekolah dan hapus setelah kebutuhan selesai.

Pendaftar memperoleh nomor dan kode akses acak. Kode akses hanya ditampilkan sekali; petugas tidak dapat melihatnya kembali. Minta orang tua menyimpan kedua nilai tersebut.

## Informasi sekolah

Konten publik sengaja menampilkan penanda “belum diisi” saat data resmi belum tersedia. Kelola identitas, sejarah, visi-misi, profil kepala sekolah, program akademik, fasilitas, kontak, Google Maps, media sosial, dan gambar hero melalui `/admin/konten`. Headline homepage juga dapat diisi sebagai copy resmi sekolah. Jangan mengganti penanda dengan informasi perkiraan.
