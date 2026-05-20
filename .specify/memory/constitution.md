<!--
Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. Round Data Integrity First
	- Template Principle 2 -> II. Mobile-First Live Scoring UX
	- Template Principle 3 -> III. Test-First Rule and Stats Accuracy (NON-NEGOTIABLE)
	- Template Principle 4 -> IV. Auth and Data Ownership Boundaries
	- Template Principle 5 -> V. Keep It Simple, Typed, and Observable
- Added sections:
	- Product Constraints
	- Delivery Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ verified (no change required): .specify/templates/plan-template.md
	- ✅ verified (no change required): .specify/templates/spec-template.md
	- ✅ verified (no change required): .specify/templates/tasks-template.md
	- ✅ verified (no change required): .specify/templates/constitution-template.md
- Follow-up TODOs:
	- None
-->

# Hadden Hill Par Three Scorekeeper Constitution

## Core Principles

### I. Round Data Integrity First
The application MUST persist and calculate scoring data accurately for 6, 12,
and 18-hole rounds where the six-hole par-three loop can repeat. Hole
definitions (hole number, length, stroke index) MUST be canonical and stable,
and historical rounds MUST remain reproducible even after app updates.
Rationale: scorekeeping value depends on trustworthy history and statistics.

### II. Mobile-First Live Scoring UX
Primary workflows MUST be optimized for in-round use on mobile devices: minimal
taps, clear progress state, and safe recovery from accidental refresh/navigation.
Saving score updates during a round MUST be resilient and MUST NOT require users
to re-enter already submitted hole data.
Rationale: users interact while walking the course and need fast, reliable input.

### III. Test-First Rule and Stats Accuracy (NON-NEGOTIABLE)
Changes that affect scoring, round aggregation, or player statistics MUST be
covered by tests written before implementation. At minimum, tests MUST verify
totals and derived metrics: total strokes, total putts, average putts per hole,
birdies, pars, bogeys, double bogeys, and triple bogey plus counts.
Rationale: scoring regressions are hard to detect manually and costly to trust.

### IV. Auth and Data Ownership Boundaries
Google OAuth authentication via Auth.js MUST gate all score and stats access.
Users MUST only be able to read, update, and delete their own rounds; cross-user
access is prohibited by default. Data modification paths MUST enforce ownership
checks server-side.
Rationale: personal scoring history is user data and must be isolated.

### V. Keep It Simple, Typed, and Observable
Implementation MUST use the approved stack (TypeScript, Next.js, Tailwind CSS,
shadcn/ui, Prisma, Auth.js, MySQL) unless this constitution is amended. Domain
logic for score calculations MUST be centralized in typed services and MUST emit
structured logs for round create/update/delete operations and auth failures.
Rationale: consistency improves maintainability and debuggability.

## Product Constraints

- The product scope is a scorekeeper for the Hadden Hill six-hole par-three
	course with repeat-loop rounds (6, 12, 18 holes).
- Hole-level tracking MUST include strokes, penalties, bunkers, putts, and green
	in regulation.
- Round-level tracking MUST include date, hole count, total strokes, total putts,
	average putts per hole, and score outcome counts (birdie through triple bogey
	plus).
- Users MUST be able to view round history, see aggregate personal stats, and
	delete rounds from their own history.

## Delivery Workflow and Quality Gates

- Specs, plans, and tasks MUST include explicit checks for repeating six-hole
	logic and stats aggregation correctness.
- Pull requests MUST include evidence of automated tests for any changed scoring,
	stats, or ownership logic.
- Any schema change affecting rounds or hole events MUST include migration notes
	and backfill or compatibility considerations.
- Release readiness requires successful auth flow verification, ownership
	authorization checks, and mobile viewport validation for in-round entry flows.

## Governance

This constitution supersedes conflicting project habits and guidance. Amendments
require a documented proposal, impact analysis, and approval from project
maintainers. Versioning policy is semantic: MAJOR for incompatible governance
changes or principle removals/redefinitions, MINOR for new principles/sections
or materially expanded guidance, PATCH for clarifications and wording-only
improvements. Compliance review is required at plan review and pull request
review; violations MUST be tracked with explicit remediation tasks before merge.

**Version**: 1.0.0 | **Ratified**: 2026-05-20 | **Last Amended**: 2026-05-20
