## Unit Tests

Run from the project root:

```bash
PYTHONPATH=Backend python manage.py test users
```

| Function | Tests |
|---|---|
| `login` | Successful login, wrong password |
| `register` | Successful registration, duplicate email |
| `logout` | Successful logout, missing refresh token |
| `get_my_profile` | Fetching the user's profile |
| `update_profile` | Awards 20 points when the profile becomes complete |
| `add_points` | Known event, unknown event |

### Test code

#### 1. Helpers and authentication tests

![Auth tests]
<img width="1106" height="1092" alt="١" src="https://github.com/user-attachments/assets/e2d724f6-af60-4145-a5b4-7cd50b4d651e" />



This part contains two helper functions and the authentication tests:
- `valid_skill_level()` reads a valid value for `skill_level` from the `Profile` model, so the tests don't depend on a hardcoded value.
- `post()` builds a JSON request and optionally authenticates it as a given user.
- `AuthTests` covers `login`, `register`, and `logout`, including success cases and error cases (wrong password, duplicate email).

#### 2. Profile and points tests

![Profile and points tests]
<img width="1077" height="1120" alt="٢" src="https://github.com/user-attachments/assets/feb8929c-763a-4098-be24-280ca779c031" />


This part covers the logout error case, the profile, and the points system:
- `test_logout_missing_token` checks that logout returns `400` when no refresh token is sent.
- `ProfileTests` checks that the profile is returned and that completing it (bio and skill level) awards 20 points.
- `AddPointsTests` checks that `match_win` gives 50 points and that an unknown event gives 0.

## Integration Tests

Run from the project root:

```bash
PYTHONPATH=Backend python manage.py test integration_tests
```

These tests check that the frontend, the backend APIs and the database work together. Each test sends the same requests the React pages send (same URLs, same data, real login tokens) and checks what is saved in the database. Moyasar payments are mocked, so no real payment is made.

| Test class | What it checks |
|---|---|
| `MatchJourneyTests` | Full journey: sign up, log in, create match, host pays, browse, join, players pay. The host must pay before the match opens, only the host can confirm, unpaid reservations expire and free the venue slot |
| `PaymentWindowTests` | Players keep their spot until the match is full, then have 5 minutes to pay. Unpaid players lose their spot, and leaving a full match closes the payment window |
| `OpponentResultTests` | Match with an opponent, submit result, opponents leaderboard, challenge progress and badge |
| `InvitationTests` | Host invites a player, the player accepts and joins the match |
| `AuthTests` | Invalid token returns `401`, browsing works without logging in, logout |

### Integration bugs found and fixed

| Bug | Fix |
|---|---|
| A match could be opened without the host paying | `confirm-payment` now checks the host's payment first |
| Unpaid reservations never expired and blocked the venue slot | They are cancelled after 5 minutes |
| Creating a match with an opponent always failed | The opponent can be added while the match waits for host payment |
| Players were removed 5 minutes after joining, before they could pay | The 5-minute payment window now starts when the match becomes full |

### API Testing (Postman)

Each backend feature was tested in Postman. The screenshots are in the pull requests:

| Feature | Pull request |
|---|---|
| Join or Leave a Match | [#24](https://github.com/rywma/Wesal/pull/24) |
| Cost Splitting & Payment Status | [#25](https://github.com/rywma/Wesal/pull/25) |
| Invite Players | [#40](https://github.com/rywma/Wesal/pull/40) |
| Payment Simulation (Moyasar) | [#41](https://github.com/rywma/Wesal/pull/41) |
| Admin Venue Requests | [#64](https://github.com/rywma/Wesal/pull/64) |

## Project Links

| Item | Link |
|---|---|
| Sprint Planning | [SPRINTS.md](SPRINTS.md#sprint-planning) |
| Sprint Reviews | [SPRINTS.md](SPRINTS.md#sprint-reviews) |
| Retrospectives | [SPRINTS.md](SPRINTS.md#retrospectives) |
| Source Repository | [github.com/rywma/Wesal](https://github.com/rywma/Wesal.git) |
| Bug Tracking | [Pull requests](https://github.com/rywma/Wesal/pulls?q=is%3Apr), [Integration bugs fixed](#integration-bugs-found-and-fixed) |
| Testing Evidence and Results | [Unit Tests](#unit-tests), [Integration Tests](#integration-tests), [API Testing](#api-testing-postman) |
| Production Environment | [wesal-frontend.onrender.com](https://wesal-frontend.onrender.com) |
