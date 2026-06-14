import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useAppState } from './context/AppStateContext';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { StudentHub } from './pages/StudentHub';
import { LecturerHub } from './pages/LecturerHub';
import { AdminHub } from './pages/AdminHub';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const { user, loading, logout, adminView } = useAuth();
  const { toast } = useAppState();
  
  // Landing state: tracks if user has clicked "Enter Portal" from Landing page
  const [inPortal, setInPortal] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleThemeToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.removeAttribute('data-theme');
    }
  };

  const handleLogout = async () => {
    await logout();
    setInPortal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Loading Academic Space...</span>
      </div>
    );
  }

  // 1. Unauthenticated -> show LandingPage or AuthPage
  if (!user) {
    if (!inPortal) {
      return <LandingPage onEnter={() => setInPortal(true)} />;
    }
    return <AuthPage />;
  }

  // Determine active hub component based on role and admin selection
  const renderWorkspace = () => {
    if (user.role === 'admin') {
      if (adminView === 'student') return <StudentHub />;
      if (adminView === 'lecturer') return <LecturerHub />;
      return <AdminHub />;
    }
    return user.role === 'student' ? <StudentHub /> : <LecturerHub />;
  };

  // 2. Authenticated -> show Sidebar + respective Dashboard
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-slate-100 flex transition-colors duration-300 relative">
      
      {/* Floating Global Toast overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-xl border glass max-w-sm ${
              toast.type === 'success' 
                ? 'border-emerald-500/30 bg-emerald-950/70 text-emerald-300' 
                : toast.type === 'error'
                ? 'border-red-500/30 bg-red-950/70 text-red-300'
                : 'border-blue-500/30 bg-blue-950/70 text-blue-300'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual background blurred ornaments */}
      <div className="glow-orb top-[5%] right-[10%] w-[380px] h-[380px] bg-violet-900/10 dark:bg-violet-900/8" />
      <div className="glow-orb bottom-[10%] left-[20%] w-[320px] h-[320px] bg-teal-900/10 dark:bg-teal-900/8" />

      {/* Floating navigation panel drawer */}
      <Sidebar 
        onLogout={handleLogout} 
        onThemeToggle={handleThemeToggle} 
        isDark={isDark} 
      />
      
      {/* Primary viewport contents */}
      <main className="flex-grow flex flex-col min-h-screen w-full relative z-10">
        {renderWorkspace()}
      </main>

    </div>
  );
};

export default App;
