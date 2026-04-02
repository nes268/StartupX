# CITBIF

Full-stack platform for an incubation program: founders submit applications and run their startup workspace; administrators review applicants, manage the portfolio, and operate shared services (mentors, investors, events, documents).

**How data stays aligned:** Saving a profile updates the linked **Startup** record where it matters for admin lists (name, founder, email, sector, program type). Founders set **current stage** (idea → scale) in **Settings**; that value is stored on **Startup** and appears in admin review and startup detail views. Admin screens refresh periodically and when you return to the tab so you see recent founder changes without reloading the app.

---

## Features

### Founders (dashboard)

- **Profile wizard** — Multi-step onboarding (personal, company, incubation history, documents, pitch/traction, funding).
- **Overview & workspace** — Status, stage, and program context.
- **Data room** — Upload and organize documents.
- **Mentors** — Directory and session requests.
- **Investors** — Directory and intro requests.
- **Pitch deck & fundraising** — Deck tooling and funding progress (UI state).
- **Calendar** — Events.
- **Settings** — Personal details, startup stage, dropout/active status where applicable.

**Access rules:** Users need a linked startup from onboarding. Pending or rejected applications see a holding state until approved (then full dashboard).

### Administrators

- **Dashboard** — Metrics and startup overview; data refreshes on a timer and when the browser tab becomes visible.
- **Review** — Application list and per-startup detail (summary, full profile tabs, startup stage, approve/reject).
- **Startup management** — Approved portfolio; modal with startup basics (including **current stage**) and full profile.
- **Data room (admin)** — Browse startups and their files.
- **Mentors / investors / events** — CRUD-style management and directory maintenance.
- **Notifications** — Separate feeds for admins and founders (e.g. approvals, intros, rejections).

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Frontend | React 18, TypeScript, Vite, React Router, Tailwind CSS, Lucide icons |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Uploads | Multer (`server/uploads`) |
| Auth | bcrypt-hashed accounts; role-based **admin** vs **user** |

---

## Prerequisites

- Node.js 18+
- npm (or yarn)
- MongoDB (local or Atlas)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Keerthana-R786/startup.git
cd startup
```

**Backend**

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif
```

Start API:

```bash
npm start
# or
npm run dev
```

API base: `http://localhost:5000` (use `/api/health` to verify).

**Frontend** (from repo root)

```bash
cd ..
npm install
```

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

App URL is printed by Vite (typically `http://localhost:5173`).

### 2. MongoDB

With `MONGODB_URI` set, collections are created as models are used, for example: `users`, `admins`, `profiles`, `startups`, `documents`, `mentors`, `investors`, `events`, `reports`, `usernotifications`, `adminnotifications`.

---

## Project layout

```
startup/
├── server/
│   ├── index.js       # Express app, routes, sync helpers
│   ├── uploads/       # Stored uploads
│   └── package.json
├── src/
│   ├── components/    # auth, dashboard (startup + admin), profile, layout, ui
│   ├── context/       # Auth, applications, notifications, funding, alerts
│   ├── hooks/         # e.g. useStartups
│   ├── services/      # REST clients
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Usage (quick)

1. Start MongoDB, then the **server**, then **Vite**.
2. **Signup** — Choose **Admin** or **User**.
3. **Founder** — Complete **Profile wizard**; wait for approval if required, then use the dashboard.
4. **Admin** — Use **Review** to approve/reject; use **Startup management** and other admin pages for ongoing operations.

---

## API (overview)

All routes are under `/api` unless noted.

| Area | Examples |
|------|-----------|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Profiles | `GET /api/profiles/user/:userId`, `POST /api/profiles`, `PUT /api/profiles/:id` |
| Startups | `GET /api/startups`, `GET /api/startups/:id`, `POST /api/startups`, `PUT /api/startups/:id`, `PUT /api/startups/phase/:userId`, `POST .../approve`, `POST .../reject` |
| Documents | Upload/list/by user/by startup/delete |
| Mentors & events | CRUD + `POST /api/mentors/request-session` |
| Investors       | CRUD + `POST /api/investors/request-intro` |
| Reports         | List/create/update/delete + download helpers |
| Notifications   | User and admin list/read/unread-count/delete |

For exact payloads, inspect `server/index.js` or the `src/services/*Api.ts` callers.

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| Root | `npm run dev` | Vite dev server |
| Root | `npm run build` | Production build → `dist/` |
| Root | `npm run preview` | Preview production build |
| `server/` | `npm start` | Run API |
| `server/` | `npm run dev` | API with `node --watch` reload |

---

## Environment variables

**`server/.env`**

- `PORT` — API port (default 5000).
- `MONGODB_URI` — Mongo connection string.

**Root `.env`**

- `VITE_API_URL` — Base URL of the API (e.g. `http://localhost:5000`).

---

## Production notes

Point `VITE_API_URL` at your deployed API, set a strong `MONGODB_URI`, and serve the Vite `dist` output behind HTTPS. Restrict CORS and protect admin routes appropriately for your deployment.

---

## License

ISC (see repository).

## Contributing

Fork, branch, open a PR with a clear description of behavior changes.
