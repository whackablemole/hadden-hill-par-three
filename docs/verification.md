# Manual Verification Log

## Feature

Hadden Hill Scorekeeping App (`001-build-scorekeeper-app`)

## Verification Steps

1. Sign in with Google account.
2. Start a 6-hole round and save at least two holes.
3. Refresh the round details page and confirm saved holes remain.
4. Complete all holes and finalize the round.
5. Confirm completed round metrics are displayed.
6. Create and complete an additional 12-hole round.
7. Open overall stats and verify totals include both rounds.
8. Open round history and delete one round.
9. Confirm history list and overall stats refresh.
10. Attempt access to a round not owned by the current account and confirm denial.

## Results

- Pending execution.

---

## Feature

Friend Connections by Code (`002-add-friend-codes`)

## Verification Steps

1. Run schema/type generation for updated Prisma models.
2. Run lint checks for new friend routes, pages, and services.
3. Run production build for type-safe compile validation.
4. Manually verify friend-only payload contracts exclude email fields.
5. Attempt automated unit test execution.

## Results

- `npm run prisma:generate`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- Contract review for friend payload schemas (`FriendSummary`, `FriendProfile`, `RoundSummary`, `UserStatsSummary`) confirms no email fields: PASS
- `npm run test`: BLOCKED (no test files present in repository)
- Interactive quickstart scenarios requiring Google OAuth sign-in with two accounts were not executable in this headless session and remain pending manual verification.
