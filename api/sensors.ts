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
  await ensureDB();

  try {
    if (mongoose.connection.readyState !== 1) {
      const latestMap = new Map();
      [...memoryStorage]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .forEach(d => {
          if (!latestMap.has(d.deviceId)) latestMap.set(d.deviceId, d);
        });
      return res.json(Array.from(latestMap.values()));
    }

    const latestReadings = await SensorDataModel.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$deviceId", latest: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latest" } }
    ]).exec();

    res.json(latestReadings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sensors" });
  }
}
