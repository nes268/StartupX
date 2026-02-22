# Startup Incubation Platform (CITBIF)

A comprehensive full-stack web application for managing startup incubations, facilitating mentorship, investor connections, and document management for startups and administrators.

## 🚀 Features

### For Startups
- **Profile Wizard**: Multi-step profile setup with document upload
- **Dashboard**: Overview of startup status, applications, and progress
- **Document Management**: Upload and manage business documents, pitch decks, and traction data
- **Mentor Matching**: Connect with mentors and schedule sessions
- **Investor Network**: Browse and connect with potential investors
- **Pitch Deck Builder**: Create professional pitch decks using templates
- **Fundraising**: Track funding goals and progress
- **Calendar**: Manage events and important dates

### For Administrators
- **Startup Management**: Review, approve, or reject startup applications
- **Mentor Management**: Add, edit, and manage mentors
- **Investor Management**: Manage investor profiles and information
- **Document Review**: Access and review all startup documents
- **Event Management**: Create and manage incubation events
- **Analytics Dashboard**: Overview of platform statistics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Keerthana-R786/startup.git
cd startup
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif
```

**Note**: If using MongoDB Atlas or a different MongoDB instance, update the `MONGODB_URI` accordingly.

Start the backend server:

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Return to the root directory:

```bash
cd ..
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

### 4. Database Setup

Ensure MongoDB is running on your system. The application will automatically create the necessary collections:
- `admins` - Admin users
- `users` - Regular users
- `profiles` - User profiles
- `startups` - Startup information
- `documents` - Uploaded documents
- `mentors` - Mentor profiles
- `investors` - Investor profiles
- `events` - Events and calendar items
- `notifications` - User notifications

## 📁 Project Structure

```
startup/
├── server/                 # Backend server
│   ├── index.js            # Express server setup
│   ├── package.json        # Backend dependencies
│   ├── uploads/            # Uploaded files directory
│   └── README.md           # Backend documentation
│
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/         # Layout components
│   │   ├── profile/        # Profile wizard components
│   │   └── ui/             # Reusable UI components
│   │
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
│
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🎯 Usage

### First Time Setup

1. **Start MongoDB**: Ensure MongoDB is running on your system
2. **Start Backend**: Run `cd server && npm start`
3. **Start Frontend**: Run `npm run dev` from root directory
4. **Access Application**: Open `http://localhost:5173` in your browser

### Creating an Admin Account

1. Navigate to the signup page
2. Select "Admin" role
3. Fill in your details and submit
4. You'll be redirected to the admin dashboard

### Creating a Startup Account

1. Navigate to the signup page
2. Select "User" role
3. Fill in your details and submit
4. Complete the profile wizard:
   - Personal Information
   - Enterprise Information
   - Incubation Details
   - Documentation Upload
   - Pitch Deck & Traction
   - Funding Information
5. Submit for admin review
6. Wait for approval to access the dashboard

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get all documents
- `GET /api/documents/user/:userId` - Get user documents
- `GET /api/documents/:id` - Get document by ID
- `DELETE /api/documents/:id` - Delete document

### Profiles
- `POST /api/profiles` - Create/update profile
- `GET /api/profiles/user/:userId` - Get user profile

### Startups
- `GET /api/startups` - Get all startups
- `POST /api/startups` - Create startup
- `PUT /api/startups/:id` - Update startup
- `GET /api/startups/user/:userId` - Get user's startup

### Mentors
- `GET /api/mentors` - Get all mentors
- `POST /api/mentors` - Create mentor
- `PUT /api/mentors/:id` - Update mentor
- `DELETE /api/mentors/:id` - Delete mentor

### Investors
- `GET /api/investors` - Get all investors
- `POST /api/investors` - Create investor
- `PUT /api/investors/:id` - Update investor
- `DELETE /api/investors/:id` - Delete investor

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## 🧪 Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
npm run dev
```

### Building for Production

**Frontend:**
```bash
npm run build
```

The production build will be in the `dist` directory.

**Backend:**
```bash
cd server
npm start
```

## 📝 Environment Variables

### Backend (.env in server/)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif
```

### Frontend (.env in root/)
```env
VITE_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.



## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: Make sure MongoDB is running before starting the backend server. For production deployment, update the environment variables accordingly and ensure proper security measures are in place.

