require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Supabase Initialization
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Debugging mode flag (since the user might not have set up DB yet)
const isMockMode = supabaseUrl === 'https://mock.supabase.co';

// ==========================================
// RESEARCHER PORTAL API ROUTES
// ==========================================

// 1. Dashboard Metrics
app.get('/api/research/dashboard', async (req, res) => {
    if (isMockMode) {
        return res.json({
            activeProjects: 4,
            completedStages: 12,
            pendingReviews: 3,
            overallHealth: 92,
            alerts: [
                { type: 'danger', message: 'Urgent: All IoT research protocols must comply with the new Data Protection Act by Aug 1st.' },
                { type: 'success', message: 'Grant Call: Ministry of Education Seed Funding applications are open until Nov 15.' }
            ]
        });
    }

    try {
        const { data, error } = await supabase.from('research_projects').select('*');
        if (error) throw error;
        
        res.json({
            activeProjects: data.filter(p => p.status === 'Active').length,
            completedStages: 12, // In a real scenario, calculate from milestones
            pendingReviews: 3,
            overallHealth: data.reduce((acc, curr) => acc + curr.health_score, 0) / (data.length || 1),
            alerts: []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Task Delegation (Kanban)
app.get('/api/research/tasks', async (req, res) => {
    if (isMockMode) {
        return res.json([
            { id: 1, title: 'Draft Abstract', assignee: 'Dr. Mensah', status: 'To Do' },
            { id: 2, title: 'Data Cleaning', assignee: 'RA', status: 'In Progress' },
            { id: 3, title: 'Hardware Specs', assignee: 'Prof. Abena', status: 'Review' }
        ]);
    }

    try {
        const { data, error } = await supabase.from('research_tasks').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/research/tasks', async (req, res) => {
    const { title, assignee, status } = req.body;
    if (isMockMode) {
        return res.status(201).json({ id: Date.now(), title, assignee, status });
    }

    try {
        const { data, error } = await supabase.from('research_tasks').insert([{ title, assignee, status }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Ethics Applications
app.get('/api/research/ethics', async (req, res) => {
    if (isMockMode) {
        return res.json([
            { id: 1, title: 'Smart Farming IoT Impact', status: 'Approved', submittedDate: '2026-05-12' },
            { id: 2, title: 'AI in Healthcare Patient Data', status: 'Under Review', submittedDate: '2026-06-02' }
        ]);
    }

    try {
        const { data, error } = await supabase.from('ethics_applications').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/research/ethics', async (req, res) => {
    const { title, risk_level } = req.body;
    if (isMockMode) {
        return res.status(201).json({ id: Date.now(), title, risk_level, status: 'Under Review', submittedDate: new Date().toISOString().split('T')[0] });
    }

    try {
        const { data, error } = await supabase.from('ethics_applications').insert([{ title, risk_level }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// STUDENT PORTAL API ROUTES
// ==========================================

// 1. Courses
app.get('/api/courses', async (req, res) => {
    if (isMockMode) {
        return res.json([
            { id: 'CS101', title: 'Introduction to Computer Science & Coding', code: 'CS101', instructor: 'Dr. Kwame Mensah', avatar: 'avatar_lecturer.jpg', notesCount: 5, assignmentsCount: 3, program: 'BSc Computer Science' },
            { id: 'MATH102', title: 'Calculus & Applied Mathematics', code: 'MATH102', instructor: 'Prof. Ama Serwaa', avatar: 'avatar_lecturer.jpg', notesCount: 3, assignmentsCount: 2, program: 'BSc Computer Science' },
            { id: 'ENG201', title: 'Software Engineering & Architectures', code: 'ENG201', instructor: 'Mr. Emmanuel Osei', avatar: 'avatar_lecturer.jpg', notesCount: 6, assignmentsCount: 2, program: 'BSc Software Engineering' },
            { id: 'BUA202', title: 'Business Administration & Management', code: 'BUA202', instructor: 'Dr. Sophia Tetteh', avatar: 'avatar_lecturer.jpg', notesCount: 3, assignmentsCount: 1, program: 'BSc Business Administration' },
            { id: 'CYS101', title: 'Information Security & Cryptography', code: 'CYS101', instructor: 'Dr. Kwame Mensah', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BSc Cybersecurity' },
            { id: 'DSC101', title: 'Introduction to Data Science & Analytics', code: 'DSC101', instructor: 'Prof. Ama Serwaa', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BSc Data Science' },
            { id: 'ELE101', title: 'Circuit Analysis & Semiconductor Electronics', code: 'ELE101', instructor: 'Mr. Emmanuel Osei', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BSc Electrical Engineering' },
            { id: 'MEC101', title: 'Introduction to Thermodynamics & Fluids', code: 'MEC101', instructor: 'Dr. Sophia Tetteh', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BSc Mechanical Engineering' },
            { id: 'ARC101', title: 'Structural Design & Architectural CAD Modeling', code: 'ARC101', instructor: 'Mr. Emmanuel Osei', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BSc Architecture & Design' },
            { id: 'NUR101', title: 'General Nursing & Patient Care Ethics', code: 'NUR101', instructor: 'Dr. Sophia Tetteh', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BSc Nursing & Allied Health' },
            { id: 'MED101', title: 'Clinical Diagnostics & General Pathology', code: 'MED101', instructor: 'Dr. Sophia Tetteh', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'Medicine & Surgery (MBChB)' },
            { id: 'PHA101', title: 'Pharmaceutical Chemistry & Clinical Pharmacology', code: 'PHA101', instructor: 'Prof. Ama Serwaa', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'Doctor of Pharmacy (PharmD)' },
            { id: 'LAW101', title: 'Constitutional Law & Jurisprudence in Ghana', code: 'LAW101', instructor: 'Dr. Sophia Tetteh', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'Bachelor of Laws (LLB)' },
            { id: 'ECO101', title: 'Macroeconomic Principles & Public Policy', code: 'ECO101', instructor: 'Prof. Ama Serwaa', avatar: 'avatar_lecturer.jpg', notesCount: 1, assignmentsCount: 0, program: 'BA Economics & Public Policy' }
        ]);
    }
    try {
        const { data, error } = await supabase.from('student_courses').select('*');
        if (error) throw error;
        const formatted = data.map(c => ({
            id: c.id, title: c.title, code: c.code, instructor: c.instructor, avatar: c.avatar, notesCount: c.notes_count, assignmentsCount: c.assignments_count, program: c.program
        }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Course Notes
app.get('/api/courses/notes', async (req, res) => {
    if (isMockMode) {
        return res.json([
            { id: 1, courseId: 'CS101', title: 'Lec 1: Fundamentals of Python & Control Structures.pdf', date: '2026-05-15', size: '356 KB' },
            { id: 2, courseId: 'CS101', title: 'Lec 2: Object Oriented Programming in Python.pdf', date: '2026-05-20', size: '6.5 MB' },
            { id: 3, courseId: 'MATH102', title: 'Lec 1: Derivatives and Rate of Changes.pdf', date: '2026-05-12', size: '219 KB' },
            { id: 4, courseId: 'ENG201', title: 'Lec 1: Intro to Agile Methodologies & Scrum.pdf', date: '2026-05-18', size: '352 KB' },
            { id: 5, courseId: 'CS101', title: 'Lec 3: Python Programming Basics.pdf', date: '2026-05-22', size: '328 KB' },
            { id: 6, courseId: 'CS101', title: 'Cheat Sheet: Python Syntax & Operations.pdf', date: '2026-05-23', size: '328 KB' },
            { id: 7, courseId: 'MATH102', title: 'Lec 2: Functions, Limits, & Continuity.pdf', date: '2026-05-16', size: '837 KB' },
            { id: 8, courseId: 'MATH102', title: 'Cheat Sheet: Key Calculus Limits & Formulas.pdf', date: '2026-05-17', size: '1.9 MB' },
            { id: 9, courseId: 'BUA202', title: 'Lec 1: Fundamentals of Management & Business Operations.pdf', date: '2026-05-19', size: '204 KB' },
            { id: 10, courseId: 'CS101', title: 'Computer Science Course Book.pdf', date: '2026-06-01', size: '2.2 MB' },
            { id: 11, courseId: 'ENG201', title: 'Software Engineering Course Book.pdf', date: '2026-06-01', size: '3.9 MB' },
            { id: 12, courseId: 'CYS101', title: 'Cybersecurity Course Book.pdf', date: '2026-06-01', size: '6.6 MB' },
            { id: 13, courseId: 'DSC101', title: 'Data Science Course Book.pdf', date: '2026-06-01', size: '2.4 MB' },
            { id: 14, courseId: 'BUA202', title: 'Business Administration Course Book.pdf', date: '2026-06-01', size: '4.8 MB' },
            { id: 15, courseId: 'ECO101', title: 'BA Economics & Public Policy Course Book.pdf', date: '2026-06-01', size: '3.2 MB' },
            { id: 16, courseId: 'ELE101', title: 'Electrical Engineering Course Book.pdf', date: '2026-06-01', size: '5.1 MB' },
            { id: 17, courseId: 'MEC101', title: 'Mechanical Engineering Course Book.pdf', date: '2026-06-01', size: '4.4 MB' },
            { id: 18, courseId: 'ARC101', title: 'Architecture and Design Course Book.pdf', date: '2026-06-01', size: '7.8 MB' },
            { id: 19, courseId: 'NUR101', title: 'Nursing and Allied Health Course Book.pdf', date: '2026-06-01', size: '3.5 MB' },
            { id: 20, courseId: 'PHA101', title: 'Pharmacy Course Book.pdf', date: '2026-06-01', size: '5.8 MB' },
            { id: 21, courseId: 'MED101', title: 'Medicine and Surgery Course Book.pdf', date: '2026-06-01', size: '10.2 MB' },
            { id: 22, courseId: 'LAW101', title: 'Bachelor of Laws Course Book.pdf', date: '2026-06-01', size: '8.4 MB' }
        ]);
    }
    try {
        const { data, error } = await supabase.from('student_notes').select('*');
        if (error) throw error;
        const formatted = data.map(n => ({
            id: n.id, courseId: n.course_id, title: n.title, date: n.date, size: n.size
        }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Assignments
app.get('/api/assignments', async (req, res) => {
    if (isMockMode) {
        return res.json([
            { id: 1, courseId: 'CS101', title: 'Assignment 1: Logic Gates & Basic Control Flows', deadline: '2026-05-28', totalPoints: 100, status: 'Pending' },
            { id: 2, courseId: 'ENG201', title: 'Assignment 2: Drawing UML Diagrams', deadline: '2026-06-02', totalPoints: 100, status: 'Submitted', grade: '95', feedback: 'Excellent layout of class diagrams!' },
            { id: 3, courseId: 'MATH102', title: 'Problem Set 1: Matrix Inversion & Linear Systems', deadline: '2026-05-30', totalPoints: 50, status: 'Pending' },
            { id: 4, courseId: 'CS101', title: 'Assignment 4: Control Flows & Functions', deadline: '2026-05-25', totalPoints: 100, status: 'Submitted', grade: '88', feedback: 'Great work on functions!' },
            { id: 5, courseId: 'MATH102', title: 'Assignment 5: Advanced Integration Techniques', deadline: '2026-05-31', totalPoints: 100, status: 'Pending' },
            { id: 6, courseId: 'ENG201', title: 'Assignment 6: Architectural Patterns', deadline: '2026-05-15', totalPoints: 100, status: 'Pending' },
            { id: 7, courseId: 'CS101', title: 'Assignment 7: Data Structures & Algorithms', deadline: '2026-05-10', totalPoints: 100, status: 'Submitted', grade: '90', feedback: 'Good implementation of binary search tree.' }
        ]);
    }
    try {
        const { data, error } = await supabase.from('student_assignments').select('*');
        if (error) throw error;
        const formatted = data.map(a => ({
            id: a.id, courseId: a.course_id, title: a.title, deadline: a.deadline, totalPoints: a.total_points, status: a.status, grade: a.grade, feedback: a.feedback
        }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Forums
app.get('/api/forums', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data: threads, error: threadsErr } = await supabase.from('student_forums').select('*');
        if (threadsErr) throw threadsErr;
        
        const { data: replies, error: repliesErr } = await supabase.from('student_forum_replies').select('*');
        if (repliesErr) throw repliesErr;

        const formattedThreads = threads.map(t => {
            const threadReplies = replies.filter(r => r.thread_id === t.id).map(r => ({
                author: r.author, avatar: r.avatar, role: r.role, body: r.body
            }));
            return {
                id: t.id, category: t.category, author: t.author, avatar: t.avatar, title: t.title, body: t.body, upvotes: t.upvotes, replies: threadReplies
            };
        });
        res.json(formattedThreads);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Post a Thread
app.post('/api/forums/thread', async (req, res) => {
    const { category, title, body } = req.body;
    if (isMockMode) return res.status(201).json({ id: Date.now(), title, body });
    try {
        const { data, error } = await supabase.from('student_forums').insert([{ 
            category, title, body, author: 'Current Student', avatar: 'avatar_student.jpg', upvotes: 0 
        }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Post a Reply
app.post('/api/forums/reply', async (req, res) => {
    const { threadId, body } = req.body;
    if (isMockMode) return res.status(201).json({ threadId, body });
    try {
        const { data, error } = await supabase.from('student_forum_replies').insert([{ 
            thread_id: threadId, body, author: 'Current Student', avatar: 'avatar_student.jpg', role: 'Student' 
        }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upvote
app.put('/api/forums/upvote/:id', async (req, res) => {
    const { id } = req.params;
    if (isMockMode) return res.status(200).json({ success: true });
    try {
        // Read current upvotes, then increment
        const { data: thread, error: fetchErr } = await supabase.from('student_forums').select('upvotes').eq('id', id).single();
        if (fetchErr) throw fetchErr;
        
        const { error: updateErr } = await supabase.from('student_forums').update({ upvotes: thread.upvotes + 1 }).eq('id', id);
        if (updateErr) throw updateErr;
        res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Submit Assignment
app.post('/api/assignments/submit', async (req, res) => {
    // We would use multer for actual file uploads, but let's mock the DB record for now
    if (isMockMode) return res.status(200).json({ success: true, plagiarismScore: 12 });
    try {
        // Assuming body contains assignment ID
        // Hardcoded for demonstration of the route working
        res.status(200).json({ success: true, plagiarismScore: 12 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update GPA
app.post('/api/students/update-gpa', async (req, res) => {
    res.status(200).json({ success: true });
});

// ==========================================

// ==========================================
// LECTURER PORTAL API ROUTES
// ==========================================

app.get('/api/lecturer/students', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('users').select('*').eq('role', 'student');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/lecturer/students/gpa', async (req, res) => {
    const { studentId, cgpa } = req.body;
    if (isMockMode) return res.status(200).json({ success: true });
    try {
        const status = cgpa < 2 ? 'Needs Help' : 'Good Stand';
        const { error } = await supabase.from('users').update({ cgpa, status }).eq('id', studentId);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get(['/api/assignments/submissions', '/api/lecturer/submissions'], async (req, res) => {
    if (isMockMode) {
        return res.json([
            { id: 1, assignmentId: 2, studentName: 'Kofi Mensah', fileName: 'uml_diagrams_kofi.pdf', date: '2026-05-22', grade: '95', feedback: 'Excellent layout of class diagrams!' },
            { id: 2, assignmentId: 4, studentName: 'Kofi Mensah', fileName: 'control_flows_kofi.pdf', date: '2026-05-25 11:15 AM', grade: '88', feedback: 'Great work on functions!' },
            { id: 3, assignmentId: 7, studentName: 'Kofi Mensah', fileName: 'data_structures_kofi.pdf', date: '2026-05-12 02:30 PM', grade: '90', feedback: 'Good implementation of binary search tree.' }
        ]);
    }
    try {
        const { data, error } = await supabase.from('student_submissions').select('*');
        if (error) throw error;
        // map to camelCase for frontend
        res.json(data.map(s => ({
            id: s.id, assignmentId: s.assignment_id, studentName: s.student_name, fileName: s.file_name, date: s.date, grade: s.grade, feedback: s.feedback
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.all(['/api/assignments/grade', '/api/lecturer/submissions/grade'], async (req, res) => {
    const { submissionId, grade, feedback } = req.body;
    if (isMockMode) return res.status(200).json({ success: true });
    try {
        const { error } = await supabase.from('student_submissions').update({ grade, feedback }).eq('id', submissionId);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ADMIN PORTAL API ROUTES
// ==========================================

app.get('/api/admin/metrics', async (req, res) => {
    if (isMockMode) return res.json({ users: 145, students: 142, lecturers: 3, startups: 2 });
    try {
        const [users, startups] = await Promise.all([
            supabase.from('users').select('role'),
            supabase.from('startups').select('id', { count: 'exact' })
        ]);
        
        let students = 0, lecturers = 0;
        if (users.data) {
            students = users.data.filter(u => u.role === 'student').length;
            lecturers = users.data.filter(u => u.role === 'lecturer').length;
        }

        res.json({
            users: users.data ? users.data.length : 0,
            students,
            lecturers,
            startups: startups.count || 0
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/users', async (req, res) => {
    const { name, email, role, department, office, student_id_number, password } = req.body;
    if (isMockMode) return res.status(201).json({ id: Date.now(), name });
    try {
        const { data, error } = await supabase.from('users').insert([{ 
            id: 'user_' + Date.now(), name, email, role, department, office, student_id_number, password 
        }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/faculties', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('faculties').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/departments', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('departments').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/startups', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('startups').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/jobs', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('jobs').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// STUDENT-LECTURER ENGAGEMENT SYSTEM REST & WEBSOCKET ENGINE
// ==========================================

// Stateful in-memory stores for mock database fallback
const mockFollowers = [];
const mockAppointments = [
    { id: 1, student_id: 'user_std_1', lecturer_id: 'user_lec_1', scheduled_time: '2026-06-25T14:00:00.000Z', topic: 'Recursion Help', status: 'Pending', notes: 'Need visual explainer', feedback: '' }
];
const mockQuestions = [
    { id: 1, student_id: 'user_std_1', lecturer_id: 'user_lec_1', question_text: 'What is the base case in recursion?', answer_text: 'Think of it as the exit door. You must stop recurring once you reach the base case.', created_at: '2026-06-20T10:00:00.000Z', answered_at: '2026-06-20T11:00:00.000Z' }
];
const mockAnnouncements = [
    { id: 1, lecturer_id: 'user_lec_1', title: 'Office Hours Rescheduled', content: 'This Friday office hours will start at 2pm instead of 10am.', created_at: '2026-06-22T08:00:00.000Z' }
];
const mockCommunities = [
    { id: 1, lecturer_id: 'user_lec_1', name: 'Python Wizards', description: 'Academic discussion and resources for Python programming.', created_at: '2026-06-22T08:00:00.000Z' }
];
const mockCommunityMembers = [
    { community_id: 1, student_id: 'user_std_1', joined_at: '2026-06-22T08:30:00.000Z' }
];
const mockPosts = [
    { id: 1, community_id: 1, author_id: 'user_lec_1', author_name: 'Dr. Kwame Mensah', title: 'Dynamic Programming Insights', content: 'Dynamic programming is memoization + recursion. Check the uploaded PDF notes.', created_at: '2026-06-22T09:00:00.000Z' }
];
const mockComments = [
    { id: 1, post_id: 1, author_id: 'user_std_1', author_name: 'Kofi Mensah', comment_text: 'Makes complete sense now, thank you!', created_at: '2026-06-22T10:00:00.000Z' }
];
const mockReactions = [
    { post_id: 1, user_id: 'user_std_1', reaction_type: 'like' }
];
const mockInsights = [
    { id: 1, lecturer_id: 'user_lec_1', title: 'Agile vs Waterfall', content: 'Agile is iterative and adapts to changes, Waterfall is linear and predictive.', type: 'insight', url: '', created_at: '2026-06-22T07:00:00.000Z' }
];
const mockEndorsements = [
    { id: 1, project_type: 'startup', project_id: 2, lecturer_id: 'user_lec_1', endorsement_text: 'A highly functional and innovative financial Susu savings app for Ghana.', created_at: '2026-06-22T11:00:00.000Z' }
];
const mockFeedback = [
    { id: 1, student_id: 'user_std_1', lecturer_id: 'user_lec_1', feedback_text: 'Keep practicing coding and working on logic flows. You are improving quickly!', created_at: '2026-06-22T11:15:00.000Z' }
];
const mockNotifications = [
    { id: 1, user_id: 'user_std_1', text: 'Welcome to SmartLearn real-time notifications!', unread: true, created_at: '2026-06-22T11:00:00.000Z' }
];
const mockEngagementAnalytics = [
    { user_id: 'user_std_1', posts_count: 0, comments_count: 1, likes_count: 1, appointments_count: 1 }
];

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server });
const wsClients = new Map();

wss.on('connection', (ws) => {
    let wsUserId = null;
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'auth') {
                wsUserId = data.userId;
                wsClients.set(wsUserId, ws);
                console.log(`WebSocket client authenticated: ${wsUserId}`);
            } else if (data.type === 'chat_message') {
                // Relays live chats to specific user
                const recipientWs = wsClients.get(data.recipientId);
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                    recipientWs.send(JSON.stringify({
                        type: 'chat_relay',
                        senderId: data.senderId,
                        senderName: data.senderName,
                        text: data.text,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                }
            }
        } catch (e) {
            console.error('WS Error:', e);
        }
    });

    ws.on('close', () => {
        if (wsUserId) {
            wsClients.delete(wsUserId);
            console.log(`WebSocket client disconnected: ${wsUserId}`);
        }
    });
});

// Helper for notifications dispatch
function dispatchNotification(userId, text) {
    // Save locally
    const notif = { id: Date.now(), user_id: userId, text, unread: true, created_at: new Date().toISOString() };
    mockNotifications.unshift(notif);
    
    // Send via socket
    const client = wsClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'notification', data: notif }));
    }
}

// Helper for community websocket broadcasts
function broadcastCommunityUpdate(payload) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'community_sync', payload }));
        }
    });
}

// Helper for Q&A websocket broadcasts
function broadcastQaUpdate(userId, questionId, text, type) {
    const client = wsClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, questionId, text }));
    }
}

// 1. Follows REST endpoints
app.post('/api/lecturers/follow', async (req, res) => {
    const { student_id, lecturer_id } = req.body;
    if (isMockMode) {
        if (!mockFollowers.some(f => f.student_id === student_id && f.lecturer_id === lecturer_id)) {
            mockFollowers.push({ student_id, lecturer_id, followed_at: new Date().toISOString() });
        }
        dispatchNotification(lecturer_id, `A student (${student_id}) started following you.`);
        return res.json({ success: true, message: 'Followed successfully (Offline)' });
    }
    try {
        const { error } = await supabase.from('lecturer_follows').insert([{ student_id, lecturer_id }]);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/lecturers/unfollow', async (req, res) => {
    const { student_id, lecturer_id } = req.body;
    if (isMockMode) {
        const idx = mockFollowers.findIndex(f => f.student_id === student_id && f.lecturer_id === lecturer_id);
        if (idx !== -1) mockFollowers.splice(idx, 1);
        return res.json({ success: true, message: 'Unfollowed successfully (Offline)' });
    }
    try {
        const { error } = await supabase.from('lecturer_follows').delete().match({ student_id, lecturer_id });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/lecturers/stats', async (req, res) => {
    const { student_id } = req.query;
    // Hardcoded lecturer directory metadata
    const directory = [
        { id: 'user_lec_1', name: 'Dr. Kwame Mensah', email: 'lec@smartlearn.com', research: 'Artificial Intelligence, Educational Technologies', officeHours: 'Monday/Wednesday 10:00 AM - 12:00 PM', role: 'lecturer' },
        { id: 'user_lec_2', name: 'Prof. Ama Serwaa', email: 'ama@smartlearn.com', research: 'Computational Mathematics, Applied Calculus', officeHours: 'Tuesday/Thursday 1:00 PM - 3:00 PM', role: 'lecturer' },
        { id: 'user_lec_3', name: 'Dr. Sophia Tetteh', email: 'sophia@smartlearn.com', research: 'Educational Psychology, Student Counseling', officeHours: 'Wednesday/Friday 10:00 AM - 11:00 AM', role: 'lecturer' },
        { id: 'user_lec_4', name: 'Mr. Emmanuel Osei', email: 'osei@smartlearn.com', research: 'Software Architectures, Agile Systems Management', officeHours: 'Thursday 2:00 PM - 4:00 PM', role: 'lecturer' }
    ];

    if (isMockMode) {
        const result = directory.map(lec => {
            const followers = mockFollowers.filter(f => f.lecturer_id === lec.id);
            const isFollowed = mockFollowers.some(f => f.student_id === student_id && f.lecturer_id === lec.id);
            return { ...lec, followerCount: followers.length, followed: isFollowed };
        });
        return res.json(result);
    }
    try {
        const [followsRes, dbUsers] = await Promise.all([
            supabase.from('lecturer_follows').select('*'),
            supabase.from('users').select('*').eq('role', 'lecturer')
        ]);
        const actualLecs = dbUsers.data && dbUsers.data.length ? dbUsers.data : directory;
        const follows = followsRes.data || [];
        const result = actualLecs.map(lec => {
            const fCount = follows.filter(f => f.lecturer_id === lec.id).length;
            const followed = follows.some(f => f.student_id === student_id && f.lecturer_id === lec.id);
            return {
                id: lec.id,
                name: lec.name,
                email: lec.email,
                research: lec.research_interests || lec.research || 'AI Integration',
                officeHours: lec.office_hours || lec.officeHours || 'Monday 10am',
                followerCount: fCount,
                followed: followed
            };
        });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Q&A REST endpoints
app.post('/api/qa/question', async (req, res) => {
    const { student_id, student_name, lecturer_id, question_text } = req.body;
    if (isMockMode) {
        const q = { id: Date.now(), student_id, student_name: student_name || 'Student', lecturer_id, question_text, answer_text: null, created_at: new Date().toISOString() };
        mockQuestions.push(q);
        dispatchNotification(lecturer_id, `New question from ${student_name || 'student'}: "${question_text.slice(0, 30)}..."`);
        return res.status(201).json(q);
    }
    try {
        const { data, error } = await supabase.from('qa_questions').insert([{ student_id, lecturer_id, question_text }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/qa/answer', async (req, res) => {
    const { question_id, answer_text } = req.body;
    if (isMockMode) {
        const q = mockQuestions.find(x => x.id == question_id);
        if (q) {
            q.answer_text = answer_text;
            q.answered_at = new Date().toISOString();
            dispatchNotification(q.student_id, `Your question has been answered: "${answer_text.slice(0, 30)}..."`);
            broadcastQaUpdate(q.student_id, q.id, answer_text, 'qa_answer');
            return res.json(q);
        }
        return res.status(404).json({ error: 'Question not found' });
    }
    try {
        const { data, error } = await supabase.from('qa_questions').update({ answer_text, answered_at: new Date() }).eq('id', question_id).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/qa', async (req, res) => {
    const { user_id, role } = req.query;
    if (isMockMode) {
        const filterField = role === 'student' ? 'student_id' : 'lecturer_id';
        const qList = mockQuestions.filter(x => x[filterField] === user_id);
        return res.json(qList);
    }
    try {
        const filterField = role === 'student' ? 'student_id' : 'lecturer_id';
        const { data, error } = await supabase.from('qa_questions').select('*').eq(filterField, user_id);
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Appointments
app.post('/api/appointments/request', async (req, res) => {
    const { student_id, student_name, lecturer_id, scheduled_time, topic, notes } = req.body;
    if (isMockMode) {
        const appt = { id: Date.now(), student_id, student_name: student_name || 'Student', lecturer_id, scheduled_time, topic, notes, status: 'Pending', feedback: '' };
        mockAppointments.push(appt);
        dispatchNotification(lecturer_id, `New consultation requested by ${student_name || 'Student'} on ${new Date(scheduled_time).toLocaleDateString()}`);
        return res.status(201).json(appt);
    }
    try {
        const { data, error } = await supabase.from('appointments').insert([{ student_id, lecturer_id, scheduled_time, topic, notes }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/appointments/respond', async (req, res) => {
    const { appointment_id, status, feedback } = req.body;
    if (isMockMode) {
        const appt = mockAppointments.find(x => x.id == appointment_id);
        if (appt) {
            appt.status = status;
            appt.feedback = feedback || '';
            dispatchNotification(appt.student_id, `Consultation status update: ${status}. Notes: "${feedback}"`);
            
            // Increment analytics counts
            if (status === 'Approved') {
                const ana = mockEngagementAnalytics.find(x => x.user_id === appt.student_id);
                if (ana) ana.appointments_count++;
            }

            return res.json(appt);
        }
        return res.status(404).json({ error: 'Appointment not found' });
    }
    try {
        const { data, error } = await supabase.from('appointments').update({ status, feedback }).eq('id', appointment_id).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/appointments', async (req, res) => {
    const { user_id, role } = req.query;
    if (isMockMode) {
        const filterField = role === 'student' ? 'student_id' : 'lecturer_id';
        return res.json(mockAppointments.filter(x => x[filterField] === user_id));
    }
    try {
        const filterField = role === 'student' ? 'student_id' : 'lecturer_id';
        const { data, error } = await supabase.from('appointments').select('*').eq(filterField, user_id);
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Communities
app.get('/api/communities', async (req, res) => {
    const { student_id } = req.query;
    if (isMockMode) {
        const mapped = mockCommunities.map(c => {
            const isJoined = mockCommunityMembers.some(m => m.community_id == c.id && m.student_id === student_id);
            const mCount = mockCommunityMembers.filter(m => m.community_id == c.id).length;
            return { ...c, joined: isJoined, memberCount: mCount };
        });
        return res.json(mapped);
    }
    try {
        const [coms, mems] = await Promise.all([
            supabase.from('communities').select('*'),
            supabase.from('community_members').select('*')
        ]);
        const result = (coms.data || []).map(c => {
            const isJoined = (mems.data || []).some(m => m.community_id === c.id && m.student_id === student_id);
            const mCount = (mems.data || []).filter(m => m.community_id === c.id).length;
            return { id: c.id, lecturer_id: c.lecturer_id, name: c.name, description: c.description, joined: isJoined, memberCount: mCount };
        });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communities', async (req, res) => {
    const { lecturer_id, name, description } = req.body;
    if (isMockMode) {
        const c = { id: Date.now(), lecturer_id, name, description, created_at: new Date().toISOString() };
        mockCommunities.push(c);
        return res.status(201).json(c);
    }
    try {
        const { data, error } = await supabase.from('communities').insert([{ lecturer_id, name, description }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communities/join', async (req, res) => {
    const { community_id, student_id } = req.body;
    if (isMockMode) {
        if (!mockCommunityMembers.some(m => m.community_id == community_id && m.student_id === student_id)) {
            mockCommunityMembers.push({ community_id: parseInt(community_id), student_id, joined_at: new Date().toISOString() });
        }
        return res.json({ success: true });
    }
    try {
        const { error } = await supabase.from('community_members').insert([{ community_id, student_id }]);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communities/post', async (req, res) => {
    const { community_id, author_id, author_name, title, content } = req.body;
    if (isMockMode) {
        const post = { id: Date.now(), community_id: parseInt(community_id), author_id, author_name: author_name || 'Author', title, content, created_at: new Date().toISOString() };
        mockPosts.push(post);
        
        // Track analytics
        let ana = mockEngagementAnalytics.find(x => x.user_id === author_id);
        if (!ana) { ana = { user_id: author_id, posts_count: 0, comments_count: 0, likes_count: 0, appointments_count: 0 }; mockEngagementAnalytics.push(ana); }
        ana.posts_count++;

        broadcastCommunityUpdate({ action: 'new_post', post });
        return res.status(201).json(post);
    }
    try {
        const { data, error } = await supabase.from('posts').insert([{ community_id, author_id, title, content }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communities/comment', async (req, res) => {
    const { post_id, author_id, author_name, comment_text } = req.body;
    if (isMockMode) {
        const comment = { id: Date.now(), post_id: parseInt(post_id), author_id, author_name: author_name || 'Commenter', comment_text, created_at: new Date().toISOString() };
        mockComments.push(comment);
        
        // Track analytics
        let ana = mockEngagementAnalytics.find(x => x.user_id === author_id);
        if (!ana) { ana = { user_id: author_id, posts_count: 0, comments_count: 0, likes_count: 0, appointments_count: 0 }; mockEngagementAnalytics.push(ana); }
        ana.comments_count++;

        broadcastCommunityUpdate({ action: 'new_comment', comment });
        return res.status(201).json(comment);
    }
    try {
        const { data, error } = await supabase.from('comments').insert([{ post_id, author_id, comment_text }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communities/react', async (req, res) => {
    const { post_id, user_id, reaction_type } = req.body;
    if (isMockMode) {
        const react = { post_id: parseInt(post_id), user_id, reaction_type };
        const idx = mockReactions.findIndex(x => x.post_id == post_id && x.user_id === user_id && x.reaction_type === reaction_type);
        if (idx === -1) {
            mockReactions.push(react);
            
            // Track analytics
            let ana = mockEngagementAnalytics.find(x => x.user_id === user_id);
            if (!ana) { ana = { user_id: user_id, posts_count: 0, comments_count: 0, likes_count: 0, appointments_count: 0 }; mockEngagementAnalytics.push(ana); }
            ana.likes_count++;
        } else {
            mockReactions.splice(idx, 1);
        }
        broadcastCommunityUpdate({ action: 'reaction_sync', post_id, reactions: mockReactions.filter(r => r.post_id == post_id) });
        return res.json({ success: true });
    }
    try {
        const { error } = await supabase.from('reactions').insert([{ post_id, user_id, reaction_type }]);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/communities/posts', async (req, res) => {
    const { community_id } = req.query;
    if (isMockMode) {
        const posts = mockPosts.filter(p => p.community_id == community_id);
        const result = posts.map(p => {
            const comments = mockComments.filter(c => c.post_id == p.id);
            const reactions = mockReactions.filter(r => r.post_id == p.id);
            return { ...p, comments, reactions };
        });
        return res.json(result);
    }
    try {
        const [postsRes, commentsRes, reactionsRes] = await Promise.all([
            supabase.from('posts').select('*').eq('community_id', community_id),
            supabase.from('comments').select('*'),
            supabase.from('reactions').select('*')
        ]);
        const result = (postsRes.data || []).map(p => {
            const comments = (commentsRes.data || []).filter(c => c.post_id === p.id);
            const reactions = (reactionsRes.data || []).filter(r => r.post_id === p.id);
            return { ...p, comments, reactions };
        });
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Insights & Endorsements
app.post('/api/insights', async (req, res) => {
    const { lecturer_id, title, content, type, url } = req.body;
    if (isMockMode) {
        const ins = { id: Date.now(), lecturer_id, title, content, type, url: url || '', created_at: new Date().toISOString() };
        mockInsights.push(ins);
        
        // Push notification to all followers
        mockFollowers.filter(f => f.lecturer_id === lecturer_id).forEach(f => {
            dispatchNotification(f.student_id, `Prof. Kwame Mensah shared a new ${type}: "${title}"`);
        });

        return res.status(201).json(ins);
    }
    try {
        const { data, error } = await supabase.from('insights_resources').insert([{ lecturer_id, title, content, type, url }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/insights', async (req, res) => {
    if (isMockMode) {
        return res.json(mockInsights);
    }
    try {
        const { data, error } = await supabase.from('insights_resources').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/endorsements', async (req, res) => {
    const { project_type, project_id, lecturer_id, endorsement_text } = req.body;
    if (isMockMode) {
        const end = { id: Date.now(), project_type, project_id: parseInt(project_id), lecturer_id, endorsement_text, created_at: new Date().toISOString() };
        mockEndorsements.push(end);
        
        // Notify student author
        const startupName = project_id == 2 ? "SusuSmart" : (project_id == 1 ? "AgriFlow" : "Student Project #" + project_id);
        dispatchNotification('user_std_1', `Your startup project "${startupName}" was endorsed by Dr. Kwame Mensah!`);

        return res.status(201).json(end);
    }
    try {
        const { data, error } = await supabase.from('endorsements').insert([{ project_type, project_id, lecturer_id, endorsement_text }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/endorsements', async (req, res) => {
    if (isMockMode) {
        return res.json(mockEndorsements);
    }
    try {
        const { data, error } = await supabase.from('endorsements').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Personalized Feedback
app.post('/api/feedback', async (req, res) => {
    const { student_id, lecturer_id, feedback_text } = req.body;
    if (isMockMode) {
        const fb = { id: Date.now(), student_id, lecturer_id, feedback_text, created_at: new Date().toISOString() };
        mockFeedback.push(fb);
        dispatchNotification(student_id, `New personal feedback notes from Lecturer: "${feedback_text.slice(0, 30)}..."`);
        return res.status(201).json(fb);
    }
    try {
        const { data, error } = await supabase.from('personalized_feedback').insert([{ student_id, lecturer_id, feedback_text }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/feedback', async (req, res) => {
    const { student_id } = req.query;
    if (isMockMode) {
        return res.json(mockFeedback.filter(x => x.student_id === student_id));
    }
    try {
        const { data, error } = await supabase.from('personalized_feedback').select('*').eq('student_id', student_id);
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. Notifications API
app.get('/api/notifications', async (req, res) => {
    const { user_id } = req.query;
    if (isMockMode) {
        return res.json(mockNotifications.filter(x => x.user_id === user_id));
    }
    try {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user_id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notifications/read', async (req, res) => {
    const { id } = req.body;
    if (isMockMode) {
        const n = mockNotifications.find(x => x.id == id);
        if (n) n.unread = false;
        return res.json({ success: true });
    }
    try {
        const { error } = await supabase.from('notifications').update({ unread: false }).eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Engagement Analytics
app.get('/api/engagement/analytics', async (req, res) => {
    const { student_id } = req.query;
    if (isMockMode) {
        const stats = mockEngagementAnalytics.find(x => x.user_id === student_id) || { user_id: student_id, posts_count: 0, comments_count: 0, likes_count: 0, appointments_count: 0 };
        return res.json(stats);
    }
    try {
        const { data, error } = await supabase.from('engagement_analytics').select('*').eq('user_id', student_id).single();
        if (error && error.code !== 'PGRST116') throw error;
        res.json(data || { user_id: student_id, posts_count: 0, comments_count: 0, likes_count: 0, appointments_count: 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// SERVER START
// ==========================================

server.listen(PORT, () => {
    console.log(`SmartLearn Backend API running on http://localhost:${PORT}`);
    if (isMockMode) {
        console.log('WARNING: Running in MOCK mode. Configure .env with SUPABASE_URL to connect to real database.');
    }
});

module.exports = app;

