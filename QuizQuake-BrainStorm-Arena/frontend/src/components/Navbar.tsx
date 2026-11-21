import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Zap, 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Flame
} from 'lucide-react';

interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDemo: () => void;
}

export const Navbar: React.FC<Props> = ({ 
  soundEnabled, 
  onToggleSound, 
  onOpenDemo 
}) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Topics', path: '/topics', icon: BookOpen },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B1020]/80 backdrop-blur-xl border-b border-[#1F2E52]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] transition-all duration-300">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                QuizQuake
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">
                AI
              </span>
            </div>
            <p className="text-[10px] tracking-widest uppercase font-semibold text-secondary-light font-mono -mt-0.5">
              BrainStorm Arena
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#151D32]/80 p-1.5 rounded-xl border border-[#1F2E52]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Hackathon Demo Walkthrough Button */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            title="Launch Hackathon Winning Demo Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">Hackathon Demo</span>
          </button>

          {/* Learning Streak Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-orange-400" />
            <span>4 Days</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-[#151D32] border border-[#1F2E52] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary-light" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Alex"
              alt="Alex Mercer"
              className="w-8 h-8 rounded-full bg-slate-800 border border-primary/40 ring-2 ring-primary/20"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">Alex Mercer</p>
              <p className="text-[10px] text-slate-400 leading-tight">CS Student</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
