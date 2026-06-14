import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { ParticleBg } from '../components/ParticleBg';
import { Lock, Mail, User as UserIcon, Sparkles, Building, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, signInWithBiometrics } = useAuth();
  const { showToast } = useAppState();
  
  // Tabs: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Auth Form State
  const [email, setEmail] = useState(() => localStorage.getItem('preferred_email') || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('student');
  const [rememberMe, setRememberMe] = useState(false);

  // Profile-specific fields
  const [department, setDepartment] = useState('Computer Science');
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('Dr.');
  const [office, setOffice] = useState('');

  // Extended profiles metadata states
  const [startupName, setStartupName] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [advisorExpertise, setAdvisorExpertise] = useState('');
  const [intendedMajor, setIntendedMajor] = useState('');
  const [highSchool, setHighSchool] = useState('');

  // Status & Messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    localStorage.removeItem('preferred_email');
  }, []);

  // Password Entropy Calculator
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-700', width: 'w-0', score: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', score };
    if (score <= 3) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/4', score };
    if (score === 4) return { label: 'Strong', color: 'bg-indigo-500', width: 'w-3/4', score };
    return { label: 'Superb Security', color: 'bg-emerald-500', width: 'w-full', score };
  };

  const handleBiometricSignIn = async () => {
    if (!email) {
      showToast('Please type your account email address first.', 'error');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setMessage('');
    try {
      const response = await signInWithBiometrics(email);
      if (response.success) {
        setMessage(response.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Biometric signature login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    try {
      if (activeTab === 'signin') {
        const response = await signIn(email, password, rememberMe);
        if (response.success) {
          setMessage(response.message);
        }
      } else {
        const response = await signUp({
          name,
          email,
          password,
          role,
          department,
          studentIdNumber: studentId,
          title,
          office,
          startupName,
          businessIdea,
          researchArea,
          institution,
          graduationYear,
          companyName,
          industrySector,
          advisorExpertise,
          intendedMajor,
          highSchool
        });
        if (response.success) {
          setMessage(response.message);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialStub = (provider: string) => {
    showToast(`🔐 Connecting to ${provider} OAuth Gateway... Redirecting to secure single-sign-on credentials channels.`, 'info');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast('Please type your email address in the input field first.', 'error');
      return;
    }
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      showToast(response.data.message || 'Forgot password instructions sent.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error executing password recovery.', 'error');
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#090d16] overflow-hidden select-none">
      
      {/* 1. Visual Side Panel (Floating Particles Backdrop) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-indigo-950/80 via-slate-950 to-slate-950 flex-col justify-between p-12 border-r border-slate-900/60 items-start">
        <ParticleBg />
        
        {/* Title Node */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/35">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-base tracking-wide text-white font-sans uppercase">SmartLearn AI</span>
        </div>

        {/* Dynamic Center Tag */}
        <div className="my-auto relative z-10 max-w-sm">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4"
          >
            <span className="text-violet-400 font-bold text-xs uppercase tracking-widest px-3 py-1 bg-violet-600/10 rounded-full w-max border border-violet-500/20">
              Transforming Education
            </span>
            <h2 className="text-3xl font-extrabold text-white leading-tight font-sans tracking-tight">
              Next-Gen Academic Hub & AI Advisers.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Slide predicted scores, map tailored career paths, upload lecture materials, and experience real-time notifications on the premier university workspace.
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 font-bold tracking-wide relative z-10">
          © 2026 SmartLearn AI LMS • Final Year Architecture Release.
        </div>
      </div>

      {/* 2. Glass Auth Panel Form */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 relative z-10 bg-slate-950/20">
        <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-violet-900/10 rounded-full filter blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[5%] w-[300px] h-[300px] bg-teal-900/10 rounded-full filter blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Logo header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black tracking-tight mb-2">Welcome to SmartLearn</h3>
            <p className="text-xs text-slate-400 font-semibold">Enter your credentials to enter the learning center</p>
          </div>

          {/* Toggle Tab sliders */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800/50">
            <button
              onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'signin' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'signup' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Alerts panels */}
          {message && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold leading-relaxed">
              ✅ {message}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Core Auth Forms */}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {/* Full Name */}
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      required
                    />
                  </div>

                  {/* Profile Role Grid Selector */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                      Select Your Profession / Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'student', label: '🎓 Student' },
                        { id: 'prospective_student', label: '🏫 Prospective' },
                        { id: 'lecturer', label: '💼 Lecturer' },
                        { id: 'researcher', label: '🔬 Researcher' },
                        { id: 'entrepreneur', label: '💡 Entrepreneur' },
                        { id: 'alumni', label: '🎓 Alumni' },
                        { id: 'industry_partner', label: '🏢 Partner' },
                        { id: 'career_advisor', label: '👔 Advisor' },
                        { id: 'admin', label: '🛠️ Admin' }
                      ].map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id as any)}
                          className={`py-2.5 px-2 border rounded-xl text-left text-[10px] font-bold transition-all cursor-pointer truncate ${role === r.id ? 'border-violet-600 bg-violet-600/10 text-violet-400' : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student-only profiles setup */}
                  {role === 'student' && (
                    <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="relative">
                        <Building className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-10 pr-2 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold cursor-pointer"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Business Administration">Business Administration</option>
                          <option value="Medicine & Surgery">Medicine & Surgery</option>
                          <option value="Nursing">Nursing</option>
                          <option value="Law">Law</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Architecture">Architecture</option>
                        </select>
                      </div>
                      <div className="relative">
                        <Bookmark className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Student ID No."
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full pl-10 pr-2 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Prospective Student profile setup */}
                  {role === 'prospective_student' && (
                    <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="relative">
                        <Building className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Intended Major"
                          value={intendedMajor}
                          onChange={(e) => setIntendedMajor(e.target.value)}
                          className="w-full pl-10 pr-2 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Bookmark className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="High School"
                          value={highSchool}
                          onChange={(e) => setHighSchool(e.target.value)}
                          className="w-full pl-10 pr-2 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Lecturer-only configuration */}
                  {role === 'lecturer' && (
                    <motion.div className="grid grid-cols-3 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <div>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold cursor-pointer"
                        >
                          <option>Dr.</option>
                          <option>Prof.</option>
                          <option>Mr.</option>
                          <option>Mrs.</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Office (e.g. Block C)"
                          value={office}
                          onChange={(e) => setOffice(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Researcher metadata */}
                  {role === 'researcher' && (
                    <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        type="text"
                        placeholder="Research Area (e.g. AI)"
                        value={researchArea}
                        onChange={(e) => setResearchArea(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                    </motion.div>
                  )}

                  {/* Entrepreneur metadata */}
                  {role === 'entrepreneur' && (
                    <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        type="text"
                        placeholder="Startup Name"
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Business Idea"
                        value={businessIdea}
                        onChange={(e) => setBusinessIdea(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                    </motion.div>
                  )}

                  {/* Alumni metadata */}
                  {role === 'alumni' && (
                    <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        type="text"
                        placeholder="Graduation Year"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Current Company"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                    </motion.div>
                  )}

                  {/* Industry Partner metadata */}
                  {role === 'industry_partner' && (
                    <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Industry Sector"
                        value={industrySector}
                        onChange={(e) => setIndustrySector(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                    </motion.div>
                  )}

                  {/* Career Advisor metadata */}
                  {role === 'career_advisor' && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        type="text"
                        placeholder="Advisor Expertise (e.g. Tech Careers)"
                        value={advisorExpertise}
                        onChange={(e) => setAdvisorExpertise(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-200 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                placeholder="Student / Faculty Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                required
              />
            </div>

            {/* Passwords */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="password"
                placeholder="Account Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-all font-semibold"
                required
              />
            </div>

            {/* Password Entropy bar when signup is selected */}
            {activeTab === 'signup' && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/40">
                <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold">
                  <span className="text-slate-400">Password Entropy:</span>
                  <span style={{ color: strength.score >= 3 ? '#10b981' : '#f59e0b' }}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password widgets */}
            <div className="flex items-center justify-between mt-2 text-xs font-semibold">
              <label className="flex items-center gap-2 text-slate-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-violet-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                Remember Me
              </label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-violet-500 hover:text-violet-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Master Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : activeTab === 'signin' ? (
                'Enter Portal Space 🚀'
              ) : (
                'Create Academic Account ✨'
              )}
            </button>

          </form>

          {/* Social Sign Ins */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/60 px-3 py-1 font-bold text-slate-500 uppercase tracking-widest text-[9px]">
                Or single sign-on
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialStub('Google')}
              className="flex items-center justify-center gap-2.5 py-3 border border-slate-800/60 rounded-xl hover:bg-slate-800/20 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.97 0 12 0 7.35 0 3.37 2.67 1.41 6.57l3.79 2.94C6.1 6.57 8.85 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.2 3.54-8.71z"/>
                <path fill="#FBBC05" d="M5.2 14.51c-.25-.76-.4-1.56-.4-2.39 0-.83.15-1.63.4-2.39L1.41 6.78C.51 8.57 0 10.57 0 12.68c0 2.11.51 4.11 1.41 5.9l3.79-2.94-.01-.13z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.73-2.48 1.16-4.05 1.16-3.15 0-5.9-2.12-6.8-5.04L1.41 17.1C3.37 21.02 7.35 24 12 24z"/>
              </svg>
              Google Hub
            </button>
            <button
              onClick={() => handleSocialStub('Microsoft')}
              className="flex items-center justify-center gap-2.5 py-3 border border-slate-800/60 rounded-xl hover:bg-slate-800/20 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M0 0h11v11H0z"/>
                <path fill="#81bc06" d="M12 0h11v11H12z"/>
                <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                <path fill="#ffba08" d="M12 12h11v11H12z"/>
              </svg>
              Microsoft SSO
            </button>
          </div>

        </motion.div>
      </div>

    </div>
  );
};
