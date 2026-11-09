# API ringkas

Semua endpoint admin memerlukan sesi Auth.js dan role yang sesuai; data publik tidak mengembalikan detail pendaftar atau dokumen privat. Error memakai JSON `{ "error": "..." }` dan status HTTP yang sesuai.

| Method | Path | Akses | Kegunaan |
| --- | --- | --- | --- |
| `GET`, `POST` | `/api/auth/[...nextauth]` | Publik / session | Login, logout, session (Credentials) |
| `GET`, `POST` | `/api/admin/posts` | Website admin / editor | Daftar berita berhalaman dan membuat berita |
| `PATCH`, `DELETE` | `/api/admin/posts/:id` | Edit: website admin/editor; hapus: website admin | Mengubah atau menghapus berita |
| `POST` | `/api/admin/media` | Website admin / editor | Validasi gambar lalu upload ke Cloudinary |
| `GET`, `POST` | `/api/admin/categories` | Daftar: website admin/editor; ubah: website admin | CRUD kategori berita |
| `GET`, `POST` | `/api/admin/content/:resource` | Website admin / editor | Pencarian berhalaman dan pembuatan pengumuman, guru, galeri, prestasi, atau agenda |
| `PATCH`, `DELETE` | `/api/admin/content/:resource/:id` | Edit: website admin/editor; hapus: website admin | Perubahan atau penghapusan konten |
| `PATCH` | `/api/admin/school-profile` | Super admin / website admin | Simpan profil, kontak, metadata homepage, program, dan tautan sekolah |
| `GET` | `/api/admin/school-profile` | Super admin / website admin | Baca profil sekolah pada dashboard |
| `GET` | `/api/admin/statistics` | Admin terautentikasi | Statistik berita, PPDB, dan pendaftaran bulanan |
| `GET`, `POST` | `/api/admin/users` | Super admin | Daftar dan membuat akun admin |
| `PATCH` | `/api/admin/users/:id` | Super admin | Mengubah role, status aktif, atau reset kata sandi |
| `GET`, `POST` | `/api/admin/ppdb/periods` | Super admin / admin PPDB | Daftar dan membuat periode PPDB |
| `PATCH` | `/api/admin/ppdb/periods/:id` | Super admin / admin PPDB | Mengubah periode dan persyaratannya |
| `GET` | `/api/admin/applicants?page=&q=&status=` | Super admin / admin PPDB | Daftar pendaftar terfilter, 20 per halaman |
| `PATCH` | `/api/admin/applicants/:id/status` | Super admin / admin PPDB | Perubahan status sesuai transisi yang diizinkan |
| `GET` | `/api/admin/documents/:id` | Super admin / admin PPDB | Unduh dokumen privat dan catat audit |
| `GET` | `/api/admin/applicants/export` | Super admin / admin PPDB | CSV spreadsheet dengan perlindungan formula |
| `POST` | `/api/ppdb/applicants` | Publik, rate-limited | Pendaftaran multipart dengan dokumen privat |
| `POST` | `/api/ppdb/status` | Publik, rate-limited | Cek status dengan nomor dan kode akses |

Status publik hanya mengembalikan nama calon siswa, tahun ajaran, status, catatan panitia, dan waktu pembaruan setelah dua kredensial cocok. API publik lain menyajikan konten yang sudah dipublikasikan.
