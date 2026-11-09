#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:?Set PostgreSQL host}"
: "${PGUSER:?Set PostgreSQL backup user}"
: "${PGDATABASE:?Set PostgreSQL database name}"

backup_dir="${BACKUP_DIR:-/var/backups/sdit-alikhlas}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"
umask 077
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="$backup_dir/sdit-alikhlas-$timestamp.dump"

pg_dump --format=custom --no-owner --file="$target" "$PGDATABASE"
chmod 600 "$target"
find "$backup_dir" -type f -name 'sdit-alikhlas-*.dump' -mtime "+$retention_days" -delete
printf 'Backup created: %s\n' "$target"
