import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadResource, getResources, downloadResource } from '../controllers/resourceController';
import { authenticateToken, requireDepartment } from '../middleware/auth';

const router = Router();

// Multer secure file upload settings for extended file types
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to support videos/zips
  fileFilter: (req, file, cb) => {
    // Regex allows pdf, docx, pptx, mp4, mp3, png, jpg, jpeg, zip
    const allowed = /pdf|docx?|pptx?|mp4|mp3|png|jpe?g|zip/i;
    const ext = allowed.test(path.extname(file.originalname));
    if (ext) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type! Supported formats: PDF, DOCX, PPTX, MP4, MP3, Images, ZIP.'));
  }
});

// Use DBAC directly on the get route to enforce users can only view their department's resources
router.get('/', authenticateToken, requireDepartment, getResources);

router.post(
  '/upload',
  authenticateToken,
  upload.single('resource'),
  uploadResource
);

router.get('/:id/download', authenticateToken, downloadResource);

export default router;
