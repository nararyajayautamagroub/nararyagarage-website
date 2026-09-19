# Database

NARARYA GARAGE menggunakan PostgreSQL melalui Prisma. Schema mencakup user/member, RBAC-ready role fields, platform, community, event/convoy registration, modding, showcase, gallery, forum, tutorial, download, report, moderation, notification, partner, achievement, dan activity log.

## Setup
1. Isi DATABASE_URL di .env.
2. Install Prisma CLI/client.
3. Jalankan migration setelah backend Prisma diaktifkan.

Jangan menyimpan password, token, atau secret sebagai plaintext di database.