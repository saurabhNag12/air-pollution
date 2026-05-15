import axios from 'axios';
import { SensorData, Device } from '../types';

const API_BASE = '/api';

export const sensorApi = {
  getLatest: async () => {
    const res = await axios.get<SensorData[]>(`${API_BASE}/sensors`);
    return res.data;
  },
  getHistory: async (location?: string, limit?: number) => {
    const res = await axios.get<SensorData[]>(`${API_BASE}/history`, {
      params: { location, limit }
    });
    return res.data;
  },
  getDevices: async () => {
    const res = await axios.get<Device[]>(`${API_BASE}/devices`);
    return res.data;
  },
  postData: async (data: Partial<SensorData>) => {
    const res = await axios.post<SensorData>(`${API_BASE}/sensor-data`, data);
    return res.data;
  },
  recalibrate: async () => {
    const res = await axios.post(`${API_BASE}/recalibrate`);
    return res.data;
  }
};
