/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SensorData {
  deviceId: string;
  location: string;
  pm25: number;
  co2: number;
  temperature: number;
  humidity: number;
  smoke: number;
  status: 'Safe' | 'Moderate' | 'Dangerous';
  timestamp: Date;
}

export interface Device {
  deviceId: string;
  location: string;
  status: 'Online' | 'Offline';
  lastActive: Date;
}
