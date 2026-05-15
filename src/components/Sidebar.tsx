import React from 'react';
import { Home, BarChart3, History, Settings, CloudLightning, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'devices', label: 'Devices', icon: CloudLightning },
    { id: 'simulator', label: 'Simulator', icon: Zap },
  ];

  return (
    <aside className="w-20 border-r border-white/10 flex flex-col items-center py-8 gap-10 bg-black/20 fixed left-0 top-0 h-screen z-50">
      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      <nav className="flex flex-col gap-8 text-slate-500">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2 rounded-lg transition-all cursor-pointer relative group
                ${isActive ? 'bg-white/10 text-white' : 'hover:text-white'}`}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-[-1.25rem] w-1 h-6 bg-indigo-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <button className="mt-auto p-2 text-slate-500 hover:text-white transition-all cursor-pointer">
        <Settings className="w-6 h-6" />
      </button>
    </aside>
  );
};
