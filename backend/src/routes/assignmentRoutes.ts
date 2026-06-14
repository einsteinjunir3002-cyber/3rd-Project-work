import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAssignments, createAssignment, submitAssignment, getSubmissions, gradeSubmission } from '../controllers/assignmentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|docx|zip/i;
    const ext = allowed.test(path.extname(file.originalname));
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Invalid submission format! Supported: PDF, DOCX, ZIP.'));
  }
});

router.get('/', authenticateToken, getAssignments);

// Creating assignments is restricted to Lecturers and Admins
router.post('/create', authenticateToken, requireRole(['lecturer', 'admin']), createAssignment);

// Students submit homework uploads
router.post('/submit', authenticateToken, requireRole(['student']), upload.single('homework'), submitAssignment);

// Fetching lists of submissions & grading is restricted to Lecturers and Admins
router.get('/submissions', authenticateToken, requireRole(['lecturer', 'admin']), getSubmissions);
router.post('/grade', authenticateToken, requireRole(['lecturer', 'admin']), gradeSubmission);

export default router;
