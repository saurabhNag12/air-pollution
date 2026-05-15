import React, { useEffect, useState } from 'react';
import { sensorApi } from '../lib/api';
import { SensorData } from '../types';
import { StatCard } from '../components/StatCard';
import { Wind, Droplets, Thermometer, CloudFog, AlertTriangle, RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const [latestData, setLatestData] = useState<SensorData[]>([]);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const fetchData = async () => {
    try {
      const [sensors, hist] = await Promise.all([
        sensorApi.getLatest(),
        sensorApi.getHistory(undefined, 20)
      ]);
      setLatestData(sensors);
      setHistory(hist.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    try {
      await sensorApi.recalibrate();
      await fetchData();
      window.location.reload(); // Refresh to ensure all locations from backend are shown
    } catch (error) {
      console.error("Recalibration failed:", error);
    } finally {
      setIsRecalibrating(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && latestData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use the first sensor as the primary focus for the main dashboard metrics
  const mainSensor = latestData[0] || {
    pm25: 0, co2: 0, temperature: 0, humidity: 0, smoke: 0, status: 'Safe', location: 'Unknown'
  };

  const getAQIColor = (status: string) => {
    if (status === 'Dangerous') return 'text-red-400 decoration-red-400/50';
    if (status === 'Moderate') return 'text-yellow-400 decoration-yellow-400/50';
    return 'text-emerald-400 decoration-emerald-400/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="PM 2.5" 
          value={mainSensor.pm25} 
          unit="index" 
          icon={<Wind className="w-5 h-5" />} 
          color={mainSensor.status === 'Safe' ? 'green' : mainSensor.status === 'Moderate' ? 'yellow' : 'red'}
          trend={mainSensor.status}
        />
        <StatCard 
          title="CO2 Level" 
          value={mainSensor.co2} 
          unit="ppm" 
          icon={<CloudFog className="w-5 h-5" />} 
          color={mainSensor.co2 > 1000 ? 'red' : 'green'} 
          trend={mainSensor.co2 > 1000 ? 'High' : 'Healthy'}
        />
        <StatCard 
          title="Temperature" 
          value={mainSensor.temperature} 
          unit="°C" 
          icon={<Thermometer className="w-5 h-5" />} 
          color="blue" 
          trend="Normal"
        />
        <StatCard 
          title="Humidity" 
          value={mainSensor.humidity} 
          unit="%" 
          icon={<Droplets className="w-5 h-5" />} 
          color="purple" 
          trend="Relative"
        />
      </div>

      {/* Center Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
        {/* Main AQI Gauge & Trends */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">AQI Trend (Last 20 Readings)</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] uppercase font-bold text-white shadow-lg shadow-indigo-600/20">Live</button>
              <button className="px-3 py-1 hover:bg-white/5 rounded-full text-[10px] uppercase font-bold text-slate-500 transition-colors">History</button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col relative min-h-[300px]">
            <div className="absolute top-0 left-0 p-4 bg-black/40 backdrop-blur border border-white/5 rounded-xl z-10 transition-all hover:scale-105">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Current AQI</p>
              <p className="text-4xl font-black text-white">{mainSensor.pm25}</p>
              <span className={`text-[10px] font-bold uppercase underline mt-1 block ${getAQIColor(mainSensor.status)}`}>
                {mainSensor.status}
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  hide
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pm25" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPm)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Info Stack */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Sensors</h2>
            <div className="flex flex-col gap-3">
              {latestData.slice(0, 3).map((sensor) => (
                <div key={sensor.deviceId} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group hover:border-indigo-500/30 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{sensor.deviceId}</p>
                    <p className="text-[10px] text-slate-500">{sensor.location} • Active</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(sensor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Health Index</h2>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
               <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="currentColor" strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="301.6" 
                    strokeDashoffset={301.6 - (301.6 * (mainSensor.status === 'Safe' ? 0.95 : mainSensor.status === 'Moderate' ? 0.65 : 0.35))} 
                    className={mainSensor.status === 'Safe' ? 'text-emerald-500' : mainSensor.status === 'Moderate' ? 'text-yellow-500' : 'text-red-500'} 
                  />
                </svg>
                <span className="absolute text-2xl font-black text-white">
                  {mainSensor.status === 'Safe' ? '95%' : mainSensor.status === 'Moderate' ? '65%' : '35%'}
                </span>
              </div>
              <p className="text-[10px] text-center text-slate-500 px-2 leading-relaxed italic">
                Environment health is <span className="text-white not-italic font-bold">{mainSensor.status === 'Safe' ? 'Optimal' : mainSensor.status === 'Moderate' ? 'Strained' : 'Critical'}</span> in your current monitored zone.
              </p>
            </div>
            <button 
              onClick={handleRecalibrate}
              disabled={isRecalibrating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 text-white flex items-center justify-center gap-2"
            >
              {isRecalibrating ? (
                <>
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                  RECALIBRATING...
                </>
              ) : (
                'SENSORS RECALIBRATE'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
