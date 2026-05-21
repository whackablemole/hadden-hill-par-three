# Tasks: Hadden Hill Scorekeeping App

**Input**: Design documents from `/specs/001-build-scorekeeper-app/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are intentionally omitted because explicit TDD/test-task generation was not requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline web app structure.

- [x] T001 Initialize Next.js App Router project scripts and dependencies in package.json
- [x] T002 Configure TypeScript and Next.js compiler options in tsconfig.json and next.config.ts
- [x] T003 [P] Configure Tailwind CSS and global styles in tailwind.config.ts and app/globals.css
- [x] T004 [P] Configure shadcn/ui project settings in components.json
- [x] T005 [P] Create environment variable template in .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Define Prisma entities and relations for User, Round, HoleEntry, and CourseHoleDefinition in prisma/schema.prisma
- [x] T007 Create initial database migration for scorekeeping schema in prisma/migrations/001_init_scorekeeping/migration.sql
- [x] T008 Seed canonical six-hole course definitions in prisma/seed.ts
- [x] T009 [P] Configure Auth.js Google provider and session strategy in lib/auth/config.ts
- [x] T010 [P] Create Auth.js route handler in app/api/auth/[...nextauth]/route.ts
- [x] T011 [P] Create shared Prisma client module in lib/db/prisma.ts
- [x] T012 Implement user ownership guard helpers for round resources in lib/rounds/ownership.ts
- [x] T013 Implement scoring and stat aggregation domain functions in lib/scoring/calculateRoundStats.ts
- [x] T014 Implement shared request payload validation schemas in lib/rounds/schemas.ts
- [x] T015 Configure structured round operation logging utilities in lib/observability/roundLogger.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Record A Round Live (Priority: P1) 🎯 MVP

**Goal**: Let authenticated users create and progress through 6/12/18-hole rounds with resilient live hole entry saves.

**Independent Test**: Start 6-hole, 12-hole, and 18-hole rounds; save hole entries; refresh mid-round; confirm previously entered values persist and round progression continues.

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement round creation API endpoint in app/api/rounds/route.ts
- [x] T017 [P] [US1] Implement round retrieval API endpoint in app/api/rounds/[roundId]/route.ts
- [x] T018 [P] [US1] Implement idempotent hole upsert API endpoint in app/api/rounds/[roundId]/holes/[holeSequence]/route.ts
- [x] T019 [US1] Implement round completion API endpoint in app/api/rounds/[roundId]/complete/route.ts
- [x] T020 [P] [US1] Build round start form component for target hole count/date in components/round-entry/StartRoundForm.tsx
- [x] T021 [P] [US1] Build mobile-first hole entry form component in components/round-entry/HoleEntryForm.tsx
- [x] T022 [P] [US1] Build in-round progress indicator component in components/round-entry/RoundProgress.tsx
- [x] T023 [US1] Build new-round page and create-round submit flow in app/rounds/new/page.tsx
- [x] T024 [US1] Build in-progress round page with live hole capture in app/rounds/[roundId]/page.tsx
- [x] T025 [US1] Implement client autosave and retry helper for hole entries in lib/rounds/saveHoleEntry.ts

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - View Round Results And Stats (Priority: P2)

**Goal**: Let users review completed round details, round history, and aggregated personal statistics.

**Independent Test**: Complete multiple rounds and confirm round summaries and overall stats match persisted scoring data.

### Implementation for User Story 2

- [x] T026 [P] [US2] Implement authenticated round history API endpoint in app/api/rounds/history/route.ts
- [x] T027 [P] [US2] Implement authenticated overall stats API endpoint in app/api/stats/overall/route.ts
- [x] T028 [P] [US2] Implement user stats aggregation query service in lib/rounds/getUserStatsSummary.ts
- [x] T029 [US2] Build round summary card component for metrics display in components/stats/RoundSummaryCard.tsx
- [x] T030 [US2] Build round history page for owned rounds in app/rounds/history/page.tsx
- [x] T031 [US2] Build overall stats page for aggregated metrics in app/stats/page.tsx
- [x] T032 [US2] Extend round detail page with completed-round metrics panel in app/rounds/[roundId]/page.tsx

**Checkpoint**: User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Manage Round History (Priority: P3)

**Goal**: Let users delete their own rounds and immediately reflect updated aggregate stats.

**Independent Test**: Delete one owned round from history and confirm it disappears and overall stats recalculate; verify non-owned round deletion remains blocked.

### Implementation for User Story 3

- [x] T033 [US3] Implement owned-round delete behavior in app/api/rounds/[roundId]/route.ts
- [x] T034 [P] [US3] Create reusable delete-round action component in components/stats/DeleteRoundButton.tsx
- [x] T035 [US3] Integrate delete action and optimistic UI update on history page in app/rounds/history/page.tsx
- [x] T036 [US3] Implement delete-and-refresh stats service in lib/rounds/deleteRoundAndRefreshStats.ts

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T037 [P] Document local setup, environment, and run steps in README.md
- [x] T038 Add quickstart execution command details to specs/001-build-scorekeeper-app/quickstart.md
- [x] T039 [P] Add response-time instrumentation for round create/save endpoints in app/api/rounds/route.ts and app/api/rounds/[roundId]/holes/[holeSequence]/route.ts
- [x] T040 Harden standardized auth and ownership error responses in app/api/rounds/[roundId]/route.ts and app/api/stats/overall/route.ts
- [x] T041 Record manual quickstart verification evidence in docs/verification.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP.
- **US2 (P2)**: Starts after Phase 2; depends on US1 data creation flow for meaningful output but remains independently testable with seeded data.
- **US3 (P3)**: Starts after Phase 2; integrates with US2 history view but remains independently testable via API and history UI.

### Within Each User Story

- API endpoints before UI integration.
- Shared services before pages/components that consume them.
- Complete and validate one story before proceeding to the next priority when staffing is limited.

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel.
- Foundational tasks T009/T010/T011 can run in parallel after schema decisions are settled.
- In US1, API endpoint tasks T016/T017/T018 and component tasks T020/T021/T022 can run in parallel.
- In US2, endpoint tasks T026/T027 and service task T028 can run in parallel.
- In US3, component task T034 can run in parallel with API task T033.

---

## Parallel Example: User Story 1

```bash
Task: "T016 [US1] Implement round creation API endpoint in app/api/rounds/route.ts"
Task: "T017 [US1] Implement round retrieval API endpoint in app/api/rounds/[roundId]/route.ts"
Task: "T018 [US1] Implement idempotent hole upsert API endpoint in app/api/rounds/[roundId]/holes/[holeSequence]/route.ts"

Task: "T020 [US1] Build round start form component in components/round-entry/StartRoundForm.tsx"
Task: "T021 [US1] Build hole entry form component in components/round-entry/HoleEntryForm.tsx"
Task: "T022 [US1] Build in-round progress indicator in components/round-entry/RoundProgress.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "T026 [US2] Implement round history API endpoint in app/api/rounds/history/route.ts"
Task: "T027 [US2] Implement overall stats API endpoint in app/api/stats/overall/route.ts"
Task: "T028 [US2] Implement stats aggregation service in lib/rounds/getUserStatsSummary.ts"
```

---

## Parallel Example: User Story 3

```bash
Task: "T033 [US3] Implement owned-round delete behavior in app/api/rounds/[roundId]/route.ts"
Task: "T034 [US3] Create reusable delete-round action component in components/stats/DeleteRoundButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 tasks (Phase 3).
3. Validate live round creation and resilient hole save flows.
4. Demo/deploy MVP.

### Incremental Delivery

1. Deliver MVP with US1.
2. Add US2 for round review and overall stats.
3. Add US3 for round deletion and stats refresh.
4. Apply cross-cutting polish and verification artifacts.

### Parallel Team Strategy

1. Team completes Setup and Foundational phases together.
2. After Phase 2:
   - Engineer A leads US1 pages/components.
   - Engineer B leads US1/US2 API and service layers.
   - Engineer C leads stats/history UI and US3 delete UX.
3. Merge by story checkpoints in priority order.

---

## Notes

- All tasks follow strict checklist format: `- [x] T### [P] [US#] Description with file path`.
- [Story] labels are used only in user-story phases.
- [P] tasks are scoped to distinct files to minimize merge conflicts.
