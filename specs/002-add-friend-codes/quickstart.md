# Quickstart: Friend Connections by Code

## Purpose

Validate end-to-end behavior for friend-code linking, friend-only visibility to
stats/history/name, and privacy protection that excludes email from all
friend-facing responses.

## Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8+
- Google OAuth credentials configured for Auth.js
- Two test user accounts (User A and User B)

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

3. Run schema generation and migrations.

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the app.

```bash
npm run dev
```

## Verification Flow

1. Sign in as User A and retrieve User A's friend code.
2. In a separate session, sign in as User B.
3. Submit User A's friend code from User B.
4. Confirm friend connection appears for both users.
5. As User B, open User A friend profile and verify visible fields include:
   - display name
   - overall statistics
   - previous rounds
6. Verify User A email is not present in any friend-facing UI or API payload.
7. As a non-friend test account, attempt to access User A friend endpoints and
   confirm access is denied.
8. Attempt to add User B's own friend code and confirm rejection.
9. Attempt to add User A again and confirm duplicate-safe behavior (no second
   friendship record).
10. If User A has no completed rounds, verify friend view shows a valid empty
    state rather than an error.

## Test Commands

1. Run unit and integration tests.

```bash
npm run test
```

2. Run end-to-end tests for friend flows.

```bash
npm run test:e2e
```

## Exit Criteria

- Friend creation by code works for valid users.
- Self-add and duplicate-add paths are safely handled.
- Non-friend access to friend-only views is blocked.
- No email data appears in friend-facing responses.
- All required automated tests pass.

## Execution Notes (2026-06-05)

- Prisma client generation completed successfully.
- Lint and production build checks completed successfully.
- Automated test execution could not run scenario-level coverage because no test files exist yet.
- End-to-end OAuth verification with two real accounts remains a manual follow-up step.