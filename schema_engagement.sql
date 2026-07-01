-- ============================================================
-- SMARTLEARN STUDENT-LECTURER ENGAGEMENT SYSTEM SCHEMA
-- ============================================================

-- 1. Lecturer Follows Table
CREATE TABLE IF NOT EXISTS public.lecturer_follows (
    student_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (student_id, lecturer_id)
);

-- 2. Academic Consultations / Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    topic VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Declined
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Academic Q&A Questions
CREATE TABLE IF NOT EXISTS public.qa_questions (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE
);

-- 4. Lecturer Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Academic Communities
CREATE TABLE IF NOT EXISTS public.communities (
    id SERIAL PRIMARY KEY,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Community Members
CREATE TABLE IF NOT EXISTS public.community_members (
    community_id INTEGER REFERENCES public.communities(id) ON DELETE CASCADE,
    student_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (community_id, student_id)
);

-- 7. Community Posts (Discussion Threads)
CREATE TABLE IF NOT EXISTS public.posts (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Post Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Post Reactions
CREATE TABLE IF NOT EXISTS public.reactions (
    post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL, -- like, heart, clap
    PRIMARY KEY (post_id, user_id, reaction_type)
);

-- 10. Insight Resources (Learning recommendations & Insights)
CREATE TABLE IF NOT EXISTS public.insights_resources (
    id SERIAL PRIMARY KEY,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- insight, resource
    url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Student Project Endorsements
CREATE TABLE IF NOT EXISTS public.endorsements (
    id SERIAL PRIMARY KEY,
    project_type VARCHAR(50) NOT NULL, -- startup, research
    project_id INTEGER NOT NULL,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    endorsement_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Personalized Student Feedback
CREATE TABLE IF NOT EXISTS public.personalized_feedback (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    lecturer_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Engagement Analytics
CREATE TABLE IF NOT EXISTS public.engagement_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    posts_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    appointments_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
