'use client';

import { useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: string;
  principalInvestigator: User;
}

interface EthicsApp {
  id: string;
  projectId: string;
  status: string;
  submittedAt: string;
  project: ResearchProject;
}

interface Props {
  initialApps: EthicsApp[];
  token: string;
}

export default function EthicsDashboardClient({ initialApps, token }: Props) {
  const [apps, setApps] = useState<EthicsApp[]>(initialApps);
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialApps[0]?.id || ''
  );
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeApp = apps.find((a) => a.id === selectedAppId);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleReview = async (status: 'APPROVED' | 'REJECTED' | 'REVISIONS_REQUIRED') => {
    if (!activeApp) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/research/ethics/${activeApp.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, comments }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Application status successfully updated to ${status}.`,
        });
        
        // Remove from list
        const updatedApps = apps.filter((a) => a.id !== activeApp.id);
        setApps(updatedApps);
        setComments('');
        setSelectedAppId(updatedApps[0]?.id || '');
      } else {
        const errData = await res.json();
        setMessage({
          type: 'error',
          text: errData.message || 'Failed to update application review.',
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (apps.length === 0) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-md p-12 rounded-2xl border border-gray-700/50 text-center max-w-xl mx-auto my-10">
        <div className="text-violet-400 mb-4 text-5xl">✅</div>
        <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-400">
          There are currently no research ethics applications awaiting review.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar List */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Pending Protocol Filings
        </h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                setSelectedAppId(app.id);
                setMessage(null);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                app.id === selectedAppId
                  ? 'bg-violet-600/20 border-violet-500 shadow-lg shadow-violet-500/10'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
                Project Code: {app.projectId.substring(0, 8)}
              </div>
              <h4 className="text-sm font-semibold text-white line-clamp-1 mb-2">
                {app.project.title}
              </h4>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>By {app.project.principalInvestigator.firstName} {app.project.principalInvestigator.lastName}</span>
                <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Details View */}
      {activeApp && (
        <div className="lg:col-span-8 bg-gray-800/40 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-gray-700/50 shadow-xl space-y-6">
          <div className="border-b border-gray-700 pb-4">
            <span className="px-3 py-1 bg-yellow-950/50 border border-yellow-800 text-yellow-400 text-xs font-bold rounded-full uppercase tracking-wider">
              {activeApp.status}
            </span>
            <h3 className="text-2xl font-bold text-white mt-3">{activeApp.project.title}</h3>
            <div className="mt-2 text-sm text-gray-400 flex flex-wrap gap-x-6 gap-y-1">
              <span>
                <strong>PI:</strong> {activeApp.project.principalInvestigator.firstName} {activeApp.project.principalInvestigator.lastName}
              </span>
              <span>
                <strong>Email:</strong> {activeApp.project.principalInvestigator.email}
              </span>
              <span>
                <strong>Submitted:</strong> {new Date(activeApp.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Abstract</h4>
            <p className="text-gray-300 leading-relaxed text-sm bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              {activeApp.project.description || 'No description provided.'}
            </p>
          </div>

          {/* Feedback & Review Form */}
          <div className="space-y-4 border-t border-gray-700 pt-6">
            <h4 className="text-base font-bold text-white">Ethical Evaluation Form</h4>
            
            {message && (
              <div
                className={`p-3.5 rounded-xl border text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/30 border-rose-800 text-rose-400'
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="review-comments" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Evaluator Comments & Recommendations
              </label>
              <textarea
                id="review-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Detail any ethical concerns, protocol amendments, or approval justifications..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleReview('APPROVED')}
                disabled={submitting}
                id="btn-approve"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                Approve Protocol
              </button>
              
              <button
                onClick={() => handleReview('REVISIONS_REQUIRED')}
                disabled={submitting}
                id="btn-revisions"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-900/20 disabled:opacity-50"
              >
                Request Revisions
              </button>

              <button
                onClick={() => handleReview('REJECTED')}
                disabled={submitting}
                id="btn-reject"
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-rose-900/20 disabled:opacity-50"
              >
                Reject Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
