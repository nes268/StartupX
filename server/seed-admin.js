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

const DEFAULT_EMAIL = 'admin@gmail.com';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    let existingAdmin =
      (await Admin.findOne({ email: new RegExp(`^${DEFAULT_EMAIL}$`, 'i') })) ||
      (await Admin.findOne({ username: DEFAULT_USERNAME }));

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.email = DEFAULT_EMAIL;
      existingAdmin.username = DEFAULT_USERNAME;
      await existingAdmin.save();
      console.log('✅ Admin account updated (password reset to default).');
      console.log('\n📋 Admin Credentials:');
      console.log(`   Email: ${DEFAULT_EMAIL}`);
      console.log(`   Username: ${DEFAULT_USERNAME}`);
      console.log(`   Password: ${DEFAULT_PASSWORD}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const admin = new Admin({
      fullName: 'Administrator',
      email: DEFAULT_EMAIL,
      username: DEFAULT_USERNAME,
      password: hashedPassword,
      profileComplete: false
    });

    await admin.save();

    console.log('✅ Default admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${DEFAULT_EMAIL}`);
    console.log(`   Username: ${DEFAULT_USERNAME}`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
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

