import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard, startQuizApi, generateRemedialApi } from '../services/api.js';
import { StudentDashboardStats } from '../types/index.js';
import { 
  Trophy, 
  Target, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  BrainCircuit, 
  Layers, 
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingQuick, setIsStartingQuick] = useState(false);
  const [isStartingRemedial, setIsStartingRemedial] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuickQuiz = async () => {
    try {
      setIsStartingQuick(true);
      const { session, initialQuestion } = await startQuizApi({
        selectedTopic: null,
        totalQuestions: 10,
        timeLimitMinutes: 10,
      });
      navigate(`/quiz/${session.session_id}`, { state: { initialQuestion, session } });
    } catch (err: any) {
      alert(err.message || 'Failed to start quiz');
    } finally {
      setIsStartingQuick(false);
    }
  };

  const handleStartRemedial = async () => {
    try {
      setIsStartingRemedial(true);
      const res = await generateRemedialApi({ studentId: 'student_01' });
      navigate(`/quiz/${res.sessionId}`, {
        state: {
          initialQuestion: res.initialQuestion,
          session: {
            session_id: res.sessionId,
            total_questions: res.totalQuestions,
            selected_topic: 'Targeted Remedial',
            current_difficulty: res.initialQuestion.difficulty,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          },
        },
      });
    } catch (err: any) {
      alert(err.message || 'Failed to generate remedial quiz');
    } finally {
      setIsStartingRemedial(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Calibrating Adaptive Engine Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <p className="text-rose-400 font-semibold">{error || 'Failed to load dashboard'}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#151D32] via-[#1A2542] to-[#151D32] border border-[#1F2E52] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary-light text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI-INSPIRED ADAPTIVE LEARNING PLATFORM</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-primary-light via-secondary-light to-accent bg-clip-text text-transparent">QuizQuake</span> Arena
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Test your Computer Science knowledge with real-time difficulty scaling, granular weakness detection, and personalized diagnostic analytics.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate('/topics')}
              className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.5)] transition duration-300"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start New Quiz</span>
            </button>
            <button
              onClick={handleStartRemedial}
              disabled={isStartingRemedial}
              className="flex-1 sm:flex-initial px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 transition duration-300"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Practice Weak Topics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Quizzes */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Quizzes</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary-light">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats.totalQuizzes}
            </div>
            <p className="text-xs text-slate-400 mt-1">Total attempted</p>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Accuracy</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats.averageAccuracy}%
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Overall mastery
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats.currentStreakDays} <span className="text-sm font-normal text-slate-400">Days</span>
            </div>
            <p className="text-xs text-amber-400 mt-1">Active daily learning</p>
          </div>
        </div>

        {/* Strongest Topic */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Strongest</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-emerald-300 truncate" title={stats.strongestTopic}>
              {stats.strongestTopic}
            </div>
            <p className="text-xs text-slate-400 mt-1">Highest accuracy</p>
          </div>
        </div>

        {/* Weakest Topic */}
        <div className="col-span-2 lg:col-span-1 bg-[#151D32] border border-[#1F2E52] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Focus Area</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-rose-300 truncate" title={stats.weakestTopic}>
              {stats.weakestTopic}
            </div>
            <p className="text-xs text-rose-400 mt-1">Needs reinforcement</p>
          </div>
        </div>
      </div>

      {/* Main Action Hub & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Action Cards */}
        <div className="space-y-4">
          <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-light" />
              <span>Quick Arena Launch</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch a full mixed-domain adaptive assessment across Data Structures, Algorithms, OS, and Networks with real-time consecutive difficulty scaling.
            </p>
            <button
              onClick={handleStartQuickQuiz}
              disabled={isStartingQuick}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition"
            >
              {isStartingQuick ? (
                <span>Generating Session...</span>
              ) : (
                <>
                  <span>Quick Mixed Assessment (10 Qs)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Adaptive Engine Specs Card */}
          <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                ADAPTIVE ENGINE STATUS
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span>2 Consecutive Correct</span>
                <span className="font-semibold text-emerald-400">Scale +1 Level</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span>1 Incorrect Answer</span>
                <span className="font-semibold text-rose-400">Scale -1 Level</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span>Weakness Detection</span>
                <span className="font-semibold text-cyan-400">Subtopic Tagged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Quizzes History */}
        <div className="lg:col-span-2 bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Assessments</h3>
              <p className="text-xs text-slate-400">Past performance history and diagnostic reports</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1 transition"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.recentAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No assessments attempted yet. Start your first quiz above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-mono uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Domain / Focus</th>
                    <th className="pb-3 font-semibold">Score</th>
                    <th className="pb-3 font-semibold">Accuracy</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recentAttempts.map((attempt, idx) => {
                    const accuracyColor =
                      attempt.accuracy >= 80
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : attempt.accuracy >= 60
                        ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-slate-200">
                            {attempt.topic}
                          </div>
                          {attempt.is_remedial ? (
                            <span className="text-[10px] text-cyan-400 font-mono">REMEDIAL DRILL</span>
                          ) : null}
                        </td>
                        <td className="py-3.5 font-mono text-slate-300">
                          {attempt.score}/{attempt.total_questions}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${accuracyColor}`}>
                            {attempt.accuracy}%
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-slate-400">
                          {new Date(attempt.completed_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => navigate(`/results/${attempt.session_id}`)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-primary text-slate-300 hover:text-white border border-slate-700 hover:border-primary transition"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
