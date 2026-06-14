import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { 
  User,
  Course, 
  Note, 
  Assignment, 
  Submission, 
  ForumThread, 
  NotificationItem, 
  Quiz, 
  QuizAttempt, 
  ChatMessage, 
  Consultation 
} from '../types';

interface AppStateContextType {
  courses: Course[];
  students: User[];
  notes: Note[];
  assignments: Assignment[];
  submissions: Submission[];
  forumThreads: ForumThread[];
  notifications: NotificationItem[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  chatMessages: ChatMessage[];
  consultations: Consultation[];
  stressLevel: number;
  projectedGpa: number;
  currentStudentTab: string;
  currentLecturerTab: string;
  currentAdminTab: string;
  activeChatRecipientId: string | null;
  typingStatus: { [key: string]: boolean };
  setTab: (role: 'student' | 'lecturer' | 'admin', tabId: string) => void;
  // Notes & Assignments
  uploadNote: (title: string, courseId: string, file?: File) => Promise<void>;
  createAssignment: (data: any) => Promise<void>;
  submitAssignment: (asgId: string, file: File) => Promise<number>;
  gradeSubmission: (subId: string, grade: number, feedback: string) => Promise<void>;
  // Forums
  createForumThread: (category: string, title: string, body: string) => Promise<void>;
  submitForumReply: (threadId: string, body: string) => Promise<void>;
  upvoteThread: (threadId: string) => Promise<void>;
  // Quizzes
  fetchQuizzes: (courseId?: string) => Promise<void>;
  fetchQuizDetails: (quizId: string) => Promise<Quiz>;
  createQuiz: (data: any) => Promise<void>;
  submitQuizAttempt: (quizId: string, answers: any[]) => Promise<any>;
  fetchQuizAttempts: () => Promise<void>;
  gradeQuizAttempt: (attemptId: string, questionGrades: any, feedback: string) => Promise<void>;
  // Chat Messenger
  fetchChatMessages: (recipientId?: string, groupId?: string) => Promise<void>;
  sendChatMessage: (message: string, recipientId?: string, groupId?: string, file?: File) => Promise<void>;
  setActiveRecipient: (id: string | null) => void;
  sendTypingStatus: (recipientId: string | null, typing: boolean) => void;
  // Consultations
  fetchConsultations: () => Promise<void>;
  bookConsultation: (data: any) => Promise<void>;
  updateConsultationStatus: (consultationId: string, status: string) => Promise<void>;
  // System states
  updateStressLevel: (level: number) => void;
  updateGpaPredictions: (coursesGpas: { [key: string]: number }) => void;
  addSystemNotification: (text: string) => void;
  clearNotifications: () => void;
  refreshAllData: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket, emitEvent } = useSocket();

  // Navigation tabs
  const [currentStudentTab, setCurrentStudentTab] = useState('student-dashboard');
  const [currentLecturerTab, setCurrentLecturerTab] = useState('lecturer-dashboard');
  const [currentAdminTab, setCurrentAdminTab] = useState('admin-users');

  // Academic States
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  // Real-time Chat States
  const [activeChatRecipientId, setActiveChatRecipientId] = useState<string | null>(null);
  const [typingStatus, setTypingStatus] = useState<{ [key: string]: boolean }>({});

  const [stressLevel, setStressLevel] = useState(user?.stressLevel || 50);
  const [projectedGpa, setProjectedGpa] = useState(user?.projectedGpa || 4.0);

  // Global Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };
  
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const refreshAllData = async () => {
    if (!user) return;
    try {
      const coursesRes = await axios.get('/api/courses');
      setCourses(coursesRes.data);

      const notesRes = await axios.get('/api/courses/notes');
      setNotes(notesRes.data);

      const asgRes = await axios.get('/api/assignments');
      setAssignments(asgRes.data);

      const forumRes = await axios.get('/api/forums');
      setForumThreads(forumRes.data);

      fetchQuizzes();
      fetchConsultations();

      if (user.role === 'lecturer' || user.role === 'admin') {
        const subRes = await axios.get('/api/assignments/submissions');
        setSubmissions(subRes.data);
        fetchQuizAttempts();
        try {
          const studentsRes = await axios.get('/api/courses/students');
          setStudents(studentsRes.data);
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      }
    } catch (err) {
      console.warn('Error fetching academic data. Server offline?', err);
    }
  };

  // Fetch initial REST data
  useEffect(() => {
    refreshAllData();
  }, [user]);

  // Hook up WebSocket live notification and chat broadcasts
  useEffect(() => {
    if (!socket) return;

    // Listen to new forum thread notifications
    socket.on('forum_thread_broadcast', (thread: ForumThread) => {
      setForumThreads(prev => [thread, ...prev]);
      addSystemNotification(`New forum post in "${thread.category}": ${thread.title}`);
    });

    // Listen to forum replies updates
    socket.on('forum_reply_broadcast', (data: { threadId: string; reply: any }) => {
      setForumThreads(prev => prev.map(t => {
        if (t.id === data.threadId) {
          return { ...t, replies: [...t.replies, data.reply] };
        }
        return t;
      }));
    });

    // Listen to student grade evaluations alerts
    socket.on('grade_alert', (notif: { text: string; date: string }) => {
      const newNotif: NotificationItem = {
        id: Date.now().toString(),
        text: notif.text,
        date: notif.date,
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
      
      // Refresh assignments to load grades
      axios.get('/api/assignments').then(res => setAssignments(res.data)).catch(() => {});
    });

    // Listen to announcements broadcasts
    socket.on('announcement_broadcast', (ann: { text: string; date: string }) => {
      const newNotif: NotificationItem = {
        id: Date.now().toString(),
        text: ann.text,
        date: ann.date,
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    });

    // Real-time direct chat message receiver
    socket.on('chat_message_received', (msg: ChatMessage) => {
      // If message is from our currently selected chat, append to messages
      if (
        (activeChatRecipientId && msg.senderId === activeChatRecipientId) ||
        msg.groupId // If group message
      ) {
        setChatMessages(prev => [...prev, msg]);
        
        // Acknowledge read receipt
        emitEvent('read_receipt', { senderId: msg.senderId, recipientId: user?.id });
      } else {
        // Send a system notification alert
        addSystemNotification(`New message from ${msg.senderName}: "${msg.message.substring(0, 20)}..."`);
      }
    });

    // Real-time chat typing status status
    socket.on('typing_status', (data: { senderId: string; typing: boolean }) => {
      setTypingStatus(prev => ({
        ...prev,
        [data.senderId]: data.typing
      }));
    });

    // Real-time read receipt updates
    socket.on('read_receipt_received', (data: { recipientId: string }) => {
      setChatMessages(prev => prev.map(m => {
        if (m.recipientId === data.recipientId && !m.read) {
          return { ...m, read: true };
        }
        return m;
      }));
    });

    return () => {
      socket.off('forum_thread_broadcast');
      socket.off('forum_reply_broadcast');
      socket.off('grade_alert');
      socket.off('announcement_broadcast');
      socket.off('chat_message_received');
      socket.off('typing_status');
      socket.off('read_receipt_received');
    };
  }, [socket, activeChatRecipientId, user]);

  const setTab = (role: 'student' | 'lecturer' | 'admin', tabId: string) => {
    if (role === 'student') setCurrentStudentTab(tabId);
    else if (role === 'lecturer') setCurrentLecturerTab(tabId);
    else setCurrentAdminTab(tabId);
  };

  const uploadNote = async (title: string, courseId: string, file?: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('courseId', courseId);
    if (file) formData.append('note', file);

    const response = await axios.post('/api/courses/upload-note', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const newNote: Note = response.data.note;
    setNotes(prev => [newNote, ...prev]);
    
    // Update courses list note count
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) return { ...c, notesCount: c.notesCount + 1 };
      return c;
    }));

    // Broadcast announcement via Sockets
    emitEvent('lecturer_announcement', { 
      title: `New notes: "${newNote.title}" uploaded!`, 
      courseCode: courseId 
    });
  };

  const createAssignment = async (data: any) => {
    const response = await axios.post('/api/assignments/create', data);
    const newAsg: Assignment = response.data.assignment;
    setAssignments(prev => [newAsg, ...prev]);
    
    setCourses(prev => prev.map(c => {
      if (c.id === data.courseId) return { ...c, assignmentsCount: c.assignmentsCount + 1 };
      return c;
    }));

    // Emit socket notification
    emitEvent('lecturer_announcement', { 
      title: `New homework deadline published: "${newAsg.title}"!`, 
      courseCode: data.courseId 
    });
  };

  const submitAssignment = async (asgId: string, file: File) => {
    const formData = new FormData();
    formData.append('assignmentId', asgId);
    formData.append('homework', file);

    const response = await axios.post('/api/assignments/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const plagiarism = response.data.plagiarismScore || 0;

    setAssignments(prev => prev.map(a => {
      if (a.id === asgId) return { ...a, status: 'Submitted' as const };
      return a;
    }));

    refreshAllData();
    return plagiarism;
  };

  const gradeSubmission = async (subId: string, grade: number, feedback: string) => {
    await axios.post('/api/assignments/grade', { submissionId: subId, grade, feedback });
    
    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) return { ...s, grade: grade.toString(), feedback };
      return s;
    }));

    const sub = submissions.find(s => s.id === subId);
    if (sub) {
      emitEvent('grade_graded', {
        studentId: sub.studentName, // In our controller mapping, we populate student info
        assignmentTitle: sub.fileName,
        grade
      });
    }

    refreshAllData();
  };

  const createForumThread = async (category: string, title: string, body: string) => {
    const response = await axios.post('/api/forums/thread', { category, title, body });
    const newThread: ForumThread = response.data.thread;
    setForumThreads(prev => [newThread, ...prev]);
    
    // Broadcast new thread via socket
    emitEvent('forum_new_thread', newThread);
  };

  const submitForumReply = async (threadId: string, body: string) => {
    const response = await axios.post('/api/forums/reply', { threadId, body });
    const newReply = response.data.reply;
    
    setForumThreads(prev => prev.map(t => {
      if (t.id === threadId) return { ...t, replies: [...t.replies, newReply] };
      return t;
    }));

    // Broadcast reply via websocket
    emitEvent('forum_new_reply', { threadId, reply: newReply });
  };

  const upvoteThread = async (threadId: string) => {
    await axios.put(`/api/forums/upvote/${threadId}`);
    setForumThreads(prev => prev.map(t => {
      if (t.id === threadId) return { ...t, upvotes: t.upvotes + 1 };
      return t;
    }));
  };

  // Quiz Methods
  const fetchQuizzes = async (courseId?: string) => {
    try {
      const url = courseId ? `/api/quizzes?courseId=${courseId}` : '/api/quizzes';
      const response = await axios.get(url);
      setQuizzes(response.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchQuizDetails = async (quizId: string): Promise<Quiz> => {
    const response = await axios.get(`/api/quizzes/${quizId}`);
    return response.data;
  };

  const createQuiz = async (data: any) => {
    await axios.post('/api/quizzes/create', data);
    fetchQuizzes();
  };

  const submitQuizAttempt = async (quizId: string, answers: any[]) => {
    const response = await axios.post('/api/quizzes/submit', { quizId, answers });
    fetchQuizzes();
    return response.data;
  };

  const fetchQuizAttempts = async () => {
    try {
      const response = await axios.get('/api/quizzes/attempts/all');
      setQuizAttempts(response.data);
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
    }
  };

  const gradeQuizAttempt = async (attemptId: string, questionGrades: any, feedback: string) => {
    await axios.post('/api/quizzes/grade', { attemptId, questionGrades, feedback });
    fetchQuizAttempts();
  };

  // Chat Messenger Methods
  const fetchChatMessages = async (recipientId?: string, groupId?: string) => {
    try {
      let url = '/api/chats';
      if (groupId) url += `?groupId=${groupId}`;
      else if (recipientId) url += `?recipientId=${recipientId}`;
      else return;

      const response = await axios.get(url);
      setChatMessages(response.data);

      if (recipientId) {
        // Mark all messages from sender as read
        await axios.post('/api/chats/read', { senderId: recipientId });
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  const sendChatMessage = async (message: string, recipientId?: string, groupId?: string, file?: File) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (recipientId) formData.append('recipientId', recipientId);
      if (groupId) formData.append('groupId', groupId);
      if (file) formData.append('attachment', file);

      const response = await axios.post('/api/chats/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newMsg: ChatMessage = response.data.chatMessage;
      setChatMessages(prev => [...prev, newMsg]);

      // Emit WebSocket event so recipient gets it instantly
      emitEvent('chat_message', newMsg);
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const setActiveRecipient = (id: string | null) => {
    setActiveChatRecipientId(id);
    if (id) {
      fetchChatMessages(id);
    } else {
      setChatMessages([]);
    }
  };

  const sendTypingStatus = (recipientId: string | null, typing: boolean) => {
    if (!user) return;
    emitEvent('typing', {
      senderId: user.id.toString(),
      recipientId: recipientId || undefined,
      typing
    });
  };

  // Consultations Methods
  const fetchConsultations = async () => {
    try {
      const response = await axios.get('/api/consultations');
      setConsultations(response.data);
    } catch (err) {
      console.error('Error loading consultations:', err);
    }
  };

  const bookConsultation = async (data: any) => {
    await axios.post('/api/consultations/book', data);
    fetchConsultations();
  };

  const updateConsultationStatus = async (consultationId: string, status: string) => {
    await axios.post('/api/consultations/status', { consultationId, status });
    fetchConsultations();
  };

  // Settings & Status Methods
  const updateStressLevel = async (level: number) => {
    setStressLevel(level);
    try {
      // Save stress level to database User details
      await axios.post('/api/auth/signup', { stressLevel: level }); // Reuse signup / update profile endpoint if mapped
    } catch {}
  };

  const updateGpaPredictions = (coursesGpas: { [key: string]: number }) => {
    const vals = Object.values(coursesGpas);
    if (!vals.length) return;
    const avg = vals.reduce((acc, curr) => acc + curr, 0) / vals.length;
    setProjectedGpa(parseFloat(avg.toFixed(2)));
  };

  const addSystemNotification = (text: string) => {
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      text,
      date: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <AppStateContext.Provider value={{
      courses, students, notes, assignments, submissions, forumThreads, notifications, quizzes, quizAttempts,
      chatMessages, consultations, stressLevel, projectedGpa, currentStudentTab, currentLecturerTab,
      currentAdminTab, activeChatRecipientId, typingStatus, setTab, uploadNote, createAssignment,
      submitAssignment, gradeSubmission, createForumThread, submitForumReply, upvoteThread, fetchQuizzes,
      fetchQuizDetails, createQuiz, submitQuizAttempt, fetchQuizAttempts, gradeQuizAttempt, fetchChatMessages,
      sendChatMessage, setActiveRecipient, sendTypingStatus, fetchConsultations, bookConsultation,
      updateConsultationStatus, updateStressLevel, updateGpaPredictions, addSystemNotification,
      clearNotifications, refreshAllData, toast, showToast
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside an AppStateProvider');
  return context;
};
