import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/factorydb';

export const connectDatabase = async () => {
  await mongoose.connect(DATABASE_URL);
  console.log('Connected to MongoDB');
};
