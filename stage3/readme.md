## 0. User Stories and Mockups
## moscow framework for prioritization
### Must Have
1. **Account Creation & Login:** As a new user, I want to create an account and log in, so that I can access the platform features.
2. **Browse & Filter Matches:** As a player, I want to browse available matches and filter them by sport, date, and location, so that I can find a match that fits my schedule.
3. **View Match Details:** As a player, I want to see a match's date, time, location, players, and available spots, so that I can decide whether to join.
4. **Join or Leave a Match:** As a player, I want to join an available match or leave one I joined, so that I can play without organizing a game myself.
5. **Create a Match:** As a match creator, I want to create a match by entering the sport, venue, date, time, and number of players, so that others can join my game.
6. **Cost Splitting:** As a match creator, I want to enter the total match cost and have it split automatically among players, so that each player only pays their fair share.
7. ****Payment Status:** As a player, I want to complete a simulated payment, view my payment share, and see my status (Paid / Pending), so that I know my spot is confirmed.

### Should Have
8. **Invite Players:** As a match creator, I want to invite players to my match, so that I can fill spots with people I know.
9. **Manage Match:** As a match creator, I want to view players, edit match details, or cancel the match, so that I can handle changes easily.
10. **Track Payments:** As a match creator, I want to see which players have paid, so that I don't have to chase people manually.

### Could Have
11. **Profile Setup:** As a registered player, I want to add my favorite sports, skill level, and a short bio, so that other players know my background.
12. - Rankings, leaderboards, and points

### Won't Have (this MVP)
- Public challenges
- In-app chat
- AI or personalized recommendations
- Social features (followers, feed)
- Real payment processing (Mada, Apple Pay)

### Mockups



## 1. System Architecture

Wesal is a web app with a React frontend, a Django backend and a PostgreSQL database. The diagram below shows how these parts connect and how data moves between them.

```mermaid
flowchart LR
    User["User (browser)"] -->|HTTPS| FE

    subgraph Frontend["Frontend: React"]
        FE["Pages: Login, Discover,<br/>Match Details, Create Match,<br/>My Matches"]
    end

    subgraph Backend["Backend: Django + Django REST Framework"]
        AUTH["Auth<br/>Django auth + JWT"]
        APPS["Apps: accounts,<br/>matches, payments"]
    end

    DB[("PostgreSQL")]

    FE -->|"1. log in"| AUTH
    AUTH -->|"2. JWT"| FE
    FE -->|"3. request + JWT"| APPS
    APPS <-->|"4. Django ORM queries / results"| DB
    APPS -->|"5. JSON response"| FE
```

### Components

| Part | Tech | What it does |
|------|------|--------------|
| Frontend | React | The pages users see. Sends requests to the backend and shows the results |
| Backend | Django + Django REST Framework | All the logic for accounts, matches, invites, cost splitting and payment status |
| Auth | Django auth + Simple JWT | Sign up and login, gives the user a token for later requests |
| Database | PostgreSQL | Stores users, matches, participants, invites and payments |
| External APIs | None in the MVP | Maps and real payments are out of scope (see charter) |

### How data flows

1. The user logs in and the backend sends back a JWT.
2. Every request from the frontend includes that token.
3. Django checks the token before the request reaches any view.
4. The view reads or updates the database through the Django ORM.
5. The backend returns JSON and the page updates.

Example: when a player joins a match, the frontend sends `POST /api/matches/:id/join/`. The backend checks there's a free spot, adds the player, recalculates each player's share of the cost, and returns the updated match.

### Architecture style

We're using a **monolithic** setup: one Django project split into three apps (accounts, matches, payments) that share one database. For a team of 4 with 6 weeks of development, this is simpler to build, test and deploy than microservices. Keeping the apps separate means we could split them later if Wesal grows.

### Security

- Passwords are hashed by Django's built-in auth. We never store them in plain text.
- Every request needs a valid JWT, except sign up and login.
- Only the creator of a match can edit it, cancel it, invite players or see payment tracking.
- All traffic goes over HTTPS.
- Django validates input before saving (for example, max players must be more than 0 and cost can't be negative).
- We only store the user data we need, following SDAIA data-protection guidance.

### Scalability

- The frontend and backend run separately, so each can be scaled on its own.
- JWT auth means the backend doesn't keep sessions, so more backend instances can be added if traffic grows.
- The database has indexes on the fields we filter by most (sport, date, city).

### Why these tools

- **Django + DRF:** Our team knows Python, and Django gives us auth, an admin panel and migrations out of the box.
- **React:** Keeps the frontend separate from the backend, so both can be built at the same time.
- **PostgreSQL:** Our data is relational (users, matches and payments all link together) and it works well with Django.
- **No maps API or payment gateway:** Players filter by city and district, and payments are simulated, as agreed in our charter.


## 2. Define Components, Classes, and Database Design

### Back-end Classes

Since we are using Django for the back-end, we identified the main classes based on the main features of the application.

| Class | Attributes | Methods |
|---|---|---|
| User | id, name, username, email, password, profile_image | update_profile() |
| Match | id, creator_id, sport_id, date, time, location, max_players, total_cost, status | create_match(), update_match(), cancel_match() |
| Sport | id, name | No specific methods defined yet |
| Participation | id, user_id, match_id, status, payment_status | join_match(), leave_match() |
| Invitation | id, sender_id, receiver_id, match_id, status | send_invitation(), accept_invitation(), decline_invitation() |

### Front-end Components

Since we are using React for the front-end, we divided the interface into simple reusable components.


| Component | Description |
|---|---|
| Navbar | Used to move between the main pages |
| MatchCard | Shows the main match details |
| MatchList | Displays the available matches |
| MatchFilters | Filters matches by sport, date, and location |
| CreateMatchForm | Allows users to create a new match |
| Profile | Shows the user's basic information and profile image |
| InvitationList | Shows invitations received by the user |
| JoinButton | Allows the user to join a match |
| LeaveButton | Allows the user to leave a match |


### Database Design

We are using a relational database for the project. The main tables are Users, Sports, Matches, Participations, and Invitations.

#### Users
Stores user account information.

#### Sports
Stores the sports available in the application.

#### Matches
Stores the details of each created match.

#### Participations
Connects users with the matches they join.

#### Invitations
Stores match invitations sent between users.


### Relationships

- One user can create many matches.
- One sport can be linked to many matches.
- One user can join many matches.
- One match can have many users.
- One user can send invitations to other users.
- Each invitation belongs to one match.


### ER Diagram

![ER Diagram](Wesal%20Database%20ER%20Diagram.png)
