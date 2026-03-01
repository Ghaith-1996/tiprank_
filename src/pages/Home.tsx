import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, TrendingUp, Loader2, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import type { Analyst } from '../types';

export default function Home() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalysts().then((data) => {
      setAnalysts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-lg font-medium">Loading analysts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Top Wall Street Analysts</h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-lg">
            Track the latest ratings, price targets, and performance of the most influential analysts covering major tech and blue-chip stocks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-900/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-slate-800">
          <TrendingUp className="w-5 h-5 text-fuchsia-400" />
          <span>{analysts.length} Active Analysts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {analysts.map((analyst, index) => {
          const gradients = [
            'from-blue-500 to-indigo-500',
            'from-indigo-500 to-purple-500',
            'from-purple-500 to-fuchsia-500',
            'from-fuchsia-500 to-pink-500',
            'from-pink-500 to-rose-500',
            'from-rose-500 to-orange-500',
          ];
          const gradient = gradients[index % gradients.length];

          return (
            <Link
              key={analyst.id}
              to={`/analyst/${analyst.id}`}
              className="group relative bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} p-[1px] shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center text-xl font-bold text-slate-200">
                    {analyst.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold">Top Rated</span>
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h2 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {analyst.name}
                </h2>
                {analyst.tipranksUrl && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1.5 font-medium">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">TipRanks Profile</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 relative z-10 bg-slate-950/50 -mx-6 -mb-6 px-6 pb-6 group-hover:bg-indigo-950/30 transition-colors">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Latest Action</div>
                <div className="text-sm font-semibold text-slate-300 truncate">
                  {analyst.latestRating}
                </div>
              </div>

              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-20">
                <div className="bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-700 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
