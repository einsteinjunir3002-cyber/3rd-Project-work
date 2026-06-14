import { Router } from 'express';
import { 
  createQuiz, 
  getQuizzes, 
  getQuizDetails, 
  submitQuiz, 
  getQuizAttempts, 
  gradeQuizAttempt 
} from '../controllers/quizController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Student and staff routes for listing and loading quiz metadata
router.get('/', authenticateToken, getQuizzes);
router.get('/:quizId', authenticateToken, getQuizDetails);

// Quiz submission for students
router.post('/submit', authenticateToken, requireRole(['student']), submitQuiz);

// Quiz creation and grading for Lecturers & Admins
router.post('/create', authenticateToken, requireRole(['lecturer', 'admin']), createQuiz);
router.get('/attempts/all', authenticateToken, requireRole(['lecturer', 'admin']), getQuizAttempts);
router.post('/grade', authenticateToken, requireRole(['lecturer', 'admin']), gradeQuizAttempt);

export default router;
