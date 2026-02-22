import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citbif';

// User Schema (same as in index.js)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: 'user@gmail.com' },
        { username: 'user' }
      ]
    });

    if (existingUser) {
      console.log('⚠️  User already exists:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Full Name: ${existingUser.fullName}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('user123', 10);

    // Create default startup user
    const user = new User({
      fullName: 'Startup User',
      email: 'user@gmail.com',
      username: 'user',
      password: hashedPassword,
      profileComplete: false
    });

    await user.save();

    console.log('✅ Startup user created successfully!');
    console.log('\n📋 User Credentials:');
    console.log('   Email: user@gmail.com');
    console.log('   Username: user');
    console.log('   Password: user123');
    console.log('   Full Name: Startup User');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding user:', error.message);
    if (error.code === 11000) {
      console.error('   User already exists with this email or username');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedUser();


