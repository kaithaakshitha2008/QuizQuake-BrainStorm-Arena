import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoWalkthroughModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'Initial Medium Baseline',
      desc: 'Start assessment at Medium difficulty. The engine samples questions across core CS domains.',
      icon: CheckCircle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      num: '2',
      title: 'Consecutive Correct Scaling',
      desc: 'Answer 2 questions consecutively correct. The engine detects mastery confidence.',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      num: '3',
      title: 'Dynamic Hard Escalation',
      desc: 'Difficulty automatically scales up to Hard! Complex algorithmic & system architecture questions appear.',
      icon: Sparkles,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      num: '4',
      title: 'Vulnerability Detection',
      desc: 'Answer a Deadlock Avoidance question incorrectly. The engine catches the conceptual gap immediately.',
      icon: AlertCircle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      num: '5',
      title: 'Adaptive Downscaling',
      desc: 'Difficulty smoothly decreases back to Medium to find student threshold without demoralization.',
      icon: TrendingDown,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      num: '6',
      title: 'Radar Chart Diagnostics',
      desc: 'Interactive Chart.js radar shows exact mastery polygon, pinpointing Deadlocks (< 40% accuracy).',
      icon: Trophy,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      num: '7',
      title: 'Targeted Remedial Engine',
      desc: 'One-click "Practice Weak Topics" generates an instant 5-question custom drill targeting weak subtopics.',
      icon: RotateCcw,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    }
  ];

  const handleStartDemoQuiz = () => {
    onClose();
    navigate('/topics');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#151D32] border border-[#1F2E52] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Winning Hackathon Live Demo Script</h2>
            <p className="text-xs text-amber-400 font-mono">QuizQuake Intelligence Proof Protocol</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Demonstrate QuizQuake's AI-inspired intelligence to judges through this exact live experiment showing consecutive difficulty adaptation, granular weakness pinpointing, and instantaneous remedial quiz generation.
        </p>

        <div className="space-y-3 mb-8">
          {steps.map(step => (
            <div
              key={step.num}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${step.color}`}
              >
                {step.num}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
          >
            Close Guide
          </button>
          <button
            onClick={handleStartDemoQuiz}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition"
          >
            <span>Launch Live Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
