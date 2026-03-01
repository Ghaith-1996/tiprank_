import { Link, Outlet } from 'react-router-dom';
import { LineChart, Briefcase, TrendingUp } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-500/20 p-2 rounded-lg backdrop-blur-sm group-hover:bg-indigo-500/30 border border-indigo-500/20 transition-colors">
                <LineChart className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-100">AnalystTracker</span>
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Analysts
              </Link>
              <div className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-not-allowed">
                <TrendingUp className="w-4 h-4" />
                Markets
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <Outlet />
      </main>
    </div>
  );
}
