import { Request, Response } from 'express';
import { z } from 'zod';
import { 
  startQuiz, 
  submitAnswer, 
  completeQuiz, 
  getStudentDashboard, 
  getStudentHistory 
} from '../services/quizService.js';

const startQuizSchema = z.object({
  studentId: z.string().optional(),
  selectedTopic: z.string().nullable().optional(),
  totalQuestions: z.number().int().min(1).max(20).optional(),
  timeLimitMinutes: z.number().int().min(1).max(30).optional(),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.number().int(),
  selectedAnswer: z.number().int().min(0).max(3),
  timeSpentSeconds: z.number().int().min(0).max(600),
});

const submitQuizSchema = z.object({
  sessionId: z.string().min(1),
});

export async function handleStartQuiz(req: Request, res: Response) {
  try {
    const parse = startQuizSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid parameters', details: parse.error.format() });
    }

    const result = startQuiz(parse.data);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('Error in handleStartQuiz:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function handleSubmitAnswer(req: Request, res: Response) {
  try {
    const parse = submitAnswerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid submission data', details: parse.error.format() });
    }

    const { sessionId, questionId, selectedAnswer, timeSpentSeconds } = parse.data;
    const result = submitAnswer(sessionId, questionId, selectedAnswer, timeSpentSeconds);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error in handleSubmitAnswer:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit answer' });
  }
}

export async function handleSubmitQuiz(req: Request, res: Response) {
  try {
    const parse = submitQuizSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const report = completeQuiz(parse.data.sessionId, 'COMPLETED');
    return res.status(200).json({ success: true, report });
  } catch (err: any) {
    console.error('Error in handleSubmitQuiz:', err);
    return res.status(500).json({ error: err.message || 'Failed to complete quiz' });
  }
}

export async function handleGetDashboard(req: Request, res: Response) {
  try {
    const studentId = (req.query.studentId as string) || 'student_01';
    const stats = getStudentDashboard(studentId);
    return res.status(200).json(stats);
  } catch (err: any) {
    console.error('Error in handleGetDashboard:', err);
    return res.status(500).json({ error: err.message || 'Failed to retrieve dashboard' });
  }
}

export async function handleGetHistory(req: Request, res: Response) {
  try {
    const studentId = req.params.studentId || (req.query.studentId as string) || 'student_01';
    const history = getStudentHistory(studentId);
    return res.status(200).json(history);
  } catch (err: any) {
    console.error('Error in handleGetHistory:', err);
    return res.status(500).json({ error: err.message || 'Failed to retrieve history' });
  }
}
