import React, { useEffect } from 'react';
import { PublicQuestion, AnswerSubmissionResult } from '../types/index.js';
import { DifficultyBadge } from './DifficultyBadge.js';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  question: PublicQuestion;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  submissionResult: AnswerSubmissionResult | null;
}

export const QuestionCard: React.FC<Props> = ({
  question,
  selectedOption,
  onSelectOption,
  onSubmit,
  onNext,
  isSubmitting,
  submissionResult,
}) => {
  const isAnswered = submissionResult !== null;

  // Keyboard shortcut listener (1-4 keys to select option, Enter to submit/advance)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < question.options.length) {
            onSelectOption(idx);
          }
        } else if (e.key === 'Enter' && selectedOption !== null) {
          onSubmit();
        }
      } else {
        if (e.key === 'Enter') {
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isSubmitting, selectedOption, question.options.length, onSelectOption, onSubmit, onNext]);

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

      {/* Header tags: Topic, Subtopic, Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary-light">
            {question.topic}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700/60 text-slate-300">
            {question.subtopic}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Current Engine Difficulty:</span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {/* Question prompt */}
      <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
        {question.question}
      </h2>

      {/* Options Grid */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          let containerStyle = 'border-slate-700/70 bg-slate-800/40 hover:bg-slate-800/80 hover:border-primary/50 text-slate-200';
          let letterStyle = 'bg-slate-700/60 text-slate-300 border-slate-600/50';

          if (isAnswered) {
            const isCorrectAnswer = idx === submissionResult.correctAnswer;
            const isUserSelection = idx === selectedOption;

            if (isCorrectAnswer) {
              containerStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
              letterStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
            } else if (isUserSelection && !submissionResult.isCorrect) {
              containerStyle = 'border-rose-500/60 bg-rose-500/15 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
              letterStyle = 'bg-rose-500 text-white font-bold border-rose-400';
            } else {
              containerStyle = 'border-slate-800 bg-slate-900/30 text-slate-500 opacity-60';
              letterStyle = 'bg-slate-800/50 text-slate-500 border-slate-700/30';
            }
          } else if (isSelected) {
            containerStyle = 'border-primary bg-primary/15 text-white ring-2 ring-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
            letterStyle = 'bg-primary text-white font-bold border-primary-light';
          }

          return (
            <button
              key={idx}
              onClick={() => !isAnswered && onSelectOption(idx)}
              disabled={isAnswered || isSubmitting}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${containerStyle} group cursor-pointer disabled:cursor-default`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border flex-shrink-0 transition-transform ${letterStyle}`}>
                {optionLetters[idx]}
              </span>
              <span className="text-base font-medium pt-1 flex-1">{option}</span>
              {isAnswered && idx === submissionResult.correctAnswer && (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 self-center" />
              )}
              {isAnswered && isSelected && !submissionResult.isCorrect && (
                <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 self-center" />
              )}
            </button>
          );
        })}
      </div>

      {/* Post-submission Adaptive Feedback & Explanation */}
      {isAnswered && (
        <div className="space-y-4 mb-6 animate-fadeIn">
          {/* Adaptive Scaling Notification banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              submissionResult.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  submissionResult.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {submissionResult.newDifficulty !== submissionResult.previousDifficulty ? (
                  submissionResult.isCorrect ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {submissionResult.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">{submissionResult.streakReason}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Next Difficulty:</span>
              <DifficultyBadge difficulty={submissionResult.newDifficulty} size="sm" />
            </div>
          </div>

          {/* Conceptual Explanation Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 text-sm">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Conceptual Explanation</span>
            </div>
            <p className="leading-relaxed text-slate-200">{submissionResult.explanation}</p>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 hidden sm:block font-mono">
          {!isAnswered ? 'Select an answer (or press 1-4, then Enter)' : 'Press Enter or click to continue'}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {!isAnswered ? (
            <button
              onClick={onSubmit}
              disabled={selectedOption === null || isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary hover:from-secondary-light hover:to-primary text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300"
            >
              <span>{submissionResult.isCompleted ? 'View Diagnostic Report' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
