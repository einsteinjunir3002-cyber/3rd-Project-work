'use client';

import { useState } from 'react';

interface Student {
  id: string;
}

interface Mentor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  graduationYear?: number | null;
  company?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  skills: string[];
  advisorExpertise?: string | null;
}

interface MentorshipRequest {
  id: string;
  studentId: string;
  mentorId: string;
  status: string;
  message?: string | null;
  createdAt: string;
  mentor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string | null;
    jobTitle?: string | null;
  };
}

interface Props {
  initialMentors: Mentor[];
  initialRequests: MentorshipRequest[];
  token: string;
}

export default function StudentMentorshipClient({ initialMentors, initialRequests, token }: Props) {
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [requests, setRequests] = useState<MentorshipRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ALUMNI' | 'CAREER_ADVISOR'>('ALL');

  // Modal / Request Form State
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/career/mentorship-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          message: requestMessage,
        }),
      });

      if (res.ok) {
        const newRequest = await res.json();
        
        // Refetch requests
        const reqsRes = await fetch(`${API_URL}/career/mentorship-requests/student`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (reqsRes.ok) {
          setRequests(await reqsRes.json());
        }

        setMessage({
          type: 'success',
          text: `Request successfully submitted to ${selectedMentor.firstName} ${selectedMentor.lastName}!`,
        });
        setRequestMessage('');
        setSelectedMentor(null);
      } else {
        const errData = await res.json();
        setMessage({
          type: 'error',
          text: errData.message || 'Failed to submit mentorship request.',
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      (m.company && m.company.toLowerCase().includes(search.toLowerCase())) ||
      (m.advisorExpertise && m.advisorExpertise.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ALUMNI' && m.roles.includes('ALUMNI')) ||
      (roleFilter === 'CAREER_ADVISOR' && m.roles.includes('CAREER_ADVISOR'));

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => {
            setActiveTab('browse');
            setMessage(null);
          }}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'browse'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Browse Directory ({filteredMentors.length} Matches)
        </button>
        <button
          onClick={() => {
            setActiveTab('requests');
            setMessage(null);
          }}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          My Tickets ({requests.length})
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm max-w-2xl ${
            message.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
              : 'bg-rose-950/30 border-rose-800 text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-gray-800/20 p-4 rounded-2xl border border-gray-800">
            <input
              type="text"
              placeholder="Search mentors by name, company, expertise, or skills (e.g. React)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            >
              <option value="ALL">All Mentors & Advisors</option>
              <option value="ALUMNI">Alumni Only</option>
              <option value="CAREER_ADVISOR">Career Advisors Only</option>
            </select>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.length === 0 ? (
              <div className="col-span-3 bg-gray-850 p-12 rounded-2xl border border-gray-800 text-center max-w-md mx-auto my-6">
                <span className="text-4xl">🔍</span>
                <h4 className="text-lg font-bold text-white mt-3">No Mentors Found</h4>
                <p className="text-gray-400 text-sm mt-1">Try broadening your search keywords or removing filters.</p>
              </div>
            ) : (
              filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50 flex flex-col justify-between hover:shadow-lg transition hover:border-gray-600 duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {mentor.firstName} {mentor.lastName}
                        </h4>
                        <span className="text-xs text-gray-400">{mentor.email}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-3xs font-black rounded border uppercase tracking-wider ${
                          mentor.roles.includes('CAREER_ADVISOR')
                            ? 'bg-sky-950/40 border-sky-850 text-sky-400'
                            : 'bg-emerald-950/40 border-emerald-850 text-emerald-400'
                        }`}
                      >
                        {mentor.roles.includes('CAREER_ADVISOR') ? 'Advisor' : 'Alumni'}
                      </span>
                    </div>

                    {/* Workplace details */}
                    {(mentor.company || mentor.jobTitle) && (
                      <p className="text-xs font-semibold text-gray-200">
                        {mentor.jobTitle} {mentor.company && `at ${mentor.company}`}
                        {mentor.graduationYear && ` (Class of '${mentor.graduationYear.toString().substring(2)})`}
                      </p>
                    )}

                    {/* Advisor expertise */}
                    {mentor.advisorExpertise && (
                      <p className="text-xs text-sky-300 font-semibold bg-sky-950/20 p-2.5 rounded-lg border border-sky-950/50">
                        <strong>Expertise:</strong> {mentor.advisorExpertise}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 line-clamp-3 italic">
                      "{mentor.bio || 'No bio provided.'}"
                    </p>

                    {/* Skills Tags */}
                    {mentor.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {mentor.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-900/60 text-gray-300 text-3xs rounded-full border border-gray-700/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-700/50">
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setMessage(null);
                      }}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-violet-900/10"
                    >
                      Request Advice / Mentorship
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎟️</span> My Mentorship Tickets
          </h3>

          <div className="max-w-4xl divide-y divide-gray-800 bg-gray-800/20 rounded-2xl border border-gray-800 overflow-hidden">
            {requests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">You have not submitted any mentorship tickets yet.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-850/30 transition">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white">
                        {req.mentor.firstName} {req.mentor.lastName}
                      </h4>
                      {req.mentor.company && (
                        <span className="text-xs text-gray-400">
                          ({req.mentor.jobTitle} at {req.mentor.company})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Message Sent: "{req.message || 'No custom message.'}"
                    </p>
                    <p className="text-4xs text-gray-500">
                      Requested: {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        req.status === 'PENDING'
                          ? 'bg-yellow-950/50 border border-yellow-800 text-yellow-400'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400'
                          : 'bg-rose-950/50 border border-rose-800 text-rose-400'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2">
              Request Mentorship / Advising
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Connect with <strong>{selectedMentor.firstName} {selectedMentor.lastName}</strong>. Include a clear introduction and explain what advice or support you need.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Introductory Message
                </label>
                <textarea
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Hi, I am studying Software Engineering and would love to ask about internship opportunities..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
