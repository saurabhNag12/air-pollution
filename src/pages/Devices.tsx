import React, { useEffect, useState } from 'react';
import { sensorApi } from '../lib/api';
import { Device } from '../types';
import { CloudLightning, MapPin, Activity, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const data = await sensorApi.getDevices();
      setDevices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && devices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-2xl font-bold text-white tracking-tight">Device Management</h2>
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Monitor and manage your IoT sensor network globally</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.deviceId} className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-indigo-500/50 transition-all hover:bg-white/[0.07]">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                <CloudLightning className="w-6 h-6 text-indigo-400" />
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                device.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'Online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {device.status}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{device.deviceId}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {device.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Health</p>
                  <p className="text-xs text-white font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Optimal
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Signals</p>
                  <p className="text-xs text-white font-medium flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-indigo-500" /> Active
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last heartbeat: {new Date(device.lastActive).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Device Placeholder */}
        <button className="p-6 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-white hover:border-indigo-500/40 transition-all hover:bg-white/5">
          <div className="w-12 h-12 rounded-xl border border-dashed border-current flex items-center justify-center bg-white/5">
            <span className="text-2xl font-light">+</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest">Provision New Device</span>
        </button>
      </div>
    </motion.div>
  );
};
