/* ============================================================
   SMARTLEARN AI — DEMO EXTENSION DATA
   [DEMO CONTENT] — All data below is demonstration data for
   academic project showcase purposes only. Not real records.
   ============================================================ */

// This file extends appState after data.js has initialized it.
// It is safe to append demo datasets here without touching data.js.

(function initDemoData() {
  // Guard: wait until appState is defined
  function extend() {
    if (typeof appState === 'undefined') {
      setTimeout(extend, 50);
      return;
    }

    /* --- Alumni Profiles [DEMO CONTENT] --- */
    appState.demoAlumniProfiles = [
      { name: 'Abena Sarkodie', avatar: '👩🏾', graduationYear: 2021, role: 'Software Engineer', company: 'MTN Ghana', location: 'Accra', skills: ['Python', 'Django', 'AWS'], quote: 'SmartLearn gave me the career quiz that pointed me to CS. Best decision of my life.' },
      { name: 'Kwesi Boateng', avatar: '👨🏾', graduationYear: 2020, role: 'Data Analyst', company: 'GCB Bank', location: 'Kumasi', skills: ['SQL', 'Power BI', 'Excel'], quote: 'The AI tutor helped me ace my statistics course when I was struggling in second year.' },
      { name: 'Yaa Asantewaa Darko', avatar: '👩🏾‍💼', graduationYear: 2019, role: 'Product Manager', company: 'Hubtel', location: 'Accra', skills: ['Agile', 'Figma', 'Strategy'], quote: 'Alumni mentorship programs changed how I thought about career growth.' },
      { name: 'Emmanuel Kumi-Boateng', avatar: '👨🏾‍💻', graduationYear: 2022, role: 'Cybersecurity Analyst', company: 'Ecobank Group', location: 'Accra', skills: ['SIEM', 'Network Security', 'Python'], quote: 'The industry partner hub connected me with Ecobank before I even graduated.' },
      { name: 'Akua Mensah', avatar: '👩🏾‍🔬', graduationYear: 2018, role: 'Research Scientist', company: 'CSIR-INSTI', location: 'Accra', skills: ['R', 'Statistics', 'Research'], quote: 'I learned to write my first proper research proposal through this platform.' },
      { name: 'Nana Agyei Prempeh', avatar: '👨🏾', graduationYear: 2021, role: 'Mobile Developer', company: 'Zeepay Ghana', location: 'Accra', skills: ['Flutter', 'Kotlin', 'Firebase'], quote: 'The plagiarism checker saved me from an accidental citation error in my final year.' },
      { name: 'Fatima Al-Hassan', avatar: '👩🏾', graduationYear: 2023, role: 'Graduate Trainee', company: 'Standard Chartered', location: 'Accra', skills: ['Finance', 'Excel', 'Banking'], quote: 'The career advisor dashboard matched me with the perfect internship opportunity.' },
      { name: 'Bright Ofori', avatar: '👨🏾‍🎓', graduationYear: 2022, role: 'Electrical Engineer', company: 'Ghana Grid Company', location: 'Accra', skills: ['AutoCAD', 'Circuit Design', 'MATLAB'], quote: 'My final year project on solar microgrids started with a research search here.' },
    ];

    /* --- Alumni Events [DEMO CONTENT] --- */
    appState.demoAlumniEvents = [
      { title: 'Annual Alumni Gala 2026', date: 'Saturday, 19 July 2026', venue: 'Accra International Conference Centre', type: 'Networking', emoji: '🎉', color: '#7c3aed' },
      { title: 'Tech Industry Mixer Night', date: 'Friday, 4 July 2026', venue: 'Kotoka Hospitality Suite, Airport City', type: 'Tech Networking', emoji: '💻', color: '#2563eb' },
      { title: 'Graduate Career Fair 2026', date: 'Wednesday, 23 July 2026', venue: 'University of Ghana Sports Complex', type: 'Career Fair', emoji: '💼', color: '#10b981' },
      { title: 'Alumni Homecoming Weekend', date: 'August 15-17, 2026', venue: 'KNUST Main Campus, Kumasi', type: 'Social', emoji: '🏛️', color: '#f59e0b' },
    ];

    /* --- Mentorship Programs [DEMO CONTENT] --- */
    appState.demoMentorships = [
      { mentorName: 'Abena Sarkodie', field: 'Software Engineering', company: 'MTN Ghana', mentees: 3 },
      { mentorName: 'Kwesi Boateng', field: 'Data Analytics & BI', company: 'GCB Bank', mentees: 2 },
      { mentorName: 'Yaa Asantewaa Darko', field: 'Product Management', company: 'Hubtel', mentees: 4 },
    ];

    /* --- Attendance Records [DEMO CONTENT] --- */
    appState.demoAttendanceRecords = [
      { studentName: 'Kofi Mensah', course: 'CS101', week: 1, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'CS101', week: 2, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'CS101', week: 3, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'CS101', week: 4, status: 'absent' },
      { studentName: 'Efua Ampah', course: 'CS101', week: 1, status: 'present' },
      { studentName: 'Efua Ampah', course: 'CS101', week: 2, status: 'absent' },
      { studentName: 'Efua Ampah', course: 'CS101', week: 3, status: 'present' },
      { studentName: 'Efua Ampah', course: 'CS101', week: 4, status: 'present' },
      { studentName: 'Joseph Addo', course: 'CS101', week: 1, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'CS101', week: 2, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'CS101', week: 3, status: 'present' },
      { studentName: 'Joseph Addo', course: 'CS101', week: 4, status: 'absent' },
      { studentName: 'Kofi Mensah', course: 'ENG201', week: 1, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'ENG201', week: 2, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'ENG201', week: 3, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'ENG201', week: 4, status: 'present' },
      { studentName: 'Efua Ampah', course: 'ENG201', week: 1, status: 'present' },
      { studentName: 'Efua Ampah', course: 'ENG201', week: 2, status: 'present' },
      { studentName: 'Efua Ampah', course: 'ENG201', week: 3, status: 'absent' },
      { studentName: 'Efua Ampah', course: 'ENG201', week: 4, status: 'present' },
      { studentName: 'Joseph Addo', course: 'ENG201', week: 1, status: 'present' },
      { studentName: 'Joseph Addo', course: 'ENG201', week: 2, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'ENG201', week: 3, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'ENG201', week: 4, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'MATH102', week: 1, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'MATH102', week: 2, status: 'present' },
      { studentName: 'Kofi Mensah', course: 'MATH102', week: 3, status: 'absent' },
      { studentName: 'Kofi Mensah', course: 'MATH102', week: 4, status: 'present' },
      { studentName: 'Efua Ampah', course: 'MATH102', week: 1, status: 'absent' },
      { studentName: 'Efua Ampah', course: 'MATH102', week: 2, status: 'present' },
      { studentName: 'Efua Ampah', course: 'MATH102', week: 3, status: 'present' },
      { studentName: 'Efua Ampah', course: 'MATH102', week: 4, status: 'present' },
      { studentName: 'Joseph Addo', course: 'MATH102', week: 1, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'MATH102', week: 2, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'MATH102', week: 3, status: 'absent' },
      { studentName: 'Joseph Addo', course: 'MATH102', week: 4, status: 'present' },
    ];

    /* --- Rubric Templates [DEMO CONTENT] --- */
    appState.demoRubricTemplates = [
      { name: 'CS101 Programming Assignment Rubric', totalPoints: 100, criteria: [
        { name: 'Code Correctness & Logic', weight: 40, maxScore: 40 },
        { name: 'Code Readability & Comments', weight: 20, maxScore: 20 },
        { name: 'Efficiency & Algorithm', weight: 25, maxScore: 25 },
        { name: 'Submission & Documentation', weight: 15, maxScore: 15 },
      ]},
      { name: 'ENG201 Project Report Rubric', totalPoints: 100, criteria: [
        { name: 'System Design & Architecture', weight: 35, maxScore: 35 },
        { name: 'UML Diagrams Accuracy', weight: 25, maxScore: 25 },
        { name: 'Requirements Documentation', weight: 20, maxScore: 20 },
        { name: 'Presentation & Format', weight: 20, maxScore: 20 },
      ]},
      { name: 'Research Thesis Evaluation Rubric', totalPoints: 100, criteria: [
        { name: 'Research Question & Objectives', weight: 20, maxScore: 20 },
        { name: 'Literature Review Quality', weight: 25, maxScore: 25 },
        { name: 'Methodology & Data Collection', weight: 30, maxScore: 30 },
        { name: 'Analysis & Conclusions', weight: 25, maxScore: 25 },
      ]},
    ];

    /* --- Project Supervision [DEMO CONTENT] --- */
    appState.demoSupervisionProjects = [
      { title: 'AI-Powered Crop Disease Detection for Ghanaian Farmers', studentName: 'Kofi Mensah', department: 'Computer Science', year: '4th Year', status: 'In Progress', progress: 65, deadline: '2026-08-15', nextMilestone: 'Model validation on real field images' },
      { title: 'Mobile Money Adoption Among SMEs in Kumasi', studentName: 'Efua Ampah', department: 'Business Admin', year: '4th Year', status: 'Planning', progress: 20, deadline: '2026-09-01', nextMilestone: 'Survey data collection from 50 SMEs' },
      { title: 'Solar Microgrid Optimization for Rural Northern Ghana', studentName: 'Bright Ofori', department: 'Electrical Eng.', year: 'MSc', status: 'In Progress', progress: 80, deadline: '2026-07-30', nextMilestone: 'Final system simulation and power output analysis' },
      { title: 'Blockchain-Based Land Registry in Ghana', studentName: 'Joseph Addo', department: 'Computer Science', year: '4th Year', status: 'Submitted', progress: 100, deadline: '2026-06-01', nextMilestone: 'Submitted to internal examiner panel' },
    ];

    /* --- Office Hours & Bookings [DEMO CONTENT] --- */
    appState.demoOfficeHours = [
      { day: 'Monday', time: '10:00 AM — 12:00 PM', location: 'Room 302, CS Block' },
      { day: 'Tuesday', time: '2:00 PM — 4:00 PM', location: 'Room 302, CS Block' },
      { day: 'Thursday', time: '9:00 AM — 11:00 AM', location: 'ICT Lab B (TA Support)' },
    ];
    appState.demoOfficeBookings = [
      { student: 'Kofi Mensah', topic: 'Recursion help — CS101', dateTime: 'Mon Jun 16, 10:30 AM', status: 'Pending', duration: '30 mins' },
      { student: 'Efua Ampah', topic: 'UML diagram review', dateTime: 'Tue Jun 17, 3:00 PM', status: 'Confirmed', duration: '45 mins' },
      { student: 'Joseph Addo', topic: 'Academic standing concern', dateTime: 'Thu Jun 19, 9:30 AM', status: 'Pending', duration: '1 hour' },
    ];

    /* --- Research Projects [DEMO CONTENT] --- */
    appState.demoResearchProjects = [
      { title: 'Machine Learning for Malaria Diagnosis from Blood Smear Images', researcher: 'Dr. Kwame Mensah', domain: 'Health Informatics', deadline: '2026-09-30', status: 'In Progress', funded: true },
      { title: 'Impact of Mobile Money on Financial Inclusion in Rural Ghana', researcher: 'Dr. Sophia Tetteh', domain: 'Business & Finance', deadline: '2026-08-15', status: 'Planning', funded: false },
      { title: 'Optimizing Off-Grid Solar Systems with IoT Monitoring', researcher: 'Prof. Ama Serwaa', domain: 'Renewable Energy', deadline: '2026-07-01', status: 'Submitted', funded: true },
      { title: 'Natural Language Processing for Akan Language Chatbots', researcher: 'Mr. Emmanuel Osei', domain: 'CS & AI', deadline: '2026-10-15', status: 'Planning', funded: false },
    ];

    /* --- Grant Applications [DEMO CONTENT] --- */
    appState.demoGrantApplications = [
      { title: 'USAID Digital Health Innovation Grant', funder: 'USAID Ghana', deadline: '2026-07-31', amount: 'USD $125,000', status: 'Pending' },
      { title: 'Carnegie African Diaspora Fellowship — AI Research', funder: 'Carnegie Corporation of New York', deadline: '2026-08-15', amount: 'USD $45,000', status: 'Approved' },
      { title: 'Ghana Research and Innovation Fund (GRIF)', funder: 'Ministry of Education, Ghana', deadline: '2026-09-01', amount: 'GH₵ 280,000', status: 'Under Review' },
    ];

    /* --- Academic Conferences [DEMO CONTENT] --- */
    appState.demoConferences = [
      { name: 'West Africa ICT Conference (WAITC 2026)', date: 'September 14-16, 2026', location: 'Accra, Ghana', type: 'International', emoji: '🌍', submissionDeadline: '20 July 2026' },
      { name: 'IEEE Africa Section Conference (AFRICON 2026)', date: 'October 7-9, 2026', location: 'Lagos, Nigeria', type: 'International', emoji: '⚡', submissionDeadline: '15 August 2026' },
      { name: 'KNUST Research Week Symposium', date: 'August 4-6, 2026', location: 'Kumasi, Ghana', type: 'National', emoji: '🏛️', submissionDeadline: '10 July 2026' },
      { name: 'African Health Research Congress', date: 'November 3-5, 2026', location: 'Nairobi, Kenya', type: 'International', emoji: '🏥', submissionDeadline: '1 September 2026' },
      { name: 'UG Digital Innovation Colloquium', date: 'July 28-29, 2026', location: 'Legon, Ghana', type: 'National', emoji: '💡', submissionDeadline: '5 July 2026' },
    ];

    /* --- Partner Organizations [DEMO CONTENT] --- */
    appState.demoPartnerOrgs = [
      { name: 'Hubtel Ghana', sector: 'Fintech / Technology', description: 'Leading payment platform and API company in Ghana, serving millions of merchants and individuals.', website: 'https://hubtel.com', studentsHired: 14, internsHosted: 22 },
      { name: 'MTN Ghana', sector: 'Telecommunications', description: "Ghana's largest telecom operator and MoMo provider. Active graduate trainee partner.", website: 'https://mtn.com.gh', studentsHired: 31, internsHosted: 45 },
      { name: 'GCB Bank Limited', sector: 'Banking & Finance', description: 'Government-backed commercial bank serving retail and corporate banking across Ghana.', website: 'https://gcbbank.com.gh', studentsHired: 8, internsHosted: 12 },
      { name: 'Vodafone Ghana Business', sector: 'Technology / Telecom', description: 'Enterprise digital solutions and connectivity provider with national ICT infrastructure.', website: 'https://vodafone.com.gh', studentsHired: 11, internsHosted: 18 },
    ];

    /* --- Internship Listings [DEMO CONTENT] --- */
    appState.demoInternshipListings = [
      { title: 'Software Engineering Intern', department: 'Engineering', duration: '6 months', stipend: '1,800', applicants: 23, status: 'Open' },
      { title: 'Data Analyst Intern', department: 'Analytics & BI', duration: '3 months', stipend: '1,500', applicants: 17, status: 'Open' },
      { title: 'Cybersecurity Operations Intern', department: 'IT Security', duration: '4 months', stipend: '1,600', applicants: 9, status: 'Closing Soon' },
      { title: 'Business Development Intern', department: 'Commercial', duration: '6 months', stipend: '1,200', applicants: 31, status: 'Open' },
      { title: 'UX/UI Design Intern', department: 'Product & Design', duration: '3 months', stipend: '1,400', applicants: 14, status: 'Open' },
    ];

    /* --- Career Advisor — Student Profiles [DEMO CONTENT] --- */
    appState.demoCareerStudents = [
      { id: 'cs1', name: 'Kofi Mensah', program: 'BSc Computer Science', level: '3', careerGoal: 'Software Engineer at Google', skills: ['Python', 'React', 'SQL'] },
      { id: 'cs2', name: 'Efua Ampah', program: 'BSc Business Admin', level: '3', careerGoal: 'Business Analyst at a Big 4 firm', skills: ['Excel', 'PowerBI', 'Finance'] },
      { id: 'cs3', name: 'Joseph Addo', program: 'BSc Computer Science', level: '3', careerGoal: 'Cybersecurity Specialist', skills: ['Linux', 'Networking', 'Security'] },
      { id: 'cs4', name: 'Yaa Frempong', program: 'BSc Electrical Engineering', level: '4', careerGoal: 'Renewable Energy Consultant', skills: ['MATLAB', 'AutoCAD', 'Solar PV'] },
      { id: 'cs5', name: 'Nana Boateng', program: 'BSc Data Science', level: '2', careerGoal: 'Machine Learning Engineer', skills: ['Python', 'TensorFlow', 'Stats'] },
    ];

    /* --- Career Jobs [DEMO CONTENT] --- */
    appState.demoCareerJobs = [
      { title: 'Junior Software Engineer', company: 'Hubtel Ghana', location: 'Accra', type: 'Full-time', salary: 'GH₵ 8,000/mo', match: 92 },
      { title: 'Data Analyst Trainee', company: 'GCB Bank', location: 'Accra', type: 'Full-time', salary: 'GH₵ 6,500/mo', match: 88 },
      { title: 'Frontend Developer', company: 'Zeepay Ghana', location: 'Accra', type: 'Full-time', salary: 'GH₵ 7,200/mo', match: 85 },
      { title: 'Cybersecurity Analyst', company: 'Ecobank Group', location: 'Accra', type: 'Full-time', salary: 'GH₵ 9,500/mo', match: 80 },
      { title: 'Graduate Business Trainee', company: 'MTN Ghana', location: 'Accra', type: 'Full-time', salary: 'GH₵ 7,800/mo', match: 77 },
      { title: 'Python Developer (Remote)', company: 'Paystack Africa', location: 'Remote', type: 'Remote', salary: 'GH₵ 11,000/mo', match: 73 },
      { title: 'Electrical Systems Engineer', company: 'Ghana Grid Company', location: 'Accra', type: 'Full-time', salary: 'GH₵ 8,500/mo', match: 70 },
      { title: 'Network Security Officer', company: 'Vodafone Ghana', location: 'Accra', type: 'Full-time', salary: 'GH₵ 8,000/mo', match: 66 },
    ];

    /* --- Interview Q&A [DEMO CONTENT] --- */
    appState.demoInterviewQA = [
      { category: 'HR', question: 'Tell me about yourself and your career goals.', answer: 'Structure: Present (current skills), Past (key experiences), Future (goals aligned with role). Keep it under 2 minutes and end with why you want this specific role.' },
      { category: 'Technical', question: 'What is the difference between a list and a tuple in Python?', answer: 'Lists are mutable (can be changed after creation), tuples are immutable (fixed). Lists use [ ], tuples use ( ). Tuples are faster and safer for fixed data like coordinates.' },
      { category: 'Behavioral', question: 'Describe a time you failed and what you learned from it.', answer: 'Use the STAR method: Situation, Task, Action, Result. Be honest, focus on growth, show self-awareness. End with what you changed and the positive outcome.' },
      { category: 'Technical', question: 'Explain the concept of Big O notation.', answer: "Big O describes how an algorithm's runtime scales with input size. O(1)=constant, O(n)=linear, O(n²)=quadratic. We care about worst-case performance for large inputs." },
      { category: 'HR', question: 'Why do you want to work at this company?', answer: 'Research the company beforehand. Mention specific products, values, or projects you admire. Connect how their mission aligns with your career goals and skills.' },
      { category: 'Technical', question: 'What is the difference between SQL and NoSQL databases?', answer: 'SQL is relational (tables, fixed schema, ACID) — good for structured data. NoSQL (MongoDB, Redis) is document/key-value — better for flexible, high-volume, unstructured data.' },
      { category: 'Behavioral', question: 'How do you manage multiple competing deadlines?', answer: 'Use prioritization frameworks (urgent vs. important). Communicate early with stakeholders if timeline changes. Use tools like Trello or Notion. Show an example from university projects.' },
      { category: 'Technical', question: 'What is a RESTful API and how does it work?', answer: 'REST is an architectural style using HTTP methods (GET, POST, PUT, DELETE) to access/manipulate resources identified by URLs. Stateless, scalable, and widely used for web services.' },
      { category: 'HR', question: 'What are your salary expectations?', answer: "Research market rates first. Give a range based on research. Say you're flexible based on total compensation including benefits. Don't undersell yourself." },
      { category: 'Behavioral', question: 'Describe a successful team project you led or contributed to.', answer: 'STAR method: Pick a specific project. Highlight your role, challenges overcome, how you collaborated, and the measurable outcome. Show leadership and soft skills alongside technical ones.' },
    ];

    /* --- Advisor Sessions [DEMO CONTENT] --- */
    appState.demoAdvisorSessions = [
      { studentName: 'Kofi Mensah', type: 'Career Planning', topic: 'Internship applications strategy for tech companies', dateTime: 'Mon Jun 16, 11:00 AM', duration: '45 mins' },
      { studentName: 'Efua Ampah', type: 'CV Review', topic: 'Final CV review before GCB Bank application', dateTime: 'Tue Jun 17, 2:00 PM', duration: '30 mins' },
      { studentName: 'Nana Boateng', type: 'Interview Prep', topic: 'Mock technical interview — Python and SQL', dateTime: 'Thu Jun 19, 10:00 AM', duration: '1 hour' },
    ];

    /* --- Demo Plagiarism Reports [DEMO CONTENT] --- */
    if (!appState.demoPlagiarismReports) {
      appState.demoPlagiarismReports = [
        { documentName: 'CS101_Assignment1_Kofi.pdf', analysisDate: 'June 15, 2026', wordCount: 312, overallSimilarity: 18, aiGeneratedLikelihood: 8, recommendation: 'CLEAR', matches: [{ source: 'CS101 Assignment 1 — Kofi Mensah (2025)', combinedSimilarity: 18, matchType: 'similar_topic', sourceType: 'Internal Repository', excerpt: '"...control flow in programming is the order..."' }], missingCitations: [], aiIndicators: [] },
        { documentName: 'ENG201_Project_Report_Efua.pdf', analysisDate: 'June 14, 2026', wordCount: 847, overallSimilarity: 42, aiGeneratedLikelihood: 35, recommendation: 'REVIEW_REQUIRED', matches: [{ source: 'ENG201 Project — Efua Ampah (2025)', combinedSimilarity: 42, matchType: 'paraphrase', sourceType: 'Internal Repository', excerpt: '"...Agile methodology promotes iterative development..."' }], missingCitations: ['No References section detected'], aiIndicators: ['it is important to note', 'in conclusion, it can be said'] },
        { documentName: 'BUA202_Essay_Joseph.pdf', analysisDate: 'June 13, 2026', wordCount: 541, overallSimilarity: 67, aiGeneratedLikelihood: 55, recommendation: 'FLAG_CONCERN', matches: [{ source: 'BUA202 Report — Class Submission (2025)', combinedSimilarity: 67, matchType: 'exact', sourceType: 'Internal Repository', excerpt: '"...business administration involves the management and organization..."' }, { source: 'Web Source (Demo)', combinedSimilarity: 38, matchType: 'paraphrase', sourceType: 'Web Source (Demo)', excerpt: '"...effective managers must possess strong leadership skills..."' }], missingCitations: ['No References section detected'], aiIndicators: ['delve into', 'it is imperative that'] },
        { documentName: 'MATH102_ProblemSet_Abena.pdf', analysisDate: 'June 12, 2026', wordCount: 228, overallSimilarity: 12, aiGeneratedLikelihood: 5, recommendation: 'CLEAR', matches: [], missingCitations: [], aiIndicators: [] },
      ];
    }
  }
  extend();
})();
