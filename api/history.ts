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
    const { location, limit = 50 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...memoryStorage];
      if (location) filtered = filtered.filter(d => d.location === location);
      return res.json(
        filtered
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, Number(limit))
      );
    }

    const filter: any = {};
    if (location) filter.location = location;

    const history = await SensorDataModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
}
