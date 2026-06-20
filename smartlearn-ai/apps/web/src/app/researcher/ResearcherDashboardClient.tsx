'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  status: string;
  assigneeId?: string | null;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

interface EthicsApp {
  id: string;
  status: string;
  submittedAt: string;
  comments?: string | null;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  doi?: string | null;
  status: string;
  publishedAt?: string | null;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: string;
  totalBudget: number;
  tasks: Task[];
  milestones: Milestone[];
  ethicsApps: EthicsApp[];
  publications: Publication[];
}

interface Props {
  initialProjects: ResearchProject[];
  token: string;
}

export default function ResearcherDashboardClient({ initialProjects, token }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<ResearchProject[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjects[0]?.id || ''
  );
  const [isPending, startTransition] = useTransition();

  // Form states
  const [ethicsSubmitting, setEthicsSubmitting] = useState(false);
  const [pubSubmitting, setPubSubmitting] = useState(false);

  const [pubForm, setPubForm] = useState({
    title: '',
    journal: '',
    doi: '',
  });

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchProjectData = async (projectId: string) => {
    try {
      const res = await fetch(`${API_URL}/research/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? data : p))
        );
      }
    } catch (err) {
      console.error('Failed to refetch project data:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/research/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok && activeProject) {
        await fetchProjectData(activeProject.id);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleSubmitEthics = async () => {
    if (!activeProject) return;
    setEthicsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/research/projects/${activeProject.id}/ethics`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchProjectData(activeProject.id);
        alert('Ethics application submitted successfully!');
      }
    } catch (err) {
      console.error('Failed to submit ethics:', err);
    } finally {
      setEthicsSubmitting(false);
    }
  };

  const handleCreatePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !pubForm.title || !pubForm.journal) return;
    setPubSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/research/projects/${activeProject.id}/publications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pubForm),
      });
      if (res.ok) {
        await fetchProjectData(activeProject.id);
        setPubForm({ title: '', journal: '', doi: '' });
        alert('Publication logged successfully!');
      }
    } catch (err) {
      console.error('Failed to log publication:', err);
    } finally {
      setPubSubmitting(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center max-w-xl mx-auto my-20">
        <div className="text-violet-600 mb-4 text-5xl">🔬</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Research Projects Assigned</h3>
        <p className="text-gray-500 mb-6">
          You are currently not registered as a Principal Investigator (PI) on any active research projects.
        </p>
      </div>
    );
  }

  // Kanban categorizer
  const todoTasks = activeProject?.tasks.filter((t) => t.status === 'TODO') || [];
  const inProgressTasks = activeProject?.tasks.filter((t) => t.status === 'IN_PROGRESS') || [];
  const doneTasks = activeProject?.tasks.filter((t) => t.status === 'DONE') || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Project Selector Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Select Active Research Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {activeProject && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-medium">Project Status:</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wide">
              {activeProject.status}
            </span>
          </div>
        )}
      </div>

      {activeProject && (
        <>
          {/* Project Header Banner */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 p-8 md:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-extrabold select-none">
              SmartLearn
            </div>
            <div className="max-w-3xl space-y-4">
              <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
                Principal Investigator (PI) Overview
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {activeProject.title}
              </h2>
              <p className="text-indigo-100 leading-relaxed font-light">
                {activeProject.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Total Grant Funding
              </h3>
              <p className="mt-2 text-3xl font-black text-violet-600">
                ${activeProject.totalBudget.toLocaleString()}
              </p>
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                100% Allocated & Audited
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Ethics Review Status
              </h3>
              {activeProject.ethicsApps.length > 0 ? (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-800">
                    {activeProject.ethicsApps[0].status}
                  </p>
                  <span className="text-xs text-gray-400">
                    Submitted: {new Date(activeProject.ethicsApps[0].submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xl font-bold text-gray-400">No applications</p>
              )}
              <div className="mt-3">
                <button
                  onClick={handleSubmitEthics}
                  disabled={ethicsSubmitting}
                  className="w-full text-center text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 transition py-2 rounded-lg"
                >
                  {ethicsSubmitting ? 'Submitting...' : '+ Submit New Ethics Review'}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Peer-Reviewed Publications
              </h3>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {activeProject.publications.length}
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Logged in indexing systems (IEEE, ACM)
              </div>
            </div>
          </div>

          {/* Kanban Board Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> Kanban Board & Task Tracking
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* To Do Column */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
                    To Do
                  </h4>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-md">
                    {todoTasks.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {todoTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 hover:shadow-sm transition space-y-3"
                    >
                      <p className="text-gray-800 font-medium text-sm">{t.title}</p>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, 'IN_PROGRESS')}
                        className="w-full py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-lg transition"
                      >
                        Start Task &rarr;
                      </button>
                    </div>
                  ))}
                  {todoTasks.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-10">No tasks in queue</p>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-violet-50/50 p-5 rounded-2xl border border-violet-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-violet-700 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse"></span>
                    In Progress
                  </h4>
                  <span className="px-2 py-0.5 bg-violet-200 text-violet-800 text-xs font-bold rounded-md">
                    {inProgressTasks.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {inProgressTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-4 rounded-xl shadow-xs border border-violet-100 hover:shadow-sm transition space-y-3"
                    >
                      <p className="text-gray-800 font-medium text-sm">{t.title}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTaskStatus(t.id, 'TODO')}
                          className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg transition border border-gray-200"
                        >
                          &larr; Reopen
                        </button>
                        <button
                          onClick={() => handleUpdateTaskStatus(t.id, 'DONE')}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition"
                        >
                          Complete &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                  {inProgressTasks.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-10">No active work in progress</p>
                  )}
                </div>
              </div>

              {/* Done Column */}
              <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                    Completed
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-md">
                    {doneTasks.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {doneTasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-4 rounded-xl shadow-xs border border-emerald-100 hover:shadow-sm transition space-y-3 opacity-90"
                    >
                      <p className="text-gray-500 line-through font-medium text-sm">{t.title}</p>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, 'IN_PROGRESS')}
                        className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg transition border border-gray-200"
                      >
                        &larr; Reopen Task
                      </button>
                    </div>
                  ))}
                  {doneTasks.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-10">No completed tasks yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid for Milestones, Publications Forms & List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Milestones Panel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🎯</span> Milestones & Deliverables
              </h3>
              <div className="divide-y divide-gray-100">
                {activeProject.milestones.map((m) => (
                  <div key={m.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800 text-sm">{m.title}</p>
                      <p className="text-xs text-gray-400">
                        Due Date: {new Date(m.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {m.isCompleted ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {activeProject.milestones.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No milestones set.</p>
                )}
              </div>
            </div>

            {/* Publications Panel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>📚</span> Log a Peer-Reviewed Publication
                </h3>
                <form onSubmit={handleCreatePublication} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Publication Title (e.g. Decentralized LMS)"
                      value={pubForm.title}
                      onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                      required
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Journal/Conference (e.g. IEEE)"
                      value={pubForm.journal}
                      onChange={(e) => setPubForm({ ...pubForm, journal: e.target.value })}
                      required
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="DOI String (e.g. 10.1109/TE.2026.012345)"
                      value={pubForm.doi}
                      onChange={(e) => setPubForm({ ...pubForm, doi: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={pubSubmitting}
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
                    >
                      {pubSubmitting ? 'Logging...' : 'Log Pub'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Project Publications Feed
                </h4>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {activeProject.publications.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-2"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.title}</p>
                        <p className="text-xs text-gray-400">Published in: {p.journal}</p>
                      </div>
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-600 hover:underline font-semibold"
                        >
                          DOI: {p.doi} &rarr;
                        </a>
                      )}
                    </div>
                  ))}
                  {activeProject.publications.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No publications logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
