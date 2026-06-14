-- ==========================================================================
-- SMARTLEARN AI - PRODUCTION DATABASE SCHEMA (POSTGRESQL)
-- Clean, optimized DDL with integrity constraints, cascades and indexes
-- ==========================================================================

-- Enable UUID generation if desired (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth-only accounts
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
    provider VARCHAR(50) DEFAULT 'local', -- 'local', 'google', 'microsoft'
    provider_id VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    remember_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lecturers Metadata Table (Extension of Users)
CREATE TABLE IF NOT EXISTS lecturers (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) DEFAULT 'Dr.', -- e.g., 'Prof.', 'Dr.', 'Mr.', 'Mrs.'
    department VARCHAR(255) NOT NULL,
    office VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students Metadata Table (Extension of Users)
CREATE TABLE IF NOT EXISTS students (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'UG-10984920'
    department VARCHAR(255) NOT NULL,
    year_of_study INT DEFAULT 1 CHECK (year_of_study BETWEEN 1 AND 6),
    projected_gpa NUMERIC(3, 2) DEFAULT 4.00 CHECK (projected_gpa BETWEEN 0.00 AND 4.00),
    stress_level INT DEFAULT 50 CHECK (stress_level BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'CS101', 'MATH102'
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'CS101'
    title VARCHAR(255) NOT NULL,
    lecturer_id INT REFERENCES lecturers(user_id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Lecture Materials / Downloadable Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    uploaded_by INT REFERENCES lecturers(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Course Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    total_points INT DEFAULT 100 CHECK (total_points > 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Assignments Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    plagiarism_score INT DEFAULT 0 CHECK (plagiarism_score BETWEEN 0 AND 100),
    grade NUMERIC(5, 2) CHECK (grade BETWEEN 0.00 AND 100.00),
    feedback TEXT,
    graded_by INT REFERENCES lecturers(user_id) ON DELETE SET NULL,
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_assignment_submission UNIQUE (assignment_id, student_id)
);

-- 8. Student Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_course_attendance_date UNIQUE (student_id, course_id, date)
);

-- 9. Real-time User Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Forums Discussion Threads Table
CREATE TABLE IF NOT EXISTS forum_threads (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- e.g. 'Computer Science', 'Business'
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Forum Thread Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. AI Chats History Logs
CREATE TABLE IF NOT EXISTS ai_chats (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    chat_mode VARCHAR(50) NOT NULL, -- 'study', 'career', 'helper', 'tutor', 'wellness'
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- EFFICIENT DATABASE INDEXING FOR PRODUCTION PERFORMANCE
-- ==========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_notes_course ON notes(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, unread);
