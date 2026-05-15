import mongoose, { Schema, Document } from 'mongoose';
import { SensorData } from '../types';

const sensorDataSchema = new Schema<SensorData & Document>({
  deviceId: { type: String, required: true },
  location: { type: String, required: true },
  pm25: { type: Number, required: true },
  co2: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  smoke: { type: Number, required: true },
  status: { type: String, enum: ['Safe', 'Moderate', 'Dangerous'], required: true },
  timestamp: { type: Date, default: Date.now },
});

export const SensorDataModel = mongoose.model<SensorData & Document>('air_pollution_data', sensorDataSchema);

// In-memory fallback for demo purposes when MongoDB is not connected
export const memoryStorage: any[] = [];

// Seed initial data so the dashboard isn't empty on start
const seedData = () => {
  const location = 'Bangalore';
  for (let i = 0; i < 10; i++) {
    const pm25 = Math.floor(Math.random() * 80) + 30;
    memoryStorage.push({
      deviceId: `blr-sensor-${i + 1}`,
      location: location,
      pm25: pm25,
      co2: Math.floor(Math.random() * 300) + 400,
      temperature: Math.floor(Math.random() * 5) + 24,
      humidity: Math.floor(Math.random() * 15) + 50,
      smoke: Math.floor(Math.random() * 10),
      status: pm25 > 150 ? 'Dangerous' : pm25 > 50 ? 'Moderate' : 'Safe',
      timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString()
    });
  }
};
seedData();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not found in environment. Using in-memory storage fallback.');
    return;
  }
  try {
    // Add timeouts so Vercel doesn't kill the function after 10s if IP is not whitelisted in Atlas
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Falling back to in-memory storage.');
  }
}
