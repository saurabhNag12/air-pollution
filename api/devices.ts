import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { SensorDataModel, memoryStorage } from '../src/db/mongodb';
import { ensureDB, setCors } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  await ensureDB();

  try {
    if (mongoose.connection.readyState !== 1) {
      const deviceMap = new Map();
      memoryStorage.forEach(d => {
        const existing = deviceMap.get(d.deviceId);
        if (!existing || new Date(d.timestamp) > new Date(existing.lastActive)) {
          deviceMap.set(d.deviceId, {
            deviceId: d.deviceId,
            location: d.location,
            lastActive: d.timestamp,
            status: "Online"
          });
        }
      });
      return res.json(Array.from(deviceMap.values()));
    }

    const devices = await SensorDataModel.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: "$deviceId",
        location: { $first: "$location" },
        lastActive: { $first: "$timestamp" }
      } },
      { $project: {
        deviceId: "$_id",
        location: 1,
        lastActive: 1,
        status: "Online"
      } }
    ]).exec();

    res.json(devices);
  } catch (error) {
    console.error("devices error:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
}
