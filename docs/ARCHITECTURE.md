# Architecture

Next.js public UI → REST API → PostgreSQL → object storage → notifications.

Core domains: members, communities, platforms, events, convoys, fleet, modding, gallery, forum, tutorials, moderation, notifications, news and partners.

Security baseline: password hashing, RBAC, validation, rate limiting, secure cookies, security headers, upload validation, audit logs and environment-managed secrets.
