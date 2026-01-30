# Chess Hive — Project README

Chess Hive is a full-stack chess platform that supports multiple roles (Player, Organizer, Coordinator, Admin), real-time play and chat, tournament management, and a store with wallet balance tracking. The project includes a modern React SPA for the UI and an Express + Socket.IO backend that serves JSON APIs and real-time events.

This README explains the full website flow, major pages, backend APIs, and how to run the system locally.

---

## Quick start (prerequisites)
- Node.js (v14+ recommended)
- npm (or yarn)
- MongoDB (local `mongod` or MongoDB Atlas)
- Windows PowerShell (commands below assume PowerShell)

---

## Run backend (Express + Socket.IO)
This repo contains two backend copies:

1) **Primary backend (root)** — recommended
```powershell
cd .\
npm install
node app.js
```

2) **Legacy backend** in `ChessHivev1.0.2/` (kept for reference)
```powershell
cd .\ChessHivev1.0.2\
npm install
node app.js
```

The server uses `PORT` from environment variables or defaults to `3001` (root) / `3000` (legacy). The console prints the active port.

---

## Run frontend (React SPA)
```powershell
cd .\chesshive-react\
npm install
npm start
```

CRA defaults to port `3000`. If the backend already uses `3000`, start React on another port:
```powershell
# $env:PORT=3002; npm start
```

Deployment: run `npm run build` in `chesshive-react` and serve `build/` via Express.

---

## Project structure overview

- `chesshive-react/` — frontend (React SPA)
  - `src/App.js` — client-side routes (URL → component)
  - `src/pages/` — feature pages (Home, Login, ContactUs, player/*, organizer/*, coordinator/*, admin/*)
  - `src/components/` — reusable UI components
  - `src/styles/` — theme styles and visual system

- Root backend
  - `app.js` — Express app, sessions, Socket.IO server, and router mounting
  - `player_app.js` — player APIs (mounted at `/player`)
  - `organizer_app.js`, `coordinator_app.js`, `admin_app.js` — role-specific APIs
  - `routes/auth.js` — login/signup + OTP flow
  - `routes/databasecongi.js` — DB connect helper (`connectDB()`)

---

## Website roles and what they do

### Player
- Register, login, and manage profile
- Join tournaments (individual/team)
- Use wallet for entry fees and store purchases
- Live matches with timers (Socket.IO)
- Chat with other players (Socket.IO)

### Organizer
- Create and manage tournaments
- Manage coordinator accounts and schedules
- View tournament enrollments and stats

### Coordinator
- Run and manage tournaments
- Approve/track enrollments and pairings
- Manage store items and player stats

### Admin
- Oversee users, organizers, coordinators, and payments
- Manage overall system health and content

---

## Key frontend routes (React pages)
Defined in `src/App.js`:

- `/` → `Home`
- `/login` → `Login`
- `/signup` → `Signup`
- `/contactus` → `ContactUs`
- `/player/player_dashboard` → `PlayerDashboard`
- `/player/player_tournament` → `PlayerTournament`
- `/player/player_chat` → `PlayerChat`
- `/player/live_match` → `PlayerLiveMatch`

Organizer/Coordinator/Admin routes follow the same pattern (see `src/App.js` for the full list).

---

## Key backend APIs

### Session and auth
- `POST /api/login` — login and create session
- `POST /api/login/mfa-verify` — MFA verification
- `GET /api/session` — current session info

### Player APIs (mounted at `/player`)
- `GET /player/api/dashboard` — dashboard data (player name, team requests, latest tournaments, latest items)
- `GET /player/api/profile` — player profile, wallet, and stats
- `GET /player/api/tournaments` — tournament list and enrollments
- `POST /player/api/join-individual` — enroll individual player
- `POST /player/api/join-team` — enroll team
- `GET /player/api/store` — store items and wallet
- `POST /player/api/buy` — purchase item

### Chat + realtime (Socket.IO)
- `join` — join a chat or live room
- `chatMessage` — send chat messages
- `chessJoin` and `chessMove` — live match coordination

---

## Data flow examples

1) Player dashboard
- Frontend calls `GET /player/api/dashboard`
- Backend returns player name, team requests, and latest tournament/store items

2) Tournament join flow
- Frontend sends `POST /player/api/join-individual` or `/join-team`
- Backend validates session, checks wallet and subscription, then enrolls

3) Live match
- Players connect with Socket.IO
- Server pairs players and sends moves + timers in real time

---

## Database collections (overview)

- `users` — users and roles (`player`, `coordinator`, `organizer`, `admin`)
- `user_balances` — wallet balance per user
- `tournaments` — tournament metadata
- `tournament_players` — individual enrollments
- `enrolledtournaments_team` — team enrollments
- `tournament_pairings` — stored pairings and results
- `player_stats` — player stats and ratings
- `chat_messages` — chat history
- `products`, `sales` — store inventory and purchases
- `contact` — Contact Us messages
- `subscriptionstable` — subscription records

---

## Developer notes

- Recommended `.env` variables:
  - `PORT`
  - `MONGO_URI`
  - `SESSION_SECRET`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (if email notifications are enabled)

- ContactUs mismatch note:
  - Frontend posts JSON to `/api/contactus`, but the server currently exposes only `/contactus` (form POST). If needed, add a JSON endpoint in `routes/auth.js`.

---

