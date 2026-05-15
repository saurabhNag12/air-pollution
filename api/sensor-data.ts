import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage } from '../src/db/mongodb';
import { ensureDB, setCors } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await ensureDB();

  try {
    const data = req.body;

    let status: 'Safe' | 'Moderate' | 'Dangerous' = 'Safe';
    if (data.pm25 > 150) status = 'Dangerous';
    else if (data.pm25 > 50) status = 'Moderate';

    const enrichedData = {
      ...data,
      status,
      timestamp: data.timestamp || new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const newReading = new SensorDataModel(enrichedData);
      await newReading.save();
    } else {
      memoryStorage.push(enrichedData);
      if (memoryStorage.length > 500) memoryStorage.shift();
    }

    res.status(201).json(enrichedData);
  } catch (error) {
    console.error("sensor-data error:", error);
    res.status(400).json({ error: "Invalid sensor data" });
  }
}
