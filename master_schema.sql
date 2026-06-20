-- ==========================================
-- SMARTLEARN RESEARCHER PORTAL SUPABASE SCHEMA
-- ==========================================

-- 1. Research Projects Table
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    principal_investigator VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active', -- Active, Completed, Pending
    health_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Research Funding Tracker
CREATE TABLE IF NOT EXISTS public.research_funding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    total_budget NUMERIC(12, 2) NOT NULL,
    equipment_spent NUMERIC(12, 2) DEFAULT 0,
    travel_spent NUMERIC(12, 2) DEFAULT 0,
    software_spent NUMERIC(12, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Milestones & Timelines
CREATE TABLE IF NOT EXISTS public.research_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Done, Overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ethics Applications (IRB)
CREATE TABLE IF NOT EXISTS public.ethics_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Under Review', -- Under Review, Approved, Rejected
    submitted_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE
);

-- 5. Survey Distribution & Results
CREATE TABLE IF NOT EXISTS public.research_surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Active, Closed
    responses_count INTEGER DEFAULT 0,
    target_quota INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Collaborative Tasks (Delegation)
CREATE TABLE IF NOT EXISTS public.research_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assignee VARCHAR(255),
    status VARCHAR(50) DEFAULT 'To Do', -- To Do, In Progress, Review, Done
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Publications
CREATE TABLE IF NOT EXISTS public.research_publications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    journal VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Under Review, Published
    doi VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock Data Insertion (For prototype functionality)
INSERT INTO public.research_projects (title, description, principal_investigator, health_score)
VALUES 
('Healthcare IoT Analysis', 'Data gathering of rural clinic IoT nodes', 'Dr. Mensah', 92),
('AI in Ghanaian Education', 'Evaluating smart tutors', 'Prof. Abena', 85)
ON CONFLICT DO NOTHING;


-- ==========================================
-- SMARTLEARN STUDENT BACKEND SCHEMA
-- ==========================================

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS student_courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  notes_count INTEGER DEFAULT 0,
  assignments_count INTEGER DEFAULT 0
);

-- Insert dummy data so it works immediately
INSERT INTO student_courses (id, title, code, instructor, avatar, notes_count, assignments_count) VALUES
('CS101', 'Introduction to Computer Science & Coding', 'CS101', 'Dr. Kwame Mensah', 'avatar_lecturer.jpg', 4, 2),
('MATH102', 'Calculus & Applied Mathematics', 'MATH102', 'Prof. Ama Serwaa', 'avatar_lecturer.jpg', 3, 1),
('ENG201', 'Software Engineering & Architectures', 'ENG201', 'Mr. Emmanuel Osei', 'avatar_lecturer.jpg', 5, 3),
('BUA202', 'Business Administration & Management', 'BUA202', 'Dr. Sophia Tetteh', 'avatar_lecturer.jpg', 2, 1)
ON CONFLICT (id) DO NOTHING;


-- 2. COURSE NOTES TABLE
CREATE TABLE IF NOT EXISTS student_notes (
  id SERIAL PRIMARY KEY,
  course_id VARCHAR(50) REFERENCES student_courses(id),
  title VARCHAR(255) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  size VARCHAR(50)
);

INSERT INTO student_notes (course_id, title, date, size) VALUES
('CS101', 'Lec 1: Fundamentals of Python & Control Structures.pdf', '2026-05-15', '2.4 MB'),
('CS101', 'Lec 2: Object Oriented Programming in Python.pdf', '2026-05-20', '3.1 MB'),
('MATH102', 'Lec 1: Derivatives and Rate of Changes.pdf', '2026-05-12', '1.8 MB'),
('ENG201', 'Lec 1: Intro to Agile Methodologies & Scrum.pdf', '2026-05-18', '4.2 MB')
ON CONFLICT DO NOTHING;


-- 3. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS student_assignments (
  id SERIAL PRIMARY KEY,
  course_id VARCHAR(50) REFERENCES student_courses(id),
  title VARCHAR(255) NOT NULL,
  deadline DATE,
  total_points INTEGER,
  status VARCHAR(50) DEFAULT 'Pending',
  grade VARCHAR(50),
  feedback TEXT
);

INSERT INTO student_assignments (course_id, title, deadline, total_points, status, grade, feedback) VALUES
('CS101', 'Assignment 1: Logic Gates & Basic Control Flows', '2026-05-28', 100, 'Pending', NULL, NULL),
('ENG201', 'Assignment 2: Drawing UML Diagrams', '2026-06-02', 100, 'Submitted', '95', 'Excellent layout of class diagrams!'),
('MATH102', 'Problem Set 1: Matrix Inversion & Linear Systems', '2026-05-30', 50, 'Pending', NULL, NULL)
ON CONFLICT DO NOTHING;


-- 4. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS student_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES student_assignments(id),
  student_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  grade VARCHAR(50),
  feedback TEXT
);

INSERT INTO student_submissions (assignment_id, student_name, file_name, date, grade, feedback) VALUES
(2, 'Kofi Mensah', 'uml_diagrams_kofi.pdf', '2026-05-22', '95', 'Excellent layout of class diagrams!')
ON CONFLICT DO NOTHING;


-- 5. FORUMS (THREADS) TABLE
CREATE TABLE IF NOT EXISTS student_forums (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100),
  author VARCHAR(255),
  avatar VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0
);

-- 6. FORUM REPLIES TABLE
CREATE TABLE IF NOT EXISTS student_forum_replies (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES student_forums(id),
  author VARCHAR(255),
  avatar VARCHAR(255),
  role VARCHAR(50),
  body TEXT NOT NULL
);

-- Insert Forum Dummy Data
INSERT INTO student_forums (id, category, author, avatar, title, body, upvotes) VALUES
(1, 'Computer Science', 'Kofi Mensah', 'avatar_student.jpg', 'Struggling with Recursion in Python - Need help!', 'Hi everyone, I am trying to understand the base case in recursive functions. My function keeps hitting infinite loops. Can anyone explain how to prevent stack overflow?', 14),
(2, 'Business', 'Efua Ampah', 'avatar_student.jpg', 'Top Entrepreneurship models in Ghana', 'What are the main financial models local startups are using to raise capital in Accra? Would love some case studies.', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_forum_replies (thread_id, author, avatar, role, body) VALUES
(1, 'Mr. Emmanuel Osei', 'avatar_lecturer.jpg', 'Lecturer', 'Think of the base case as the exit door. You must structure your arguments so they get closer to that door on each step. Try writing down the inputs step-by-step.')
ON CONFLICT DO NOTHING;

-- RESET SEQUENCE IDs
SELECT setval('student_forums_id_seq', (SELECT MAX(id) FROM student_forums));
SELECT setval('student_notes_id_seq', (SELECT MAX(id) FROM student_notes));
SELECT setval('student_assignments_id_seq', (SELECT MAX(id) FROM student_assignments));
SELECT setval('student_submissions_id_seq', (SELECT MAX(id) FROM student_submissions));



-- ==========================================
-- SMARTLEARN ADMIN & LECTURER SCHEMA
-- ==========================================

-- 1. USERS (Admin / Students / Lecturers)
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- student, lecturer, admin
    department VARCHAR(255),
    office VARCHAR(255),
    student_id_number VARCHAR(100),
    cgpa NUMERIC(3, 2) DEFAULT 0.00,
    attendance INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'Good Stand',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.users (id, name, email, password, role, department, student_id_number, cgpa, attendance, status) VALUES
('user_std_1', 'Kofi Mensah', 'stu@smartlearn.com', 'password', 'student', 'Computer Science', 'SL-20984', 3.65, 88, 'Good Stand'),
('user_std_2', 'Efua Ampah', 'efua@smartlearn.com', 'password', 'student', 'Business Administration', 'SL-21002', 3.40, 92, 'Good Stand'),
('user_std_3', 'Kwame Koduah', 'kwame@smartlearn.com', 'password', 'student', 'Engineering', 'SL-88402', 2.80, 75, 'Good Stand')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, name, email, password, role, office) VALUES
('user_lec_1', 'Dr. Kwame Mensah', 'lec@smartlearn.com', 'password', 'lecturer', 'Block C, Rm 4')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (id, name, email, password, role) VALUES
('user_admin_1', 'Admin Supervisor', 'admin@smartlearn.com', 'password', 'admin')
ON CONFLICT (email) DO NOTHING;


-- 2. FACULTIES
CREATE TABLE IF NOT EXISTS public.faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    dean VARCHAR(255)
);

INSERT INTO public.faculties (name, code, dean) VALUES
('Faculty of Science & Tech', 'FST', 'Prof. Abena'),
('Faculty of Business', 'FBUS', 'Dr. Sophia Tetteh')
ON CONFLICT DO NOTHING;

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES public.faculties(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL
);

INSERT INTO public.departments (faculty_id, name, code) VALUES
(1, 'Computer Science', 'CS'),
(1, 'Engineering', 'ENG'),
(2, 'Business Administration', 'BUA')
ON CONFLICT DO NOTHING;


-- 4. STARTUPS (Incubation Hub)
CREATE TABLE IF NOT EXISTS public.startups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    description TEXT,
    author VARCHAR(255) NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.startups (name, industry, description, author, upvotes) VALUES
('AgriFlow', 'AgriTech', 'AI-based irrigation scheduling system for cocoa farmers.', 'Naa Ayeley Komey', 42),
('SusuSmart', 'FinTech', 'Digital cooperative thrift (susu) ledger.', 'Kofi Mensah', 28)
ON CONFLICT DO NOTHING;


-- 5. CAREERS & INTERNSHIPS
CREATE TABLE IF NOT EXISTS public.jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- Full-time, Internship
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.jobs (title, company, job_type, description) VALUES
('Software Engineering Intern', 'TechHub Accra', 'Internship', 'Looking for bright CS students for summer coding.'),
('Data Analyst', 'AgriFlow', 'Full-time', 'Analyze cocoa yields using machine learning.')
ON CONFLICT DO NOTHING;

