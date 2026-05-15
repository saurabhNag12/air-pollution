import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage, connectDB } from '../src/db/mongodb.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let dbInitialized = false;

/** Ensure DB is connected (or fallback to in-memory with seeded data) */
export async function ensureDB() {
  if (!dbInitialized) {
    await connectDB();
    dbInitialized = true;
  }
}

/** Generate realistic sensor data for multiple cities */
export function generateReading(deviceId: string) {
  const locations = ['Bangalore', 'Delhi', 'Mumbai', 'Chennai'];
  const locPrefix = deviceId.substring(0, 3);
  const location = locations.find(l => l.toLowerCase().startsWith(locPrefix)) || 'Bangalore';
  
  let pm25;
  if (location === 'Delhi') pm25 = Math.floor(Math.random() * 200) + 150;
  else pm25 = Math.floor(Math.random() * 200) + 10;

  return {
    deviceId,
    location,
    pm25,
    co2: Math.floor(Math.random() * 400) + 350,
    temperature: Math.floor(Math.random() * 8) + 22,
    humidity: Math.floor(Math.random() * 20) + 45,
    smoke: Math.floor(Math.random() * 15),
    status: pm25 > 150 ? 'Dangerous' : pm25 > 50 ? 'Moderate' : 'Safe',
    timestamp: new Date().toISOString()
  };
}

/** Add CORS headers for Vercel */
export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
