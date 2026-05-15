import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage } from '../db/mongodb';
import { AwsIotClient } from './awsIotClient';

let awsClient: AwsIotClient | null = null;

export const initAwsClient = async () => {
  const awsEndpoint = process.env.AWS_IOT_ENDPOINT;
  if (awsEndpoint) {
    awsClient = new AwsIotClient(awsEndpoint, process.env.AWS_IOT_CLIENT_ID || 'pollution-monitor');
    await awsClient.connect().catch(err => console.warn("AWS IoT Core connection failed:", err.message));
  }
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

  // 4. Publish to AWS IoT Core if configured
  if (awsClient) {
    awsClient.publishData('airpollution/sensors/data', enrichedData);
  }

  return enrichedData;
};
