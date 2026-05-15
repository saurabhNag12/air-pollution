import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage, connectDB } from '../src/db/mongodb';

let dbInitialized = false;

async function ensureDB() {
  if (!dbInitialized) {
    await connectDB();
    dbInitialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await ensureDB();

  try {
    memoryStorage.length = 0;

    if (mongoose.connection.readyState === 1) {
      await SensorDataModel.deleteMany({});
    }

    res.json({ message: "Sensors recalibrated and data cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to recalibrate sensors" });
  }
}
