# API Contract

Rencana endpoint REST:

- GET /api/platforms
- GET /api/communities
- GET /api/communities/:id
- GET /api/events
- POST /api/events/:id/register
- GET /api/convoys/:id
- GET /api/mods
- POST /api/mods/submissions
- GET /api/liveries
- GET /api/showcase
- GET /api/gallery
- GET /api/forum/threads
- POST /api/forum/threads
- GET /api/tutorials
- GET /api/downloads
- POST /api/reports
- GET /api/member/dashboard
- GET /api/admin/overview

Semua endpoint privat wajib menerapkan autentikasi, authorization/RBAC, validasi input, rate limit, dan audit logging.