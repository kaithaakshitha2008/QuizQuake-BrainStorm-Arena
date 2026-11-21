import crypto from 'crypto';
import { query, run } from '../database/db.js';
import { 
  Difficulty, 
  PublicQuestion, 
  QuizSession, 
  StudentDashboardStats 
} from '../types/index.js';
import { computeNextDifficulty, selectAdaptiveQuestion } from './adaptiveEngine.js';
import { generateDiagnosticReport } from './diagnosticEngine.js';

export interface StartQuizParams {
  studentId?: string;
  selectedTopic?: string | null;
  totalQuestions?: number;
  timeLimitMinutes?: number;
}

export function startQuiz(params: StartQuizParams): {
  session: QuizSession;
  initialQuestion: PublicQuestion;
} {
  const studentId = params.studentId || 'student_01';
  const selectedTopic = params.selectedTopic && params.selectedTopic !== 'All Topics' 
    ? params.selectedTopic 
    : null;
  const totalQuestions = params.totalQuestions || 10;
  const timeLimitMinutes = params.timeLimitMinutes || 10;

  const sessionId = `session_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeLimitMinutes * 60 * 1000);

  // Initial difficulty is Medium
  const initialDifficulty: Difficulty = 'Medium';
  const firstQuestion = selectAdaptiveQuestion(initialDifficulty, selectedTopic, []);

  if (!firstQuestion) {
    throw new Error('Unable to find questions matching criteria.');
  }

  run(
    `INSERT INTO quiz_sessions 
     (session_id, student_id, selected_topic, current_difficulty, correct_streak, incorrect_streak, total_questions, questions_answered, score, status, is_remedial, started_at, expires_at, current_question_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      studentId,
      selectedTopic,
      initialDifficulty,
      0,
      0,
      totalQuestions,
      0,
      0,
      'IN_PROGRESS',
      0,
      now.toISOString(),
      expiresAt.toISOString(),
      firstQuestion.id
    ]
  );

  const session: QuizSession = {
    session_id: sessionId,
    student_id: studentId,
    selected_topic: selectedTopic,
    current_difficulty: initialDifficulty,
    correct_streak: 0,
    incorrect_streak: 0,
    total_questions: totalQuestions,
    questions_answered: 0,
    score: 0,
    status: 'IN_PROGRESS',
    is_remedial: false,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    current_question_id: firstQuestion.id
  };

  const initialQuestion: PublicQuestion = {
    id: firstQuestion.id,
    topic: firstQuestion.topic,
    subtopic: firstQuestion.subtopic,
    difficulty: firstQuestion.difficulty,
    question: firstQuestion.question,
    options: firstQuestion.options,
    questionNumber: 1,
    totalQuestions
  };

  return { session, initialQuestion };
}

export function getCurrentQuestion(sessionId: string): PublicQuestion | null {
  const session = query<any>('SELECT * FROM quiz_sessions WHERE session_id = ?', [sessionId])[0];
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'IN_PROGRESS') {
    return null;
  }

  // Check if expired
  if (new Date() > new Date(session.expires_at)) {
    completeQuiz(sessionId, 'EXPIRED');
    return null;
  }

  if (session.questions_answered >= session.total_questions) {
    completeQuiz(sessionId, 'COMPLETED');
    return null;
  }

  // If current question exists
  if (session.current_question_id) {
    const qRow = query<any>('SELECT * FROM questions WHERE question_id = ?', [session.current_question_id])[0];
    if (qRow) {
      return {
        id: qRow.question_id,
        topic: qRow.topic_name,
        subtopic: qRow.subtopic_name,
        difficulty: qRow.difficulty,
        question: qRow.question_text,
        options: JSON.parse(qRow.options_json),
        questionNumber: session.questions_answered + 1,
        totalQuestions: session.total_questions
      };
    }
  }

  // Otherwise, choose next question adaptively
  const answeredIds = query<{ question_id: number }>(
    'SELECT question_id FROM answers WHERE session_id = ?',
    [sessionId]
  ).map(r => r.question_id);

  const nextQ = selectAdaptiveQuestion(session.current_difficulty, session.selected_topic, answeredIds);
  if (!nextQ) {
    // If no more questions available, complete session
    completeQuiz(sessionId, 'COMPLETED');
    return null;
  }

  run('UPDATE quiz_sessions SET current_question_id = ? WHERE session_id = ?', [nextQ.id, sessionId]);

  return {
    id: nextQ.id,
    topic: nextQ.topic,
    subtopic: nextQ.subtopic,
    difficulty: nextQ.difficulty,
    question: nextQ.question,
    options: nextQ.options,
    questionNumber: session.questions_answered + 1,
    totalQuestions: session.total_questions
  };
}

export function submitAnswer(
  sessionId: string,
  questionId: number,
  selectedAnswer: number,
  timeSpentSeconds: number
): {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  previousDifficulty: Difficulty;
  newDifficulty: Difficulty;
  streakReason: string;
  isCompleted: boolean;
  questionsAnswered: number;
  totalQuestions: number;
  score: number;
  nextQuestion: PublicQuestion | null;
} {
  const session = query<any>('SELECT * FROM quiz_sessions WHERE session_id = ?', [sessionId])[0];
  if (!session) {
    throw new Error('Quiz session not found.');
  }

  if (session.status !== 'IN_PROGRESS') {
    throw new Error('Quiz session is already completed or expired.');
  }

  // Fetch question details for answer verification
  const qRow = query<any>('SELECT * FROM questions WHERE question_id = ?', [questionId])[0];
  if (!qRow) {
    throw new Error('Question not found.');
  }

  const isCorrect = selectedAnswer === qRow.correct_answer;
  const currentDiff = session.current_difficulty as Difficulty;

  // Insert answer record
  run(
    `INSERT INTO answers 
     (session_id, question_id, selected_answer, is_correct, time_spent_seconds, difficulty_at_question)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sessionId, questionId, selectedAnswer, isCorrect ? 1 : 0, Math.max(1, timeSpentSeconds), currentDiff]
  );

  // Compute adaptive update
  const adaptiveResult = computeNextDifficulty(
    currentDiff,
    session.correct_streak,
    session.incorrect_streak,
    isCorrect
  );

  const newScore = isCorrect ? session.score + 1 : session.score;
  const newQuestionsAnswered = session.questions_answered + 1;
  const isCompleted = newQuestionsAnswered >= session.total_questions;

  let nextQuestion: PublicQuestion | null = null;

  if (isCompleted) {
    run(
      `UPDATE quiz_sessions 
       SET questions_answered = ?, score = ?, current_difficulty = ?, correct_streak = ?, incorrect_streak = ?,
           status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, current_question_id = NULL
       WHERE session_id = ?`,
      [
        newQuestionsAnswered,
        newScore,
        adaptiveResult.nextDifficulty,
        adaptiveResult.nextCorrectStreak,
        adaptiveResult.nextIncorrectStreak,
        sessionId
      ]
    );

    recordAttempt(sessionId, session.student_id, session.selected_topic, session.total_questions, newScore, session.is_remedial);
  } else {
    // Select next adaptive question
    const answeredIds = query<{ question_id: number }>(
      'SELECT question_id FROM answers WHERE session_id = ?',
      [sessionId]
    ).map(r => r.question_id);

    const nextQObj = selectAdaptiveQuestion(
      adaptiveResult.nextDifficulty,
      session.selected_topic,
      answeredIds
    );

    if (nextQObj) {
      run(
        `UPDATE quiz_sessions 
         SET questions_answered = ?, score = ?, current_difficulty = ?, correct_streak = ?, incorrect_streak = ?,
             current_question_id = ?
         WHERE session_id = ?`,
        [
          newQuestionsAnswered,
          newScore,
          adaptiveResult.nextDifficulty,
          adaptiveResult.nextCorrectStreak,
          adaptiveResult.nextIncorrectStreak,
          nextQObj.id,
          sessionId
        ]
      );

      nextQuestion = {
        id: nextQObj.id,
        topic: nextQObj.topic,
        subtopic: nextQObj.subtopic,
        difficulty: nextQObj.difficulty,
        question: nextQObj.question,
        options: nextQObj.options,
        questionNumber: newQuestionsAnswered + 1,
        totalQuestions: session.total_questions
      };
    } else {
      // If questions exhausted, finish quiz early
      run(
        `UPDATE quiz_sessions 
         SET questions_answered = ?, score = ?, status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, current_question_id = NULL
         WHERE session_id = ?`,
        [newQuestionsAnswered, newScore, sessionId]
      );
      recordAttempt(sessionId, session.student_id, session.selected_topic, session.total_questions, newScore, session.is_remedial);
    }
  }

  return {
    isCorrect,
    correctAnswer: qRow.correct_answer,
    explanation: qRow.explanation,
    previousDifficulty: currentDiff,
    newDifficulty: adaptiveResult.nextDifficulty,
    streakReason: adaptiveResult.reason,
    isCompleted,
    questionsAnswered: newQuestionsAnswered,
    totalQuestions: session.total_questions,
    score: newScore,
    nextQuestion
  };
}

export function completeQuiz(sessionId: string, status: 'COMPLETED' | 'EXPIRED' = 'COMPLETED') {
  const session = query<any>('SELECT * FROM quiz_sessions WHERE session_id = ?', [sessionId])[0];
  if (!session) return;

  if (session.status === 'IN_PROGRESS') {
    run(
      `UPDATE quiz_sessions 
       SET status = ?, completed_at = CURRENT_TIMESTAMP, current_question_id = NULL
       WHERE session_id = ?`,
      [status, sessionId]
    );

    recordAttempt(
      sessionId,
      session.student_id,
      session.selected_topic,
      session.total_questions,
      session.score,
      session.is_remedial
    );
  }

  return generateDiagnosticReport(sessionId);
}

function recordAttempt(
  sessionId: string,
  studentId: string,
  selectedTopic: string | null,
  totalQuestions: number,
  score: number,
  isRemedial: number
) {
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100 * 10) / 10 : 0;
  const topicName = selectedTopic || (isRemedial ? 'Remedial Quiz' : 'All Topics');

  run(
    `INSERT OR IGNORE INTO attempts 
     (session_id, student_id, topic_name, total_questions, score, accuracy, is_remedial, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [sessionId, studentId, topicName, totalQuestions, score, accuracy, isRemedial ? 1 : 0]
  );
}

export function getStudentDashboard(studentId = 'student_01'): StudentDashboardStats {
  const student = query<any>('SELECT * FROM students WHERE student_id = ?', [studentId])[0] || {
    student_id: studentId,
    name: 'Alex Mercer',
    email: 'alex.mercer@university.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    created_at: new Date().toISOString()
  };

  const attempts = query<any>(
    `SELECT session_id, completed_at, topic_name as topic, total_questions, score, accuracy, is_remedial
     FROM attempts 
     WHERE student_id = ?
     ORDER BY completed_at DESC`,
    [studentId]
  );

  const totalQuizzes = attempts.length;
  const averageAccuracy = totalQuizzes > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalQuizzes)
    : 0;

  // Calculate topic performance across all attempts
  const topicStats = query<{ topic_name: string; avg_accuracy: number }>(
    `SELECT q.topic_name, (SUM(a.is_correct) * 100.0 / COUNT(a.answer_id)) as avg_accuracy
     FROM answers a
     JOIN questions q ON a.question_id = q.question_id
     JOIN quiz_sessions s ON a.session_id = s.session_id
     WHERE s.student_id = ?
     GROUP BY q.topic_name
     ORDER BY avg_accuracy DESC`,
    [studentId]
  );

  const strongestTopic = topicStats.length > 0 ? topicStats[0].topic_name : 'Computer Networks';
  const weakestTopic = topicStats.length > 0 ? topicStats[topicStats.length - 1].topic_name : 'Operating Systems';

  return {
    student: {
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      created_at: student.created_at
    },
    totalQuizzes,
    averageAccuracy,
    currentStreakDays: 4, // 4-day learning streak
    strongestTopic,
    weakestTopic,
    recentAttempts: attempts.slice(0, 5)
  };
}

export function getStudentHistory(studentId = 'student_01') {
  const attempts = query<any>(
    `SELECT attempt_id, session_id, topic_name, total_questions, score, accuracy, is_remedial, completed_at
     FROM attempts
     WHERE student_id = ?
     ORDER BY completed_at ASC`,
    [studentId]
  );

  return attempts.map(a => ({
    attemptId: a.attempt_id,
    sessionId: a.session_id,
    topicName: a.topic_name,
    totalQuestions: a.total_questions,
    score: a.score,
    accuracy: a.accuracy,
    isRemedial: Boolean(a.is_remedial),
    completedAt: a.completed_at
  }));
}

export function getAvailableTopics() {
  const rows = query<{ topic_name: string; subtopic_name: string }>(
    'SELECT DISTINCT topic_name, subtopic_name FROM topics ORDER BY topic_name, subtopic_name'
  );

  const grouped: Record<string, string[]> = {};
  for (const r of rows) {
    if (!grouped[r.topic_name]) {
      grouped[r.topic_name] = [];
    }
    grouped[r.topic_name].push(r.subtopic_name);
  }

  return Object.entries(grouped).map(([topic, subtopics]) => ({
    name: topic,
    subtopics
  }));
}
