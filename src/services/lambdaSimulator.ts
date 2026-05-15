/**
 * AWS Lambda Simulation logic
 * This file contains the logic that would run on AWS Lambda.
 */

export const processPollutionData = (event: any) => {
  // 1. Receive data from event (from AWS IoT Core)
  const sensorData = event;

  // 2. Validate data
  if (!sensorData.deviceId || !sensorData.pm25) {
    throw new Error("Invalid sensor data received");
  }

  // 3. Calculate AQI status
  let status = "Safe";
  if (sensorData.pm25 > 150) {
    status = "Dangerous";
  } else if (sensorData.pm25 > 50) {
    status = "Moderate";
  }

  const enrichedData = {
    ...sensorData,
    status,
    timestamp: sensorData.timestamp || new Date().toISOString()
  };

  // 4. In real AWS setup, this would use a MongoDB Driver to store data
  // and send logs to CloudWatch using console.log()
  console.log("CloudWatch Log: Processed sensor data for device", sensorData.deviceId);
  
  return enrichedData;
};
