import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();


// Wrap express server in http connection to support WebSockets
const server = http.createServer(app);

// 1. Initialise Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all client streams
    methods: ['GET', 'POST']
  }
});

// Store connected users map for target room routing
const connectedSockets = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Channel rooms enrollment
  socket.on('join', (data: { userId: string; role: string }) => {
    if (data.userId) {
      socket.join(data.userId);
      connectedSockets.set(socket.id, data.userId);
      console.log(`👤 User ${data.userId} (${data.role}) enrolled in private room.`);
      
      if (data.role === 'student') {
        socket.join('students');
      } else if (data.role === 'lecturer') {
        socket.join('lecturers');
      }
    }
  });

  // Real-time forum thread additions
  socket.on('forum_new_thread', (thread) => {
    socket.broadcast.emit('forum_thread_broadcast', thread);
    console.log(`📣 Forum Thread broadcasted: "${thread.title}"`);
  });

  // Real-time forum reply synchronizer
  socket.on('forum_new_reply', (data: { threadId: number; reply: any }) => {
    io.emit('forum_reply_broadcast', data);
    console.log(`💬 Reply synced to thread: ${data.threadId}`);
  });

  // Real-time grading releases
  socket.on('grade_graded', (data: { studentId: string; assignmentTitle: string; grade: number }) => {
    io.to(data.studentId).emit('grade_alert', {
      text: `Lecturer graded assignment: "${data.assignmentTitle}" (Grade: ${data.grade}/100)`,
      date: 'Just now'
    });
    console.log(`🎯 Grading alert dispatched directly to student: ${data.studentId}`);
  });

  // Real-time Announcements
  socket.on('lecturer_announcement', (data: { title: string; courseCode: string }) => {
    io.to('students').emit('announcement_broadcast', {
      text: `📢 ${data.courseCode}: "${data.title}" posted by lecturer!`,
      date: 'Just now'
    });
    console.log(`📢 Announcement broadcasted to all students.`);
  });

  // Real-time Chat Messages Routing
  socket.on('chat_message', (data: { id: string; senderId: string; senderName: string; recipientId?: string; groupId?: string; message: string; fileUrl?: string; fileName?: string; createdAt: string }) => {
    if (data.recipientId) {
      // Send directly to recipient room
      socket.to(data.recipientId).emit('chat_message_received', data);
    } else if (data.groupId) {
      // Broadcast to all in the group channel
      socket.broadcast.emit('chat_message_received', data);
    }
    console.log(`💬 Chat message routed: from ${data.senderId} to ${data.recipientId || data.groupId}`);
  });

  // Real-time Chat typing indicator
  socket.on('typing', (data: { senderId: string; recipientId?: string; groupId?: string; typing: boolean }) => {
    if (data.recipientId) {
      socket.to(data.recipientId).emit('typing_status', data);
    } else if (data.groupId) {
      socket.broadcast.emit('typing_status', data);
    }
  });

  // Real-time Chat read receipts
  socket.on('read_receipt', (data: { senderId: string; recipientId: string }) => {
    socket.to(data.senderId).emit('read_receipt_received', data);
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    connectedSockets.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Launch server instance
server.listen(PORT, () => {
  console.log(`==========================================================================`);
  console.log(`🚀 SMARTLEARN AI FULL-STACK BACKEND ACTIVE`);
  console.log(`📡 REST API Endpoints active at: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO Engine streaming at: ws://localhost:${PORT}`);
  console.log(`🛡️  Security shielding active (CORS, Helmet, Rate Limiters)`);
  console.log(`==========================================================================`);
});
