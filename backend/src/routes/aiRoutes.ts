import { Router } from 'express';
import { summarizeNote, askAi, searchResearchPapers } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/summarize', authenticateToken, summarizeNote);
router.post('/chat', authenticateToken, askAi);
router.get('/research/search', authenticateToken, searchResearchPapers);

export default router;
