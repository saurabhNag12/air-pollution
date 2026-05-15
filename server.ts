import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB, SensorDataModel, memoryStorage } from "./src/db/mongodb.ts";
import { startSimulation } from "./src/services/mqttSimulator.ts";
import { ingestSensorData, initAwsClient } from "./src/services/dataService.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Connect to Database (Non-blocking to allow server to start listening)
  connectDB().catch(err => console.error("Database connection failed initially:", err));

  // Initialize AWS IoT Client
  initAwsClient();

  // API Routes
  
  // GET /api/sensors - Latest readings for all devices
  app.get("/api/sensors", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        const latestMap = new Map();
        [...memoryStorage].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).forEach(d => {
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
      console.error("Aggregation error:", error);
      res.status(500).json({ error: "Failed to fetch sensors", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // GET /api/history - Historical data with optional limit and location filter
  app.get("/api/history", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        const { location, limit = 50 } = req.query;
        let filtered = [...memoryStorage];
        if (location) filtered = filtered.filter(d => d.location === location);
        return res.json(filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, Number(limit)));
      }
      const { location, limit = 50 } = req.query;
      const filter: any = {};
      if (location) filter.location = location;
      
      const history = await SensorDataModel.find(filter)
        .sort({ timestamp: -1 })
        .limit(Number(limit));
      res.json(history);
    } catch (error) {
      console.error("History fetch error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // GET /api/devices - List of devices and status
  app.get("/api/devices", async (req, res) => {
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
              if: { $gt: ["$lastActive", new Date(Date.now() - 5 * 60 * 1000)] }, // Last 5 mins
              then: "Online",
              else: "Offline"
            }
          }
        } }
      ]).exec();
      res.json(devices);
    } catch (error) {
      console.error("Devices fetch error:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  // POST /api/sensor-data - Receive data (Simulates AWS Lambda/IoT Core trigger)
  app.post("/api/sensor-data", async (req, res) => {
    try {
      const enrichedData = await ingestSensorData(req.body);
      res.status(201).json(enrichedData);
    } catch (error) {
      console.error("POST /api/sensor-data error:", error);
      res.status(400).json({ error: "Invalid sensor data", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // POST /api/recalibrate - Clear all data (Simulates sensor reset)
  app.post("/api/recalibrate", async (req, res) => {
    try {
      // Clear in-memory storage
      memoryStorage.length = 0;
      
      // Clear MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        await SensorDataModel.deleteMany({});
      }
      
      res.json({ message: "Sensors recalibrated and data cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to recalibrate sensors" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startSimulation(); // Start background simulation
  });
}

startServer();

