import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citbif';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\n📊 Available databases:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // List collections in the current database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📁 Collections in '${db.databaseName}':`);
    if (collections.length === 0) {
      console.log('  (No collections found - database is empty)');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }

    // Show collection counts
    if (collections.length > 0) {
      console.log('\n📈 Document counts:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

testConnection();

