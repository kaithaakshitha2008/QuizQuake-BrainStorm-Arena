import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  fetchNextQuestion, 
  submitAnswerApi, 
  submitQuizApi 
} from '../services/api.js';
import { 
  PublicQuestion, 
  AnswerSubmissionResult, 
  QuizSession 
} from '../types/index.js';
import { useQuizTimer } from '../hooks/useQuizTimer.js';
import { useAudioFx } from '../hooks/useAudioFx.js';
import { Timer } from '../components/Timer.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { QuestionCard } from '../components/QuestionCard.js';
import { DifficultyBadge } from '../components/DifficultyBadge.js';
import { AlertCircle, Zap, ShieldAlert } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentQuestion, setCurrentQuestion] = useState<PublicQuestion | null>(() => {
    return location.state?.initialQuestion || null;
  });
  const [sessionData, setSessionData] = useState<Partial<QuizSession>>(() => {
    return location.state?.session || { total_questions: 10, current_difficulty: 'Medium' };
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<AnswerSubmissionResult | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);

  // Per-question timer
  const questionStartTimeRef = useRef<number>(Date.now());

  // Sound effects
  const { playCorrect, playIncorrect, playLevelUp, playLevelDown } = useAudioFx();

  // Expiry handler
  const handleTimeExpired = useCallback(async () => {
    if (!sessionId) return;
    try {
      await submitQuizApi(sessionId);
      navigate(`/results/${sessionId}`, { state: { autoSubmittedDueToTime: true } });
    } catch {
      navigate(`/results/${sessionId}`);
    }
  }, [sessionId, navigate]);

  // Quiz timer hook
  const expiresAt = sessionData.expires_at || null;
  const { formattedTime, isWarning, isDanger, isExpired } = useQuizTimer({
    expiresAt,
    onExpire: handleTimeExpired,
    isActive: submissionResult?.isCompleted !== true,
  });

  // If initialQuestion was not passed in location.state (e.g. page refresh), fetch it
  useEffect(() => {
    if (!currentQuestion && sessionId) {
      fetchNextQuestion(sessionId)
        .then(res => {
          if (res.question) {
            setCurrentQuestion(res.question);
            questionStartTimeRef.current = Date.now();
          } else {
            navigate(`/results/${sessionId}`);
          }
        })
        .catch(err => {
          console.error(err);
          navigate('/');
        });
    }
  }, [sessionId, currentQuestion, navigate]);

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion || !sessionId || isSubmitting) return;

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));

    try {
      setIsSubmitting(true);
      const result = await submitAnswerApi({
        sessionId,
        questionId: currentQuestion.id,
        selectedAnswer: selectedOption,
        timeSpentSeconds,
      });

      setSubmissionResult(result);

      // Audio feedback and streak tracking
      if (result.isCorrect) {
        setCorrectStreak(prev => prev + 1);
        if (result.newDifficulty !== result.previousDifficulty) {
          playLevelUp();
        } else {
          playCorrect();
        }
      } else {
        setCorrectStreak(0);
        if (result.newDifficulty !== result.previousDifficulty) {
          playLevelDown();
        } else {
          playIncorrect();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!submissionResult || !sessionId) return;

    if (submissionResult.isCompleted || !submissionResult.nextQuestion) {
      navigate(`/results/${sessionId}`);
      return;
    }

    // Advance to next question
    setCurrentQuestion(submissionResult.nextQuestion);
    setSelectedOption(null);
    setSubmissionResult(null);
    questionStartTimeRef.current = Date.now();
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Preparing Next Adaptive Question...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* Top Header Bar: Progress, Timer, Live Difficulty Indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151D32] border border-[#1F2E52] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex-1 w-full sm:w-auto">
          <ProgressBar
            current={currentQuestion.questionNumber}
            total={currentQuestion.totalQuestions}
            streak={correctStreak}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden md:inline">Difficulty:</span>
            <DifficultyBadge difficulty={currentQuestion.difficulty} size="sm" />
          </div>

          <Timer
            formattedTime={formattedTime}
            isWarning={isWarning}
            isDanger={isDanger}
            isExpired={isExpired}
          />
        </div>
      </div>

      {/* 2-Minute Warning Banner */}
      {isWarning && !isExpired && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Notice: Less than 2 minutes remaining! Quiz will automatically submit when timer reaches zero.</span>
        </div>
      )}

      {/* Main Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
        isSubmitting={isSubmitting}
        submissionResult={submissionResult}
      />
    </div>
  );
};
