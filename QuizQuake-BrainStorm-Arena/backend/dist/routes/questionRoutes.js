import { Router } from 'express';
import { handleGetNextQuestion, handleGetTopics } from '../controllers/questionController.js';
const router = Router();
router.get('/next', handleGetNextQuestion);
router.get('/topics', handleGetTopics);
export default router;
