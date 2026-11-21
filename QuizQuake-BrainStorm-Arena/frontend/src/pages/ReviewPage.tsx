import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReportApi } from '../services/api.js';
import { DiagnosticReport, AnswerRecord } from '../types/index.js';
import { DifficultyBadge } from '../components/DifficultyBadge.js';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lightbulb, 
  ArrowLeft, 
  RotateCcw, 
  Filter,
  Check,
  X
} from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    if (!sessionId) return;
    loadReport();
  }, [sessionId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await fetchReportApi(sessionId!);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Loading Solution Review Cards...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <p className="text-rose-400 font-semibold">Quiz session not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredAnswers = report.review.filter(item => {
    if (filterMode === 'correct') return item.is_correct;
    if (filterMode === 'incorrect') return !item.is_correct;
    return true;
  });

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate(`/results/${sessionId}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Diagnostic Report</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Comprehensive Solution Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Inspect your answers, verified solutions, time spent, and detailed explanations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#151D32] border border-[#1F2E52] p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'all'
                ? 'bg-primary text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({report.review.length})
          </button>
          <button
            onClick={() => setFilterMode('correct')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterMode === 'correct'
                ? 'bg-emerald-500 text-white'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>Correct ({report.correctAnswers})</span>
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterMode === 'incorrect'
                ? 'bg-rose-500 text-white'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <X className="w-3 h-3" />
            <span>Incorrect ({report.totalQuestions - report.correctAnswers})</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredAnswers.map((item, idx) => {
          const originalIdx = report.review.indexOf(item) + 1;
          const statusBg = item.is_correct
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-rose-500/30 bg-rose-500/5';

          return (
            <div
              key={item.answer_id || idx}
              className={`rounded-2xl border p-6 sm:p-7 shadow-xl space-y-5 bg-[#151D32] ${statusBg}`}
            >
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-400">
                    Question {String(originalIdx).padStart(2, '0')}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.is_correct
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {item.is_correct ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                    {item.topic} › {item.subtopic}
                  </span>
                  <DifficultyBadge difficulty={item.difficulty_at_question} size="sm" />
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-bold text-white leading-relaxed">
                {item.question}
              </h3>

              {/* Options Breakdown */}
              <div className="space-y-2">
                {item.options?.map((opt, optIdx) => {
                  const isCorrect = optIdx === item.correct_answer;
                  const isSelected = optIdx === item.selected_answer;

                  let optClass = 'bg-slate-900/40 border-slate-800 text-slate-400';
                  let badge = null;

                  if (isCorrect) {
                    optClass = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold';
                    badge = (
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                        Correct Answer
                      </span>
                    );
                  } else if (isSelected && !item.is_correct) {
                    optClass = 'bg-rose-500/15 border-rose-500/40 text-rose-200 font-semibold';
                    badge = (
                      <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                        Your Answer
                      </span>
                    );
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-sm transition ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                          {optionLetters[optIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {badge}
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Time Taken Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-amber-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    <span>Explanation</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time spent: {item.time_spent_seconds} seconds</span>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{item.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Back Button */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => navigate(`/results/${sessionId}`)}
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm transition shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          Back to Diagnostic Dashboard
        </button>
      </div>
    </div>
  );
};
