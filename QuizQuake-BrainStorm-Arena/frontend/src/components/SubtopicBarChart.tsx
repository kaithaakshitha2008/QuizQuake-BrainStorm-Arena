import React from 'react';
import { SubtopicDiagnostic } from '../types/index.js';

interface Props {
  subtopics: SubtopicDiagnostic[];
  filterTopic?: string | null;
}

export const SubtopicBarChart: React.FC<Props> = ({ subtopics, filterTopic }) => {
  const filtered = filterTopic
    ? subtopics.filter(s => s.topic === filterTopic)
    : subtopics;

  const sorted = [...filtered].sort((a, b) => a.accuracy - b.accuracy);

  const getBarColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
    if (accuracy >= 60) return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
    if (accuracy >= 40) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
    return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
  };

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'Strong':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Needs improvement':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Weak':
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No subtopic data available for this selection.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((item, idx) => (
        <div key={idx} className="space-y-1.5 group">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{item.subtopic}</span>
              <span className="text-slate-500 text-[11px]">({item.topic})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">
                {item.correct}/{item.total}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getBadgeStyle(
                  item.classification
                )}`}
              >
                {item.accuracy}% • {item.classification}
              </span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(item.accuracy)}`}
              style={{ width: `${Math.max(5, item.accuracy)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
