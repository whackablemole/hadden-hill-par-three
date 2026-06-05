# Data Model: Friend Connections by Code

## Entity: User (extended)

- Purpose: Authenticated golfer account identity and friend-code owner.
- Existing fields (relevant):
  - id (string, primary key)
  - email (string, unique, private)
  - name (string, nullable)
- New field:
  - friendCode (string, unique, non-null after provisioning)
- Relationships:
  - One-to-many with Round (existing)
  - Many-to-many with User through Friendship (new)
- Validation rules:
  - friendCode must be globally unique.
  - email must never be projected in friend-facing payload DTOs.

## Entity: Friendship

- Purpose: Reciprocal sharing relationship between two users.
- Fields:
  - id (string, primary key)
  - userLowId (string, foreign key -> User.id)
  - userHighId (string, foreign key -> User.id)
  - createdAt (datetime)
- Relationships:
  - Many-to-one from userLowId to User
  - Many-to-one from userHighId to User
- Validation rules:
  - userLowId and userHighId must be different values.
  - Unique constraint on (userLowId, userHighId).
  - Pair ordering is canonical (lexicographically lower id stored in
    userLowId) to prevent duplicate inverse rows.

## Entity: FriendSharedProfile (derived view)

- Purpose: Friend-visible identity/performance aggregate without private fields.
- Fields:
  - friendUserId
  - displayName
  - overallStats (same metrics shape as owner overall stats endpoint)
  - previousRounds (same summary shape as owner history endpoint)
- Validation rules:
  - No email field present.
  - Access only allowed when requester has active friendship with friendUserId.

## State Transitions

### Friendship Lifecycle

1. NONE -> ACTIVE
   - Trigger: authenticated user submits valid friendCode for another account.
   - Constraint: cannot target self; canonical pair must not already exist.

2. ACTIVE -> ACTIVE (idempotent)
   - Trigger: duplicate add-friend attempt for existing pair.
   - Constraint: return success-equivalent or explicit duplicate message without
     creating additional rows.

3. ACTIVE -> INACCESSIBLE (derived access state)
   - Trigger: user account deletion/deactivation or friendship row removal in a
     future scope.
   - Constraint: all friend-scoped reads must fail authorization once inactive.