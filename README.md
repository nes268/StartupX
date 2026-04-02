# CITBIF

Full-stack app for an incubation program: founders onboard and use a dashboard; admins review applications and manage mentors, investors, and events. **Stack:** React (TypeScript, Vite), Express, MongoDB.

**Flow:** Open `/` → splash → login. Founders complete a **profile wizard**; admins **approve** or **reject**. Profile changes can sync to the linked **Startup** record; **stage** is editable in **Settings**.

---

## Features

**Profile setup** — Multi-step wizard (personal, company, incubation, documents, pitch, funding); saves Profile and Startup for review.

**Startup side** — Dashboard: overview, data room, mentors, investors, calendar, pitch deck, fundraising, settings. Pending/rejected startups see a gate until approved.

**Admin** — Dashboard, application review (detail + approve/reject), startup management, data room, mentor/investor/event management, notifications.

---

## Architecture

Plain flow (no diagrams):

`React app (src/)` → `fetch` / REST clients in `src/services/` → `VITE_API_URL` → `Express` in `server/index.js` → `MongoDB` (Mongoose)  
File uploads → `Multer` → `server/uploads` (paths stored on documents/reports as needed)

The UI is a static SPA; persistence is through `/api/*` only.

---

## Tech stack

**Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, Framer Motion, Lucide.  
**Backend:** Node.js, Express, MongoDB, Mongoose, Multer, bcryptjs, dotenv, cors (nodemailer available if you wire email).

---

## API and services

REST under **`/api`** (`server/index.js`). Client base URL: **`VITE_API_URL`**. Typical groups: `/api/auth`, `/api/profiles`, `/api/startups` (including approve, reject, phase), `/api/documents` (upload + CRUD), `/api/mentors`, `/api/investors`, `/api/events`, `/api/reports`, `/api/notifications`.  

Frontend wrappers: `src/services/*Api.ts` (`profileApi`, `startupsApi`, `documentsApi`, etc.).

---

## Setup and run

**1. Clone**

```bash
git clone https://github.com/Keerthana-R786/startup.git
cd startup
```

**2. Backend**

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif
```

Start MongoDB, then:

```bash
npm start
# or: npm run dev
```

Check `GET http://localhost:5000/api/health`.

**3. Frontend** (repo root)

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

Open the URL Vite shows (often `http://localhost:5173`).

---

## Accounts

- **Admin:** Sign up with admin role → `/admin/dashboard` → use Review to approve startups.  
- **User:** Sign up → profile wizard → wait if pending → after approval, `/dashboard`.

---

## Project structure

- `server/` — `index.js`, `uploads/`, `package.json`  
- `src/` — `components/` (auth, dashboard, profile, layout, ui), `context/`, `hooks/`, `services/`, `types/`, `App.tsx`, `main.tsx`  
- `public/` — static assets (e.g. favicon)  
- Root — `index.html`, `vite.config.ts`, `tailwind.config.js`, `package.json`

---

## Environment

| File | Variables |
|------|-----------|
| `server/.env` | `PORT` (optional), `MONGODB_URI` (required) |
| Root `.env` | `VITE_API_URL` — API origin, no trailing slash |

Do not commit real secrets.

---

## Scripts

| Where | Command |
|-------|---------|
| Root | `npm run dev`, `npm run build`, `npm run preview`, `npm run lint` |
| `server/` | `npm start`, `npm run dev` |

---

## Production

Build with the production `VITE_API_URL`; serve `dist/` over HTTPS; lock down CORS and validate uploads and auth on the server.

---

## License

ISC (see repository / `server/package.json`).

## Contributing

Fork, branch, PR with a short description of changes.
