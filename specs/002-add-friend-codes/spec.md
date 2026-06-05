# Feature Specification: Friend Connections by Code

**Feature Branch**: `[002-add-friend-codes]`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Allow users to add each other as friends using friend codes. Friends are able to see each others statistics and previous rounds, and names, but no email addresses."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add A Friend Using A Code (Priority: P1)

As a signed-in user, I can connect with another user by entering their friend code so we can become friends without sharing private contact details.

**Why this priority**: Friend creation is the foundation for every other social visibility capability in this feature.

**Independent Test**: With two existing user accounts, share one account's friend code, submit it from the other account, and confirm both accounts show each other as friends.

**Acceptance Scenarios**:

1. **Given** two signed-in users with valid accounts, **When** one user enters the other user's friend code and confirms, **Then** a friendship connection is created between those two users.
2. **Given** a user enters an invalid or non-existent friend code, **When** they submit the request, **Then** no friendship is created and they receive a clear failure message.
3. **Given** users are already friends, **When** one user submits the same friend's code again, **Then** no duplicate friendship is created and the user is informed they are already connected.

---

### User Story 2 - View Friend Stats And Round History (Priority: P2)

As a user with friends, I can view each friend's display name, statistics, and previous rounds so I can compare performance and follow progress over time.

**Why this priority**: Visibility into friend performance is the primary value delivered after connections are created.

**Independent Test**: Create a friendship, then open the friend's shared profile/history views and confirm round history and stats are visible for friends only.

**Acceptance Scenarios**:

1. **Given** two users are friends, **When** one user opens the other user's shared profile view, **Then** they can see the friend's display name, statistics summary, and previous rounds.
2. **Given** two users are not friends, **When** one user attempts to access the other's shared stats or rounds, **Then** access is denied.

---

### User Story 3 - Preserve Privacy While Sharing (Priority: P3)

As a user, I can share gameplay information with friends while keeping my email address private so I can participate socially without exposing sensitive identity data.

**Why this priority**: Privacy protection is essential for trust and safe social participation.

**Independent Test**: View all friend-facing pages and friend data payloads and confirm no email addresses are shown or exposed for any user.

**Acceptance Scenarios**:

1. **Given** users are friends, **When** one user views the other's shared information, **Then** only approved fields are shown (name, statistics, previous rounds) and no email address is displayed.
2. **Given** any user or friend list view is loaded, **When** user identity details are returned, **Then** email addresses are excluded from all friend-facing data.

### Edge Cases

- What happens when a user attempts to add their own friend code?
- How does the system behave if two users try to add each other at nearly the same time?
- What happens when a user with no completed rounds is viewed by a friend?
- How does the system handle friendship visibility immediately after one account is deleted or deactivated?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide each eligible user with a unique friend code that can be shared with other users.
- **FR-002**: The system MUST allow a signed-in user to add another user as a friend by submitting a valid friend code.
- **FR-003**: The system MUST prevent users from adding themselves as friends.
- **FR-004**: The system MUST prevent duplicate friendship records between the same two users.
- **FR-005**: The system MUST confirm to both users when a friendship has been successfully established.
- **FR-006**: The system MUST allow a user to view a friend's display name.
- **FR-007**: The system MUST allow a user to view a friend's statistics summary after friendship is established.
- **FR-008**: The system MUST allow a user to view a friend's previous rounds after friendship is established.
- **FR-009**: The system MUST deny access to friend-only statistics and round history when users are not in a friendship relationship.
- **FR-010**: The system MUST exclude email addresses from all friend-facing views and shared data for this feature.
- **FR-011**: The system MUST provide clear error feedback when a friend code is invalid, unavailable, or cannot be used.
- **FR-012**: The system MUST keep friendship-based sharing read-only for friend viewers (view access only).

### Key Entities *(include if feature involves data)*

- **Friend Code**: A user-shareable identifier that uniquely maps to one user account for connection purposes.
- **Friendship**: A relationship between two user accounts that grants reciprocal visibility to approved shared data.
- **Shared Friend Profile**: Friend-visible identity and performance information including display name, statistics summary, and previous rounds, excluding private contact fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users who have a valid friend code can complete a successful friend connection in under 60 seconds.
- **SC-002**: 100% of attempted friend-only data access by non-friends is blocked during validation testing.
- **SC-003**: 100% of friend-facing screens and responses exclude email addresses during privacy verification testing.
- **SC-004**: At least 90% of users in post-release feedback indicate it is easy to add friends and view friend performance.

## Assumptions

- Existing authenticated user accounts and display names are already available and remain the identity basis for this feature.
- Friendship is mutual once created and grants the same visibility rights to both users.
- This feature does not include direct messaging, comments, likes, or leaderboard ranking.
- If a friend has no completed rounds yet, their profile remains visible with empty-state statistics/history messaging.