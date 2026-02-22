import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citbif';

// Admin Schema (same as in index.js)
const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: 'admin@gmail.com' },
        { username: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Full Name: ${existingAdmin.fullName}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create default admin
    const admin = new Admin({
      fullName: 'Administrator',
      email: 'admin@gmail.com',
      username: 'admin',
      password: hashedPassword,
      profileComplete: false
    });

    await admin.save();

    console.log('✅ Default admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@gmail.com');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Full Name: Administrator');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    if (error.code === 11000) {
      console.error('   Admin user already exists with this email or username');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();

