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
      const deviceMap = new Map();
      memoryStorage.forEach(d => {
        const existing = deviceMap.get(d.deviceId);
        if (!existing || new Date(d.timestamp) > new Date(existing.lastActive)) {
          deviceMap.set(d.deviceId, {
            deviceId: d.deviceId,
            location: d.location,
            lastActive: d.timestamp,
            status: (new Date().getTime() - new Date(d.timestamp).getTime()) < 5 * 60 * 1000 ? "Online" : "Offline"
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
        status: {
          $cond: {
            if: { $gt: ["$lastActive", new Date(Date.now() - 5 * 60 * 1000)] },
            then: "Online",
            else: "Offline"
          }
        }
      } }
    ]).exec();

    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch devices" });
  }
}
