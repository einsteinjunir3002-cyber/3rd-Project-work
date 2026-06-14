import { Router } from 'express';
import {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity
} from '../controllers/universityController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public routes for accessing universities data
router.get('/', getUniversities);
router.get('/:id', getUniversityById);

// Admin-only protected routes for managing universities data
router.post('/', authenticateToken, requireRole(['admin']), createUniversity);
router.put('/:id', authenticateToken, requireRole(['admin']), updateUniversity);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUniversity);

export default router;
