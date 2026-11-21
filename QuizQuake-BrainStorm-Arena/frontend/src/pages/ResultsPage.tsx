import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { fetchReportApi, generateRemedialApi } from '../services/api.js';
import { DiagnosticReport } from '../types/index.js';
import { RadarChart } from '../components/RadarChart.js';
import { SubtopicBarChart } from '../components/SubtopicBarChart.js';
import { TrajectoryChart } from '../components/TrajectoryChart.js';
import { 
  Trophy, 
  Target, 
  Clock, 
  RotateCcw, 
  BookOpen, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  BrainCircuit, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(null);
  const [isGeneratingRemedial, setIsGeneratingRemedial] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    loadReport();
  }, [sessionId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await fetchReportApi(sessionId!);
      setReport(data);

      // Trigger celebratory confetti if score >= 60%
      if (data.overallAccuracy >= 60) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#8B5CF6', '#22C55E', '#06B6D4'],
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to load diagnostic report.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRemedial = async () => {
    if (!sessionId) return;
    try {
      setIsGeneratingRemedial(true);
      const res = await generateRemedialApi({
        studentId: 'student_01',
        referenceSessionId: sessionId,
      });

      navigate(`/quiz/${res.sessionId}`, {
        state: {
          initialQuestion: res.initialQuestion,
          session: {
            session_id: res.sessionId,
            total_questions: res.totalQuestions,
            selected_topic: 'Remedial Focus',
            current_difficulty: res.initialQuestion.difficulty,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          },
        },
      });
    } catch (err: any) {
      alert(err.message || 'Failed to generate remedial quiz');
    } finally {
      setIsGeneratingRemedial(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!report) return;

    try {
      const doc = new jsPDF();
      const margin = 20;

      // Header Banner
      doc.setFillColor(11, 16, 32);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('QuizQuake: BrainStorm Arena', margin, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('AI-INSPIRED ADAPTIVE LEARNING & DIAGNOSTIC REPORT', margin, 28);

      // Meta info
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student: Alex Mercer (ID: ${report.studentId})`, margin, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(`Session ID: ${report.sessionId}`, margin, 59);
      doc.text(`Generated: ${new Date(report.completedAt).toLocaleString()}`, margin, 66);

      // Summary Scores
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, 74, 170, 28, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Overall Score: ${report.correctAnswers} / ${report.totalQuestions} (${report.overallAccuracy}%)`, margin + 8, 86);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Time Spent: ${report.totalTimeSeconds} seconds | Mode: ${report.isRemedial ? 'Remedial Drill' : 'Adaptive Assessment'}`, margin + 8, 94);

      // Topic Mastery Breakdown
      let y = 114;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Domain-Wise Mastery Breakdown', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.topicDiagnostics.forEach(t => {
        doc.text(`• ${t.topic}: ${t.correct}/${t.total} (${t.accuracy}%) - Classification: ${t.classification}`, margin + 5, y);
        y += 7;
      });

      // Weakest Subtopics Highlight
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Identified Weak Subtopics (Priority Remediation)', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (report.weakestSubtopics.length > 0) {
        report.weakestSubtopics.slice(0, 5).forEach(st => {
          doc.setTextColor(225, 29, 72);
          doc.text(`• ${st.topic} -> ${st.subtopic}: ${st.accuracy}% accuracy (${st.correct}/${st.total})`, margin + 5, y);
          y += 7;
        });
      } else {
        doc.setTextColor(22, 163, 74);
        doc.text('• No weak conceptual areas detected! Superior performance across all tested subtopics.', margin + 5, y);
        y += 7;
      }

      // AI Insights
      y += 6;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('AI Diagnostic Recommendations', margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      report.aiInsights.forEach(insight => {
        const lines = doc.splitTextToSize(`• ${insight}`, 170);
        doc.text(lines, margin + 5, y);
        y += lines.length * 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Certified by QuizQuake: BrainStorm Arena Adaptive Engine', margin, 280);

      doc.save(`QuizQuake_Diagnostic_Report_${report.sessionId.slice(0, 10)}.pdf`);
    } catch (pdfErr) {
      console.error('PDF export error:', pdfErr);
      alert('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Computing Multidimensional Diagnostics...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <p className="text-rose-400 font-semibold">{error || 'Diagnostic Report not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const accuracyBadgeStyle =
    report.overallAccuracy >= 80
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      : report.overallAccuracy >= 60
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      : report.overallAccuracy >= 40
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : 'bg-rose-500/20 text-rose-400 border-rose-500/40';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#151D32] border border-[#1F2E52] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 border border-primary/30 text-primary-light">
                {report.isRemedial ? 'Remedial Quiz Report' : 'Assessment Report'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Session: {report.sessionId}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Diagnostic Performance Overview
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Your assessment has been evaluated by the QuizQuake Diagnostic Engine. Review topic-wise mastery, subtopic vulnerabilities, and difficulty trajectory below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate(`/review/${sessionId}`)}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4 text-primary-light" />
              <span>Review Solutions</span>
            </button>
            <button
              onClick={handleStartRemedial}
              disabled={isGeneratingRemedial}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary hover:from-secondary-light hover:to-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition"
            >
              <RotateCcw className="w-4 h-4 text-cyan-300" />
              <span>Practice Weak Topics (5 Qs)</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Download Diagnostic Report as PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Performance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Accuracy */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary-light border border-primary/20">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {report.overallAccuracy}%
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${accuracyBadgeStyle}`}>
                {report.overallAccuracy >= 80 ? 'Strong' : report.overallAccuracy >= 60 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Overall Assessment Accuracy</p>
          </div>
        </div>

        {/* Score Ratio */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {report.correctAnswers} <span className="text-base text-slate-400">/ {report.totalQuestions}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Correct Questions</p>
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {Math.floor(report.totalTimeSeconds / 60)}m {report.totalTimeSeconds % 60}s
            </div>
            <p className="text-xs text-slate-400 mt-1">Total Assessment Time</p>
          </div>
        </div>

        {/* Weak Subtopics Count */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {report.weakestSubtopics.length}
            </div>
            <p className="text-xs text-rose-400 mt-1">Identified Weak Areas</p>
          </div>
        </div>
      </div>

      {/* Middle Section: Interactive Radar Chart & Subtopic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart Card */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary-light" />
                <span>Multi-Domain Mastery Radar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Polygon visualizes performance across core CS domains. Click any domain to filter subtopics.
              </p>
            </div>
            {selectedTopicFilter && (
              <button
                onClick={() => setSelectedTopicFilter(null)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                Reset Filter
              </button>
            )}
          </div>

          <RadarChart
            topics={report.topicDiagnostics}
            onSelectTopic={topicName => setSelectedTopicFilter(topicName)}
          />

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Outer perimeter: 100% Mastery</span>
            <span className="text-primary-light font-medium">Click polygon points to filter subtopics</span>
          </div>
        </div>

        {/* Subtopic Granular Breakdown Card */}
        <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-cyan-400" />
                  <span>Subtopic Vulnerability Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedTopicFilter
                    ? `Showing subtopics for: ${selectedTopicFilter}`
                    : 'Accuracies across all attempted subtopics'}
                </p>
              </div>
            </div>

            <SubtopicBarChart
              subtopics={report.subtopicDiagnostics}
              filterTopic={selectedTopicFilter}
            />
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt;40% Weak
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 40-59% Improvement
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;80% Strong
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Trajectory Graph */}
      <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span>Adaptive Difficulty Trajectory (Session Scaling)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Shows how QuizQuake adapted question difficulty based on your consecutive answers. Green dots indicate correct responses; red dots indicate incorrect responses.
          </p>
        </div>

        <TrajectoryChart trajectory={report.difficultyTrajectory} />
      </div>

      {/* AI Diagnostic Insights & Action Plan */}
      <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <span>AI Diagnostic Insights & Recommended Next Steps</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary-light flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
