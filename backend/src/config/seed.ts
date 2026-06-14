import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Course from '../models/Course';
import Note from '../models/Note';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import { ForumThread, ForumReply } from '../models/Forum';
import Notification from '../models/Notification';
import University from '../models/University';
import { ghanaUniversities } from './universitySeedData';

dotenv.config();

const seed = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlearn';
  console.log(`🌱 Starting database seeding on: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // 1. Clean existing records
    await User.deleteMany({});
    await Course.deleteMany({});
    await Note.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await ForumThread.deleteMany({});
    await ForumReply.deleteMany({});
    await Notification.deleteMany({});
    await University.deleteMany({});
    console.log('🧹 Existing collections cleaned.');

    // 2. Create Default User Accounts
    const defaultPassword = 'password';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const adminPasswordHash = await bcrypt.hash(defaultPassword, 10);

    const studentUser = new User({
      name: 'Kofi Mensah',
      email: 'stu@smartlearn.edu',
      passwordHash,
      role: 'student',
      studentIdNumber: 'SL-10984920',
      department: 'Computer Science',
      yearOfStudy: 2,
      projectedGpa: 3.82,
      stressLevel: 25
    });

    const lecturerUser = new User({
      name: 'Mr. Emmanuel Osei',
      email: 'lec@smartlearn.edu',
      passwordHash,
      role: 'lecturer',
      title: 'Mr.',
      department: 'Computer Science',
      office: 'Block C, Office 4'
    });

    const adminUser = new User({
      name: 'SmartLearn Administrator',
      email: 'sam@smartlearning.com',
      passwordHash: adminPasswordHash,
      role: 'admin'
    });

    await studentUser.save();
    await lecturerUser.save();
    await adminUser.save();
    console.log('👤 Seeded users: Student, Lecturer, Admin.');

    // 3. Create Default Courses
    const coursesData = [
      {
        _id: 'CS101',
        code: 'CS101',
        title: 'Introduction to Computer Science & Coding',
        description: 'Foundations of algorithms, control structures, and Object-Oriented programming in Python.',
        lecturer: lecturerUser._id,
        students: [studentUser._id]
      },
      {
        _id: 'MATH102',
        code: 'MATH102',
        title: 'Calculus & Applied Mathematics',
        description: 'Differential calculus, integrals, matrix algebra, and linear equations modeling.',
        lecturer: lecturerUser._id,
        students: [studentUser._id]
      },
      {
        _id: 'ENG201',
        code: 'ENG201',
        title: 'Software Engineering & Architectures',
        description: 'System design, UML modeling, testing strategies, Agile scrum frameworks, and deployment.',
        lecturer: lecturerUser._id,
        students: [studentUser._id]
      },
      {
        _id: 'BUA202',
        code: 'BUA202',
        title: 'Business Administration & Management',
        description: 'Entrepreneurship theory, funding pipelines, local start-up cases, and leadership tactics in Accra.',
        lecturer: lecturerUser._id,
        students: [studentUser._id]
      }
    ];

    for (const c of coursesData) {
      await new Course(c).save();
    }
    console.log('📚 Seeded 4 Course modules.');

    // 4. Create Sample Note Slides
    const noteData = [
      {
        courseId: 'CS101',
        title: 'Lec 1: Fundamentals of Python & Control Structures.pdf',
        fileUrl: '/uploads/default_lecture.pdf',
        fileSize: '2.4 MB',
        uploadedBy: lecturerUser._id
      },
      {
        courseId: 'CS101',
        title: 'Lec 2: Object Oriented Programming in Python.pdf',
        fileUrl: '/uploads/default_lecture.pdf',
        fileSize: '3.1 MB',
        uploadedBy: lecturerUser._id
      },
      {
        courseId: 'MATH102',
        title: 'Lec 1: Derivatives and Rate of Changes.pdf',
        fileUrl: '/uploads/default_lecture.pdf',
        fileSize: '1.8 MB',
        uploadedBy: lecturerUser._id
      },
      {
        courseId: 'ENG201',
        title: 'Lec 1: Intro to Agile Methodologies & Scrum.pdf',
        fileUrl: '/uploads/default_lecture.pdf',
        fileSize: '4.2 MB',
        uploadedBy: lecturerUser._id
      }
    ];

    for (const n of noteData) {
      await new Note(n).save();
    }
    console.log('📂 Seeded 4 lecture slides.');

    // 5. Create Assignments & Submissions
    const asg1 = new Assignment({
      courseId: 'CS101',
      title: 'Assignment 1: Logic Gates & Basic Control Flows',
      deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days in future
      totalPoints: 100,
      description: 'Design logic gates and write recursive Python programs to calculate factorials.'
    });

    const asg2 = new Assignment({
      courseId: 'ENG201',
      title: 'Assignment 2: Drawing UML Diagrams',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
      totalPoints: 100,
      description: 'Model software layers using class diagrams.'
    });

    const asg3 = new Assignment({
      courseId: 'MATH102',
      title: 'Problem Set 1: Matrix Inversion & Linear Systems',
      deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days in future
      totalPoints: 50,
      description: 'Solve sets of linear equations using matrix determinant inversion methods.'
    });

    await asg1.save();
    await asg2.save();
    await asg3.save();
    console.log('📝 Seeded 3 Homework Assignments.');

    // Seed student submission for ENG201
    const sub = new Submission({
      assignmentId: asg2._id,
      studentId: studentUser._id,
      fileUrl: '/uploads/mock_sub.pdf',
      fileName: 'uml_diagrams_kofi.pdf',
      plagiarismScore: 3,
      grade: 95,
      feedback: 'Excellent layout of class diagrams!',
      gradedBy: lecturerUser._id,
      gradedAt: new Date()
    });
    await sub.save();
    console.log('📤 Seeded student assignment submission record.');

    // 6. Create Forum Thread
    const thread = new ForumThread({
      category: 'Computer Science',
      authorId: studentUser._id,
      title: 'Struggling with Recursion in Python - Need help!',
      body: 'Hi everyone, I am trying to understand the base case in recursive functions. My function keeps hitting infinite loops. Can anyone explain how to prevent stack overflow?',
      upvotes: 14
    });
    await thread.save();

    const reply = new ForumReply({
      threadId: thread._id,
      authorId: lecturerUser._id,
      body: 'Think of the base case as the exit door. You must structure your arguments so they get closer to that door on each step. Try writing down the inputs step-by-step.'
    });
    await reply.save();
    console.log('💬 Seeded Forum discussion thread & reply.');

    // 7. Seed Notification
    const notif = new Notification({
      userId: studentUser._id,
      text: 'Welcome to SmartLearn AI LMS! Explore your dashboard to check study schedules.',
      unread: true
    });
    await notif.save();
    console.log('🔔 Seeded initial welcome notification.');

    // 8. Seed Universities
    await University.insertMany(ghanaUniversities);
    console.log('🏛️ Seeded 30 Ghana universities.');

    console.log('🎉 Database seeding complete!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database.');
  }
};

seed();
