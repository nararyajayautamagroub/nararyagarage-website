# Repository Data Sync

NARARYA GARAGE memakai GitHub sebagai sumber data repository dan PostgreSQL/Prisma sebagai sumber data aplikasi.

## Live repository discovery

`/repositories` dan `GET /api/github/repositories` menemukan repository milik akun GitHub yang terhubung secara dinamis. Registry `data/repositories.ts` hanya menyimpan label/purpose, bukan daftar repository yang harus ada.

`GET /api/github/activity` mengambil commit terbaru untuk seluruh repository yang berhasil ditemukan.

GitHub REST API menyediakan endpoint metadata dan contents repository, sedangkan webhook dapat mengirim payload HTTP saat event repository terjadi. citeturn0search2turn0search1

## Secrets

- `GITHUB_TOKEN`: token GitHub dengan akses minimum yang dibutuhkan. Wajib untuk data private.
- `GITHUB_WEBHOOK_SECRET`: secret untuk verifikasi `X-Hub-Signature-256`.
- `DATABASE_URL`: PostgreSQL production database.
- `NEXT_PUBLIC_SITE_URL`: URL deployment.

Jangan commit secret ke repository.

## Webhook

Endpoint: `POST /api/github/webhook`.

Webhook memvalidasi signature HMAC SHA-256, event name, delivery ID, repository, dan JSON payload. GitHub mendukung event seperti `push` dan `pull_request`. citeturn0search1

## Database

Project menggunakan Prisma dengan konfigurasi modern `prisma.config.ts`. Pada Prisma ORM 7+, URL datasource dipindahkan ke config dan koneksi PostgreSQL memakai driver adapter. citeturn0search0turn1search0turn2search0

Data aplikasi yang mutable tidak boleh dipalsukan di frontend. Bila PostgreSQL belum tersedia, halaman menggunakan fallback struktur platform yang tidak mengklaim jumlah member atau event nyata.

## Source of truth

- GitHub: repository, branch, commit, issue, pull request, workflow dan source repository.
- PostgreSQL/Prisma: member, event, convoy, mod, livery, showcase, gallery, forum, tutorial, download, moderation, notification dan pengaturan.
- Website: layer UI/API yang membaca kedua sumber secara live.

## Private repository

Repository private hanya dapat dibaca saat deployment memiliki token dengan permission yang sesuai. Tanpa token tersebut, kegagalan akses ditampilkan sebagai data unavailable, bukan diganti angka fiktif.
