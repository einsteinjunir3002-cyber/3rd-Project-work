require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// SERVER START
// ==========================================

app.listen(PORT, () => {
    console.log(`SmartLearn Backend API running on http://localhost:${PORT}`);
    if (isMockMode) {
        console.log('WARNING: Running in MOCK mode. Configure .env with SUPABASE_URL to connect to real database.');
    }
});
