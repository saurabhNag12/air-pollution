import { ingestSensorData } from './dataService';

const LOCATIONS = ['Bangalore'];
const DEVICE_IDS = ['blr-sensor-1', 'blr-sensor-2', 'blr-sensor-3'];

export const startSimulation = async () => {
  console.log('Starting IoT Sensor Simulation...');
  
  setInterval(async () => {
    const deviceId = DEVICE_IDS[Math.floor(Math.random() * DEVICE_IDS.length)];
    const location = LOCATIONS[DEVICE_IDS.indexOf(deviceId)];
    
    const pm25 = Math.floor(Math.random() * 250);
    const co2 = Math.floor(Math.random() * 600) + 300;
    const temperature = Math.floor(Math.random() * 15) + 20;
    const humidity = Math.floor(Math.random() * 40) + 40;
    const smoke = Math.floor(Math.random() * 50);

    const payload = {
      deviceId,
      location,
      pm25,
      co2,
      temperature,
      humidity,
      smoke,
      timestamp: new Date().toISOString()
    };

    // Use centralized ingestion (handles DB, Memory, and AWS)
    await ingestSensorData(payload);
  }, 5000);
};
