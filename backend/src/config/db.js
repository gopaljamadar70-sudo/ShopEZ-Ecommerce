import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    // If already connected, return existing connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGO_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB] Connected to external cluster: ${conn.connection.host}`);
      return conn;
    }

    // Fallback: Start embedded zero-config MongoDB Memory Server
    if (!mongoMemoryServer) {
      console.log('[MongoDB] No external MONGO_URI specified. Initializing embedded MongoDB server...');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'shopez_db',
        },
      });
    }

    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Embedded in-memory MongoDB connected successfully at ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error(`[MongoDB] Error disconnecting: ${error.message}`);
  }
};
