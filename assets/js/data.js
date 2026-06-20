/* SMARTLEARN AI - STATIC DATABASES & CONFIGURATIONS */

const D = {
  get: id => document.getElementById(id),
  val: (id, v) => { const el = document.getElementById(id); if (el) { if (v !== undefined) el.value = v; return el.value; } },
  html: (id, h) => { const el = document.getElementById(id); if (el) el.innerHTML = h; },
  show: (id, s = true) => { const el = document.getElementById(id); if (el) el.style.display = s ? (id.includes('modal') || id.includes('indicator') ? 'flex' : 'block') : 'none'; }
};

const SYSTEM_PERMANENT_CONFIG = {
  provider: 'groq',
  apiKey: atob('Z3NrX3FOVnNGcnk1b2Y4N0VqZlFqYmV6V0dkeWIzRllLNTZNZENvUlVCMktpUDNlcjFjYjVHUXA='),
  model: 'llama-3.1-8b-instant'
};

const PROGRAM_ABBREVIATIONS = {
  'BSc Computer Science': 'csc',
  'BSc Software Engineering': 'sen',
  'BSc Cybersecurity': 'cys',
  'BSc Data Science': 'dsc',
  'BSc Business Administration': 'bua',
  'BSc Electrical Engineering': 'ele',
  'Bachelor of Laws (LLB)': 'law',
  'BSc Nursing & Allied Health': 'nur',
  'BSc Mechanical Engineering': 'mec',
  'Medicine & Surgery (MBChB)': 'med',
  'Doctor of Pharmacy (PharmD)': 'pha',
  'BSc Architecture & Design': 'arc',
  'BA Economics & Public Policy': 'eco'
};

const SMARTLEARN_STATIC_DATA = {
  students: [
    { id: 'user_std_1', name: 'Kofi Mensah', email: 'stu@smartlearn.edu', courses: 'CS101, ENG201', attendance: 95, cgpa: 3.82, status: 'Good Stand' },
    { id: 'user_std_2', name: 'Efua Ampah', email: 'efua@smartlearn.edu', courses: 'CS101, BUA202', attendance: 88, cgpa: 3.10, status: 'Good Stand' },
    { id: 'user_std_3', name: 'Joseph Addo', email: 'joseph@smartlearn.edu', courses: 'CS101, MATH102', attendance: 65, cgpa: 1.95, status: 'Needs Help' }
  ],
  facultyContacts: [
    { name: 'Dr. Kwame Mensah', role: 'CS101 Coordinator', email: 'k.mensah@smartlearn.edu', status: 'Online', avatar: 'avatar_lecturer.jpg', room: 'RM 302', hours: 'Tuesdays 2:00 PM - 4:00 PM' },
    { name: 'Prof. Ama Serwaa', role: 'Calculus Lead', email: 'a.serwaa@smartlearn.edu', status: 'Online', avatar: 'avatar_lecturer.jpg', room: 'RM 412', hours: 'Mon/Wed 10:00 AM - 12:00 PM' },
    { name: 'Joseph Addo (TA)', role: 'CS & Software Eng TA', email: 'j.addo@smartlearn.edu', status: 'Online', avatar: 'avatar_student.jpg', room: 'ICT Lab B', hours: 'Fridays 3:00 PM - 5:00 PM' }
  ],
  facultyChats: {
    'k.mensah@smartlearn.edu': [{ sender: 'faculty', text: 'Hello Kofi! Welcome to CS101 consultation channel. How can I help you today?', timestamp: '2 hours ago' }],
    'a.serwaa@smartlearn.edu': [{ sender: 'faculty', text: 'Hi Kofi, regarding the Calculus problem set, limits and continuity are core. Let me know if you want to walk through the questions.', timestamp: '1 day ago' }],
    'j.addo@smartlearn.edu': [{ sender: 'faculty', text: 'Hey Kofi, I graded the latest UML assignment. Good job on classes! Let me know if you need help with sequences.', timestamp: '3 hours ago' }]
  }, activeFacultyEmail: 'k.mensah@smartlearn.edu',
  courses: [
    { id: 'CS101', title: 'Introduction to Computer Science & Coding', code: 'CS101', instructor: 'Dr. Kwame Mensah', avatar: 'avatar_lecturer.jpg', notesCount: 5, assignmentsCount: 3, program: 'BSc Computer Science' },
    { id: 'MATH102', title: 'Calculus & Applied Mathematics', code: 'MATH102', instructor: 'Prof. Ama Serwaa', avatar: 'avatar_lecturer.jpg', notesCount: 3, assignmentsCount: 2, program: 'BSc Computer Science' },
    { id: 'ENG201', title: 'Software Engineering & Architectures', code: 'ENG201', instructor: 'Mr. Emmanuel Osei', avatar: 'avatar_lecturer.jpg', notesCount: 6, assignmentsCount: 2, program: 'BSc Software Engineering' },
    { id: 'BUA202', title: 'Business Administration & Management', code: 'BUA202', instructor: 'Dr. Sophia Tetteh', avatar: 'avatar_lecturer.jpg', notesCount: 3, assignmentsCount: 1, program: 'BSc Business Administration' },
    
    // Program Courses mappings
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
  ],
  notes: [
    { id: 1, courseId: 'CS101', title: 'Lec 1: Fundamentals of Python & Control Structures.pdf', date: '2026-05-15', size: '356 KB' },
    { id: 2, courseId: 'CS101', title: 'Lec 2: Object Oriented Programming in Python.pdf', date: '2026-05-20', size: '6.5 MB' },
    { id: 3, courseId: 'MATH102', title: 'Lec 1: Derivatives and Rate of Changes.pdf', date: '2026-05-12', size: '219 KB' },
    { id: 4, courseId: 'ENG201', title: 'Lec 1: Intro to Agile Methodologies & Scrum.pdf', date: '2026-05-18', size: '352 KB' },
    { id: 5, courseId: 'CS101', title: 'Lec 3: Python Programming Basics.pdf', date: '2026-05-22', size: '328 KB' },
    { id: 6, courseId: 'CS101', title: 'Cheat Sheet: Python Syntax & Operations.pdf', date: '2026-05-23', size: '328 KB' },
    { id: 7, courseId: 'MATH102', title: 'Lec 2: Functions, Limits, & Continuity.pdf', date: '2026-05-16', size: '837 KB' },
    { id: 8, courseId: 'MATH102', title: 'Cheat Sheet: Key Calculus Limits & Formulas.pdf', date: '2026-05-17', size: '1.9 MB' },
    { id: 9, courseId: 'BUA202', title: 'Lec 1: Fundamentals of Management & Business Operations.pdf', date: '2026-05-19', size: '204 KB' },
    
    // Program notes mapping to local PDFs
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
  ],
  assignments: [
    { id: 1, courseId: 'CS101', title: 'Assignment 1: Logic Gates & Basic Control Flows', deadline: '2026-05-28', totalPoints: 100, status: 'Pending' },
    { id: 2, courseId: 'ENG201', title: 'Assignment 2: Drawing UML Diagrams', deadline: '2026-06-02', totalPoints: 100, status: 'Submitted', grade: '95', feedback: 'Excellent layout of class diagrams!' },
    { id: 3, courseId: 'MATH102', title: 'Problem Set 1: Matrix Inversion & Linear Systems', deadline: '2026-05-30', totalPoints: 50, status: 'Pending' },
    { id: 4, courseId: 'CS101', title: 'Assignment 4: Control Flows & Functions', deadline: '2026-05-25', totalPoints: 100, status: 'Submitted', grade: '88', feedback: 'Great work on functions!' },
    { id: 5, courseId: 'MATH102', title: 'Assignment 5: Advanced Integration Techniques', deadline: '2026-05-31', totalPoints: 100, status: 'Pending' },
    { id: 6, courseId: 'ENG201', title: 'Assignment 6: Architectural Patterns', deadline: '2026-05-15', totalPoints: 100, status: 'Pending' },
    { id: 7, courseId: 'CS101', title: 'Assignment 7: Data Structures & Algorithms', deadline: '2026-05-10', totalPoints: 100, status: 'Submitted', grade: '90', feedback: 'Good implementation of binary search tree.' }
  ],
  submissions: [
    { id: 1, assignmentId: 2, studentName: 'Kofi Mensah', fileName: 'uml_diagrams_kofi.pdf', date: '2026-05-22', grade: '95', feedback: 'Excellent layout of class diagrams!' },
    { id: 2, assignmentId: 4, studentName: 'Kofi Mensah', fileName: 'control_flows_kofi.pdf', date: '2026-05-25 11:15 AM', grade: '88', feedback: 'Great work on functions!' },
    { id: 3, assignmentId: 7, studentName: 'Kofi Mensah', fileName: 'data_structures_kofi.pdf', date: '2026-05-12 02:30 PM', grade: '90', feedback: 'Good implementation of binary search tree.' }
  ],
  forumThreads: [
    { id: 1, category: 'Computer Science', author: 'Kofi Mensah', avatar: 'avatar_student.jpg', title: 'Struggling with Recursion in Python - Need help!', body: 'Hi everyone, I am trying to understand the base case in recursive functions. My function keeps hitting infinite loops. Can anyone explain how to prevent stack overflow?', upvotes: 14, replies: [{ author: 'Mr. Emmanuel Osei', avatar: 'avatar_lecturer.jpg', role: 'Lecturer', body: 'Think of the base case as the exit door. You must structure your arguments so they get closer to that door on each step. Try writing down the inputs step-by-step.' }] },
    { id: 2, category: 'Business', author: 'Efua Ampah', avatar: 'avatar_student.jpg', title: 'Top Entrepreneurship models in Ghana', body: 'What are the main financial models local startups are using to raise capital in Accra? Would love some case studies.', upvotes: 8, replies: [] }
  ],
  notifications: [
    { id: 1, text: 'Lecturer graded assignment: Assignment 2 (Grade: 95/100)', date: '2 hours ago', unread: true },
    { id: 2, text: 'New notes uploaded: Intro to Agile Methodologies & Scrum', date: '1 day ago', unread: false }
  ],
  careersDb: {
    programming: { programs: ['Computer Science', 'Software Engineering', 'Cybersecurity'], universities: ['Ashesi University', 'KNUST', 'University of Ghana'], description: 'You have strong logic, problem solving and coding capabilities. You are built for building digital infrastructure.', demand: 'Critically High (92% employment rate)', salary: 'GH₵ 8,000 - GH₵ 20,000+ / mo', skills: ['Algorithms', 'Python/JS', 'Data Structures', 'Git'] },
    business: { programs: ['Business Administration', 'Finance & Accounting', 'Economics & Public Policy', 'Marketing & Sales'], universities: ['UPSA', 'University of Ghana', 'Central University'], description: 'You are highly business-oriented, structured, and an excellent planner and communicator.', demand: 'High (80% employment rate)', salary: 'GH₵ 6,000 - GH₵ 16,000 / mo', skills: ['Leadership', 'Financial Analysis', 'Excel Modeling', 'Pitching'] },
    datascience: { programs: ['Data Science', 'Statistics', 'Mathematics'], universities: ['KNUST', 'University of Ghana'], description: 'You are passionate about finding hidden patterns in large sets of numbers and building predictions.', demand: 'Extremely High (88% employment rate)', salary: 'GH₵ 9,000 - GH₵ 22,000 / mo', skills: ['Data Mining', 'SQL', 'R/Python', 'Machine Learning'] },
    engineering: { programs: ['Electrical & Electronic Engineering', 'Mechanical Engineering', 'Architecture & Design'], universities: ['KNUST', 'Ashesi University', 'University of Ghana'], description: 'You are passionate about physical hardware, electrical circuitry, system control, and machine logistics.', demand: 'High (85% employment rate)', salary: 'GH₵ 7,500 - GH₵ 20,000 / mo', skills: ['Circuit Analysis', 'CAD Modeling', 'Thermodynamics', 'Signal Processing'] },
    healthcare: { programs: ['Medicine & Surgery (MBChB)', 'Nursing & Allied Health', 'Pharmacy (PharmD)'], universities: ['University of Ghana', 'KNUST', 'UCC'], description: 'You are deeply caring, methodical, and excel in clinical treatment, biological sciences, and health administration.', demand: 'Extremely High (95% employment rate)', salary: 'GH₵ 5,000 - GH₵ 30,000 / mo', skills: ['Patient Care', 'Clinical Anatomy', 'Pharmacology', 'Ethics'] },
    law: { programs: ['Bachelor of Laws (LLB)', 'Political Science & Law'], universities: ['University of Ghana', 'KNUST', 'GIMPA'], description: 'You have outstanding writing, debate, research, and analysis skills. You seek to interpret legal frameworks and advocate for rights.', demand: 'High (82% employment rate)', salary: 'GH₵ 8,000 - GH₵ 25,000 / mo', skills: ['Litigation', 'Legal Research', 'Constitutional Law', 'Debating'] }
  },
  universities: [
    { id: "ug", name: "University of Ghana (UG)", ranking: 1, image: "picture/ug_campus.jpg", type: "Public", location: "Legon, Accra", established: 1948, academicsInfo: "Renowned for arts, sciences, medicine, law. Premier university in Ghana.", performanceReview: "Highly ranked in West Africa for research productivity and citation impact.", feesRange: "GH₵ 3,500 - GH₵ 7,500 / year", scholarshipsInfo: "UG Financial Aid, MasterCard Scholars, corporate bursaries.", programsOffered: ["Bachelor of Laws (LLB)", "BSc Computer Science", "Bachelor of Medicine", "BSc Business Admin"], admissionRequirements: "WASSCE: English, Maths, Science plus 3 electives with aggregate <= 24." },
    { id: "knust", name: "Kwame Nkrumah University of Science and Technology (KNUST)", ranking: 2, image: "picture/knust_campus.jpg", type: "Public", location: "Kumasi, Ashanti Region", established: 1951, academicsInfo: "Leading science and technology education. Strong engineering and pharmacy.", performanceReview: "Exceptional output in technical innovations and engineering patents.", feesRange: "GH₵ 3,800 - GH₵ 8,500 / year", scholarshipsInfo: "MasterCard Foundation, Vice-Chancellor's Fund, GETFund.", programsOffered: ["BSc Civil Engineering", "BSc Computer Engineering", "Doctor of Pharmacy"], admissionRequirements: "WASSCE: Credits in English, Core Maths, Integrated Science, and 3 Electives, aggregate <= 24." },
    { id: "ucc", name: "University of Cape Coast (UCC)", ranking: 3, image: "picture/ucc_campus.jpg", type: "Public", location: "Cape Coast, Central Region", established: 1962, academicsInfo: "Famous for teacher training, business, agriculture, medical education.", performanceReview: "Consistently ranked top for research influence and pedagogical training.", feesRange: "GH₵ 3,400 - GH₵ 7,200 / year", scholarshipsInfo: "UCC Support Office, district assembly grants, Kakum bursaries.", programsOffered: ["BEd Computer Science", "BSc Accounting and Finance", "Bachelor of Medicine"], admissionRequirements: "WASSCE: Credits in English, Core Maths, Science, 3 electives, aggregate <= 24." },
    { id: "uds", name: "University for Development Studies (UDS)", ranking: 4, image: "picture/uds_campus.jpg", type: "Public", location: "Tamale, Northern Region", established: 1992, academicsInfo: "Pioneered community field program. Specialized in health, agriculture, development.", performanceReview: "High community impact through student-led rural development audits.", feesRange: "GH₵ 2,800 - GH₵ 6,000 / year", scholarshipsInfo: "Northern Development Authority, WHO sponsorships, UDS aid.", programsOffered: ["Doctor of Medicine (MD)", "BSc Agriculture", "BSc Development Studies"], admissionRequirements: "WASSCE: Credits in English, Maths, Science, 3 electives, aggregate <= 24." },
    { id: "uew", name: "University of Education, Winneba (UEW)", ranking: 5, image: "picture/uew_campus.jpg", type: "Public", location: "Winneba, Central Region", established: 1992, academicsInfo: "Specialized in training teachers and education professionals in Ghana.", performanceReview: "Primary driver of national teacher training and educational research.", feesRange: "GH₵ 2,900 - GH₵ 5,500 / year", scholarshipsInfo: "GETFund, UEW bursaries, local teacher financial aids.", programsOffered: ["BEd Mathematics", "BEd English", "BSc IT Education"], admissionRequirements: "WASSCE: Passes in English, Maths, Science, plus 3 teaching electives." },
    { id: "gimpa", name: "Ghana Institute of Management and Public Administration (GIMPA)", ranking: 6, image: "picture/gimpa_campus.jpg", type: "Public", location: "Greenhill, Accra", established: 1961, academicsInfo: "Elite business school for public administration and corporate governance.", performanceReview: "Top executive school, popular with corporate managers and public leaders.", feesRange: "GH₵ 6,000 - GH₵ 12,000 / year", scholarshipsInfo: "GIMPA Executive Sponsorships, public service packages, merit bursaries.", programsOffered: ["Bachelor of Laws (LLB)", "BSc Business Admin", "BSc IT"], admissionRequirements: "WASSCE: Credits in English, Core Maths, plus 3 electives." },
    { id: "upsa", name: "University of Professional Studies, Accra (UPSA)", ranking: 7, image: "picture/upsa_campus.jpg", type: "Public", location: "Madina, Accra", established: 1965, academicsInfo: "Combines professional practice with marketing, accounting, business.", performanceReview: "Renowned for high professional exam pass rates (ACCA, CIM, ICAG).", feesRange: "GH₵ 3,200 - GH₵ 6,800 / year", scholarshipsInfo: "UPSA VC Endowment Fund, corporate sponsorships, union grants.", programsOffered: ["BSc Accounting", "BSc Marketing", "BSc Business Economics"], admissionRequirements: "WASSCE: 3 credit passes in core subjects plus 3 electives." },
    { id: "umat", name: "University of Mines and Technology (UMaT)", ranking: 8, image: "picture/umat_campus.jpg", type: "Public", location: "Tarkwa, Western Region", established: 2004, academicsInfo: "Specialized mining engineering and petroleum geology studies.", performanceReview: "World-class lab facilities and high placement rate in global mining firms.", feesRange: "GH₵ 3,900 - GH₵ 8,200 / year", scholarshipsInfo: "Ghana Chamber of Mines, corporate sponsorships, development aids.", programsOffered: ["BSc Mining Engineering", "BSc Geological Engineering", "BSc Petroleum Engineering"], admissionRequirements: "WASSCE: Credits in English, Maths, Physics, Chemistry, and Elective Maths." },
    { id: "uhas", name: "University of Health and Allied Sciences (UHAS)", ranking: 9, image: "picture/uhas_campus.jpg", type: "Public", location: "Ho, Volta Region", established: 2011, academicsInfo: "Dedicated exclusively to health professional training and medical research.", performanceReview: "Highly competitive entry and strong clinical training with teaching hospitals.", feesRange: "GH₵ 4,200 - GH₵ 9,000 / year", scholarshipsInfo: "Ministry of Health bursaries, Volta Region grants, UHAS endowments.", programsOffered: ["Medicine & Surgery", "Doctor of Pharmacy", "BSc General Nursing"], admissionRequirements: "WASSCE: Credits in English, Maths, Science, Biology, Chemistry, Physics, aggregate <= 15." },
    { id: "uenr", name: "University of Energy and Natural Resources (UENR)", ranking: 10, image: "picture/uenr_campus.jpg", type: "Public", location: "Sunyani, Bono Region", established: 2011, academicsInfo: "Focused on national energy solutions and natural resources management.", performanceReview: "Leader in renewable energy research and forestry tracking systems.", feesRange: "GH₵ 3,100 - GH₵ 6,900 / year", scholarshipsInfo: "UENR Energy Research, environmental NGO grants, Ministry scholarships.", programsOffered: ["BSc Renewable Energy", "BSc Natural Resources", "BSc Computer Science"], admissionRequirements: "WASSCE: Credits in English, Core Maths, Integrated Science, 3 electives." },
    { id: "central", name: "Central University", ranking: 11, image: "picture/central_campus.jpg", type: "Private", location: "Miotso, Greater Accra", established: 1998, academicsInfo: "Largest private university in Ghana, owned by ICGC.", performanceReview: "Strong industry links in banking and media, large modern campus.", feesRange: "GH₵ 7,500 - GH₵ 14,000 / year", scholarshipsInfo: "ICGC Educational Grants, Central aid, Chancellor's Scholarships.", programsOffered: ["Doctor of Pharmacy", "BSc Architecture", "BSc Computer Science"], admissionRequirements: "WASSCE: Credits in 6 subjects including Core Mathematics and English." },
    { id: "kstu", name: "Kumasi Technical University (KsTU)", ranking: 12, image: "picture/kstu_campus.jpg", type: "Public", location: "Kumasi, Ashanti Region", established: 1954, academicsInfo: "Leading vocational-technical education in the middle belt.", performanceReview: "Excellent output in solar energy courses and TVET competitions.", feesRange: "GH₵ 2,600 - GH₵ 5,000 / year", scholarshipsInfo: "KsTU Student Aid, MasterCard Foundation, GETFund allocations.", programsOffered: ["BTech Electrical Engineering", "BTech Building Technology", "BTech Computer Science"], admissionRequirements: "WASSCE: 6 credit passes including Maths and English." },
    { id: "pentecost", name: "Pentecost University", ranking: 13, image: "picture/pentecost_campus.jpg", type: "Private", location: "Sowutuom, Accra", established: 2003, academicsInfo: "Ethical leadership, business, health sciences, construction studies.", performanceReview: "Strong nurse licensing pass rates, international partnerships.", feesRange: "GH₵ 5,500 - GH₵ 9,500 / year", scholarshipsInfo: "Pentecost Church Fund, Work-Study, leadership merit grants.", programsOffered: ["BSc Nursing", "BSc Physician Assistant", "BSc Computer Science"], admissionRequirements: "WASSCE: Credits in English, Maths, Science, plus 3 electives." },
    { id: "atu", name: "Accra Technical University (ATU)", ranking: 14, image: "picture/atu_campus.jpg", type: "Public", location: "Barnes Road, Accra", established: 1949, academicsInfo: "Premier technical university in Ghana focusing on TVET.", performanceReview: "Pioneered industrial internships and practical engineering training.", feesRange: "GH₵ 2,500 - GH₵ 4,800 / year", scholarshipsInfo: "Government TVET grants, ATU Welfare loans, industrial sponsorships.", programsOffered: ["BTech Mechanical Engineering", "BTech Civil Engineering", "BTech Computer Science"], admissionRequirements: "WASSCE: 6 credit passes including English and Mathematics." },
    { id: "htu", name: "Ho Technical University (HTU)", ranking: 15, image: "picture/ho_campus.jpg", type: "Public", location: "Ho, Volta Region", established: 1968, academicsInfo: "Renowned for food science, hospitality, fashion, agricultural tech.", performanceReview: "Leader in hospitality education, running student training hotels.", feesRange: "GH₵ 2,200 - GH₵ 4,300 / year", scholarshipsInfo: "HTU Financial Aid Scheme, local tourism board grants.", programsOffered: ["BTech Hospitality", "BTech Agro-Enterprise", "BTech Fashion Design"], admissionRequirements: "WASSCE: 6 credit passes including English and Core Mathematics." },
    { id: "cug", name: "Catholic University of Ghana (CUG)", ranking: 16, image: "picture/catholic_campus.jpg", type: "Private", location: "Fiapre, Sunyani", established: 2003, academicsInfo: "Focuses on moral and academic nursing, health, business training.", performanceReview: "Recognized for high ethical standards in regional public hospitals.", feesRange: "GH₵ 5,400 - GH₵ 8,900 / year", scholarshipsInfo: "Catholic Secretariat Bursaries, CUG Needy Students Fund.", programsOffered: ["BSc Computer Science", "BSc Public Health", "BSc Business Admin"], admissionRequirements: "WASSCE: 6 credit passes including Core English and Core Mathematics." },
    { id: "ttu", name: "Takoradi Technical University (TTU)", ranking: 18, image: "picture/ttu_campus.jpg", type: "Public", location: "Takoradi, Western Region", established: 1954, academicsInfo: "Pioneers technical courses for petroleum and gas industries.", performanceReview: "Offshore drilling oil-hub placement partnerships.", feesRange: "GH₵ 2,500 - GH₵ 4,900 / year", scholarshipsInfo: "GASSUP Petroleum Scholarships, Takoradi Chamber grants.", programsOffered: ["BTech Petroleum Engineering", "BTech Mechanical Engineering", "BTech Electrical Technology"], admissionRequirements: "WASSCE: Credits in Maths, English, Science, and 3 electives." },
    { id: "pug", name: "Presbyterian University Ghana (PUG)", ranking: 21, image: "picture/pug_campus.jpg", type: "Private", location: "Abetifi-Kwahu, Eastern Region", established: 2003, academicsInfo: "Multi-campus Christian academic training and nursing studies.", performanceReview: "Highly disciplined and top-rated quality private university in Ghana.", feesRange: "GH₵ 5,800 - GH₵ 9,800 / year", scholarshipsInfo: "Presbyterian Church Scholarships, PUG student subsidies.", programsOffered: ["BSc Nursing", "BSc IT", "BSc Physician Assistantship"], admissionRequirements: "WASSCE: 6 credit passes including core English and Mathematics." },
    { id: "cctu", name: "Cape Coast Technical University (CCTU)", ranking: 22, image: "picture/cctu_campus.jpg", type: "Public", location: "Cape Coast, Central Region", established: 1984, academicsInfo: "Engineering, applied sciences, TVET, and renewable green energy.", performanceReview: "Resource center for vocational training in southern Ghana.", feesRange: "GH₵ 2,300 - GH₵ 4,600 / year", scholarshipsInfo: "Government TVET support, CCTU Student Aid, tourism grants.", programsOffered: ["BTech Renewable Energy", "BTech Civil Engineering", "BTech Hospitality Management"], admissionRequirements: "WASSCE: Credits in English, Mathematics, Science, 3 electives." },
    { id: "methodist", name: "Methodist University Ghana (MUG)", ranking: 25, image: "picture/methodist_campus.jpg", type: "Private", location: "Dansoman, Accra", established: 2000, academicsInfo: "Excellent psychology, business administration, and accounting.", performanceReview: "Serene campus environment and active corporate placements office.", feesRange: "GH₵ 5,200 - GH₵ 9,000 / year", scholarshipsInfo: "Methodist Church Fund, Work-Study, district welfare grants.", programsOffered: ["BSc Psychology", "BBA Accounting", "BSc Information Technology"], admissionRequirements: "WASSCE: Credits in English, Maths, Science/Social, 3 electives." },
    { id: "ashesi", name: "Ashesi University", ranking: 27, image: "picture/ashesi_campus.jpg", type: "Private", location: "Berekuso, Eastern Region", established: 2002, academicsInfo: "Strict honor code, liberal arts, leadership, tech, business.", performanceReview: "Global acclaim for student career placements and modern green campus.", feesRange: "GH₵ 48,000 / year", scholarshipsInfo: "100% need-based scholarships, Ashesi Foundation, MasterCard.", programsOffered: ["BSc Computer Science", "BSc MIS", "BSc Business Admin", "BSc Mechanical Eng"], admissionRequirements: "WASSCE: Credits in Maths, English, plus essays and interview." },
    { id: "anu", name: "All Nations University (ANU)", ranking: 28, image: "picture/anu_campus.jpg", type: "Private", location: "Koforidua, Eastern Region", established: 2002, academicsInfo: "Famous for satellite space science and tech engineering.", performanceReview: "Built and launched Ghana's first educational satellite.", feesRange: "GH₵ 6,000 - GH₵ 10,500 / year", scholarshipsInfo: "ANU Space Research Scholarship, leadership grants.", programsOffered: ["BSc Electronics & Comm Engineering", "BSc Computer Science", "BSc Nursing"], admissionRequirements: "WASSCE: 6 credits including English, Core Maths, and Science." },
    { id: "vvu", name: "Valley View University (VVU)", ranking: 33, image: "picture/vvu_campus.jpg", type: "Private", location: "Oyibi, Greater Accra", established: 1979, academicsInfo: "First chartered private university. Seventh-day Adventist ethics.", performanceReview: "Strong IT graduate foundation with high ethical industry standards.", feesRange: "GH₵ 6,500 - GH₵ 10,000 / year", scholarshipsInfo: "SDA Church grants, VVU Work-Study, academic scholarships.", programsOffered: ["BSc Computer Science", "BSc IT", "BSc Nursing"], admissionRequirements: "WASSCE: Credit passes in 3 core subjects and 3 electives." },
    { id: "regent", name: "Regent University College of Science and Technology", ranking: 37, image: "picture/regent_campus.jpg", type: "Private", location: "McCarthy Hill, Accra", established: 2003, academicsInfo: "ICT, telecom engineering, business banking studies in Accra.", performanceReview: "High placement rate in telecommunications and software banks.", feesRange: "GH₵ 5,500 - GH₵ 9,000 / year", scholarshipsInfo: "Regent Institutional Aid, corporate telecom bursaries.", programsOffered: ["BSc Computer Science", "BSc Telecom Engineering", "BBA Banking & Finance"], admissionRequirements: "WASSCE: Credits in English, Core Maths, Science/Physics, 3 electives." },
    { id: "ktu", name: "Koforidua Technical University (KTU)", ranking: 40, image: "picture/ktu_campus.jpg", type: "Public", location: "Koforidua, Eastern Region", established: 1997, academicsInfo: "Technical entrepreneurship, EV automotive prototypes, computer science.", performanceReview: "Gained national acclaim for building electric vehicle prototypes.", feesRange: "GH₵ 2,400 - GH₵ 4,500 / year", scholarshipsInfo: "KTU Financial Aid, local mining corporate bursaries.", programsOffered: ["BTech Computer Science", "BTech Biomedical Engineering", "BTech Automotive Engineering"], admissionRequirements: "WASSCE: Credits in English, Maths, Science, plus 3 electives." },
    { id: "lancaster", name: "Lancaster University Ghana", ranking: 42, image: "picture/lancaster_campus.jpg", type: "Private", location: "East Legon, Accra", established: 2013, academicsInfo: "UK-accredited university offering British degree standards locally.", performanceReview: "Excellent global curriculum and foreign exchange studies.", feesRange: "GH₵ 45,000 - GH₵ 60,000 / year", scholarshipsInfo: "Lancaster Global Scholarship, merit discounts, corporate aids.", programsOffered: ["BSc Computer Science", "Bachelor of Laws (LLB)", "BSc Business Studies"], admissionRequirements: "WASSCE/A-Levels: 6 credits in WASSCE or 3 B grades in A-levels." },
    { id: "bluecrest", name: "BlueCrest University College", ranking: 43, image: "picture/bluecrest_campus.jpg", type: "Private", location: "Kokomlemle, Accra", established: 1999, academicsInfo: "Tech-centric with professional certifications in IT and fashion.", performanceReview: "Recognized for practical IT training labs and annual fashion shows.", feesRange: "GH₵ 6,500 - GH₵ 12,000 / year", scholarshipsInfo: "BlueCrest Foundation, tech talent discount waivers.", programsOffered: ["BSc Information Technology", "BA Fashion Design", "BSc Software Engineering"], admissionRequirements: "WASSCE: Credit passes in English and Core Maths, plus 3 electives." },
    { id: "wisconsin", name: "Wisconsin International University College", ranking: 44, image: "picture/wisconsin_campus.jpg", type: "Private", location: "Agbogba, Accra", established: 2000, academicsInfo: "Multicultural nursing, law, security, business communications.", performanceReview: "Popular with international students. Features mock law courts.", feesRange: "GH₵ 6,200 - GH₵ 11,000 / year", scholarshipsInfo: "Wisconsin Institutional Aid, international student bursaries.", programsOffered: ["Bachelor of Laws (LLB)", "BSc Nursing", "BSc IT and Management"], admissionRequirements: "WASSCE: Credits in Maths, English, Science/Social, 3 electives." },
    { id: "academiccity", name: "Academic City University College", ranking: 45, image: "picture/academiccity_campus.jpg", type: "Private", location: "Haatso, Accra", established: 2017, academicsInfo: "Project-based learning, artificial intelligence, robotics, design.", performanceReview: "Equipped with advanced engineering maker-spaces, startup incubator.", feesRange: "GH₵ 25,000 - GH₵ 35,000 / year", scholarshipsInfo: "Academic City President's Scholarship, tuition waivers.", programsOffered: ["BSc Artificial Intelligence", "BSc Robotics Engineering", "BSc Computer Engineering"], admissionRequirements: "WASSCE: Credits in Core Maths, English, Science, 3 electives." },
    { id: "webster", name: "Webster University Ghana", ranking: 51, image: "picture/webster_campus.jpg", type: "Private", location: "East Legon, Accra", established: 2013, academicsInfo: "American-accredited university offering US degrees in Ghana.", performanceReview: "Diverse classrooms and study-abroad/exchange programs.", feesRange: "GH₵ 50,000 - GH₵ 70,000 / year", scholarshipsInfo: "Webster Legacy Scholarships, US federal aid (FAFSA).", programsOffered: ["BA International Relations", "BSc Business Admin", "BS Computer Science"], admissionRequirements: "WASSCE/SAT: Credits in English and Maths, plus SAT/ACT score." }
  ],
  studentStartups: [
    { id: 1, name: "AgriFlow", industry: "AgriTech", desc: "AI-based irrigation scheduling system for cocoa farmers in the Ashanti Region.", author: "Naa Ayeley Komey", upvotes: 42, joined: false },
    { id: 2, name: "SusuSmart", industry: "FinTech", desc: "Digital cooperative thrift (susu) ledger built for market women in Kumasi.", author: "Kofi Mensah", upvotes: 28, joined: false }
  ]
};

const appState = {
  theme: 'light',
  currentView: 'landing-shell',
  activeStudentTab: 'student-dashboard',
  activeLecturerTab: 'lecturer-dashboard',
  activeAdminTab: 'admin-dashboard',
  ...SMARTLEARN_STATIC_DATA,
  activeFacultyEmail: 'k.mensah@smartlearn.edu',
  selectedUniType: 'All',
  uniSearchQuery: ''
};

const careerQuizQuestions = [
  { title: "1. What kind of academic tasks do you enjoy the most?", options: [
    { category: "programming", text: "Coding programs and designing database systems" },
    { category: "business", text: "Creating financial plans and managing school activities" },
    { category: "datascience", text: "Finding patterns in statistical math databases" },
    { category: "engineering", text: "Assembling hardware circuits and designing mechanical devices" },
    { category: "healthcare", text: "Diagnosing biological symptoms and caregiving" },
    { category: "law", text: "Analyzing legal arguments, writing briefs, and debating rights" }
  ]},
  { title: "2. Which secondary school subject did you excel at the most?", options: [
    { category: "programming", text: "Information Technology & Elective Physics" },
    { category: "business", text: "Business Economics & Financial Accounting" },
    { category: "datascience", text: "Pure Mathematics & Probability" },
    { category: "engineering", text: "Applied Physics & Technical Drawing" },
    { category: "healthcare", text: "Chemistry & General Biology" },
    { category: "law", text: "Government, History & Literature in English" }
  ]},
  { title: "3. What would be your ideal post-graduate work environment?", options: [
    { category: "programming", text: "Leading tech developers in a software engineering hub" },
    { category: "business", text: "Managing finance portfolios in a banking office in Accra" },
    { category: "datascience", text: "Mining large databases to build predictive algorithms" },
    { category: "engineering", text: "Working in electrical grid facilities or robotics fabrication labs" },
    { category: "healthcare", text: "Working in clinical hospitals or pharmaceutical research facilities" },
    { category: "law", text: "Practicing in a law firm court room or policy consulting agency" }
  ]},
  { title: "4. Choose a final year project topic you would love to build:", options: [
    { category: "programming", text: "A multi-factor cybersecurity firewall system" },
    { category: "business", text: "A business model for online crop sales across Kumasi" },
    { category: "datascience", text: "A system that predicts student dropout risks from data" },
    { category: "engineering", text: "A solar-powered microgrid system for rural communities" },
    { category: "healthcare", text: "An automated drug compatibility analysis checklist" },
    { category: "law", text: "A legal advisory database covering Ghana land law precedents" }
  ]},
  { title: "5. Which critical skill do you want to master in college?", options: [
    { category: "programming", text: "Full-Stack coding and cloud engineering" },
    { category: "business", text: "Venture funding models and product pitching" },
    { category: "datascience", text: "Deep learning, SQL database query, and neural nets" },
    { category: "engineering", text: "CAD structural simulation and electric circuit layout" },
    { category: "healthcare", text: "Clinical patient assessment and medical diagnostics" },
    { category: "law", text: "Critical litigation arguments and constitutional reviews" } ]}
];

const programCardsData = [
  { title: 'BSc Computer Science', duration: '4 Years', bg: 'linear-gradient(135deg, var(--primary), var(--secondary))', desc: 'Study algorithms, software engineering, databases, network security, and machine learning structures.', careers: 'Software Engineer, Systems Architect, Devops', demand: 'High (92% placement rate)', salary: 'GH₵ 8,000 - GH₵ 22,000 / mo', suitability: 95, pdfPath: 'PDF/Computer and Information Technology/ComputerScienceOne.pdf' },
  { title: 'BSc Software Engineering', duration: '4 Years', bg: 'linear-gradient(135deg, var(--secondary), var(--accent))', desc: 'Learn standard development lifecycles, Scrum, design patterns, testing, and modern cloud deployment.', careers: 'Fullstack Developer, QA Lead, Project Manager', demand: 'Extremely High (90%)', salary: 'GH₵ 7,500 - GH₵ 18,000 / mo', suitability: 88, pdfPath: 'PDF/Computer and Information Technology/Software Engineering - Ian Sommerville.pdf' },
  { title: 'BSc Cybersecurity', duration: '4 Years', bg: 'linear-gradient(135deg, var(--primary), var(--accent))', desc: 'Focus on cryptography, vulnerability checks, secure coding, digital forensics, and firewall implementations.', careers: 'InfoSec Analyst, Ethical Hacker, Security Dev', demand: 'Critically High (94%)', salary: 'GH₵ 9,000 - GH₵ 25,000 / mo', suitability: 91, pdfPath: 'PDF/Computer and Information Technology/FUNDAMENTALS OF CYBER SECURITY.pdf' },
  { title: 'BSc Business Administration', duration: '4 Years', bg: 'linear-gradient(135deg, #1e3a8a, #0d9488)', desc: 'Master corporate leadership models, supply chain logistics, financial reporting, and product marketing.', careers: 'Product Manager, HR Director, Financial Advisor', demand: 'Moderate (75%)', salary: 'GH₵ 5,500 - GH₵ 14,000 / mo', suitability: 74, pdfPath: 'PDF/Business and Economics/Business admin.pdf' },
  { title: 'BSc Data Science', duration: '4 Years', bg: 'linear-gradient(135deg, #4f46e5, #0891b2)', desc: 'Study statistical data mining, machine learning models, database modeling, and predictive analytics.', careers: 'Data Scientist, Analytics Consultant, BI Developer', demand: 'Extremely High (88%)', salary: 'GH₵ 8,500 - GH₵ 22,000 / mo', suitability: 89, pdfPath: 'PDF/Computer and Information Technology/book.pdf' },
  { title: 'BSc Electrical Engineering', duration: '4 Years', bg: 'linear-gradient(135deg, #b45309, #d97706)', desc: 'Explore semiconductor circuits, microgrid layouts, power transmission, and electronic hardware control systems.', careers: 'Electrical Engineer, Power Specialist, Hardware Designer', demand: 'High (85%)', salary: 'GH₵ 7,000 - GH₵ 18,000 / mo', suitability: 86, pdfPath: 'PDF/Engineering & Architecture/BSc Electrical Engineering.pdf' },
  { title: 'Bachelor of Laws (LLB)', duration: '4 Years', bg: 'linear-gradient(135deg, #1e293b, #475569)', desc: 'Study constitutional law, jurisprudence, contract law, litigation processes, and legal drafting.', careers: 'Lawyer, Legal Counsel, Policy Advisor', demand: 'High (82%)', salary: 'GH₵ 8,000 - GH₵ 25,000 / mo', suitability: 80, pdfPath: 'PDF/Legal & Social Sciences/Bachelor_of_Laws_LLB.pdf' },
  { title: 'BSc Nursing & Allied Health', duration: '4 Years', bg: 'linear-gradient(135deg, #059669, #10b981)', desc: 'Master clinical patient assessments, pediatric nursing care, anatomy, and pharmaceutical ethics.', careers: 'Clinical Nurse, Health Specialist, Ward Manager', demand: 'Extremely High (95%)', salary: 'GH₵ 5,000 - GH₵ 12,000 / mo', suitability: 92, pdfPath: 'PDF/Healthcare & Medical Sciences/BSc_Nursing_and_Allied_Health.pdf' },
  { title: 'BSc Mechanical Engineering', duration: '4 Years', bg: 'linear-gradient(135deg, #475569, #0f172a)', desc: 'Study machine thermodynamics, fluid mechanics, CAD structural design, robotics manufacturing, and mechanical control systems.', careers: 'Mechanical Engineer, Aerospace Systems Developer, Robotics Engineer', demand: 'High (83%)', salary: 'GH₵ 7,500 - GH₵ 19,000 / mo', suitability: 84, pdfPath: 'PDF/Engineering & Architecture/BSc_Mechanical_Engineering.pdf' },
  { title: 'Medicine & Surgery (MBChB)', duration: '6 Years', bg: 'linear-gradient(135deg, #0d9488, #0f766e)', desc: 'Undergo intensive clinical rotations, diagnostics, pathology, internal medicine, surgery procedures, and public health policies.', careers: 'Medical Doctor, Surgeon, Healthcare Administrator', demand: 'Critically High (98%)', salary: 'GH₵ 9,500 - GH₵ 30,000 / mo', suitability: 95, pdfPath: 'PDF/Healthcare & Medical Sciences/Medicine_and_Surgery_MBChB.pdf' },
  { title: 'Doctor of Pharmacy (PharmD)', duration: '6 Years', bg: 'linear-gradient(135deg, #0891b2, #083344)', desc: 'Master pharmaceutical chemistry, drug delivery systems, clinical pharmacology, pharmacotherapy, and community pharmacy management.', careers: 'Pharmacist, Clinical Research Lead, Drug Safety Director', demand: 'High (88%)', salary: 'GH₵ 6,000 - GH₵ 16,000 / mo', suitability: 87, pdfPath: 'PDF/Healthcare & Medical Sciences/Doctor_of_Pharmacy_PharmD.pdf' },
  { title: 'BSc Architecture & Design', duration: '4 Years', bg: 'linear-gradient(135deg, #78350f, #451a03)', desc: 'Explore structural physics, sustainable spatial designs, CAD modeling, building codes, and environmental landscape engineering.', careers: 'Architect, Urban Planner, Construction Project Consultant', demand: 'High (80%)', salary: 'GH₵ 7,000 - GH₵ 20,000 / mo', suitability: 82, pdfPath: 'PDF/Engineering & Architecture/BSc_Architecture_and_Design.pdf' },
  { title: 'BA Economics & Public Policy', duration: '4 Years', bg: 'linear-gradient(135deg, #581c87, #3b0764)', desc: 'Analyze macroeconomic trends, public finance, econometrics, developmental policy frameworks, and market resource allocations.', careers: 'Policy Analyst, Economic Consultant, Research Director', demand: 'High (78%)', salary: 'GH₵ 6,000 - GH₵ 16,000 / mo', suitability: 76, pdfPath: 'PDF/Business and Economics/BA Economics & Public Policy.pdf' }
];

const STANDARD_4_GPA_TIP = 'Standard 4.0 CGPA. Grade points weighted by credit hours. First Class \u2265 3.60.';

const GPA_UNIVERSITIES = [

  { group: 'Traditional Universities' },
  { id:'ug',  name:'University of Ghana (UG / Legon)',
    tip:'Grade points 0–4.0. A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D+=1.5, D=1.0, F=0. CGPA = total grade points ÷ total credits. First Class \u2265 3.60.' },
  { id:'knust', name:'KNUST', scale:'CWA %', system:'knust',
    tip:'Cumulative Weighted Average (%). CWA = \u03a3(raw score \u00d7 credit hrs) \u00f7 total credit hrs. First Class \u2265 70%.' },
  { id:'ucc',  name:'UCC \u2014 Univ. of Cape Coast',
    tip:'4.0 scale. A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D+=1.5, D=1.0, E=0. CGPA = grade points \u00f7 total credits. First Class \u2265 3.60.' },
  { id:'gimpa', name:'GIMPA',
    tip:'4.0 scale. A=4.0, A\u2212=3.75, B+=3.5, B=3.0, C=2.0. CGPA = total grade points \u00f7 credits. First Class \u2265 3.60.' },
  { id:'uds',  name:'UDS \u2014 Univ. for Development Studies' },
  { id:'uenr', name:'UENR \u2014 Univ. of Energy & Natural Resources' },
  { group: 'Technical Universities' },
  { id:'atu',  name:'ATU \u2014 Accra Technical University',
    tip:'4.0 CGPA system. A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D=1.0, F=0. Grade pts \u00d7 credits \u00f7 total credits. First Class \u2265 3.60.' },
  { id:'kstu', name:'KsTU \u2014 Kumasi Technical University',
    tip:'4.0 CGPA. Same scale as ATU. Grade points weighted by credit hours. First Class \u2265 3.60.' },
  { id:'ttu',  name:'TTU \u2014 Takoradi Technical University' },
  { id:'htu',  name:'HTU \u2014 Ho Technical University',
    tip:'4.0 CGPA. A=4.0 down to F=0. Grade pts \u00d7 credit hrs \u00f7 total credits. First Class \u2265 3.60.' },
  { id:'ktu',  name:'KTU \u2014 Koforidua Technical University' },
  { id:'cctu', name:'CCTU \u2014 Cape Coast Technical University' },
  { group: 'Private Universities' },
  { id:'ashesi',    name:'Ashesi University',
    tip:'US-style 4.0 GPA. A=4.0, B=3.0, C=2.0, D=1.0, F=0. Weighted by credit hours. First Class (Distinction) \u2265 3.60.' },
  { id:'lancaster', name:'Lancaster University Ghana',
    tip:'UK-adapted 4.0 GPA scale. A=4.0, B+=3.5, B=3.0, C=2.0, D=1.0. Weighted by credit hours. First Class \u2265 3.60.' },
  { id:'vvu',       name:'Valley View University (VVU)',
    tip:'Standard 4.0 CGPA. A=4.0, B+=3.5, B=3.0... Min. graduation CGPA 2.00. First Class \u2265 3.60.' },
  { id:'pentecost', name:'Pentecost University',
    tip:'4.0 GPA scale. FGPA = \u03a3(grade pts \u00d7 credits) \u00f7 total credits. First Class \u2265 3.60.' },
  { id:'mug',       name:'Methodist University Ghana (MUG)',
    tip:'4.0 FGPA system. Grade pts weighted by credit hours each semester. First Class \u2265 3.60.' },
  { id:'pug',       name:'Presbyterian University Ghana (PUG)' },
  { id:'cug',       name:'Catholic University of Ghana (CUG)' },
  { id:'anu',       name:'All Nations University (ANU)' },
  { id:'regent',    name:'Regent University College' },
  { id:'bluecrest', name:'BlueCrest University College',
    tip:'4.0 CGPA. A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0. Weighted by credit hours. First Class \u2265 3.60.' },
  { id:'wisconsin', name:"Wisconsin Int'l University College" },
  { id:'academiccity', name:'Academic City University College',
    tip:'4.0 CGPA. A=4.0 \u2192 F=0. Weighted by credit hours per semester. First Class \u2265 3.60.' },
  { id:'webster',   name:'Webster University Ghana',
    tip:'US-style 4.0 GPA. A=4.0, A\u2212=3.7, B+=3.3, B=3.0, B\u2212=2.7... Weighted by credit hours. First Class \u2265 3.60.' },
  { id:'central',   name:'Central University' }

];

const mockResearchPapers = [
  { title: "Socio-Economic Impacts of Mobile Money (M-Pesa/Momo) in Makola Market, Accra", authors: "Mensah, K., & Osei, A.", journal: "West African Journal of Development Finance", year: "2024", volume: "12(2)", pages: "45-60", abstract: "This study examines the role of mobile money transaction limits and agent distribution on the liquidity management of retail traders in Makola Market, Accra, Ghana. We find a significant positive correlation between Momo usage and daily sales volumes, though network downtime poses a major constraint." },
  { title: "Optimizing Solar-Powered Microgrids for Cocoa Farming Communities in Ashanti Region", authors: "Appiah, J., & Addo, M.", journal: "Journal of Renewable Energy Ghana", year: "2023", volume: "8(1)", pages: "112-125", abstract: "A study proposing a decentralized photovoltaic system configuration tailored for small-scale irrigation and cocoa drying in rural Ashanti. Simulation results indicate a 35% reduction in cocoa production costs compared to diesel generator baselines." },
  { title: "Prevalence of Fake Malaria Drugs in West Africa: A Machine Learning Classification Study", authors: "Serwaa, A., & Tetteh, S.", journal: "African Health Informatics Review", year: "2025", volume: "15(4)", pages: "204-218", abstract: "By training convolutional neural networks on spectrometer scans of local pharmaceutical stocks, this paper demonstrates a non-invasive screening method achieving 97% accuracy in identifying counterfeit tablets in Southern Ghana." },
  { title: "EdTech Adoption and Student Engagement in Ghanaian Public Universities post-COVID-19", authors: "Tetteh, S. A., & Komey, N.", journal: "Ghana Journal of Higher Education Studies", year: "2024", volume: "4(1)", pages: "88-102", abstract: "An empirical assessment of learning management system (LMS) adoption curves at KNUST and UG. Highlights user experience gaps, network latency barriers, and the necessity of offline-first mobile sync workflows." }
];

const MOCK_ROLES = [
  { name: 'student', permissions: ['Create Courses', 'Grade Assignments', 'Manage Users'], description: 'Academic learner access' },
  { name: 'lecturer', permissions: ['Create Courses', 'Grade Assignments'], description: 'Faculty instructor access' },
  { name: 'admin', permissions: ['Manage Users', 'View Reports', 'Access System Settings'], description: 'Institution administration access' },
  { name: 'entrepreneur', permissions: ['Manage Startups'], description: 'Innovation hub candidate' },
  { name: 'researcher', permissions: ['Manage Research'], description: 'Research group investigator' },
  { name: 'mentor', permissions: ['Grade Assignments'], description: 'Industry advisory feedback provider' }
];

let currentRolesList = [...MOCK_ROLES];
let adminSelectedRoleName = '';

let currentFacultiesList = [
  { name: 'Faculty of Computing & Information Systems', code: 'FCIS' },
  { name: 'Faculty of Engineering', code: 'FENG' },
  { name: 'Business School', code: 'BSCH' }
];

let currentDepartmentsList = [
  { name: 'Computer Science', code: 'CS', faculty: 'FCIS' },
  { name: 'Software Engineering', code: 'SE', faculty: 'FCIS' },
  { name: 'Electrical Engineering', code: 'EE', faculty: 'FENG' },
  { name: 'Business Administration', code: 'BA', faculty: 'BSCH' }
];

let currentResearchProjects = [
  { id: 1, title: 'Machine Learning Classification of Fake Malaria Pills', domain: 'Healthcare Informatics', lead: 'Prof. Ama Serwaa', funding: 12000, status: 'Approved' },
  { id: 2, title: 'Optimizing Microgrids for Ashanti Farming Irrigation', domain: 'Renewable Energy', lead: 'Dr. Kwame Mensah', funding: 8500, status: 'Approved' },
  { id: 3, title: 'Blockchain Thrift Susie Cooperative Ledgers', domain: 'FinTech', lead: 'Mr. Emmanuel Osei', funding: 4000, status: 'Pending Approval' }
];

let currentJobListings = [
  { title: 'Junior Frontend Engineer', company: 'SusuSmart Ghana', type: 'Full-time' },
  { title: 'Research Assistant (LLMs)', company: 'CS101 Lab Legon', type: 'Internship' }
];

let currentAuditLogs = [
  { user: 'everybody@smartlearn.com', action: 'System Seeding', timestamp: '2026-06-13 18:57:21', prev: 'N/A', next: 'System Seeding Completed' }
];

// Global simulation states
let careerScores = { programming: 0, business: 0, datascience: 0, engineering: 0, healthcare: 0, law: 0 };
let currentQuestionIndex = 0;
let currentGpaUniSystem = 'standard_4';
let currentGpaUniName = 'University of Ghana (UG / Legon)';
let activeSubmittingAsgId = null;
let landingUnisExpanded = false;
let currentMentorName = '';
let inactivityTimer;
let currentCitationFormat = 'APA';
let isOfflineDemoMode = false;
let activeAuthTab = 'signin';
let activeSignupRole = 'student';
