import React from 'react';

interface Props {
  current: number;
  total: number;
  streak?: number;
}

export const ProgressBar: React.FC<Props> = ({ current, total, streak = 0 }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-mono tracking-wider">
          QUESTION <span className="text-white font-bold">{current}</span> OF <span className="text-slate-300">{total}</span>
        </span>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-amber-400 flex items-center gap-1 font-semibold animate-pulse">
              🔥 {streak} Streak
            </span>
          )}
          <span className="text-primary-light font-mono font-bold">{percentage}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
