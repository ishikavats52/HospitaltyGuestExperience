import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Attempting in-memory server...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      isConnected = true;
      console.log(`[Database] In-Memory MongoDB Initialized: ${conn.connection.host}`);

      // Auto-populate seed data for zero-config local dev experience
      const { Hotel } = await import('../modules/hotels/hotels.model.js');
      const count = await Hotel.countDocuments();
      if (count === 0) {
        const { seedDatabase } = await import('../seeds/seedData.js');
        await seedDatabase();
      }
    } catch (memErr) {
      console.error(`[Database] Failed to initialize fallback in-memory MongoDB:`, memErr);
    }
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
