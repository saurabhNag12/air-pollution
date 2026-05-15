# Air Pollution Monitor - IoT & AWS Cloud Project

A professional full-stack air quality monitoring system that tracks environmental data in real-time using simulated IoT sensors and AWS cloud architecture.

## 🚀 Features

- **Real-time Monitoring**: Live tracking of PM2.5, CO2, Temp, Humidity, and Smoke.
- **Analytics Dashboard**: Interactive charts showing trends and correlations.
- **Device Management**: Monitor sensor health and online/offline status.
- **Historical Data**: Searchable logs with CSV export.
- **Automated Simulation**: Background task simulates IoT sensor activity every 5 seconds.
- **Smart AQI Calculation**: Real-time severity classification (Safe, Moderate, Dangerous).

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, REST API.
- **Database**: MongoDB Atlas (NoSQL).
- **AWS Integration (Simulated)**:
    - **AWS IoT Core**: Receives MQTT payload (simulated via API).
    - **AWS Lambda**: Processes and validates incoming data.
    - **Amazon CloudWatch**: Logs system activity.

## 📁 Project Structure

```bash
air-pollution-monitor/
├── src/
│   ├── server.ts         # Main Backend Entry
│   ├── db/               # MongoDB Connection & Model
│   ├── api/              # REST API Handlers
│   ├── components/       # Reusable UI (Sidebar, StatCards)
│   ├── pages/            # View Layers (Dashboard, Devices, etc.)
│   ├── services/         # IoT & Lambda Simulation Logic
│   ├── types.ts          # TypeScript Interfaces
│   └── lib/              # API Client & Utils
├── index.html
├── package.json
└── README.md
```

## 🏗️ AWS Architecture Setup Guide

### 1. AWS IoT Core
- Create a **Thing** in AWS IoT Core.
- Download the certificates and private key.
- Create a Policy allowing `iot:Connect`, `iot:Publish`, and `iot:Subscribe`.
- **Topic**: `airpollution/sensors/data`

### 2. AWS Lambda
- Create a new Lambda function (Node.js).
- Add an **IoT Core Trigger** pointing to the topic above.
- Paste the logic from `src/services/lambdaSimulator.ts`.
- Set Environment Variables: `MONGODB_URI`.

### 3. MongoDB Atlas
- Create a free Cluster on MongoDB Atlas.
- Add your current IP to the Access List.
- Copy the Connection String.

### 4. Deployment
- **Frontend**: Connect your GitHub repo to **AWS Amplify**.
- **Backend**: Deploy on **AWS EC2** or **App Runner**.

## 🚦 Getting Started (Local)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and add your **MONGODB_URI**.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## ☁️ API Documentation

- `GET /api/sensors`: List latest readings for all active devices.
- `GET /api/history`: Retrieve historical records (filtering by location available).
- `GET /api/devices`: Get status and metadata of all registered sensors.
- `POST /api/sensor-data`: Ingest new sensor reading (simulates IoT trigger).

---
*Developed for IoT and Cloud Computing demonstration.*
