# Backup dan pemulihan PostgreSQL

Jalankan backup sebagai user sistem khusus dengan kredensial database berhak baca yang disimpan melalui secret manager atau `.pgpass` mode `0600`. Set `PGHOST`, `PGUSER`, `PGDATABASE` dan bila diperlukan `PGPORT`/`PGPASSFILE`, kemudian jalankan `ops/backup-postgres.sh`. Backup terenkripsi/off-site dianjurkan; file lokal saja bukan strategi pemulihan.

Uji arsip dengan `pg_restore --list backup.dump`. Untuk memulihkan, hentikan aplikasi, siapkan database target kosong, set variabel `PG*`, lalu jalankan:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$PGDATABASE" backup.dump
pnpm db:migrate
```

Hindari memulihkan ke database produksi tanpa persetujuan pemilik data dan backup sebelum pemulihan. Batasi akses ke file ekspor PPDB; ekspor mengandung data pribadi siswa dan orang tua.
