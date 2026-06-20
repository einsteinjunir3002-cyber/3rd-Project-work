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
