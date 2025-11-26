import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SavedReportItem, UserProfile, AnalysisSession, EquityReport } from '../types';
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
  Folder,
  Satellite,
  CheckCircle,
  AlertOctagon,
  Play,
  Trash2,
  Minus
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  savedReports: SavedReportItem[];
  onSearch: (e?: React.FormEvent, ticker?: string) => void;
  onLoadReport: (item: SavedReportItem) => void;
  onRemoveReport: (ticker: string, e: React.MouseEvent) => void;
  tickerInput: string;
  onTickerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: {symbol: string, name: string}[];
  showSuggestions: boolean;
  onSelectSuggestion: (symbol: string) => void;
  setShowSuggestions: (show: boolean) => void;
  onViewSample: () => void;
  analysisSessions: AnalysisSession[];
  onViewAnalyzedReport: (id: string) => void;
  onCancelAnalysis: (id: string) => void;
}

// Unified Card Component for Grid
const LibraryCard = ({
  session,
  savedItem,
  onClick,
  onAction
}: {
  session?: AnalysisSession;
  savedItem?: SavedReportItem;
  onClick: () => void;
  onAction: (e: React.MouseEvent) => void;
}) => {
  const isSession = !!session;
  const status = session ? session.status : 'SAVED';

  // --- PROCESSING STATE ---
  if (status === 'PROCESSING' && session) {
    return (
      <div className="bg-slate-900 rounded-xl p-3 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden h-full min-h-[105px] flex flex-col justify-between animate-fade-in-up group">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
             <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-mono font-bold text-white truncate max-w-[80px]">{session.ticker}</span>
                <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
             </div>
             <div className="text-[9px] text-indigo-300 font-medium animate-pulse uppercase tracking-wider">
                Analyzing...
             </div>
          </div>
          <button 
             onClick={onAction}
             className="text-slate-600 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
             title="Cancel Analysis"
          >
             <X className="w-3 h-3" />
          </button>
        </div>

        <div className="relative z-10 space-y-1.5">
           <div className="flex justify-between items-end text-[9px]">
              <span className="text-slate-400 truncate max-w-[70%]">{session.phase}</span>
              <span className="text-white font-mono">{Math.round(session.progress)}%</span>
           </div>
           {/* Progress Bar */}
           <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div 
                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 relative"
                 style={{ width: `${session.progress}%` }}
              >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]"></div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (status === 'ERROR' && session) {
     return (
        <div className="bg-slate-900 rounded-xl p-3 border border-red-500/30 relative overflow-hidden h-full min-h-[105px] flex flex-col justify-between animate-fade-in-up">
           <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                 <span className="text-sm font-mono font-bold text-white">{session.ticker}</span>
                 <AlertOctagon className="w-3 h-3 text-red-400" />
              </div>
              <button onClick={onAction}><X className="w-3 h-3 text-red-400 hover:text-white" /></button>
           </div>
           <div>
              <div className="text-[9px] text-red-300 mb-0.5 font-bold uppercase">Failed</div>
              <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{session.error || 'Connection interrupted.'}</p>
           </div>
        </div>
     );
  }

  // --- READY / SAVED STATE ---
  let displayData;
  if (isSession && session?.result) {
     displayData = {
        ticker: session.result.ticker,
        name: session.result.companyName,
        price: session.result.currentPrice,
        change: session.result.priceChange,
        verdict: session.result.verdict,
        isSaved: false,
        isNew: true
     };
  } else if (savedItem) {
     displayData = {
        ticker: savedItem.ticker,
        name: savedItem.companyName,
        price: savedItem.currentPrice,
        change: savedItem.priceChange,
        verdict: savedItem.verdict,
        isSaved: true,
        isNew: false
     };
  } else {
     return null;
  }

  const isPriceUp = displayData.change.startsWith('+');

  return (
    <div 
      onClick={onClick}
      className={`
        bg-slate-900 rounded-xl p-3 border 
        ${displayData.isNew 
           ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
           : 'border-white/5 hover:border-indigo-500/50 hover:bg-slate-900/80 shadow-md'
        }
        transition-all cursor-pointer group relative h-full min-h-[105px] flex flex-col justify-between animate-fade-in-up
      `}
    >
       {displayData.isNew && (
          <div className="absolute top-0 right-0">
             <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Ready
             </span>
          </div>
       )}

       <div className="flex justify-between items-start mb-1">
          <div className="min-w-0 pr-2">
             <div className="flex items-center gap-1.5">
                <div className="font-mono font-bold text-base text-white group-hover:text-indigo-400 transition-colors truncate">
                   {displayData.ticker}
                </div>
                {displayData.isSaved && (
                  <span className="bg-white/5 p-0.5 rounded shrink-0">
                     <Database className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </span>
                )}
             </div>
             <div className="text-[9px] text-slate-400 truncate mt-0.5">{displayData.name}</div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onAction(e); }}
            className="text-slate-600 hover:text-red-400 p-1 rounded-full hover:bg-white/5 transition-colors z-10 shrink-0"
          >
             <X className="w-3 h-3" />
          </button>
       </div>
       
       <div className="h-px bg-white/5 w-full my-2"></div>

       <div className="flex justify-between items-end">
          <div>
             <div className="text-base font-mono font-bold text-white">{displayData.price}</div>
             <div className={`text-[9px] font-bold flex items-center gap-0.5 mt-0.5 ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
                {isPriceUp ? <TrendingUp className="w-2.5 h-2.5"/> : <TrendingDown className="w-2.5 h-2.5"/>}
                {displayData.change}
             </div>
          </div>
          <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
             displayData.verdict === 'BUY' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 
             displayData.verdict === 'SELL' ? 'border-red-500/30 bg-red-500/10 text-red-400' : 
             'border-amber-500/30 bg-amber-500/10 text-amber-400'
          }`}>
             {displayData.verdict}
          </div>
       </div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({
  user,
  savedReports,
  onSearch,
  onLoadReport,
  onRemoveReport,
  tickerInput,
  onTickerChange,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
  onViewSample,
  analysisSessions,
  onViewAnalyzedReport,
  onCancelAnalysis
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const marketStatus = useMemo(() => Math.random() > 0.5 ? 'volatile' : 'trending up', []);

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

  // Combine counts for stats
  const totalItems = savedReports.length + analysisSessions.length;

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
              Markets are {marketStatus} today. You have {savedReports.length} saved reports in your library.
            </p>
          </div>
          
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
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!tickerInput}
                    className="mr-2 bg-white text-slate-900 px-6 py-3 font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2"
                  >
                     ANALYZE <ArrowRight className="w-4 h-4" />
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
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        
        {/* Report Library Section (Merged: Active Sessions + Saved Reports) */}
        <div className="lg:col-span-2 h-full">
            <div className="bg-surface rounded-2xl p-5 border border-white/5 h-full flex flex-col">
               <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                     <Folder className="w-4 h-4 text-indigo-400" /> Report Library
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">{totalItems} Items</span>
               </div>

               {totalItems === 0 ? (
                  <div className="bg-slate-900/50 rounded-xl p-8 border border-white/5 border-dashed flex flex-col items-center justify-center text-center flex-1 min-h-[150px]">
                     <div className="bg-slate-800 p-3 rounded-full mb-3">
                        <Database className="w-6 h-6 text-slate-600" />
                     </div>
                     <h4 className="text-white font-bold mb-1 text-sm">Your library is empty</h4>
                     <p className="text-slate-400 text-xs max-w-xs">
                        Search for stocks above and click "Analyze" to generate a report.
                     </p>
                  </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 auto-rows-min">
                    {/* 1. Active / Processing / Ready Sessions (Top Priority) */}
                    {analysisSessions.map((session) => (
                       <LibraryCard 
                          key={session.id} 
                          session={session} 
                          onClick={() => session.status === 'READY' && onViewAnalyzedReport(session.id)}
                          onAction={() => onCancelAnalysis(session.id)}
                       />
                    ))}

                    {/* 2. Saved Reports */}
                    {savedReports.map((item) => (
                       <LibraryCard 
                          key={item.ticker} 
                          savedItem={item}
                          onClick={() => onLoadReport(item)}
                          onAction={(e) => onRemoveReport(item.ticker, e)}
                       />
                    ))}
                 </div>
               )}
            </div>
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

            {/* Recent Activity */}
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