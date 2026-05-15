import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage } from '../src/db/mongodb.js';
import { ensureDB, setCors } from './_utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await ensureDB();

  try {
    memoryStorage.length = 0;

    if (mongoose.connection.readyState === 1) {
      await SensorDataModel.deleteMany({});
    }

    res.json({ message: "Sensors recalibrated and data cleared successfully" });
  } catch (error) {
    console.error("recalibrate error:", error);
    res.status(500).json({ error: "Failed to recalibrate sensors" });
  }
}
