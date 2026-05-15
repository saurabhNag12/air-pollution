import React, { useEffect, useState } from 'react';
import { sensorApi } from '../lib/api';
import { SensorData } from '../types';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const History: React.FC = () => {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sensorApi.getHistory(filterLocation === 'All' ? undefined : filterLocation, 100);
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterLocation]);

  const filteredHistory = history.filter(item => 
    item.deviceId.toLowerCase().includes(search.toLowerCase()) || 
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Device ID,Location,PM2.5,CO2,Temp,Humidity,Smoke,Status\n"
      + filteredHistory.map(r => `${r.timestamp},${r.deviceId},${r.location},${r.pm25},${r.co2},${r.temperature},${r.humidity},${r.smoke},${r.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pollution_history.csv");
    document.body.appendChild(link);
    link.click();
  };

  const getStatusBg = (status: string) => {
    if (status === 'Dangerous') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (status === 'Moderate') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-green-500/10 text-green-400 border-green-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Historical Records</h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Search and export detailed pollution sensor logs</p>
        </div>
        <button 
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ID or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors" />
          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="All">All Locations</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Device ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">PM2.5</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">CO2</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Temp/Hum</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-xs text-white font-medium">
                    {new Date(row.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-bold">{row.deviceId}</td>
                <td className="px-6 py-4 text-xs text-slate-400">{row.location}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs font-black ${row.pm25 > 100 ? 'text-red-400' : 'text-white'}`}>{row.pm25}</span>
                </td>
                <td className="px-6 py-4 text-center text-xs text-slate-500">{row.co2}</td>
                <td className="px-6 py-4 text-center text-[10px] text-slate-500 font-mono">
                  {row.temperature}° / {row.humidity}%
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest ${getStatusBg(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
