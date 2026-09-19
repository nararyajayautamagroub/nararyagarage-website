# Repository Data Sync

NARARYA GARAGE memiliki registry repository terpusat di `data/repositories.ts` dan adapter GitHub di `lib/github.ts`.

## Live data

`GET /api/github/repositories` mengambil metadata repository langsung dari GitHub API dengan cache disabled. Untuk repository private, runtime website memerlukan `GITHUB_TOKEN` dengan permission minimum yang diperlukan.

## Secrets

Set environment variables:

- `GITHUB_TOKEN`: token GitHub untuk metadata repository yang memerlukan autentikasi.
- `GITHUB_WEBHOOK_SECRET`: secret acak untuk memverifikasi webhook.
- `NEXT_PUBLIC_SITE_URL`: URL deployment website bila diperlukan oleh integrasi eksternal.

Jangan commit token ke GitHub.

## Webhook

Endpoint: `POST /api/github/webhook`.

Konfigurasikan webhook repository untuk event yang diperlukan seperti `push` dan `pull_request`. Server memvalidasi `X-Hub-Signature-256` sebelum menerima payload.

## Source of truth

- GitHub: source of truth untuk status repository, branch, commit, issue, pull request, dan workflow.
- PostgreSQL/Prisma: source of truth untuk member, event, mod, livery, gallery, forum, moderation, dan data aplikasi.
- Website: presentation dan API layer yang menggabungkan kedua sumber.

## Catatan

Metadata GitHub dibuat live, tetapi data aplikasi tidak boleh diisi dengan angka palsu. Jika database belum dikonfigurasi, UI menampilkan status kosong atau `—`, bukan mengarang jumlah member/event.