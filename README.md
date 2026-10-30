# Smugglers backend

## Local setup

1. Use Node.js 20 or later.
2. Copy `.env.example` to `.env`.
3. Configure `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`.
4. Configure SMTP for password recovery:
   - `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`
   - `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`
   - For Gmail, use a Google App Password; do not use or commit your account password.
5. Run `npm install`, then `npm run dev`.

Password reset links expire after one hour and can only be used once. Until SMTP
is configured, the reset request endpoint returns a service-unavailable error
when the requested email belongs to an account.
