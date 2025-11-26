
import React, { useRef, useState, useEffect } from 'react';
import { SavedReportItem, UserProfile } from '../types';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Database, 
  X, 
  Loader2, 
  Activity, 
  Zap, 
  Globe, 
  Clock,
  ArrowRight,
  Crown,
  Folder
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  savedReports: SavedReportItem[];
  onSearch: (e?: React.FormEvent, ticker?: string) => void;
  onLoadReport: (item: SavedReportItem) => void;
  onRemoveReport: (ticker: string, e: React.MouseEvent) => void;
  tickerInput: string;
  onTickerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing: boolean;
  suggestions: {symbol: string, name: string}[];
  showSuggestions: boolean;
  onSelectSuggestion: (symbol: string) => void;
  setShowSuggestions: (show: boolean) => void;
  onViewSample: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  savedReports,
  onSearch,
  onLoadReport,
  onRemoveReport,
  tickerInput,
  onTickerChange,
  isAnalyzing,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
  onViewSample
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside of dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="animate-fade-in w-full pb-20">
      
      {/* 1. Welcome Header & Search Hero */}
      <div className="relative mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Dashboard</span>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                 <Crown className="w-3 h-3" /> {user.tier} Plan
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user.name}</span>
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              Markets are {Math.random() > 0.5 ? 'volatile' : 'trending up'} today. You have {savedReports.length} saved reports in your library.
            </p>
          </div>
          
          {/* Mock Market Pulse */}
          <div className="flex gap-2">
             <div className="bg-slate-800/50 p-2 px-3 rounded-lg border border-white/5 flex flex-col items-end">
                <span className="text-[10px] text-slate-500 font-bold uppercase">S&P 500</span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" /> +0.45%
                </span>
             </div>
             <div className="bg-slate-800/50 p-2 px-3 rounded-lg border border-white/5 flex flex-col items-end">
                <span className="text-[10px] text-slate-500 font-bold uppercase">NASDAQ</span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" /> +1.12%
                </span>
             </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl">
          <form onSubmit={(e) => onSearch(e)} className="relative group z-20">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative" ref={dropdownRef}>
                <div className="relative flex items-center bg-slate-900 rounded-xl shadow-2xl ring-1 ring-white/10 z-10">
                  <Search className="ml-5 w-6 h-6 text-slate-500" />
                  <input
                    type="text"
                    value={tickerInput}
                    onChange={onTickerChange}
                    onFocus={() => { if(tickerInput) setShowSuggestions(true); }}
                    placeholder="Analyze a new ticker (e.g. NVDA, PLTR)..."
                    className="w-full bg-transparent px-4 py-6 text-lg text-white placeholder-slate-500 focus:outline-none font-mono uppercase rounded-xl"
                    disabled={isAnalyzing}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !tickerInput}
                    className="mr-2 bg-white text-slate-900 px-6 py-3 font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        ANALYZE <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                    <ul>
                      {suggestions.map((stock) => (
                        <li 
                          key={stock.symbol}
                          onClick={() => onSelectSuggestion(stock.symbol)}
                          className="px-4 py-3 hover:bg-slate-700/50 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">{stock.symbol}</span>
                            <span className="text-xs text-slate-400">{stock.name}</span>
                          </div>
                          <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
          </form>
          
          {/* Quick Links / Demo */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Demo Report Link */}
             <div className="bg-slate-800/30 border border-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer group" onClick={onViewSample}>
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-500/20 p-2 rounded-md text-indigo-400">
                      <Zap className="w-4 h-4" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Load Demo Report</div>
                      <div className="text-xs text-slate-500">See ASTRO Analysis</div>
                   </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
             </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Report Library Section (Left - 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                 <Folder className="w-5 h-5 text-indigo-400" /> Report Library
              </h3>
              <span className="text-xs font-mono text-slate-500">{savedReports.length} Items</span>
           </div>

           {savedReports.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 border border-white/5 border-dashed flex flex-col items-center justify-center text-center h-64">
                 <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <Database className="w-8 h-8 text-slate-600" />
                 </div>
                 <h4 className="text-white font-bold mb-2">Your library is empty</h4>
                 <p className="text-slate-400 text-sm max-w-md">
                    Search for stocks above and click "Save Report" to archive the full analysis in your library for offline viewing.
                 </p>
              </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedReports.map((item) => (
                  <div 
                    key={item.ticker} 
                    onClick={() => onLoadReport(item)}
                    className="bg-surface rounded-xl p-5 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group relative shadow-lg"
                  >
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <div className="flex items-center gap-2">
                              <div className="font-mono font-bold text-xl text-white group-hover:text-indigo-400 transition-colors">{item.ticker}</div>
                              {item.fullReport && (
                                <span title="Saved Locally" className="bg-emerald-500/10 p-1 rounded">
                                   <Database className="w-3 h-3 text-emerald-400" />
                                </span>
                              )}
                           </div>
                           <div className="text-xs text-slate-400 truncate max-w-[140px]">{item.companyName}</div>
                        </div>
                        <button 
                          onClick={(e) => onRemoveReport(item.ticker, e)}
                          className="text-slate-600 hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 transition-colors z-10"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                     
                     <div className="h-px bg-white/5 w-full my-3"></div>

                     <div className="flex justify-between items-end">
                        <div>
                           <div className="text-2xl font-mono font-bold text-white">{item.currentPrice}</div>
                           <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${item.priceChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {item.priceChange.startsWith('+') ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                              {item.priceChange}
                           </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                           item.verdict === 'BUY' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 
                           item.verdict === 'SELL' ? 'border-red-500/30 bg-red-500/10 text-red-400' : 
                           'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        }`}>
                           {item.verdict}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Sidebar (Right - 1 Column) */}
        <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Quick Stats
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Reports Generated</span>
                     <span className="text-white font-mono font-bold">142</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Avg Rocket Score</span>
                     <span className="text-indigo-400 font-mono font-bold">76/100</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Bullish Finds</span>
                     <span className="text-emerald-400 font-mono font-bold">12</span>
                  </div>
               </div>
            </div>

            {/* Recent Activity (Mocked) */}
            <div>
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Recent Activity
               </h3>
               <div className="space-y-3">
                  {[
                    { text: "Analyzed NVDA", time: "2h ago", icon: Search },
                    { text: "Saved PLTR Report", time: "5h ago", icon: Database },
                    { text: "Exported TSLA PDF", time: "1d ago", icon: Globe },
                  ].map((activity, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5">
                        <div className="p-2 bg-slate-800 rounded-lg">
                           <activity.icon className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="flex-1">
                           <div className="text-xs font-bold text-slate-300">{activity.text}</div>
                           <div className="text-[10px] text-slate-500">{activity.time}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            
            {/* Promo / Tip */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-indigo-500/20">
               <h4 className="font-bold text-white mb-2">Pro Tip</h4>
               <p className="text-xs text-indigo-200 leading-relaxed">
                  Look for stocks with a <span className="text-white font-bold">Rocket Score > 80</span> and <span className="text-white font-bold">Insider Buying</span> for the highest probability setups.
               </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
