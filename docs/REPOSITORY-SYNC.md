# Repository Data Sync

NARARYA GARAGE sekarang memiliki registry repository terpusat di `data/repositories.ts` dan adapter GitHub di `lib/github.ts`.

## Live data

`GET /api/github/repositories` mengambil metadata repository secara langsung dari GitHub API dengan `cache: no-store`. GitHub menyediakan REST API untuk membaca repository contents/metadata dan webhook untuk mengirim event repository ke server. citeturn0search0turn0search1

## Secrets

Set environment variables:

- `GITHUB_TOKEN`: GitHub token dengan permission minimum yang diperlukan. Token dibutuhkan untuk repository private.
- `GITHUB_WEBHOOK_SECRET`: secret acak untuk memverifikasi webhook.
- `NEXT_PUBLIC_SITE_URL`: URL deployment website.

Jangan commit token ke GitHub.

## Webhook

Endpoint: `POST /api/github/webhook`.

Daftarkan webhook pada repository dengan event push/pull request sesuai kebutuhan. GitHub mendukung webhook repository melalui REST API maupun GitHub UI. 

## Source of truth

- GitHub: source of truth untuk status repository, branch, commit, issue dan workflow.
- PostgreSQL/Prisma: source of truth untuk member, event, mod, livery, gallery, forum, moderation dan data aplikasi.
- Website: presentation/API layer yang membaca kedua sumber tersebut.

Untuk data relasional, Prisma/PostgreSQL mendukung foreign-key relations dan model one-to-one, one-to-many, serta many-to-many. citeturn0search2turn0search8