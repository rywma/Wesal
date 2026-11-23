# Wesal — Stage 4: MVP Development

Stage 4 focuses on building and integrating Wesal's Minimum Viable Product (MVP). During this stage, we developed the core features, connected the frontend and backend, and tested the application to prepare it for the final demo.


## Table of Contents

- [0. Plan and Define Sprints](#0-plan-and-define-sprints)
- [1. Execute Development Tasks](#1-execute-development-tasks)
- [Sprint Reviews](#sprint-reviews)
- [Retrospectives](#retrospectives)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Project Links](#project-links)

## 0. Plan and Define Sprints

We started by reviewing the user stories from Stage 3, prioritizing the features using the MoSCoW method, and dividing the development work into three sprints.

### 0.1 User Stories

The user stories describe the main features users need from Wesal. We used them as the foundation for planning and implementing the MVP.

| # | User Story | Description |
|---|---|---|
| 1 | Account Creation & Login | As a new user, I want to create an account and log in so that I can access the platform features. |
| 2 | Browse & Filter Matches | As a player, I want to browse matches and filter by sport, date, and location so that I can find a suitable match. |
| 3 | View Match Details | As a player, I want to view match information and available spots so that I can decide whether to join. |
| 4 | Join or Leave a Match | As a player, I want to join or leave matches so that I can participate without organizing a game. |
| 5 | Create a Match | As a host, I want to create a match with its details so that other players can join. |
| 6 | Cost Splitting | As a host, I want the total cost to be divided among players so that everyone pays their share. |
| 7 | Payment Status | As a player, I want to complete a test payment and view my payment status so that I know my spot is confirmed. |
| 8 | Invite Players | As a host, I want to invite players to my match so that I can fill available spots. |
| 9 | Manage Match | As a host, I want to manage or cancel my match so that I can handle changes. |
| 10 | Track Payments | As a host, I want to view players' payment statuses so that I can track payments. |
| 11 | Profile Setup | As a player, I want to set up my profile so that other players can learn about me. |
| 12 | Rankings & Leaderboards | As a player, I want to view rankings and points so that I can track my progress. |

### 0.2 MoSCoW Prioritization

We used the MoSCoW method to organize our features based on their importance to the MVP.

| Priority | Features |
|---|---|
| Must Have | Authentication, Browse & Filter Matches, Match Details, Join/Leave, Create Match, Cost Splitting, Payment Status |
| Should Have | Invite Players, Manage Match, Track Payments |
| Could Have | Profile Setup, Rankings & Leaderboards |
| Won't Have | Public Challenges, In-app Chat, AI Recommendations, Social Features, Real Payment Processing |

These priorities were initially defined in Stage 3. During Stage 4, we revisited them based on our progress and available development time. Some features originally classified as Could Have or Won't Have were implemented as part of the MVP.

Real payment processing remained out of scope, so we used Moyasar test mode to simulate payments.

### 0.3 Breaking Down User Stories into Development Tasks

After prioritizing the features, we divided the user stories into smaller development tasks.

This allowed us to work on the frontend, backend, and integration separately while keeping the same feature goals.

| User Story | Development Tasks |
|---|---|
| Authentication | Create authentication APIs, build Login and Signup pages, integrate JWT authentication |
| Browse & Filter Matches | Create the matches API, build the browse page, implement filters, connect frontend and backend |
| Create a Match | Build the creation form and API, validate match details, integrate host payment |
| Join or Leave a Match | Create join/leave endpoints, implement UI interactions, update available spots |
| Payment Status | Integrate Moyasar test payments, display payment status, implement payment countdown |
| Manage Match | Build match management UI, connect cancellation API, handle cancelled matches |
| Profile & Rankings | Implement profile features, points, rankings, and badges |

### 0.4 Sprint Planning

We divided Stage 4 into three two-week sprints, each focusing on a different part of Wesal's development. This helped us organize our work, track progress, and gradually build the MVP.

#### Sprint 1: Project Setup & Authentication (11–24 October 2026)

The first sprint focused on setting up the project and building its foundation. We initialized the React frontend and Django backend, configured the PostgreSQL database using Supabase, and deployed the application on Render.

We also worked on user authentication, including registration, login, logout, and JWT integration. On the frontend, we built the initial Home, Login, and Signup pages.

By the end of this sprint, we had the basic project structure ready and users could create accounts and log in.

#### Sprint 2: Core Features Development (25 October – 7 November 2026)

The second sprint focused on developing Wesal's main features. We implemented match creation, browsing and filtering matches, viewing match details, and joining or leaving matches.

We also worked on cost splitting, payment status, invitations, and payment integration using Moyasar test mode. During this sprint, we started connecting the frontend pages with backend APIs to make the features functional.

Some integrations, including My Matches and Manage Match, were carried forward to the next sprint.

#### Sprint 3: Feature Improvements, Integration & Testing (8–21 November 2026)

The final sprint focused on completing integrations, improving existing features, and preparing the MVP for the final demo.

We worked on preventing double bookings, integrating My Matches and match management, and implementing the host payment flow with a countdown timer.

We also worked on profiles, points, leaderboards, challenges, badges, and venue requests. Some of these features were already planned in earlier stages, while others were added or reprioritized during development.

The team focused on fixing bugs, testing frontend-backend interactions, and improving the overall user experience based on mentor feedback.

By the end of this sprint, the main user journeys were implemented and the project had progressed toward a fully integrated MVP.

---



## 1. Execute Development Tasks

During Stage 4, we implemented Wesal's core features using React for the frontend and Django for the backend.

We worked on the frontend and backend in parallel, integrating features as their APIs became available. We also used Git and GitHub to manage code changes and collaborate throughout development.

### 1.1 Core Feature Implementation

We developed the main features required for the MVP, starting with authentication and match management, then moving to payments and additional features.

| Feature | Implementation |
|---|---|
| Authentication | Implemented registration, login, logout, and JWT authentication |
| Browse Matches | Built match browsing with sport, date, and location filters |
| Create Match | Implemented match creation and booking validation |
| Match Details | Displayed match information, available spots, and player actions |
| Join & Leave | Connected join and leave functionality to backend APIs |
| Payment Integration | Integrated Moyasar test payments and payment status |
| Host Payment Flow | Added host payment after match creation with a countdown timer |
| My Matches | Connected the page to the backend to display hosted and joined matches |
| Match Management | Added match cancellation and status handling |
| Additional Features | Implemented profiles, points, leaderboards, challenges, badge levels, and venue requests |

### 1.2 Version Control with Git & GitHub

We used Git and GitHub to organize our work and track changes throughout development.

Instead of making changes directly to `main`, we created separate branches for features and fixes.

Examples of feature branches:

- `feature/browse-integration`
- `feature/my-matches-integration`
- `feature/host-payment-flow`

This allowed us to develop different features independently and integrate them into the main project.

### 1.3 Pull Requests & Code Reviews

After completing a development task, we pushed the changes to GitHub and opened a Pull Request.

Our workflow included:

1. Creating a branch for the assigned task.
2. Implementing the feature or fix.
3. Testing the changes locally.
4. Committing and pushing the code.
5. Opening a Pull Request to `main`.
6. Checking the changes and addressing issues when needed.
7. Merging the Pull Request.

Pull Requests helped us track implementation progress, review code changes, and keep the development history organized.

### 1.4 Development Evidence

The following Pull Requests show examples of features implemented during Stage 4.

| Feature | Pull Request |
|---|---|
| Authentication Integration | [PR #21](https://github.com/rywma/Wesal/pull/21) |
| Create Match API | [PR #23](https://github.com/rywma/Wesal/pull/23) |
| Join/Leave Match API | [PR #24](https://github.com/rywma/Wesal/pull/24) |
| Browse Matches Integration | [PR #33](https://github.com/rywma/Wesal/pull/33) |
| Payment Integration | [PR #38](https://github.com/rywma/Wesal/pull/38) |
| My Matches Integration | [PR #46](https://github.com/rywma/Wesal/pull/46) |
| Manage Match Integration | [PR #47](https://github.com/rywma/Wesal/pull/47) |
| Host Payment & Countdown | [PR #52](https://github.com/rywma/Wesal/pull/52) |
| Browse Pagination | [PR #65](https://github.com/rywma/Wesal/pull/65) |
| Admin Dashboard | [PR #68](https://github.com/rywma/Wesal/pull/68) |

These are selected examples from our development history. All implementation changes and Pull Requests are available in the [Wesal GitHub Repository](https://github.com/rywma/Wesal).

---


## Sprint Reviews

At the end of each sprint, we reviewed our progress, tested the completed features, and identified any remaining work.

### Sprint 1 Review

We completed the initial project setup, database configuration, deployment, authentication, and the main frontend pages.

The first demo focused on creating an account, logging in, and accessing the home page.

### Sprint 2 Review

We completed the main match features, including match creation, browsing, joining and leaving matches, cost splitting, invitations, and test payments.

Some frontend-backend integrations, including My Matches and Manage Match, continued into Sprint 3.

### Sprint 3 Review

We focused on completing integrations, improving booking and payment logic, and testing the application.

We also worked on profiles, results, leaderboards, challenges, badges, and venue management features.

The final review focused on the complete user journey and preparing the MVP for the demo.

---

## Retrospectives

After each sprint, we discussed what worked well, what challenges we faced, and how we could improve our workflow.

### Sprint 1

We successfully set up the development environment and deployed the application early. However, some backend structure changes caused additional fixes. We identified the need to agree on the project structure before implementing new features.

### Sprint 2

We made good progress on the core match features, but frontend-backend integration sometimes required additional fixes due to differences in API fields. We decided to improve communication about API requests and responses.

### Sprint 3

We completed the main development work and identified several issues during integration testing, especially in the payment flow. This showed us the importance of testing features earlier and keeping tests updated when implementation details change.

---


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
| Source Repository | [github.com/rywma/Wesal](https://github.com/rywma/Wesal.git) |
| Bug Tracking | [Pull requests](https://github.com/rywma/Wesal/pulls?q=is%3Apr), [Integration bugs fixed](#integration-bugs-found-and-fixed) |
| Testing Evidence and Results | [Unit Tests](#unit-tests), [Integration Tests](#integration-tests), [API Testing](#api-testing-postman) |
| Production Environment | [wesal-frontend.onrender.com](https://wesal-frontend.onrender.com) |
