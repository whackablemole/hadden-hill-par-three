# Research: Friend Connections by Code

## Decision 1: Represent friend codes as stable unique values per user

- Decision: Store a unique friend code for each user and generate it at user
  creation or first access if missing.
- Rationale: Keeps friend onboarding simple and avoids requiring users to share
  private identifiers.
- Alternatives considered:
  - Use email-based friend lookup: rejected due to explicit privacy requirement
    and poor usability.
  - Regenerate one-time codes on each share: rejected due to complexity and
    poor recoverability for users.

## Decision 2: Model friendship as a canonical undirected pair

- Decision: Persist one friendship row per pair of users using deterministic
  ordering (userLowId, userHighId) with a uniqueness constraint.
- Rationale: Prevents duplicate rows and guarantees reciprocal visibility with
  simple query logic.
- Alternatives considered:
  - Two directional rows (A->B and B->A): rejected because it doubles write
    paths and increases risk of partial consistency.
  - Pending-request workflow: rejected as out of scope for this feature.

## Decision 3: Enforce friendship authorization at server query boundaries

- Decision: All friend-scoped profile/stats/history endpoints must validate both
  authentication and active friendship before returning data.
- Rationale: Implements least-privilege access and satisfies ownership/privacy
  boundaries from the constitution.
- Alternatives considered:
  - Client-side friend filtering only: rejected because it is not secure.
  - Public profile links with optional privacy flags: rejected because only
    friend-based sharing is in scope.

## Decision 4: Use explicit privacy-safe response projections

- Decision: Introduce projection helpers for friend-facing payloads that only
  include approved fields (display name, stats, rounds) and never email.
- Rationale: Centralizes privacy rules and prevents accidental field leaks when
  reusing existing models.
- Alternatives considered:
  - Return raw Prisma user objects and hide fields in UI: rejected due to API
    leak risk.
  - Duplicate friend-only DTO definitions in each route: rejected due to drift
    and maintenance overhead.

## Decision 5: Extend existing REST JSON API shape

- Decision: Add friend-specific REST routes under /api/friends for code lookup,
  friend creation, friend listing, and friend-scoped stats/history/profile.
- Rationale: Aligns with current route-handler architecture and existing test
  and client-fetch patterns.
- Alternatives considered:
  - GraphQL layer for social queries: rejected as unnecessary complexity.
  - Server-action-only integration with no contract: rejected because explicit
    contract artifacts are required for planning and tests.

## Decision 6: Test strategy prioritizes privacy and authorization regressions

- Decision: Add test coverage for self-add rejection, duplicate-add idempotency,
  non-friend access denial, and email non-exposure in friend payloads.
- Rationale: Social features fail primarily through auth/privacy regressions;
  these checks protect the highest-risk behavior.
- Alternatives considered:
  - E2E-only coverage: rejected because debugging failures would be slow and
    insufficiently granular.
  - Unit-only coverage: rejected because route-level authorization would remain
    under-tested.