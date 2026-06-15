-- ==========================================================================
-- SMARTLEARN AI - PRODUCTION DATABASE SCHEMA (POSTGRESQL)
-- Clean, optimized DDL with integrity constraints, cascades and indexes
-- ==========================================================================

-- Enable UUID generation if desired (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- NEW ACADEMIC HIERARCHY TABLES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'FCIS'
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES faculties(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'CS'
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'BSc CS'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Degree', -- 'Degree', 'Diploma'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- CORE USERS AND ROLES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), 
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'lecturer', 'department_admin', 'super_admin')),
    
    -- DBAC Hierarchy Assigments
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL, -- Primarily for students
    
    provider VARCHAR(50) DEFAULT 'local', 
    provider_id VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    remember_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lecturers (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) DEFAULT 'Dr.', 
    office VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id_number VARCHAR(100) UNIQUE NOT NULL, 
    year_of_study INT DEFAULT 1 CHECK (year_of_study BETWEEN 1 AND 6),
    projected_gpa NUMERIC(3, 2) DEFAULT 4.00 CHECK (projected_gpa BETWEEN 0.00 AND 4.00),
    stress_level INT DEFAULT 50 CHECK (stress_level BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- COURSES AND ENROLLMENTS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY, -- String ID e.g., 'CS101'
    program_id INT REFERENCES programs(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL, 
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lecturer_assignments (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id INT REFERENCES lecturers(user_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_lecturer UNIQUE (course_id, lecturer_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_course_enrollment UNIQUE (student_id, course_id)
);

-- ==========================================================================
-- RESOURCES MANAGEMENT
-- ==========================================================================

CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- DBAC Tracking
    faculty_id INT REFERENCES faculties(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE SET NULL,
    
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'video', 'external_link', etc.
    file_size VARCHAR(50),
    version_number INT DEFAULT 1,
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_versions (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size VARCHAR(50),
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_download_logs (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS approved_domains (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    added_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- ASSIGNMENTS & SUBMISSIONS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    total_points INT DEFAULT 100 CHECK (total_points > 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- ==========================================================================
-- COMMUNICATION & TRACKING
-- ==========================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_course_attendance_date UNIQUE (student_id, course_id, date)
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_threads (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE SET NULL,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_chats (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    chat_mode VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- EFFICIENT DATABASE INDEXING FOR PRODUCTION PERFORMANCE
-- ==========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_program ON courses(program_id);
CREATE INDEX IF NOT EXISTS idx_resources_department ON resources(department_id);
CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_department ON forum_threads(department_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
