import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { History } from './pages/History';
import { Devices } from './pages/Devices';
import { Simulation } from './pages/Simulation';
import { Search, Bell, User, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <Analytics />;
      case 'history': return <History />;
      case 'devices': return <Devices />;
      case 'simulator': return <Simulation />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex">
      {/* Sidebar - Fixed */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 ml-20 p-6 flex flex-col gap-6 relative">
        {/* Top Header Bar */}
        <header className="flex justify-between items-center bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Air Pollution Monitor</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">AWS IoT Core Real-time Network Status: <span className="text-emerald-400">Connected</span></p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Region</span>
              <span className="text-sm font-medium">India (National Monitors)</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <button className="relative group">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold hover:bg-indigo-500/30 transition-all">
                JD
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {renderContent()}
        </div>

        {/* Bottom Stats Bar */}
        <footer className="flex justify-between items-center px-6 py-3 bg-black/40 rounded-full border border-white/5 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
          <div className="flex gap-8">
            <div className="flex gap-2 items-center"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div> MongoDB Cluster: Stable</div>
            <div className="flex gap-2 items-center"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div> Lambda Latency: 42ms</div>
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-indigo-400 animate-pulse">Auto-Refreshing in 5s...</span>
            <span className="opacity-50">v1.2.0-STABLE</span>
          </div>
        </footer>
      </main>

      {/* Global Background Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[30vw] h-[30vw] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}

