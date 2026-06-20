"use client";

import { useState } from "react";

export default function BusinessHubClient({ 
  initialStartups, 
  initialJobs,
  accessToken,
  userRoles
}: {
  initialStartups: any[];
  initialJobs: any[];
  accessToken: string;
  userRoles: string[];
}) {
  const [activeTab, setActiveTab] = useState("startups");
  const [startups, setStartups] = useState(initialStartups);
  const [jobs, setJobs] = useState(initialJobs);

  // New Job State
  const [jobForm, setJobForm] = useState({ title: "", company: "", jobType: "FULL_TIME", description: "" });
  const [isPostingJob, setIsPostingJob] = useState(false);

  // New Startup State
  const [startupForm, setStartupForm] = useState({ name: "", industry: "", description: "", authorName: "" });
  const [isPitching, setIsPitching] = useState(false);

  const canPostJobs = userRoles.includes("INDUSTRY_PARTNER") || userRoles.includes("SYSTEM_ADMINISTRATOR");

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/business/jobs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(jobForm),
      });
      if (res.ok) {
        const newJob = await res.json();
        setJobs([newJob, ...jobs]);
        setIsPostingJob(false);
        setJobForm({ title: "", company: "", jobType: "FULL_TIME", description: "" });
      } else {
        const errorData = await res.json();
        alert(`Failed to post job: ${errorData.message}`);
      }
    } catch (e) {
      alert("Error posting job.");
    }
  };

  const handlePitchStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/business/startups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(startupForm),
      });
      if (res.ok) {
        const newStartup = await res.json();
        setStartups([newStartup, ...startups]);
        setIsPitching(false);
        setStartupForm({ name: "", industry: "", description: "", authorName: "" });
      } else {
        alert("Failed to pitch startup");
      }
    } catch (e) {
      alert("Error pitching startup.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex space-x-4 border-b border-gray-700 pb-2">
        <button 
          onClick={() => setActiveTab("startups")}
          className={`px-4 py-2 font-semibold ${activeTab === "startups" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400 hover:text-gray-300"}`}
        >
          Startup Showcase
        </button>
        <button 
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 font-semibold ${activeTab === "jobs" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400 hover:text-gray-300"}`}
        >
          Internships & Jobs
        </button>
      </div>

      {activeTab === "startups" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">Student Innovation Hub</h2>
            <button onClick={() => setIsPitching(!isPitching)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded shadow">
              {isPitching ? "Cancel Pitch" : "+ Pitch Startup"}
            </button>
          </div>

          {isPitching && (
            <form onSubmit={handlePitchStartup} className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Startup Name</label>
                <input required type="text" value={startupForm.name} onChange={e => setStartupForm({...startupForm, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                  <input required type="text" value={startupForm.industry} onChange={e => setStartupForm({...startupForm, industry: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="e.g. EdTech, FinTech" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Founders / Team</label>
                  <input required type="text" value={startupForm.authorName} onChange={e => setStartupForm({...startupForm, authorName: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Elevator Pitch (Description)</label>
                <textarea required rows={3} value={startupForm.description} onChange={e => setStartupForm({...startupForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"></textarea>
              </div>
              <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded">Submit Pitch</button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map(s => (
              <div key={s.id} className="bg-gray-800 rounded-lg border border-gray-700 p-5 hover:border-indigo-500 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-indigo-400">{s.name}</h3>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{s.industry}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4 h-16 overflow-hidden">{s.description}</p>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>By {s.authorName}</span>
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {startups.length === 0 && <p className="text-gray-500 col-span-3">No startups pitched yet.</p>}
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">Career & Internship Board</h2>
            {canPostJobs && (
              <button onClick={() => setIsPostingJob(!isPostingJob)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded shadow">
                {isPostingJob ? "Cancel" : "+ Post Job"}
              </button>
            )}
          </div>

          {isPostingJob && canPostJobs && (
            <form onSubmit={handlePostJob} className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                  <input required type="text" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                  <input required type="text" value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Employment Type</label>
                <select value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Job Description</label>
                <textarea required rows={4} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"></textarea>
              </div>
              <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded">Publish Job</button>
            </form>
          )}

          <div className="space-y-4">
            {jobs.map(j => (
              <div key={j.id} className="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-200">{j.title}</h3>
                  <p className="text-sm text-indigo-400 mb-2">{j.company}</p>
                  <p className="text-sm text-gray-400 line-clamp-2 max-w-2xl">{j.description}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col items-end">
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs font-semibold mb-2">{j.jobType.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-500">Posted {new Date(j.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-gray-500">No jobs or internships posted yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
