import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export const StatCard: React.FC<CardProps> = ({ title, value, unit, icon, trend, color = 'blue' }) => {
  const colorClasses: Record<string, string> = {
    blue: 'hover:border-blue-500/40 text-white',
    green: 'hover:border-emerald-500/40 text-emerald-400',
    yellow: 'hover:border-yellow-500/40 text-yellow-400',
    red: 'hover:border-red-500/40 text-red-400',
    purple: 'hover:border-indigo-500/40 text-indigo-300',
    indigo: 'hover:border-indigo-500/40 text-indigo-400',
  };

  const textClasses: Record<string, string> = {
    blue: 'text-white',
    green: 'text-emerald-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-indigo-400',
    indigo: 'text-indigo-400',
  };

  return (
    <div className={`bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1 transition-all group ${colorClasses[color] || 'hover:border-white/20'}`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">{title}</span>
        <div className="opacity-20 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black tracking-tight ${textClasses[color] || 'text-white'}`}>{value}</span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
        {trend && (
          <span className="text-[10px] font-bold py-0.5 px-1.5 rounded bg-white/5 text-slate-400 ml-auto uppercase tracking-tighter">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
