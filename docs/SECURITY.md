# Security Baseline

- Password wajib di-hash dengan algoritma modern.
- Secret hanya melalui environment variables atau secret manager.
- Validasi input dan output untuk mencegah injection/XSS.
- CSRF protection untuk cookie-based mutation endpoints.
- Secure, HttpOnly, SameSite cookies.
- Rate limiting pada login, register, upload, report, dan API sensitif.
- Validasi MIME type, extension, ukuran, dan nama file upload.
- Jangan memperbolehkan executable upload.
- RBAC diterapkan server-side, bukan hanya menyembunyikan tombol di UI.
- Audit log untuk perubahan role, suspend, ban, moderation, dan pengaturan penting.
- Jangan mengumpulkan data pribadi yang tidak diperlukan.