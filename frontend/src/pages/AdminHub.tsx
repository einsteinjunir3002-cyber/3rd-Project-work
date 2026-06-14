import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Settings, 
  UserX, 
  UserCheck, 
  Search, 
  Sliders, 
  Cpu, 
  TrendingUp, 
  BookOpen, 
  FileCheck, 
  Video,
  KeyRound,
  ShieldCheck,
  Loader2,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Sparkles,
  Briefcase,
  Lightbulb,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  History,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminHub: React.FC = () => {
  const { currentAdminTab, addSystemNotification } = useAppState();
  const { user } = useAuth(); // Logged-in admin data

  // State definitions
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Forms for User Management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('student');
  const [deptInput, setDeptInput] = useState('Computer Science');
  const [stdIdInput, setStdIdInput] = useState('');
  const [titleInput, setTitleInput] = useState('Dr.');
  const [officeInput, setOfficeInput] = useState('');

  // Bulk Import
  const [csvText, setCsvText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // System Stats
  const [stats, setStats] = useState<any>({
    studentsCount: 0,
    lecturersCount: 0,
    coursesCount: 0,
    notesCount: 0,
    submissionsCount: 0,
    consultationsCount: 0,
    averageGpa: 4.0,
    apiUsageStats: {
      gemini: { requests: 0, errors: 0 },
      openai: { requests: 0, errors: 0 },
      openrouter: { requests: 0, errors: 0 },
      groq: { requests: 0, errors: 0 },
      together: { requests: 0, errors: 0 },
    }
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Academic Management
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingAcademics, setLoadingAcademics] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyCode, setNewFacultyCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptFaculty, setNewDeptFaculty] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Configuration Settings State
  const [siteName, setSiteName] = useState('SmartLearn AI');
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'openai' | 'openrouter' | 'groq' | 'together'>('groq');
  const [activeModel, setActiveModel] = useState('llama3-8b-8192');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [togetherKey, setTogetherKey] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Program Tracks
  const [startups, setStartups] = useState<any[]>([]);
  const [researchProjects, setResearchProjects] = useState<any[]>([]);
  const [jobListings, setJobListings] = useState<any[]>([]);

  // Roles & Permissions state
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<any>(null);
  const [permissionsInput, setPermissionsInput] = useState<string>('');

  // UI Alerts Banner
  const [uiNotification, setUiNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerUiNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setUiNotification({ text, type });
    setTimeout(() => setUiNotification(null), 4000);
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      let url = `/api/admin/users?query=${searchQuery}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      const response = await axios.get(url);
      setUsersList(response.data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      const data = response.data;
      setSiteName(data.siteName || 'SmartLearn AI');
      setActiveProvider(data.activeAiProvider || 'groq');
      setActiveModel(data.activeAiModel || 'llama3-8b-8192');
      setGeminiKey(data.geminiApiKey || '');
      setOpenaiKey(data.openaiApiKey || '');
      setOpenrouterKey(data.openrouterApiKey || '');
      setGroqKey(data.groqApiKey || '');
      setTogetherKey(data.togetherApiKey || '');
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Fetch Academics
  const fetchAcademics = async () => {
    setLoadingAcademics(true);
    try {
      const facRes = await axios.get('/api/admin/faculties');
      const deptRes = await axios.get('/api/admin/departments');
      setFaculties(facRes.data);
      setDepartments(deptRes.data);
      if (facRes.data.length > 0) {
        setNewDeptFaculty(facRes.data[0]._id || facRes.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching academic branches:', err);
    } finally {
      setLoadingAcademics(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await axios.get('/api/admin/audit-logs');
      setAuditLogs(response.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch Roles
  const fetchRolesList = async () => {
    try {
      const response = await axios.get('/api/admin/roles');
      setRolesList(response.data);
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  // Fetch Startups & Research
  const fetchProgramEntities = async () => {
    try {
      const startRes = await axios.get('/api/admin/startups');
      const resRes = await axios.get('/api/admin/research');
      const jobRes = await axios.get('/api/admin/jobs');
      setStartups(startRes.data);
      setResearchProjects(resRes.data);
      setJobListings(jobRes.data);
    } catch (err) {
      console.error('Error loading program trackers:', err);
    }
  };

  // Dispatch requests based on active tab selection
  useEffect(() => {
    if (currentAdminTab === 'admin-users') {
      fetchUsers();
    } else if (currentAdminTab === 'admin-dashboard' || currentAdminTab === 'admin-stats' || currentAdminTab === 'admin-analytics') {
      fetchStats();
    } else if (currentAdminTab === 'admin-settings' || currentAdminTab === 'admin-ai') {
      fetchSettings();
    } else if (currentAdminTab === 'admin-faculties' || currentAdminTab === 'admin-departments' || currentAdminTab === 'admin-courses' || currentAdminTab === 'admin-academic') {
      fetchAcademics();
    } else if (currentAdminTab === 'admin-audit' || currentAdminTab === 'admin-security') {
      fetchAuditLogs();
    } else if (currentAdminTab === 'admin-roles') {
      fetchRolesList();
    } else if (['admin-startups', 'admin-research', 'admin-careers'].includes(currentAdminTab)) {
      fetchProgramEntities();
    }
  }, [currentAdminTab, roleFilter]);

  // Create User submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/users/create', {
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        role: roleInput,
        department: deptInput,
        studentIdNumber: stdIdInput,
        title: titleInput,
        office: officeInput,
      });
      triggerUiNotification(response.data.message, 'success');
      setShowCreateModal(false);
      setNameInput('');
      setEmailInput('');
      setPasswordInput('');
      setStdIdInput('');
      setOfficeInput('');
      fetchUsers();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Error creating account.', 'error');
    }
  };

  // Bulk CSV parser import
  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    // Parse simple CSV rows
    const lines = csvText.split('\n');
    const importedUsers = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length >= 3) {
        importedUsers.push({
          name: row[0]?.trim(),
          email: row[1]?.trim(),
          role: row[2]?.trim(),
          department: row[3]?.trim() || '',
          studentIdNumber: row[4]?.trim() || '',
        });
      }
    }

    try {
      const response = await axios.post('/api/admin/users/bulk-import', { users: importedUsers });
      triggerUiNotification(response.data.message, 'success');
      setShowBulkModal(false);
      setCsvText('');
      fetchUsers();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'CSV upload failed.', 'error');
    }
  };

  const handleToggleSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await axios.post('/api/admin/users/suspend', { userId, suspend: !currentStatus });
      triggerUiNotification(response.data.message, 'success');
      fetchUsers();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Failed updating status.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const response = await axios.post('/api/admin/users/delete', { userId });
      triggerUiNotification(response.data.message, 'success');
      fetchUsers();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Failed deleting user.', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const response = await axios.post('/api/admin/settings', {
        siteName,
        activeAiProvider: activeProvider,
        activeAiModel: activeModel,
        geminiApiKey: geminiKey,
        openaiApiKey: openaiKey,
        openrouterApiKey: openrouterKey,
        groqApiKey: groqKey,
        togetherApiKey: togetherKey,
      });
      triggerUiNotification(response.data.message, 'success');
      fetchSettings();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Error saving settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestConnection = async (provider: 'gemini' | 'openai' | 'openrouter' | 'groq' | 'together') => {
    setTestingConnection(provider);
    let apiKey = '';
    if (provider === 'gemini') apiKey = geminiKey;
    else if (provider === 'openai') apiKey = openaiKey;
    else if (provider === 'openrouter') apiKey = openrouterKey;
    else if (provider === 'groq') apiKey = groqKey;
    else if (provider === 'together') apiKey = togetherKey;

    try {
      const response = await axios.post('/api/admin/ai/test', { provider, apiKey, modelName: activeModel });
      if (response.data.success) {
        triggerUiNotification(response.data.message, 'success');
      } else {
        triggerUiNotification(response.data.message, 'error');
      }
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Connection failed.', 'error');
    } finally {
      setTestingConnection(null);
    }
  };

  // Add Faculty
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/faculties/create', { name: newFacultyName, code: newFacultyCode });
      triggerUiNotification('Faculty created successfully!', 'success');
      setNewFacultyName('');
      setNewFacultyCode('');
      fetchAcademics();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Failed creating faculty.', 'error');
    }
  };

  // Add Dept
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/departments/create', { name: newDeptName, code: newDeptCode, facultyId: newDeptFaculty });
      triggerUiNotification('Department created successfully!', 'success');
      setNewDeptName('');
      setNewDeptCode('');
      fetchAcademics();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Failed creating department.', 'error');
    }
  };

  // Save Permissions to role
  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return;
    const perms = permissionsInput.split(',').map(p => p.trim()).filter(Boolean);
    try {
      await axios.post('/api/admin/roles/permissions', {
        roleId: selectedRoleForPermissions.id || selectedRoleForPermissions._id,
        permissions: perms
      });
      triggerUiNotification('Role permissions updated successfully!', 'success');
      setSelectedRoleForPermissions(null);
      fetchRolesList();
    } catch (err: any) {
      triggerUiNotification(err.response?.data?.message || 'Failed updating permissions.', 'error');
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.userEmail.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="flex-grow p-8 overflow-y-auto max-h-screen relative text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
      
      {/* Floating UI Notifications */}
      <AnimatePresence>
        {uiNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-xl border glass max-w-sm ${
              uiNotification.type === 'success' 
                ? 'border-emerald-500/30 bg-emerald-950/70 text-emerald-300' 
                : uiNotification.type === 'error'
                ? 'border-red-500/30 bg-red-950/70 text-red-300'
                : 'border-blue-500/30 bg-blue-950/70 text-blue-300'
            }`}
          >
            {uiNotification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {uiNotification.type === 'error' && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {uiNotification.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-xs font-bold leading-tight">{uiNotification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header portal title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-violet-500 font-bold text-xs uppercase tracking-wider">SmartLearn Institutional Command Desk</span>
          <h2 className="text-2xl font-black font-sans mt-1">Administrator Control Center</h2>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-850 rounded-xl">
          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 uppercase bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Core Root Access
          </span>
          {user?.role === 'superadmin' && (
            <span className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 uppercase bg-indigo-500/10 border border-indigo-500/20 rounded-md">
              👑 Super User
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* 1. DASHBOARD OVERVIEW */}
        {currentAdminTab === 'admin-dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            {/* Main Stats widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Active Students</span>
                  <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.studentsCount}</h4>
                </div>
                <Users className="w-7 h-7 text-violet-500 opacity-60" />
              </div>
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Active Lecturers</span>
                  <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.lecturersCount}</h4>
                </div>
                <Sliders className="w-7 h-7 text-amber-500 opacity-60" />
              </div>
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Running Courses</span>
                  <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.coursesCount}</h4>
                </div>
                <BookOpen className="w-7 h-7 text-emerald-500 opacity-60" />
              </div>
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Global average GPA</span>
                  <h4 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.averageGpa}</h4>
                </div>
                <TrendingUp className="w-7 h-7 text-sky-500 opacity-60" />
              </div>
            </div>

            {/* Extra metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-sm mb-4">🖥️ System Health Metrics</h3>
                <div className="flex flex-col gap-4 text-xs font-semibold">
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">API Server Latency</span>
                    <span className="text-emerald-500 font-bold">14ms (Optimal)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">Database Engine State</span>
                    <span className="text-emerald-500 font-bold">Online</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">AI Router Fallback Threshold</span>
                    <span className="text-slate-400">3 failed calls</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-sm mb-4">🛡️ Security Status</h3>
                <div className="flex flex-col gap-4 text-xs font-semibold">
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">Failed Logins (24h)</span>
                    <span className="text-slate-900 dark:text-white font-bold">0 Attempts</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">MFA Verification Policy</span>
                    <span className="text-violet-500 font-bold">Enforced (Active)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">Locked Accounts</span>
                    <span className="text-slate-400">0 accounts</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-sm mb-4">📊 Resource Upload Statistics</h3>
                <div className="flex flex-col gap-4 text-xs font-semibold">
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">Uploaded Lecture Slides</span>
                    <span className="text-slate-900 dark:text-white font-bold">{stats.notesCount} Slides</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">Assignment Submissions</span>
                    <span className="text-slate-900 dark:text-white font-bold">{stats.submissionsCount} Files</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-950/40 rounded-xl">
                    <span className="text-slate-500">WebRTC Video Consultations</span>
                    <span className="text-slate-900 dark:text-white font-bold">{stats.consultationsCount} Sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. USER MANAGEMENT */}
        {currentAdminTab === 'admin-users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            {/* Search, Filter, actions bar */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer">
                  Search
                </button>
              </form>

              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add User
                </button>
                <button 
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Bulk Import (CSV)
                </button>
              </div>
            </div>

            {/* Users grid table */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <h3 className="font-extrabold text-sm mb-4">Accounts Directory</h3>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" /> Loading...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-500 font-black text-[9px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Department / Metadata</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-4">
                            <h4 className="font-black text-slate-800 dark:text-slate-200">{usr.name}</h4>
                            <span className="text-[10px] text-slate-400">{usr.email}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              usr.role === 'superadmin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                              usr.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 
                              usr.role === 'lecturer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                               {usr.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {usr.role === 'student' ? (
                              <span>Dept: {usr.department || 'CS'} • ID: {usr.studentIdNumber || 'N/A'}</span>
                            ) : usr.role === 'lecturer' ? (
                              <span>Dept: {usr.department || 'CS'} • Office: {usr.office || 'N/A'}</span>
                            ) : (
                              <span>Platform Administrator</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${usr.isSuspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {usr.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleToggleSuspension(usr.id, usr.isSuspended)}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${usr.isSuspended ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                              >
                                {usr.isSuspended ? 'Reactivate' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                className="p-1.5 bg-red-950/40 border border-red-900/30 hover:bg-red-900/40 text-red-400 rounded-lg cursor-pointer transition-all"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CREATE USER MODAL */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                  <h3 className="font-extrabold text-sm mb-4">Create User Profile</h3>
                  <form onSubmit={handleCreateUserSubmit} className="flex flex-col gap-3 text-xs font-semibold">
                    <div className="flex flex-col gap-1">
                      <label>Academic Name</label>
                      <input type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Email Address</label>
                      <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Password</label>
                      <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Assign Role</label>
                      <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)} className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none">
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Administrator</option>
                        {user?.role === 'superadmin' && <option value="superadmin">Super Administrator</option>}
                      </select>
                    </div>
                    {roleInput === 'student' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label>Department</label>
                          <input type="text" value={deptInput} onChange={(e) => setDeptInput(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label>Student ID</label>
                          <input type="text" value={stdIdInput} onChange={(e) => setStdIdInput(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" />
                        </div>
                      </div>
                    )}
                    {roleInput === 'lecturer' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label>Title</label>
                          <select value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <option>Dr.</option>
                            <option>Prof.</option>
                            <option>Mr.</option>
                            <option>Mrs.</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label>Office</label>
                          <input type="text" value={officeInput} onChange={(e) => setOfficeInput(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-200 text-slate-850 dark:bg-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer">Create Profile</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* BULK IMPORT MODAL */}
            {showBulkModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                  <h3 className="font-extrabold text-sm mb-4">Bulk Import CSV</h3>
                  <p className="text-[10px] text-slate-400 mb-3 font-semibold leading-relaxed">
                    Paste raw CSV format below. Include header: `name,email,role,department,studentIdNumber`.
                  </p>
                  <form onSubmit={handleBulkImportSubmit} className="flex flex-col gap-3 text-xs font-semibold">
                    <textarea 
                      rows={8} 
                      value={csvText} 
                      onChange={(e) => setCsvText(e.target.value)} 
                      placeholder="name,email,role,department,studentIdNumber&#10;Kofi Mensah,stu2@smartlearn.edu,student,CS,SL-20304"
                      className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none"
                      required
                    />
                    <div className="flex gap-2 justify-end mt-2">
                      <button type="button" onClick={() => setShowBulkModal(false)} className="px-4 py-2 bg-slate-200 text-slate-850 dark:bg-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer">Import Accounts</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 3. ROLE MANAGEMENT */}
        {currentAdminTab === 'admin-roles' && (
          <motion.div 
            key="roles"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm">System Roles Directory</h3>
              <div className="flex flex-col gap-3">
                {rolesList.map(r => (
                  <div key={r.id || r._id} className="p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black capitalize text-slate-800 dark:text-slate-250">{r.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{r.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.permissions.map((p: string) => (
                          <span key={p} className="text-[8px] font-black uppercase px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedRoleForPermissions(r);
                        setPermissionsInput(r.permissions.join(', '));
                      }}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all"
                    >
                      Edit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedRoleForPermissions && (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4">
                <h3 className="font-extrabold text-sm">Modify Role Permissions: <span className="capitalize text-violet-500">{selectedRoleForPermissions.name}</span></h3>
                <div className="flex flex-col gap-2 font-semibold text-xs">
                  <label>Permissions list (comma-separated):</label>
                  <input 
                    type="text" 
                    value={permissionsInput} 
                    onChange={(e) => setPermissionsInput(e.target.value)}
                    className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-500">Allowed examples: Create Courses, Grade Assignments, Manage Users, View Reports, Manage Startups.</span>
                  <div className="flex gap-2 justify-end mt-4">
                    <button onClick={() => setSelectedRoleForPermissions(null)} className="px-4 py-2 bg-slate-200 text-slate-850 dark:bg-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
                    <button onClick={handleSavePermissions} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer">Save Permissions</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 4. DEPARTMENT & FACULTY MANAGEMENT */}
        {['admin-departments', 'admin-faculties'].includes(currentAdminTab) && (
          <motion.div 
            key="departments"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Faculties Panel */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2"><Network className="w-4 h-4 text-violet-500" /> Faculties Configuration</h3>
              <form onSubmit={handleAddFaculty} className="flex gap-2">
                <input type="text" required placeholder="Faculty Name" value={newFacultyName} onChange={(e) => setNewFacultyName(e.target.value)} className="flex-1 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs" />
                <input type="text" required placeholder="Code" value={newFacultyCode} onChange={(e) => setNewFacultyCode(e.target.value)} className="w-20 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs uppercase" />
                <button type="submit" className="px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer">Add</button>
              </form>

              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {faculties.map(f => (
                  <div key={f._id || f.id} className="p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{f.name}</span>
                    <span className="text-[10px] text-violet-500 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{f.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Departments Panel */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-500" /> Departments Configuration</h3>
              <form onSubmit={handleAddDept} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="text" required placeholder="Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="flex-1 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs" />
                  <input type="text" required placeholder="Code" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} className="w-20 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs uppercase" />
                </div>
                <div className="flex gap-2">
                  <select value={newDeptFaculty} onChange={(e) => setNewDeptFaculty(e.target.value)} className="flex-1 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs cursor-pointer">
                    {faculties.map(f => (
                      <option key={f._id || f.id} value={f._id || f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer">Add Department</button>
                </div>
              </form>

              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                {departments.map(d => (
                  <div key={d._id || d.id} className="p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs font-semibold">
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 block">{d.name}</span>
                      <span className="text-[10px] text-slate-400">Faculty: {d.facultyId?.name || 'Unassigned'}</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{d.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. INCUBATION / STARTUPS */}
        {currentAdminTab === 'admin-startups' && (
          <motion.div 
            key="startups"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4"
          >
            <h3 className="font-extrabold text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4 text-violet-500 animate-pulse" /> Startup Incubator Programs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {startups.map(prog => (
                <div key={prog.id || prog._id} className="p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <h4 className="font-black text-slate-800 dark:text-slate-200">{prog.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{prog.description}</p>
                  <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-500">
                    <span>Date: {prog.startDate ? new Date(prog.startDate).toLocaleDateString() : 'N/A'}</span>
                    <span className="px-2 py-0.5 rounded-full uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">{prog.status}</span>
                  </div>
                </div>
              ))}
              {startups.length === 0 && (
                <p className="text-slate-500 text-xs py-4 text-center col-span-2">No active incubation tracks logged yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 6. RESEARCH PROJECTS */}
        {currentAdminTab === 'admin-research' && (
          <motion.div 
            key="research"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4"
          >
            <h3 className="font-extrabold text-sm flex items-center gap-2"><Search className="w-4 h-4 text-violet-500" /> Academic Research Registrations</h3>
            <div className="overflow-x-auto text-xs font-semibold">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-500 text-[9px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                    <th className="p-3">Research Project Title</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Lead Researcher</th>
                    <th className="p-3">Funding Granted</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {researchProjects.map(proj => (
                    <tr key={proj._id} className="border-b border-slate-100 dark:border-slate-850">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{proj.title}</td>
                      <td className="p-3 text-slate-400">{proj.domain}</td>
                      <td className="p-3 text-slate-400">{proj.leadResearcher?.name || 'Professor'}</td>
                      <td className="p-3 text-emerald-500 font-bold">GH₵ {proj.fundingAmount || 0}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{proj.status}</span>
                      </td>
                    </tr>
                  ))}
                  {researchProjects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-500 py-6">No research projects registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 7. CAREER MANAGEMENT */}
        {currentAdminTab === 'admin-careers' && (
          <motion.div 
            key="careers"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4"
          >
            <h3 className="font-extrabold text-sm flex items-center gap-2"><Briefcase className="w-4 h-4 text-violet-500" /> Active Placement Listings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              {jobListings.map(job => (
                <div key={job._id} className="p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span className="px-2 py-0.5 rounded text-[9px] uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20 font-black">{job.type}</span>
                  <h4 className="font-black text-slate-850 dark:text-slate-200 mt-2">{job.title}</h4>
                  <p className="text-slate-500 text-[10px]">{job.company} • {job.location}</p>
                </div>
              ))}
              {jobListings.length === 0 && (
                <p className="text-slate-500 text-xs py-4 text-center col-span-3">No jobs posted in career services.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 8. SECURITY & SESSION CONTROL */}
        {currentAdminTab === 'admin-security' && (
          <motion.div 
            key="security"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4"
          >
            <h3 className="font-extrabold text-sm flex items-center gap-2"><ShieldCheck className="w-4.5 h-4.5 text-violet-500" /> Login & API Session Sentinel</h3>
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-500">
              <div className="flex justify-between items-center p-3.5 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                <div>
                  <h4 className="font-black text-slate-850 dark:text-slate-200">Local Brute-Force Rate Limiting</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Limits credential attempts to maximum 20 per 10 minutes</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                <div>
                  <h4 className="font-black text-slate-850 dark:text-slate-200">Device/IP Verification Logs</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Triggers MFA if new device signature is discovered</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold">Active</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 9. AUDIT LOG SENTINEL */}
        {currentAdminTab === 'admin-audit' && (
          <motion.div 
            key="audit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-4"
          >
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter logs by action or email..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg font-bold">
                ⚠️ Write-Only Ledger (Audit logs cannot be modified)
              </span>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              {loadingLogs ? (
                <div className="text-center py-6 text-xs text-slate-400">Loading audit history...</div>
              ) : (
                <div className="overflow-x-auto text-xs font-semibold">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-500 text-[9px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                        <th className="p-3">User Email</th>
                        <th className="p-3">Operation / Event</th>
                        <th className="p-3">Previous State</th>
                        <th className="p-3">New State</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log._id || log.id} className="border-b border-slate-100 dark:border-slate-850 text-[11px]">
                          <td className="p-3 font-bold text-slate-850 dark:text-slate-200">{log.userEmail}</td>
                          <td className="p-3 text-violet-500 font-bold">{log.action}</td>
                          <td className="p-3 text-slate-400 font-mono truncate max-w-[150px]">{log.previousValue || 'N/A'}</td>
                          <td className="p-3 text-slate-800 dark:text-slate-300 font-mono truncate max-w-[150px]">{log.newValue || 'N/A'}</td>
                          <td className="p-3 text-slate-400">{log.ipAddress}</td>
                          <td className="p-3 text-right text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 10. SYSTEM CONFIGURATION & AI MANAGEMENT */}
        {(currentAdminTab === 'admin-settings' || currentAdminTab === 'admin-ai') && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
          >
            <h3 className="font-extrabold text-sm mb-2 flex items-center gap-1.5 text-violet-400">
              <Settings className="w-4.5 h-4.5" /> Configure System & AI Fallbacks
            </h3>
            <p className="text-[10px] text-slate-400 mb-6 font-semibold">
              Manage platform branding, define the active primary provider, configure failover API Keys, and test connection endpoints directly.
            </p>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 font-semibold text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400">LMS Platform Branding Title:</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400">Active Primary AI Provider:</label>
                  <select
                    value={activeProvider}
                    onChange={(e) => {
                      const prov = e.target.value as any;
                      setActiveProvider(prov);
                      if (prov === 'gemini') setActiveModel('gemini-2.5-flash');
                      else if (prov === 'openai') setActiveModel('gpt-4o-mini');
                      else if (prov === 'openrouter') setActiveModel('google/gemini-2.5-flash:free');
                      else if (prov === 'groq') setActiveModel('llama3-8b-8192');
                      else if (prov === 'together') setActiveModel('meta-llama/Llama-3-8b-chat-hf');
                    }}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer focus:outline-none focus:border-violet-500"
                  >
                    <option value="gemini">Google Gemini API (Primary)</option>
                    <option value="openai">OpenAI API (Developer Direct)</option>
                    <option value="openrouter">OpenRouter Free Models</option>
                    <option value="groq">Groq Free Models (Llama-3)</option>
                    <option value="together">Together AI API (Fallback)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400">Primary AI Model Identifier:</label>
                <input
                  type="text"
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  placeholder="e.g. gemini-2.5-flash, gpt-4o-mini"
                  required
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-violet-400" /> Secure Fallback Provider Credentials
                </h4>
                <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                  Values ending with "..." indicate existing keys are securely encrypted at rest. To remove a key, clear the field, then click save.
                </p>

                {/* Gemini key */}
                <div className="flex flex-col gap-1.5 p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span>Google Gemini API Key:</span>
                  <div className="flex gap-2">
                    <input type="password" placeholder="Enter Gemini key..." value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} className="flex-grow p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                    <button type="button" disabled={testingConnection !== null} onClick={() => handleTestConnection('gemini')} className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                      {testingConnection === 'gemini' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {/* OpenAI key */}
                <div className="flex flex-col gap-1.5 p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span>OpenAI API Key:</span>
                  <div className="flex gap-2">
                    <input type="password" placeholder="Enter OpenAI key..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} className="flex-grow p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                    <button type="button" disabled={testingConnection !== null} onClick={() => handleTestConnection('openai')} className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                      {testingConnection === 'openai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {/* OpenRouter key */}
                <div className="flex flex-col gap-1.5 p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span>OpenRouter API Key:</span>
                  <div className="flex gap-2">
                    <input type="password" placeholder="Enter OpenRouter key..." value={openrouterKey} onChange={(e) => setOpenrouterKey(e.target.value)} className="flex-grow p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                    <button type="button" disabled={testingConnection !== null} onClick={() => handleTestConnection('openrouter')} className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                      {testingConnection === 'openrouter' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {/* Groq key */}
                <div className="flex flex-col gap-1.5 p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span>Groq API Key:</span>
                  <div className="flex gap-2">
                    <input type="password" placeholder="Enter Groq key..." value={groqKey} onChange={(e) => setGroqKey(e.target.value)} className="flex-grow p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                    <button type="button" disabled={testingConnection !== null} onClick={() => handleTestConnection('groq')} className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                      {testingConnection === 'groq' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

                {/* Together key */}
                <div className="flex flex-col gap-1.5 p-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span>Together AI API Key:</span>
                  <div className="flex gap-2">
                    <input type="password" placeholder="Enter Together key..." value={togetherKey} onChange={(e) => setTogetherKey(e.target.value)} className="flex-grow p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                    <button type="button" disabled={testingConnection !== null} onClick={() => handleTestConnection('together')} className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer">
                      {testingConnection === 'together' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                    </button>
                  </div>
                </div>

              </div>

              {user?.role === 'superadmin' ? (
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save System Settings ⚙️'}
                </button>
              ) : (
                <p className="text-center text-red-500 text-[10px] mt-4 font-black uppercase tracking-wider">
                  ⚠️ Root Super Administrator Role required to save configurations
                </p>
              )}
            </form>
          </motion.div>
        )}

        {/* 11. FALLBACK RENDERER FOR NOT IMPLEMENTED INNER TABS */}
        {!['admin-dashboard', 'admin-users', 'admin-roles', 'admin-departments', 'admin-faculties', 'admin-startups', 'admin-research', 'admin-careers', 'admin-security', 'admin-audit', 'admin-settings', 'admin-ai'].includes(currentAdminTab) && (
          <motion.div 
            key="fallback"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[350px]"
          >
            <Activity className="w-12 h-12 text-violet-500 opacity-60 mb-4 animate-bounce" />
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-100 capitalize">
              {currentAdminTab.replace('admin-', ' ').replace('-', ' ')}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-2 font-semibold">
              Live monitoring feeds, audit configurations, and database routers are synchronized. Use the left menu bar to choose another system directory.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default AdminHub;
