# Data Model: Hadden Hill Scorekeeping App

## Entity: User

- Purpose: Authenticated golfer account identity.
- Fields:
  - id (string, primary key)
  - email (string, unique)
  - name (string, nullable)
  - imageUrl (string, nullable)
  - createdAt (datetime)
  - updatedAt (datetime)
- Relationships:
  - One-to-many with Round

## Entity: CourseHoleDefinition

- Purpose: Canonical hole reference for the six-hole course.
- Fields:
  - id (int, primary key, 1-6)
  - lengthYards (int)
  - strokeIndex (int, unique in 1-6)
  - par (int, default 3)
- Relationships:
  - Referenced by HoleEntry.baseHoleId
- Validation rules:
  - Exactly six rows are maintained.
  - strokeIndex range must be 1-6.

## Entity: Round

- Purpose: User scorekeeping session for 6/12/18 holes.
- Fields:
  - id (string, primary key)
  - userId (string, foreign key -> User.id)
  - playedOn (date)
  - targetHoleCount (int, allowed: 6, 12, 18)
  - status (enum: IN_PROGRESS, COMPLETED)
  - completedAt (datetime, nullable)
  - totalStrokes (int, derived/cache)
  - totalPutts (int, derived/cache)
  - averagePuttsPerHole (decimal, derived/cache)
  - totalBirdies (int, derived/cache)
  - totalPars (int, derived/cache)
  - totalBogeys (int, derived/cache)
  - totalDoubleBogeys (int, derived/cache)
  - totalTripleBogeyPlus (int, derived/cache)
  - createdAt (datetime)
  - updatedAt (datetime)
- Relationships:
  - One-to-many with HoleEntry
- Validation rules:
  - targetHoleCount must be one of 6/12/18.
  - COMPLETED rounds must have hole entries count equal to targetHoleCount.

## Entity: HoleEntry

- Purpose: Per-hole scoring input inside a round.
- Fields:
  - id (string, primary key)
  - roundId (string, foreign key -> Round.id)
  - holeSequence (int, 1..targetHoleCount)
  - baseHoleId (int, foreign key -> CourseHoleDefinition.id)
  - strokes (int, >= 1)
  - penalties (int, >= 0)
  - bunkers (int, >= 0)
  - putts (int, >= 0)
  - greenInRegulation (boolean)
  - createdAt (datetime)
  - updatedAt (datetime)
- Relationships:
  - Many-to-one with Round
  - Many-to-one with CourseHoleDefinition
- Validation rules:
  - Unique constraint on (roundId, holeSequence).
  - baseHoleId is derived from loop mapping: ((holeSequence - 1) mod 6) + 1.

## Entity: UserStatsSnapshot (derived view)

- Purpose: Materialized or computed aggregate metrics for display.
- Fields:
  - userId
  - roundsPlayed
  - holesPlayed
  - totalStrokes
  - totalPutts
  - averagePuttsPerHole
  - totalBirdies
  - totalPars
  - totalBogeys
  - totalDoubleBogeys
  - totalTripleBogeyPlus
- Notes:
  - Can be computed on demand from completed rounds or cached and invalidated on
    round completion/deletion.

## State Transitions

### Round Lifecycle

1. IN_PROGRESS -> IN_PROGRESS
   - Trigger: save or update a hole entry.
   - Constraint: holeSequence within selected targetHoleCount.

2. IN_PROGRESS -> COMPLETED
   - Trigger: finalize round action or implicit completion once all holes are
     entered and user confirms completion.
   - Constraint: exactly targetHoleCount hole entries exist and derived metrics
     are computed.

3. COMPLETED -> COMPLETED
   - Trigger: read-only operations (history/stats retrieval).

4. COMPLETED -> DELETED (terminal)
   - Trigger: user deletes own round.
   - Constraint: authorized owner only; aggregate stats must be recalculated.
