'use client';

import { useState } from 'react';

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface MentorshipRequest {
  id: string;
  studentId: string;
  mentorId: string;
  status: string;
  message?: string | null;
  createdAt: string;
  student: Student;
}

interface MentorProfile {
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
}

interface Props {
  initialProfile: MentorProfile;
  initialRequests: MentorshipRequest[];
  token: string;
}

export default function AlumniDashboardClient({ initialProfile, initialRequests, token }: Props) {
  const [profile, setProfile] = useState<MentorProfile>(initialProfile);
  const [requests, setRequests] = useState<MentorshipRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'requests' | 'profile'>('requests');

  // Profile Form State
  const [gradYear, setGradYear] = useState<string>(profile.graduationYear?.toString() || '');
  const [company, setCompany] = useState<string>(profile.company || '');
  const [jobTitle, setJobTitle] = useState<string>(profile.jobTitle || '');
  const [bio, setBio] = useState<string>(profile.bio || '');
  const [skills, setSkills] = useState<string>(profile.skills.join(', '));

  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/career/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          graduationYear: gradYear ? parseInt(gradYear) : null,
          company,
          jobTitle,
          bio,
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/career/mentorship-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status } : req))
        );
        setMessage({
          type: 'success',
          text: `Mentorship ticket successfully ${status === 'APPROVED' ? 'approved' : 'declined'}.`,
        });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.message || 'Failed to update request.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => {
            setActiveTab('requests');
            setMessage(null);
          }}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Mentorship Requests ({requests.filter((r) => r.status === 'PENDING').length} Pending)
        </button>
        <button
          onClick={() => {
            setActiveTab('profile');
            setMessage(null);
          }}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Mentor Profile
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

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📩</span> Received Student Mentorship Requests
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.length === 0 ? (
              <div className="col-span-2 bg-gray-850 p-12 rounded-2xl border border-gray-800 text-center max-w-md mx-auto my-6">
                <span className="text-4xl">📭</span>
                <h4 className="text-lg font-bold text-white mt-3">No Mentorship Requests</h4>
                <p className="text-gray-400 text-sm mt-1">Students will reach out to you once they discover your profile.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50 flex flex-col justify-between hover:shadow-lg transition duration-200"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {req.student.firstName} {req.student.lastName}
                        </h4>
                        <p className="text-xs text-gray-400">{req.student.email}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
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

                    <p className="text-sm text-gray-300 bg-gray-900/40 p-4 rounded-xl border border-gray-800/80 italic mb-6">
                      "{req.message || 'Hi, I would love to connect with you for career guidance!'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-700/50">
                    <span>Received: {new Date(req.createdAt).toLocaleDateString()}</span>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestStatus(req.id, 'APPROVED')}
                          disabled={updatingId !== null}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition disabled:opacity-50"
                        >
                          {updatingId === req.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRequestStatus(req.id, 'REJECTED')}
                          disabled={updatingId !== null}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-3xl bg-gray-800/30 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-gray-750/50 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Edit Mentor Directory Card</h3>

          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="e.g. 2018"
                  className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Current Company / Employer
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Inc."
                  className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Architect"
                className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Professional Bio & Focus
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your career path, professional interests, and how you can support students..."
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Specialized Skills (Comma-Separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Next.js, System Architecture, Resume Review"
                className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Card'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
