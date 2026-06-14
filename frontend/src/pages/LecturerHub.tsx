import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  FileSpreadsheet, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Activity
} from 'lucide-react';

export const LecturerHub: React.FC = () => {
  const { user } = useAuth();
  const { 
    courses, 
    students,
    submissions, 
    quizAttempts,
    chatMessages,
    consultations,
    activeChatRecipientId,
    typingStatus,
    uploadNote, 
    createAssignment, 
    gradeSubmission,
    currentLecturerTab,
    createQuiz,
    gradeQuizAttempt,
    sendChatMessage,
    setActiveRecipient,
    sendTypingStatus,
    updateConsultationStatus,
    showToast
  } = useAppState();

  // Local States for Quiz Builder
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizCourse, setNewQuizCourse] = useState('CS101');
  const [newQuizTimeLimit, setNewQuizTimeLimit] = useState(15);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Local Question builder fields
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'MCQ' | 'True/False' | 'Essay' | 'Coding'>('MCQ');
  const [qOptionsRaw, setQOptionsRaw] = useState('');
  const [qCorrect, setQCorrect] = useState('');

  // Local Chat states
  const [chatText, setChatText] = useState('');
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Local Quiz grading states
  const [activeAttempt, setActiveAttempt] = useState<any | null>(null);
  const [attemptFeedback, setAttemptFeedback] = useState('');
  const [attemptScores, setAttemptScores] = useState<{ [qId: string]: number }>({});

  const handleAddQuestion = () => {
    if (!qText || !qCorrect) {
      showToast('Question text and correct answer are required.', 'error');
      return;
    }
    const options = qType === 'MCQ' ? qOptionsRaw.split(',').map(s => s.trim()) : undefined;
    setQuizQuestions(prev => [...prev, {
      questionText: qText,
      questionType: qType,
      options,
      correctAnswer: qCorrect
    }]);
    setQText('');
    setQOptionsRaw('');
    setQCorrect('');
  };

  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle || quizQuestions.length === 0) {
      showToast('Quiz title and at least one question are required.', 'error');
      return;
    }
    try {
      await createQuiz({
        title: newQuizTitle,
        courseId: newQuizCourse,
        timeLimit: newQuizTimeLimit,
        questions: quizQuestions,
        totalPoints: quizQuestions.length // 1 point per question
      });
      showToast('Quiz published successfully!', 'success');
      setNewQuizTitle('');
      setQuizQuestions([]);
    } catch (err) {
      showToast('Error creating quiz.', 'error');
    }
  };

  const handleGradeAttemptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAttempt) return;
    try {
      await gradeQuizAttempt(activeAttempt.id, attemptScores, attemptFeedback);
      showToast('Quiz attempt graded successfully!', 'success');
      setActiveAttempt(null);
      setAttemptScores({});
      setAttemptFeedback('');
    } catch (err) {
      showToast('Error grading quiz attempt.', 'error');
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

  // Note uploading fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCourse, setNoteCourse] = useState('CS101');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [uploadingNoteFlag, setUploadingNoteFlag] = useState(false);

  // Homework publishing fields
  const [asgTitle, setAsgTitle] = useState('');
  const [asgCourse, setAsgCourse] = useState('CS101');
  const [asgDeadline, setAsgDeadline] = useState('');
  const [asgPoints, setAsgPoints] = useState(100);
  const [asgDesc, setAsgDesc] = useState('');
  const [creatingAsgFlag, setCreatingAsgFlag] = useState(false);

  // Active grading values states
  const [activeGrades, setActiveGrades] = useState<{ [key: string]: number }>({});
  const [activeFeedback, setActiveFeedback] = useState<{ [key: string]: string }>({});

  const handleGradeSubmit = async (subId: string) => {
    const grade = activeGrades[subId];
    const feedback = activeFeedback[subId] || 'Well done.';
    if (grade === undefined) {
      showToast('Please enter a grade score.', 'error');
      return;
    }
    await gradeSubmission(subId, grade, feedback);
    showToast('Student submission graded successfully!', 'success');
  };

  const handleNotePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;
    setUploadingNoteFlag(true);
    await uploadNote(noteTitle, noteCourse, noteFile || undefined);
    setNoteTitle('');
    setNoteFile(null);
    setUploadingNoteFlag(false);
    showToast('Lecture notes published successfully!', 'success');
  };

  const handleAsgPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle || !asgDeadline) return;
    setCreatingAsgFlag(true);
    await createAssignment({
      title: asgTitle,
      courseId: asgCourse,
      deadline: asgDeadline,
      totalPoints: asgPoints,
      description: asgDesc
    });
    setAsgTitle('');
    setAsgDeadline('');
    setAsgDesc('');
    setCreatingAsgFlag(false);
    showToast('Assignment created and published!', 'success');
  };

  const getHeaderInfo = () => {
    switch (user?.role) {
      case 'alumni':
        return { tag: 'Alumni Space', title: 'Alumni Network Desk' };
      case 'industry_partner':
        return { tag: 'Partner Collaboration', title: 'Industry Partner Hub' };
      case 'career_advisor':
        return { tag: 'Advisory Center', title: 'Career Advisor Console' };
      default:
        return { tag: 'Faculty Workspace', title: 'Lecturer Portal Hub' };
    }
  };
  const headerInfo = getHeaderInfo();

  return (
    <div className="flex-grow p-8 overflow-y-auto max-h-screen relative">
      
      {/* Header portal info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-violet-500 font-bold text-xs uppercase tracking-wider">{headerInfo.tag}</span>
          <h2 className="text-2xl font-black font-sans mt-1">{headerInfo.title}</h2>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 uppercase bg-slate-950 border border-slate-800 rounded">
            {user?.role === 'lecturer' ? 'HOD Level Active' : 'Verified Profile'}
          </span>
        </div>
      </div>

      {/* Main pages widgets */}
      {currentLecturerTab === 'lecturer-dashboard' && (
        <div className="flex flex-col gap-6">
          
          {user?.role === 'alumni' ? (
            // 🎓 ALUMNI VIEW
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-5 bg-gradient-to-br from-violet-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Graduation Year</span>
                    <h4 className="text-xl font-black mt-1">{user?.graduationYear || '2025'}</h4>
                  </div>
                  <Calendar className="w-8 h-8 text-violet-500 opacity-60" />
                </div>
                <div className="glass p-5 bg-gradient-to-br from-emerald-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Employer Company</span>
                    <h4 className="text-xl font-black mt-1 truncate max-w-[200px]">{user?.companyName || 'TechCorp Ghana'}</h4>
                  </div>
                  <BookOpen className="w-8 h-8 text-emerald-500 opacity-60" />
                </div>
                <div className="glass p-5 bg-gradient-to-br from-sky-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Active Connections</span>
                    <h4 className="text-xl font-black mt-1">3 Connected Users</h4>
                  </div>
                  <Users className="w-8 h-8 text-sky-500 opacity-60" />
                </div>
              </div>

              <div className="glass p-6">
                <h3 className="font-extrabold text-sm mb-2">🎓 Alumni Giveback Program</h3>
                <p className="text-[11px] text-slate-400 mb-6">Welcome back to SmartLearn AI. As an esteemed alumnus, you can chat with graduating students, schedule consultations to offer career mentorship, and collaborate on innovation hub projects.</p>
                <div className="flex gap-4">
                  <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex-1">
                    <h4 className="font-bold text-xs text-slate-300">💡 Mentor a Founder</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Review student pitch decks in the innovation workspace and provide corporate feedback.</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex-1">
                    <h4 className="font-bold text-xs text-slate-300">💬 Career Chats</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Use the messenger tab to answer student queries about entering the local tech job market.</p>
                  </div>
                </div>
              </div>
            </>
          ) : user?.role === 'industry_partner' ? (
            // 🏢 INDUSTRY PARTNER VIEW
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-5 bg-gradient-to-br from-violet-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Industry Sector</span>
                    <h4 className="text-xl font-black mt-1">{user?.industrySector || 'Technology & Fintech'}</h4>
                  </div>
                  <Activity className="w-8 h-8 text-violet-500 opacity-60" />
                </div>
                <div className="glass p-5 bg-gradient-to-br from-emerald-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Organization Name</span>
                    <h4 className="text-xl font-black mt-1 truncate max-w-[200px]">{user?.companyName || 'Global Innovations Inc'}</h4>
                  </div>
                  <BookOpen className="w-8 h-8 text-emerald-500 opacity-60" />
                </div>
                <div className="glass p-5 bg-gradient-to-br from-sky-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Active Projects</span>
                    <h4 className="text-xl font-black mt-1">2 Active Collaborations</h4>
                  </div>
                  <Users className="w-8 h-8 text-sky-500 opacity-60" />
                </div>
              </div>

              <div className="glass p-6">
                <h3 className="font-extrabold text-sm mb-2">🏢 Partner Collaboration Dashboard</h3>
                <p className="text-[11px] text-slate-400 mb-6">Coordinate with university departments to sponsor research projects, setup internship roles, and evaluate tech innovations.</p>
                <div className="flex gap-4">
                  <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex-1">
                    <h4 className="font-bold text-xs text-slate-300">📁 Research Proposals</h4>
                    <p className="text-[10px] text-slate-500 mt-1">View active academic research outlines and sponsor innovative methodologies.</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex-1">
                    <h4 className="font-bold text-xs text-slate-300">💼 Internships Queue</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Coordinate interview schedules with students via our consultations desk.</p>
                  </div>
                </div>
              </div>
            </>
          ) : user?.role === 'career_advisor' ? (
            // 👔 CAREER ADVISOR VIEW
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-5 bg-gradient-to-br from-violet-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Advisor Expertise</span>
                    <h4 className="text-xl font-black mt-1 truncate max-w-[200px]">{user?.advisorExpertise || 'Academic & Tech Careers'}</h4>
                  </div>
                  <Activity className="w-8 h-8 text-violet-500 opacity-60" />
                </div>
                <div className="glass p-5 bg-gradient-to-br from-emerald-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Pending Reviews</span>
                    <h4 className="text-xl font-black mt-1">5 Student Query Logs</h4>
                  </div>
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500 opacity-60" />
                </div>
                <div className="glass p-5 bg-gradient-to-br from-sky-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">AI Recommendations</span>
                    <h4 className="text-xl font-black mt-1">24 Recommendations Sent</h4>
                  </div>
                  <TrendingUp className="w-8 h-8 text-sky-500 opacity-60" />
                </div>
              </div>

              <div className="glass p-6">
                <h3 className="font-extrabold text-sm mb-2">👔 Advisor Counseling Console</h3>
                <p className="text-[11px] text-slate-400 mb-6">Manage student career development pipelines. Schedule consultations to map out academic steps, review resumes, and evaluate target university recommendations.</p>
                <div className="flex gap-4">
                  <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex-1">
                    <h4 className="font-bold text-xs text-slate-300">📅 Career Consultations</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Schedule and manage 1-on-1 virtual sessions with students requesting career advice.</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex-1">
                    <h4 className="font-bold text-xs text-slate-300">📊 Resume Reviews</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Analyze student credentials to tailor recommendations for local and international markets.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // 💼 STANDARD LECTURER VIEW
            <>
              {/* Faculty Analytics Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-5 bg-gradient-to-br from-violet-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Active Cohorts</span>
                    <h4 className="text-xl font-black mt-1">CS101, ENG201</h4>
                  </div>
                  <Users className="w-8 h-8 text-violet-500 opacity-60" />
                </div>

                <div className="glass p-5 bg-gradient-to-br from-emerald-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Syllabus Submissions</span>
                    <h4 className="text-xl font-black mt-1">{submissions.length} Pending evaluation</h4>
                  </div>
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500 opacity-60" />
                </div>

                <div className="glass p-5 bg-gradient-to-br from-sky-900/5 to-transparent flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Class Average GPA</span>
                    <h4 className="text-xl font-black mt-1">3.44 CGPA</h4>
                  </div>
                  <TrendingUp className="w-8 h-8 text-sky-500 opacity-60" />
                </div>
              </div>

              {/* Submissions grading board table */}
              <div className="glass p-6">
                <h3 className="font-extrabold text-sm mb-2">Homework Submissions Grading queue</h3>
                <p className="text-[10px] text-slate-400 mb-6">Review uploaded PDF solutions, type evaluations scores (0-100), and write direct feedback metrics.</p>
                
                <div className="flex flex-col gap-4">
                  {submissions.map(sub => (
                    <div key={sub.id} className="p-5 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Student Profile</h4>
                        <span className="text-sm font-black text-slate-100 block mt-0.5">{sub.studentName}</span>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          File: <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300 transition-colors cursor-pointer">{sub.fileName}</a>
                        </span>
                      </div>

                      {sub.grade ? (
                        <div className="text-right">
                          <span className="text-emerald-400 font-extrabold text-xs block">Graded Score: {sub.grade}/100</span>
                          <p className="text-[10px] text-slate-500 mt-1">"Feedback: {sub.feedback}"</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 items-center">
                          <input
                            type="number"
                            placeholder="Grade"
                            value={activeGrades[sub.id] || ''}
                            onChange={(e) => setActiveGrades(prev => ({ ...prev, [sub.id]: parseInt(e.target.value) || 0 }))}
                            className="w-20 p-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-center font-bold text-slate-200"
                            min="0"
                            max="100"
                          />
                          <input
                            type="text"
                            placeholder="Feedback notes"
                            value={activeFeedback[sub.id] || ''}
                            onChange={(e) => setActiveFeedback(prev => ({ ...prev, [sub.id]: e.target.value }))}
                            className="w-44 p-2.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs placeholder-slate-500 text-slate-200"
                          />
                          <button
                            onClick={() => handleGradeSubmit(sub.id)}
                            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                          >
                            Grade
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* MATERIALS AND ASSIGNMENTS PUBLISHING DESK */}
      {currentLecturerTab === 'lecturer-uploads' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          
          {/* Upload note widget */}
          <div className="glass p-6">
            <h3 className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-violet-400">
              <BookOpen className="w-4.5 h-4.5" />
              Publish Course Lecture Materials
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">Select syllabus tracks, set file naming parameters, and upload local notes PDFs.</p>
            
            <form onSubmit={handleNotePublish} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Course Cohort:</label>
                <select
                  value={noteCourse}
                  onChange={(e) => setNoteCourse(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Lecture File Title:</label>
                <input
                  type="text"
                  placeholder="Lec 3: Object Oriented Methodologies"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Upload Note Attachment File:</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setNoteFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-400 border border-dashed border-slate-800/60 p-4 rounded-xl cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingNoteFlag}
                className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {uploadingNoteFlag ? 'Uploading note file...' : 'Publish Lecture Note 🚀'}
              </button>
            </form>
          </div>

          {/* Create assignment widget */}
          <div className="glass p-6">
            <h3 className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-emerald-400">
              <Calendar className="w-4.5 h-4.5" />
              Publish Student Homework Assignment
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">Specify deadline dates, target courses, total points, and homework descriptive questions.</p>
            
            <form onSubmit={handleAsgPublish} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Course:</label>
                  <select
                    value={asgCourse}
                    onChange={(e) => setAsgCourse(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold cursor-pointer"
                  >
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Evaluation Points:</label>
                  <input
                    type="number"
                    value={asgPoints}
                    onChange={(e) => setAsgPoints(parseInt(e.target.value) || 100)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Homework Title:</label>
                <input
                  type="text"
                  placeholder="Assignment 3: Graph Traversal Algorithms"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Milestone Deadline Date:</label>
                <input
                  type="date"
                  value={asgDeadline}
                  onChange={(e) => setAsgDeadline(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 font-semibold cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Description Guidelines:</label>
                <textarea
                  placeholder="Provide instructions or prerequisite lecture notes links..."
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none min-h-[70px]"
                />
              </div>

              <button
                type="submit"
                disabled={creatingAsgFlag}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {creatingAsgFlag ? 'Creating assignment...' : 'Publish Homework Task ✨'}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* COHORT STUDENT ANALYTICS SHEET */}
      {currentLecturerTab === 'lecturer-analytics' && (
        <div className="glass p-6 animate-in fade-in duration-300">
          <h3 className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-sky-400">
            <Activity className="w-4.5 h-4.5" />
            Class cohort detailed analysis
          </h3>
          <p className="text-[10px] text-slate-400 mb-6">Review cohort attendance levels, term CGPA projects, and automatic status alerts tags.</p>
          
          <table className="w-full text-xs font-semibold border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 font-black text-[9px] uppercase tracking-wider bg-slate-950/40">
                <th className="p-4 rounded-tl-xl">Student Name</th>
                <th className="p-4">Active Course Slots</th>
                <th className="p-4">Lecture Attendance</th>
                <th className="p-4">Term CGPA Proj</th>
                <th className="p-4 rounded-tr-xl">Status Flag</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Kofi Mensah', courses: 'CS101, ENG201', att: '95%', gpa: '3.82', flag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', flagText: 'Good Standing' },
                { name: 'Efua Ampah', courses: 'CS101, BUA202', att: '88%', gpa: '3.10', flag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', flagText: 'Good Standing' },
                { name: 'Joseph Addo', courses: 'CS101, MATH102', att: '65%', gpa: '1.95', flag: 'bg-red-500/10 text-red-400 border-red-500/20', flagText: 'Needs Help' }
              ].map((student, idx) => (
                <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/10 transition-colors">
                  <td className="p-4 font-black">{student.name}</td>
                  <td className="p-4 text-slate-400">{student.courses}</td>
                  <td className="p-4 text-slate-400">{student.att}</td>
                  <td className="p-4 text-slate-300 font-bold">{student.gpa}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black tracking-wide ${student.flag}`}>
                      {student.flagText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QUIZ BUILDER PORTAL */}
      {currentLecturerTab === 'lecturer-quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Create Quiz Form */}
          <div className="glass p-6">
            <h3 className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-violet-400">
              Publish Quiz
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">Create MCQ or subjective evaluation tests.</p>

            <form onSubmit={handlePublishQuiz} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Course:</label>
                  <select
                    value={newQuizCourse}
                    onChange={(e) => setNewQuizCourse(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 cursor-pointer"
                  >
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Timer (Minutes):</label>
                  <input
                    type="number"
                    value={newQuizTimeLimit}
                    onChange={(e) => setNewQuizTimeLimit(parseInt(e.target.value) || 15)}
                    className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Quiz Title:</label>
                <input
                  type="text"
                  placeholder="Quiz 2: Data Structures recursion"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              {/* Added Questions List indicator */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">Questions Added: {quizQuestions.length}</span>
                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded-lg text-[10px] leading-relaxed flex justify-between">
                      <span className="truncate">{idx + 1}. {q.questionText} ({q.questionType})</span>
                      <button type="button" onClick={() => setQuizQuestions(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Designer Block */}
              <div className="p-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/25">
                <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">Add Question Item</h4>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-1">Question Type:</label>
                    <select
                      value={qType}
                      onChange={(e: any) => setQType(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-slate-300 cursor-pointer"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="True/False">True / False</option>
                      <option value="Essay">Essay Question</option>
                      <option value="Coding">Coding Sandbox Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-1">Question Prompt:</label>
                    <input
                      type="text"
                      placeholder="What is the time complexity of bubble sort?"
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-slate-200"
                    />
                  </div>

                  {qType === 'MCQ' && (
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block mb-1">Options (comma separated):</label>
                      <input
                        type="text"
                        placeholder="O(1), O(N), O(N^2)"
                        value={qOptionsRaw}
                        onChange={(e) => setQOptionsRaw(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-slate-200"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-1">Correct Answer / Reference solution:</label>
                    <input
                      type="text"
                      placeholder={qType === 'True/False' ? 'True' : 'O(N^2)'}
                      value={qCorrect}
                      onChange={(e) => setQCorrect(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-slate-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="py-2.5 bg-violet-600/10 hover:bg-violet-600/25 border border-violet-500/20 text-violet-400 font-extrabold text-[10px] rounded-lg transition-all"
                  >
                    Add Question to Quiz
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                Publish Quiz 🚀
              </button>
            </form>
          </div>

          {/* Quiz attempts grading queue */}
          <div className="glass p-6">
            <h3 className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-emerald-400">
              Quiz Submissions Queue
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">Grade essay or coding answers submitted by students.</p>

            <div className="flex flex-col gap-3">
              {quizAttempts.map((attempt) => (
                <div key={attempt.id} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">{attempt.quizTitle}</h4>
                    <span className="text-sm font-black text-slate-100 block mt-0.5">{attempt.studentName}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Score: {attempt.score} points</span>
                  </div>

                  <div>
                    {attempt.graded ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black">
                        Graded Complete
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAttempt(attempt);
                          setAttemptFeedback('');
                        }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Evaluate
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {quizAttempts.length === 0 && (
                <p className="text-center text-slate-500 py-6">No quiz attempts submitted.</p>
              )}
            </div>

            {/* Quiz Grading Modal dialog */}
            {activeAttempt && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                <form onSubmit={handleGradeAttemptSubmit} className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative my-8">
                  <h3 className="font-black text-base mb-1">Evaluate: {activeAttempt.studentName}</h3>
                  <p className="text-[10px] text-slate-400 mb-4">{activeAttempt.quizTitle}</p>

                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 mb-4">
                    {activeAttempt.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850">
                        <span className="text-[9px] font-bold text-slate-500 block">Question {idx + 1}</span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Student Answer: <strong className="text-slate-200">{ans.studentAnswer}</strong>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <label className="text-[9px] font-bold text-slate-500">Grade Score:</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={attemptScores[ans.questionId] || 0}
                            onChange={(e) => setAttemptScores(prev => ({ ...prev, [ans.questionId]: parseFloat(e.target.value) || 0 }))}
                            className="w-16 p-1 bg-slate-900 border border-slate-800 rounded text-center text-xs font-bold text-slate-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Lecturer Feedback:</label>
                    <textarea
                      placeholder="Feedback notes..."
                      value={attemptFeedback}
                      onChange={(e) => setAttemptFeedback(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <button type="button" onClick={() => setActiveAttempt(null)} className="px-4 py-2 border border-slate-800 text-slate-400 text-xs rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-violet-600 text-white text-xs rounded-xl font-bold">Submit Grades</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT MESSENGER PORTAL */}
      {currentLecturerTab === 'lecturer-chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          {/* Contacts list */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="font-extrabold text-sm mb-1">My Students</h3>
            {students && students.length > 0 ? (
              students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveRecipient(s.id);
                  }}
                  className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                    activeChatRecipientId === s.id ? 'border-violet-600 bg-violet-600/10 text-slate-100' : 'border-slate-800 bg-slate-900/30 text-slate-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center text-sm font-black border border-violet-500/20">
                    🎓
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">{s.name}</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase">{s.department || 'Enrolled'} Student</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-2">No registered students found.</p>
            )}
          </div>

          {/* Chat box */}
          <div className="lg:col-span-8 flex flex-col justify-between min-h-[500px] max-h-[500px] glass p-6">
            {activeChatRecipientId ? (
              <>
                <div className="flex-grow overflow-y-auto flex flex-col gap-3 mb-4 pr-2">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-4 max-w-[80%] rounded-2xl leading-relaxed text-xs font-semibold ${
                        msg.senderId === user?.id 
                          ? 'bg-violet-600 text-white ml-auto rounded-tr-none' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                      {msg.fileUrl && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] flex items-center gap-1.5 font-black">
                          📁 <a href={msg.fileUrl} download className="underline hover:text-slate-200">{msg.fileName || 'Attachment'}</a>
                        </div>
                      )}
                      <span className="text-[8px] text-slate-400 block mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  {activeChatRecipientId && typingStatus[activeChatRecipientId] && (
                    <p className="text-[10px] text-slate-500 animate-pulse font-bold px-1">Student is typing...</p>
                  )}
                </div>

                {chatAttachment && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center justify-between mb-2">
                    <span className="truncate">📎 Attachment: {chatAttachment.name}</span>
                    <button onClick={() => setChatAttachment(null)} className="text-red-400 hover:text-red-300 font-bold">Remove</button>
                  </div>
                )}

                <div className="flex gap-2 border-t border-slate-800/40 pt-4">
                  <label className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700/60 rounded-xl cursor-pointer text-slate-400">
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
                    className="flex-grow px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                  <button onClick={handleSendChatMsg} className="px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs">Send</button>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-slate-500 text-xs">
                Select a student to start chat.
              </div>
            )}
          </div>
        </div>
      )}

      {/* LECTURER CONSULTATIONS PORTAL */}
      {currentLecturerTab === 'lecturer-consultations' && (
        <div className="glass p-6 animate-in fade-in duration-300">
          <h3 className="font-extrabold text-sm mb-4">Booked Student Consultations</h3>
          
          <div className="flex flex-col gap-3">
            {consultations.map((c) => (
              <div key={c.id} className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">{c.topic}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Student: <strong>{c.studentName}</strong> • Duration: {c.duration} mins
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
                    <>
                      <a
                        href={c.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-sky-600 text-white font-extrabold text-[10px] rounded-xl shadow-md transition-all"
                      >
                        Join Room
                      </a>
                      <button
                        onClick={() => updateConsultationStatus(c.id, 'Completed')}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateConsultationStatus(c.id, 'Cancelled')}
                        className="px-3 py-1.5 bg-red-950/40 border border-red-500/20 text-red-400 font-extrabold text-[10px] rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {consultations.length === 0 && (
              <p className="text-center text-slate-500 py-6">No booked consultations.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
