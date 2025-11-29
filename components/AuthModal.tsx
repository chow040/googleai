
import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Rocket } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, name: string) => void;
  message?: string; // New prop for custom context messages
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, message }) => {
  const [isLoginMode, setIsLoginMode] = useState(!message);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock name extraction from email
      const name = email.split('@')[0].replace(/[0-9]/g, '');
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      
      onLogin(email, formattedName || 'Trader');
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Decor */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Rocket className="w-40 h-40" />
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/30">
               <Rocket className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              {isLoginMode ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isLoginMode 
                ? "Sign in to access your saved reports and analysis." 
                : (message || "Create a free account to continue analyzing.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
                    placeholder="trader@example.com"
                    autoFocus
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
                    placeholder="••••••••"
                  />
               </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isLoginMode ? "Sign In" : "Create Free Account"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {isLoginMode && (
            <div className="mt-6 pt-6 border-t border-white/5">
               <button 
                 onClick={() => onLogin('google-user@example.com', 'Google User')}
                 className="w-full bg-white text-slate-900 font-bold py-2.5 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
               >
                  <GoogleIcon /> Sign in with Google
               </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {isLoginMode ? (
                <>New to Moonshot? <span className="text-indigo-400 font-bold">Create an account</span></>
              ) : (
                <>Already have an account? <span className="text-indigo-400 font-bold">Sign In</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
