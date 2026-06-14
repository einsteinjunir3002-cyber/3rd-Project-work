import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Routes Import
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import forumRoutes from './routes/forumRoutes';
import aiRoutes from './routes/aiRoutes';
import quizRoutes from './routes/quizRoutes';
import chatRoutes from './routes/chatRoutes';
import consultationRoutes from './routes/consultationRoutes';
import adminRoutes from './routes/adminRoutes';
import universityRoutes from './routes/universityRoutes';


const app = express();

// Ensure the local file uploads storage folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Local directory "/uploads" provisioned successfully.');
}

// 1. Security Headers Configuration (Helmet)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Policy Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like local html files) or null origin
    if (!origin || origin === 'null' || origin.startsWith('file://')) {
      callback(null, true);
    } else {
      callback(null, origin);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());

// 4. Rate Limiting Protection (Shielding servers from automated credential stuffing/DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP connection. Please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Minutes
  max: 20, // Limit 20 attempts
  message: { message: 'Excessive credentials attempts. Please try again in 10 minutes.' }
});

// Serve local static assets (Vector SVGs, avatars, notes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 5. REST Route Registrations
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', apiLimiter, courseRoutes);
app.use('/api/assignments', apiLimiter, assignmentRoutes);
app.use('/api/forums', apiLimiter, forumRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/quizzes', apiLimiter, quizRoutes);
app.use('/api/chats', apiLimiter, chatRoutes);
app.use('/api/consultations', apiLimiter, consultationRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/universities', apiLimiter, universityRoutes);

// Base health indicator
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Default 404 router fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Requested resource not found.' });
});

export default app;
