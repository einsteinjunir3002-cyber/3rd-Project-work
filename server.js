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
            { id: 'CS101', title: 'Introduction to Computer Science & Coding', code: 'CS101', instructor: 'Dr. Kwame Mensah', avatar: 'avatar_lecturer.jpg', notesCount: 4, assignmentsCount: 2 }
        ]);
    }
    try {
        const { data, error } = await supabase.from('student_courses').select('*');
        if (error) throw error;
        // Transform DB snake_case to frontend camelCase
        const formatted = data.map(c => ({
            id: c.id, title: c.title, code: c.code, instructor: c.instructor, avatar: c.avatar, notesCount: c.notes_count, assignmentsCount: c.assignments_count
        }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Course Notes
app.get('/api/courses/notes', async (req, res) => {
    if (isMockMode) return res.json([]);
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
    if (isMockMode) return res.json([]);
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

app.get('/api/lecturer/submissions', async (req, res) => {
    if (isMockMode) return res.json([]);
    try {
        const { data, error } = await supabase.from('student_submissions').select('*');
        if (error) throw error;
        // map to camelCase for frontend
        res.json(data.map(s => ({
            id: s.id, assignmentId: s.assignment_id, studentName: s.student_name, fileName: s.file_name, date: s.date, grade: s.grade, feedback: s.feedback
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/lecturer/submissions/grade', async (req, res) => {
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
