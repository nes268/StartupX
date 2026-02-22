# CITBIF Backend Server

Express backend server with MongoDB for the CITBIF application.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `server` directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/citbif
   
   # Email Configuration (for mentor session requests)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@citbif.com
   ```
   
   For MongoDB Compass, use your connection string. Example:
   ```
   MONGODB_URI=mongodb://localhost:27017/citbif
   ```
   
   **Email Setup Notes:**
   - For Gmail: Use an App Password (not your regular password). Enable 2FA and generate an app password.
   - For other providers: Adjust SMTP_HOST and SMTP_PORT accordingly.
   - If email is not configured, the system will log email requests to the console instead of sending them.

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - If using MongoDB Compass, ensure the connection is active

4. **Run the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **API Endpoints**
   - `POST /api/auth/signup` - User signup
     - Body: `{ fullName, email, username, password, role: 'admin' | 'user' }`
   - `GET /api/health` - Health check
   - `POST /api/mentors/request-session` - Send mentor session request email
     - Body: `{ mentorEmail, startupName, topic, preferredTimeSlot, additionalNotes?, requesterEmail?, requesterName? }`

## Database Collections

- **admins** - Stores admin users
- **users** - Stores regular users

## Notes

- Passwords are hashed using bcryptjs
- Email and username must be unique across both collections
- Admin users are stored in the `admins` collection
- Regular users are stored in the `users` collection


