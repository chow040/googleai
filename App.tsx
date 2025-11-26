
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ReportCard, { ReportCardSkeleton } from './components/ReportCard';
import Dashboard from './components/Dashboard';
import { generateEquityReport } from './services/geminiService';
import { EquityReport, LoadingState, SavedReportItem, UserProfile, AnalysisSession } from './types';
import { Search, Loader2, Sparkles, Eye, TrendingUp, TrendingDown, Minus, Bookmark, X, ArrowRight, Database } from 'lucide-react';

const SAMPLE_REPORT: EquityReport = {
  companyName: "AstroMining Corp",
  ticker: "ASTRO",
  reportDate: "Nov 24, 2024, 10:00 AM",
  currentPrice: "$24.50",
  priceChange: "+5.25%",
  marketCap: "$5.2B",
  peRatio: "N/A",
  dayHigh: "$24.95",
  dayLow: "$23.80",
  week52High: "$28.00",
  week52Low: "$12.00",
  priceTarget: "$42.00",
  priceTargetRange: "$35.00 - $55.00",
  priceTargetModel: {
    estimatedEPS: "$1.75",
    targetPE: "24.0x",
    growthRate: "45%",
    logic: "Valuation assumes a 24x multiple on projected FY25 earnings, justified by superior growth vs peers."
  },
  scenarioAnalysis: {
    bear: { label: "Bear", price: "$15.00", logic: "Prototype failure leads to additional capital raise and delayed revenue.", probability: "25%" },
    base: { label: "Base", price: "$42.00", logic: "Successful launch of Prospector-1 and initial contract monetization.", probability: "50%" },
    bull: { label: "Bull", price: "$75.00", logic: "Discovery of platinum-group metals exceeds initial survey estimates.", probability: "25%" }
  },
  summary: "AstroMining is pioneering commercial asteroid mining technology. With successful prototype launches in late 2024, they aim to extract rare earth metals from near-earth objects, potentially disrupting the global electronics supply chain.",
  rocketScore: 85,
  rocketReason: "First-mover advantage in a potential trillion-dollar untapped market.",
  financialHealthScore: 65,
  financialHealthReason: "Solid cash position post-Series D, but high burn rate requires monitoring.",
  moatAnalysis: {
    moatRating: "Narrow",
    moatSource: "Intangible Assets (Patents)",
    rationale: "Exclusive orbital mining rights and patented plasma propulsion create high barriers to entry, though technology is unproven at scale."
  },
  history: {
    previousDate: "Aug 2024",
    previousVerdict: "HOLD",
    changeRationale: [
       "Successful Series D funding removed near-term liquidity risk",
       "NASA partnership validated technical feasibility"
    ]
  },
  shortTermFactors: {
    positive: [
       { title: "Upcoming Prototype Launch", detail: "Scheduled launch of 'Prospector-1' next month acts as a major catalyst for validation." },
       { title: "Strategic Defense Partnership", detail: "Recently secured data-sharing agreement with the DoD boosts technical credibility and non-dilutive funding." }
    ],
    negative: [
       { title: "High Cash Burn", detail: "Monthly burn rate of $15M puts pressure on balance sheet liquidity." },
       { title: "Volatility Risk", detail: "Stock price heavily correlated with binary test outcomes." }
    ]
  },
  longTermFactors: {
    positive: [
       { title: "Exclusive Orbital Rights", detail: "Secured mining rights to high-value Near-Earth Objects (NEOs) with estimated $2T value." },
       { title: "Patented Propulsion Tech", detail: "Proprietary plasma drive reduces fuel costs by 40%, enabling cheaper retrieval missions." },
       { title: "Path to Profitability", detail: "Projected break-even by 2027 assuming current rare earth metal prices hold." }
    ],
    negative: [
       { title: "Regulatory Uncertainty", detail: "International space property rights remain legally ambiguous under current treaties." },
       { title: "Operational Timeline Risk", detail: "Deep space operations historically face multi-year delays." },
       { title: "Emerging Competition", detail: "SpaceX and Blue Origin signaling potential entry into resource extraction sector." }
    ]
  },
  upcomingEvents: [
    { date: "Nov 15, 2024", event: "Q3 Earnings Call", impact: "Medium" },
    { date: "Dec 01, 2024", event: "Asteroid Scout Launch", impact: "High" },
    { date: "Jan 08, 2025", event: "CES Keynote Presentation", impact: "Low" }
  ],
  recentNews: [
    { headline: "AstroMining Secures $500M Series D Funding", date: "Oct 05, 2024" },
    { headline: "NASA Signs Data Sharing Agreement with ASTRO", date: "Sep 22, 2024" },
    { headline: "New CFO appointed from SpaceX", date: "Aug 15, 2024" }
  ],
  earningsCallAnalysis: {
    sentiment: "Bullish",
    summary: "Management remained extremely bullish during the last call, emphasizing that their cash runway now extends through 2026.",
    keyTakeaways: [
      "Cash runway extended through 2026 via Series D",
      "CEO emphasized proprietary plasma propulsion tech success",
      "Timeline for first retrieval mission remains vague"
    ]
  },
  overallSentiment: {
    score: 82,
    label: "Bullish",
    summary: "Strong investor confidence following the Series D funding and NASA partnership, supported by optimistic management guidance."
  },
  insiderActivity: [
    { insiderName: "Sarah Connor", role: "CEO", transactionDate: "2024-10-15", transactionType: "Buy", shares: "50,000", value: "$1.2M" },
    { insiderName: "Miles Dyson", role: "CTO", transactionDate: "2024-09-20", transactionType: "Buy", shares: "12,500", value: "$300K" },
    { insiderName: "Venture Partners LLC", role: "Director", transactionDate: "2024-08-01", transactionType: "Sell", shares: "100,000", value: "$2.1M" }
  ],
  riskMetrics: {
    beta: "2.1",
    shortInterestPercentage: "14.5%",
    shortInterestRatio: "4.2",
    volatility: "High"
  },
  institutionalSentiment: "Net Accumulation",
  tags: ["Space Tech", "Speculative", "Industrial", "Growth"],
  peers: [
    {
      ticker: "SPCX",
      name: "SpaceX (Private / Est)",
      marketCap: "$150B",
      peRatio: "N/A",
      revenueGrowth: "45.0%",
      netMargin: "2.5%"
    },
    {
      ticker: "RKLB",
      name: "Rocket Lab USA",
      marketCap: "$2.8B",
      peRatio: "N/A",
      revenueGrowth: "25.0%",
      netMargin: "-45.0%"
    },
    {
      ticker: "PLTR",
      name: "Palantir Technologies",
      marketCap: "$38.0B",
      peRatio: "65.4",
      revenueGrowth: "18.5%",
      netMargin: "12.0%"
    },
    {
      ticker: "LMT",
      name: "Lockheed Martin",
      marketCap: "$110.0B",
      peRatio: "16.5",
      revenueGrowth: "4.5%",
      netMargin: "9.8%"
    }
  ],
  financials: [
    { 
      year: "2021", 
      revenue: 12.5, 
      grossProfit: 2.1, 
      operatingIncome: -10.5, 
      netIncome: -15.5, 
      eps: -0.45,
      cashAndEquivalents: 150, 
      totalDebt: 45, 
      shareholderEquity: 80,
      operatingCashFlow: -12.0,
      capitalExpenditure: 5.0,
      freeCashFlow: -17.0
    },
    { 
      year: "2022", 
      revenue: 28.0, 
      grossProfit: 8.4, 
      operatingIncome: -35.0, 
      netIncome: -42.8, 
      eps: -0.98,
      cashAndEquivalents: 110, 
      totalDebt: 80, 
      shareholderEquity: 45,
      operatingCashFlow: -30.5,
      capitalExpenditure: 15.0,
      freeCashFlow: -45.5
    },
    { 
      year: "2023", 
      revenue: 65.5, 
      grossProfit: 22.5, 
      operatingIncome: -60.2, 
      netIncome: -85.2, 
      eps: -1.55,
      cashAndEquivalents: 450, // Post Series C
      totalDebt: 120, 
      shareholderEquity: 320,
      operatingCashFlow: -65.0,
      capitalExpenditure: 45.0,
      freeCashFlow: -110.0
    },
    { 
      year: "2024", 
      revenue: 145.0, 
      grossProfit: 65.0, 
      operatingIncome: -45.0, 
      netIncome: -60.5, 
      eps: -1.05,
      cashAndEquivalents: 850, // Post Series D
      totalDebt: 150, 
      shareholderEquity: 680,
      operatingCashFlow: -25.0,
      capitalExpenditure: 85.0,
      freeCashFlow: -110.0
    }
  ],
  priceHistory: [
    { month: "Nov", price: 12.50 },
    { month: "Dec", price: 13.20 },
    { month: "Jan", price: 14.00 },
    { month: "Feb", price: 13.50 },
    { month: "Mar", price: 15.80 },
    { month: "Apr", price: 18.20 },
    { month: "May", price: 19.50 },
    { month: "Jun", price: 18.90 },
    { month: "Jul", price: 21.00 },
    { month: "Aug", price: 22.50 },
    { month: "Sep", price: 23.80 },
    { month: "Oct", price: 24.50 }
  ],
  valuation: "Currently speculative. Trading purely on future IP value rather than earnings. Comparable to early-stage biotech.",
  verdict: "BUY",
  verdictReason: "A true moonshot. Position size accordingly (1-2% of portfolio), but the asymmetric upside potential is undeniable if execution succeeds.",
  sources: [
    { title: "Space Industry News - Mining", uri: "https://example.com/news" },
    { title: "Global Rare Earth Report", uri: "https://example.com/report" }
  ]
};

// Autocomplete Data Source
const POPULAR_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'PLTR', name: 'Palantir Technologies' },
  { symbol: 'COIN', name: 'Coinbase Global' },
  { symbol: 'GME', name: 'GameStop Corp.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'KO', name: 'Coca-Cola Co.' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'COST', name: 'Costco Wholesale' },
  { symbol: 'NKE', name: 'Nike Inc.' },
  { symbol: 'SBUX', name: 'Starbucks Corp.' },
  { symbol: 'MCD', name: 'McDonald\'s Corp.' },
  { symbol: 'BA', name: 'Boeing Co.' },
  { symbol: 'LMT', name: 'Lockheed Martin' },
  { symbol: 'XOM', name: 'Exxon Mobil' },
  { symbol: 'CVX', name: 'Chevron Corp.' },
  { symbol: 'MRNA', name: 'Moderna Inc.' },
  { symbol: 'PFE', name: 'Pfizer Inc.' },
  { symbol: 'LLY', name: 'Eli Lilly & Co.' },
  { symbol: 'INTC', name: 'Intel Corp.' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'UBER', name: 'Uber Technologies' },
  { symbol: 'ABNB', name: 'Airbnb Inc.' },
  { symbol: 'HOOD', name: 'Robinhood Markets' },
  { symbol: 'PYPL', name: 'PayPal Holdings' },
  { symbol: 'SQ', name: 'Block Inc.' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'TGT', name: 'Target Corp.' },
  { symbol: 'RTX', name: 'RTX Corp.' },
  { symbol: 'GE', name: 'General Electric' },
  { symbol: 'GM', name: 'General Motors' },
  { symbol: 'F', name: 'Ford Motor Co.' }
];

// Mock User Profile
const MOCK_USER: UserProfile = {
  name: "Trader One",
  tier: "Pro",
  joinDate: "Nov 2024"
};

// Phases for simulated progress
const ANALYSIS_PHASES = [
  "Initializing secure uplink...",
  "Scraping real-time market data...",
  "Parsing SEC Filings (10-K, 10-Q)...",
  "Analyzing Insider Trading patterns...",
  "Calculating intrinsic value models...",
  "Synthesizing investment thesis...",
  "Finalizing Moonshot Report..."
];

function App() {
  const [ticker, setTicker] = useState('');
  
  // View State (Replaces LoadingState for layout control)
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'REPORT'>('DASHBOARD');
  
  // Current active report to display
  const [report, setReport] = useState<EquityReport | null>(null);
  
  // Background Analysis Sessions
  const [analysisSessions, setAnalysisSessions] = useState<AnalysisSession[]>([]);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<{symbol: string, name: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Saved Reports
  const [savedReports, setSavedReports] = useState<SavedReportItem[]>(() => {
    const saved = localStorage.getItem('ultramagnus_saved_reports');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ultramagnus_saved_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  // PROGRESS SIMULATION EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisSessions(prevSessions => {
        // Optimization: if no session is processing, return prev
        if (!prevSessions.some(s => s.status === 'PROCESSING')) return prevSessions;

        return prevSessions.map(session => {
          if (session.status !== 'PROCESSING') return session;

          // Logistic curve simulation: Fast at start, slow at end
          const current = session.progress;
          let next = current;
          
          if (current < 30) next += 2;
          else if (current < 60) next += 1;
          else if (current < 85) next += 0.5;
          else if (current < 95) next += 0.1;
          
          // Map progress to phase text
          const phaseIndex = Math.min(
            Math.floor((next / 100) * ANALYSIS_PHASES.length), 
            ANALYSIS_PHASES.length - 1
          );

          return {
            ...session,
            progress: Math.min(next, 99), // Cap at 99 until API returns
            phase: ANALYSIS_PHASES[phaseIndex]
          };
        });
      });
    }, 150);

    return () => clearInterval(interval);
  }, []); // Run continuously

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    
    if (value.length > 0) {
      const filtered = POPULAR_STOCKS.filter(stock => 
        stock.symbol.startsWith(value) || 
        stock.symbol.includes(value) || 
        stock.name.toUpperCase().includes(value)
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    setTicker(symbol);
    setShowSuggestions(false);
  };

  const handleSearch = async (e?: React.FormEvent, searchTicker?: string) => {
    if (e) e.preventDefault();
    const targetTicker = searchTicker || ticker;
    if (!targetTicker.trim()) return;

    if (!searchTicker) {
      setTicker(''); // Clear input for next search
    }
    setShowSuggestions(false);

    // Create unique ID for this session
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

    // Prevent duplicate active analysis for the same ticker
    if (analysisSessions.some(s => s.ticker === targetTicker && s.status === 'PROCESSING')) {
        // Optional: Notify user
        return; 
    }

    const newSession: AnalysisSession = {
      id: sessionId,
      ticker: targetTicker,
      progress: 0,
      status: 'PROCESSING',
      phase: ANALYSIS_PHASES[0]
    };

    setAnalysisSessions(prev => [newSession, ...prev]);

    try {
      const data = await generateEquityReport(targetTicker);
      
      // COMPLETE ANALYSIS
      setAnalysisSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          progress: 100,
          status: 'READY',
          phase: "Report Declassified. Ready for viewing.",
          result: data
        };
      }));

    } catch (err) {
      console.error(err);
      setAnalysisSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'ERROR',
          progress: 0,
          phase: "Analysis Failed. Connection terminated.",
          error: "Failed to generate report. Please try again."
        };
      }));
    }
  };

  const handleViewSample = () => {
    setReport(SAMPLE_REPORT);
    setTicker("ASTRO");
    setViewMode('REPORT');
  };

  const handleViewAnalyzedReport = (sessionId: string) => {
    const session = analysisSessions.find(s => s.id === sessionId);
    if (session?.result) {
      setReport(session.result);
      setViewMode('REPORT');
      // We keep the session in the list until manually dismissed
    }
  };

  const handleCancelAnalysis = (sessionId: string) => {
    setAnalysisSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Reset to Dashboard (Home)
  const handleHome = () => {
    setViewMode('DASHBOARD');
    setReport(null);
    setTicker('');
  };

  const toggleSaveReport = (item: SavedReportItem) => {
    const exists = savedReports.some(i => i.ticker === item.ticker);
    if (exists) {
      setSavedReports(savedReports.filter(i => i.ticker !== item.ticker));
    } else {
      setSavedReports([...savedReports, item]);
    }
  };

  const removeReport = (tickerToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedReports(savedReports.filter(item => item.ticker !== tickerToRemove));
  };
  
  const loadReport = (item: SavedReportItem) => {
    if (item.fullReport) {
      setReport(item.fullReport);
      setViewMode('REPORT');
    } else {
      // Re-analyze if full report not saved (legacy support)
      handleSearch(undefined, item.ticker);
    }
  };

  const isSaved = report ? savedReports.some(w => w.ticker === report.ticker) : false;

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-200 relative overflow-hidden pb-20 selection:bg-indigo-500/30">
      
      {/* PROFESSIONAL BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] bg-gradient-to-b from-indigo-900/10 via-slate-900/50 to-slate-950 opacity-70"></div>
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
               backgroundSize: '60px 60px',
               maskImage: 'radial-gradient(circle at 50% 0%, black, transparent 80%)'
             }}>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/5 blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-900/5 blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10">
        <Header onHome={handleHome} savedCount={savedReports.length} />
        
        <main className={`container mx-auto px-4 max-w-6xl transition-all duration-500 ease-in-out ${viewMode === 'DASHBOARD' ? 'pt-8' : 'pt-6'}`}>
          
          {viewMode === 'DASHBOARD' ? (
            <Dashboard 
              user={MOCK_USER}
              savedReports={savedReports}
              onSearch={handleSearch}
              onLoadReport={loadReport}
              onRemoveReport={removeReport}
              tickerInput={ticker}
              onTickerChange={handleInputChange}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
              setShowSuggestions={setShowSuggestions}
              onViewSample={handleViewSample}
              analysisSessions={analysisSessions}
              onViewAnalyzedReport={handleViewAnalyzedReport}
              onCancelAnalysis={handleCancelAnalysis}
            />
          ) : (
            <div className="min-h-[400px]">
              {report && (
                <ReportCard 
                  report={report} 
                  isSaved={isSaved}
                  onToggleSave={toggleSaveReport}
                />
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
