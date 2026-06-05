# Tasks: Friend Connections by Code

**Input**: Design documents from `/specs/002-add-friend-codes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are intentionally omitted because explicit TDD or test-task generation was not requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare friend-feature scaffolding and shared entry points.

- [x] T001 Create friends feature directories and shared exports in lib/friends/index.ts and components/friends/index.ts
- [x] T002 [P] Add friends navigation route entry and icon wiring in components/navigation/MobileFooterNav.tsx
- [x] T003 [P] Add friends breadcrumb mapping in components/navigation/AppBreadcrumbs.tsx
- [x] T004 Document friend-code local setup notes in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and authorization infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Extend user schema with unique friendCode and add Friendship model in prisma/schema.prisma
- [x] T006 Create migration for friendCode and Friendship constraints in prisma/migrations/002_add_friend_codes_and_friendships/migration.sql
- [x] T007 Implement friend code generation and normalization helpers in lib/friends/codes.ts
- [x] T008 Implement canonical friendship pair creation and lookup helpers in lib/friends/friendships.ts
- [x] T009 Implement friendship authorization guard helpers in lib/friends/permissions.ts
- [x] T010 Define friend API request/response validation schemas in lib/friends/schemas.ts
- [x] T011 Extend authenticated user bootstrap to provision friendCode in lib/rounds/ownership.ts
- [x] T012 Add shared friend endpoint response/error helpers in lib/friends/http.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Add A Friend Using A Code (Priority: P1) 🎯 MVP

**Goal**: Let authenticated users add each other using friend codes and see connected friends.

**Independent Test**: With two accounts, retrieve one user friend code, submit it from the second user, and confirm the friendship appears for both users without duplicate creation.

### Implementation for User Story 1

- [x] T013 [P] [US1] Implement authenticated friend code retrieval endpoint in app/api/friends/code/route.ts
- [x] T014 [US1] Implement friend list and add-friend-by-code handlers in app/api/friends/route.ts
- [x] T015 [P] [US1] Build add-friend-by-code form and validation UX in components/friends/AddFriendByCodeForm.tsx
- [x] T016 [P] [US1] Build connected friends list component in components/friends/FriendsList.tsx
- [x] T017 [US1] Build friends landing page integrating code display, add form, and friend list in app/friends/page.tsx
- [x] T018 [US1] Implement invalid-code, self-add, and duplicate-add user feedback mapping in app/friends/page.tsx and lib/friends/http.ts

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - View Friend Stats And Round History (Priority: P2)

**Goal**: Let users view a friend's display name, overall stats, and previous rounds after friendship is established.

**Independent Test**: Create or seed one friendship and verify friend profile, overall stats, and rounds history endpoints/pages return data for friends and deny non-friends.

### Implementation for User Story 2

- [x] T019 [P] [US2] Implement friend profile endpoint with friendship check in app/api/friends/[friendUserId]/profile/route.ts
- [x] T020 [P] [US2] Implement friend overall stats endpoint with friendship check in app/api/friends/[friendUserId]/stats/overall/route.ts
- [x] T021 [P] [US2] Implement friend rounds history endpoint with friendship check in app/api/friends/[friendUserId]/rounds/history/route.ts
- [x] T022 [P] [US2] Build friend stats summary component in components/friends/FriendStatsPanel.tsx
- [x] T023 [P] [US2] Build friend rounds history component in components/friends/FriendRoundsHistory.tsx
- [x] T024 [US2] Build friend detail page integrating profile, stats, and round history in app/friends/[friendUserId]/page.tsx
- [x] T025 [US2] Add friend detail navigation links from friends list in components/friends/FriendsList.tsx

**Checkpoint**: User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Preserve Privacy While Sharing (Priority: P3)

**Goal**: Ensure friend sharing never exposes email addresses and handles blocked access safely.

**Independent Test**: Inspect friend-facing API responses and UI payloads for all friend views and verify only approved fields are present and non-friend access is blocked.

### Implementation for User Story 3

- [x] T026 [US3] Implement strict privacy-safe projection helpers for friend-facing DTOs in lib/friends/projections.ts
- [x] T027 [US3] Update friend API routes to use projection helpers and exclude email fields in app/api/friends/route.ts and app/api/friends/[friendUserId]/profile/route.ts
- [x] T028 [US3] Update friend stats and history endpoints to return projection-safe payloads in app/api/friends/[friendUserId]/stats/overall/route.ts and app/api/friends/[friendUserId]/rounds/history/route.ts
- [x] T029 [P] [US3] Implement explicit non-friend and missing-user access states in components/friends/FriendAccessState.tsx
- [x] T030 [US3] Integrate privacy-safe view models and access-state handling in app/friends/[friendUserId]/page.tsx
- [x] T031 [US3] Tighten contract schemas to document friend-visible fields only in specs/002-add-friend-codes/contracts/friend-sharing-api.yaml

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T032 [P] Add structured logs for friend-link create and friend-access denial events in app/api/friends/route.ts and app/api/friends/[friendUserId]/profile/route.ts
- [x] T033 [P] Document friend privacy verification and manual checks in docs/verification.md
- [x] T034 Run end-to-end quickstart walkthrough for friend flows and record outcomes in specs/002-add-friend-codes/quickstart.md and docs/verification.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) and uses friendships created in US1 (or seeded data) while remaining independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) and hardens US1/US2 shared-data behavior

### Within Each User Story

- API/data handlers before page integration
- Shared projection and permission utilities before route wiring
- Core flow implementation before UX/error polish
- Complete and verify each story independently before advancing priority

### Parallel Opportunities

- Setup tasks T002 and T003 can run in parallel
- Foundational tasks T007, T008, T009, and T010 can run in parallel after schema decisions
- US1 component tasks T015 and T016 can run in parallel
- US2 endpoint tasks T019, T020, and T021 can run in parallel
- US2 UI component tasks T022 and T023 can run in parallel
- US3 access-state task T029 can run in parallel with endpoint projection tasks

---

## Parallel Example: User Story 1

```bash
Task: "T015 [US1] Build add-friend-by-code form and validation UX in components/friends/AddFriendByCodeForm.tsx"
Task: "T016 [US1] Build connected friends list component in components/friends/FriendsList.tsx"
Task: "T013 [US1] Implement authenticated friend code retrieval endpoint in app/api/friends/code/route.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] Implement friend profile endpoint with friendship check in app/api/friends/[friendUserId]/profile/route.ts"
Task: "T020 [US2] Implement friend overall stats endpoint with friendship check in app/api/friends/[friendUserId]/stats/overall/route.ts"
Task: "T021 [US2] Implement friend rounds history endpoint with friendship check in app/api/friends/[friendUserId]/rounds/history/route.ts"
```

---

## Parallel Example: User Story 3

```bash
Task: "T026 [US3] Implement strict privacy-safe projection helpers for friend-facing DTOs in lib/friends/projections.ts"
Task: "T029 [US3] Implement explicit non-friend and missing-user access states in components/friends/FriendAccessState.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm friend-code add flow works end-to-end
5. Demo/deploy MVP increment

### Incremental Delivery

1. Deliver MVP with US1 friend linking
2. Add US2 friend profile/stats/history visibility
3. Add US3 privacy hardening and access-state handling
4. Finish with cross-cutting logging and verification artifacts

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational completion:
   - Developer A: US1 page/components and UX feedback
   - Developer B: US2 friend API endpoints
   - Developer C: US2/US3 friend detail UI and privacy states
3. Merge and validate by story checkpoints in priority order

---

## Notes

- All tasks follow strict checklist format: `- [ ] T### [P] [US#] Description with file path`
- [Story] labels are used only for user-story phases
- [P] tasks are scoped to independent files where possible
- Each user story remains independently testable with its own acceptance criteria