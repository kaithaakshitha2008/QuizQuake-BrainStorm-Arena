export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Topic {
  topic_id: number;
  topic_name: string;
  subtopic_name: string;
}

export interface Question {
  id: number;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PublicQuestion {
  id: number;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  questionNumber: number;
  totalQuestions: number;
}

export interface Student {
  student_id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface QuizSession {
  session_id: string;
  student_id: string;
  selected_topic: string | null; // null for All/Mixed
  current_difficulty: Difficulty;
  correct_streak: number;
  incorrect_streak: number;
  total_questions: number;
  questions_answered: number;
  score: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  is_remedial: boolean;
  started_at: string;
  expires_at: string;
  completed_at?: string;
  current_question_id?: number;
}

export interface AnswerSubmission {
  session_id: string;
  question_id: number;
  selected_answer: number; // 0, 1, 2, 3
  time_spent_seconds: number;
}

export interface AnswerRecord {
  answer_id: number;
  session_id: string;
  question_id: number;
  selected_answer: number;
  is_correct: boolean;
  time_spent_seconds: number;
  difficulty_at_question: Difficulty;
  created_at: string;
  // Join fields for review
  question?: string;
  options?: string[];
  correct_answer?: number;
  explanation?: string;
  topic?: string;
  subtopic?: string;
}

export interface SubtopicDiagnostic {
  subtopic: string;
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  classification: 'Strong' | 'Good' | 'Needs improvement' | 'Weak';
}

export interface TopicDiagnostic {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  classification: 'Strong' | 'Good' | 'Needs improvement' | 'Weak';
  subtopics: SubtopicDiagnostic[];
}

export interface DifficultyTrajectoryPoint {
  questionNumber: number;
  difficulty: Difficulty;
  isCorrect: boolean;
  topic: string;
  subtopic: string;
}

export interface DiagnosticReport {
  sessionId: string;
  studentId: string;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  totalTimeSeconds: number;
  isRemedial: boolean;
  topicDiagnostics: TopicDiagnostic[];
  subtopicDiagnostics: SubtopicDiagnostic[];
  strongestTopics: string[];
  weakestTopics: string[];
  weakestSubtopics: SubtopicDiagnostic[];
  difficultyTrajectory: DifficultyTrajectoryPoint[];
  aiInsights: string[];
  review: AnswerRecord[];
}

export interface StudentDashboardStats {
  student: Student;
  totalQuizzes: number;
  averageAccuracy: number;
  currentStreakDays: number;
  strongestTopic: string;
  weakestTopic: string;
  recentAttempts: Array<{
    session_id: string;
    completed_at: string;
    topic: string;
    total_questions: number;
    score: number;
    accuracy: number;
    is_remedial: boolean;
  }>;
}
