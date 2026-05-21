# Quickstart: Hadden Hill Scorekeeping App

## Purpose

Validate the end-to-end feature behavior for live round entry, stat visibility,
and round history management.

## Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8+
- Google OAuth client credentials configured for Auth.js

## Setup

1. Install dependencies.

```bash
npm install
```

2. Configure environment variables:
   - DATABASE_URL
   - AUTH_SECRET
   - AUTH_GOOGLE_ID
   - AUTH_GOOGLE_SECRET
3. Run Prisma migrations and seed canonical six-hole definitions.

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start the Next.js development server.

```bash
npm run dev
```

## Verification Flow

1. Sign in with Google.
2. Start a new 6-hole round.
3. Save hole 1 and hole 2 entries with strokes, penalties, bunkers, putts, and
   green in regulation.
4. Refresh the browser and confirm in-progress entries are preserved.
5. Complete the remaining holes and finalize the round.
6. Confirm round metrics are visible:
   - total strokes
   - total putts
   - average putts per hole
   - birdie/par/bogey/double/triple+ counts
7. Play and complete a 12-hole round to validate six-hole loop mapping.
8. Open overall stats and confirm aggregate totals include both rounds.
9. Delete one round from history and confirm aggregate stats update.
10. Attempt direct access to another user's round identifier and confirm access
    is denied.

## Test Commands

1. Run unit tests for scoring logic.

```bash
npm run test
```

2. Run integration tests for authorization and round persistence.

```bash
npm run test
```

3. Run end-to-end tests for live round entry and history delete flow.

```bash
npm run test:e2e
```

## Exit Criteria

- All verification flow steps pass.
- All automated tests pass.
- No cross-user data access is possible.
