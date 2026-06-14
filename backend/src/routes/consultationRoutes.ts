import { Router } from 'express';
import { bookConsultation, getConsultations, updateStatus } from '../controllers/consultationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getConsultations);
router.post('/book', authenticateToken, bookConsultation);
router.post('/status', authenticateToken, updateStatus);

export default router;
