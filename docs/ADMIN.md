# Production catalog administration

The catalog uses PostgreSQL when `DATABASE_URL` is present and keeps the existing JSON repositories as a local/build fallback. The database schema stores the complete typed product/category payload in JSONB while indexing the fields used for catalog lookup.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Generate a password hash with the command in `.env.example`; never put a plaintext password in environment variables or source.
3. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and a long random `ADMIN_SESSION_SECRET`.
4. Set `DATABASE_URL` and run `npm run db:import`.
5. Start the app and visit `/admin/login`.

Admin sessions are signed, expiring, HttpOnly, SameSite cookies. Every admin page and mutation checks the session server-side. The customer-facing app intentionally has no customer authentication, cart, checkout, wishlist, ratings, or reviews.

When `BLOB_READ_WRITE_TOKEN` is configured, the server-only helpers in `src/lib/blob.ts` upload and delete Vercel Blob images and can safely reorder image arrays. Seeded `/images/...` URLs remain valid without Blob.
