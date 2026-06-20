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
  assignments_count INTEGER DEFAULT 0,
  program VARCHAR(255)
);

-- Insert dummy data so it works immediately
INSERT INTO student_courses (id, title, code, instructor, avatar, notes_count, assignments_count, program) VALUES
('CS101', 'Introduction to Computer Science & Coding', 'CS101', 'Dr. Kwame Mensah', 'avatar_lecturer.jpg', 4, 2, 'BSc Computer Science'),
('MATH102', 'Calculus & Applied Mathematics', 'MATH102', 'Prof. Ama Serwaa', 'avatar_lecturer.jpg', 3, 1, 'BSc Computer Science'),
('ENG201', 'Software Engineering & Architectures', 'ENG201', 'Mr. Emmanuel Osei', 'avatar_lecturer.jpg', 5, 3, 'BSc Software Engineering'),
('BUA202', 'Business Administration & Management', 'BUA202', 'Dr. Sophia Tetteh', 'avatar_lecturer.jpg', 2, 1, 'BSc Business Administration'),
('CYS101', 'Information Security & Cryptography', 'CYS101', 'Dr. Kwame Mensah', 'avatar_lecturer.jpg', 1, 0, 'BSc Cybersecurity'),
('DSC101', 'Introduction to Data Science & Analytics', 'DSC101', 'Prof. Ama Serwaa', 'avatar_lecturer.jpg', 1, 0, 'BSc Data Science'),
('ELE101', 'Circuit Analysis & Semiconductor Electronics', 'ELE101', 'Mr. Emmanuel Osei', 'avatar_lecturer.jpg', 1, 0, 'BSc Electrical Engineering'),
('MEC101', 'Introduction to Thermodynamics & Fluids', 'MEC101', 'Dr. Sophia Tetteh', 'avatar_lecturer.jpg', 1, 0, 'BSc Mechanical Engineering'),
('ARC101', 'Structural Design & Architectural CAD Modeling', 'ARC101', 'Mr. Emmanuel Osei', 'avatar_lecturer.jpg', 1, 0, 'BSc Architecture & Design'),
('NUR101', 'General Nursing & Patient Care Ethics', 'NUR101', 'Dr. Sophia Tetteh', 'avatar_lecturer.jpg', 1, 0, 'BSc Nursing & Allied Health'),
('MED101', 'Clinical Diagnostics & General Pathology', 'MED101', 'Dr. Sophia Tetteh', 'avatar_lecturer.jpg', 1, 0, 'Medicine & Surgery (MBChB)'),
('PHA101', 'Pharmaceutical Chemistry & Clinical Pharmacology', 'PHA101', 'Prof. Ama Serwaa', 'avatar_lecturer.jpg', 1, 0, 'Doctor of Pharmacy (PharmD)'),
('LAW101', 'Constitutional Law & Jurisprudence in Ghana', 'LAW101', 'Dr. Sophia Tetteh', 'avatar_lecturer.jpg', 1, 0, 'Bachelor of Laws (LLB)'),
('ECO101', 'Macroeconomic Principles & Public Policy', 'ECO101', 'Prof. Ama Serwaa', 'avatar_lecturer.jpg', 1, 0, 'BA Economics & Public Policy')
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
('ENG201', 'Lec 1: Intro to Agile Methodologies & Scrum.pdf', '2026-05-18', '4.2 MB'),
('CS101', 'Computer Science Course Book.pdf', '2026-06-01', '2.2 MB'),
('ENG201', 'Software Engineering Course Book.pdf', '2026-06-01', '3.9 MB'),
('CYS101', 'Cybersecurity Course Book.pdf', '2026-06-01', '6.6 MB'),
('DSC101', 'Data Science Course Book.pdf', '2026-06-01', '2.4 MB'),
('BUA202', 'Business Administration Course Book.pdf', '2026-06-01', '4.8 MB'),
('ECO101', 'BA Economics & Public Policy Course Book.pdf', '2026-06-01', '3.2 MB'),
('ELE101', 'Electrical Engineering Course Book.pdf', '2026-06-01', '5.1 MB'),
('MEC101', 'Mechanical Engineering Course Book.pdf', '2026-06-01', '4.4 MB'),
('ARC101', 'Architecture and Design Course Book.pdf', '2026-06-01', '7.8 MB'),
('NUR101', 'Nursing and Allied Health Course Book.pdf', '2026-06-01', '3.5 MB'),
('PHA101', 'Pharmacy Course Book.pdf', '2026-06-01', '5.8 MB'),
('MED101', 'Medicine and Surgery Course Book.pdf', '2026-06-01', '10.2 MB'),
('LAW101', 'Bachelor of Laws Course Book.pdf', '2026-06-01', '8.4 MB' )
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
