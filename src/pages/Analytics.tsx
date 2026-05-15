import React, { useEffect, useState } from 'react';
import { sensorApi } from '../lib/api';
import { SensorData } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';

export const Analytics: React.FC = () => {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sensorApi.getHistory(undefined, 100);
        setHistory(data.reverse());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return null;

  // Pie chart data: AQI Status distribution
  const statusCounts = history.reduce((acc: any, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const COLORS = {
    Safe: '#10b981', // emerald
    Moderate: '#eab308', // yellow
    Dangerous: '#ef4444' // red
  };

  // Bar chart data: Avg PM2.5 per location
  const locationData = history.reduce((acc: any, item) => {
    if (!acc[item.location]) acc[item.location] = { name: item.location, pm25: 0, count: 0 };
    acc[item.location].pm25 += item.pm25;
    acc[item.location].count += 1;
    return acc;
  }, {});

  const barData = Object.values(locationData).map((l: any) => ({
    name: l.name,
    avgPm25: Math.round(l.pm25 / l.count)
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Analytics & Trends</h2>
        <p className="text-gray-400">Deep dive into pollution patterns and historical analysis</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Pollution Severity Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Average PM2.5 by City</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} />
                <YAxis stroke="#ffffff20" fontSize={10} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="avgPm25" fill="url(#colorAvg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">CO2 vs PM2.5 Correlation</h3>
          <div className="h-[400px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-50)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#ffffff20"
                  fontSize={10}
                />
                <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Line yAxisId="left" type="monotone" dataKey="pm25" stroke="#6366f1" strokeWidth={3} dot={false} animationDuration={2000} />
                <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} dot={false} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
