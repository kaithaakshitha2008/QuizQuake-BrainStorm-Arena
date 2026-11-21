import { Router } from 'express';
import { 
  handleStartQuiz, 
  handleSubmitAnswer, 
  handleSubmitQuiz, 
  handleGetDashboard, 
  handleGetHistory 
} from '../controllers/quizController.js';

const router = Router();

router.post('/start', handleStartQuiz);
router.post('/answer', handleSubmitAnswer);
router.post('/submit', handleSubmitQuiz);
router.get('/dashboard', handleGetDashboard);
router.get('/history/:studentId?', handleGetHistory);

export default router;
