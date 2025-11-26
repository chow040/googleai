
import React from 'react';
import { Rocket, FolderOpen } from 'lucide-react';

interface HeaderProps {
  onHome: () => void;
  savedCount: number;
}

const Header: React.FC<HeaderProps> = ({ onHome, savedCount }) => {
  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-white/10 bg-slate-900/50">
      <div 
        className="flex items-center space-x-3 cursor-pointer group" 
        onClick={onHome}
        title="Return to Dashboard"
      >
        <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-lg shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">
            Ultramagnus
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide group-hover:text-indigo-300 transition-colors">AI-POWERED EQUITY RESEARCH</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onHome}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 hover:border-indigo-500/50 transition-all group"
        >
          <FolderOpen className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
          <span className="hidden md:block text-xs font-bold text-slate-300 group-hover:text-white">Saved Reports</span>
          {savedCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 rounded-full">
              {savedCount}
            </span>
          )}
        </button>
        
        <div className="hidden md:block">
          <span className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider">
            Market Status: Active
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
