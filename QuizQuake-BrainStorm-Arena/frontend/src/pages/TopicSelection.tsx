import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopics, startQuizApi } from '../services/api.js';
import { TopicItem } from '../types/index.js';
import { 
  Network, 
  Cpu, 
  GitBranch, 
  Binary, 
  Layers, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const TopicSelection: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTopics, setIsFetchingTopics] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsFetchingTopics(true);
      const data = await fetchTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    } finally {
      setIsFetchingTopics(false);
    }
  };

  const getTopicIcon = (name: string) => {
    switch (name) {
      case 'Data Structures':
        return Binary;
      case 'Algorithms':
        return GitBranch;
      case 'Operating Systems':
        return Cpu;
      case 'Computer Networks':
        return Network;
      default:
        return Layers;
    }
  };

  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      const chosen = selectedTopic === 'All Topics' ? null : selectedTopic;
      const { session, initialQuestion } = await startQuizApi({
        selectedTopic: chosen,
        totalQuestions,
        timeLimitMinutes,
      });

      navigate(`/quiz/${session.session_id}`, {
        state: { session, initialQuestion },
      });
    } catch (err: any) {
      alert(err.message || 'Failed to start quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Select Knowledge Arena
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Choose a specific core Computer Science domain or challenge yourself with a Mixed Assessment. The QuizQuake Adaptive Engine will dynamically scale difficulty based on your consecutive answers.
        </p>
      </div>

      {/* Arena Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* All Topics Card */}
        <div
          onClick={() => setSelectedTopic('All Topics')}
          className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
            selectedTopic === 'All Topics'
              ? 'bg-gradient-to-b from-[#1E294B] to-[#151D32] border-primary ring-2 ring-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
              : 'bg-[#151D32] border-[#1F2E52] hover:border-slate-600 hover:bg-[#1A2542]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg">
                <Layers className="w-6 h-6" />
              </div>
              {selectedTopic === 'All Topics' ? (
                <div className="p-1 rounded-full bg-primary text-white">
                  <CheckCircle className="w-5 h-5" />
                </div>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light">
                  Recommended
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">All Core Topics (Mixed Arena)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Full comprehensive diagnostic covering all 4 core CS domains. Ideal for weakness discovery.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                Data Structures
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                Algorithms
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                Operating Systems
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                Networks
              </span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Adaptive Scaling: Full</span>
            <span className="font-semibold text-primary-light font-mono">60 Questions Total</span>
          </div>
        </div>

        {/* Individual Topic Cards */}
        {topics.map(topic => {
          const Icon = getTopicIcon(topic.name);
          const isSelected = selectedTopic === topic.name;

          return (
            <div
              key={topic.name}
              onClick={() => setSelectedTopic(topic.name)}
              className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1E294B] to-[#151D32] border-primary ring-2 ring-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  : 'bg-[#151D32] border-[#1F2E52] hover:border-slate-600 hover:bg-[#1A2542]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-primary-light shadow">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Focused domain drill spanning 5 Easy, 5 Medium, and 5 Hard MCQs.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Tagged Subtopics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.subtopics.map(sub => (
                      <span
                        key={sub}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/40"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>15 Questions Bank</span>
                <span className="font-semibold text-primary-light font-mono">Easy • Med • Hard</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assessment Customization Bar */}
      <div className="bg-[#151D32] border border-[#1F2E52] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
          {/* Question Count Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
              Quiz Length
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setTotalQuestions(cnt)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    totalQuestions === cnt
                      ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
              Time Limit
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeLimitMinutes(mins)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    timeLimitMinutes === mins
                      ? 'bg-secondary text-white border-secondary shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleStartQuiz}
            disabled={isLoading || isFetchingTopics}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 text-white font-bold text-base flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.5)] transition duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing Arena...</span>
              </>
            ) : (
              <>
                <span>Enter Arena & Begin Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
