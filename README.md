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
| **Notifications** | System and admin alerts |

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

**Note:** Mentor and investor request notifications are **in-app only**. **SMTP / outbound email** for those flows is **planned** (not implemented yet).

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
| **Notifications** | System and admin alerts |

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

### Planned / future

- **Nodemailer / SMTP** integration for mentor and investor request emails  

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

Optional placeholders (**future / not wired for mentor–investor mail yet**):

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

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

- SMTP email notifications for mentor / investor requests  
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
