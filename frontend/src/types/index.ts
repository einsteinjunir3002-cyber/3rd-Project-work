// TypeScript Central Types

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin' | 'superadmin' | 'researcher' | 'entrepreneur' | 'alumni' | 'industry_partner' | 'career_advisor';
  studentIdNumber?: string;
  department?: string;
  projectedGpa?: number;
  stressLevel?: number;
  title?: string;
  office?: string;
  startupName?: string;
  businessIdea?: string;
  researchArea?: string;
  institution?: string;
  graduationYear?: string;
  companyName?: string;
  industrySector?: string;
  advisorExpertise?: string;
}

export interface Course {
  id: string; // custom string code, e.g. 'CS101'
  code: string;
  title: string;
  instructor: string;
  instructorId?: string;
  avatar: string;
  notesCount: number;
  assignmentsCount: number;
  description?: string;
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  date: string;
  size: string;
  fileUrl: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  deadline: string;
  totalPoints: number;
  status: 'Pending' | 'Submitted';
  grade?: string;
  feedback?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentName: string;
  fileName: string;
  fileUrl?: string;
  date: string;
  grade?: string;
  feedback?: string;
  plagiarismScore?: number;
}

export interface QuizQuestion {
  id?: string;
  questionText: string;
  questionType: 'MCQ' | 'True/False' | 'Essay' | 'Coding';
  options?: string[];
  correctAnswer?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  timeLimit: number; // in minutes
  totalPoints: number;
  questionsCount?: number;
  questions?: QuizQuestion[];
  taken?: boolean;
  score?: number;
  graded?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  studentName: string;
  score: number;
  graded: boolean;
  completedAt: string;
  answers: Array<{
    questionId: string;
    studentAnswer: string;
    score?: number;
  }>;
}

export interface ForumReply {
  author: string;
  avatar: string;
  role: string;
  body: string;
}

export interface ForumThread {
  id: string;
  category: string;
  author: string;
  avatar: string;
  title: string;
  body: string;
  upvotes: number;
  replies: ForumReply[];
}

export interface NotificationItem {
  id: string;
  text: string;
  date: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  groupId?: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
  read: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  topic: string;
  scheduledTime: string;
  duration: number;
  meetingLink: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  studentName: string;
  lecturerName: string;
  office?: string;
}
