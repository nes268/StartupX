# StartupX

A full-stack **Startup Incubation Platform** (CITBIF) for managing incubations, mentorship, investor connections, and document management.

---

## Features

### For Startups
- **Profile Wizard** — Multi-step setup with document upload
- **Dashboard** — Status, applications, and progress
- **Document Management** — Business docs, pitch decks, traction data
- **Mentor Matching** — Connect and schedule sessions
- **Investor Network** — Browse and connect with investors
- **Pitch Deck Builder** — Templates for professional decks
- **Fundraising** — Track funding goals
- **Calendar** — Events and important dates

### For Administrators
- **Startup Management** — Review, approve, or reject applications
- **Mentor & Investor Management** — Add, edit, manage profiles
- **Document Review** — Access all startup documents
- **Event Management** — Create and manage incubation events
- **Analytics Dashboard** — Platform statistics

---

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide React |
| Backend  | Node.js, Express.js, MongoDB, Mongoose, Multer, bcryptjs |

---

## Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/nes268/StartupX.git
cd StartupX
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif
```

Start the server:

```bash
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Frontend

From the project root:

```bash
npm install
```

Create `.env` in the root:

```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Project Structure

```
StartupX/
├── server/                 # Backend (Express + MongoDB)
│   ├── index.js
│   ├── package.json
│   ├── uploads/
│   └── README.md
├── src/                    # Frontend (React + Vite)
│   ├── components/         # auth, dashboard, layout, profile, ui
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Environment Variables

| Location   | Variable     | Description                    |
| ---------- | ------------ | ------------------------------ |
| `server/`  | `PORT`       | Backend port (default: 5000)   |
| `server/`  | `MONGODB_URI`| MongoDB connection string     |
| Root       | `VITE_API_URL` | Backend API URL (e.g. http://localhost:5000) |

---

## API Overview

| Area   | Endpoints |
| ------ | --------- |
| Auth   | `POST /api/auth/signup`, `POST /api/auth/login` |
| Documents | `POST/GET/DELETE /api/documents`, `GET /api/documents/user/:userId` |
| Profiles | `POST/GET /api/profiles`, `GET /api/profiles/user/:userId` |
| Startups | `GET/POST/PUT /api/startups`, `GET /api/startups/user/:userId` |
| Mentors | `GET/POST/PUT/DELETE /api/mentors` |
| Investors | `GET/POST/PUT/DELETE /api/investors` |
| Events | `GET/POST/PUT/DELETE /api/events` |

---

## Scripts

| Command       | Where  | Description        |
| ------------- | ------ | ------------------ |
| `npm run dev` | Root   | Frontend dev server |
| `npm run build` | Root | Frontend production build |
| `npm run dev` | server | Backend with auto-reload |
| `npm start`   | server | Backend production |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

ISC

---

**Note:** Ensure MongoDB is running before starting the backend. For production, set env vars appropriately and follow security best practices.
