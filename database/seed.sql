-- ==========================================================================
-- SMARTLEARN AI - SEED DATA SCRIPT
-- Populates the required initial faculties, departments, programs, and courses
-- ==========================================================================

-- 1. FACULTIES
INSERT INTO faculties (id, code, name) VALUES
(1, 'FCIS', 'Faculty of Computing and Information Sciences'),
(2, 'FENG', 'Faculty of Engineering'),
(3, 'FANS', 'Faculty of Applied and Natural Sciences'),
(4, 'FLH',  'Faculty of Law and Humanities'),
(5, 'FBSS', 'Faculty of Business and Social Sciences')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences if necessary (optional depending on Postgres setup, but good practice for hardcoded IDs)
SELECT setval('faculties_id_seq', (SELECT MAX(id) FROM faculties));

-- 2. DEPARTMENTS
INSERT INTO departments (id, faculty_id, code, name) VALUES
-- FCIS
(1, 1, 'CS', 'Computer Science'),
(2, 1, 'SE', 'Software Engineering'),
(3, 1, 'IT', 'Information Technology'),
(4, 1, 'CYB', 'Cybersecurity'),
-- FENG
(5, 2, 'EE', 'Electrical Engineering'),
-- FANS
(6, 3, 'MS', 'Mathematics and Statistics'),
(7, 3, 'BIO', 'Biological Sciences'),
-- FLH
(8, 4, 'LAW', 'Law'),
(9, 4, 'ECS', 'English and Communication Studies'),
-- FBSS
(10, 5, 'BA', 'Business Administration'),
(11, 5, 'ECO', 'Economics')
ON CONFLICT (id) DO NOTHING;

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 3. PROGRAMS
INSERT INTO programs (id, department_id, code, name, type) VALUES
-- CS Programs
(1, 1, 'BSC-CS', 'BSc Computer Science', 'Degree'),
(2, 1, 'DIP-CS', 'Diploma in Computer Science', 'Diploma'),
-- SE Programs
(3, 2, 'BSC-SE', 'BSc Software Engineering', 'Degree'),
(4, 2, 'DIP-SE', 'Diploma in Software Engineering', 'Diploma'),
-- IT Programs
(5, 3, 'BSC-IT', 'BSc Information Technology', 'Degree'),
(6, 3, 'DIP-IT', 'Diploma in Information Technology', 'Diploma'),
-- CYBERSECURITY Programs
(7, 4, 'BSC-CYB', 'BSc Cybersecurity', 'Degree'),
(8, 4, 'DIP-CYB', 'Diploma in Cybersecurity', 'Diploma'),
-- EE Programs
(9, 5, 'BSC-EE', 'BSc Electrical Engineering', 'Degree'),
(10, 5, 'DIP-EE', 'Diploma in Electrical Engineering', 'Diploma'),
-- MS Programs
(11, 6, 'BSC-MATH', 'BSc Mathematics', 'Degree'),
(12, 6, 'BSC-STAT', 'BSc Statistics', 'Degree'),
-- BIO Programs
(13, 7, 'BSC-BIO', 'BSc Biological Sciences', 'Degree'),
(14, 7, 'DIP-BIO', 'Diploma in Biological Sciences', 'Diploma'),
-- LAW Programs
(15, 8, 'LLB', 'Bachelor of Laws (LLB)', 'Degree'),
(16, 8, 'DIP-LAW', 'Diploma in Legal Studies', 'Diploma'),
-- ECS Programs
(17, 9, 'BA-ENG', 'BA English Language', 'Degree'),
(18, 9, 'BA-COMM', 'BA Communication Studies', 'Degree'),
-- BA Programs
(19, 10, 'BBA', 'BBA Business Administration', 'Degree'),
(20, 10, 'DIP-BA', 'Diploma in Business Administration', 'Diploma'),
-- ECO Programs
(21, 11, 'BSC-ECO', 'BSc Economics', 'Degree'),
(22, 11, 'DIP-ECO', 'Diploma in Economics', 'Diploma')
ON CONFLICT (id) DO NOTHING;

SELECT setval('programs_id_seq', (SELECT MAX(id) FROM programs));

-- 4. COURSES
INSERT INTO courses (id, program_id, code, title, description) VALUES
-- COMPUTER SCIENCE (CS) - Attach to BSc Computer Science (Program 1)
('CS101', 1, 'CS101', 'Introduction to Programming', 'Fundamentals of programming'),
('CS102', 1, 'CS102', 'Data Structures and Algorithms', 'Core structures and algorithms'),
('CS201', 1, 'CS201', 'Database Systems', 'Relational database management'),
('CS202', 1, 'CS202', 'Operating Systems', 'OS principles and design'),
('CS301', 1, 'CS301', 'Artificial Intelligence', 'Introduction to AI and ML'),
('CS302', 1, 'CS302', 'Computer Networks', 'Networking concepts and protocols'),
('CS401', 1, 'CS401', 'Web Development', 'Modern web dev practices'),
('CS402', 1, 'CS402', 'Software Testing', 'QA and software testing principles'),

-- SOFTWARE ENGINEERING (SE) - Attach to BSc Software Engineering (Program 3)
('SE101', 3, 'SE101', 'Software Requirements Engineering', 'Gathering and analyzing requirements'),
('SE102', 3, 'SE102', 'Software Design and Architecture', 'Software design patterns'),
('SE201', 3, 'SE201', 'Agile Development', 'Agile methodologies'),
('SE202', 3, 'SE202', 'DevOps Engineering', 'CI/CD and infrastructure'),
('SE301', 3, 'SE301', 'Mobile Application Development', 'Building mobile apps'),
('SE302', 3, 'SE302', 'Cloud Computing', 'Cloud architectures'),
('SE401', 3, 'SE401', 'Quality Assurance', 'Software QA'),
('SE402', 3, 'SE402', 'Human Computer Interaction', 'UI/UX design principles'),

-- INFORMATION TECHNOLOGY (IT) - Attach to BSc IT (Program 5)
('IT101', 5, 'IT101', 'Information Systems', 'Intro to IS'),
('IT102', 5, 'IT102', 'Systems Administration', 'Managing IT systems'),
('IT201', 5, 'IT201', 'Network Administration', 'Managing enterprise networks'),
('IT202', 5, 'IT202', 'Database Administration', 'Managing databases'),
('IT301', 5, 'IT301', 'Cloud Infrastructure', 'Building cloud infra'),
('IT302', 5, 'IT302', 'Enterprise Computing', 'Enterprise architectures'),
('IT401', 5, 'IT401', 'IT Support Services', 'IT Service Management'),
('IT402', 5, 'IT402', 'Information Security', 'Securing IT systems'),

-- CYBERSECURITY (CYB) - Attach to BSc Cybersecurity (Program 7)
('CYB101', 7, 'CYB101', 'Ethical Hacking', 'Offensive security principles'),
('CYB102', 7, 'CYB102', 'Digital Forensics', 'Computer forensics and investigation'),
('CYB201', 7, 'CYB201', 'Network Security', 'Securing networks'),
('CYB202', 7, 'CYB202', 'Security Operations', 'SecOps and SIEM'),
('CYB301', 7, 'CYB301', 'Cryptography', 'Cryptographic systems'),
('CYB302', 7, 'CYB302', 'Secure Software Development', 'AppSec'),
('CYB401', 7, 'CYB401', 'Cyber Risk Management', 'Managing cyber risks'),
('CYB402', 7, 'CYB402', 'Incident Response', 'Responding to breaches'),

-- ELECTRICAL ENGINEERING (EE) - Attach to BSc EE (Program 9)
('EE101', 9, 'EE101', 'Circuit Analysis', 'Analyzing electrical circuits'),
('EE102', 9, 'EE102', 'Digital Electronics', 'Digital logic and circuits'),
('EE201', 9, 'EE201', 'Power Systems', 'Power generation and distribution'),
('EE202', 9, 'EE202', 'Control Systems', 'Control theory'),
('EE301', 9, 'EE301', 'Electromagnetics', 'Electromagnetic fields'),
('EE302', 9, 'EE302', 'Embedded Systems', 'Microcontrollers and IoT'),
('EE401', 9, 'EE401', 'Renewable Energy Systems', 'Solar, wind, etc.'),
('EE402', 9, 'EE402', 'Electrical Machines', 'Motors and generators'),

-- MATHEMATICS AND STATISTICS (MS) - Attach to BSc Math (Program 11) & BSc Stat (Program 12)
('MATH101', 11, 'MATH101', 'Calculus', 'Differential and integral calculus'),
('MATH102', 11, 'MATH102', 'Linear Algebra', 'Vectors and matrices'),
('STAT201', 12, 'STAT201', 'Probability Theory', 'Probability concepts'),
('STAT202', 12, 'STAT202', 'Statistical Inference', 'Inferential statistics'),
('MATH301', 11, 'MATH301', 'Numerical Methods', 'Numerical approximations'),
('MATH302', 11, 'MATH302', 'Operations Research', 'Optimization'),
('STAT401', 12, 'STAT401', 'Regression Analysis', 'Linear and non-linear regression'),
('MATH402', 11, 'MATH402', 'Mathematical Modelling', 'Modelling real-world problems'),

-- BIOLOGICAL SCIENCES (BIO) - Attach to BSc BIO (Program 13)
('BIO101', 13, 'BIO101', 'Cell Biology', 'Cellular structure and function'),
('BIO102', 13, 'BIO102', 'Genetics', 'Heredity and variation'),
('BIO201', 13, 'BIO201', 'Microbiology', 'Study of microorganisms'),
('BIO202', 13, 'BIO202', 'Ecology', 'Organisms and their environment'),
('BIO301', 13, 'BIO301', 'Biochemistry', 'Chemical processes in living organisms'),
('BIO302', 13, 'BIO302', 'Human Anatomy', 'Structure of the human body'),
('BIO401', 13, 'BIO401', 'Physiology', 'Functions of the human body'),
('BIO402', 13, 'BIO402', 'Biotechnology', 'Technological applications of biology'),

-- LAW (LAW) - Attach to LLB (Program 15)
('LAW101', 15, 'LAW101', 'Constitutional Law', 'Study of the constitution'),
('LAW102', 15, 'LAW102', 'Criminal Law', 'Offenses and punishments'),
('LAW201', 15, 'LAW201', 'Contract Law', 'Agreements and obligations'),
('LAW202', 15, 'LAW202', 'International Law', 'Law among nations'),
('LAW301', 15, 'LAW301', 'Property Law', 'Ownership and rights'),
('LAW302', 15, 'LAW302', 'Legal Research Methods', 'Researching the law'),
('LAW401', 15, 'LAW401', 'Human Rights Law', 'Fundamental rights'),
('LAW402', 15, 'LAW402', 'Administrative Law', 'Law of government agencies'),

-- ENGLISH AND COMMUNICATION STUDIES (ECS) - Attach to BA English (Program 17) & BA Comm (Program 18)
('ENG101', 17, 'ENG101', 'Academic Writing', 'Writing for academia'),
('COM102', 18, 'COM102', 'Media Studies', 'Mass media and society'),
('COM201', 18, 'COM201', 'Public Relations', 'Managing corporate image'),
('ENG202', 17, 'ENG202', 'Linguistics', 'Study of language'),
('COM301', 18, 'COM301', 'Communication Theory', 'Theories of communication'),
('ENG302', 17, 'ENG302', 'Creative Writing', 'Writing fiction and poetry'),
('COM401', 18, 'COM401', 'Journalism', 'News reporting and writing'),
('COM402', 18, 'COM402', 'Intercultural Communication', 'Communicating across cultures'),

-- BUSINESS ADMINISTRATION (BA) - Attach to BBA (Program 19)
('BA101', 19, 'BA101', 'Principles of Management', 'Fundamentals of managing orgs'),
('BA102', 19, 'BA102', 'Financial Accounting', 'Accounting principles'),
('BA201', 19, 'BA201', 'Human Resource Management', 'Managing people'),
('BA202', 19, 'BA202', 'Marketing Management', 'Marketing strategies'),
('BA301', 19, 'BA301', 'Entrepreneurship', 'Starting a business'),
('BA302', 19, 'BA302', 'Business Analytics', 'Data-driven business decisions'),
('BA401', 19, 'BA401', 'Operations Management', 'Managing operations'),
('BA402', 19, 'BA402', 'Strategic Management', 'Corporate strategy'),

-- ECONOMICS (ECO) - Attach to BSc Economics (Program 21)
('ECO101', 21, 'ECO101', 'Microeconomics', 'Individual and firm behavior'),
('ECO102', 21, 'ECO102', 'Macroeconomics', 'Economy-wide phenomena'),
('ECO201', 21, 'ECO201', 'Econometrics', 'Statistical methods in economics'),
('ECO202', 21, 'ECO202', 'Development Economics', 'Economic development'),
('ECO301', 21, 'ECO301', 'International Trade', 'Global trade theories'),
('ECO302', 21, 'ECO302', 'Public Finance', 'Government revenue and expenditure'),
('ECO401', 21, 'ECO401', 'Monetary Economics', 'Money and banking'),
('ECO402', 21, 'ECO402', 'Economic Policy Analysis', 'Evaluating policies')
ON CONFLICT (id) DO NOTHING;
