import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { Analyst } from '../types';

export default function AnalystPage() {
  const { id } = useParams<{ id: string }>();
  const [analyst, setAnalyst] = useState<Analyst | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getAnalystById(id).then((data) => {
        setAnalyst(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-lg font-medium">Loading analyst profile...</p>
      </div>
    );
  }

  if (!analyst) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-200">Analyst not found</h2>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium mt-4 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('upgrade')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (a.includes('downgrade')) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    if (a.includes('initiat')) return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    return 'text-slate-300 bg-slate-800 border-slate-700';
  };

  const getRatingColor = (rating: string) => {
    const r = rating.toLowerCase();
    if (r === 'buy' || r === 'overweight' || r === 'outperform' || r === 'strong buy')
      return 'text-emerald-400';
    if (r === 'sell' || r === 'underweight' || r === 'underperform' || r === 'strong sell')
      return 'text-rose-400';
    return 'text-amber-400';
  };

  const gradients = [
    'from-blue-500 to-indigo-500',
    'from-indigo-500 to-purple-500',
    'from-purple-500 to-fuchsia-500',
    'from-fuchsia-500 to-pink-500',
    'from-pink-500 to-rose-500',
    'from-rose-500 to-orange-500',
  ];
  const gradientIndex = analyst.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradient = gradients[gradientIndex % gradients.length];

  return (
    <div className="space-y-8 relative z-10">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-6 bg-slate-900/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-slate-800">
          <ArrowLeft className="w-4 h-4" />
          Back to Analysts
        </Link>

        <div className="bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none`} />

          <div className="flex items-center gap-6 relative z-10">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shadow-md`}>
              <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center text-3xl font-bold text-slate-200">
                {analyst.name.split(' ').map((n) => n[0]).join('')}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">{analyst.name}</h1>
              {analyst.tipranksUrl && (
                <a
                  href={analyst.tipranksUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 mt-2 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on TipRanks
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="bg-slate-950/50 px-6 py-4 rounded-2xl border border-slate-800 shadow-sm">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Ratings</div>
              <div className="text-3xl font-black text-slate-200">{analyst.ratings.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl shadow-sm border border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Recent Ratings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price Target</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Current</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Upside</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-900">
              {analyst.ratings.map((rating) => (
                <tr key={rating.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700 shadow-sm">
                        {rating.ticker.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                          {rating.ticker}
                        </div>
                        <div className="text-sm text-slate-400 font-medium">{rating.companyName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-400">
                      {new Date(rating.ratingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getActionColor(rating.actionType)}`}>
                      {rating.actionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className={`font-bold text-sm ${getRatingColor(rating.newRating)}`}>
                        {rating.newRating}
                      </span>
                      {rating.previousRating && rating.previousRating !== rating.newRating && (
                        <span className="text-xs text-slate-500">
                          from {rating.previousRating}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-mono font-bold text-slate-200">
                      {rating.newPriceTarget ? `$${rating.newPriceTarget.toFixed(2)}` : '—'}
                    </div>
                    {rating.previousPriceTarget != null && rating.previousPriceTarget !== rating.newPriceTarget && (
                      <div className="text-xs text-slate-500 font-mono">
                        from ${rating.previousPriceTarget.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-mono text-sm font-medium text-slate-400">
                      {rating.currentPrice > 0 ? `$${rating.currentPrice.toFixed(2)}` : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {rating.currentPrice > 0 && rating.newPriceTarget > 0 ? (
                      <div className={`flex items-center justify-end gap-1 font-mono font-bold text-sm ${rating.upside > 0 ? 'text-emerald-400' : rating.upside < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {rating.upside > 0 ? <TrendingUp className="w-4 h-4" /> : rating.upside < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {rating.upside > 0 ? '+' : ''}{rating.upside.toFixed(2)}%
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
