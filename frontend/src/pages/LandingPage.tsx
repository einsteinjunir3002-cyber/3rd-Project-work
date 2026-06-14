import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Zap, Cpu, GraduationCap, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { switchUserRole } = useAuth();

  const handleRoleEnter = (role: 'student' | 'lecturer') => {
    switchUserRole(role);
    onEnter();
  };

  return (
    <div className="min-h-screen bg-[#070b13] relative overflow-hidden select-none">
      
      {/* Glow ambient orbs */}
      <div className="glow-orb top-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-900/10" />
      <div className="glow-orb bottom-[10%] right-[10%] w-[450px] h-[450px] bg-teal-900/10" />

      {/* 1. Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/35">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-sm tracking-wide text-white uppercase font-sans">SmartLearn AI</span>
        </div>
        <div>
          <button 
            onClick={() => handleRoleEnter('student')}
            className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all cursor-pointer shadow-md"
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* 2. Hero Presentation Block */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text details */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-start gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 px-3 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-400 font-bold text-[10px] uppercase rounded-full tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              Intelligent University Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black font-sans leading-tight tracking-tight text-white"
            >
              Intelligent LMS <br />
              Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">Research & Innovation.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 font-semibold text-xs md:text-sm leading-relaxed max-w-lg"
            >
              SmartLearn AI is an intelligent Learning Management System with integrated research tools, career advisors, and innovation hub support for Ghanaian universities. Perform GPA calculation checks, explore local startup accelerators, search publications, and access AI course tutors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mt-4"
            >
              <button
                onClick={() => handleRoleEnter('student')}
                className="px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 transition-all flex items-center gap-2.5 cursor-pointer hover:translate-x-1"
              >
                Enter Student Hub
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRoleEnter('lecturer')}
                className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-extrabold text-xs transition-all cursor-pointer shadow-md"
              >
                Lecturer Workspace
              </button>
            </motion.div>
          </div>

          {/* Right Vector Illustration Graphic */}
          <div className="col-span-1 lg:col-span-6 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-lg p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800/40 rounded-3xl float-anim shadow-2xl overflow-hidden"
            >
              <img 
                src="picture/hero_illustration.svg" 
                alt="Interactive vector mockup illustration" 
                className="w-full h-auto object-contain rounded-2xl border border-slate-800/60"
                onError={(e) => {
                  e.currentTarget.src = 'https://illustrations.popsy.co/white/graphic-design.svg';
                }}
              />
            </motion.div>
          </div>

        </div>

        {/* 3. Features Highlight row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 relative z-20">
          <div className="p-8 bg-slate-900/30 border border-slate-800/40 rounded-2xl backdrop-blur-sm hover:border-violet-500/20 transition-all flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">AI Research Assistant</h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Access global publication databases via EuropePMC. Format APA/IEEE citations, critique methodologies, and identify local Ghanaian research gaps.
            </p>
          </div>

          <div className="p-8 bg-slate-900/30 border border-slate-800/40 rounded-2xl backdrop-blur-sm hover:border-violet-500/20 transition-all flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Student Innovation Hub</h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Pitch business ideas to our AI model-validator. Explore funding pathways, connect to alumni mentors, and show your work in our startup marketplace.
            </p>
          </div>

          <div className="p-8 bg-slate-900/30 border border-slate-800/40 rounded-2xl backdrop-blur-sm hover:border-violet-500/20 transition-all flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">GPA Planner & AI Tutor</h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Slide anticipated grades to dynamically compute your GPA/CWA. Engage custom AI academic advisors for code debugging or study planning.
            </p>
          </div>
        </section>
      </main>

    </div>
  );
};
