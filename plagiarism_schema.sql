-- ==========================================
-- SMARTLEARN PLAGIARISM SYSTEM SCHEMA
-- ==========================================

-- 1. Documents Repository (for corpus comparison)
CREATE TABLE IF NOT EXISTS public.plagiarism_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    source_type VARCHAR(50) DEFAULT 'Internal Repository',
    uploaded_by VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Scan Reports History
CREATE TABLE IF NOT EXISTS public.plagiarism_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    role VARCHAR(50),
    similarity_score INTEGER DEFAULT 0,
    originality_score INTEGER DEFAULT 100,
    ai_generated_likelihood INTEGER DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'Low',
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pre-populate some demo corpus documents for testing the similarity matcher
INSERT INTO public.plagiarism_documents (title, source_type, content) VALUES
('CS101 Assignment 1 — Kofi Mensah (2025)', 'Internal Repository', 'A control flow in programming is the order in which the computer executes statements in a script. Code is run in order from the first line in the file to the last line, unless the computer runs across the structures that change the control flow, such as conditionals and loops. Conditional statements check a boolean condition and can run different code depending on whether the condition is true or false. Loops repeat a block of code while a condition is true.'),
('ENG201 Project — Efua Ampah (2025)', 'Internal Repository', 'Software engineering is a systematic approach to the development, operation, and maintenance of software. It applies engineering principles to software development in a methodical way. The Agile methodology is a popular approach that promotes iterative development, team collaboration, flexibility, and continuous improvement throughout the project lifecycle. Scrum is a widely used Agile framework that organizes work in sprints of one to four weeks.'),
('Web Source [DEMO] — Introduction to OOP', 'Web Source (Demo)', 'Object-oriented programming is a programming paradigm based on the concept of objects, which can contain data in the form of fields and code in the form of procedures. A feature of objects is that an object procedure can access and often modify the data fields of the object with which they are associated. In OOP, computer programs are designed by making them out of objects that interact with one another.')
ON CONFLICT DO NOTHING;
