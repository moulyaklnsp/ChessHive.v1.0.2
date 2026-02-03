# ChessHive — Detailed README

This README explains how to start the backend and frontend, the static pages available, user types and features, and where to find the core code. It is written for both developers and evaluators.

---

## 1) Project overview
ChessHive is a campus-focused chess community platform with multiple roles: Player, Coordinator, Organizer, and Admin. It supports OTP-based authentication, tournament workflows, a store with purchases, meetings, notifications, and player profiles.

Key folders:
- Root backend (this folder) — Express + MongoDB + Socket.IO server. Entry file: [app.js](app.js).
- React frontend — SPA at [chesshive-react](chesshive-react).
- Legacy copy — [Chesshivev1.0.2](Chesshivev1.0.2) kept for reference.

---

## 2) Requirements
- Node.js (LTS recommended)
- MongoDB running locally at `mongodb://localhost:27017`
- Optional email SMTP for OTP delivery (see Environment section)

---

## 3) Start the backend (server)
1. Open a terminal in the project root folder.
2. Install dependencies:
   - `npm install`
3. Start MongoDB (local service or `mongod`).
4. Run the server:
   - `node app.js`

By default, the backend runs on port `3001` unless `PORT` is set.

---

## 4) Start the frontend (React)
1. Open a terminal in [chesshive-react](chesshive-react).
2. Install dependencies:
   - `npm install`
3. Start the app:
   - `npm start`

The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:3001` (configured in [chesshive-react/package.json](chesshive-react/package.json)).

---

## 5) Environment configuration (optional but recommended)
Set these variables in your system environment for real OTP email delivery:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

For production hardening, also configure:
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`

If SMTP is not configured, OTPs are logged to the server console or use a test account.

---

## 6) Static pages and public assets
The backend serves static assets from [public](public). The React app includes static pages under [chesshive-react/src/pages](chesshive-react/src/pages).

Common static pages in the React app:
- Home page: [chesshive-react/src/pages/Home.jsx](chesshive-react/src/pages/Home.jsx)
- About: [chesshive-react/src/pages/About.jsx](chesshive-react/src/pages/About.jsx)
- Contact Us: [chesshive-react/src/pages/ContactUs.jsx](chesshive-react/src/pages/ContactUs.jsx)
- Chess Story (branding / narrative): [chesshive-react/src/pages/ChessStory.jsx](chesshive-react/src/pages/ChessStory.jsx)

Static server-side resources:
- Images: [public/images](public/images)
- JS helpers (legacy pages): [public/js](public/js)

---

## 7) User types and features (detailed)
ChessHive has four user roles. Each role has distinct dashboards and permissions.

### 7.1 Player
Primary goal: play tournaments and manage profile/wallet.

Key features (detailed):
- **OTP signup & login**: Player registers with email + password, then verifies with OTP. Sessions store role, email, and college for personalized dashboards.
- **Tournament discovery**: Browse approved tournaments with date, type, location, and entry fee. Visibility is limited to approved events.
- **Enrollment flow**: Enroll into tournaments; enrollment status is tracked server-side and used by pairing and stats.
- **Rankings & stats**: View ranking/leaderboards and player performance stats computed from tournament pairings and results.
- **Wallet & funds**: Add funds to wallet, view current balance, and track deductions for purchases or subscriptions.
- **Store purchases**: Buy products listed by organizers/coordinators; purchase updates wallet and inserts a sales record.
- **Notifications**: Receive notifications for feedback requests, tournament updates, and other announcements. Mark as read from the UI.
- **Profile overview**: View basic profile details, college affiliation, and participation history.

Main API routes:
- Auth: `/api/signup`, `/api/login`, `/api/verify-signup-otp`, `/api/verify-login-otp`
- Tournaments: `/player/api/tournaments`, `/player/api/enroll`, `/player/api/rankings`
- Wallet: `/player/add-funds`
- Notifications: `/api/notifications`, `/api/notifications/mark-read`

Relevant backend files:
- [player_app.js](player_app.js)
- [app.js](app.js)
- [routes/auth.js](routes/auth.js)

Relevant frontend pages:
- [chesshive-react/src/pages/player](chesshive-react/src/pages/player)
- [chesshive-react/src/pages/Login.jsx](chesshive-react/src/pages/Login.jsx)
- [chesshive-react/src/pages/Signup.jsx](chesshive-react/src/pages/Signup.jsx)

---

### 7.2 Coordinator
Primary goal: create and manage tournaments and pairings.

Key features (detailed):
- **Tournament creation**: Define tournament name, schedule, location, entry fee, number of rounds, and type. Newly created events default to Pending status.
- **Tournament updates**: Edit tournament details (date/time/location/fee) and soft-delete when needed.
- **Swiss pairing engine**: Generate round pairings with bye handling, score-based ordering, and avoidance of repeat opponents.
- **Enrollment oversight**: Monitor enrolled players/teams and ensure pairing uses the correct participant list.
- **Store product creation (optional flow)**: Add products to the store catalog tied to coordinator identity/college.
- **Tournament lifecycle**: Trigger pairing per round and manage round progression based on results.

Main API routes:
- `/coordinator/api/tournaments` (GET/POST/PUT/DELETE)
- `/coordinator/api/store/addproducts`

Relevant backend files:
- [coordinator_app.js](coordinator_app.js)

Relevant frontend pages:
- [chesshive-react/src/pages/coordinator](chesshive-react/src/pages/coordinator)

---

### 7.3 Organizer
Primary goal: approve tournaments, manage store and meetings.

Key features (detailed):
- **Tournament approval**: Review coordinator-submitted tournaments and approve or reject with status changes and audit metadata (approver, date).
- **Tournament oversight**: View all tournaments across colleges and statuses to monitor platform activity.
- **Store inventory**: View and manage product listings and availability; see aggregated sales.
- **Sales reporting**: Access summary of purchases, buyer details, and total revenue per item.
- **Meetings management**: Schedule meetings for coordinators/players, share meeting links, and list meetings organized by the current user.

Main API routes:
- `/organizer/api/tournaments`
- `/organizer/api/tournaments/approve`
- `/organizer/api/tournaments/reject`
- `/organizer/api/store`
- `/organizer/api/meetings`

Relevant backend files:
- [organizer_app.js](organizer_app.js)

Relevant frontend pages:
- [chesshive-react/src/pages/organizer](chesshive-react/src/pages/organizer)

---

### 7.4 Admin
Primary goal: platform oversight and user management.

Key features (detailed):
- **System dashboard**: High-level overview of platform activity including users, tournaments, and financial flows.
- **User management**: View and manage coordinators, organizers, and players; enable or remove access (as implemented in UI).
- **Payments review**: Inspect payment and wallet-related records to identify anomalies or confirm activity.
- **Administrative visibility**: Access to cross-role data for troubleshooting and monitoring.

Main backend file:
- [admin_app.js](admin_app.js)

Relevant frontend pages:
- [chesshive-react/src/pages/admin](chesshive-react/src/pages/admin)

---

## 8) Authentication and session flow
1. User signs up or logs in using email + password.
2. Server sends OTP via email.
3. User submits OTP to verify.
4. Server sets session values (`req.session`) for role, name, email, and college.

Backend auth is in [routes/auth.js](routes/auth.js) and [app.js](app.js).

---

## 9) Tournaments and pairing workflow
1. Coordinator creates a tournament (status: Pending).
2. Organizer approves or rejects.
3. Coordinator triggers Swiss pairing per round.
4. Pairings are stored in MongoDB (collection: `tournament_pairings`).

Swiss pairing logic is implemented in [coordinator_app.js](coordinator_app.js).

---

## 10) Store and payments
Store products and sales are stored in MongoDB (`products`, `sales`).

Flow:
1. Organizer or Coordinator adds products.
2. Player adds funds to wallet.
3. Player buys product → wallet decreases → sale recorded.

Backend logic in:
- [organizer_app.js](organizer_app.js)
- [coordinator_app.js](coordinator_app.js)
- [player_app.js](player_app.js)

---

## 11) Notifications
Notifications are stored in MongoDB (`notifications`).

Endpoints:
- `GET /api/notifications`
- `POST /api/notifications/mark-read`

Backend entry: [app.js](app.js)

---

## 12) Database collections (summary)
MongoDB collections include:
- `users`, `otps`, `signup_otps`
- `tournaments`, `tournament_pairings`, `tournament_players`, `enrolledtournaments_team`
- `products`, `sales`
- `meetingsdb`, `notifications`, `feedbacks`
- `user_balances`, `player_stats`, `subscriptionstable`

Validation rules are defined in [routes/databasecongi.js](routes/databasecongi.js).

---

## 13) Troubleshooting
If the frontend install fails due to peer dependency conflicts, ensure the React Three libraries match React 18:
- `@react-three/drei` should be version 9.x
- `@react-three/fiber` should be version 8.x

If OTP emails are not arriving, check SMTP config or watch the backend console for logged OTPs.

---

## 14) Quick file map
- Server entry: [app.js](app.js)
- Role APIs: [admin_app.js](admin_app.js), [organizer_app.js](organizer_app.js), [coordinator_app.js](coordinator_app.js), [player_app.js](player_app.js)
- Auth routes: [routes/auth.js](routes/auth.js)
- Database setup: [routes/databasecongi.js](routes/databasecongi.js)
- Frontend entry: [chesshive-react/src/index.js](chesshive-react/src/index.js)
- Frontend routes: [chesshive-react/src/App.js](chesshive-react/src/App.js)
- `player_app.js` — player APIs for tournaments, wallet, notifications, and profile
- `chesshive-react/src/pages/*` — UI pages; map by name to backend endpoints (see comments in README above)

---

## Route Types (Application vs Custom vs Error vs Third‑Party)
This section classifies the routes used in this project and shows where they are implemented and what they do.

> Scope note: This project has **backend HTTP routes (Express)** and **frontend client-side routes (React Router)**.

### Application Routes
These are your “main feature” routes (tournaments, enrollment, store, meetings, profiles, chat helpers, notifications).

**Where it is**
- Backend entry + mounts: `app.js`
- Role routers:
  - Admin router: `admin_app.js`
  - Organizer router: `organizer_app.js`
  - Coordinator router: `coordinator_app.js`
  - Player router: `player_app.js`
- Auth/mixed routes: `routes/auth.js`

**What it does**
- `app.js` defines top-level JSON APIs like login/session/notifications/chat helpers and mounts role routers:
  - Mount points: `/admin/*`, `/organizer/*`, `/coordinator/*`, `/player/*`
- Each role router provides role-specific APIs under `/<role>/api/*` (dashboard, tournaments, store, meetings, approvals, etc.)
- `routes/auth.js` provides signup OTP flow + contact form endpoints (both JSON and some legacy form POST routes)

### Custom Routes
These are “project-specific routing patterns” you wrote mainly for serving HTML pages and handling subpages.

**Where it is**
- Catch-all role page routes:
  - `GET /admin/:subpage?` → `admin_app.js`
  - `GET /organizer/:subpage?` → `organizer_app.js`
  - `GET /coordinator/:subpage?` → `coordinator_app.js`
  - `GET /player/:subpage?` → `player_app.js`
- Example single custom page route:
  - `GET /coordinator/feedback_view` → `coordinator_app.js`

**What it does**
- These routes map “subpage names” to `views/<role>/*.html` files and act like a mini page router for the legacy (non-React) HTML UI.

### Third‑Party Routes
These are routes created by dependencies (not hand-written `app.get('/...')` endpoints).

**Where it is**
- Socket.IO server is initialized in `app.js`.
- Static hosting is enabled via `express.static('public')` in `app.js`.

**What it does**
- Socket.IO exposes the default endpoint `/socket.io/*` for WebSocket/long-poll connections.
- `express.static('public')` exposes URLs for files in `public/*` (images, JS, etc.).

> Related (middleware, not routes): `cors`, `express-session`, `method-override` are third-party middleware used in `app.js`.

### Error Routes
These exist to handle “not found” and “unexpected error” cases consistently.

**Where it is**
- Global 404 catch-all: `app.js`
- Global error middleware (4-argument handler): `app.js`

**What it does**
- Any unmatched backend request triggers the 404 handler (redirects to home with `Page not found`).
- Any thrown/unhandled server error triggers the error middleware (returns JSON for API requests, plain text for non-API).

### Frontend Routes (React Router)
These are SPA routes handled in the browser, not on Express.

**Where it is**
- Router setup: `chesshive-react/src/index.js` (wraps app in `BrowserRouter`)
- Route list: `chesshive-react/src/App.js` (many `<Route path="..." element={...} />`)

**What it does**
- Controls which React page component renders for paths like `/login`, `/player/player_dashboard`, `/coordinator/tournament_management`, etc.
