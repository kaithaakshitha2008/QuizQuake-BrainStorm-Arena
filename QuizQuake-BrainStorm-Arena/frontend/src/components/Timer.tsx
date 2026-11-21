import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  formattedTime: string;
  isWarning: boolean;
  isDanger: boolean;
  isExpired: boolean;
}

export const Timer: React.FC<Props> = ({ 
  formattedTime, 
  isWarning, 
  isDanger, 
  isExpired 
}) => {
  let badgeColor = 'bg-slate-800/80 border-slate-700 text-slate-200';
  let iconColor = 'text-primary-light';

  if (isDanger) {
    badgeColor = 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse-fast shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    iconColor = 'text-rose-400';
  } else if (isWarning) {
    badgeColor = 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)]';
    iconColor = 'text-amber-400';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-sm tracking-widest transition-all duration-300 ${badgeColor}`}
    >
      {isDanger || isWarning ? (
        <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
      ) : (
        <Clock className={`w-4 h-4 ${iconColor}`} />
      )}
      <span className="font-bold">{isExpired ? '00:00' : formattedTime}</span>
    </div>
  );
};
