import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage } from '../db/mongodb';

export const initAwsClient = async () => {
  // AWS IoT Client removed as per user request for standalone mode
  return Promise.resolve();
};

export const ingestSensorData = async (data: any) => {
  // 1. Calculate status based on PM2.5
  let status: 'Safe' | 'Moderate' | 'Dangerous' = 'Safe';
  if (data.pm25 > 150) status = 'Dangerous';
  else if (data.pm25 > 50) status = 'Moderate';
  
  const enrichedData = {
    ...data,
    status,
    timestamp: data.timestamp || new Date().toISOString()
  };

  // 2. Save to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const newReading = new SensorDataModel(enrichedData);
      await newReading.save();
    } catch (error) {
      console.error("MongoDB Save Error:", error);
    }
  } else {
    // 3. Fallback to in-memory
    memoryStorage.push(enrichedData);
    if (memoryStorage.length > 500) memoryStorage.shift();
  }

  return enrichedData;
};
