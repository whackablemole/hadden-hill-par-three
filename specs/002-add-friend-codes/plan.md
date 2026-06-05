# Implementation Plan: Friend Connections by Code

**Branch**: `002-add-friend-codes` | **Date**: 2026-06-05 | **Spec**: `/specs/002-add-friend-codes/spec.md`

**Input**: Feature specification from `/specs/002-add-friend-codes/spec.md`

## Summary

Add mutual friend connections using unique friend codes, then enable friend-only
views for name, overall statistics, and prior rounds while preventing any email
exposure in friend-facing responses. The implementation extends the existing
Next.js + Auth.js + Prisma architecture with a friendship relationship model,
strict server-side friendship authorization checks, and privacy-safe response
projection.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS

**Primary Dependencies**: Next.js (App Router), Auth.js (next-auth v4), Prisma
ORM, Zod, Tailwind CSS, shadcn/ui

**Storage**: MySQL (via Prisma)

**Testing**: Vitest (unit/integration), Playwright (e2e critical flows)

**Target Platform**: Modern mobile and desktop browsers, Node.js server runtime

**Project Type**: Full-stack web application (single Next.js repository)

**Performance Goals**: Friend add flow completed in under 60 seconds for 95% of
users; friend stats/history endpoints respond under 2 seconds p95 for typical
history sizes

**Constraints**: Friendship visibility must be server-authorized on every
request; no email field exposure in friend-facing responses; duplicate and
self-friend operations must be rejected or safely no-op

**Scale/Scope**: Initial launch scope under 10k users with low-to-moderate
concurrency, social scope limited to friend connection and read-only sharing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- Principle I (Round Data Integrity First): PASS
  - Existing round and stats calculations remain canonical; sharing layer is
    read-only and does not alter scoring math.
- Principle II (Mobile-First Live Scoring UX): PASS
  - Friend code add flow is lightweight and does not add friction to in-round
    scoring paths.
- Principle III (Test-First Rule and Stats Accuracy): PASS
  - Plan requires tests for friendship authorization and projected friend stats
    responses before implementation completion.
- Principle IV (Auth and Data Ownership Boundaries): PASS
  - All friend data endpoints require authentication and explicit friendship
    verification before returning any shared data.
- Principle V (Keep It Simple, Typed, Observable): PASS
  - Design stays in approved stack, extends typed domain services, and reuses
    existing structured logging patterns for important state changes.

Gate Result: PASS

### Post-Design Gate Review

- Principle I: PASS (friend access reads existing round/stat aggregates without
  changing scoring computation logic)
- Principle II: PASS (friend add and friend-view access are simple, mobile-safe
  interactions)
- Principle III: PASS (quickstart defines unit/integration/e2e checks for
  friend linking, access denial, and privacy-safe output)
- Principle IV: PASS (contracts require both authentication and friendship
  relationship checks for friend-scoped routes)
- Principle V: PASS (single repo architecture retained with typed contracts and
  no new platform/runtime complexity)

Gate Result: PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-add-friend-codes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── friend-sharing-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── friends/
│   │   ├── route.ts
│   │   ├── code/
│   │   │   └── route.ts
│   │   └── [friendUserId]/
│   │       ├── profile/
│   │       │   └── route.ts
│   │       ├── rounds/
│   │       │   └── history/
│   │       │       └── route.ts
│   │       └── stats/
│   │           └── overall/
│   │               └── route.ts
│   ├── rounds/
│   └── stats/
├── rounds/
├── stats/
└── friends/
    ├── page.tsx
    └── [friendUserId]/
        └── page.tsx

components/
├── navigation/
├── stats/
└── friends/

lib/
├── auth/
├── rounds/
├── friends/
│   ├── codes.ts
│   ├── friendships.ts
│   ├── permissions.ts
│   └── projections.ts
└── db/

prisma/
├── schema.prisma
└── migrations/
```

**Structure Decision**: Use the existing single Next.js app structure and add
friendship-specific API routes, service modules, and UI pages without creating
new services or repositories.

## Complexity Tracking

No constitution violations requiring exception tracking.
