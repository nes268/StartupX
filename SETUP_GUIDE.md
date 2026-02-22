# Signup Module Setup Guide

This guide explains the backend and database setup for the Signup functionality.

## What Was Implemented

1. **Backend Express Server** (`server/index.js`)
   - MongoDB connection using Mongoose
   - Signup API endpoint at `/api/auth/signup`
   - Separate collections for `admin` and `user` roles
   - Password hashing with bcryptjs

2. **Frontend Updates**
   - Updated `Signup.tsx` to use 'admin' and 'user' roles
   - Updated `AuthContext.tsx` to call backend API
   - Updated routing logic for proper redirects
   - Updated type definitions

## Setup Instructions

### 1. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `server` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif
```

**For MongoDB Compass:**
- Open MongoDB Compass
- Copy your connection string (e.g., `mongodb://localhost:27017`)
- Update `MONGODB_URI` in `.env` file with your connection string
- Make sure MongoDB is running

Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 2. Frontend Setup

The frontend is already configured. Make sure to set the API URL if needed:

Create a `.env` file in the root directory (if not exists):
```
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

## How It Works

### Signup Flow

1. **Admin Signup:**
   - User selects "Admin" role
   - Data is sent to `/api/auth/signup`
   - User is stored in `admins` collection in MongoDB
   - Redirects to `/admin/dashboard`

2. **User Signup:**
   - User selects "User" role
   - Data is sent to `/api/auth/signup`
   - User is stored in `users` collection in MongoDB
   - Redirects to `/profile-wizard`
   - After completing profile, redirects to `/dashboard`

### Database Collections

- **admins** - Stores admin users
- **users** - Stores regular users

Both collections have the same schema:
- `fullName` (String, required)
- `email` (String, required, unique)
- `username` (String, required, unique)
- `password` (String, hashed with bcrypt)
- `profileComplete` (Boolean, default: false)
- `createdAt` (Date)

## API Endpoint

### POST /api/auth/signup

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "role": "admin" // or "user"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "admin",
    "profileComplete": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message here"
}
```

## Testing

1. Start MongoDB (if not already running)
2. Start the backend server: `cd server && npm start`
3. Start the frontend: `npm run dev`
4. Navigate to the signup page
5. Try signing up with both "Admin" and "User" roles
6. Verify in MongoDB Compass that users are stored in the correct collections

## Notes

- Passwords are automatically hashed before storage
- Email and username must be unique across both collections
- The backend validates all required fields
- CORS is enabled for frontend-backend communication


