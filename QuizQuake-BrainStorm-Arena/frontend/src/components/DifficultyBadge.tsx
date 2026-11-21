import React from 'react';
import { Difficulty } from '../types/index.js';
import { ShieldCheck, Zap, Flame } from 'lucide-react';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DifficultyBadge: React.FC<Props> = ({ 
  difficulty, 
  size = 'md', 
  showIcon = true 
}) => {
  const config = {
    Easy: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      icon: ShieldCheck,
      label: 'Easy'
    },
    Medium: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      icon: Zap,
      label: 'Medium'
    },
    Hard: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      icon: Flame,
      label: 'Hard'
    }
  }[difficulty] || {
    bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    glow: '',
    icon: Zap,
    label: difficulty
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-300 ${config.bg} ${config.glow} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
