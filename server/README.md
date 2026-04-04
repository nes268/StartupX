# CITBIF Backend Server

Express backend with MongoDB for the CITBIF application.

## Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment variables** — create `server/.env`:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/citbif
   ```

   **Optional — SMTP (mentor session emails only, unchanged behavior)**  
   If `SMTP_USER` and `SMTP_PASS` are set (or `EMAIL_USER` / `EMAIL_PASSWORD`), the server sends an email to the mentor when a mentoring session request is created. If they are **not** set, the request is still saved, admins get in-app notifications, and no email is sent.

   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@citbif.com
   ```

   - Gmail: use an **App Password** (2FA required), not your normal password.  
   - Other providers: adjust `SMTP_HOST` and `SMTP_PORT` as needed.

3. **MongoDB** — ensure `mongod` is running (or use Atlas with `MONGODB_URI`). MongoDB Compass can use the same URI as `MONGODB_URI`.

4. **Default admin (optional)**

   ```bash
   npm run seed-admin
   ```

   Creates `admin@gmail.com` / username `admin` / password `admin123`, or **resets that account’s password** to `admin123` if it already exists.

5. **Run**

   ```bash
   npm start
   # or
   npm run dev
   ```

## Notable API routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/signup` | Signup — body includes `role`: `admin` \| `user` |
| POST | `/api/auth/login` | Login — `emailOrUsername`, `password` (email match is case-insensitive when value contains `@`) |
| GET | `/api/health` | Health check |
| POST | `/api/requests` | Create connection request (`startupUserId`, `targetId`, `targetType`, `message`, optional `details`, …) |
| GET | `/api/requests/user/:userId` | Founder’s request history |
| GET | `/api/requests/admin` | All requests (admin UI) |
| GET | `/api/requests/:id` | Single request (e.g. admin notification detail) |
| PATCH | `/api/requests/:id/status` | Update `status` |
| POST | `/api/mentors/request-session` | Legacy mentor flow — requires `startupUserId` plus `mentorEmail`, `startupName`, `topic`, `preferredTimeSlot`, etc.; same persistence + optional SMTP as above |

## Database collections (common)

| Collection | Role |
|------------|------|
| `admins` | Admin users |
| `users` | Startup users |
| `requests` | Unified mentor + investor connection requests |
| Others | `mentors`, `investors`, `startups`, `profiles`, notifications, documents, … |

## Notes

- Passwords are hashed with **bcryptjs**.  
- Email and username must be unique within each role collection as enforced by signup.  
- **Investor** introduction requests are stored like mentor requests; they do **not** send email unless you add that in code.
