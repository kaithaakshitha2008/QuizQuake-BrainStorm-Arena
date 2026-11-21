import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistoryApi } from '../services/api.js';
import { AttemptHistoryItem } from '../types/index.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  History, 
  TrendingUp, 
  Trophy, 
  Target, 
  ArrowRight, 
  RotateCcw,
  Calendar,
  Layers
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchHistoryApi('student_01');
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const highestAccuracy = history.length > 0 
    ? Math.max(...history.map(h => h.accuracy)) 
    : 0;

  const averageAccuracy = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / history.length) 
    : 0;

  // Chart data
  const chartLabels = history.map((h, idx) => `Attempt ${idx + 1}`);
  const chartDataValues = history.map(h => h.accuracy);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Accuracy Trend (%)',
        data: chartDataValues,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#94A3B8',
          font: { family: "'Inter', sans-serif" },
          callback: (value: number) => `${value}%`,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
      },
      x: {
        ticks: {
          color: '#94A3B8',
          font: { family: "'Inter', sans-serif" },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#151D32',
        titleColor: '#60A5FA',
        bodyColor: '#F8FAFC',
        borderColor: '#1F2E52',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const item = history[context.dataIndex];
            return [
              ` Accuracy: ${item.accuracy}%`,
              ` Domain: ${item.topicName}`,
              ` Score: ${item.score}/${item.totalQuestions}`,
            ];
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Loading Learning Trajectory History...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <History className="w-8 h-8 text-primary-light" />
          <span>Assessment History & Progress Tracker</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Track your longitudinal improvement across multiple quiz attempts. Review past diagnostic profiles and monitor your accuracy growth over time.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary-light border border-primary/20">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">{history.length}</div>
            <p className="text-xs text-slate-400 mt-1">Completed Assessments</p>
          </div>
        </div>

        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">{highestAccuracy}%</div>
            <p className="text-xs text-slate-400 mt-1">Peak Accuracy Record</p>
          </div>
        </div>

        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-secondary/10 text-secondary-light border border-secondary/20">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">{averageAccuracy}%</div>
            <p className="text-xs text-slate-400 mt-1">Cumulative Average</p>
          </div>
        </div>
      </div>

      {/* Improvement Graph */}
      {history.length > 0 && (
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-light" />
              <span>Accuracy Improvement Curve</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Longitudinal accuracy progression across completed quiz sessions.
            </p>
          </div>

          <div className="w-full h-64 sm:h-80 relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Historical Attempts Table */}
      <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
        <h3 className="text-lg font-bold text-white">All Completed Attempts</h3>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No past assessment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-mono uppercase tracking-wider">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Subject / Focus</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Accuracy</th>
                  <th className="pb-3 font-semibold">Completion Date</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item, idx) => {
                  const accuracyColor =
                    item.accuracy >= 80
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : item.accuracy >= 60
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                  return (
                    <tr key={item.sessionId || idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 text-xs text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-slate-200">
                          {item.topicName}
                        </div>
                        {item.isRemedial && (
                          <span className="text-[10px] text-cyan-400 font-mono">REMEDIAL DRILL</span>
                        )}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {item.score} / {item.totalQuestions}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${accuracyColor}`}>
                          {item.accuracy}%
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-400">
                        {new Date(item.completedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/results/${item.sessionId}`)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-primary text-slate-300 hover:text-white border border-slate-700 hover:border-primary transition"
                        >
                          Diagnostic Report
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
  );
};
