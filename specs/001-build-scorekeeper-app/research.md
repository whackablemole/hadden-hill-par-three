# Research: Hadden Hill Scorekeeping App

## Decision 1: Use Next.js App Router with Server Actions + Route Handlers

- Decision: Implement the app as a full-stack Next.js application using App
  Router, with server-side mutations via Route Handlers or Server Actions.
- Rationale: Keeps UI and API in one codebase, supports rapid iteration for
  mobile-first flows, and aligns with the selected stack.
- Alternatives considered:
  - Separate frontend and backend repositories: rejected due to extra
    coordination overhead for an MVP.
  - Pages Router legacy approach: rejected in favor of modern App Router
    patterns and improved data flow.

## Decision 2: Model score logic as pure domain services in TypeScript

- Decision: Implement all score/category calculations in pure functions under a
  dedicated scoring module.
- Rationale: Enables strict test-first validation of birdie/par/bogey category
  counts and aggregate metrics, independent of transport/database concerns.
- Alternatives considered:
  - Inline calculations in UI components: rejected because it duplicates logic
    and is hard to test.
  - Database-only computed values: rejected due to maintainability and portability
    tradeoffs for evolving scoring rules.

## Decision 3: Persist round/hole data with Prisma + MySQL and idempotent upserts

- Decision: Use Prisma models for rounds and hole entries with a unique key on
  (roundId, holeSequence) and upsert semantics for save retries.
- Rationale: Satisfies resilience needs for mobile connectivity issues and
  prevents duplicate hole rows.
- Alternatives considered:
  - Fire-and-forget append-only event rows: rejected due to added aggregation
    complexity for this scope.
  - Local-only storage sync later: rejected because cross-device continuity and
    user history are required.

## Decision 4: Enforce ownership at the query boundary on every round operation

- Decision: Every read/write/delete path must include both round identifier and
  authenticated user identifier.
- Rationale: Implements constitution requirement for strict user data ownership
  isolation.
- Alternatives considered:
  - Client-side filtering only: rejected because it is not secure.
  - Shared rounds for v1: rejected as out of scope.

## Decision 5: Testing strategy uses unit + integration + e2e tiers

- Decision: Use Vitest for scoring/domain unit tests, integration tests for
  persistence and authorization boundaries, and Playwright for critical live
  scoring flow.
- Rationale: Provides confidence on correctness, ownership protections, and
  mobile-first flow behavior.
- Alternatives considered:
  - E2E-only testing: rejected because debugging failures is slow and brittle.
  - Unit-only testing: rejected because authorization and persistence behavior
    would remain unverified.

## Decision 6: API contract style uses REST JSON endpoints

- Decision: Expose user-scoped REST endpoints for rounds, hole-entry upserts,
  stats retrieval, and round deletion.
- Rationale: Clear contract for implementation and tests; easy to consume from
  Next.js client components.
- Alternatives considered:
  - GraphQL API: rejected due to unnecessary schema/runtime complexity for this
    domain size.
  - RPC-only server actions with no explicit contract doc: rejected because
    `/speckit.plan` output requires a concrete interface contract artifact.
