import React, { useState } from 'react';
import { sensorApi } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { Send, Zap, Monitor, Terminal, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const Simulation: React.FC = () => {
  const [deviceId, setDeviceId] = useState('virtual-sensor-01');
  const [location, setLocation] = useState('Virtual Lab');
  const [pm25, setPm25] = useState(85);
  const [co2, setCo2] = useState(450);
  const [temp, setTemp] = useState(24);
  const [humidity, setHumidity] = useState(55);
  const [smoke, setSmoke] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [ `${new Date().toLocaleTimeString()} - ${msg}`, ...prev].slice(0, 5));
  };

  const handleEmit = async () => {
    setIsSending(true);
    const payload = {
      deviceId,
      location,
      pm25,
      co2,
      temperature: temp,
      humidity,
      smoke,
      timestamp: new Date()
    };

    addLog(`[IoT Core] Emitting MQTT payload to airpollution/sensors/data`);
    
    try {
      await sensorApi.postData(payload);
      addLog(`[Lambda] Data processed and stored in MongoDB Atlas`);
      addLog(`[CloudWatch] Log: Success - ${deviceId} published metrics`);
    } catch (error) {
      addLog(`[Error] Simulation failed to propagate data`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-12">
        <h2 className="text-3xl font-bold text-white mb-2">IoT Virtual Laboratory</h2>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Manual Software Simulation of AWS IoT Hardware Pipe</p>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Virtual Device ID</label>
              <input 
                type="text" 
                value={deviceId} 
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-400 font-mono focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Simulation Location</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">PM 2.5 Density (index)</span>
                <span className={`text-xs font-bold ${pm25 > 150 ? 'text-red-400' : 'text-indigo-400'}`}>{pm25}</span>
              </div>
              <input 
                type="range" min="0" max="300" 
                value={pm25} onChange={(e) => setPm25(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">CO2 Concentration (ppm)</span>
                <span className="text-xs font-bold text-indigo-400">{co2}</span>
              </div>
              <input 
                type="range" min="300" max="1500" 
                value={co2} onChange={(e) => setCo2(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Temp</span>
                  <span className="text-xs font-bold text-white">{temp}°C</span>
                </div>
                <input 
                  type="range" min="0" max="50" 
                  value={temp} onChange={(e) => setTemp(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Smoke</span>
                  <span className="text-xs font-bold text-white">{smoke}</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={smoke} onChange={(e) => setSmoke(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleEmit}
            disabled={isSending}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isSending ? <Zap className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Emit Software IoT Event
          </button>
        </div>
      </div>

      {/* Logic Viz / Logs */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 h-full flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">AWS Processing Pipeline</h3>
          </div>
          
          <div className="flex-1 space-y-3 font-mono text-[10px] overflow-hidden">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Waiting for software sensor trigger...
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg text-indigo-300 animate-in fade-in slide-in-from-left-2">
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
             <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-black">MQTT Status</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Sim</span>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-indigo-400 mt-1" />
                <p className="text-[10px] leading-relaxed text-slate-400">
                  This interface bypasses physical ESP32/Arduino hardware and uses the <span className="text-white">API Gateway simulation</span> to verify real-time React-to-Express propagation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
