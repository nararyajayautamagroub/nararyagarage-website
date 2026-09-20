# Security Audit

## Current policy

CI runs a high-severity audit against production dependencies with:

npm audit --omit=dev --audit-level=high

The project uses Prisma CLI 7.10.0 as a development dependency. The current npm audit database reports high-severity advisories in Prisma CLI's development dependency chain, including deepmerge-ts and mysql2. The automated audit fix offered by npm would downgrade Prisma to 6.19.3, which is a breaking change.

For that reason the repository does not use npm audit fix --force. Prisma 7.10.0 remains pinned as the current stable Prisma release used by this project.

## Install scripts

npm 11 now tracks approval for dependency install lifecycle scripts. The project explicitly approves only the packages required for the build:

- @prisma/engines@7.10.0
- prisma@7.10.0
- esbuild@0.28.2

No blanket dangerously-allow-all-scripts bypass is used.

## CI gates

The main CI pipeline checks:

1. source audit
2. scraper syntax
3. production dependency security
4. Prisma schema validation
5. TypeScript typecheck
6. Next.js production build

Any failure blocks the verification job.
