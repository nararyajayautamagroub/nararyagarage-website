# NARARYA GARAGE

Virtual Simulator, Modding, and Gaming Community for BUSSID, ETS2, ATS, TOE3, TSI, Roblox, and other supported games.

## Current stack
- Next.js App Router, React, TypeScript
- Tailwind CSS 4
- PostgreSQL with Prisma ORM 7
- GitHub REST API for repository discovery, activity, source snapshots, and webhook updates

## Current features
- Responsive public pages for platforms, communities, events, convoys, mods, liveries, showcase, gallery, videos, forum, tutorials, downloads, news, partners, achievements, fleet, recruitment, and contact
- Ten locale choices: Indonesian, English, Malay, Simplified Chinese, Japanese, Korean, Arabic, Spanish, French, and German. Navigation and selected shared UI are localized; not every page sentence has complete translation coverage yet.
- Email/password registration and login, Google OAuth flow, email verification, and password reset flows
- Member dashboard, profile/settings, event registration, submissions, notifications, and fleet submissions
- Role-protected admin pages and APIs for members, events, recruitment, fleet, moderation, notifications, settings, analytics, and audit logs
- GitHub repository browser and scheduled repository scraper
- Security headers, same-origin mutation checks, request validation, and activity logging
- CI checks for source audit, scraper syntax, dependency audit, Prisma validation/generation, TypeScript, and production build

## Setup

Requirements: Node.js >=22.16 and <25, npm 11, and PostgreSQL for database-backed features.

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run db:validate
npm run db:migrate
npm run dev
```

For a production build:

```bash
npm run check
npm run build
npm run start
```

## Environment variables

Configure the variables in `.env.example` for the services you actually use:
- `DATABASE_URL`: PostgreSQL connection string; required for persistent community data.
- `AUTH_SECRET`: strong, unique production secret; required for production auth.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: Google OAuth credentials and matching callback URL.
- `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`: compatible email provider for verification and password recovery.
- `GITHUB_TOKEN`: token with minimum required access, particularly for private repositories.
- `GITHUB_WEBHOOK_SECRET`: HMAC secret for GitHub webhook validation.
- `NEXT_PUBLIC_SITE_URL`: canonical public deployment URL.
- `DISCORD_BOT_TOKEN`, `STORAGE_BUCKET`: reserved integration settings; configuring them alone does not enable a full Discord or file-storage integration.

Do not commit real tokens, credentials, or production environment files.

## GitHub repository sync

The repository browser discovers repositories dynamically from the configured GitHub owner. Private repository access needs a suitably scoped token. Scheduled scraper results are snapshots; live pages may query GitHub directly. See [docs/REPOSITORY-SYNC.md](docs/REPOSITORY-SYNC.md).

## Honest deployment notes

Source and CI checks do not prove external production services are configured. Google sign-in requires OAuth credentials, verification/reset email requires an email provider, and persistent data requires PostgreSQL migrations. A deployment URL is not assumed to exist until hosting is configured and verified.