import { Router } from 'express';
import { handleGetReport, handleGenerateRemedial } from '../controllers/reportController.js';

const router = Router();

router.get('/:sessionId', handleGetReport);
router.post('/remedial/generate', handleGenerateRemedial);

export default router;
