# Startup Incubation Platform (CITBIF)

## Overview

CITBIF is a full-stack incubation management platform designed for **startup founders and teams** applying to or participating in an incubation program.

It supports the complete journey from **application intake** and **administrative review** to **portfolio management** and **founder workspace** operations.

The platform serves two primary roles:

| Role | Responsibility |
|------|----------------|
| **Startup users** | Founders or teams managing their **venture** profile, documents, requests, and progress. |
| **Administrators** | Program managers handling **application review**, the **admitted portfolio**, shared resources, and day-to-day operations. |

**Tech stack:** React + TypeScript + Vite + Express + MongoDB  

**Storage:** File uploads are stored in `server/uploads`.

SETUP GUIDE : https://drive.google.com/file/d/1IfNVxSRJjMnidwEltOn5I3exQNS7aMJi/view?usp=sharing  
DEMO DOCUMENTATION :https://drive.google.com/file/d/1zg7jfiMtRkdkU616FBxdaya7X0Wy15Bu/view?usp=sharing

---

## Key features

### For startup users

#### 1. Profile setup (6-step onboarding)

Startup users complete a structured onboarding process covering:

1. Personal details  
2. Venture / enterprise information  
3. Incubation history  
4. Due diligence documents  
5. Pitch and traction details  
6. Funding information  

Once submitted, **the application for program participation** is placed in **pending administrative review** (cohort workspace access is not yet granted).

#### 2. Startup user dashboard (`/dashboard`)

After **admission is approved**, startup users access a dedicated workspace with:

| Area | Purpose |
|------|---------|
| **Overview** | Venture status and current stage |
| **Data room** | Uploaded documents and files |
| **Mentors** | Mentor directory and session requests |
| **Investors** | Investor directory and intro requests |
| **My requests** | History of mentor session and investor introduction requests |
| **Calendar** | Events and important schedules |
| **Pitch deck / Fundraising** | Founder-focused support tools |
| **Settings** | Profile, participation, and stage updates |

#### 3. Stage management

Founders set the venture’s current stage, for example:

- **Idea**  
- **Early**  
- **Growth**  
- **Scale**  

The chosen stage is reflected in both founder and admin views for consistency.

---

### For administrators

#### 1. Application review

Administrators review **applications submitted during onboarding** and can:

- **Approve** admission  
- **Decline** admission  
- View **venture profile** and submission detail  

Only **admitted** startup users receive full **`/dashboard`** access.

#### 2. Portfolio management

Administrators manage **admitted** ventures / participants, including:

- Venture details  
- Profile information  
- Venture stage  
- Shared records and updates  

#### 3. Operations and resource management

The admin console includes:

| Area | Purpose |
|------|---------|
| **Overview** | Overall portfolio and platform metrics |
| **Review** | Review and adjudicate participant applications |
| **Startups** | Manage the admitted portfolio (UI naming) |
| **Data room** | Cross-portfolio document access |
| **Events** | Incubation event management |
| **Mentors** | Mentor profiles |
| **Investors** | Investor profiles |
| **Mentor / Investor manage** | Use **Mentor requests** / **Investor requests** on those pages to view and update connection request status |
| **Notifications** | System and admin alerts (connection requests can be opened for full detail) |

---

## Application flow

The platform follows a clear **admission workflow**.

### User journey

#### 1. Authentication

Users sign up or sign in as:

- **Startup user** (`user`)  
- **Administrator** (`admin`)  

Authentication state is maintained on the client (e.g. `localStorage`).

#### 2. Onboarding

Startup users complete the 6-step onboarding form and submit venture details. At this stage:

- Their **profile** is stored  
- **Venture** data and related application records are persisted  
- **The application for participation** remains **pending review**

#### 3. Administrative review

Administrators evaluate submitted applications and decide whether to:

- **Approve** admission  
- **Decline** admission  

#### 4. Platform usage

Once approved:

- **Startup users** use `/dashboard`  
- **Administrators** use `/admin/...`

---

## Profile setup (6 steps)

| Step | Content |
|------|---------|
| **Personal** | Founder identity and contact details |
| **Enterprise** | Venture name, sector, track, founding team |
| **Incubation history** | Prior incubator or accelerator participation |
| **Due diligence** | Required document uploads |
| **Pitch & traction** | Business narrative and progress |
| **Funding** | Funding stage, needs, and ask |

Submitting the form sends **the application** into the **administrative review** queue.

---

## Startup user dashboard modules

| Module | Purpose |
|--------|---------|
| **Overview** | Venture status and current stage |
| **Data room** | Venture documents and uploads |
| **Mentors** | Mentor directory and session request flow |
| **Investors** | Investor directory and intro request flow |
| **Calendar** | Events and schedule management |
| **Pitch deck / Fundraising** | Founder support tools |
| **Settings** | Profile, venture stage, and participation controls |

**Connection requests (mentors & investors):** When a founder submits a request, the app **creates a record** in the MongoDB `requests` collection first. Admins see a **notification** on the overview and can open **Request details** (topic, time slot, notes, investor firm, etc.). **SMTP is optional:** if `SMTP_USER` / `SMTP_PASS` (or `EMAIL_USER` / `EMAIL_PASSWORD`) are set in `server/.env`, the backend **emails the mentor** for session requests only; investor intros stay in-app unless you extend mail later.

---

## Administrator console

| Area | Purpose |
|------|---------|
| **Overview** | Portfolio and platform metrics |
| **Review** | Review and adjudicate participant applications |
| **Startups** | Admitted portfolio management |
| **Data room** | Access uploaded venture documents |
| **Events** | Create and manage incubation events |
| **Mentors** | Manage mentor profiles |
| **Investors** | Manage investor profiles |
| **Mentor / Investor manage** | **Mentor requests** and **Investor requests** buttons open the filtered request list (same as former standalone Requests page) |
| **Notifications** | System and admin alerts |

---

## Connection requests (`requests` collection)

Mentor session and investor introduction flows share one model:

| Field | Purpose |
|--------|---------|
| `startupUserId` | Founder (`User`) who submitted the request |
| `targetId` | Mentor or investor document id |
| `targetType` | `mentor` or `investor` |
| `message` | Short summary stored for history |
| `details` | Extra payload (e.g. topic, time slot, notes, `investorFirm`) |
| `status` | `pending`, `in_progress`, `completed`, `cancelled` |

**API (examples):** `POST /api/requests`, `GET /api/requests/user/:userId`, `GET /api/requests/admin`, `GET /api/requests/:id`, `PATCH /api/requests/:id/status`. Legacy: `POST /api/mentors/request-session` (requires `startupUserId`; still creates the same stored request and optional mentor email).

---

## Tech stack

### Frontend

- React 18  
- TypeScript  
- Vite  
- React Router  
- Tailwind CSS  
- Framer Motion  
- Lucide React  
- Fetch API  

### Backend

- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- bcryptjs  
- Multer  
- dotenv  
- cors  
- nodemailer (optional SMTP for mentor session emails)

### Planned / future

- SMTP or other channels for **investor** introduction notifications (mentor email is already optional via env)

---

## Technical architecture

| Concern | Implementation |
|---------|------------------|
| **Frontend** | Single-page application built with Vite |
| **API** | `src/services/*` uses `VITE_API_URL` + `/api/*` |
| **Authentication** | Sign-up / sign-in via REST API |
| **Password security** | Passwords hashed with bcryptjs |
| **Session** | Client-side auth context with `localStorage` |
| **Backend** | Express server + MongoDB via Mongoose |
| **File uploads** | Stored under `server/uploads` |
| **Mentor / investor requests** | Persisted in `requests`; admin notifications link to the row for detail modal |

---

## Setup instructions

### 1. Clone the repository

```bash
git clone https://github.com/nes268/CITBIF.git
cd CITBIF
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/citbif
PORT=5000
```

Optional — **mentor session emails** (same behavior as existing Nodemailer setup; leave unset to skip sending mail):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
# Alternatives also supported in code: EMAIL_USER, EMAIL_PASSWORD
```

**Default admin (local / staging):** from `server/`, run `npm run seed-admin`. It creates `admin@gmail.com` / `admin123` (username `admin`) or **resets the password** to `admin123` if that admin already exists.

Start the backend:

```bash
npm start
# or
npm run dev
```

- API base: `http://localhost:5000`  
- Health check: `GET /api/health`

### 3. Frontend setup

From the repository root:

```bash
cd ..
npm install
```

Create a root `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend dev server is typically `http://localhost:5173`.

### 4. Running the application

| Order | Step |
|-------|------|
| 1 | Start MongoDB |
| 2 | Start the backend server |
| 3 | Start the frontend server |
| 4 | Open the frontend URL in the browser |

### 5. Roles and access

**Startup users**

1. Sign up with role `user`  
2. Complete the onboarding profile  
3. Wait for administrative approval  
4. Access `/dashboard` after admission is approved  

**Administrators**

1. Sign up with role `admin`  
2. Access `/admin/...`  
3. Review and manage applications  
4. Operate platform resources (events, directories, data room, notifications)  

Do not commit secrets or `.env` files.

---

## Environment variables

### Backend (`server/.env`)

| Variable | Notes |
|----------|--------|
| `MONGODB_URI` | Required — MongoDB connection string |
| `PORT` | Optional — e.g. `5000` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional — if set, mentor session requests trigger an email to the mentor; if omitted, the request is still saved and admins are notified in-app |
| `EMAIL_USER`, `EMAIL_PASSWORD` | Optional — alternate names read by the same mail path |

**Login:** email matching is **case-insensitive** when the identifier contains `@`; leading/trailing spaces are trimmed on the client and server.

### Frontend (root `.env`)

```env
VITE_API_URL=http://localhost:5000
```

Use the correct production API URL when deploying (no trailing slash).

---

## Available scripts

**Backend (`server/`)**

```bash
npm start
npm run dev
npm run seed-admin   # create or reset default admin (admin@gmail.com / admin123)
```

**Frontend (repository root)**

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Production notes

- Build the frontend with the correct `VITE_API_URL`  
- Serve `dist/` over HTTPS  
- Configure CORS securely  
- Protect all private API routes  
- Consider cloud object storage for uploads (e.g. S3, Cloudinary) instead of local `server/uploads`  

---

## Future improvements

- Email (or other notifications) for **investor** introduction requests  
- Cloud file storage (AWS S3, Cloudinary, etc.)  
- Stronger role-based route protection  
- Admin analytics enhancements  
- Notification system upgrades  
- Deeper fundraising and pitch support tooling  

---

## License

This project is licensed under the **ISC License** (see `server/package.json`).

---

## Contributing

Contributions are welcome.

**Workflow**

1. Fork the repository  
2. Create a feature branch  
3. Make your changes  
4. Commit your updates  
5. Open a pull request  

---

## Support

For issues, suggestions, or improvements, please open an issue in the repository.
