# Hadden Hill Par Three Scorekeeper

A mobile-first Next.js application for tracking live scores on the Hadden Hill
six-hole par-three course with 6, 12, and 18-hole rounds.

## Stack

- TypeScript
- Next.js (App Router)
- Tailwind CSS
- Auth.js (Google OAuth)
- Prisma + MySQL

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).

4. Run database setup:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Start development server:

```bash
npm run dev
```

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:e2e
```

## Friend Codes Feature Notes

- Friend codes are provisioned server-side for authenticated users on first access.
- To validate social sharing locally, sign in with two different Google accounts.
- Friend-facing views expose name, stats, and rounds only; email is intentionally excluded.
