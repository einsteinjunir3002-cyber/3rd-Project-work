import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Cpu, 
  Sparkles, 
  Award, 
  AlertTriangle,
  UploadCloud,
  Send,
  Loader2,
  Search,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentHub: React.FC = () => {
  const { user } = useAuth();
  const { 
    courses, 
    notes, 
    assignments, 
    forumThreads, 
    quizzes,
    chatMessages,
    consultations,
    activeChatRecipientId,
    typingStatus,
    stressLevel, 
    projectedGpa, 
    currentStudentTab,
    setTab,
    submitAssignment,
    createForumThread,
    submitForumReply,
    upvoteThread,
    updateStressLevel,
    updateGpaPredictions,
    addSystemNotification,
    fetchQuizDetails,
    submitQuizAttempt,
    sendChatMessage,
    setActiveRecipient,
    sendTypingStatus,
    bookConsultation,
    showToast
  } = useAppState();

  // Additional Local States for Quizzes, Chat and Consultations
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizTimer, setQuizTimer] = useState(0);
  const [quizInProgress, setQuizInProgress] = useState(false);
  
  const [chatText, setChatText] = useState('');
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const [bookingLecturerId, setBookingLecturerId] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingTopic, setBookingTopic] = useState('');
  
  const [forumCategory, setForumCategory] = useState('Computer Science');
  const [forumTitle, setForumTitle] = useState('');
  const [forumBody, setForumBody] = useState('');
  const [replyTexts, setReplyTexts] = useState<{ [tId: string]: string }>({});

  // Timer Effect for active quiz taking
  useEffect(() => {
    if (!quizInProgress || quizTimer <= 0) return;
    const interval = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          setQuizInProgress(false);
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizInProgress, quizTimer]);

  const handleStartQuiz = async (qId: string) => {
    try {
      const details = await fetchQuizDetails(qId);
      setActiveQuiz(details);
      setQuizAnswers({});
      setQuizTimer(details.timeLimit * 60);
      setQuizInProgress(true);
      addSystemNotification(`Started quiz: ${details.title}`);
    } catch (err) {
      showToast('Error starting quiz.', 'error');
    }
  };

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    setQuizInProgress(false);
    
    // Compile answers
    const answersPayload = Object.entries(quizAnswers).map(([qId, val]) => ({
      questionId: qId,
      studentAnswer: val
    }));

    try {
      const result = await submitQuizAttempt(activeQuiz.id, answersPayload);
      showToast(`Quiz Submitted! Final Score: ${result.attempt.finalScore} points.`, 'success');
      setActiveQuiz(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error submitting quiz.', 'error');
    }
  };

  const handleSendChatMsg = async () => {
    if (!chatText.trim() && !chatAttachment) return;
    const recipient = activeChatRecipientId || '';
    await sendChatMessage(chatText, recipient, undefined, chatAttachment || undefined);
    setChatText('');
    setChatAttachment(null);
    sendTypingStatus(recipient, false);
    setIsTyping(false);
  };

  const handleConsultBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLecturerId || !bookingTime || !bookingTopic) return;
    try {
      await bookConsultation({
        lecturerId: bookingLecturerId,
        scheduledTime: bookingTime,
        topic: bookingTopic
      });
      showToast('Consultation booked successfully!', 'success');
      setBookingTopic('');
      setBookingTime('');
    } catch (err) {
      showToast('Error booking consultation.', 'error');
    }
  };

  const handleNewForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumTitle || !forumBody) return;
    await createForumThread(forumCategory, forumTitle, forumBody);
    setForumTitle('');
    setForumBody('');
    showToast('Forum thread published!', 'success');
  };

  const handleForumCommentSubmit = async (tId: string) => {
    const txt = replyTexts[tId];
    if (!txt || !txt.trim()) return;
    await submitForumReply(tId, txt);
    setReplyTexts(prev => ({ ...prev, [tId]: '' }));
  };

  // 1. GPA Predictor Slider state variables
  const [csGpa, setCsGpa] = useState(4.0);
  const [mathGpa, setMathGpa] = useState(3.5);
  const [engGpa, setEngGpa] = useState(4.0);
  const [buaGpa, setBuaGpa] = useState(3.0);

  const handleGpaSlider = (courseCode: string, val: number) => {
    let updated = { CS101: csGpa, MATH102: mathGpa, ENG201: engGpa, BUA202: buaGpa };
    if (courseCode === 'CS101') { setCsGpa(val); updated.CS101 = val; }
    if (courseCode === 'MATH102') { setMathGpa(val); updated.MATH102 = val; }
    if (courseCode === 'ENG201') { setEngGpa(val); updated.ENG201 = val; }
    if (courseCode === 'BUA202') { setBuaGpa(val); updated.BUA202 = val; }
    updateGpaPredictions(updated);
  };

  const getLetter = (gpa: number) => {
    if (gpa === 4.0) return 'A (4.0)';
    if (gpa === 3.5) return 'B+ (3.5)';
    if (gpa === 3.0) return 'B (3.0)';
    if (gpa === 2.5) return 'C+ (2.5)';
    if (gpa === 2.0) return 'C (2.0)';
    if (gpa === 1.5) return 'D+ (1.5)';
    if (gpa === 1.0) return 'D (1.0)';
    return 'F (0.0)';
  };

  // 2. Career interest Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [careerScores, setCareerScores] = useState({ programming: 0, business: 0, datascience: 0, engineering: 0, healthcare: 0, law: 0 });
  const [suggestedCareer, setSuggestedCareer] = useState<any>(null);

  const quizQuestions = [
    { text: 'What kind of academic tasks do you enjoy the most?', options: [
      { text: 'Coding programs and designing database systems', score: 'programming' },
      { text: 'Creating financial plans and managing school activities', score: 'business' },
      { text: 'Finding patterns in statistical math databases', score: 'datascience' },
      { text: 'Assembling hardware circuits and designing mechanical devices', score: 'engineering' },
      { text: 'Diagnosing biological symptoms and caregiving', score: 'healthcare' },
      { text: 'Analyzing legal arguments, writing briefs, and debating rights', score: 'law' }
    ]},
    { text: 'Which secondary school subject did you excel at the most?', options: [
      { text: 'Information Technology & Elective Physics', score: 'programming' },
      { text: 'Business Economics & Financial Accounting', score: 'business' },
      { text: 'Pure Mathematics & Probability', score: 'datascience' },
      { text: 'Applied Physics & Technical Drawing', score: 'engineering' },
      { text: 'Chemistry & General Biology', score: 'healthcare' },
      { text: 'Government, History & Literature in English', score: 'law' }
    ]},
    { text: 'What would be your ideal post-graduate work environment?', options: [
      { text: 'Leading tech developers in a software engineering hub', score: 'programming' },
      { text: 'Managing finance portfolios in a banking office in Accra', score: 'business' },
      { text: 'Mining large databases to build predictive algorithms', score: 'datascience' },
      { text: 'Working in electrical grid facilities or robotics fabrication labs', score: 'engineering' },
      { text: 'Working in clinical hospitals or pharmaceutical research facilities', score: 'healthcare' },
      { text: 'Practicing in a law firm court room or policy consulting agency', score: 'law' }
    ]},
    { text: 'Choose a final year project topic you would love to build:', options: [
      { text: 'A multi-factor cybersecurity firewall system', score: 'programming' },
      { text: 'A business model for online crop sales across Kumasi', score: 'business' },
      { text: 'A system that predicts student dropout risks from data', score: 'datascience' },
      { text: 'A solar-powered microgrid system for rural communities', score: 'engineering' },
      { text: 'An automated drug compatibility analysis checklist', score: 'healthcare' },
      { text: 'A legal advisory database covering Ghana land law precedents', score: 'law' }
    ]},
    { text: 'Which critical skill do you want to master in college?', options: [
      { text: 'Full-Stack coding and cloud engineering', score: 'programming' },
      { text: 'Venture funding models and product pitching', score: 'business' },
      { text: 'Deep learning, SQL database query, and neural nets', score: 'datascience' },
      { text: 'CAD structural simulation and electric circuit layout', score: 'engineering' },
      { text: 'Clinical patient assessment and medical diagnostics', score: 'healthcare' },
      { text: 'Critical litigation arguments and constitutional reviews', score: 'law' }
    ]}
  ];

  const handleQuizSelection = (scoreKey: string) => {
    setCareerScores(prev => ({ ...prev, [scoreKey]: (prev[scoreKey as keyof typeof prev] || 0) + 1 }));
    if (currentQ < 4) {
      setCurrentQ(currentQ + 1);
    } else {
      // Quiz finished - compile top category
      const top = Object.entries(careerScores).reduce((a, b) => b[1] > a[1] ? b : a)[0];
      
      const careersDb = {
        programming: {
          title: 'Computer Science & Software Engineer',
          programs: ['Computer Science', 'Software Engineering', 'Cybersecurity'],
          universities: ['Ashesi University', 'KNUST', 'University of Ghana'],
          description: 'You have strong logic, problem solving and coding capabilities. You are built for building digital infrastructure.',
          demand: 'Critically High (92% employment rate)',
          salary: 'GH₵ 8,000 - GH₵ 20,000+ / mo',
          skills: ['Algorithms', 'Python/JS', 'Data Structures', 'Git']
        },
        business: {
          title: 'Business Administrator & Marketer',
          programs: ['Business Administration', 'Finance & Accounting', 'Marketing & Sales'],
          universities: ['UPSA', 'University of Ghana', 'Central University'],
          description: 'You are highly business-oriented, structured, and an excellent planner and communicator.',
          demand: 'High (80% employment rate)',
          salary: 'GH₵ 6,000 - GH₵ 15,000 / mo',
          skills: ['Leadership', 'Financial Analysis', 'Excel Modeling', 'Pitching']
        },
        datascience: {
          title: 'Data Science & Neural Architect',
          programs: ['Data Science', 'Statistics', 'Mathematics'],
          universities: ['KNUST', 'University of Ghana'],
          description: 'You are passionate about finding hidden patterns in large sets of numbers and building predictions.',
          demand: 'Extremely High (88% employment rate)',
          salary: 'GH₵ 9,000 - GH₵ 22,000 / mo',
          skills: ['Data Mining', 'SQL', 'R/Python', 'Machine Learning']
        },
        engineering: {
          title: 'Engineering & Hardware Systems Specialist',
          programs: ['Electrical & Electronic Engineering', 'Mechanical Engineering'],
          universities: ['KNUST', 'Ashesi University', 'University of Ghana'],
          description: 'You are passionate about physical hardware, electrical circuitry, system control, and machine logistics.',
          demand: 'High (85% employment rate)',
          salary: 'GH₵ 7,000 - GH₵ 18,000 / mo',
          skills: ['Circuit Analysis', 'CAD Modeling', 'Thermodynamics', 'Signal Processing']
        },
        healthcare: {
          title: 'Healthcare Specialist & Clinician',
          programs: ['Nursing & Allied Health', 'Pharmacy', 'Medical Sciences'],
          universities: ['University of Ghana', 'KNUST', 'UCC'],
          description: 'You are deeply caring, methodical, and excel in clinical treatment, biological sciences, and health administration.',
          demand: 'Extremely High (95% employment rate)',
          salary: 'GH₵ 5,000 - GH₵ 12,000 / mo',
          skills: ['Patient Care', 'Clinical Anatomy', 'Pharmacology', 'Ethics']
        },
        law: {
          title: 'Legal Counsel & Policy Advocate',
          programs: ['Bachelor of Laws (LLB)', 'Political Science & Law'],
          universities: ['University of Ghana', 'KNUST', 'GIMPA'],
          description: 'You have outstanding writing, debate, research, and analysis skills. You seek to interpret legal frameworks and advocate for rights.',
          demand: 'High (82% employment rate)',
          salary: 'GH₵ 8,000 - GH₵ 25,000 / mo',
          skills: ['Litigation', 'Legal Research', 'Constitutional Law', 'Debating']
        }
      };

      setSuggestedCareer(careersDb[top as keyof typeof careersDb]);
      setQuizFinished(true);
      addSystemNotification(`AI Quiz compiled. Top path: ${careersDb[top as keyof typeof careersDb].title}`);
    }
  };

  const resetQuiz = () => {
    setCareerScores({ programming: 0, business: 0, datascience: 0, engineering: 0, healthcare: 0, law: 0 });
    setCurrentQ(0);
    setQuizFinished(false);
    setQuizActive(true);
    setSuggestedCareer(null);
  };

  // 3. AI Note Summarizer state variables
  const [activeNoteTitle, setActiveNoteTitle] = useState('');
  const [activeSummary, setActiveSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const triggerNoteSummary = async (noteTitle: string) => {
    setActiveNoteTitle(noteTitle);
    setActiveSummary('');
    setLoadingSummary(true);
    setTab('student', 'student-notes'); // stay on tab
    
    try {
      const response = await axios.post('/api/ai/summarize', { title: noteTitle });
      setActiveSummary(response.data.summary);
    } catch (err: any) {
      console.error('Note summarizer error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Server offline or key misconfigured.';
      setActiveSummary(`⚠️ **AI Summarization Failed:** ${errMsg}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 4. Assignments Submission Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [targetAsg, setTargetAsg] = useState<{ id: string; title: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittingFile, setSubmittingFile] = useState(false);
  const [plagiarismVerdict, setPlagiarismVerdict] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleHomeworkSubmission = async () => {
    if (!targetAsg || !selectedFile) return;
    setSubmittingFile(true);
    setPlagiarismVerdict(null);

    try {
      const pScore = await submitAssignment(targetAsg.id, selectedFile);
      setPlagiarismVerdict(pScore);
      addSystemNotification(`Submitted file: ${selectedFile.name}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFile(false);
      setSelectedFile(null);
    }
  };

  // 5. Daily study planner
  const [hoursToStudy, setHoursToStudy] = useState(4);
  const [studyPlanResult, setStudyPlanResult] = useState('');
  const [planningTime, setPlanningTime] = useState(false);

  const calculateStudyPlan = async () => {
    setPlanningTime(true);
    setStudyPlanResult('');
    try {
      const prompt = `Generate a customized study timetable for a ${hoursToStudy}-hour study session covering CS101 and MATH102. Format the response as a clean study timetable detailing Session 1, breaks, Session 2, and final checks. Reference academic parameters and Ghanaian environment detail if relevant.`;
      const response = await axios.post('/api/ai/chat', { mode: 'study', message: prompt });
      setStudyPlanResult(response.data.response);
    } catch (err: any) {
      console.error('Study planner error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Error communicating with AI services.';
      setStudyPlanResult(`⚠️ **Failed to generate study plan:** ${errMsg}`);
    } finally {
      setPlanningTime(false);
    }
  };

  // 6. Multi-mode AI chat assistant variables
  const [chatMode, setChatMode] = useState<'study' | 'career' | 'helper' | 'tutor' | 'wellness'>('study');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Study Assistant. Ask me to explain concepts, generate study summaries, or translate lecture notes.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleChatModeSwitch = (mode: typeof chatMode) => {
    setChatMode(mode);
    let greeting = '';
    if (mode === 'study') greeting = 'Hello! I am your AI Study Assistant. Ask me to explain concepts, generate study summaries, or translate lecture notes.';
    if (mode === 'career') greeting = 'Welcome! I am your AI Career Advisor. Tell me your skills and interests, and I will suggest programs and Ghanaian universities.';
    if (mode === 'helper') greeting = 'I am your Assignment Helper. Drop questions or paste guidelines to get structural feedback and plagiarism screenings.';
    if (mode === 'tutor') greeting = 'Hey! I am your AI Programming Tutor. Paste your buggy code or coding concepts, and let\'s debug together!';
    if (mode === 'wellness') greeting = 'Greetings. I am your Mental Wellness Companion. Please note: I am an AI, not a doctor. If you are experiencing serious stress or depression, please contact your university student counselor immediately.';
    setChatHistory([{ sender: 'ai', text: greeting }]);
  };

  const handleSendAiMessage = async () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: msg }]);
    setChatLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', { mode: chatMode, message: msg });
      setChatHistory(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error communicating with AI services. Verify your server connection or API keys.';
      setChatHistory(prev => [...prev, { sender: 'ai', text: `⚠️ **AI Service Error:** ${errorMsg}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // 7. Ghana Universities state & query management
  const [unis, setUnis] = useState<any[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Public' | 'Private'>('All');
  const [selectedUniForModal, setSelectedUniForModal] = useState<any | null>(null);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-xs items-center mt-2.5" title={`Rating: ${rating.toFixed(1)} / 5`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fillPercentage = Math.min(Math.max((rating - i) * 100, 0), 100);
          return (
            <span key={i} className="relative text-slate-600 select-none text-[15px] leading-none">
              ★
              <span 
                className="absolute top-0 left-0 overflow-hidden text-amber-400 select-none"
                style={{ width: `${fillPercentage}%` }}
              >
                ★
              </span>
            </span>
          );
        })}
        <span className="text-slate-500 text-[10px] ml-1.5 font-extrabold">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const getMappedRecommendations = (uni: any) => {
    const name = uni.name.toLowerCase();
    if (name.includes('ashesi')) return ['Software Engineering', 'Business Management', 'Tech Entrepreneurship'];
    if (name.includes('ghana (ug)') || name.includes('legon')) return ['Medicine & Health', 'Law & Public Policy', 'Corporate Finance', 'Humanities'];
    if (name.includes('kwame nkrumah') || name.includes('knust')) return ['Mechanical & Civil Engineering', 'Computer Engineering', 'Pharmacy & Health'];
    if (name.includes('cape coast (ucc)')) return ['Educational Pedagogy', 'Accounting & Finance', 'Optometry'];
    if (name.includes('professional studies') || name.includes('upsa')) return ['Chartered Accounting', 'Marketing & Sales', 'Public Relations'];
    if (name.includes('mines and tech') || name.includes('umat')) return ['Mining & Geological Engineering', 'Petroleum Engineering'];
    if (name.includes('health and allied') || name.includes('uhas')) return ['Clinical Medicine', 'General Nursing', 'Medical Lab Science'];
    if (name.includes('energy and natural') || name.includes('uenr')) return ['Renewable Energy', 'Natural Resources Management'];
    if (name.includes('development studies') || name.includes('uds')) return ['Rural Development', 'Public Health', 'Agronomy'];
    if (name.includes('education, winneba') || name.includes('uew')) return ['Teacher Education', 'Mathematics Instruction'];
    if (name.includes('management and public') || name.includes('gimpa')) return ['Public Administration', 'Corporate Law', 'Executive Business'];
    if (name.includes('academic city')) return ['Robotics & Automation', 'Artificial Intelligence', 'Industrial Design'];
    if (name.includes('all nations') || name.includes('anu')) return ['Space Sciences & Satellites', 'Electronics Engineering'];
    if (name.includes('technical')) return ['TVET Technology', 'Applied Engineering', 'Vocational Arts'];
    
    if (uni.programsOffered && uni.programsOffered.length > 0) {
      return uni.programsOffered.slice(0, 2).map((p: string) => p.replace(/^(BSc|BA|BEd|BTech|Doctor of|Bachelor of)\s+/, ''));
    }
    return ['General Academics', 'Career Readiness'];
  };

  useEffect(() => {
    if (currentStudentTab !== 'student-universities') return;
    const loadUniversities = async () => {
      setLoadingUnis(true);
      try {
        const url = `/api/universities?search=${encodeURIComponent(searchQuery)}` + 
          (selectedType !== 'All' ? `&type=${selectedType}` : '');
        const res = await axios.get(url);
        setUnis(res.data);
      } catch (err) {
        showToast('Failed to load universities.', 'error');
      } finally {
        setLoadingUnis(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      loadUniversities();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentStudentTab, searchQuery, selectedType]);

  // AI Research Assistant Local States
  const [researchSearchQuery, setResearchSearchQuery] = useState('');
  const [researchPapers, setResearchPapers] = useState<any[]>([]);
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [citationFields, setCitationFields] = useState({ title: '', authors: '', journal: '', year: '', volume: '', pages: '' });
  const [activeCitationFormat, setActiveCitationFormat] = useState<'APA' | 'Harvard' | 'IEEE' | 'MLA'>('APA');
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [methodologyTopic, setMethodologyTopic] = useState('');
  const [methodologyDraft, setMethodologyDraft] = useState('');
  const [methodologyDomain, setMethodologyDomain] = useState('Computer Science & ICT');
  const [analyzingMethodology, setAnalyzingMethodology] = useState(false);
  const [methodologyFeedback, setMethodologyFeedback] = useState('');
  const [abstractToSummarize, setAbstractToSummarize] = useState('');
  const [summarizingAbstract, setSummarizingAbstract] = useState(false);
  const [abstractSummary, setAbstractSummary] = useState('');

  // Innovation Hub Local States
  const [innovationIdea, setInnovationIdea] = useState({ name: '', industry: 'AgriTech', audience: '', description: '' });
  const [validatingBusiness, setValidatingBusiness] = useState(false);
  const [businessValidationResult, setBusinessValidationResult] = useState('');
  const [studentStartups, setStudentStartups] = useState<any[]>([
    { id: '1', name: 'SusuSmart', industry: 'FinTech', description: 'Micro-savings and credit rating platform for market women in Kumasi using SMS prompts and USSD.', founder: 'Efua Ampah', upvotes: 12, joined: false },
    { id: '2', name: 'EcoCharcoal', industry: 'CleanEnergy', description: 'Transforming agricultural waste in Northern Region into smokeless organic charcoal briquettes.', founder: 'Emmanuel Tetteh', upvotes: 9, joined: false }
  ]);
  const [newStartup, setNewStartup] = useState({ name: '', industry: 'AgriTech', description: '' });
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [mentorMessage, setMentorMessage] = useState('');

  // AI Research Assistant Handler Functions
  const handleResearchSearch = async () => {
    if (!researchSearchQuery.trim()) return;
    setLoadingResearch(true);
    setResearchPapers([]);
    try {
      const res = await axios.get(`/api/ai/research/search?query=${encodeURIComponent(researchSearchQuery)}`);
      setResearchPapers(res.data);
    } catch (err) {
      showToast('Error searching research databases.', 'error');
    } finally {
      setLoadingResearch(false);
    }
  };

  const handleGenerateCitation = () => {
    const { title, authors, journal, year, volume, pages } = citationFields;
    if (!title || !authors || !year) {
      showToast('Please fill in Title, Authors, and Year.', 'error');
      return;
    }
    let citation = '';
    if (activeCitationFormat === 'APA') {
      citation = `${authors} (${year}). ${title}. ${journal ? `${journal}` : ''}${volume ? `, ${volume}` : ''}${pages ? `, ${pages}` : ''}.`;
    } else if (activeCitationFormat === 'Harvard') {
      citation = `${authors}, ${year}. ${title}. ${journal ? `${journal}` : ''}${volume ? `, ${volume}` : ''}${pages ? `, pp.${pages}` : ''}.`;
    } else if (activeCitationFormat === 'IEEE') {
      citation = `${authors}, "${title}," ${journal ? `${journal}` : ''}${volume ? `, vol. ${volume}` : ''}${pages ? `, pp. ${pages}` : ''}, ${year}.`;
    } else if (activeCitationFormat === 'MLA') {
      citation = `${authors}. "${title}." ${journal ? `${journal},` : ''} ${volume ? `${volume},` : ''} ${year}${pages ? `, pp. ${pages}` : ''}.`;
    }
    setGeneratedCitation(citation);
  };

  const handleAnalyzeMethodology = async () => {
    if (!methodologyDraft.trim() || !methodologyTopic.trim()) {
      showToast('Please enter your research topic and draft outline.', 'error');
      return;
    }
    setAnalyzingMethodology(true);
    setMethodologyFeedback('');
    try {
      const prompt = `Analyze this research methodology outline for literature gaps and local Ghanaian application context:\n\nTopic: ${methodologyTopic}\nDomain: ${methodologyDomain}\nOutline: ${methodologyDraft}. Please provide a structured critique including gaps, local integration tips, and 3 specific research questions.`;
      const res = await axios.post('/api/ai/chat', { mode: 'research', message: prompt });
      setMethodologyFeedback(res.data.response);
    } catch (err: any) {
      setMethodologyFeedback(`⚠️ **Failed to analyze methodology:** ${err.response?.data?.message || err.message || 'Server offline.'}`);
    } finally {
      setAnalyzingMethodology(false);
    }
  };

  const handleSummarizeAbstract = async () => {
    if (!abstractToSummarize.trim()) {
      showToast('Please paste a research abstract.', 'error');
      return;
    }
    setSummarizingAbstract(true);
    setAbstractSummary('');
    try {
      const prompt = `Provide a structured summary of the following research abstract including: 1. Main Objective, 2. Methodology, 3. Key Findings, 4. Critical Limitations.\n\nAbstract:\n${abstractToSummarize}`;
      const res = await axios.post('/api/ai/chat', { mode: 'research', message: prompt });
      setAbstractSummary(res.data.response);
    } catch (err: any) {
      setAbstractSummary(`⚠️ **Summarization error:** ${err.response?.data?.message || err.message || 'Server offline.'}`);
    } finally {
      setSummarizingAbstract(false);
    }
  };

  // Innovation Hub Handler Functions
  const handleValidateBusiness = async () => {
    const { name, industry, audience, description } = innovationIdea;
    if (!name.trim() || !description.trim()) {
      showToast('Please fill in business name and description.', 'error');
      return;
    }
    setValidatingBusiness(true);
    setBusinessValidationResult('');
    try {
      const prompt = `Evaluate this student business proposal for viability in the Ghanaian market:\n\nBusiness Name: ${name}\nIndustry: ${industry}\nTarget Audience: ${audience}\nSummary: ${description}. Please include: 1. Value Proposition Strength, 2. Local Market Opportunities & Risks, 3. Ghana Regulatory Compliance Steps (FDA, GSA, etc.), 4. Local Funding & Next Steps.`;
      const res = await axios.post('/api/ai/chat', { mode: 'innovation', message: prompt });
      setBusinessValidationResult(res.data.response);
    } catch (err: any) {
      setBusinessValidationResult(`⚠️ **Business Plan Validation Failed:** ${err.response?.data?.message || err.message || 'Server offline.'}`);
    } finally {
      setValidatingBusiness(false);
    }
  };

  const handleAddStartup = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, industry, description } = newStartup;
    if (!name.trim() || !description.trim()) {
      showToast('Please fill in startup name and description.', 'error');
      return;
    }
    const newId = (studentStartups.length + 1).toString();
    const created = {
      id: newId,
      name,
      industry,
      description,
      founder: user?.name || 'Kofi Mensah',
      upvotes: 1,
      joined: false
    };
    setStudentStartups(prev => [created, ...prev]);
    setNewStartup({ name: '', industry: 'AgriTech', description: '' });
    showToast('🚀 Your startup project has been submitted to the showcase marketplace!', 'success');
  };

  const handleUpvoteStartup = (id: string) => {
    setStudentStartups(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, upvotes: s.upvotes + 1 };
      }
      return s;
    }));
    showToast('🔺 Upvoted startup concept!', 'success');
  };

  const handleJoinStartup = (id: string) => {
    setStudentStartups(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, joined: true };
      }
      return s;
    }));
    showToast('🤝 Request sent to the founder to collaborate on this startup team!', 'success');
  };

  const handleContactMentor = () => {
    if (!mentorMessage.trim()) return;
    showToast(`📩 Message sent to ${selectedMentor?.name}. They will review and contact you!`, 'success');
    setSelectedMentor(null);
    setMentorMessage('');
  };

  return (
    <div className="flex-grow p-8 overflow-y-auto max-h-screen relative">
      
      {/* 1. Header portal title block */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-violet-500 font-bold text-xs uppercase tracking-wider">Workspace Desk</span>
          <h2 className="text-2xl font-black font-sans mt-1">
            {user?.role === 'researcher' ? 'Research Workspace Desk' : user?.role === 'entrepreneur' ? 'Founder Venture Desk' : 'Student Portal Space'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTab('student', 'student-ai-chat-tab')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            AI Assistant Chat
          </button>
        </div>
      </div>

      {/* 2. Portal tabs routing panels */}
      <AnimatePresence mode="wait">
        
        {/* STUDENT DASHBOARD TAB */}
        {currentStudentTab === 'student-dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {user?.role === 'researcher' ? (
              // 🔬 RESEARCHER DASHBOARD VIEW
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-base mb-4">Research Overview & Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-violet-950/20 to-slate-950/10">
                      <div>
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Research Area</span>
                        <h4 className="font-extrabold text-sm text-slate-100 mt-1">{user?.researchArea || 'Artificial Intelligence & ML'}</h4>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-800/40 pt-3 mt-4">
                        Focus: Deep learning models & local datasets
                      </div>
                    </div>
                    <div className="glass p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-indigo-950/20 to-slate-950/10">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Affiliation</span>
                        <h4 className="font-extrabold text-sm text-slate-100 mt-1">{user?.institution || 'Kwame Nkrumah University of Science & Tech'}</h4>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-800/40 pt-3 mt-4">
                        Ghana Higher Education Council
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Research Topic Evaluator / Gaps Outline */}
                <div className="glass p-6">
                  <h3 className="font-extrabold text-sm mb-2">🔬 AI Literature Gap & Methodology Analyst</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Paste your research topic and draft methodology outline. The AI will evaluate gaps and suggest Ghanaian contexts.</p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Research Topic (e.g. Solar grid optimization in Ashanti Region)"
                      value={methodologyTopic}
                      onChange={(e) => setMethodologyTopic(e.target.value)}
                      className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500 font-semibold"
                    />
                    <textarea
                      placeholder="Outline your methodology steps here..."
                      value={methodologyDraft}
                      onChange={(e) => setMethodologyDraft(e.target.value)}
                      className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500 font-semibold resize-none"
                    />
                    <button
                      onClick={handleAnalyzeMethodology}
                      disabled={analyzingMethodology}
                      className="py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {analyzingMethodology ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Evaluate Methodology'}
                    </button>
                  </div>
                  {methodologyFeedback && (
                    <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] leading-relaxed text-slate-300 font-semibold whitespace-pre-line max-h-60 overflow-y-auto">
                      {methodologyFeedback}
                    </div>
                  )}
                </div>
              </div>
            ) : user?.role === 'entrepreneur' ? (
              // 💡 ENTREPRENEUR DASHBOARD VIEW
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-base mb-4">Venture Desk Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-violet-950/20 to-slate-950/10">
                      <div>
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Startup Name</span>
                        <h4 className="font-extrabold text-sm text-slate-100 mt-1">{user?.startupName || 'InnovateGhana'}</h4>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-800/40 pt-3 mt-4">
                        Sector: {user?.businessIdea || 'AgriTech Solutions'}
                      </div>
                    </div>
                    <div className="glass p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-emerald-950/20 to-slate-950/10">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Pitch Readiness</span>
                        <h4 className="font-extrabold text-sm text-slate-100 mt-1">Ready for Seed Round</h4>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-800/40 pt-3 mt-4">
                        Phase: Incubating / MVP Development
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pitch Deck Checker */}
                <div className="glass p-6">
                  <h3 className="font-extrabold text-sm mb-2">💡 AI Pitch Deck Checker</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Paste your executive business summary or elevator pitch. The AI will evaluate feasibility, target audience appeal, and Ghanaian regulations (FDA, Registrar General, GSA).</p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Business Pitch Name"
                      value={innovationIdea.name}
                      onChange={(e) => setInnovationIdea({ ...innovationIdea, name: e.target.value })}
                      className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500 font-semibold"
                    />
                    <textarea
                      placeholder="Describe your startup pitch, product mechanism, and revenue model..."
                      value={innovationIdea.description}
                      onChange={(e) => setInnovationIdea({ ...innovationIdea, description: e.target.value })}
                      className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500 font-semibold resize-none"
                    />
                    <button
                      onClick={handleValidateBusiness}
                      disabled={validatingBusiness}
                      className="py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {validatingBusiness ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Evaluate Pitch Feasibility'}
                    </button>
                  </div>
                  {businessValidationResult && (
                    <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] leading-relaxed text-slate-300 font-semibold whitespace-pre-line max-h-60 overflow-y-auto">
                      {businessValidationResult}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 🎓 STANDARD STUDENT DASHBOARD VIEW
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-base mb-4">My Enrolled Courses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(course => (
                      <div key={course.id} className="glass p-5 flex flex-col justify-between min-h-[180px]">
                        <div>
                          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{course.code}</span>
                          <h4 className="font-extrabold text-sm text-slate-100 mt-1 line-clamp-2">{course.title}</h4>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 border-t border-slate-800/40 pt-3">
                          <span>📚 {course.notesCount} notes</span>
                          <span>📝 {course.assignmentsCount} homeworks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stress Emoji log widget */}
                <div className="glass p-6">
                  <h3 className="font-extrabold text-sm mb-2">How are you feeling today?</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Select an emoji to check stress metrics and obtain custom study planning recommendations.</p>
                  <div className="flex gap-3">
                    {[
                      { emoji: '😫', level: 90, desc: 'High Burnout stress' },
                      { emoji: '🤯', level: 80, desc: 'Overwhelmed' },
                      { emoji: '😐', level: 50, desc: 'Stable balance' },
                      { emoji: '😊', level: 25, desc: 'Thriving energy' }
                    ].map(m => (
                      <button
                        key={m.emoji}
                        onClick={() => {
                          updateStressLevel(m.level);
                          addSystemNotification(`Mood logged: ${m.emoji}`);
                        }}
                        className="p-3 bg-slate-950/60 hover:bg-violet-600/10 border border-slate-800/50 hover:border-violet-500/25 rounded-2xl text-xl transition-all cursor-pointer"
                        title={m.desc}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                  
                  {/* Stress bar */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                      <span>Stress Level:</span>
                      <span>{stressLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className={`h-full transition-all duration-500 ${stressLevel > 75 ? 'bg-red-500' : stressLevel > 45 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${stressLevel}%` }}
                      />
                    </div>
                    {stressLevel > 75 && (
                      <p className="text-[10px] leading-relaxed text-red-400 mt-2 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Take a screen break. Put on walking shoes. Use AI advisor to plan lighter study slots today.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* GPA projected sliders sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {user?.role === 'researcher' ? (
                // RESEARCHER SIDEBAR CARD: Citation Builder & Abstract Summary Shortcut
                <>
                  <div className="glass p-6 flex flex-col gap-5 bg-gradient-to-br from-slate-900/40 to-slate-950/30">
                    <div className="text-center">
                      <Award className="w-8 h-8 text-violet-500 mx-auto mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
                      <h3 className="font-extrabold text-sm">APA Citation Builder</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Quickly format reference records</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Authors (e.g. Mensah, K.)"
                        value={citationFields.authors}
                        onChange={(e) => setCitationFields({ ...citationFields, authors: e.target.value })}
                        className="px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-[11px] text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Paper Title"
                        value={citationFields.title}
                        onChange={(e) => setCitationFields({ ...citationFields, title: e.target.value })}
                        className="px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-[11px] text-slate-200"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Year"
                          value={citationFields.year}
                          onChange={(e) => setCitationFields({ ...citationFields, year: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800/60 rounded-xl text-[11px] text-slate-200"
                        />
                        <button
                          onClick={handleGenerateCitation}
                          className="py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] rounded-xl"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    {generatedCitation && (
                      <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl text-[10px] select-all font-semibold leading-relaxed text-slate-300">
                        {generatedCitation}
                      </div>
                    )}
                  </div>
                </>
              ) : user?.role === 'entrepreneur' ? (
                // ENTREPRENEUR SIDEBAR CARD: Startup venture specs & Pitch deck score
                <>
                  <div className="glass p-6 flex flex-col gap-5 bg-gradient-to-br from-slate-900/40 to-slate-950/30">
                    <div className="text-center">
                      <Award className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
                      <h3 className="font-extrabold text-sm">Venture Scoring</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Venture market sizing viability</p>
                    </div>

                    <div className="py-4 bg-slate-950/80 border border-slate-800/60 rounded-2xl text-center">
                      <span className="text-3xl font-black text-emerald-400">88%</span>
                      <span className="text-[10px] block text-slate-500 font-bold uppercase mt-1">Venture Viability Score</span>
                    </div>

                    <div className="text-[10px] leading-relaxed text-slate-400">
                      <p className="font-bold text-slate-300 mb-1">Feasibility Checklist:</p>
                      <ul className="list-disc pl-4 flex flex-col gap-1">
                        <li>Market Demand Validated</li>
                        <li>FDA/GSA Compliance Planned</li>
                        <li>Tech Stack Scalability Verified</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                // STANDARD STUDENT SIDEBAR CARD (CGPA Predictor)
                <>
                  <div className="glass p-6 flex flex-col gap-5 bg-gradient-to-br from-slate-900/40 to-slate-950/30">
                    <div className="text-center">
                      <Award className="w-8 h-8 text-violet-500 mx-auto mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
                      <h3 className="font-extrabold text-sm">Term projected GPA</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Slide anticipated marks to preview projected average</p>
                    </div>
                    
                    {/* Glowing Score Indicator */}
                    <div className="py-4 bg-slate-950/80 border border-slate-800/60 rounded-2xl text-center">
                      <span className={`text-3xl font-black transition-colors ${projectedGpa >= 3.6 ? 'text-emerald-400' : projectedGpa >= 3.0 ? 'text-violet-400' : 'text-amber-400'}`}>
                        {projectedGpa}
                      </span>
                      <span className="text-[10px] block text-slate-500 font-bold uppercase mt-1">Cumulative CGPA</span>
                    </div>

                    {/* Course sliders lists */}
                    <div className="flex flex-col gap-3.5">
                      {[
                        { code: 'CS101', label: 'CS101 Coding', val: csGpa },
                        { code: 'MATH102', label: 'MATH102 Calculus', val: mathGpa },
                        { code: 'ENG201', label: 'ENG201 Software', val: engGpa },
                        { code: 'BUA202', label: 'BUA202 Business', val: buaGpa },
                      ].map(c => (
                        <div key={c.code}>
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                            <span>{c.label}:</span>
                            <span>{getLetter(c.val)}</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="4.0"
                            step="0.5"
                            value={c.val}
                            onChange={(e) => handleGpaSlider(c.code, parseFloat(e.target.value))}
                            className="w-full accent-violet-600 bg-slate-950 h-1 rounded-full border border-slate-800/40 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Planner widget */}
                  <div className="glass p-6">
                    <h3 className="font-extrabold text-sm mb-1">AI Daily study planner</h3>
                    <p className="text-[10px] text-slate-400 mb-4">Set target daily intervals to generate structured lists</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={hoursToStudy}
                        onChange={(e) => setHoursToStudy(parseInt(e.target.value) || 4)}
                        className="w-16 p-2 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-center font-bold text-slate-200"
                      />
                      <button
                        onClick={calculateStudyPlan}
                        disabled={planningTime}
                        className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {planningTime ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Compile'}
                      </button>
                    </div>
                    {studyPlanResult && (
                      <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl text-[10px] leading-relaxed text-slate-300 font-semibold whitespace-pre-line">
                        {studyPlanResult}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* LECTURES NOTES DOWNLOADS TAB */}
        {currentStudentTab === 'student-notes' && (
          <motion.div 
            key="notes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-6">
              <h3 className="font-extrabold text-base mb-2">Available Lecture Material</h3>
              <p className="text-[11px] text-slate-400 mb-6">Select files to download syllabus instructions, or click "AI Summarize" to call our neural analyzer.</p>
              
              <div className="flex flex-col gap-3">
                {notes.map(note => (
                  <div key={note.id} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{note.courseId}</span>
                      <h4 className="font-extrabold text-sm text-slate-100 mt-0.5">{note.title}</h4>
                      <span className="text-[10px] text-slate-400 block mt-1">Uploaded on {note.date} • {note.size}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerNoteSummary(note.title)}
                        className="px-4 py-2 bg-slate-950 border border-slate-800/60 rounded-xl hover:border-violet-500/20 hover:bg-violet-600/10 text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Cpu className="w-3.5 h-3.5 text-violet-400" />
                        AI Summarize
                      </button>
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summarizer Result overlay card */}
            {activeNoteTitle && (
              <div className="glass p-6 border-l-4 border-l-violet-500">
                <h3 className="font-extrabold text-sm mb-3">AI Analysis Result: "{activeNoteTitle}"</h3>
                {loadingSummary ? (
                  <div className="flex items-center gap-2 py-6 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                    Generating structured summarization. Scanning slides files...
                  </div>
                ) : (
                  <div className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-line font-semibold bg-slate-950/60 p-4 rounded-xl border border-slate-800/40">
                    {activeSummary}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* STUDENT ASSIGNMENTS PORTAL */}
        {currentStudentTab === 'student-assignments' && (
          <motion.div 
            key="assignments"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-6">
              <h3 className="font-extrabold text-base mb-2">My Assignments Deadline List</h3>
              <p className="text-[11px] text-slate-400 mb-6">Submit homework files below. File validations check PDF MIME types, and screens plagiarism triggers.</p>
              
              <div className="flex flex-col gap-4">
                {assignments.map(asg => {
                  return (
                    <div key={asg.id} className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex flex-col gap-4">
                      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-800/40 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{asg.courseId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${asg.status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {asg.status}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-100">{asg.title}</h4>
                          <span className="text-[10px] text-red-400 font-bold block mt-1.5">⏰ Due by: {asg.deadline}</span>
                        </div>
                        <div>
                          {asg.status === 'Pending' ? (
                            <button
                              onClick={() => {
                                setTargetAsg({ id: asg.id, title: asg.title });
                                setPlagiarismVerdict(null);
                                setShowSubmitModal(true);
                              }}
                              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                            >
                              Submit homework file
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400">Successfully Uploaded</span>
                          )}
                        </div>
                      </div>

                      {/* Grade feedback display */}
                      {asg.grade ? (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl leading-relaxed text-[11px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-emerald-400 text-xs">Evaluated Score: {asg.grade}/100</span>
                            <span className="text-[9px] text-slate-500 font-bold">Graded by Lecturer</span>
                          </div>
                          <p className="text-slate-300 font-semibold mt-1">"Feedback: {asg.feedback}"</p>
                          
                          {/* AI feedback enhancer */}
                          <div className="mt-3 p-3 bg-violet-600/5 rounded-lg border border-violet-500/20 leading-relaxed">
                            <span className="text-violet-400 font-extrabold text-[10px] block">💡 Neural Feedback Analyzer:</span>
                            <ul className="list-disc list-inside text-slate-400 text-[10px] mt-1 font-semibold flex flex-col gap-0.5">
                              <li>Logical structure matches standard solutions O(N).</li>
                              <li>Excellent design structures. Check AI Study assistant to practice further test questions.</li>
                            </ul>
                          </div>
                        </div>
                      ) : asg.status === 'Submitted' ? (
                        <div className="text-[10px] text-slate-400 font-bold">
                          ⏳ File uploaded successfully. Awaiting Lecturer evaluations and grading queue updates.
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual File Submissions modal overlay dialog */}
            {showSubmitModal && targetAsg && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative">
                  <h3 className="font-black text-base mb-1">Submit: {targetAsg.title}</h3>
                  <p className="text-[10px] text-slate-400 mb-4">Formats supported: PDF, DOCX, ZIP files (Max size: 15MB)</p>
                  
                  {/* File Selector */}
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/60 text-center mb-4 relative cursor-pointer hover:border-violet-500/35 transition-all">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 block truncate">
                      {selectedFile ? selectedFile.name : 'Select or drop your homework file'}
                    </span>
                  </div>

                  {/* Plagiarism scoring results overlay */}
                  {plagiarismVerdict !== null && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] mb-4 font-bold">
                      🛡️ Plagiarism scan complete: **{plagiarismVerdict}% Plagiarism Detected**. Files fully secure and qualified for evaluation.
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowSubmitModal(false)}
                      className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleHomeworkSubmission}
                      disabled={!selectedFile || submittingFile}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      {submittingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm submit'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* INTERACTIVE CAREER QUIZ TABS */}
        {currentStudentTab === 'student-career-guidance' && (
          <motion.div 
            key="career"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-8">
              <div className="text-center max-w-lg mx-auto mb-8">
                <Sparkles className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                <h3 className="font-extrabold text-base">AI Career Interest quiz</h3>
                <p className="text-[11px] text-slate-400 mt-1">Answer 5 personality questions below. SmartLearn Advisor mathematically optimizes your preferences, suggesting Ghanaian programs, campuses, and plots an academic track map!</p>
              </div>

              {/* Active quiz sliding pages */}
              {!quizActive && !quizFinished && (
                <div className="text-center py-8">
                  <button
                    onClick={() => { setQuizActive(true); setQuizFinished(false); setCurrentQ(0); }}
                    className="px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 transition-all cursor-pointer"
                  >
                    Start AI Diagnostic Quiz
                  </button>
                </div>
              )}

              {quizActive && !quizFinished && (
                <div className="max-w-md mx-auto p-6 bg-slate-950/40 rounded-3xl border border-slate-800/60 shadow-xl">
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${((currentQ + 1) / 5) * 100}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-500 block mb-2">Question {currentQ + 1} of 5</span>
                  <h4 className="font-extrabold text-sm mb-4 leading-relaxed">{quizQuestions[currentQ].text}</h4>
                  
                  <div className="flex flex-col gap-2">
                    {quizQuestions[currentQ].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizSelection(opt.score)}
                        className="w-full p-4 bg-slate-900 border border-slate-800/60 hover:border-violet-500/35 hover:bg-violet-600/5 text-left rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all cursor-pointer leading-relaxed"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz finished - results visual boards */}
              {quizFinished && suggestedCareer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-8 max-w-2xl mx-auto"
                >
                  <div className="p-6 bg-violet-600/5 border border-violet-500/20 rounded-3xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">Recommended Career Path</span>
                    <h3 className="text-xl font-black text-white">{suggestedCareer.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-semibold">{suggestedCareer.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-800/40 pt-4 text-xs font-bold leading-relaxed">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Average Income (GH)</span>
                        <span className="text-slate-200">{suggestedCareer.salary}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Syllabus Demand</span>
                        <span className="text-slate-200">{suggestedCareer.demand}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
                      <h4 className="font-extrabold text-sm mb-3">Recommended Campuses</h4>
                      <ul className="flex flex-col gap-2 text-[11px] font-semibold text-slate-300">
                        {suggestedCareer.universities.map((uni: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            📍 <strong>{uni}</strong> - High placements indexes
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
                      <h4 className="font-extrabold text-sm mb-3">Core Prerequisite Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedCareer.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-950 text-slate-400 font-bold border border-slate-800/60 text-[9px] rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Flow chart academic mapping */}
                  <div className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
                    <h4 className="font-extrabold text-sm mb-4">Academic Flow Diagram</h4>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-bold text-xs text-center">
                      <div className="flex-1 p-3 bg-slate-950 border border-slate-800/60 rounded-xl w-full">
                        Core Coding Foundation (CS101)
                      </div>
                      <div className="text-violet-500 font-bold hidden md:block">➔</div>
                      <div className="flex-1 p-3 bg-violet-600/10 border border-violet-500/25 text-violet-400 rounded-xl w-full">
                        Department Admission (3.82 CGPA verified)
                      </div>
                      <div className="text-violet-500 font-bold hidden md:block">➔</div>
                      <div className="flex-1 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl w-full">
                        {suggestedCareer.programs[0]}
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <button
                      onClick={resetQuiz}
                      className="px-5 py-2.5 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Take Quiz Again
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* TIMETABLE CALENDAR GRID PLANNERS */}
        {currentStudentTab === 'student-timetable' && (
          <motion.div 
            key="timetable"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-base">Timetable Board</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Syllabus schedule calendar and milestones deadlines logs</p>
                </div>
                <span className="px-3 py-1 bg-violet-600/10 text-violet-400 font-bold text-[10px] uppercase border border-violet-500/20 rounded-full">
                  May 2026
                </span>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-7 gap-2">
                {/* Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="p-2 border border-slate-800/40 text-center font-black text-[10px] text-slate-400 uppercase bg-slate-950/40 rounded-lg">
                    {d}
                  </div>
                ))}
                
                {/* Inactive empty cells first 5 days */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-h-[70px] bg-slate-950/15 border border-slate-900/10 rounded-lg opacity-40" />
                ))}

                {/* active days 1 to 30 */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === 24;
                  return (
                    <div 
                      key={day} 
                      className={`min-h-[70px] p-2 border rounded-xl flex flex-col justify-between transition-all select-none ${
                        isToday 
                          ? 'border-violet-600 bg-violet-600/5 shadow-md shadow-violet-600/5' 
                          : 'border-slate-800/60 bg-slate-950/20 hover:border-slate-700/60'
                      }`}
                    >
                      <span className={`text-[10px] font-bold ${isToday ? 'text-violet-400' : 'text-slate-400'}`}>{day}</span>
                      
                      {/* Milestones Dot overlays */}
                      {day === 15 && (
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 truncate">Notes Published</span>
                      )}
                      {day === 28 && (
                        <span className="text-[8px] font-bold text-red-400 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 truncate">CS101 Homework</span>
                      )}
                      {day === 30 && (
                        <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 truncate">MATH102 Exam</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI CHAT PANEL SECTION */}
        {currentStudentTab === 'student-ai-chat-tab' && (
          <motion.div 
            key="aichat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left AI Mode pickers */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {[
                { id: 'study' as const, label: 'Study Assistant', desc: 'Explains concepts & generates flashcards.' },
                { id: 'career' as const, label: 'Career Advisor', desc: 'Syllabus tracks & university guidelines.' },
                { id: 'helper' as const, label: 'Assignment Helper', desc: 'Plagiarism checks & format screening.' },
                { id: 'tutor' as const, label: 'Programming Tutor', desc: 'Variable checking & recursive debugging.' },
                { id: 'wellness' as const, label: 'Wellness Companion', desc: 'Stress calculations & calming exercises.' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleChatModeSwitch(mode.id)}
                  className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer ${
                    chatMode === mode.id 
                      ? 'border-violet-600 bg-violet-600/10 text-slate-100 shadow-md shadow-violet-600/5' 
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  <h4 className="font-extrabold text-xs">{mode.label}</h4>
                  <p className="text-[10px] mt-0.5 leading-relaxed text-slate-500 font-semibold">{mode.desc}</p>
                </button>
              ))}
            </div>

            {/* Right Chat dialog viewports */}
            <div className="lg:col-span-8 flex flex-col justify-between min-h-[500px] max-h-[500px] glass p-6 relative">
              <div className="flex-grow overflow-y-auto flex flex-col gap-3 mb-4 pr-2">
                {chatHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 max-w-[85%] rounded-2xl leading-relaxed text-xs font-semibold ${
                      item.sender === 'user' 
                        ? 'bg-violet-600 text-white ml-auto rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed font-semibold">
                      {item.text}
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="p-4 bg-slate-900 border border-slate-800 text-slate-400 mr-auto rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                    Neural Advisor is formulating answer...
                  </div>
                )}
              </div>

              {/* Chat Input box controls */}
              <div className="flex gap-2 border-t border-slate-800/40 pt-4">
                <input
                  type="text"
                  placeholder={`Consult AI ${chatMode} Assistant...`}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAiMessage();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                />
                <button
                  onClick={handleSendAiMessage}
                  disabled={chatLoading}
                  className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/10 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* CLASS QUIZZES PORTAL */}
        {currentStudentTab === 'student-quizzes' && (
          <motion.div 
            key="quizzes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div className="glass p-6">
              <h3 className="font-extrabold text-base mb-2">Available Quizzes</h3>
              <p className="text-[11px] text-slate-400 mb-6">Take objective and essay evaluations. Quizzes feature automatic countdown timers.</p>

              <div className="flex flex-col gap-3">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{quiz.courseId}</span>
                      <h4 className="font-extrabold text-sm text-slate-100 mt-0.5">{quiz.title}</h4>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        ⏱️ Time: {quiz.timeLimit} mins • Points: {quiz.totalPoints} max • {quiz.questionsCount || 0} questions
                      </span>
                    </div>

                    <div>
                      {quiz.taken ? (
                        <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-black text-emerald-400">
                          Completed: {quiz.score} pts ({quiz.graded ? 'Graded' : 'Awaiting Grading'})
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                        >
                          Start Test
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <p className="text-center text-slate-500 py-6">No quizzes published for your courses.</p>
                )}
              </div>
            </div>

            {/* Active quiz interface modal */}
            {quizInProgress && activeQuiz && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative my-8">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{activeQuiz.courseId}</span>
                      <h3 className="font-black text-base mt-0.5">{activeQuiz.title}</h3>
                    </div>
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold text-sm animate-pulse">
                      ⏳ Time Left: {Math.floor(quizTimer / 60)}:{(quizTimer % 60).toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 mb-6">
                    {activeQuiz.questions?.map((q: any, idx: number) => (
                      <div key={q.id || idx} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/40">
                        <span className="text-[10px] font-black text-slate-500 block mb-1">Question {idx + 1}</span>
                        <p className="text-xs font-extrabold text-slate-200 mb-3">{q.questionText}</p>

                        {q.questionType === 'MCQ' ? (
                          <div className="flex flex-col gap-2">
                            {q.options?.map((opt: string, optIdx: number) => (
                              <label key={optIdx} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-semibold select-none transition-all ${quizAnswers[q.id] === opt ? 'border-violet-500 bg-violet-600/5 text-violet-400' : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700/60'}`}>
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value={opt}
                                  checked={quizAnswers[q.id] === opt}
                                  onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  className="hidden"
                                />
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${quizAnswers[q.id] === opt ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-700'}`}>{optIdx + 1}</span>
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : q.questionType === 'True/False' ? (
                          <div className="flex gap-2">
                            {['True', 'False'].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: val }))}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${quizAnswers[q.id] === val ? 'border-violet-500 bg-violet-600/10 text-violet-400' : 'border-slate-800 bg-slate-900/40 text-slate-500'}`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            placeholder="Write down your solution outline here..."
                            value={quizAnswers[q.id] || ''}
                            onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none min-h-[80px] font-semibold"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end border-t border-slate-800/40 pt-4">
                    <button
                      onClick={handleQuizSubmit}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                    >
                      Finish and Submit Answers
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* CHAT MESSENGER PORTAL */}
        {currentStudentTab === 'student-chat' && (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Lecturers to chat with */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <h3 className="font-extrabold text-sm mb-1 px-1">My Faculty Contacts</h3>
               {courses.map((c) => (
                 <button
                   key={c.id}
                   onClick={() => {
                     if (c.instructorId) {
                       setActiveRecipient(c.instructorId);
                     }
                   }}
                   className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                     activeChatRecipientId === c.instructorId ? 'border-violet-600 bg-violet-600/10 text-slate-100' : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700/60'
                   }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center text-sm font-black border border-violet-500/20">
                    👨‍🏫
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">{c.instructor}</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase">{c.code} Course Instructor</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Chat Dialog Viewport */}
            <div className="lg:col-span-8 flex flex-col justify-between min-h-[500px] max-h-[500px] glass p-6 relative">
              {activeChatRecipientId ? (
                <>
                  <div className="flex-grow overflow-y-auto flex flex-col gap-3 mb-4 pr-2">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-4 max-w-[80%] rounded-2xl leading-relaxed text-xs font-semibold ${
                          msg.senderId === user?.id 
                            ? 'bg-violet-600 text-white ml-auto rounded-tr-none' 
                            : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.message}</p>
                        
                        {msg.fileUrl && (
                          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] flex items-center gap-1.5 font-black">
                            📁 <a href={msg.fileUrl} download className="underline hover:text-slate-200">{msg.fileName || 'Attachment'}</a>
                          </div>
                        )}
                        <span className="text-[8px] text-slate-400 block mt-1.5 text-right font-bold">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {msg.read && '✓✓'}
                        </span>
                      </div>
                    ))}
                    
                    {typingStatus['60d5ec4b1234567890abcdef'] && (
                      <p className="text-[10px] text-slate-500 animate-pulse font-bold px-1">Lecturer is typing...</p>
                    )}
                  </div>

                  {/* Attachment indicator */}
                  {chatAttachment && (
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center justify-between mb-2">
                      <span className="truncate">📎 Selected: {chatAttachment.name}</span>
                      <button onClick={() => setChatAttachment(null)} className="text-red-400 hover:text-red-300 font-bold">Remove</button>
                    </div>
                  )}

                  {/* Chat input form */}
                  <div className="flex gap-2 border-t border-slate-800/40 pt-4">
                    <label className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700/60 rounded-xl cursor-pointer text-slate-400 flex items-center justify-center">
                      <input 
                        type="file" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) setChatAttachment(e.target.files[0]);
                        }} 
                        className="hidden" 
                      />
                      📎
                    </label>
                    <input
                      type="text"
                      placeholder="Write your message here..."
                      value={chatText}
                      onChange={(e) => {
                        setChatText(e.target.value);
                        if (!isTyping) {
                          setIsTyping(true);
                          sendTypingStatus(activeChatRecipientId, true);
                        }
                        if (e.target.value === '') {
                          setIsTyping(false);
                          sendTypingStatus(activeChatRecipientId, false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMsg();
                      }}
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-none transition-all font-semibold"
                    />
                    <button
                      onClick={handleSendChatMsg}
                      className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center text-slate-500 text-xs">
                  Select a faculty member on the left panel to begin text chat.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STUDENT CONSULTATIONS PORTAL */}
        {currentStudentTab === 'student-consultations' && (
          <motion.div 
            key="consultations"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Booking list */}
            <div className="lg:col-span-8 glass p-6">
              <h3 className="font-extrabold text-sm mb-4">My Booked Sessions</h3>
              <div className="flex flex-col gap-3">
                {consultations.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-200">{c.topic}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Lecturer: <strong>{c.lecturerName}</strong> • Duration: {c.duration} mins
                      </p>
                      <span className="text-[10px] text-violet-400 font-bold block mt-1.5">
                        📅 Scheduled: {new Date(c.scheduledTime).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                        c.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : c.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-violet-500/10 text-violet-400'
                      }`}>
                        {c.status}
                      </span>
                      {c.status === 'Scheduled' && (
                        <a
                          href={c.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[10px] rounded-xl shadow-md flex items-center gap-1 transition-all"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {consultations.length === 0 && (
                  <p className="text-center text-slate-500 py-6">No consultation appointments booked.</p>
                )}
              </div>
            </div>

            {/* Booking creation form */}
            <div className="lg:col-span-4 glass p-6">
              <h3 className="font-extrabold text-sm mb-3">Book Video Slot</h3>
              <form onSubmit={handleConsultBooking} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Lecturer:</label>
                  <select
                    value={bookingLecturerId}
                    onChange={(e) => setBookingLecturerId(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">Select Lecturer...</option>
                    {courses.map(c => <option key={c.id} value="60d5ec4b1234567890abcdef">{c.instructor}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Date & Time:</label>
                  <input
                    type="datetime-local"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Discussion Topic:</label>
                  <input
                    type="text"
                    placeholder="Project proposal feedback..."
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                <button type="submit" className="w-full mt-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                  Book Consultation 📹
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* DISCUSSION FORUM TAB */}
        {currentStudentTab === 'student-forum' && (
          <motion.div 
            key="forum"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Create forum thread form */}
            <div className="lg:col-span-4 glass p-6 h-fit">
              <h3 className="font-extrabold text-sm mb-3">Create Discussion</h3>
              <form onSubmit={handleNewForumPost} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Category Tag:</label>
                  <select
                    value={forumCategory}
                    onChange={(e) => setForumCategory(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 cursor-pointer"
                  >
                    <option>Computer Science</option>
                    <option>Mathematics</option>
                    <option>Business Administration</option>
                    <option>General Discussions</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Thread Title:</label>
                  <input
                    type="text"
                    placeholder="Topic title..."
                    value={forumTitle}
                    onChange={(e) => setForumTitle(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Message Body:</label>
                  <textarea
                    placeholder="Provide details about your question..."
                    value={forumBody}
                    onChange={(e) => setForumBody(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none min-h-[100px]"
                    required
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                  Publish Thread 📣
                </button>
              </form>
            </div>

            {/* List threads */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <h3 className="font-extrabold text-sm px-1">Active Discussions Board</h3>
              {forumThreads.map((thread) => (
                <div key={thread.id} className="glass p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start flex-wrap gap-2 border-b border-slate-800/40 pb-4">
                    <div>
                      <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] rounded-full font-bold uppercase">{thread.category}</span>
                      <h4 className="font-black text-sm text-slate-100 mt-2">{thread.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{thread.body}</p>
                      <span className="text-[10px] text-slate-500 block mt-3 font-semibold">
                        Posted by <strong>{thread.author}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => upvoteThread(thread.id)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-violet-600/10 border border-slate-800 text-[11px] font-black text-slate-300 rounded-xl transition-all cursor-pointer"
                    >
                      🔺 Upvote ({thread.upvotes})
                    </button>
                  </div>

                  {/* Comment list */}
                  <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
                    <span className="text-[9px] font-black text-slate-500 block uppercase mb-1">Replies ({thread.replies.length})</span>
                    {thread.replies.map((rep, repIdx) => (
                      <div key={repIdx} className="p-2.5 bg-slate-900/40 rounded-xl text-[11px] leading-relaxed border border-slate-850">
                        <div className="flex justify-between text-[9px] text-slate-500 font-bold mb-1">
                          <span>{rep.author} ({rep.role})</span>
                        </div>
                        <p className="text-slate-300">{rep.body}</p>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800/30">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={replyTexts[thread.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [thread.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleForumCommentSubmit(thread.id);
                        }}
                        className="flex-grow px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs placeholder-slate-500 text-slate-200 focus:outline-none"
                      />
                      <button
                        onClick={() => handleForumCommentSubmit(thread.id)}
                        className="px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* GHANA UNIVERSITIES HUB TAB */}
        {currentStudentTab === 'student-universities' && (
          <motion.div
            key="universities"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            {/* Search and Filters row */}
            <div className="glass p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search universities by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-805 dark:border-slate-800/60 rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                {(['All', 'Public', 'Private'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedType === type
                        ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/10'
                        : 'bg-slate-900 border-slate-800/60 text-slate-400 hover:border-slate-700/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Universities */}
            {loadingUnis ? (
              <div className="flex justify-center items-center py-20 text-slate-400 text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                Loading dynamic university profiles...
              </div>
            ) : unis.length === 0 ? (
              <div className="glass p-12 text-center text-slate-500 text-xs font-semibold">
                No universities match your search criteria. Try a different query!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unis.map((uni) => (
                  <div key={uni.id} className="glass overflow-hidden flex flex-col justify-between h-full border border-slate-800/50 hover:border-violet-500/20 transition-all duration-300 group">
                    <div>
                      {/* Image container */}
                      <div className="relative h-44 overflow-hidden bg-slate-950">
                        <img
                          src={uni.image}
                          alt={uni.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const imgEl = e.currentTarget;
                            imgEl.src = 'picture/ug_campus.jpg';
                          }}
                        />
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md border border-violet-500/20 rounded-lg text-[10px] font-black text-violet-400">
                          🏆 Rank #{uni.ranking}
                        </div>
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                          {uni.type}
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-5">
                        <h4 className="font-black text-sm text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">{uni.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(uni.name + ' ' + uni.location)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-violet-400 transition-colors inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {uni.location} • Est. {uni.established} 🗺️
                          </a>
                        </div>
                        {renderStars(5.0 - (uni.ranking * 0.01) - (uni.type === 'Private' ? 0.05 : 0))}
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-3 line-clamp-2">
                          {uni.academicsInfo}
                        </p>

                        <ul className="flex flex-col gap-2 mt-4 border-t border-slate-800/20 pt-4 text-[10px] text-slate-400 font-semibold">
                          <li className="flex justify-between">
                            <span className="text-slate-500">💰 School Fees:</span>
                            <span className="text-slate-300 font-bold">{uni.feesRange}</span>
                          </li>
                          <li className="flex flex-col gap-1 mt-1">
                            <span className="text-slate-500">🎓 Scholarships:</span>
                            <span className="text-slate-300 line-clamp-1">{uni.scholarshipsInfo}</span>
                          </li>
                          <li className="flex flex-col gap-1 mt-1">
                            <span className="text-slate-500">🎯 AI Mapped Recommendations:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getMappedRecommendations(uni).map((rec: string, rIdx: number) => (
                                <span key={rIdx} className="px-2 py-0.5 bg-violet-950/40 text-violet-400 border border-violet-800/30 text-[8px] rounded font-bold">
                                  {rec}
                                </span>
                              ))}
                            </div>
                          </li>
                          <li className="flex flex-col gap-1 mt-1">
                            <span className="text-slate-500">💬 Campus Review:</span>
                            <span className="text-slate-300 font-medium italic line-clamp-2">"{uni.performanceReview}"</span>
                          </li>
                          <li className="flex flex-col gap-1 mt-1">
                            <span className="text-slate-500">📚 Top Programs:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {uni.programsOffered.slice(0, 3).map((prog: string, pIdx: number) => (
                                <span key={pIdx} className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 text-[8px] rounded font-bold">
                                  {prog}
                                </span>
                              ))}
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* View requirements CTA */}
                    <div className="p-5 pt-0 mt-2">
                      <button
                        onClick={() => setSelectedUniForModal(uni)}
                        className="w-full py-2.5 bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 hover:border-violet-500 text-violet-400 hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer text-center"
                      >
                        View Admission Terms
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STUDENT RESEARCH ASSISTANT TAB */}
        {currentStudentTab === 'student-research' && (
          <motion.div
            key="research-portal"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            {/* Top banner */}
            <div className="glass p-6 bg-gradient-to-br from-violet-950/20 to-indigo-950/20 border-violet-500/20">
              <h3 className="font-extrabold text-base mb-1 text-slate-100 flex items-center gap-2">
                🔬 AI Research Portal & Assistant
              </h3>
              <p className="text-[11px] text-slate-400">
                Conduct university-level research with neural support. Search global databases, critique your methodologies, format bibliographies, and summarize scientific abstracts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Search & Citations */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Paper Search Engine */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">🔍 Academic Search Engine (EuropePMC)</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Query database indexes for publications, clinical studies, and technical papers.</p>
                  
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Enter research keywords (e.g. AgriTech Ghana, IoT)..."
                      value={researchSearchQuery}
                      onChange={(e) => setResearchSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleResearchSearch(); }}
                      className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-500 font-semibold"
                    />
                    <button
                      onClick={handleResearchSearch}
                      disabled={loadingResearch}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loadingResearch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                    </button>
                  </div>

                  {/* Research Papers Result List */}
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {researchPapers.map((paper) => (
                      <div key={paper.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-[10px] leading-relaxed">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-bold text-slate-200 leading-snug line-clamp-2">{paper.title}</h5>
                          <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[8px] rounded font-bold uppercase shrink-0">{paper.source}</span>
                        </div>
                        <p className="text-slate-400 mt-1 italic font-medium">{paper.authors} ({paper.year})</p>
                        <p className="text-slate-500 font-medium mt-0.5">{paper.journal}</p>
                        
                        {paper.abstract && (
                          <p className="text-slate-400 mt-1.5 bg-slate-950 p-2 rounded border border-slate-900 line-clamp-3 font-semibold">{paper.abstract}</p>
                        )}

                        <div className="flex gap-2 mt-2 pt-2 border-t border-slate-900">
                          {paper.doi && (
                            <a
                              href={paper.doi}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] text-sky-400 hover:underline font-bold"
                            >
                              🔗 View Full Paper
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setAbstractToSummarize(paper.abstract || `Title: ${paper.title}\nAuthors: ${paper.authors}\nJournal: ${paper.journal}, ${paper.year}`);
                              showToast('Paper details copied to Abstract Summarizer below!', 'info');
                            }}
                            className="text-[9px] text-violet-400 hover:underline font-bold ml-auto"
                          >
                            📝 Summarize Abstract
                          </button>
                        </div>
                      </div>
                    ))}
                    {!loadingResearch && researchPapers.length === 0 && (
                      <p className="text-center text-slate-500 py-6">Search for a topic above to pull papers.</p>
                    )}
                  </div>
                </div>

                {/* Reference & Citation Builder */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">📋 Reference & Citation Generator</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Input paper details below to compile formatted academic bibliographies.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Article Title</label>
                      <input
                        type="text"
                        placeholder="E.g., IoT Soil Monitoring..."
                        value={citationFields.title}
                        onChange={(e) => setCitationFields(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-350 focus:outline-none placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Authors (LastName, F. M.)</label>
                      <input
                        type="text"
                        placeholder="E.g., Mensah, K., Ampah, E."
                        value={citationFields.authors}
                        onChange={(e) => setCitationFields(prev => ({ ...prev, authors: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-350 focus:outline-none placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Journal / Publisher</label>
                      <input
                        type="text"
                        placeholder="E.g., Ghana Science Review"
                        value={citationFields.journal}
                        onChange={(e) => setCitationFields(prev => ({ ...prev, journal: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-350 focus:outline-none placeholder-slate-600"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Year</label>
                        <input
                          type="text"
                          placeholder="2025"
                          value={citationFields.year}
                          onChange={(e) => setCitationFields(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-350 text-center focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Vol/Issue</label>
                        <input
                          type="text"
                          placeholder="12(4)"
                          value={citationFields.volume}
                          onChange={(e) => setCitationFields(prev => ({ ...prev, volume: e.target.value }))}
                          className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-350 text-center focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Pages</label>
                        <input
                          type="text"
                          placeholder="45-56"
                          value={citationFields.pages}
                          onChange={(e) => setCitationFields(prev => ({ ...prev, pages: e.target.value }))}
                          className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-350 text-center focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 border-b border-slate-850 pb-3">
                    {(['APA', 'Harvard', 'IEEE', 'MLA'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          setActiveCitationFormat(fmt);
                          setTimeout(handleGenerateCitation, 0);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold transition-all border ${
                          activeCitationFormat === fmt 
                            ? 'bg-violet-600/10 border-violet-500 text-violet-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-500'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateCitation}
                    className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-violet-500/30 hover:bg-violet-600/5 text-slate-200 hover:text-white font-extrabold text-[10px] rounded-xl transition-all cursor-pointer mb-3"
                  >
                    Compile Reference Citation
                  </button>

                  {generatedCitation && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                      <p className="text-[10px] text-slate-300 font-semibold select-all font-mono leading-relaxed">{generatedCitation}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCitation);
                          showToast('Copied citation bibliography!', 'success');
                        }}
                        className="text-[9px] font-bold text-violet-400 hover:underline shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Gap Finder & Summarizer */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Lit Review Gap & Methodology Analyzer */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">🧬 Literature Review & Methodology Gap Finder</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Input your research topic and draft outline. SmartLearn evaluates gaps and outlines Ghanaian regulatory or context considerations.</p>
                  
                  <div className="form-group mb-3">
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Research Subject / Title</label>
                    <input
                      type="text"
                      placeholder="E.g. Blockchain land registration systems in Accra..."
                      value={methodologyTopic}
                      onChange={(e) => setMethodologyTopic(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-300 focus:outline-none placeholder-slate-600 font-semibold"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Select Domain</label>
                    <select
                      value={methodologyDomain}
                      onChange={(e) => setMethodologyDomain(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-300 cursor-pointer"
                    >
                      <option>Computer Science & ICT</option>
                      <option>Agriculture & Food Security</option>
                      <option>Renewable Energy & Power Systems</option>
                      <option>Business & Developmental Finance</option>
                      <option>Health Informatics & Medicine</option>
                      <option>Legal Systems & Constitutional Precedents</option>
                    </select>
                  </div>

                  <div className="form-group mb-4">
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Methodology Draft Outline</label>
                    <textarea
                      placeholder="Describe your research structure, data collection, sample size, or algorithm approaches..."
                      value={methodologyDraft}
                      onChange={(e) => setMethodologyDraft(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-200 placeholder-slate-600 focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeMethodology}
                    disabled={analyzingMethodology}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {analyzingMethodology ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Methodology & Local Gaps ➔'}
                  </button>

                  {methodologyFeedback && (
                    <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-[10px] leading-relaxed text-slate-300 whitespace-pre-line font-semibold">
                      <span className="text-violet-400 font-extrabold text-[10px] block uppercase mb-2">📋 AI Methodology Review:</span>
                      {methodologyFeedback}
                    </div>
                  )}
                </div>

                {/* Abstract Summarizer */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">📑 Scientific Abstract Summarizer</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Paste a long research paper abstract to synthesize the core background, methodologies, key findings, and critical review points.</p>

                  <div className="form-group mb-4">
                    <textarea
                      placeholder="Paste research paper abstract here..."
                      value={abstractToSummarize}
                      onChange={(e) => setAbstractToSummarize(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-200 placeholder-slate-600 focus:outline-none min-h-[90px]"
                    />
                  </div>

                  <button
                    onClick={handleSummarizeAbstract}
                    disabled={summarizingAbstract}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {summarizingAbstract ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze & Summarize Abstract ➔'}
                  </button>

                  {abstractSummary && (
                    <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-[10px] leading-relaxed text-slate-300 whitespace-pre-line font-semibold">
                      <span className="text-violet-400 font-extrabold text-[10px] block uppercase mb-2">📑 Abstract Synthesizer:</span>
                      {abstractSummary}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STUDENT INNOVATION HUB TAB */}
        {currentStudentTab === 'student-innovation' && (
          <motion.div
            key="innovation-hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            {/* Top banner */}
            <div className="glass p-6 bg-gradient-to-br from-indigo-950/20 to-teal-950/20 border-indigo-500/20">
              <h3 className="font-extrabold text-base mb-1 text-slate-100 flex items-center gap-2">
                💡 Student Innovation & Entrepreneurship Hub
              </h3>
              <p className="text-[11px] text-slate-400">
                Turn your final-year research projects into viable commercial startups. Pitch ideas, get AI business model reviews, apply for local university incubator tracks, and request mentorship.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Plan Optimizer */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* AI Business Plan Validator */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">🚀 Startup Pitch Deck & Business Plan Validator</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Pitch your business concept. SmartLearn AI analyzes product-market fit, lists local Ghanaian risks, and details essential regulatory agencies.</p>

                  <div className="form-group mb-3">
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Business Name / Project</label>
                    <input
                      type="text"
                      placeholder="E.g., SusuSmart Savings Platform..."
                      value={innovationIdea.name}
                      onChange={(e) => setInnovationIdea(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-350 focus:outline-none placeholder-slate-600 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Venture Industry</label>
                      <select
                        value={innovationIdea.industry}
                        onChange={(e) => setInnovationIdea(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-350 cursor-pointer"
                      >
                        <option>AgriTech</option>
                        <option>FinTech</option>
                        <option>EdTech</option>
                        <option>CleanEnergy</option>
                        <option>HealthTech & Medical</option>
                        <option>SaaS & ICT</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Target Audience in Ghana</label>
                      <input
                        type="text"
                        placeholder="E.g., market traders in Kumasi..."
                        value={innovationIdea.audience}
                        onChange={(e) => setInnovationIdea(prev => ({ ...prev, audience: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-350 focus:outline-none placeholder-slate-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Pitch Summary / Value Proposition</label>
                    <textarea
                      placeholder="Explain how your system works, what problem it solves, and how you make money..."
                      value={innovationIdea.description}
                      onChange={(e) => setInnovationIdea(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-200 placeholder-slate-600 focus:outline-none min-h-[90px]"
                    />
                  </div>

                  <button
                    onClick={handleValidateBusiness}
                    disabled={validatingBusiness}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {validatingBusiness ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Evaluate Business Viability ➔'}
                  </button>

                  {businessValidationResult && (
                    <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-[10px] leading-relaxed text-slate-300 whitespace-pre-line font-semibold">
                      <span className="text-violet-400 font-extrabold text-[10px] block uppercase mb-2">📋 AI Venture Review:</span>
                      {businessValidationResult}
                    </div>
                  )}
                </div>

                {/* Incubators directory */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-4">🏛️ Tertiary Incubators & Accelators Pathways</h4>
                  
                  <div className="flex flex-col gap-4">
                    {[
                      { name: 'Ashesi Venture Incubator (AVI)', location: 'Berekuso Hilltop', details: '1 year cohort for graduating students. Includes business coaching, industry mentors, and GHS 25,000 equity-free seed grants.' },
                      { name: 'KNUST Kumasi Hive', location: 'Kumasi, Kentinkrono', details: 'Maker-space and incubation hub. Technical hardware testing, IoT lab equipment access, and connection to regional angel syndicates.' },
                      { name: 'MEST Africa', location: 'East Legon, Accra', details: 'Pre-seed tech startup incubator. Offers intensive software entrepreneurship courses and up to $100,000 venture funding.' },
                      { name: 'University of Ghana Innovation Hub', location: 'Legon Campus', details: 'Incubates UG student projects, offering workspace, mentoring from Legon business alumni, and annual pitch events.' }
                    ].map((inc, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl text-[10px] leading-relaxed">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-slate-200">{inc.name}</h5>
                          <span className="text-[8px] text-slate-500 font-bold">{inc.location}</span>
                        </div>
                        <p className="text-slate-400 font-medium">{inc.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Startups Showcase & Mentors */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Student Startups Showcase */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">🛒 Student Startups Showcase Marketplace</h4>
                  <p className="text-[10px] text-slate-400 mb-4">View innovations by fellow student founders, upvote outstanding ideas, or apply to join their technical teams.</p>
                  
                  {/* Submission Form */}
                  <form onSubmit={handleAddStartup} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl mb-4 flex flex-col gap-3">
                    <span className="text-[9px] font-black text-violet-400 uppercase tracking-wider block">List Your Project</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Venture Name..."
                        value={newStartup.name}
                        onChange={(e) => setNewStartup(prev => ({ ...prev, name: e.target.value }))}
                        className="px-2 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] focus:outline-none"
                      />
                      <select
                        value={newStartup.industry}
                        onChange={(e) => setNewStartup(prev => ({ ...prev, industry: e.target.value }))}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] cursor-pointer"
                      >
                        <option>AgriTech</option>
                        <option>FinTech</option>
                        <option>EdTech</option>
                        <option>CleanEnergy</option>
                        <option>SaaS & ICT</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Brief description of your product or code prototype..."
                      value={newStartup.description}
                      onChange={(e) => setNewStartup(prev => ({ ...prev, description: e.target.value }))}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] focus:outline-none min-h-[50px]"
                    />
                    <button type="submit" className="py-2 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-[9px] rounded-lg cursor-pointer">
                      Publish Startup ➔
                    </button>
                  </form>

                  {/* Showcase List */}
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {studentStartups.map((s) => (
                      <div key={s.id} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl text-[10px] leading-relaxed">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-slate-200">{s.name}</h5>
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] rounded font-bold uppercase">{s.industry}</span>
                        </div>
                        <p className="text-slate-400 font-medium mt-1 leading-normal">{s.description}</p>
                        <span className="text-[9px] text-slate-500 block mt-2 font-bold">Founder: {s.founder}</span>
                        
                        <div className="flex gap-2 mt-3 pt-2 border-t border-slate-900">
                          <button
                            onClick={() => handleUpvoteStartup(s.id)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:border-violet-500/20 text-[9px] font-bold text-slate-300"
                          >
                            🔺 Upvote ({s.upvotes})
                          </button>
                          <button
                            onClick={() => handleJoinStartup(s.id)}
                            disabled={s.joined}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ml-auto transition-all ${
                              s.joined 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md'
                            }`}
                          >
                            {s.joined ? '✓ Request Sent' : '🤝 Join Team'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alumni Mentor Connector */}
                <div className="glass p-6">
                  <h4 className="font-bold text-sm text-slate-200 mb-2">👨‍💼 Alumni & Industry Mentors Network</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Connect with Ghanaian tech leaders and corporate partners. Book consultation checks or pitch drafts.</p>

                  <div className="flex flex-col gap-3">
                    {[
                      { name: 'Dr. Elikem Adadevoh', title: 'Managing Partner, Accra Venture Capital', sector: 'FinTech & Scaleups', intro: 'Over 15 years funding local digital services. Focus on Susu platforms and scaling regulatory compliance.' },
                      { name: 'Naa Ayeley Komey', title: 'Founder & CEO, AgriFlow Ltd', sector: 'AgriTech & Supply Chain', intro: 'Ashesi alumnus. Specializes in building IoT farm trackers and sourcing micro-finance in Kumasi.' }
                    ].map((mentor, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl text-[10px] leading-relaxed flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-lg shrink-0 font-bold text-slate-300">
                          👤
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <h5 className="font-bold text-slate-200">{mentor.name}</h5>
                            <span className="text-[8px] text-slate-500 font-bold">{mentor.sector}</span>
                          </div>
                          <span className="text-[9px] text-violet-400 font-bold block mb-1">{mentor.title}</span>
                          <p className="text-slate-400 font-medium leading-normal">{mentor.intro}</p>
                          <button
                            onClick={() => setSelectedMentor(mentor)}
                            className="mt-2 text-[9px] font-black text-violet-400 hover:underline inline-flex items-center gap-1"
                          >
                            ✉️ Write message to Mentor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Message Modal */}
            {selectedMentor && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative">
                  <h3 className="font-black text-base mb-1">Message to {selectedMentor.name}</h3>
                  <p className="text-[10px] text-slate-400 mb-4">Introduce yourself and outline your startup pitch or research proposal advice request.</p>
                  
                  <textarea
                    placeholder="E.g., Hello Dr. Elikem, I am a final-year CS student at KNUST. I am building a mobile susu application and..."
                    value={mentorMessage}
                    onChange={(e) => setMentorMessage(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-650 focus:outline-none min-h-[120px] font-semibold mb-4"
                  />

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setSelectedMentor(null)}
                      className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleContactMentor}
                      disabled={!mentorMessage.trim()}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* 3. Custom Glassmorphic Admission Requirements Modal */}
      {selectedUniForModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{selectedUniForModal.type} University</span>
                <h3 className="text-lg font-black text-white mt-1">{selectedUniForModal.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                  Ranked #{selectedUniForModal.ranking} in Ghana • Established {selectedUniForModal.established} • Located in{' '}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedUniForModal.name + ' ' + selectedUniForModal.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-450 hover:underline inline-flex items-center gap-0.5 text-violet-400"
                  >
                    📍 {selectedUniForModal.location} 🗺️
                  </a>
                </p>
              </div>
              <button
                onClick={() => setSelectedUniForModal(null)}
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5 text-xs font-semibold leading-relaxed text-slate-300">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <span className="text-violet-400 font-extrabold text-[10px] uppercase block mb-1">📋 Admission WASSCE & A-Level Terms</span>
                <p className="text-slate-200 mt-1 font-bold">{selectedUniForModal.admissionRequirements}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">🏛️ Academic Standing, Campus Review & Performance</span>
                <p className="text-slate-400 font-medium">{selectedUniForModal.performanceReview}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">💰 Estimated School Fees</span>
                <p className="text-emerald-400 font-bold">{selectedUniForModal.feesRange}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-1">🎓 Financial Aids & Scholarships</span>
                <p className="text-slate-400 font-medium">{selectedUniForModal.scholarshipsInfo}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-2">🎯 AI Mapped Career Recommendations</span>
                <div className="flex flex-wrap gap-1.5">
                  {getMappedRecommendations(selectedUniForModal).map((rec: string, rIdx: number) => (
                    <span key={rIdx} className="px-2.5 py-1 bg-violet-950/40 text-violet-400 border border-violet-800/30 rounded-lg text-[9px] font-bold">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block mb-2">📚 Full Program Roster</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUniForModal.programsOffered.map((prog: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-950 text-slate-400 border border-slate-800 rounded-lg text-[9px] font-bold">
                      {prog}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-800 pt-4 mt-6">
              <button
                onClick={() => setSelectedUniForModal(null)}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
              >
                Close Terms Window
              </button>
              <button
                onClick={() => {
                  setSelectedUniForModal(null);
                  showToast('Redirecting to career matching checks...', 'info');
                  setTab('student', 'student-career-guidance');
                }}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Check Career Match
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
