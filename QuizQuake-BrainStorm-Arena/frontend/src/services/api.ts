import { 
  StudentDashboardStats, 
  TopicItem, 
  PublicQuestion, 
  AnswerSubmissionResult, 
  DiagnosticReport, 
  AttemptHistoryItem 
} from '../types/index.js';

const API_BASE = '/api';

export async function fetchDashboard(studentId = 'student_01'): Promise<StudentDashboardStats> {
  const res = await fetch(`${API_BASE}/quiz/dashboard?studentId=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchTopics(): Promise<TopicItem[]> {
  const res = await fetch(`${API_BASE}/topics`);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function startQuizApi(params: {
  studentId?: string;
  selectedTopic?: string | null;
  totalQuestions?: number;
  timeLimitMinutes?: number;
}): Promise<{
  session: {
    session_id: string;
    student_id: string;
    selected_topic: string | null;
    current_difficulty: string;
    total_questions: number;
    expires_at: string;
  };
  initialQuestion: PublicQuestion;
}> {
  const res = await fetch(`${API_BASE}/quiz/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to start quiz');
  }
  return res.json();
}

export async function fetchNextQuestion(sessionId: string): Promise<{ hasMore: boolean; question?: PublicQuestion }> {
  const res = await fetch(`${API_BASE}/questions/next?sessionId=${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch next question');
  return res.json();
}

export async function submitAnswerApi(params: {
  sessionId: string;
  questionId: number;
  selectedAnswer: number;
  timeSpentSeconds: number;
}): Promise<AnswerSubmissionResult> {
  const res = await fetch(`${API_BASE}/quiz/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit answer');
  }
  return res.json();
}

export async function submitQuizApi(sessionId: string): Promise<{ success: boolean; report: DiagnosticReport }> {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to complete quiz');
  }
  return res.json();
}

export async function fetchReportApi(sessionId: string): Promise<DiagnosticReport> {
  const res = await fetch(`${API_BASE}/report/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch diagnostic report');
  return res.json();
}

export async function fetchHistoryApi(studentId = 'student_01'): Promise<AttemptHistoryItem[]> {
  const res = await fetch(`${API_BASE}/history/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch attempt history');
  return res.json();
}

export async function generateRemedialApi(params: {
  studentId?: string;
  referenceSessionId?: string;
}): Promise<{
  sessionId: string;
  targetedSubtopics: string[];
  totalQuestions: number;
  initialQuestion: PublicQuestion;
}> {
  const res = await fetch(`${API_BASE}/remedial/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate remedial quiz');
  }
  return res.json();
}
