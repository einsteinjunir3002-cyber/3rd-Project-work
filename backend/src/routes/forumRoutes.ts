import { Router } from 'express';
import { getThreads, createThread, createReply, upvoteThread } from '../controllers/forumController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getThreads);
router.post('/thread', authenticateToken, createThread);
router.post('/reply', authenticateToken, createReply);
router.put('/upvote/:threadId', authenticateToken, upvoteThread);

export default router;
