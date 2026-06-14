import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getMessages, sendMessage, markRead } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

router.get('/', authenticateToken, getMessages);
router.post('/send', authenticateToken, upload.single('attachment'), sendMessage);
router.post('/read', authenticateToken, markRead);

export default router;
