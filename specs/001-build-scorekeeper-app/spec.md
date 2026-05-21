# Feature Specification: Hadden Hill Scorekeeping App

**Feature Branch**: `001-build-scorekeeper-app`

**Created**: 2026-05-20

**Status**: Draft

**Input**: User description: "Build the scorekeeping app in line with the requirements in the requirements file."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record A Round Live (Priority: P1)

As a golfer, I can start a round and enter hole-by-hole results while walking the course so I do not lose scoring details.

**Why this priority**: Live score entry is the core value of the product and enables all downstream stats and history.

**Independent Test**: Start a 6-hole, 12-hole, and 18-hole round; enter values for each played hole; confirm progress and totals persist after page refresh and can be completed without re-entering prior holes.

**Acceptance Scenarios**:

1. **Given** a signed-in user starts a new 6-hole round, **When** they save values for each hole, **Then** each hole record is stored and visible in the in-progress round.
2. **Given** a signed-in user is midway through a round, **When** they refresh or briefly lose connection and reopen the app, **Then** previously saved hole entries remain and the round can continue.
3. **Given** a signed-in user chooses a 12-hole or 18-hole round, **When** they enter results across repeated six-hole loops, **Then** the app tracks all selected holes and computes round totals correctly.

---

### User Story 2 - View Round Results And Stats (Priority: P2)

As a golfer, I can review my completed round and personal aggregate stats so I can understand my performance over time.

**Why this priority**: The app must provide feedback and learning value after entry, otherwise score capture has limited utility.

**Independent Test**: Complete at least three rounds and verify per-round metrics and aggregate personal metrics are displayed and match the entered hole data.

**Acceptance Scenarios**:

1. **Given** a user completes a round, **When** they view round details, **Then** they see date, hole count, total strokes, total putts, average putts per hole, and score outcome counts.
2. **Given** a user has multiple completed rounds, **When** they open their overall stats view, **Then** totals and summary metrics reflect all of their saved rounds only.

---

### User Story 3 - Manage Round History (Priority: P3)

As a golfer, I can remove unwanted rounds from my history so my records stay accurate.

**Why this priority**: History management is important but secondary to capturing and viewing round performance.

**Independent Test**: Delete a selected round and confirm it is removed from history and recalculated aggregate stats.

**Acceptance Scenarios**:

1. **Given** a user views their history, **When** they delete one round, **Then** that round no longer appears and aggregate stats update accordingly.
2. **Given** a user attempts to remove another user's round identifier, **When** the delete action is submitted, **Then** the request is denied and no data is changed.

### Edge Cases

- What happens when a user starts a round but only records part of the holes and leaves without completing it?
- How does the system handle duplicate save submissions for the same hole caused by unstable mobile connectivity?
- What happens when users enter extreme but valid hole scores (for example, very high stroke counts) that impact bogey category calculations?
- How does the system behave if a user changes selected round length before any hole is recorded versus after holes are already saved?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to authenticate with their Google account before accessing scorekeeping features.
- **FR-002**: The system MUST create and track rounds of 6, 12, or 18 holes.
- **FR-003**: The system MUST use a fixed six-hole course definition containing hole number, hole length in yards, and stroke index for holes 1 through 6.
- **FR-004**: The system MUST support repeated six-hole loops when users play 12 or 18 holes.
- **FR-005**: For each played hole, the system MUST allow users to record strokes, penalties, bunkers, putts, and green-in-regulation status.
- **FR-006**: The system MUST save hole updates during an in-progress round so users can continue without losing prior entries.
- **FR-007**: The system MUST calculate and display per-round metrics: total strokes, total putts, average putts per hole, total birdies, total pars, total bogeys, total double bogeys, and total triple bogey-plus results.
- **FR-008**: The system MUST store the round date and selected round hole count for each saved round.
- **FR-009**: The system MUST provide a round-history view listing a user's saved rounds.
- **FR-010**: The system MUST provide an overall-stats view that aggregates metrics across all rounds owned by the signed-in user.
- **FR-011**: The system MUST allow users to delete rounds from their own history.
- **FR-012**: The system MUST prevent users from viewing, editing, or deleting rounds that they do not own.
- **FR-013**: The system MUST preserve data consistency when save requests are retried or submitted multiple times for the same hole entry.

### Key Entities *(include if feature involves data)*

- **Course Hole Definition**: Immutable reference data for holes 1-6, including hole number, length (yards), and stroke index.
- **Round**: A user's scorekeeping session with date, selected length (6/12/18), status (in-progress/completed), and derived totals.
- **Hole Entry**: Per-hole scoring record inside a round, including sequence position, mapped base hole number, strokes, penalties, bunkers, putts, and green-in-regulation flag.
- **User Statistics Summary**: Aggregated metrics across all rounds owned by one user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can start and save the first hole of a round in under 30 seconds.
- **SC-002**: 99% of saved hole updates are reflected in the in-progress round view within 2 seconds.
- **SC-003**: For a controlled validation dataset, 100% of round-level and aggregate stat calculations match expected results.
- **SC-004**: 95% of users complete a full 6-hole round entry flow without abandoning the session.
- **SC-005**: 100% of unauthorized cross-user access attempts to round data are blocked.

## Assumptions

- Only the Hadden Hill six-hole par-three course is in scope for this feature; editing course layout is out of scope.
- Users have an internet connection during live scoring, but temporary interruptions may occur and must not lose previously saved entries.
- Aggregate stats are calculated from persisted round data owned by the current user.
- Social features, leaderboards, and multi-user shared rounds are out of scope.
