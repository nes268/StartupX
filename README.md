# CITBIF

## Overview

- Incubation platform: **founders** apply and work in a dashboard; **admins** review, approve, and run program tools.
- **Stack:** React (TypeScript, Vite) + Express + MongoDB. Files on disk under `server/uploads`.
- **Flow:** Splash → login → (user) **6-step profile setup** → **pending** → admin **approve/reject** → approved users get **dashboard**.

## Key features

- 6-step **profile setup**; **Startup** record for review.
- Founder: overview, data room, mentors, investors, calendar, pitch deck, fundraising, settings.
- Admin: review, startups, data room, events, mentors, investors, notifications.
- Profile can sync listing fields to **Startup**; **stage** (idea→scale) in settings.

## Flow (short)

1. `/` → splash → login / signup  
2. Auth → role **user** or **admin** (client: `localStorage`)  
3. User completes **profile setup** → **Profile** + **Startup** (`pending`)  
4. Admin **Review** → approve or reject  
5. Approved user → `/dashboard` …  
6. Admin → events, directories, data room, notifications  

## Profile setup (6 steps)

1. Personal  
2. Enterprise (startup, sector, type, founders)  
3. Incubation history  
4. Documents / uploads  
5. Pitch & traction  
6. Funding  

Submit → API saves profile; **Startup** created/updated → **pending**.

## Admin approval

- **Review** → list → open detail (summary, stage, profile tabs).  
- **Approve** / **Reject** → API updates status.  
- Not approved → gate screen instead of full dashboard.

## Founder modules (`/dashboard`)

| Module | Notes |
|--------|--------|
| Overview | Status, stage |
| Data room | Documents |
| Mentors | Directory, session request (+ email if SMTP set) |
| Investors | Directory, intro request |
| Calendar | Program events |
| Pitch deck / Fundraising | Workspace UI |
| Settings | Personal info, stage, status |

## Admin areas

| Area | Notes |
|------|--------|
| Overview | Metrics; refresh on timer / tab focus |
| Review | Approve / reject |
| Startups | Portfolio + profile modal |
| Data room | All startups’ files |
| Events / Mentors / Investors | Manage |
| Notifications | Admin feed |

## Tech stack

| Layer | Tech |
|--------|------|
| Frontend | React 18, TypeScript, Vite, React Router, Tailwind, Framer Motion, Lucide, `fetch` |
| Backend | Node, Express, MongoDB, Mongoose, bcryptjs, Multer, dotenv, cors |
| Optional | Nodemailer (SMTP) |

## Architecture

- SPA loads from Vite.  
- `src/services/*` → `VITE_API_URL` + `/api/*`.  
- `server/index.js` → Mongoose → MongoDB.  
- Uploads → `server/uploads`.  
- JSON responses; auth state in `localStorage` (`AuthContext`).

## Clone

```bash
git clone https://github.com/nes268/CITBIF.git
cd CITBIF
```

## Backend

```bash
cd server
npm install
# add server/.env (see table below)
npm start
# or: npm run dev
```

Check: `GET http://localhost:5000/api/health`

## Frontend

```bash
# repo root
npm install
# add root .env → VITE_API_URL=http://localhost:5000
npm run dev
```

## Run

Mongo running → start **server** → start **frontend** → open Vite URL (often `:5173`).

## Accounts

- **Signup** → Admin **or** User.  
- **Admin** → `/admin/...`, use Review.  
- **User** → profile setup → wait if pending → after approve → `/dashboard`.

## `.env`

| File | Var | Notes |
|------|-----|--------|
| `server/.env` | `MONGODB_URI` | Required |
| `server/.env` | `PORT` | Optional, e.g. `5000` |
| `server/.env` | `SMTP_*` or `EMAIL_*` | Optional mail |
| root `.env` | `VITE_API_URL` | No trailing slash; set at build for prod |

Do not commit secrets.

## Scripts

- `server/`: `npm start`, `npm run dev`  
- Root: `npm run dev`, `build`, `preview`, `lint`

## Production

Build with correct `VITE_API_URL`. Serve `dist/` over HTTPS; lock down CORS and server auth.

## License

ISC (`server/package.json`).

## Contributing

Fork → branch → PR with a short summary of changes.
