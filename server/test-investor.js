import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citbif';

// Investor Schema (same as in index.js)
const investorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firm: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  investmentRange: { type: String, required: true },
  focusAreas: [{ type: String }],
  backgroundSummary: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Investor = mongoose.model('Investor', investorSchema);

async function testInvestor() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if investors collection exists and count documents
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const investorsCollection = collections.find(c => c.name === 'investors');
    
    if (investorsCollection) {
      const count = await Investor.countDocuments();
      console.log(`\n📊 Investors collection exists with ${count} documents`);
      
      if (count > 0) {
        const investors = await Investor.find();
        console.log('\n📋 Current investors:');
        investors.forEach(inv => {
          console.log(`  - ${inv.name} (${inv.email})`);
        });
      } else {
        console.log('\n⚠️  Collection exists but is empty');
      }
    } else {
      console.log('\n⚠️  Investors collection does not exist yet');
      console.log('   MongoDB will create it when you add your first investor');
    }

    // List all collections
    console.log('\n📁 All collections in citbif database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testInvestor();


