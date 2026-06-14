import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getCourses, getNotes, uploadNote, getStudents } from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Multer secure file upload settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|docx|ppt|pptx/i;
    const ext = allowed.test(path.extname(file.originalname));
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type! Supported formats: PDF, DOCX, PPT.'));
  }
});

router.get('/', authenticateToken, getCourses);
router.get('/notes', authenticateToken, getNotes);
router.get('/students', authenticateToken, requireRole(['lecturer', 'admin']), getStudents);

// Only lecturers can upload note assets
router.post(
  '/upload-note',
  authenticateToken,
  requireRole(['lecturer', 'admin']),
  upload.single('note'),
  uploadNote
);

export default router;
