# CITBIF



## Overview



- Incubation platform for **startup users** (founders / teams): program intake, **startup application** review, and day-to-day **founder workspace** tools. **Program administrators** operate the cohort pipeline, portfolio, and shared resources.

- **Stack:** React (TypeScript, Vite) + Express + MongoDB. Uploads under `server/uploads`.

- **Flow:** **Authentication** → **startup users** complete **profile setup** → **startup** status **pending review** → **administrator adjudication** (approve or decline) → approved **startup users** access the **dashboard**.



## Key features



- Six-step **profile setup**; **Startup** entity submitted for review.

- **Startup dashboard:** overview, data room, mentors, investors, calendar, pitch deck, fundraising, settings.

- **Administrator console:** application review, portfolio startups, data room, events, mentor/investor directories, notifications.

- Profile fields can sync to the **Startup** listing; **stage** (idea → scale) in settings.



## Flow (short)



1. **Authentication** — Registration or sign-in; role **startup user** or **administrator** (API role `user` / `admin`); session context on client (`localStorage`).  

2. **Startup onboarding** — Startup users complete **profile setup**; **Profile** and **Startup** stored; status **pending review**.  

3. **Application adjudication** — Administrators evaluate **startup applications** in **Review** (approve or decline).  

4. **Operations** — Approved startup users use `/dashboard`; administrators manage program assets (events, directories, data room, notifications).  



## Profile setup (6 steps)



1. Personal  

2. Enterprise (venture, sector, program track, founding team)  

3. Incubation history  

4. Due diligence documents / uploads  

5. Pitch & traction  

6. Funding  



On submission, the API persists the profile; **Startup** is created or updated and marked **pending** for review.



## Application review (administrators)



- **Review** — Queue of **startup applications**; detail (summary, stage, tabbed profile).  

- **Approve** / **Reject** — Updates **Startup** status.  

- Pending or rejected applications: **dashboard** access restricted until approved.



## Startup dashboard (`/dashboard`)



| Module | Notes |

|--------|--------|

| Overview | Venture status, **startup stage** |

| Data room | Startup documents and uploads |

| Mentors | Mentor network, session requests (in-app). **SMTP email for mentor requests — not implemented; to be implemented.** |

| Investors | Investor directory, intro requests (in-app). **SMTP email for investor requests — not implemented; to be implemented.** |

| Calendar | Cohort and program events |

| Pitch deck / Fundraising | Founder tooling (UI) |

| Settings | Profile, stage, participation status |



## Administrator console



| Area | Notes |

|------|--------|

| Overview | Portfolio metrics; periodic / tab-focus refresh |

| Review | **Startup application** approve / reject |

| Startups | Approved **portfolio**; startup + profile detail |

| Data room | Cross-portfolio document access |

| Events / Mentors / Investors | Program operations |

| Notifications | Admin notification feed |



## Tech stack



| Layer | Tech |

|--------|------|

| Frontend | React 18, TypeScript, Vite, React Router, Tailwind, Framer Motion, Lucide, `fetch` |

| Backend | Node, Express, MongoDB, Mongoose, bcryptjs, Multer, dotenv, cors |

| Optional | Nodemailer (SMTP) — intended for future outbound mail once mentor/investor request email is **implemented** |



## Architecture



- SPA (Vite); `src/services/*` → `VITE_API_URL` + `/api/*`.  

- **Authentication:** `POST /api/auth/signup`, `POST /api/auth/login`; **bcryptjs** on server; client context (`AuthContext`, `localStorage`).  

- `server/index.js` → Mongoose → MongoDB; uploads → `server/uploads`; JSON API.



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



MongoDB running → start **server** → start **frontend** → open Vite URL (often `:5173`).



## Accounts



- **Registration** — **Administrator** or **startup user** (application role `admin` / `user`).  

- **Administrators** — `/admin/...`; **Review** for **startup applications**.  

- **Startup users** — **Profile setup** → await adjudication → after **approval**, `/dashboard`.



## `.env`



| File | Var | Notes |

|------|-----|--------|

| `server/.env` | `MONGODB_URI` | Required |

| `server/.env` | `PORT` | Optional, e.g. `5000` |

| `server/.env` | `SMTP_*` or `EMAIL_*` | **To be implemented** for mentor/investor request notifications (not active for those flows yet) |

| root `.env` | `VITE_API_URL` | No trailing slash; set at build for prod |



Do not commit secrets.



## Scripts



- `server/`: `npm start`, `npm run dev`  

- Root: `npm run dev`, `build`, `preview`, `lint`



## Production



Build with correct `VITE_API_URL`. Serve `dist/` over HTTPS; lock down CORS and server-side authorization.



## License



ISC (`server/package.json`).



## Contributing



Fork → branch → PR with a short summary of changes.

