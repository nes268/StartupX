import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(pdf|docx|xlsx|pptx|txt|jpg|jpeg|png|doc|xls|ppt)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, XLSX, PPTX, TXT, JPG, JPEG, PNG, DOC, XLS, PPT are allowed.'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citbif';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Mentor Schema
const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  bio: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  organizedBy: { type: String, required: true },
  registrationLink: { type: String, default: '' },
  onlineEventUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Investor Schema
const investorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firm: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, default: '' },
  investmentRange: { type: String, required: true },
  focusAreas: [{ type: String }],
  backgroundSummary: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Document Schema
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  owner: { type: String, required: true },
  fileSize: { type: String, required: true },
  uploadDate: { type: String, required: true },
  type: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Report Schema
const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  dateGenerated: { type: String, required: true },
  fileSize: { type: String, required: true },
  status: { type: String, enum: ['ready', 'processing', 'error'], default: 'ready' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }, // Admin who uploaded the report
  filePaths: [{ type: String, required: true }], // Array of file paths
  fileNames: [{ type: String, required: true }], // Array of original file names
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Notification Schema
const userNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['approval', 'rejection', 'info', 'warning'], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Admin Notification Schema
const adminNotificationSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }, // null means notification for all admins
  message: { type: String, required: true },
  type: { type: String, enum: ['new', 'info', 'feedback', 'review', 'signup', 'application', 'milestone'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userName: { type: String, required: false },
  userEmail: { type: String, required: false },
  userRole: { type: String, enum: ['user', 'admin'], required: false },
  time: { type: String, required: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Step 1: Personal Information
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  location: { type: String, required: true },
  // Step 2: Enterprise Information
  startupName: { type: String, required: true },
  entityType: { type: String, required: true },
  applicationType: { type: String, enum: ['innovation', 'incubation'], required: true },
  founderName: { type: String, required: true },
  coFounderNames: [{ type: String }],
  sector: { type: String, required: true },
  linkedinProfile: { type: String, default: '' },
  // Step 3: Incubation Details
  previouslyIncubated: { type: Boolean, default: false },
  incubatorName: { type: String, default: '' },
  incubatorLocation: { type: String, default: '' },
  incubationDuration: { type: String, default: '' },
  incubatorType: { type: String, default: '' },
  incubationMode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
  supportsReceived: [{ type: String }],
  // Step 4: Documentation
  aadhaarDoc: { type: String, required: true },
  incorporationCert: { type: String, default: '' },
  msmeCert: { type: String, default: '' },
  dpiitCert: { type: String, default: '' },
  mouPartnership: { type: String, default: '' },
  // Step 5: Pitch Deck & Traction
  businessDocuments: [{ type: String }],
  tractionDetails: [{ type: String }],
  balanceSheet: { type: String, default: '' },
  // Step 6: Funding Information
  fundingStage: { type: String, required: true },
  alreadyFunded: { type: Boolean, default: false },
  fundingAmount: { type: Number, default: 0 },
  fundingSource: { type: String, default: '' },
  fundingDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Startup Schema (for admin dashboard)
const startupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  founder: { type: String, required: true },
  sector: { type: String, required: true },
  type: { type: String, enum: ['innovation', 'incubation'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'dropout'], default: 'pending' },
  email: { type: String, required: true },
  submissionDate: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startupPhase: { type: String, enum: ['idea', 'mvp', 'seed', 'series-a', 'growth', 'scale'], default: 'idea' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);
const User = mongoose.model('User', userSchema);
const Mentor = mongoose.model('Mentor', mentorSchema);
const Event = mongoose.model('Event', eventSchema);
const Investor = mongoose.model('Investor', investorSchema);
const Document = mongoose.model('Document', documentSchema);
const Report = mongoose.model('Report', reportSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Startup = mongoose.model('Startup', startupSchema);
const UserNotification = mongoose.model('UserNotification', userNotificationSchema);
const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, username, password, role } = req.body;

    // Validation
    if (!fullName || !email || !username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Invalid role. Must be admin or user' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email or username already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingAdmin || existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Create user based on role
    let newUser;
    if (role === 'admin') {
      newUser = new Admin({
        fullName,
        email,
        username,
        password: hashedPassword,
        profileComplete: false
      });
      await newUser.save();
    } else {
      newUser = new User({
        fullName,
        email,
        username,
        password: hashedPassword,
        profileComplete: false
      });
      await newUser.save();

      // Create notification for all admins when a new user signs up
      const admins = await Admin.find({});
      const notificationPromises = admins.map(admin => {
        const notification = new AdminNotification({
          adminId: admin._id,
          message: `New applicant: ${fullName} (${email})`,
          type: 'signup',
          userId: newUser._id,
          userName: fullName,
          userEmail: email,
          userRole: 'user',
          time: 'Just now',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return notification.save();
      });

      // If no admins exist yet, create a general notification
      if (admins.length === 0) {
        const generalNotification = new AdminNotification({
          adminId: null,
          message: `New applicant: ${fullName} (${email})`,
          type: 'signup',
          userId: newUser._id,
          userName: fullName,
          userEmail: email,
          userRole: 'user',
          time: 'Just now',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await generalNotification.save();
      } else {
        await Promise.all(notificationPromises);
      }
    }

    // Return user data (without password)
    const userResponse = {
      id: newUser._id.toString(),
      fullName: newUser.fullName,
      email: newUser.email,
      username: newUser.username,
      role: role,
      profileComplete: newUser.profileComplete,
      createdAt: newUser.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Try to find user in Admin collection first
    let foundUser = await Admin.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    let userRole = 'admin';

    // If not found in Admin, try User collection
    if (!foundUser) {
      foundUser = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
      });
      userRole = 'user';
    }

    // If user not found in either collection
    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid username/password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username/password' });
    }

    // Return user data (without password)
    const userResponse = {
      id: foundUser._id.toString(),
      fullName: foundUser.fullName,
      email: foundUser.email,
      username: foundUser.username,
      role: userRole,
      profileComplete: foundUser.profileComplete,
      createdAt: foundUser.createdAt.toISOString()
    };

    res.status(200).json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ==================== MENTOR ENDPOINTS ====================

// GET all mentors
app.get('/api/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    const mentorsResponse = mentors.map(mentor => ({
      id: mentor._id.toString(),
      name: mentor.name,
      role: mentor.role,
      email: mentor.email,
      experience: mentor.experience,
      bio: mentor.bio,
      profilePicture: mentor.profilePicture,
      rating: mentor.rating,
      createdAt: mentor.createdAt.toISOString(),
      updatedAt: mentor.updatedAt.toISOString()
    }));
    res.status(200).json(mentorsResponse);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Server error while fetching mentors' });
  }
});

// GET mentor by ID
app.get('/api/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    const mentor = await Mentor.findById(id);
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.status(200).json({
      id: mentor._id.toString(),
      name: mentor.name,
      role: mentor.role,
      email: mentor.email,
      experience: mentor.experience,
      bio: mentor.bio,
      profilePicture: mentor.profilePicture,
      rating: mentor.rating,
      createdAt: mentor.createdAt.toISOString(),
      updatedAt: mentor.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ error: 'Server error while fetching mentor' });
  }
});

// POST create mentor
app.post('/api/mentors', async (req, res) => {
  try {
    const { name, role, email, experience, bio, profilePicture } = req.body;

    // Validation
    if (!name || !role || !email || !experience || !bio) {
      return res.status(400).json({ error: 'Name, role, email, experience, and bio are required' });
    }

    // Check if email already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return res.status(400).json({ error: 'A mentor with this email already exists' });
    }

    // Create new mentor
    const newMentor = new Mentor({
      name,
      role,
      email,
      experience,
      bio,
      profilePicture: profilePicture || '',
      rating: 5.0, // Default rating for new mentors
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newMentor.save();

    res.status(201).json({
      id: newMentor._id.toString(),
      name: newMentor.name,
      role: newMentor.role,
      email: newMentor.email,
      experience: newMentor.experience,
      bio: newMentor.bio,
      profilePicture: newMentor.profilePicture,
      rating: newMentor.rating,
      createdAt: newMentor.createdAt.toISOString(),
      updatedAt: newMentor.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating mentor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A mentor with this email already exists' });
    }
    res.status(500).json({ error: 'Server error while creating mentor' });
  }
});

// PUT update mentor
app.put('/api/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, experience, bio, profilePicture } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    // Check if mentor exists
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Check if email is being changed and if it conflicts with another mentor
    if (email && email !== mentor.email) {
      const existingMentor = await Mentor.findOne({ email });
      if (existingMentor) {
        return res.status(400).json({ error: 'A mentor with this email already exists' });
      }
    }

    // Update mentor fields
    if (name) mentor.name = name;
    if (role) mentor.role = role;
    if (email) mentor.email = email;
    if (experience) mentor.experience = experience;
    if (bio) mentor.bio = bio;
    if (profilePicture !== undefined) mentor.profilePicture = profilePicture;
    mentor.updatedAt = new Date();

    await mentor.save();

    res.status(200).json({
      id: mentor._id.toString(),
      name: mentor.name,
      role: mentor.role,
      email: mentor.email,
      experience: mentor.experience,
      bio: mentor.bio,
      profilePicture: mentor.profilePicture,
      rating: mentor.rating,
      createdAt: mentor.createdAt.toISOString(),
      updatedAt: mentor.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A mentor with this email already exists' });
    }
    res.status(500).json({ error: 'Server error while updating mentor' });
  }
});

// DELETE mentor
app.delete('/api/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    const mentor = await Mentor.findByIdAndDelete(id);
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.status(200).json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    res.status(500).json({ error: 'Server error while deleting mentor' });
  }
});

// POST send mentor session request email
app.post('/api/mentors/request-session', async (req, res) => {
  try {
    const { mentorEmail, startupName, topic, preferredTimeSlot, additionalNotes, requesterEmail, requesterName } = req.body;

    // Validation
    if (!mentorEmail || !startupName || !topic || !preferredTimeSlot) {
      return res.status(400).json({ error: 'Mentor email, startup name, topic, and preferred time slot are required' });
    }

    // Find mentor to get their name
    const mentor = await Mentor.findOne({ email: mentorEmail });
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Configure nodemailer transporter
    // For production, use environment variables for email credentials
    // For development/testing, you can use a service like Gmail, SendGrid, or Mailtrap
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
      },
    });

    // If no email credentials are configured, return a helpful error
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.warn('Email credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
      // For development, you can still return success but log the email content
      console.log('Email would be sent with the following content:');
      console.log('To:', mentorEmail);
      console.log('Subject: Mentoring Session Request from', startupName);
      console.log('Body:', {
        startupName,
        topic,
        preferredTimeSlot,
        additionalNotes,
        requesterEmail,
        requesterName
      });
      
      return res.status(200).json({ 
        message: 'Session request logged (email not configured). Please configure SMTP settings for production.',
        logged: true
      });
    }

    // Format topic display name
    const topicDisplayNames = {
      'business-strategy': 'Business Strategy',
      'product-development': 'Product Development',
      'marketing': 'Marketing & Growth',
      'fundraising': 'Fundraising',
      'operations': 'Operations',
      'leadership': 'Leadership'
    };

    const topicDisplay = topicDisplayNames[topic] || topic;

    // Format time slot display name
    const timeSlotDisplayNames = {
      'morning': 'Morning (9 AM - 12 PM)',
      'afternoon': 'Afternoon (12 PM - 5 PM)',
      'evening': 'Evening (5 PM - 8 PM)',
      'flexible': 'Flexible'
    };

    const timeSlotDisplay = timeSlotDisplayNames[preferredTimeSlot] || preferredTimeSlot;

    // Email content
    const emailSubject = `Mentoring Session Request from ${startupName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #06b6d4;">New Mentoring Session Request</h2>
        <p>Hello ${mentor.name},</p>
        <p>You have received a new mentoring session request:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Session Details</h3>
          <p><strong>Startup Name:</strong> ${startupName}</p>
          <p><strong>Topic:</strong> ${topicDisplay}</p>
          <p><strong>Preferred Time Slot:</strong> ${timeSlotDisplay}</p>
          ${requesterName ? `<p><strong>Requested By:</strong> ${requesterName}</p>` : ''}
          ${requesterEmail ? `<p><strong>Contact Email:</strong> ${requesterEmail}</p>` : ''}
          ${additionalNotes ? `<p><strong>Additional Notes:</strong><br>${additionalNotes.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
        
        <p>Please review this request and respond to ${requesterEmail || 'the requester'} at your earliest convenience.</p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This is an automated message from the StartupX Dashboard.
        </p>
      </div>
    `;

    const emailText = `
New Mentoring Session Request

Hello ${mentor.name},

You have received a new mentoring session request:

Session Details:
- Startup Name: ${startupName}
- Topic: ${topicDisplay}
- Preferred Time Slot: ${timeSlotDisplay}
${requesterName ? `- Requested By: ${requesterName}` : ''}
${requesterEmail ? `- Contact Email: ${requesterEmail}` : ''}
${additionalNotes ? `- Additional Notes:\n${additionalNotes}` : ''}

Please review this request and respond to ${requesterEmail || 'the requester'} at your earliest convenience.

This is an automated message from the StartupX Dashboard.
    `;

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.EMAIL_USER || 'noreply@citbif.com',
      to: mentorEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Session request email sent successfully',
      sent: true
    });
  } catch (error) {
    console.error('Error sending mentor session request email:', error);
    res.status(500).json({ error: 'Server error while sending email: ' + error.message });
  }
});

// ==================== EVENT ENDPOINTS ====================

// GET all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    const eventsResponse = events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizedBy: event.organizedBy,
      registrationLink: event.registrationLink,
      onlineEventUrl: event.onlineEventUrl,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }));
    res.status(200).json(eventsResponse);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error while fetching events' });
  }
});

// GET upcoming events
app.get('/api/events/upcoming', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await Event.find().sort({ date: 1 });
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });
    
    const eventsResponse = upcomingEvents.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizedBy: event.organizedBy,
      registrationLink: event.registrationLink,
      onlineEventUrl: event.onlineEventUrl,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }));
    res.status(200).json(eventsResponse);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Server error while fetching upcoming events' });
  }
});

// GET completed events
app.get('/api/events/completed', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await Event.find().sort({ date: -1 });
    const completedEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today;
    });
    
    const eventsResponse = completedEvents.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizedBy: event.organizedBy,
      registrationLink: event.registrationLink,
      onlineEventUrl: event.onlineEventUrl,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }));
    res.status(200).json(eventsResponse);
  } catch (error) {
    console.error('Error fetching completed events:', error);
    res.status(500).json({ error: 'Server error while fetching completed events' });
  }
});

// GET event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid event ID format: ${id}. Expected a valid MongoDB ObjectId.` });
    }

    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${id} not found` });
    }

    res.status(200).json({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizedBy: event.organizedBy,
      registrationLink: event.registrationLink,
      onlineEventUrl: event.onlineEventUrl,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Server error while fetching event' });
  }
});

// POST create event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, time, location, category, organizedBy, registrationLink, onlineEventUrl } = req.body;

    if (!title || !description || !date || !time || !location || !category || !organizedBy) {
      return res.status(400).json({ error: 'Title, description, date, time, location, category, and organizedBy are required' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      category,
      organizedBy,
      registrationLink: registrationLink || '',
      onlineEventUrl: onlineEventUrl || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newEvent.save();

    res.status(201).json({
      id: newEvent._id.toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      category: newEvent.category,
      organizedBy: newEvent.organizedBy,
      registrationLink: newEvent.registrationLink,
      onlineEventUrl: newEvent.onlineEventUrl,
      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error while creating event' });
  }
});

// PUT update event
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, category, organizedBy, registrationLink, onlineEventUrl } = req.body;

    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid event ID format: ${id}. Expected a valid MongoDB ObjectId.` });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${id} not found` });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (category) event.category = category;
    if (organizedBy) event.organizedBy = organizedBy;
    if (registrationLink !== undefined) event.registrationLink = registrationLink;
    if (onlineEventUrl !== undefined) event.onlineEventUrl = onlineEventUrl;
    event.updatedAt = new Date();

    await event.save();

    res.status(200).json({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizedBy: event.organizedBy,
      registrationLink: event.registrationLink,
      onlineEventUrl: event.onlineEventUrl,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error while updating event' });
  }
});

// DELETE event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid event ID format: ${id}. Expected a valid MongoDB ObjectId.` });
    }

    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${id} not found` });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error while deleting event' });
  }
});

// GET event categories
app.get('/api/events/categories', async (req, res) => {
  try {
    const categories = ['Workshop', 'Competition', 'Networking', 'Summit', 'Training', 'Conference', 'Meetup', 'Webinar'];
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error while fetching categories' });
  }
});

// ==================== INVESTOR ENDPOINTS ====================

// GET all investors
app.get('/api/investors', async (req, res) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    const investorsResponse = investors.map(investor => ({
      id: investor._id.toString(),
      name: investor.name,
      firm: investor.firm,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investmentRange: investor.investmentRange,
      focusAreas: investor.focusAreas,
      backgroundSummary: investor.backgroundSummary,
      profilePicture: investor.profilePicture,
      createdAt: investor.createdAt.toISOString(),
      updatedAt: investor.updatedAt.toISOString()
    }));
    res.status(200).json(investorsResponse);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Server error while fetching investors' });
  }
});

// POST request intro to investor (must be before /:id route)
app.post('/api/investors/request-intro', async (req, res) => {
  try {
    const { investorEmail, startupName, requesterEmail, requesterName, message } = req.body;

    // Validation
    if (!investorEmail || !startupName || !requesterEmail || !requesterName) {
      return res.status(400).json({ error: 'Investor email, startup name, requester email, and requester name are required' });
    }

    // Find investor to get their name
    const investor = await Investor.findOne({ email: investorEmail });
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
      },
    });

    // If no email credentials are configured, return a helpful error
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.warn('Email credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
      // For development, you can still return success but log the email content
      console.log('Email would be sent with the following content:');
      console.log('To:', investorEmail);
      console.log('Subject: Introduction Request from', startupName);
      console.log('Body:', {
        investorName: investor.name,
        startupName,
        requesterEmail,
        requesterName,
        message
      });
      
      return res.status(200).json({ 
        message: 'Intro request logged (email not configured). Please configure SMTP settings for production.',
        logged: true
      });
    }

    // Email content
    const emailSubject = `Introduction Request from ${startupName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #06b6d4;">New Introduction Request</h2>
        <p>Hello ${investor.name},</p>
        <p>You have received a new introduction request:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Request Details</h3>
          <p><strong>Startup Name:</strong> ${startupName}</p>
          <p><strong>Requested By:</strong> ${requesterName}</p>
          <p><strong>Contact Email:</strong> ${requesterEmail}</p>
          ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
        
        <p>Please review this request and respond to ${requesterEmail} at your earliest convenience.</p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This is an automated message from the StartupX Dashboard.
        </p>
      </div>
    `;

    const emailText = `
New Introduction Request

Hello ${investor.name},

You have received a new introduction request:

Startup Name: ${startupName}
Requested By: ${requesterName}
Contact Email: ${requesterEmail}
${message ? `Message: ${message}` : ''}

Please review this request and respond to ${requesterEmail} at your earliest convenience.

This is an automated message from the StartupX Dashboard.
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
      to: investorEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    res.status(200).json({ 
      message: 'Introduction request email sent successfully',
      sent: true
    });
  } catch (error) {
    console.error('Error sending intro request email:', error);
    res.status(500).json({ error: 'Server error while sending intro request email' });
  }
});

// GET investor by ID
app.get('/api/investors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid investor ID' });
    }

    const investor = await Investor.findById(id);
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.status(200).json({
      id: investor._id.toString(),
      name: investor.name,
      firm: investor.firm,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investmentRange: investor.investmentRange,
      focusAreas: investor.focusAreas,
      backgroundSummary: investor.backgroundSummary,
      profilePicture: investor.profilePicture,
      createdAt: investor.createdAt.toISOString(),
      updatedAt: investor.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching investor:', error);
    res.status(500).json({ error: 'Server error while fetching investor' });
  }
});

// POST create investor
app.post('/api/investors', async (req, res) => {
  try {
    const { name, firm, email, phoneNumber, investmentRange, focusAreas, backgroundSummary, profilePicture } = req.body;

    if (!name || !firm || !email || !investmentRange || !backgroundSummary) {
      return res.status(400).json({ error: 'Name, firm, email, investmentRange, and backgroundSummary are required' });
    }

    const existingInvestor = await Investor.findOne({ email });
    if (existingInvestor) {
      return res.status(400).json({ error: 'An investor with this email already exists' });
    }

    const newInvestor = new Investor({
      name,
      firm,
      email,
      phoneNumber: phoneNumber || '',
      investmentRange,
      focusAreas: focusAreas || [],
      backgroundSummary,
      profilePicture: profilePicture || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newInvestor.save();

    res.status(201).json({
      id: newInvestor._id.toString(),
      name: newInvestor.name,
      firm: newInvestor.firm,
      email: newInvestor.email,
      phoneNumber: newInvestor.phoneNumber,
      investmentRange: newInvestor.investmentRange,
      focusAreas: newInvestor.focusAreas,
      backgroundSummary: newInvestor.backgroundSummary,
      profilePicture: newInvestor.profilePicture,
      createdAt: newInvestor.createdAt.toISOString(),
      updatedAt: newInvestor.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating investor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An investor with this email already exists' });
    }
    res.status(500).json({ error: 'Server error while creating investor' });
  }
});

// PUT update investor
app.put('/api/investors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, firm, email, phoneNumber, investmentRange, focusAreas, backgroundSummary, profilePicture } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid investor ID' });
    }

    const investor = await Investor.findById(id);
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    if (email && email !== investor.email) {
      const existingInvestor = await Investor.findOne({ email });
      if (existingInvestor) {
        return res.status(400).json({ error: 'An investor with this email already exists' });
      }
    }

    if (name) investor.name = name;
    if (firm) investor.firm = firm;
    if (email) investor.email = email;
    if (phoneNumber) investor.phoneNumber = phoneNumber;
    if (investmentRange) investor.investmentRange = investmentRange;
    if (focusAreas) investor.focusAreas = focusAreas;
    if (backgroundSummary) investor.backgroundSummary = backgroundSummary;
    if (profilePicture !== undefined) investor.profilePicture = profilePicture;
    investor.updatedAt = new Date();

    await investor.save();

    res.status(200).json({
      id: investor._id.toString(),
      name: investor.name,
      firm: investor.firm,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investmentRange: investor.investmentRange,
      focusAreas: investor.focusAreas,
      backgroundSummary: investor.backgroundSummary,
      profilePicture: investor.profilePicture,
      createdAt: investor.createdAt.toISOString(),
      updatedAt: investor.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating investor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An investor with this email already exists' });
    }
    res.status(500).json({ error: 'Server error while updating investor' });
  }
});

// DELETE investor
app.delete('/api/investors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid investor ID' });
    }

    const investor = await Investor.findByIdAndDelete(id);
    
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.status(200).json({ message: 'Investor deleted successfully' });
  } catch (error) {
    console.error('Error deleting investor:', error);
    res.status(500).json({ error: 'Server error while deleting investor' });
  }
});

// ==================== DOCUMENT ENDPOINTS ====================

// GET all documents (filtered by userId if provided, admin can see all)
app.get('/api/documents', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    // If userId is provided, filter by userId (for regular users)
    if (userId && userId !== 'admin') {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      query.userId = userId;
    }
    
    const documents = await Document.find(query).populate('userId', 'fullName email').sort({ createdAt: -1 });
    const documentsResponse = documents.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      owner: doc.owner,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadDate,
      type: doc.type,
      userId: doc.userId ? (typeof doc.userId === 'object' ? doc.userId._id.toString() : doc.userId.toString()) : null,
      filePath: doc.filePath,
      fileUrl: doc.filePath ? `/uploads/${path.basename(doc.filePath)}` : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));
    res.status(200).json(documentsResponse);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error while fetching documents' });
  }
});

// GET documents by userId (for admin to view startup documents)
app.get('/api/documents/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Received userId:', userId, 'Type:', typeof userId);
    
    if (!userId || userId === 'null' || userId === 'undefined') {
      console.error('Missing or invalid userId:', userId);
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ error: `Invalid user ID format: ${userId}` });
    }

    console.log('Fetching documents for userId:', userId);
    const documents = await Document.find({ userId }).populate('userId', 'fullName email').sort({ createdAt: -1 });
    console.log(`Found ${documents.length} documents for userId: ${userId}`);
    
    const documentsResponse = documents.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      owner: doc.owner,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadDate,
      type: doc.type,
      userId: doc.userId ? (typeof doc.userId === 'object' ? doc.userId._id.toString() : doc.userId.toString()) : null,
      filePath: doc.filePath,
      fileUrl: doc.filePath ? `/uploads/${path.basename(doc.filePath)}` : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));
    res.status(200).json(documentsResponse);
  } catch (error) {
    console.error('Error fetching documents by user:', error);
    res.status(500).json({ error: `Server error while fetching documents: ${error.message}` });
  }
});

// GET documents by startup ID (alternative endpoint)
app.get('/api/documents/startup/:startupId', async (req, res) => {
  try {
    const { startupId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      console.error('Invalid startup ID format:', startupId);
      return res.status(400).json({ error: 'Invalid startup ID format' });
    }

    // Find the startup to get its userId and email
    const startup = await Startup.findById(startupId);
    if (!startup) {
      console.error('Startup not found:', startupId);
      return res.status(404).json({ error: 'Startup not found' });
    }

    console.log('Startup found:', startup.name, 'email:', startup.email, 'userId:', startup.userId);

    let documents = [];
    let userId = null;

    // Method 1: Try to use startup.userId if available
    if (startup.userId) {
      // Handle userId whether it's populated (object) or not (ObjectId)
      userId = typeof startup.userId === 'object' && startup.userId._id 
        ? startup.userId._id.toString() 
        : startup.userId.toString();
      
      if (mongoose.Types.ObjectId.isValid(userId)) {
        console.log('Fetching documents using startup.userId:', userId);
        documents = await Document.find({ userId: userId }).populate('userId', 'fullName email').sort({ createdAt: -1 });
        console.log(`Found ${documents.length} documents using startup.userId`);
      }
    }

    // Method 2: If no documents found and startup has email, try to find user by email and get their documents
    if (documents.length === 0 && startup.email) {
      console.log('No documents found via userId, trying to find user by email:', startup.email);
      const user = await User.findOne({ email: startup.email });
      if (user) {
        userId = user._id.toString();
        console.log('Found user by email, userId:', userId);
        documents = await Document.find({ userId: userId }).populate('userId', 'fullName email').sort({ createdAt: -1 });
        console.log(`Found ${documents.length} documents using user email lookup`);
      } else {
        console.log('No user found with email:', startup.email);
      }
    }

    // Method 3: Try to find documents by owner name matching startup founder
    if (documents.length === 0 && startup.founder) {
      console.log('Trying to find documents by owner name:', startup.founder);
      documents = await Document.find({ owner: { $regex: startup.founder, $options: 'i' } })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });
      console.log(`Found ${documents.length} documents by owner name`);
    }

    if (documents.length === 0) {
      console.log(`No documents found for startup: ${startupId} (${startup.name})`);
    }
    
    const documentsResponse = documents.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      owner: doc.owner,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadDate,
      type: doc.type,
      userId: doc.userId ? (typeof doc.userId === 'object' ? doc.userId._id.toString() : doc.userId.toString()) : null,
      filePath: doc.filePath,
      fileUrl: doc.filePath ? `/uploads/${path.basename(doc.filePath)}` : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));
    res.status(200).json(documentsResponse);
  } catch (error) {
    console.error('Error fetching documents by startup:', error);
    res.status(500).json({ error: `Server error while fetching documents: ${error.message}` });
  }
});

// GET document by ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(id).populate('userId', 'fullName email');
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({
      id: document._id.toString(),
      name: document.name,
      location: document.location,
      owner: document.owner,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
      type: document.type,
      userId: document.userId ? (typeof document.userId === 'object' ? document.userId._id.toString() : document.userId.toString()) : null,
      filePath: document.filePath,
      fileUrl: document.filePath ? `/uploads/${path.basename(document.filePath)}` : null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Server error while fetching document' });
  }
});

// GET document file download
app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(document.filePath, document.name, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Server error while downloading document' });
  }
});

// POST upload document with file
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, location } = req.body;
    
    console.log('Upload request received. userId:', userId, 'userId type:', typeof userId, 'location:', location);
    
    if (!userId) {
      // Delete uploaded file if userId is missing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: `Invalid user ID format: ${userId}` });
    }

    // Check if user exists in User collection first
    let user = await User.findById(userId);
    let userRole = 'user';
    
    // If not found in User collection, check Admin collection
    if (!user) {
      user = await Admin.findById(userId);
      userRole = 'admin';
    }
    
    if (!user) {
      console.error('User not found with ID:', userId);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'User not found' });
    }

    const fileSize = (req.file.size / 1024 / 1024).toFixed(2) + ' MB';
    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase();
    const uploadDate = new Date().toISOString().split('T')[0];
    
    // Use provided location or default to 'Documents/Uploads'
    const documentLocation = location || 'Documents/Uploads';

    const newDocument = new Document({
      name: req.file.originalname,
      location: documentLocation,
      owner: user.fullName,
      fileSize: fileSize,
      uploadDate: uploadDate,
      type: fileType,
      userId: userId,
      filePath: req.file.path,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newDocument.save();

    res.status(201).json({
      id: newDocument._id.toString(),
      name: newDocument.name,
      location: newDocument.location,
      owner: newDocument.owner,
      fileSize: newDocument.fileSize,
      uploadDate: newDocument.uploadDate,
      type: newDocument.type,
      userId: newDocument.userId.toString(),
      filePath: newDocument.filePath,
      fileUrl: `/uploads/${path.basename(newDocument.filePath)}`,
      createdAt: newDocument.createdAt.toISOString(),
      updatedAt: newDocument.updatedAt.toISOString()
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Server error while uploading document' });
  }
});

// POST create document (legacy endpoint for backward compatibility)
app.post('/api/documents', async (req, res) => {
  try {
    const { name, location, owner, fileSize, uploadDate, type, userId } = req.body;

    if (!name || !location || !owner || !fileSize || !uploadDate || !type || !userId) {
      return res.status(400).json({ error: 'All fields including userId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const newDocument = new Document({
      name,
      location,
      owner,
      fileSize,
      uploadDate,
      type,
      userId,
      filePath: '', // Empty for legacy documents
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newDocument.save();

    res.status(201).json({
      id: newDocument._id.toString(),
      name: newDocument.name,
      location: newDocument.location,
      owner: newDocument.owner,
      fileSize: newDocument.fileSize,
      uploadDate: newDocument.uploadDate,
      type: newDocument.type,
      userId: newDocument.userId.toString(),
      filePath: newDocument.filePath,
      createdAt: newDocument.createdAt.toISOString(),
      updatedAt: newDocument.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Server error while creating document' });
  }
});

// PUT update document
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, owner, fileSize, uploadDate, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (name) document.name = name;
    if (location) document.location = location;
    if (owner) document.owner = owner;
    if (fileSize) document.fileSize = fileSize;
    if (uploadDate) document.uploadDate = uploadDate;
    if (type) document.type = type;
    document.updatedAt = new Date();

    await document.save();

    res.status(200).json({
      id: document._id.toString(),
      name: document.name,
      location: document.location,
      owner: document.owner,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
      type: document.type,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Server error while updating document' });
  }
});

// DELETE document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete the physical file if it exists
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    await Document.findByIdAndDelete(id);

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Server error while deleting document' });
  }
});

// ==================== REPORT ENDPOINTS ====================

// GET all reports
app.get('/api/reports', async (req, res) => {
  try {
    const { adminId } = req.query;
    let query = {};
    
    // If adminId is provided, filter by admin
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      query = { adminId: new mongoose.Types.ObjectId(adminId) };
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });

    const reportsResponse = reports.map(report => ({
      id: report._id.toString(),
      name: report.name,
      type: report.type,
      dateGenerated: report.dateGenerated,
      fileSize: report.fileSize,
      status: report.status,
      filePaths: report.filePaths || [],
      fileNames: report.fileNames || [],
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString()
    }));
    res.status(200).json(reportsResponse);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Server error while fetching reports' });
  }
});

// GET report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({
      id: report._id.toString(),
      name: report.name,
      type: report.type,
      dateGenerated: report.dateGenerated,
      fileSize: report.fileSize,
      status: report.status,
      filePaths: report.filePaths || [],
      fileNames: report.fileNames || [],
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Server error while fetching report' });
  }
});

// GET download report file
app.get('/api/reports/:id/download/:fileIndex', async (req, res) => {
  try {
    const { id, fileIndex } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if report has files
    if (!report.filePaths || report.filePaths.length === 0) {
      return res.status(404).json({ error: 'No files found for this report' });
    }

    const index = parseInt(fileIndex);
    if (isNaN(index) || index < 0 || index >= report.filePaths.length) {
      return res.status(400).json({ error: `Invalid file index. Report has ${report.filePaths.length} file(s)` });
    }

    const filePath = report.filePaths[index];
    const fileName = report.fileNames && report.fileNames[index] ? report.fileNames[index] : `report-file-${index}`;

    // Resolve absolute path if needed
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);

    console.log('Attempting to download file:', {
      reportId: id,
      fileIndex: index,
      filePath: filePath,
      absolutePath: absolutePath,
      fileName: fileName
    });

    if (!fs.existsSync(absolutePath)) {
      console.error('File not found at path:', absolutePath);
      return res.status(404).json({ error: `File not found: ${fileName}` });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file with error handling
    const fileStream = fs.createReadStream(absolutePath);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading report file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error while downloading file: ' + error.message });
    }
  }
});

// POST create report
// POST create report with file upload
app.post('/api/reports', upload.array('files', 10), async (req, res) => {
  try {
    const { name, type, dateGenerated, adminId } = req.body;
    const files = req.files;

    if (!name || !type || !dateGenerated) {
      // Clean up uploaded files if validation fails
      if (files && files.length > 0) {
        files.forEach(file => {
          const fs = require('fs');
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({ error: 'Name, type, and dateGenerated are required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    // Calculate total file size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Store file paths and names
    const filePaths = files.map(file => file.path);
    const fileNames = files.map(file => file.originalname);

    const newReport = new Report({
      name,
      type,
      dateGenerated,
      fileSize: formatFileSize(totalSize),
      status: 'ready',
      adminId: adminId ? new mongoose.Types.ObjectId(adminId) : null,
      filePaths,
      fileNames,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newReport.save();

    res.status(201).json({
      id: newReport._id.toString(),
      name: newReport.name,
      type: newReport.type,
      dateGenerated: newReport.dateGenerated,
      fileSize: newReport.fileSize,
      status: newReport.status,
      filePaths: newReport.filePaths,
      fileNames: newReport.fileNames,
      createdAt: newReport.createdAt.toISOString(),
      updatedAt: newReport.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating report:', error);
    // Clean up uploaded files on error
    if (req.files && Array.isArray(req.files)) {
      const fs = require('fs');
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ error: 'Server error while creating report' });
  }
});

// PUT update report
app.put('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, dateGenerated, fileSize, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (name) report.name = name;
    if (type) report.type = type;
    if (dateGenerated) report.dateGenerated = dateGenerated;
    if (fileSize) report.fileSize = fileSize;
    if (status) report.status = status;
    report.updatedAt = new Date();

    await report.save();

    res.status(200).json({
      id: report._id.toString(),
      name: report.name,
      type: report.type,
      dateGenerated: report.dateGenerated,
      fileSize: report.fileSize,
      status: report.status,
      filePaths: report.filePaths || [],
      fileNames: report.fileNames || [],
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Server error while updating report' });
  }
});

// DELETE report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await Report.findByIdAndDelete(id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Server error while deleting report' });
  }
});

// ==================== PROFILE ENDPOINTS ====================

// GET profile by user ID
app.get('/api/profiles/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if userId is provided and not empty
    if (!userId || userId === 'null' || userId === 'undefined' || userId.trim() === '') {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ error: `Invalid user ID format: ${userId}` });
    }

    // Convert to ObjectId for query - try both string and ObjectId
    let profile;
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      // Try with ObjectId first
      profile = await Profile.findOne({ userId: userObjectId });
      
      // If not found, try with string (in case userId is stored as string)
      if (!profile) {
        profile = await Profile.findOne({ userId: userId });
      }
    } catch (objectIdError) {
      // If ObjectId conversion fails, try as string
      console.log('Trying userId as string:', userId);
      profile = await Profile.findOne({ userId: userId });
    }
    
    if (!profile) {
      console.log('Profile not found for userId:', userId);
      return res.status(404).json({ error: 'Profile not found for this user' });
    }

    res.status(200).json({
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      location: profile.location,
      startupName: profile.startupName,
      entityType: profile.entityType,
      applicationType: profile.applicationType,
      founderName: profile.founderName,
      coFounderNames: profile.coFounderNames,
      sector: profile.sector,
      linkedinProfile: profile.linkedinProfile,
      previouslyIncubated: profile.previouslyIncubated,
      incubatorName: profile.incubatorName,
      incubatorLocation: profile.incubatorLocation,
      incubationDuration: profile.incubationDuration,
      incubatorType: profile.incubatorType,
      incubationMode: profile.incubationMode,
      supportsReceived: profile.supportsReceived,
      aadhaarDoc: profile.aadhaarDoc,
      incorporationCert: profile.incorporationCert,
      msmeCert: profile.msmeCert,
      dpiitCert: profile.dpiitCert,
      mouPartnership: profile.mouPartnership,
      businessDocuments: profile.businessDocuments,
      tractionDetails: profile.tractionDetails,
      balanceSheet: profile.balanceSheet,
      fundingStage: profile.fundingStage,
      alreadyFunded: profile.alreadyFunded,
      fundingAmount: profile.fundingAmount,
      fundingSource: profile.fundingSource,
      fundingDate: profile.fundingDate,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// POST create/update profile
app.post('/api/profiles', async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ userId });
    
    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await profile.save();
    }

    // Don't update profileComplete here - it will be set when startup is approved
    // The profile is saved but pending admin approval

    res.status(201).json({
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      ...profile.toObject()
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Server error while saving profile' });
  }
});

// PUT update profile
app.put('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    Object.assign(profile, updateData);
    profile.updatedAt = new Date();
    await profile.save();

    res.status(200).json({
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      ...profile.toObject()
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// ==================== STARTUP ENDPOINTS (for admin) ====================

// GET startup by ID
app.get('/api/startups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid startup ID' });
    }

    const startup = await Startup.findById(id).populate('userId', 'fullName email');
    
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    res.status(200).json({
      id: startup._id.toString(),
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      type: startup.type,
      status: startup.status,
      email: startup.email,
      submissionDate: startup.submissionDate,
      userId: startup.userId ? startup.userId.toString() : null,
      startupPhase: startup.startupPhase || 'idea',
      createdAt: startup.createdAt.toISOString(),
      updatedAt: startup.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching startup:', error);
    res.status(500).json({ error: 'Server error while fetching startup' });
  }
});

// GET all startups (with optional userId filter)
app.get('/api/startups', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    // If userId is provided, filter by userId
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      query.userId = userId;
    }
    
    const startups = await Startup.find(query).populate('userId', 'fullName email').sort({ createdAt: -1 });
    const startupsResponse = startups.map(startup => ({
      id: startup._id.toString(),
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      type: startup.type,
      status: startup.status,
      email: startup.email,
      submissionDate: startup.submissionDate,
      userId: startup.userId ? startup.userId.toString() : null,
      startupPhase: startup.startupPhase || 'idea',
      createdAt: startup.createdAt.toISOString(),
      updatedAt: startup.updatedAt.toISOString()
    }));
    res.status(200).json(startupsResponse);
  } catch (error) {
    console.error('Error fetching startups:', error);
    res.status(500).json({ error: 'Server error while fetching startups' });
  }
});

// POST create startup (from profile)
app.post('/api/startups', async (req, res) => {
  try {
    const { name, founder, sector, type, status, email, submissionDate, userId } = req.body;

    if (!name || !founder || !sector || !type || !email || !submissionDate) {
      return res.status(400).json({ error: 'Name, founder, sector, type, email, and submissionDate are required' });
    }

    const newStartup = new Startup({
      name,
      founder,
      sector,
      type,
      status: status || 'pending',
      email,
      submissionDate,
      userId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newStartup.save();

    // Create admin notification for new startup application
    try {
      const adminNotification = new AdminNotification({
        adminId: null, // null means notification for all admins
        message: `New application from ${name} (${sector}) by ${founder}`,
        type: 'application',
        userId: userId ? new mongoose.Types.ObjectId(userId) : null,
        userName: founder,
        userEmail: email,
        userRole: 'user',
        time: 'Just now',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await adminNotification.save();
    } catch (notificationError) {
      // Don't fail startup creation if notification fails
      console.error('Error creating admin notification:', notificationError);
    }

    res.status(201).json({
      id: newStartup._id.toString(),
      name: newStartup.name,
      founder: newStartup.founder,
      sector: newStartup.sector,
      type: newStartup.type,
      status: newStartup.status,
      email: newStartup.email,
      submissionDate: newStartup.submissionDate,
      userId: newStartup.userId ? newStartup.userId.toString() : null,
      startupPhase: newStartup.startupPhase || 'idea',
      createdAt: newStartup.createdAt.toISOString(),
      updatedAt: newStartup.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating startup:', error);
    res.status(500).json({ error: 'Server error while creating startup' });
  }
});

// PUT update startup
app.put('/api/startups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid startup ID' });
    }

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    Object.assign(startup, updateData);
    startup.updatedAt = new Date();
    await startup.save();

    // If startup is approved, update user's profileComplete status
    if (startup.status === 'approved' && startup.userId) {
      const user = await User.findById(startup.userId);
      if (user) {
        user.profileComplete = true;
        await user.save();
      }
    }

    res.status(200).json({
      id: startup._id.toString(),
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      type: startup.type,
      status: startup.status,
      email: startup.email,
      submissionDate: startup.submissionDate,
      userId: startup.userId ? startup.userId.toString() : null,
      startupPhase: startup.startupPhase || 'idea',
      createdAt: startup.createdAt.toISOString(),
      updatedAt: startup.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating startup:', error);
    res.status(500).json({ error: 'Server error while updating startup' });
  }
});

// PUT update startup phase by userId
app.put('/api/startups/phase/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startupPhase } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!startupPhase) {
      return res.status(400).json({ error: 'Startup phase is required' });
    }

    const validPhases = ['idea', 'mvp', 'seed', 'series-a', 'growth', 'scale'];
    if (!validPhases.includes(startupPhase)) {
      return res.status(400).json({ error: 'Invalid startup phase' });
    }

    const startup = await Startup.findOne({ userId: userId });
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found for this user' });
    }

    startup.startupPhase = startupPhase;
    startup.updatedAt = new Date();
    await startup.save();

    res.status(200).json({
      id: startup._id.toString(),
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      type: startup.type,
      status: startup.status,
      email: startup.email,
      submissionDate: startup.submissionDate,
      userId: startup.userId ? startup.userId.toString() : null,
      startupPhase: startup.startupPhase,
      createdAt: startup.createdAt.toISOString(),
      updatedAt: startup.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating startup phase:', error);
    res.status(500).json({ error: 'Server error while updating startup phase' });
  }
});

// POST approve startup
app.post('/api/startups/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid startup ID' });
    }

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    startup.status = 'approved';
    startup.updatedAt = new Date();
    await startup.save();

    // Update user's profileComplete status
    if (startup.userId) {
      const user = await User.findById(startup.userId);
      if (user) {
        user.profileComplete = true;
        await user.save();
      }

      // Create approval notification for the user
      const approvalNotification = new UserNotification({
        userId: startup.userId,
        message: `Congratulations! Your application for ${startup.name} has been approved. You can now access the dashboard.`,
        type: 'approval',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await approvalNotification.save();
    }

    res.status(200).json({
      id: startup._id.toString(),
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      type: startup.type,
      status: startup.status,
      email: startup.email,
      submissionDate: startup.submissionDate,
      userId: startup.userId ? startup.userId.toString() : null,
      startupPhase: startup.startupPhase || 'idea',
      createdAt: startup.createdAt.toISOString(),
      updatedAt: startup.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error approving startup:', error);
    res.status(500).json({ error: 'Server error while approving startup' });
  }
});

// DELETE startup
app.delete('/api/startups/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid startup ID' });
    }

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    await Startup.findByIdAndDelete(id);

    res.status(200).json({ message: 'Startup deleted successfully' });
  } catch (error) {
    console.error('Error deleting startup:', error);
    res.status(500).json({ error: 'Server error while deleting startup' });
  }
});

// POST reject startup
app.post('/api/startups/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid startup ID' });
    }

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    startup.status = 'rejected';
    startup.updatedAt = new Date();
    await startup.save();

    // Create rejection notification for the user
    if (startup.userId) {
      const rejectionNotification = new UserNotification({
        userId: startup.userId,
        message: `Your application for ${startup.name} has been rejected by the admin. Please contact support for more information.`,
        type: 'rejection',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await rejectionNotification.save();
    }

    res.status(200).json({
      id: startup._id.toString(),
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      type: startup.type,
      status: startup.status,
      email: startup.email,
      submissionDate: startup.submissionDate,
      userId: startup.userId ? startup.userId.toString() : null,
      startupPhase: startup.startupPhase || 'idea',
      createdAt: startup.createdAt.toISOString(),
      updatedAt: startup.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error rejecting startup:', error);
    res.status(500).json({ error: 'Server error while rejecting startup' });
  }
});

// ==================== USER NOTIFICATION ENDPOINTS ====================

// GET user notifications
app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const notifications = await UserNotification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const notificationsResponse = notifications.map(notification => ({
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString()
    }));

    res.status(200).json(notificationsResponse);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
});

// PUT mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = await UserNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    notification.updatedAt = new Date();
    await notification.save();

    res.status(200).json({
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error while updating notification' });
  }
});

// GET unread notification count for user
app.get('/api/notifications/user/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const count = await UserNotification.countDocuments({ userId, read: false });

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Server error while fetching unread count' });
  }
});

// ==================== ADMIN NOTIFICATION ENDPOINTS ====================

// GET admin notifications
app.get('/api/notifications/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    // Get notifications for this admin or general notifications (adminId is null)
    const notifications = await AdminNotification.find({
      $or: [
        { adminId: new mongoose.Types.ObjectId(adminId) },
        { adminId: null }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'fullName email')
      .populate('adminId', 'fullName email');

    const notificationsResponse = notifications.map(notification => ({
      id: notification._id.toString(),
      message: notification.message,
      type: notification.type,
      userId: notification.userId ? notification.userId._id.toString() : null,
      userName: notification.userName || (notification.userId ? notification.userId.fullName : null),
      userEmail: notification.userEmail || (notification.userId ? notification.userId.email : null),
      userRole: notification.userRole,
      time: notification.time || 'Just now',
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString()
    }));

    res.status(200).json(notificationsResponse);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ error: 'Server error while fetching admin notifications' });
  }
});

// PUT mark admin notification as read
app.put('/api/notifications/admin/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    notification.updatedAt = new Date();
    await notification.save();

    res.status(200).json({
      id: notification._id.toString(),
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error marking admin notification as read:', error);
    res.status(500).json({ error: 'Server error while updating notification' });
  }
});

// GET unread admin notification count
app.get('/api/notifications/admin/:adminId/unread-count', async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const count = await AdminNotification.countDocuments({
      $or: [
        { adminId: new mongoose.Types.ObjectId(adminId), read: false },
        { adminId: null, read: false }
      ]
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread admin count:', error);
    res.status(500).json({ error: 'Server error while fetching unread count' });
  }
});

// DELETE admin notification
app.delete('/api/notifications/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await AdminNotification.findByIdAndDelete(id);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin notification:', error);
    res.status(500).json({ error: 'Server error while deleting notification' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

