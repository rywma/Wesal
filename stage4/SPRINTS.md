# Wesal Stage 4 Sprints

Stage 4 took about 6 weeks, split into three 2-week sprints.

| Member | Role |
|---|---|
| Ahad | Backend Developer, Project Manager |
| Jouri | Backend & Database Developer |
| Hadeel | Frontend Developer, QA |
| Reema | UI/UX Designer, Frontend |

| Sprint | Dates | Goal |
|---|---|---|
| Sprint 1 | 11 Oct - 24 Oct 2026 | Project setup and first core features |
| Sprint 2 | 25 Oct - 7 Nov 2026 | Core match features and frontend-backend integration |
| Sprint 3 | 8 Nov - 21 Nov 2026 | Remaining features, final testing, bug fixes and MVP demo |

---

## Sprint Planning

Tasks were prioritized with MoSCoW (Must, Should, Could, Won't) and tracked on the team task board. Each task was done on its own branch and merged with a pull request.

### Sprint 1 (11 Oct - 24 Oct)

| Task | Owner | Priority |
|---|---|---|
| Set up Git and GitHub, create the Django backend | Ahad | Must |
| Set up the Supabase PostgreSQL database | Jouri | Must |
| Create the React frontend project | Hadeel | Must |
| Deploy the backend and frontend on Render | Reema | Must |
| Sign up, login and logout APIs with JWT | Jouri, Ahad | Must |
| Database models: sports, matches, participations, invitations, payments, profiles | Jouri | Must |
| Login, sign up and home pages | Hadeel | Must |

### Sprint 2 (25 Oct - 7 Nov)

| Task | Owner | Priority |
|---|---|---|
| Create a match API | Jouri | Must |
| Browse and filter matches, match details APIs | Ahad, Jouri | Must |
| Join or leave a match API | Jouri | Must |
| Cost splitting and payment status API | Jouri | Must |
| Invite players API | Jouri | Should |
| Payment simulation with Moyasar test mode | Jouri | Should |
| Create match, find games and match details pages | Reema | Must |
| Browse, payment status and My Matches pages | Hadeel | Must |
| Invite players and pay my share pages | Reema | Should |

### Sprint 3 (8 Nov - 21 Nov)

| Task | Owner | Priority |
|---|---|---|
| Double booking prevention, opponents, results and leaderboard | Jouri | Must |
| Host payment flow and countdown timer | Hadeel | Must |
| Points and profile | Ahad | Should |
| Profile setup page and redesign | Reema | Should |
| Challenges and badges (backend) | Jouri | Could |
| Challenges pages and badges (frontend) | Reema | Could |
| Venue requests with admin approve and reject | Jouri, Ahad, Hadeel | Should |
| Unit tests | Ahad | Must |
| Final integration testing and bug fixes | Jouri | Must |

---

## Sprint Reviews

### Sprint 1 Review

**Completed:** project setup, database on Supabase, deployment on Render, sign up, login and logout with JWT, all database models, and the login, sign up and home pages.

**Demo:** a user can sign up, log in and see the home page on the deployed site.

**Pull requests merged:** 21 (#1 - #22)

**Not finished:** none of the planned tasks were carried over.

### Sprint 2 Review

**Completed:** create match, browse and filter, match details, join and leave, cost splitting, payment status, invite players and Moyasar payment simulation, with their pages connected to the backend.

**Demo:** a host creates a match, other players find it, join it, see their share of the cost and pay with a Moyasar test card.

**Pull requests merged:** 20 (#23 - #45)

**Not finished:** My Matches and Manage Match were connected to the backend at the start of Sprint 3.

### Sprint 3 Review

**Completed:** double booking prevention, opponents, results and leaderboard, host payment with a countdown, points and profile, challenges and badges, venue requests with admin approval, unit tests and integration tests.

**Demo:** the full journey from sign up to a paid, confirmed match, plus challenges, the leaderboard and the admin venue requests page.

**Pull requests merged:** 21 (#46 - #69)

**Not finished:** the admin dashboard frontend is still in review.

---

## Retrospectives

### Sprint 1 Retrospective

| What went well | What to improve | Action for next sprint |
|---|---|---|
| Everyone could run the frontend, backend and database early | Several small fix PRs were needed because the Django folder structure was changed more than once | Agree on the project structure before adding new apps |
| Deployment on Render worked from the first week | Some PRs were merged without review | Every PR gets at least one reviewer |

### Sprint 2 Retrospective

| What went well | What to improve | Action for next sprint |
|---|---|---|
| Most core match features were finished in one sprint | Frontend and backend sometimes used different field names, which needed extra fix PRs | Agree on the API request and response before building a page |
| API endpoints were tested in Postman with screenshots in each PR | Manual payment controls had to be replaced once Moyasar was added | Plan the full payment flow before building it |

### Sprint 3 Retrospective

| What went well | What to improve | Action for next sprint |
|---|---|---|
| All Must tasks were finished, plus challenges and venue requests | Integration testing found bugs in the payment flow late in the sprint | Write integration tests together with the features, not at the end |
| Unit tests and integration tests now run with one command | Removing match editing left two old unit tests failing | Update or delete tests in the same PR that changes a feature |
