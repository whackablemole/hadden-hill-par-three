# Implementation Plan: Hadden Hill Scorekeeping App

**Branch**: `main` | **Date**: 2026-05-20 | **Spec**: `/specs/001-build-scorekeeper-app/spec.md`

**Input**: Feature specification from `/specs/001-build-scorekeeper-app/spec.md`

## Summary

Build a mobile-first web app for Hadden Hill par-three round tracking with
Google authentication, resilient live hole-entry saves, accurate round and
aggregate statistics, and user-owned round history management. The delivery
uses Next.js + TypeScript, Auth.js for Google OAuth, Prisma with MySQL for
storage, and typed domain services for scoring and aggregation logic.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS

**Primary Dependencies**: Next.js (App Router), Auth.js, Prisma ORM,
Tailwind CSS, shadcn/ui, Zod

**Storage**: MySQL (via Prisma)

**Testing**: Vitest for unit/domain tests, Playwright for end-to-end critical
flows, Prisma test database for integration tests

**Target Platform**: Modern mobile and desktop browsers, server runtime on Node.js

**Project Type**: Web application (full-stack Next.js)

**Performance Goals**: P95 save-hole response < 2 seconds; first-hole capture
flow < 30 seconds for practiced user; stats view load < 2 seconds for typical
user history

**Constraints**: Must enforce per-user data ownership server-side; must support
6/12/18-hole rounds using repeated six-hole loops; preserve in-progress round
state across refresh/navigation

**Scale/Scope**: Single-course product, individual golfer accounts, low-to-
moderate concurrency initial launch (<10k registered users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- Principle I (Round Data Integrity First): PASS
  - Plan includes canonical six-hole definition and deterministic stat
    calculations for 6/12/18-hole loops.
- Principle II (Mobile-First Live Scoring UX): PASS
  - Plan includes resilient, incremental hole save behavior and mobile-first
    capture flows.
- Principle III (Test-First and Stats Accuracy): PASS
  - Plan commits to test-first domain logic and coverage of all required
    aggregate metrics.
- Principle IV (Auth and Ownership Boundaries): PASS
  - Plan enforces Auth.js + ownership checks on all round read/write/delete.
- Principle V (Simple, Typed, Observable): PASS
  - Plan stays inside approved stack and centralizes scoring logic in typed
    services with structured logging.

Gate Result: PASS

### Post-Design Gate Review

- Principle I: PASS (data model separates canonical hole definitions from per-
  round entries and loop mapping)
- Principle II: PASS (contracts define in-progress round retrieval and idempotent
  hole upserts)
- Principle III: PASS (quickstart includes mandatory test execution before
  implementation completion)
- Principle IV: PASS (contracted endpoints are explicitly user-scoped)
- Principle V: PASS (design keeps stack-constrained architecture and avoids
  unnecessary subsystems)

Gate Result: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-build-scorekeeper-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── scorekeeping-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (auth)/
├── rounds/
│   ├── new/
│   ├── [roundId]/
│   └── history/
└── stats/

components/
├── round-entry/
├── stats/
└── ui/

lib/
├── auth/
├── scoring/
├── rounds/
└── db/

prisma/
├── schema.prisma
└── migrations/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Use a single Next.js full-stack repository structure
with App Router and shared domain services under `lib/` to keep scoring logic
typed and centralized.

## Complexity Tracking

No constitution violations requiring exception tracking.
