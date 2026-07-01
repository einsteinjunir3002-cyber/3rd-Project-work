/* SMARTLEARN AI - CORE APPLICATION REACTIVE ENGINE */
/* SMARTLEARN AI - APPLICATION REACTIVE ENGINE (COMPACTED) */
/* ==========================================================================
   UI STATE ROUTER
   ========================================================================== */
function navigateTo(shellId) {
  D.get('landing-shell').classList.add('hidden'); D.get('portal-shell').classList.add('hidden'); D.get(shellId).classList.remove('hidden'); appState.currentView = shellId;
  if (shellId === 'portal-shell') { document.body.setAttribute('data-theme', appState.theme); updateSidebarDetails(); renderStateData(); }
  window.scrollTo(0,0); }
function switchTab(role, tabId) {
  const isStudentRole = ['student', 'prospective_student'].includes(appState.role) || appState.role === 'admin';
  const isResearcherRole = appState.role === 'researcher' || appState.role === 'admin';
  const isLecturerRole = ['lecturer', 'alumni', 'industry_partner', 'career_advisor'].includes(appState.role) || appState.role === 'admin';
  if (role === 'lecturer' && !isLecturerRole) return showToastNotification('Access Denied: Lecturer role required.');
  if (role === 'student' && !isStudentRole) return showToastNotification('Access Denied: Student role required.');
  if (role === 'researcher' && !isResearcherRole) return showToastNotification('Access Denied: Researcher role required.');
  if (role === 'admin' && appState.role !== 'admin') return showToastNotification('Access Denied: Admin role required.');
  document.querySelectorAll('.portal-view').forEach(el => el.classList.remove('active'));
  const target = D.get(tabId); if (target) target.classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  const btn = document.querySelector(`[data-tab="${tabId}"]`); if (btn) btn.classList.add('active');
  if (role === 'student') { appState.activeStudentTab = tabId; if (tabId === 'student-settings') prepopulateUserSettings('student'); }
  else if (role === 'researcher') { appState.activeResearcherTab = tabId; if (tabId === 'researcher-settings') prepopulateUserSettings('researcher'); }
  else if (role === 'lecturer') { appState.activeLecturerTab = tabId; if (tabId === 'lecturer-settings') prepopulateUserSettings('lecturer'); }
  else if (role === 'admin') { appState.activeAdminTab = tabId; if (typeof renderAdminViews === 'function') renderAdminViews(); }
  document.querySelector('aside.portal-sidebar')?.classList.remove('open');
  window.scrollTo(0, 0);
}
/* ==========================================================================
   SUPABASE INTEGRATION (SERVERLESS BACKEND)
   ========================================================================== */
const SUPABASE_URL = 'https://nysyxythdiufhutmpgwx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3l4eXRoZGl1Zmh1dG1wZ3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg1Njc2NDksImV4cCI6MjAzNDE0MzY0OX0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Placeholder, actual key managed via Supabase settings
let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ==========================================================================
   OFFLINE ENGINE
   ========================================================================== */
// isOfflineDemoMode is declared in data.js
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000'
  : window.location.origin;

// Hardcoded demo accounts — always available regardless of localStorage state
const DEMO_ACCOUNTS = [
  { id: 'user_std_1', name: 'Kofi Mensah', email: 'stu@smartlearn.com', password: 'password', role: 'student', department: 'Computing & Information Technology', program: 'BSc Computer Science', studentIdNumber: 'stu/csc/0001', phone: '+233 24 111 2222', gender: 'Male', level: '300', securityQuestion: 'What was the name of your first pet?', securityAnswer: 'Rex' },
  { id: 'user_lec_1', name: 'Dr. Kwame Mensah', email: 'Kwame@smartlearn.edu', password: 'password', role: 'lecturer', office: 'Block C, Rm 4', securityQuestion: "What is your mother's maiden name?", securityAnswer: 'Serwaa' },
  { id: 'user_lec_2', name: 'Prof. Ama Serwaa', email: 'Ama@smartlearn.edu', password: 'password', role: 'lecturer', office: 'RM 412', securityQuestion: "What is your mother's maiden name?", securityAnswer: 'Unknown' },
  { id: 'user_lec_3', name: 'Mr. Emmanuel Osei', email: 'Emmanuel@smartlearn.edu', password: 'password', role: 'lecturer', office: 'ICT Lab B', securityQuestion: "What is your mother's maiden name?", securityAnswer: 'Unknown' },
  { id: 'user_lec_4', name: 'Dr. Sophia Tetteh', email: 'Sophia@smartlearn.edu', password: 'password', role: 'lecturer', office: 'Block A, Rm 2', securityQuestion: "What is your mother's maiden name?", securityAnswer: 'Unknown' },
  { id: 'user_universal', name: 'Universal User', email: 'everybody@smartlearn.com', password: 'password', role: 'admin', securityQuestion: 'In what city or town were you born?', securityAnswer: 'Accra' }
];
const getSimulatedUsers = () => {
  try {
    const stored = localStorage.getItem('smartlearn_simulated_users');
    const parsed = stored ? JSON.parse(stored) : [];
    // Always merge: keep extra registered users, but guarantee demo accounts exist
    const merged = [...DEMO_ACCOUNTS];
    parsed.forEach(u => { if (!merged.find(d => d.email === u.email)) merged.push(u); });
    return merged;
  } catch(e) { return [...DEMO_ACCOUNTS]; }
}, saveSimulatedUsers = users => localStorage.setItem('smartlearn_simulated_users', JSON.stringify(users)),
loadOfflineState = () => {
  const s = localStorage.getItem('smartlearn_offline_appstate_v4');
  if (s) {
    try {
      const parsed = JSON.parse(s);
      if (parsed.courses) {
        SMARTLEARN_STATIC_DATA.courses.forEach(c => {
          const existing = parsed.courses.find(pc => pc.id === c.id);
          if (!existing) {
            parsed.courses.push(c);
          } else {
            existing.program = c.program;
            if (c.notesCount !== undefined) existing.notesCount = c.notesCount;
            if (c.assignmentsCount !== undefined) existing.assignmentsCount = c.assignmentsCount;
          }
        });
      }
      if (parsed.notes) {
        SMARTLEARN_STATIC_DATA.notes.forEach(n => {
          const existing = parsed.notes.find(pn => pn.id === n.id || pn.title === n.title);
          if (!existing) {
            parsed.notes.push(n);
          } else {
            existing.courseId = n.courseId;
            existing.title = n.title;
            existing.size = n.size;
            existing.date = n.date;
          }
        });
      }
      if (parsed.assignments) {
        SMARTLEARN_STATIC_DATA.assignments.forEach(a => {
          if (!parsed.assignments.some(pa => pa.id === a.id)) {
            parsed.assignments.push(a);
          }
        });
      }
      if (parsed.submissions) {
        SMARTLEARN_STATIC_DATA.submissions.forEach(sub => {
          if (!parsed.submissions.some(ps => ps.id === sub.id)) {
            parsed.submissions.push(sub);
          }
        });
      }
      Object.assign(appState, parsed);
    } catch(e) {}
  }
}, saveOfflineState = () => {
  localStorage.setItem('smartlearn_offline_appstate_v4', JSON.stringify({
    courses: appState.courses, notes: appState.notes, assignments: appState.assignments, submissions: appState.submissions, forumThreads: appState.forumThreads, universities: appState.universities, students: appState.students,
    facultyContacts: appState.facultyContacts, facultyChats: appState.facultyChats, activeFacultyEmail: appState.activeFacultyEmail, studentStartups: appState.studentStartups,
    aiPromptCount: appState.aiPromptCount, aiPromptHistory: appState.aiPromptHistory, demoAlumniProfiles: appState.demoAlumniProfiles, demoResearchProjects: appState.demoResearchProjects
  }));
}, enableOfflineDemoIndicator = enable => { isOfflineDemoMode = enable; D.show('offline-demo-indicator', enable); }; if (!localStorage.getItem('smartlearn_offline_appstate_v4')) saveOfflineState(); else loadOfflineState();

function toggleStudentFieldsRequired(isRequired) {
  const fields = [
    'signup-phone', 'signup-username', 'signup-institution', 'signup-gender',
    'signup-dept', 'signup-program', 'signup-level', 'signup-confirm-password',
    'signup-security-question', 'signup-security-answer'
  ];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (isRequired) {
        el.setAttribute('required', 'required');
      } else {
        el.removeAttribute('required');
      }
    }
  });
}

function checkPasswordStrength(pwd) {
  if (pwd.length < 6) {
    return { label: 'Weak (Must be >= 6 chars) ❌', color: '#ef4444' };
  }
  const hasLetters = /[a-zA-Z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  
  if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
    return { label: 'Strong 💪', color: '#10b981' };
  } else if (hasLetters && hasNumbers) {
    return { label: 'Medium ⚠️', color: '#f59e0b' };
  } else {
    return { label: 'Weak (Mix letters & numbers) ❌', color: '#ef4444' };
  }
}

const openAuthModal = () => { D.show('auth-modal', true); D.show('auth-alert', false); switchAuthTab('signin'); }, closeAuthModal = () => D.show('auth-modal', false),
switchAuthTab = tab => {
  activeAuthTab = tab; D.show('auth-alert', false); const isSignIn = tab === 'signin'; D.get('auth-modal-title').textContent = isSignIn ? 'Sign In to SmartLearn' : 'Create Academic Account'; D.get('tab-signin-btn').style.background = isSignIn ? 'var(--primary)' : 'transparent'; D.get('tab-signin-btn').style.color = isSignIn ? 'white' : 'var(--text-muted)'; D.get('tab-signup-btn').style.background = isSignIn ? 'transparent' : 'var(--primary)'; D.get('tab-signup-btn').style.color = isSignIn ? 'var(--text-muted)' : 'white'; D.show('auth-signin-form', isSignIn); D.show('auth-signup-form', !isSignIn);
  if (!isSignIn) {
    const r = D.val('signup-role-select') || 'student';
    setSignupRole(r);
  }
},
setSignupRole = role => {
  activeSignupRole = role;
  D.show('signup-student-fields', role === 'student');
  D.show('signup-prospective-student-fields', role === 'prospective_student');
  D.show('signup-lecturer-fields', role === 'lecturer');
  D.show('signup-researcher-fields', role === 'researcher');
  D.show('signup-alumni-fields', role === 'alumni');
  D.show('signup-industry-partner-fields', role === 'industry_partner');
  D.show('signup-career-advisor-fields', role === 'career_advisor');
  toggleStudentFieldsRequired(role === 'student');
}, showAuthAlert = (msg, isSuccess = false) => {
  const el = D.get('auth-alert'); if (!el) return; el.style.display = 'block'; el.style.background = isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'; el.style.border = isSuccess ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)'; el.style.color = isSuccess ? '#10b981' : '#ef4444'; el.innerHTML = msg;
}; // activeAuthTab and activeSignupRole are declared in data.js
async function handlePrototypeSignIn() {
  const emailOrUsername = D.val('signin-email'), password = D.val('signin-password');
  if (!emailOrUsername || !password) return showAuthAlert('Please fill in credentials.');
  
  // Find user by email or username in the simulated users list first
  const resolvedUser = getSimulatedUsers().find(u => 
    u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
    (u.username && u.username.toLowerCase() === emailOrUsername.toLowerCase())
  );
  
  const email = resolvedUser ? resolvedUser.email : emailOrUsername;
  
  // Lockout check
  const isLocked = localStorage.getItem(`smartlearn_locked_${email}`) === 'true';
  if (isLocked) {
    showAuthAlert('Account is locked due to 3 failed attempts.<br><button type="button" class="btn btn-secondary btn-sm" style="margin-top: 8px; font-size: 0.75rem; padding: 4px 8px;" onclick="openRecoveryModal()">Recover Account 🔑</button>');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/signin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailOrUsername, password }) });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.removeItem(`smartlearn_failed_attempts_${email}`);
      localStorage.setItem('proto_token', data.token); appState.user = data.user;
      enableOfflineDemoIndicator(false); showAuthAlert('Redirecting...', true);
      setTimeout(() => { closeAuthModal(); setUserRole(data.user.role); }, 1000);
      return;
    }
  } catch (err) {}

  if (resolvedUser && resolvedUser.password === password) {
    localStorage.removeItem(`smartlearn_failed_attempts_${email}`);
    localStorage.setItem('proto_token', `simulated_token_${resolvedUser.role}_${resolvedUser.email}`);
    appState.user = resolvedUser; enableOfflineDemoIndicator(true); showAuthAlert('Success (Offline Demo)!', true);
    setTimeout(() => { closeAuthModal(); setUserRole(resolvedUser.role); }, 1000);
  } else {
    let attempts = parseInt(localStorage.getItem(`smartlearn_failed_attempts_${email}`) || '0');
    attempts++;
    localStorage.setItem(`smartlearn_failed_attempts_${email}`, attempts);
    
    if (attempts >= 3) {
      localStorage.setItem(`smartlearn_locked_${email}`, 'true');
      showAuthAlert('Account locked due to 3 failed attempts.<br><button type="button" class="btn btn-secondary btn-sm" style="margin-top: 8px; font-size: 0.75rem; padding: 4px 8px;" onclick="openRecoveryModal()">Recover Account 🔑</button>');
    } else {
      showAuthAlert(`Invalid credentials. Attempt ${attempts} of 3.`);
    }
  }
}
async function handlePrototypeSignUp() {
  const name = D.val('signup-name'), email = D.val('signup-email'), password = D.val('signup-password'); if (!name || !email || !password) return showAuthAlert('Fill all general fields.');
  
  const strength = checkPasswordStrength(password);
  if (strength.label.includes('Weak')) {
    return showAuthAlert('Please choose a stronger password (at least 6 characters, mixed letters and numbers).');
  }

  const payload = { name, email, password, role: activeSignupRole };
  if (activeSignupRole === 'student') {
    const confirmPassword = D.val('signup-confirm-password');
    if (password !== confirmPassword) {
      return showAuthAlert('Passwords do not match.');
    }

    const phone = D.val('signup-phone');
    const username = D.val('signup-username');
    const institution = D.val('signup-institution');
    const gender = D.val('signup-gender');
    const department = D.val('signup-dept');
    const program = D.val('signup-program');
    const level = D.val('signup-level');
    const securityQuestion = D.val('signup-security-question');
    const securityAnswer = D.val('signup-security-answer');

    if (!phone || !username || !institution || !gender || !department || !program || !level || !securityQuestion || !securityAnswer) {
      return showAuthAlert('Please fill in all student account fields.');
    }

    payload.phone = phone;
    payload.username = username;
    payload.institution = institution;
    payload.gender = gender;
    payload.department = department;
    payload.program = program;
    payload.level = level;
    payload.securityQuestion = securityQuestion;
    payload.securityAnswer = securityAnswer;

    // Automatic ID Generation: stu/[prog]/[seqNum]
    const progAbbrev = PROGRAM_ABBREVIATIONS[program] || 'gen';
    const users = getSimulatedUsers();
    const sameProgramCount = users.filter(u => u.role === 'student' && u.program === program).length;
    const seqNum = String(sameProgramCount + 1).padStart(4, '0');
    payload.studentIdNumber = `stu/${progAbbrev}/${seqNum}`;

    // Optional profile picture
    const fileInput = document.getElementById('signup-profile-pic');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (file.size > 5 * 1024 * 1024) return showAuthAlert("Profile picture is too large (Max 5MB).");
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      payload.avatar = base64;
    }
  } else if (activeSignupRole === 'prospective_student') {
    payload.intendedMajor = D.val('signup-intended-major') || 'Computer Science';
    payload.highSchool = D.val('signup-highschool') || 'Achimota School';
  } else if (activeSignupRole === 'lecturer') { 
    payload.title = D.val('signup-title'); 
    payload.office = D.val('signup-office') || 'Office Block C'; 
  } else if (activeSignupRole === 'researcher') {
    payload.researchArea = D.val('signup-research-area') || 'Artificial Intelligence';
    payload.institution = D.val('signup-research-institution') || 'Ghana Research Institute';
  } else if (activeSignupRole === 'alumni') {
    payload.graduationYear = D.val('signup-grad-year') || '2025';
    payload.companyName = D.val('signup-alumni-company') || 'TechCorp Ghana';
  } else if (activeSignupRole === 'industry_partner') {
    payload.companyName = D.val('signup-partner-company') || 'Global Innovations Inc';
    payload.industrySector = D.val('signup-partner-sector') || 'Technology';
  } else if (activeSignupRole === 'career_advisor') {
    payload.advisorExpertise = D.val('signup-advisor-expertise') || 'Academic & Career Planning';
  }
  const token = localStorage.getItem('proto_token');
  if (token && !token.startsWith('simulated_token_')) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await res.json(); if (!res.ok) return showAuthAlert(data.message || 'Signup failed.'); localStorage.setItem('proto_token', data.token); appState.user = data.user; enableOfflineDemoIndicator(false); showAuthAlert('Account created!', true);
      setTimeout(() => { closeAuthModal(); setUserRole(data.user.role); }, 1000);
    } catch(err) { showAuthAlert('Network error during registration.'); }
  } else {
    const users = getSimulatedUsers(); if (users.some(u => u.email === email)) return showAuthAlert('Email already registered.');
    const newUser = { id: `user_sim_${Date.now()}`, name, email, password, role: activeSignupRole, ...payload }; users.push(newUser); saveSimulatedUsers(users);
    localStorage.setItem('proto_token', `simulated_token_${newUser.role}_${newUser.email}`); appState.user = newUser; enableOfflineDemoIndicator(true); showAuthAlert('Account created (Offline)!', true);
    setTimeout(() => { closeAuthModal(); setUserRole(newUser.role); }, 1000); } }
function setUserRole(role) {
  appState.role = role; navigateTo('portal-shell'); const switcher = D.get('portal-role-switcher-container');
  if (switcher) {
    switcher.innerHTML = role === 'admin' ? `
      <select style="padding:6px 12px; font-size:0.75rem; font-weight:700; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); color:var(--primary); cursor:pointer;" onchange="setAdminPrototypeView(this.value)">
        <option value="admin">🛠️ View: Admin Hub</option>
        <option value="student">🎓 View: Student Portal</option>
        <option value="lecturer">💼 View: Lecturer Desk</option>
        <option value="researcher">🔬 View: Research Desk</option>
        <option value="alumni">🎓 View: Alumni Console</option>
        <option value="industry_partner">🤝 View: Partner Hub</option>
        <option value="career_advisor">🧭 View: Advisor Dashboard</option>
        <option value="prospective_student">🏫 View: Admissions Desk</option>
      </select>` : ''; }
  if (role === 'admin') setAdminPrototypeView('admin');
  else {
    const isStudentWorkspace = ['student', 'prospective_student'].includes(role);
    const isResearcherWorkspace = role === 'researcher';
    const isLecturerWorkspace = ['lecturer', 'alumni', 'industry_partner', 'career_advisor'].includes(role);
    document.querySelectorAll('.student-only').forEach(el => el.style.display = (isStudentWorkspace ? 'flex' : 'none')); 
    document.querySelectorAll('.researcher-only').forEach(el => el.style.display = (isResearcherWorkspace ? 'flex' : 'none'));
    document.querySelectorAll('.lecturer-only').forEach(el => el.style.display = (isLecturerWorkspace ? 'flex' : 'none')); 
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none'); 
    
    customizeSidebarMenuItems(role);
    
    // Determine correct landing tab per role
    let landingTab = 'lecturer-dashboard';
    let landingRole = 'lecturer';
    if (isStudentWorkspace) { landingTab = 'student-dashboard'; landingRole = 'student'; }
    else if (isResearcherWorkspace) { landingTab = 'research-hub-expanded'; landingRole = 'researcher'; }
    else if (role === 'alumni') { landingTab = 'alumni-console'; }
    else if (role === 'industry_partner') { landingTab = 'partner-hub'; }
    else if (role === 'career_advisor') { landingTab = 'advisor-dashboard'; }

    // Use switchTabExtended for hub sections, switchTab for standard sections
    if (['alumni', 'industry_partner', 'career_advisor', 'researcher'].includes(role) && typeof switchTabExtended === 'function') {
      setTimeout(() => switchTabExtended(role, landingTab), 300);
    } else {
      switchTab(landingRole, landingTab);
    }
  }
  updateAiSettingsVisibility();
}
const setAdminPrototypeView = view => {
  const studentRoles = ['student', 'prospective_student'];
  const researcherRoles = ['researcher'];
  const lecturerRoles = ['lecturer', 'alumni', 'industry_partner', 'career_advisor'];
  const isAdmin = view === 'admin';
  const isStd = studentRoles.includes(view);
  const isRes = researcherRoles.includes(view);
  const isLec = lecturerRoles.includes(view);

  // Clear active portal views
  document.querySelectorAll('.portal-view').forEach(el => el.classList.remove('active'));

  // Update appState role temporarily so sidebar/custom layouts render correctly
  appState.role = view;

  // Custom sidebar items switching
  customizeSidebarMenuItems(view);

  // Sync the top navbar view switcher select element if it exists
  const switcherSelect = document.querySelector('#portal-role-switcher-container select');
  if (switcherSelect) {
    switcherSelect.value = view;
  }

  // Trigger nav visibility update
  if (typeof updateNavVisibility === 'function') {
    updateNavVisibility();
  }

  // Determine the target tab to switch to
  let targetTab = 'admin-dashboard';
  if (view === 'admin') targetTab = 'admin-dashboard';
  else if (view === 'student') targetTab = 'student-dashboard';
  else if (view === 'lecturer') targetTab = 'lecturer-dashboard';
  else if (view === 'researcher') targetTab = 'research-hub-expanded';
  else if (view === 'alumni') targetTab = 'alumni-console';
  else if (view === 'industry_partner') targetTab = 'partner-hub';
  else if (view === 'career_advisor') targetTab = 'advisor-dashboard';
  else if (view === 'prospective_student') targetTab = 'student-dashboard';

  const roleGroup = studentRoles.includes(view) ? 'student' : (researcherRoles.includes(view) ? 'researcher' : (lecturerRoles.includes(view) ? 'lecturer' : 'admin'));
  if (typeof switchTabExtended === 'function') {
    // For special hub roles, pass the actual view so switchTabExtended can route correctly
    const effectiveRole = ['alumni', 'industry_partner', 'career_advisor', 'researcher'].includes(view) ? view : roleGroup;
    switchTabExtended(effectiveRole, targetTab);
  } else {
    switchTab(roleGroup, targetTab);
  }

  // Re-render the correct dashboard content for the selected view
  setTimeout(() => {
    if (view === 'prospective_student') {
      if (typeof renderProspectiveStudentDashboard === 'function') renderProspectiveStudentDashboard();
    } else if (view === 'student') {
      // Restore normal student dashboard if it was overwritten
      const container = document.getElementById('student-dashboard');
      if (container && container.dataset.originalHtml) {
        container.innerHTML = container.dataset.originalHtml;
      }
      if (typeof updateStudentDashboardMetrics === 'function') updateStudentDashboardMetrics();
      if (typeof renderStudentCourses === 'function') renderStudentCourses();
    } else if (view === 'lecturer') {
      if (typeof renderLecturerAnalytics === 'function') renderLecturerAnalytics();
      if (typeof renderLecturerSubmissions === 'function') renderLecturerSubmissions();
    } else if (view === 'admin') {
      if (typeof renderAdminViews === 'function') renderAdminViews();
    }
  }, 150);
},
handlePrototypeLogout = () => { localStorage.removeItem('proto_token'); appState.user = null; enableOfflineDemoIndicator(false); navigateTo('landing-shell'); };
async function validatePrototypeSession() {
  if (!localStorage.getItem('smartlearn_ai_provider')) {
    localStorage.setItem('smartlearn_ai_provider', 'groq');
  }
  if (!localStorage.getItem('smartlearn_ai_key')) {
    localStorage.setItem('smartlearn_ai_key', SYSTEM_PERMANENT_CONFIG.apiKey);
  }
  if (!localStorage.getItem('smartlearn_ai_model')) {
    localStorage.setItem('smartlearn_ai_model', 'llama-3.1-8b-instant');
  }
  const token = localStorage.getItem('proto_token'); if (!token) return;
  if (token.startsWith('simulated_token_')) {
    const email = token.split('_')[3], user = getSimulatedUsers().find(u => u.email === email);
    if (user) { appState.user = user; setUserRole(user.role); enableOfflineDemoIndicator(true); }
    return; }
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { const data = await res.json(); appState.user = data.user; setUserRole(data.user.role); }
    else localStorage.removeItem('proto_token');
  } catch (err) {} }
window.addEventListener('DOMContentLoaded', validatePrototypeSession);
function updateSidebarDetails() {
  const avatarEl = D.get('sidebar-user-avatar'), nameEl = D.get('sidebar-user-name'), roleEl = D.get('sidebar-user-role'); if (!appState.user) return;
  nameEl.textContent = appState.user.username ? `@${appState.user.username}` : appState.user.name;
  
  const welcomeNameEl = D.get('dashboard-welcome-name');
  if (welcomeNameEl) welcomeNameEl.textContent = appState.user.name;
  const lecWelcomeNameEl = D.get('lecturer-welcome-name');
  if (lecWelcomeNameEl) lecWelcomeNameEl.textContent = appState.user.name;
  const adminWelcomeNameEl = D.get('admin-welcome-name');
  if (adminWelcomeNameEl) adminWelcomeNameEl.textContent = appState.user.name;

  const firstName = appState.user.name ? appState.user.name.split(' ')[0] : 'User';
  for (const email in appState.facultyChats) {
    appState.facultyChats[email].forEach(msg => {
      if (msg.sender === 'faculty') {
        msg.text = msg.text.replace(/Hello Kofi!/g, `Hello ${firstName}!`)
                           .replace(/Hi Kofi,/g, `Hi ${firstName},`)
                           .replace(/Hey Kofi,/g, `Hey ${firstName},`);
      }
    });
  }

  // Set avatar and role label dynamically based on all 8 roles
  const role = appState.role;
  if (role === 'admin') {
    avatarEl.src = appState.user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${appState.user.name}`;
    roleEl.textContent = 'Administrator';
  } else if (role === 'student') {
    avatarEl.src = appState.user.avatar || 'picture/avatar_student.jpg';
    roleEl.textContent = `${appState.user.department || 'Computer Science'} Student`;
  } else if (role === 'prospective_student') {
    avatarEl.src = appState.user.avatar || 'picture/avatar_student.jpg';
    roleEl.textContent = 'Prospective Student';
  } else if (role === 'researcher') {
    avatarEl.src = appState.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${appState.user.name}`;
    roleEl.textContent = `${appState.user.researchArea || 'AI'} Researcher`;
  } else if (role === 'alumni') {
    avatarEl.src = appState.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appState.user.name}`;
    roleEl.textContent = `Alumni Class of ${appState.user.graduationYear || '2025'}`;
  } else if (role === 'industry_partner') {
    avatarEl.src = appState.user.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${appState.user.name}`;
    roleEl.textContent = `Partner • ${appState.user.companyName || 'Global Innovations'}`;
  } else if (role === 'career_advisor') {
    avatarEl.src = appState.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${appState.user.name}`;
    roleEl.textContent = `Career Advisor`;
  } else {
    avatarEl.src = appState.user.avatar || 'picture/avatar_lecturer.jpg';
    roleEl.textContent = `Faculty Member • ${appState.user.office || 'Block C'}`;
  }
}

function customizeSidebarMenuItems(role) {
  const isStudentWorkspace = ['student', 'prospective_student'].includes(role);
  const isResearcherWorkspace = role === 'researcher';
  const isLecturerWorkspace = ['lecturer', 'alumni', 'industry_partner', 'career_advisor'].includes(role);
  const isAdminWorkspace = role === 'admin';

  document.querySelectorAll('.student-only').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.researcher-only').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.lecturer-only').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');

  if (isStudentWorkspace) {
    document.querySelectorAll('.student-only').forEach(el => {
      const tab = el.getAttribute('data-tab');
      let visible = true;
      if (role === 'prospective_student') {
        visible = ['student-dashboard', 'student-universities', 'student-ai-assistant', 'student-settings'].includes(tab);
        if (tab === 'student-dashboard') el.textContent = '🏫 Admissions Desk';
        if (tab === 'student-universities') el.textContent = '🏛️ University Explorer';
        if (tab === 'student-ai-assistant') el.textContent = '🤖 Admission Advisor';
      } else {
        if (tab === 'student-dashboard') el.textContent = '📊 Dashboard Overview';
      }
      el.style.display = visible ? 'block' : 'none';
    });
  } else if (isResearcherWorkspace) {
    document.querySelectorAll('.researcher-only').forEach(el => el.style.display = 'block');
  } else if (isLecturerWorkspace) {
    document.querySelectorAll('.lecturer-only').forEach(el => {
      const tab = el.getAttribute('data-tab');
      let visible = true;
      if (role === 'alumni') {
        visible = ['lecturer-dashboard', 'lecturer-settings'].includes(tab);
        if (tab === 'lecturer-dashboard') {
          el.textContent = '🎓 Alumni Console';
          el.setAttribute('onclick', "switchTabExtended('alumni', 'alumni-console')");
        }
      } else if (role === 'industry_partner') {
        visible = ['lecturer-dashboard', 'lecturer-settings'].includes(tab);
        if (tab === 'lecturer-dashboard') {
          el.textContent = '🏢 Partner Hub';
          el.setAttribute('onclick', "switchTabExtended('industry_partner', 'partner-hub')");
        }
      } else if (role === 'career_advisor') {
        visible = ['lecturer-dashboard', 'lecturer-settings'].includes(tab);
        if (tab === 'lecturer-dashboard') {
          el.textContent = '👔 Advisor Dashboard';
          el.setAttribute('onclick', "switchTabExtended('career_advisor', 'advisor-dashboard')");
        }
      } else {
        if (tab === 'lecturer-dashboard') {
          el.textContent = '📊 Lecturer Dashboard';
          el.setAttribute('onclick', "switchTab('lecturer', 'lecturer-dashboard')");
        }
      }
      el.style.display = visible ? 'block' : 'none';
    });
  } else if (isAdminWorkspace) {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  }
}
async function fetchStateData() {
  const token = localStorage.getItem('proto_token'); if (!token) return;
  if (token.startsWith('simulated_token_')) { loadOfflineState(); enableOfflineDemoIndicator(true); return; }
  try {
    const headers = { 'Authorization': `Bearer ${token}` }, getJSON = async url => { const r = await fetch(url, { headers }); return r.ok ? r.json() : null; };
    
    const apiCourses = await getJSON(`${API_BASE}/api/courses`);
    if (apiCourses) {
      SMARTLEARN_STATIC_DATA.courses.forEach(c => {
        const existing = apiCourses.find(pc => pc.id === c.id);
        if (!existing) {
          apiCourses.push(c);
        } else {
          existing.program = c.program;
          if (c.notesCount !== undefined) existing.notesCount = c.notesCount;
          if (c.assignmentsCount !== undefined) existing.assignmentsCount = c.assignmentsCount;
        }
      });
      appState.courses = apiCourses;
    }
    
    const apiNotes = await getJSON(`${API_BASE}/api/courses/notes`);
    if (apiNotes) {
      SMARTLEARN_STATIC_DATA.notes.forEach(n => {
        const existing = apiNotes.find(pn => pn.id === n.id || pn.title === n.title);
        if (!existing) {
          apiNotes.push(n);
        } else {
          existing.courseId = n.courseId;
          existing.title = n.title;
          existing.size = n.size;
          existing.date = n.date;
        }
      });
      appState.notes = apiNotes;
    }
    
    const apiAssignments = await getJSON(`${API_BASE}/api/assignments`);
    if (apiAssignments) {
      SMARTLEARN_STATIC_DATA.assignments.forEach(a => {
        if (!apiAssignments.some(pa => pa.id === a.id)) {
          apiAssignments.push(a);
        }
      });
      appState.assignments = apiAssignments;
    }
    
    appState.forumThreads = await getJSON(`${API_BASE}/api/forums`) || appState.forumThreads;
    if (appState.role === 'lecturer' || appState.role === 'admin') appState.submissions = await getJSON(`${API_BASE}/api/assignments/submissions`) || appState.submissions;
    appState.universities = await getJSON(`${API_BASE}/api/universities`) || appState.universities; enableOfflineDemoIndicator(false);
  } catch (err) { loadOfflineState(); enableOfflineDemoIndicator(true); } }
const renderProspectiveStudentDashboard = () => {
  const container = D.get('student-dashboard');
  if (!container) return;

  const isProspectiveView = appState.role === 'prospective_student';
  if (!isProspectiveView) {
    if (['student', 'admin'].includes(appState.role) && container.dataset.originalHtml) {
      container.innerHTML = container.dataset.originalHtml;
    }
    return;
  }

  if (!container.dataset.originalHtml) container.dataset.originalHtml = container.innerHTML;

  // ── 1. PERSONALISATION ──────────────────────────────────────────────────────
  const userName = appState.user?.name || 'Applicant';
  const userProgram = appState.user?.intendedProgram || '';
  const userAggregate = appState.user?.wassceAggregate || null;

  // ── 2. DOCUMENTS — pulled from / initialised into appState ─────────────────
  if (!appState.admissionDocs) {
    appState.admissionDocs = [
      { id: 'doc_wassce',  label: 'WASSCE Result Certificate',               status: 'pending', required: true  },
      { id: 'doc_birth',  label: 'Birth Certificate / Passport (Bio-data)',  status: 'pending', required: true  },
      { id: 'doc_photo',  label: 'Passport-Size Photograph (White BG)',      status: 'pending', required: true  },
      { id: 'doc_fee',    label: 'Application Fee Receipt (GH₵ 250)',        status: 'pending', required: true  },
      { id: 'doc_letter', label: 'Personal Statement / Motivation Letter',   status: 'pending', required: false },
    ];
  }
  const appDocs = appState.admissionDocs;
  const uploadedCount    = appDocs.filter(d => d.status === 'uploaded').length;
  const totalRequired    = appDocs.filter(d => d.required).length;
  const uploadedRequired = appDocs.filter(d => d.required && d.status === 'uploaded').length;
  const progressPct      = totalRequired ? Math.round((uploadedRequired / totalRequired) * 100) : 0;
  const appStatus        = uploadedRequired === totalRequired ? 'Ready to Submit' : uploadedRequired > 0 ? 'In Progress' : 'Draft';
  const statusColor      = uploadedRequired === totalRequired ? 'var(--success)' : uploadedRequired > 0 ? '#f59e0b' : 'var(--primary)';

  // ── 3. INTAKE DATE — computed dynamically from today ───────────────────────
  const now = new Date();
  const thisYear = now.getFullYear();
  const nextSept = new Date(thisYear, 8, 1); // Sept 1
  if (nextSept < now) nextSept.setFullYear(thisYear + 1);
  const daysToIntake = Math.ceil((nextSept - now) / 86400000);
  const intakeLabel  = nextSept.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // ── 4. KEY DATES — relative to the next intake ────────────────────────────
  const intakeYear = nextSept.getFullYear();
  const keyDates = [
    { date: new Date(intakeYear, 6, 1),  label: 'Application Portal Opens',   desc: 'Online applications open for all public universities', hot: true  },
    { date: new Date(intakeYear, 7, 15), label: 'Early Bird Deadline',         desc: 'Submit before this date to waive GH₵ 100 processing fee', hot: true  },
    { date: new Date(intakeYear, 8, 2),  label: 'Virtual Open Day / Campus Tour', desc: 'Live webinar — register at your chosen university website', hot: false },
    { date: new Date(intakeYear, 8, 30), label: 'Final Application Deadline',  desc: 'Last date to submit all required documents', hot: false },
    { date: new Date(intakeYear, 10, 15), label: 'Admission Results Released', desc: 'Check your application portal for offer letters', hot: false },
    { date: new Date(intakeYear + 1, 0, 12), label: 'Matriculation / Orientation', desc: `Official start of ${intakeYear}/${intakeYear + 1} academic year`, hot: false },
  ];
  const nextEvent = keyDates.find(e => e.date > now);
  const daysToDeadline = nextEvent ? Math.ceil((nextEvent.date - now) / 86400000) : 0;

  // ── 5. PROGRAMMES — from programCardsData with WASSCE data ────────────────
  const programWassce = {
    'BSc Computer Science':       { cutoff: 12, subjects: 'Elective Maths + Core Science' },
    'BSc Software Engineering':   { cutoff: 14, subjects: 'Elective Maths + Physics' },
    'BSc Cybersecurity':          { cutoff: 14, subjects: 'Elective Maths + Core Science' },
    'BSc Data Science':           { cutoff: 14, subjects: 'Elective Maths + Statistics' },
    'BSc Business Administration':{ cutoff: 18, subjects: 'Business + Math / Economics' },
    'BSc Electrical Engineering': { cutoff: 12, subjects: 'Elective Maths + Physics' },
    'Bachelor of Laws (LLB)':     { cutoff: 14, subjects: 'English + Government / History' },
    'BSc Nursing & Allied Health':{ cutoff: 18, subjects: 'Biology + Chemistry + Core Maths' },
    'BSc Mechanical Engineering': { cutoff: 14, subjects: 'Elective Maths + Physics' },
    'Medicine & Surgery (MBChB)': { cutoff: 8,  subjects: 'Biology + Chemistry + Physics' },
    'Doctor of Pharmacy (PharmD)':{ cutoff: 10, subjects: 'Biology + Chemistry + Elective Maths' },
    'BSc Architecture & Design':  { cutoff: 16, subjects: 'Elective Maths + Physics / Art' },
    'BA Economics & Public Policy':{ cutoff: 16, subjects: 'Economics + Maths' },
  };
  const progColors = ['#6366f1','#ef4444','#10b981','#f59e0b','#8b5cf6','#0ea5e9','#e11d48','#14b8a6','#f97316','#84cc16','#06b6d4','#a855f7','#ec4899'];
  const programmes = (typeof programCardsData !== 'undefined' ? programCardsData : []).map((p, i) => ({
    name: p.title,
    uni: (appState.universities || []).filter(u => u.programsOffered && u.programsOffered.some(po => po.toLowerCase().includes(p.title.split(' ').slice(-1)[0].toLowerCase()))).slice(0,3).map(u => u.name.split(' ').slice(0,2).join(' ')).join(' / ') || 'Multiple Universities',
    cutoff: programWassce[p.title]?.cutoff || 18,
    subjects: programWassce[p.title]?.subjects || 'English + Core Maths + 3 Electives',
    demand: p.demand.split(' ')[0] + ' ' + (p.demand.includes('High') ? p.demand.split('(')[0].trim() : ''),
    salary: p.salary,
    duration: p.duration,
    color: progColors[i % progColors.length],
    eligible: userAggregate ? userAggregate <= (programWassce[p.title]?.cutoff || 18) : null,
  }));

  // Search/filter by WASSCE aggregate eligibility or name
  const filterAgg = appState.admissionFilter || '';
  const filteredProgs = filterAgg
    ? programmes.filter(p => p.eligible === true || p.name.toLowerCase().includes(filterAgg.toLowerCase()))
    : programmes.slice(0, 8);

  // ── 6. SCHOLARSHIPS — from appState.universities scholarship info ──────────
  const scholarships = [
    { name: 'MasterCard Foundation Scholars',     body: 'MasterCard Foundation',  deadline: new Date(intakeYear, 10, 1),  type: 'Full Scholarship',  color: '#ef4444', link: 'https://mastercardfdn.org/all-programs/scholars-program/' },
    { name: 'Ghana Scholarship Secretariat (GSS)',body: 'Govt. of Ghana',          deadline: new Date(intakeYear, 7, 1),   type: 'Govt. Bursary',     color: '#10b981', link: 'https://scholarships.gov.gh' },
    { name: 'GETFund Scholarship',                body: 'GETFund / ESLA',          deadline: new Date(intakeYear, 8, 1),   type: 'Partial Bursary',   color: '#f59e0b', link: 'https://getfund.gov.gh' },
    { name: 'Ashesi University Financial Aid',    body: 'Ashesi University',        deadline: new Date(intakeYear + 1, 2, 1),type: 'Needs-Based Aid',  color: '#6366f1', link: 'https://www.ashesi.edu.gh/admissions/fees-scholarships' },
    { name: 'KNUST Vice-Chancellor Merit Award',  body: 'KNUST',                   deadline: new Date(intakeYear, 9, 1),   type: 'Merit Award',       color: '#8b5cf6', link: 'https://knust.edu.gh/admissions' },
    { name: 'Fulbright Foreign Student Program',  body: 'U.S. Embassy Ghana',      deadline: new Date(intakeYear, 9, 15),  type: 'International',     color: '#0ea5e9', link: 'https://gh.usembassy.gov/education-culture/educational-exchanges/fulbright-program/' },
  ].map(s => {
    const daysLeft = Math.ceil((s.deadline - now) / 86400000);
    return { ...s, daysLeft, deadlineStr: s.deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), expired: daysLeft < 0 };
  }).filter(s => !s.expired).sort((a, b) => a.daysLeft - b.daysLeft);

  // ── 7. LIVE APPLICANT COUNT — from simulated user registry ────────────────
  const registeredApplicants = typeof getSimulatedUsers === 'function'
    ? getSimulatedUsers().filter(u => u.role === 'prospective_student' || u.role === 'student').length
    : (appState.students?.length || 0);

  // ── 8. UNIVERSITY COUNT ───────────────────────────────────────────────────
  const totalUnis = (appState.universities || []).length;
  const publicUnis = (appState.universities || []).filter(u => u.type === 'Public').length;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <!-- Header -->
    <div style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="margin-bottom:4px;">🏛️ Welcome, <span class="gradient-text">${userName}</span>!</h2>
        <p style="color:var(--text-muted); font-size:0.88rem;">SmartLearn Admissions Desk · ${totalUnis} universities · ${intakeYear} intake</p>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        ${userAggregate ? `<span class="badge badge-primary" style="font-size:0.8rem; padding:6px 12px;">📊 Your Aggregate: ${userAggregate}</span>` : `<button class="btn btn-secondary btn-sm" onclick="admSetAggregate()" style="font-size:0.75rem;">📊 Enter WASSCE Aggregate</button>`}
        <button class="btn btn-primary btn-sm" onclick="switchTab('student','student-ai-assistant'); setAiMode('admission');" style="font-size:0.75rem;">🤖 Ask AI Advisor</button>
      </div>
    </div>

    <!-- Application Progress Banner -->
    <div class="glass" style="padding:18px 22px; margin-bottom:20px; border-left:4px solid ${statusColor}; border-radius:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px;">Your Application Status</div>
        <div style="font-size:1.6rem; font-weight:900; color:${statusColor};">${appStatus}</div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${uploadedRequired} of ${totalRequired} required documents submitted</div>
        ${nextEvent ? `<div style="font-size:0.75rem; color:#f59e0b; margin-top:6px; font-weight:600;">⏰ ${nextEvent.label} in <strong>${daysToDeadline} days</strong></div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:3rem; font-weight:900; color:${statusColor}; line-height:1;">${progressPct}<span style="font-size:1rem; font-weight:500;">%</span></div>
        <div style="width:150px; height:10px; background:rgba(255,255,255,0.08); border-radius:99px; overflow:hidden; margin-top:8px;">
          <div style="height:100%; width:${progressPct}%; background:${statusColor}; border-radius:99px; transition:width 1s ease;"></div>
        </div>
        <div style="font-size:0.68rem; color:var(--text-muted); margin-top:4px;">Completion progress</div>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="metrics-row" style="margin-bottom:24px;">
      <div class="metric-card glass">
        <div class="metric-icon-box" style="background:rgba(99,102,241,0.12); color:#6366f1;">🏛️</div>
        <div class="metric-info"><p>Next Intake</p><h3>${intakeLabel}</h3><small style="color:var(--text-muted); font-size:0.7rem;">${daysToIntake} days away</small></div>
      </div>
      <div class="metric-card glass">
        <div class="metric-icon-box" style="background:rgba(245,158,11,0.12); color:#f59e0b;">📅</div>
        <div class="metric-info"><p>Next Key Deadline</p><h3>${nextEvent ? nextEvent.date.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : 'TBD'}</h3><small style="color:var(--text-muted); font-size:0.7rem;">${daysToDeadline} days left</small></div>
      </div>
      <div class="metric-card glass">
        <div class="metric-icon-box" style="background:rgba(16,185,129,0.12); color:var(--success);">📄</div>
        <div class="metric-info"><p>Documents Submitted</p><h3>${uploadedCount} / ${appDocs.length}</h3><small style="color:var(--text-muted); font-size:0.7rem;">${appDocs.filter(d=>d.required && d.status!=='uploaded').length} required pending</small></div>
      </div>
      <div class="metric-card glass">
        <div class="metric-icon-box" style="background:rgba(239,68,68,0.12); color:#ef4444;">🏆</div>
        <div class="metric-info"><p>Scholarships Open</p><h3>${scholarships.length} Active</h3><small style="color:var(--text-muted); font-size:0.7rem;">Closes in ${scholarships[0]?.daysLeft || 0} days</small></div>
      </div>
      <div class="metric-card glass">
        <div class="metric-icon-box" style="background:rgba(139,92,246,0.12); color:#8b5cf6;">🎓</div>
        <div class="metric-info"><p>Programmes Available</p><h3>${programmes.length}</h3><small style="color:var(--text-muted); font-size:0.7rem;">Across ${publicUnis} public unis</small></div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">

      <!-- Required Documents Checklist -->
      <div class="widget glass">
        <div class="widget-header" style="margin-bottom:14px;">
          <h3 class="widget-title">📋 Required Documents</h3>
          <span style="font-size:0.72rem; color:${progressPct===100?'var(--success)':'#f59e0b'}; font-weight:700;">${progressPct}% complete</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${appDocs.map(doc => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:rgba(0,0,0,0.12); border-radius:10px; border:1px solid ${doc.status==='uploaded'?'rgba(16,185,129,0.35)':'rgba(255,255,255,0.06)'}; transition:all 0.2s;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:0.82rem; font-weight:600;">${doc.status==='uploaded'?'✅':'📌'} ${doc.label}</div>
                <div style="font-size:0.68rem; color:var(--text-muted);">${doc.required?'Required':'Optional'}${
                  doc.status==='uploaded' && doc.fileName
                    ? ` · <span style='color:var(--success);'>Uploaded</span> · <a href='${doc.objectUrl||'#'}' target='_blank' style='color:var(--primary);text-decoration:underline;font-size:0.65rem;'>${doc.fileName}</a> (${doc.fileSize||''}) · ${doc.uploadedAt||''}`
                    : doc.status==='uploaded' ? ` · <span style='color:var(--success);'>Uploaded</span>` : ''
                }</div>
              </div>
              <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                ${doc.status==='uploaded'
                  ? `<button class="btn btn-secondary btn-sm" style="font-size:0.62rem; padding:3px 7px; opacity:0.7;" onclick="simulateDocUpload('${doc.id}')">Replace</button><span class="badge badge-success" style="font-size:0.65rem;">✓ Done</span>`
                  : `<button class="btn btn-secondary btn-sm" style="font-size:0.68rem; padding:4px 10px; white-space:nowrap;" onclick="simulateDocUpload('${doc.id}')">📁 Choose File</button>`
                }
              </div>
            </div>`).join('')}
        </div>
        ${progressPct===100?`<div class="btn btn-primary" style="width:100%;text-align:center;margin-top:12px;cursor:default;">✅ Ready to Submit Application</div>`:`<div style="font-size:0.72rem;color:var(--text-muted);margin-top:10px;text-align:center;">Complete all required documents to submit your application.</div>`}
      </div>

      <!-- Key Dates -->
      <div class="widget glass">
        <div class="widget-header" style="margin-bottom:14px;">
          <h3 class="widget-title">🗓️ Key Dates & Deadlines</h3>
          <span style="font-size:0.7rem; color:var(--text-muted);">${intakeYear} Intake</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${keyDates.map(ev => {
            const isPast = ev.date < now;
            const isNext = nextEvent && ev.label === nextEvent.label;
            const dLeft  = Math.ceil((ev.date - now) / 86400000);
            const m = ev.date.toLocaleString('en-GB',{month:'short'}).toUpperCase();
            const d = ev.date.getDate().toString().padStart(2,'0');
            return `<div style="display:flex; gap:12px; align-items:flex-start; padding:9px 11px; background:${isPast?'rgba(0,0,0,0.05)':isNext?'rgba(37,99,235,0.08)':'rgba(0,0,0,0.08)'}; border-radius:10px; ${isNext?'border-left:3px solid var(--primary);':isPast?'opacity:0.45;':''}">
              <div style="background:${isNext?'var(--primary)':isPast?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.08)'}; border-radius:8px; padding:5px 9px; text-align:center; min-width:42px; flex-shrink:0;">
                <div style="font-size:0.58rem; font-weight:800; text-transform:uppercase; opacity:0.85;">${m}</div>
                <div style="font-size:1.1rem; font-weight:900;">${d}</div>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:0.8rem; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                  <span>${ev.label}</span>
                  ${isNext?`<span style="font-size:0.65rem;background:rgba(245,158,11,0.15);color:#f59e0b;padding:2px 6px;border-radius:5px;font-weight:700;">In ${dLeft}d</span>`:''}
                  ${isPast?`<span style="font-size:0.65rem;color:var(--text-muted);">Passed</span>`:''}
                </div>
                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">${ev.desc}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Programmes + Filter -->
    <div class="widget glass" style="margin-bottom:20px;">
      <div class="widget-header" style="margin-bottom:14px;">
        <h3 class="widget-title">🎓 Programmes & WASSCE Requirements</h3>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          ${userAggregate ? `<span style="font-size:0.7rem; color:var(--success); font-weight:700;">✅ Showing eligible for agg. ${userAggregate}</span>` : ''}
          <input type="number" min="6" max="36" placeholder="Your aggregate..." id="adm-agg-filter"
            value="${userAggregate||''}"
            style="width:130px; font-size:0.72rem; padding:5px 8px; border-radius:8px; border:1px solid var(--border); background:rgba(255,255,255,0.05); color:var(--text-primary);"
            oninput="admFilterByAggregate(this.value)" />
          <button class="btn btn-secondary btn-sm" onclick="switchTab('student','student-universities')" style="font-size:0.7rem;">View All Unis →</button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:10px;">
        ${filteredProgs.map(p => `
          <div class="glass" style="padding:13px 15px; border-radius:12px; border-left:3px solid ${p.eligible===true?'var(--success)':p.eligible===false?'rgba(239,68,68,0.5)':p.color}; cursor:pointer; transition:transform 0.2s; position:relative;"
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform=''"
            onclick="switchTab('student','student-ai-assistant'); setAiMode('admission');">
            ${p.eligible===true?`<div style="position:absolute;top:8px;right:8px;font-size:0.6rem;background:rgba(16,185,129,0.15);color:var(--success);padding:2px 6px;border-radius:5px;font-weight:700;">✅ ELIGIBLE</div>`:''}
            ${p.eligible===false?`<div style="position:absolute;top:8px;right:8px;font-size:0.6rem;background:rgba(239,68,68,0.1);color:#ef4444;padding:2px 6px;border-radius:5px;font-weight:700;">Above cutoff</div>`:''}
            <div style="font-size:0.85rem; font-weight:700; margin-bottom:4px; padding-right:${p.eligible!==null?'72px':'0'};">${p.name}</div>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:8px;">🏛️ ${p.uni} · ⏱ ${p.duration}</div>
            <div style="display:flex; gap:5px; flex-wrap:wrap;">
              <span style="font-size:0.63rem; background:rgba(255,255,255,0.07); border-radius:5px; padding:2px 7px;">📊 Agg. ≤ ${p.cutoff}</span>
              <span style="font-size:0.63rem; background:rgba(255,255,255,0.07); border-radius:5px; padding:2px 7px;">📚 ${p.subjects}</span>
              <span style="font-size:0.63rem; border-radius:5px; padding:2px 7px; color:${p.color}; background:rgba(255,255,255,0.05);">💰 ${p.salary}</span>
            </div>
          </div>`).join('')}
        ${filterAgg && filteredProgs.length === 0 ? `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:24px;">No programmes found. Try a higher aggregate or <button class="btn btn-secondary btn-sm" onclick="admFilterByAggregate('')">Show all</button></div>` : ''}
      </div>
      ${!filterAgg && programmes.length > 8 ? `<div style="text-align:center;margin-top:12px;"><button class="btn btn-secondary btn-sm" onclick="admShowAllProgs()" style="font-size:0.75rem;">Show all ${programmes.length} programmes →</button></div>` : ''}
    </div>

    <!-- Scholarships -->
    <div class="widget glass" style="margin-bottom:20px;">
      <div class="widget-header" style="margin-bottom:14px;">
        <h3 class="widget-title">🏆 Active Scholarship Opportunities</h3>
        <span style="font-size:0.72rem; color:var(--success); font-weight:700;">● ${scholarships.length} currently open</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:12px;">
        ${scholarships.map(s => `
          <div class="glass" style="padding:15px; border-radius:12px; border-top:3px solid ${s.color}; transition:transform 0.2s;"
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform=''">
            <div style="font-size:0.85rem; font-weight:700; margin-bottom:4px;">${s.name}</div>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:8px;">By ${s.body}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:4px;">
              <span style="font-size:0.65rem; background:rgba(255,255,255,0.07); border-radius:5px; padding:2px 8px;">${s.type}</span>
              <span style="font-size:0.65rem; color:${s.daysLeft<=30?'#ef4444':'#f59e0b'}; font-weight:700;">⏰ ${s.daysLeft}d left · ${s.deadlineStr}</span>
            </div>
            <a href="${s.link}" target="_blank" class="btn btn-secondary btn-sm" style="width:100%; text-align:center; font-size:0.7rem; display:block;">Apply / Learn More →</a>
          </div>`).join('')}
      </div>
    </div>

    <!-- Stats Row + CTA -->
    <div style="display:grid; grid-template-columns:1fr auto; gap:16px; align-items:center; flex-wrap:wrap;">
      <div class="glass" style="padding:14px 18px; border-radius:12px; display:flex; gap:20px; flex-wrap:wrap;">
        <div style="text-align:center;"><div style="font-size:1.4rem; font-weight:900; color:var(--primary);">${totalUnis}</div><div style="font-size:0.68rem; color:var(--text-muted);">Universities Listed</div></div>
        <div style="text-align:center;"><div style="font-size:1.4rem; font-weight:900; color:var(--success);">${programmes.length}</div><div style="font-size:0.68rem; color:var(--text-muted);">Programmes</div></div>
        <div style="text-align:center;"><div style="font-size:1.4rem; font-weight:900; color:#f59e0b;">${scholarships.length}</div><div style="font-size:0.68rem; color:var(--text-muted);">Scholarships Open</div></div>
        <div style="text-align:center;"><div style="font-size:1.4rem; font-weight:900; color:#8b5cf6;">${registeredApplicants}</div><div style="font-size:0.68rem; color:var(--text-muted);">Applicants Registered</div></div>
      </div>
      <div style="display:flex; gap:8px; flex-direction:column;">
        <button class="btn btn-primary" onclick="switchTab('student','student-ai-assistant'); setAiMode('admission');">🤖 Ask Admission Advisor</button>
        <button class="btn btn-secondary" onclick="switchTab('student','student-universities');">🏛️ Browse Universities</button>
      </div>
    </div>
  `;
};

function simulateDocUpload(docId) {
  if (!appState.admissionDocs) return;
  // Create a temporary hidden file input to trigger a real OS file picker
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.jpg,.jpeg,.png,.docx,.doc,.zip';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    document.body.removeChild(input);
    if (!file) return;
    // Validate size (max 15 MB)
    if (file.size > 15 * 1024 * 1024) {
      showToastNotification('❌ File too large. Max 15 MB allowed.');
      return;
    }
    const doc = appState.admissionDocs.find(d => d.id === docId);
    if (!doc) return;
    // Store real file metadata
    doc.status = 'uploaded';
    doc.fileName = file.name;
    doc.fileSize = (file.size / 1024).toFixed(0) + ' KB';
    doc.uploadedAt = new Date().toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    // Save a local object URL so it can be previewed
    if (doc.objectUrl) URL.revokeObjectURL(doc.objectUrl);
    doc.objectUrl = URL.createObjectURL(file);
    saveOfflineState();
    showToastNotification(`✅ "${file.name}" uploaded successfully!`);
    renderProspectiveStudentDashboard();
  });
  input.click();
}

function admFilterByAggregate(val) {
  const num = parseInt(val);
  if (val === '' || isNaN(num)) {
    appState.user && (appState.user.wassceAggregate = null);
    appState.admissionFilter = '';
  } else {
    if (!appState.user) appState.user = {};
    appState.user.wassceAggregate = num;
    appState.admissionFilter = val;
  }
  renderProspectiveStudentDashboard();
}

function admSetAggregate() {
  const val = prompt('Enter your WASSCE aggregate score (6 = best, 36 = lowest eligible):');
  if (val) admFilterByAggregate(val.trim());
}

function admShowAllProgs() {
  appState.admissionShowAll = true;
  renderProspectiveStudentDashboard();
}



const renderAllComponents = () => {
  renderProspectiveStudentDashboard();
  renderStudentCourses(); renderStudentNotes(); renderStudentAssignments(); renderLecturerAnalytics(); renderLecturerSubmissions(); renderForums(); generateCalendarGrid(); renderDedicatedAssignmentsDeck(); renderStudentUniversities(); renderFacultyChat(); renderContactsDirectory(); renderProgramSelectionCards(); updateStudentDashboardMetrics(); renderSpaStartupsList(); renderStudentInternships();
  if (typeof renderResearcherScansTable === 'function') renderResearcherScansTable();
  if (appState.role === 'admin' && typeof renderAdminViews === 'function') renderAdminViews();
  renderDashboardAnnouncements(); renderDynamicNotifications();
},
updateStudentDashboardMetrics = () => {
  if (!appState.user || appState.role !== 'student') return; const s = appState.students.find(x => x.email.toLowerCase() === appState.user.email.toLowerCase());
  if (s) { D.html('student-cgpa-display', Number(s.cgpa).toFixed(2)); D.html('student-attendance-display', `${s.attendance}%`); } };
function renderFacultyChat() {
  const container = D.get('faculty-chat-contacts-list'); if (!container) return;
  container.innerHTML = appState.facultyContacts.map(c => {
    const active = appState.activeFacultyEmail === c.email;
    return `
      <div class="chat-contact-item glass" style="padding: 10px 14px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; gap: 10px; background: ${active ? 'rgba(37,99,235,0.15)' : 'rgba(0,0,0,0.15)'}; border: 1px solid ${active ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};" onclick="switchFacultyContact('${c.email}')">
        <div class="instructor-avatar" style="width: 36px; height: 36px; border-radius: var(--radius-full); overflow: hidden; flex-shrink:0;"><img src="picture/${c.avatar}" style="width:100%; height:100%; object-fit:cover;"></div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="font-size: 0.85rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${c.name}</h4>
          <p style="font-size: 0.7rem; color: var(--text-muted); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.role}</p>
        </div>
      </div>`;
  }).join(''); const activeContact = appState.facultyContacts.find(c => c.email === appState.activeFacultyEmail);
  if (activeContact) {
    D.get('active-chat-avatar').querySelector('img').src = `picture/${activeContact.avatar}`; D.html('active-chat-name', activeContact.name); D.html('active-chat-status', `🟢 Online (${activeContact.role})`);
    D.get('faculty-chat-input').placeholder = `Type a message to ${activeContact.name}...`; }
  const log = D.get('faculty-chat-log'); if (!log) return; const messages = appState.facultyChats[appState.activeFacultyEmail] || []; log.innerHTML = messages.length === 0 ? '<div style="text-align:center; color:var(--text-muted); font-size:0.8rem; padding: 20px;">No messages.</div>' :
    messages.map(msg => {
      const isStd = msg.sender === 'student';
      return `
        <div style="max-width: 75%; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; line-height: 1.45; align-self: ${isStd ? 'flex-end' : 'flex-start'}; background: ${isStd ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; color: ${isStd ? 'white' : 'var(--text-color)'};">
          <div>${msg.text}</div>
          <div style="font-size: 0.65rem; color: rgba(255,255,255,0.6); text-align: right; margin-top: 4px;">${msg.timestamp}</div>
        </div>`;
    }).join(''); log.scrollTop = log.scrollHeight; }
const switchFacultyContact = email => { appState.activeFacultyEmail = email; renderFacultyChat(); };
function sendFacultyChatMessage() {
  const input = D.get('faculty-chat-input'); if (!input || !input.value.trim()) return; const text = input.value.trim(); input.value = ''; if (!appState.facultyChats[appState.activeFacultyEmail]) appState.facultyChats[appState.activeFacultyEmail] = [];
  appState.facultyChats[appState.activeFacultyEmail].push({ sender: appState.role === 'lecturer' ? 'faculty' : 'student', text: text, timestamp: 'Just now' }); saveOfflineState(); renderFacultyChat(); const name = appState.facultyContacts.find(c => c.email === appState.activeFacultyEmail)?.name || 'Professor';
  
  // Use WebSocket if connected
  if (typeof wsConn !== 'undefined' && wsConn && wsConn.readyState === 1) {
    wsConn.send(JSON.stringify({
      type: 'chat_message',
      recipientId: appState.activeFacultyEmail,
      senderId: appState.user?.email || `user_${Date.now()}`,
      senderName: appState.user?.name || (appState.role === 'lecturer' ? 'Lecturer' : 'Student'),
      text: text
    }));
    return;
  }
  
  // Fallback to simulated offline response for testing
  setTimeout(() => {
    const resText = getSimulatedFacultyResponse(name, text);
    appState.facultyChats[appState.activeFacultyEmail].push({ sender: appState.role === 'lecturer' ? 'student' : 'faculty', text: resText, timestamp: 'Just now' }); saveOfflineState(); renderFacultyChat(); showToastNotification(`New message from ${name}`);
  }, 1200); }
function getSimulatedFacultyResponse(name, msg) {
  const text = msg.toLowerCase(); if (text.includes('hello') || text.includes('hi')) return 'Hello! Let me know what specific questions you have about our latest academic modules.'; if (text.includes('gpa') || text.includes('grade')) return 'Grades are computed based on coursework. Only lecturers can submit final adjustments.';
  if (text.includes('assignment') || text.includes('deadline')) return 'Ensure your file is uploaded through the Submission Center before the deadline tracker expires.';
  const firstName = appState.user?.name ? appState.user.name.split(' ')[0] : 'student';
  return `Thanks for the details, ${firstName}. I will look into it and get back to you during office hours.`; }
async function renderStateData() { renderAllComponents(); try { await fetchStateData(); renderAllComponents(); } catch(e){} }
const renderStudentCourses = () => {
  const el = D.get('student-courses-grid'); if (!el) return;
  let filteredCourses = appState.courses;
  if (appState.role === 'student' && appState.user && appState.user.program) {
    filteredCourses = appState.courses.filter(c => c.program === appState.user.program);
  }
  el.innerHTML = filteredCourses.map(c => {
    const courseDescriptions = {
      'CS101': 'Master computational thinking, Python programming, data structures, and algorithm design.',
      'MATH102': 'Explore calculus, linear algebra, applied mathematics, and statistical modeling.',
      'ENG201': 'Learn software engineering lifecycles, UML design, Agile/Scrum, and architectural patterns.',
      'BUA202': 'Study corporate leadership, supply chain logistics, financial reporting, and marketing strategy.',
      'CYS101': 'Dive into cryptography, network security, ethical hacking, and digital forensics.',
      'DSC101': 'Analyze datasets using machine learning, SQL, data visualization, and predictive modeling.',
      'ELE101': 'Study circuit analysis, semiconductor electronics, power systems, and signal processing.',
      'MEC101': 'Explore thermodynamics, fluid mechanics, CAD modeling, and mechanical control systems.',
      'ARC101': 'Learn structural design, sustainable architecture, CAD modeling, and building codes.',
      'NUR101': 'Master clinical patient care, pediatric nursing, anatomy, and pharmaceutical ethics.',
      'MED101': 'Undergo clinical rotations, diagnostics, pathology, and internal medicine training.',
      'PHA101': 'Study pharmaceutical chemistry, drug delivery systems, and clinical pharmacology.',
      'LAW101': 'Analyze constitutional law, jurisprudence, contract law, and legal drafting in Ghana.',
      'ECO101': 'Study macroeconomic trends, public finance, econometrics, and policy frameworks.'
    };
    const desc = courseDescriptions[c.code] || `Advanced coursework in ${c.title.split('&')[0].trim()} with practical applications.`;
    return `
    <div class="course-card">
      <div class="course-banner"><span class="course-code">${c.code}</span><h3 style="font-size:1.05rem; margin-top:10px;">${c.title}</h3></div>
      <div class="course-body">
        <p>${desc}</p>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
          <span>📚 ${c.notesCount} Lecture Notes</span><span>📝 ${c.assignmentsCount} Assignments</span>
        </div>
      </div>
      <div class="course-footer">
        <div class="instructor-profile"><div class="instructor-avatar"><img src="picture/${c.avatar}"></div><span>${c.instructor}</span></div>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('student', 'student-contacts')">Contact</button>
      </div>
    </div>`;
  }).join('');
},
renderStudentNotes = () => {
  const el = D.get('student-notes-list'); if (!el) return;
  let filteredNotes = appState.notes;
  if (appState.role === 'student' && appState.user && appState.user.program) {
    const programCourses = appState.courses.filter(c => c.program === appState.user.program).map(c => c.id);
    filteredNotes = appState.notes.filter(n => programCourses.includes(n.courseId));
  }
  el.innerHTML = filteredNotes.map(note => {
    const code = appState.courses.find(c => c.id === note.courseId)?.code || 'GEN';
    const pdfMap = {
      'Lec 1: Fundamentals of Python & Control Structures.pdf': 'assets/pdfs/CS101_Fundamentals.pdf',
      'Lec 2: Object Oriented Programming in Python.pdf': 'assets/pdfs/CS101_OOP.pdf',
      'Lec 3: Python Programming Basics.pdf': 'assets/pdfs/CS101_Python.pdf',
      'Cheat Sheet: Python Syntax & Operations.pdf': 'assets/pdfs/CS101_Python_Cheat_Sheet.pdf',
      'Lec 1: Derivatives and Rate of Changes.pdf': 'assets/pdfs/MATH102_Derivatives.pdf',
      'Lec 2: Functions, Limits, & Continuity.pdf': 'assets/pdfs/MATH102_Calculus.pdf',
      'Cheat Sheet: Key Calculus Limits & Formulas.pdf': 'assets/pdfs/MATH102_Calculus_Cheat_Sheet.pdf',
      'Lec 1: Intro to Agile Methodologies & Scrum.pdf': 'assets/pdfs/ENG201_Agile.pdf',
      'Lec 1: Fundamentals of Management & Business Operations.pdf': 'assets/pdfs/BUA202_Business.pdf',
      
      // Program textbooks mapping
      'Computer Science Course Book.pdf': 'PDF/Computer and Information Technology/ComputerScienceOne.pdf',
      'Software Engineering Course Book.pdf': 'PDF/Computer and Information Technology/Software Engineering - Ian Sommerville.pdf',
      'Cybersecurity Course Book.pdf': 'PDF/Computer and Information Technology/FUNDAMENTALS OF CYBER SECURITY.pdf',
      'Data Science Course Book.pdf': 'PDF/Computer and Information Technology/book.pdf',
      'Business Administration Course Book.pdf': 'PDF/Business and Economics/Business admin.pdf',
      'BA Economics & Public Policy Course Book.pdf': 'PDF/Business and Economics/BA Economics & Public Policy.pdf',
      'Electrical Engineering Course Book.pdf': 'PDF/Engineering & Architecture/BSc Electrical Engineering.pdf',
      'Mechanical Engineering Course Book.pdf': 'PDF/Engineering & Architecture/BSc_Mechanical_Engineering.pdf',
      'Architecture and Design Course Book.pdf': 'PDF/Engineering & Architecture/BSc_Architecture_and_Design.pdf',
      'Nursing and Allied Health Course Book.pdf': 'PDF/Healthcare & Medical Sciences/BSc_Nursing_and_Allied_Health.pdf',
      'Pharmacy Course Book.pdf': 'PDF/Healthcare & Medical Sciences/Doctor_of_Pharmacy_PharmD.pdf',
      'Medicine and Surgery Course Book.pdf': 'PDF/Healthcare & Medical Sciences/Medicine_and_Surgery_MBChB.pdf',
      'Bachelor of Laws Course Book.pdf': 'PDF/Legal & Social Sciences/Bachelor_of_Laws_LLB.pdf'
    };
    const pdfUrl = pdfMap[note.title] || '#';
    return `
      <div class="glass" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-primary" style="font-size:0.65rem; margin-bottom:4px;">${code}</span>
          <h4 style="font-size:0.95rem;">${note.title}</h4>
          <span style="font-size:0.75rem; color:var(--text-light)">Uploaded on ${note.date} • ${note.size}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="simulateSummarizeNote('${note.title}')">AI Summarize</button>
          <a class="btn btn-primary btn-sm" href="${pdfUrl}" download="${note.title}" target="_blank">Download</a>
        </div>
      </div>`;
  }).join('');
},
renderStudentAssignments = () => {
  const el = D.get('student-assignments-list'); if (!el) return;
  
  const pending = [];
  const submitted = [];
  
  appState.assignments.forEach(asg => {
    const submission = appState.submissions ? appState.submissions.find(s => s.assignmentId === asg.id) : null;
    if (submission) {
      submitted.push({ asg, submission });
    } else {
      pending.push({ asg });
    }
  });

  const getCountdownLabel = (deadlineStr) => {
    const diff = Math.ceil((new Date(deadlineStr) - new Date('2026-05-24')) / 86400000);
    if (diff > 0) return { text: `Due in ${diff} Days`, isPast: false };
    if (diff === 0) return { text: 'Due Today', isPast: false };
    return { text: 'Past Due', isPast: true };
  };

  const renderPendingItem = ({ asg }) => {
    const code = appState.courses.find(c => c.id === asg.courseId)?.code || 'GEN';
    const countdown = getCountdownLabel(asg.deadline);
    
    let statusLabel = '';
    let actionHTML = '';
    
    if (countdown.isPast) {
      statusLabel = `<span class="badge badge-danger" style="margin-left: 6px;">Overdue - Late for Submission</span>`;
      actionHTML = `<span style="font-size:0.8rem; color:var(--danger); font-weight:700;">Closed</span>`;
    } else {
      statusLabel = `<span class="badge badge-warning" style="margin-left: 6px;">Pending</span>`;
      actionHTML = `<button class="btn btn-primary btn-sm" onclick="openSubmitAssignmentModal(${asg.id}, '${asg.title}')">Submit File</button>`;
    }
    
    return `
      <div class="glass" style="padding:20px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="badge badge-info" style="font-size:0.65rem;">${code}</span>
            ${statusLabel}
          </div>
          <h4 style="font-size:1.05rem; margin-top:6px; margin-bottom:4px;">${asg.title}</h4>
          <span style="font-size:0.8rem; color:var(--danger)">Deadline: ${asg.deadline} (${countdown.text})</span>
        </div>
        <div>${actionHTML}</div>
      </div>`;
  };

  const renderSubmittedItem = ({ asg, submission }) => {
    const code = appState.courses.find(c => c.id === asg.courseId)?.code || 'GEN';
    
    const subDateOnly = submission.date.split(' ')[0];
    const deadlineDateOnly = asg.deadline.split(' ')[0];
    
    let relativeStatusLabel = '';
    let badgeClass = '';
    
    if (subDateOnly < deadlineDateOnly) {
      relativeStatusLabel = 'In Time';
      badgeClass = 'badge-success';
    } else if (subDateOnly === deadlineDateOnly) {
      relativeStatusLabel = 'On Time';
      badgeClass = 'badge-success';
    } else {
      relativeStatusLabel = 'Due Date Was Up';
      badgeClass = 'badge-danger';
    }
    
    // Find plagiarism report matching file name
    const reports = (appState.plagiarismReports || []).concat(appState.demoPlagiarismReports || []);
    const report = reports.find(r => r.documentName === submission.fileName);
    let plagBadgeHTML = '';
    if (report) {
      const recColor = report.recommendation === 'CLEAR' ? '#10b981' : report.recommendation === 'FLAG_CONCERN' ? '#ef4444' : '#f59e0b';
      plagBadgeHTML = `<span class="badge" style="background:rgba(0,0,0,0.2); color:${recColor}; font-size:0.65rem; border:1px solid ${recColor}; cursor:pointer; margin-left:6px;" onclick="viewPlagiarismReportForFile('${submission.fileName}')" title="Click to view AI Plagiarism Report">🛡️ Plagiarism: ${report.overallSimilarity}%</span>`;
    }

    const gradeVal = submission.grade || asg.grade;
    const act = `<div style="text-align:right;"><span style="font-weight:700; color:var(--success)">${gradeVal ? `Grade: ${gradeVal}/100` : 'Awaiting Grading'}</span></div>`;
    
    return `
      <div class="glass" style="padding:20px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="badge badge-info" style="font-size:0.65rem;">${code}</span>
            <span class="badge ${badgeClass}" style="font-size:0.65rem;">Submitted: ${relativeStatusLabel}</span>
            ${plagBadgeHTML}
          </div>
          <h4 style="font-size:1.05rem; margin-top:6px; margin-bottom:4px;">${asg.title}</h4>
          <span style="font-size:0.8rem; color:var(--text-light)">Submitted on ${submission.date} (${submission.fileName})</span>
        </div>
        <div>${act}</div>
      </div>`;
  };

  el.innerHTML = `
    <h3 style="margin-bottom:12px;">Pending Assignments</h3>
    ${pending.length ? pending.map(renderPendingItem).join('') : '<p style="color:var(--text-muted);">No pending assignments.</p>'}
    <h3 style="margin-top:24px; margin-bottom:12px;">Submitted Assignments</h3>
    ${submitted.length ? submitted.map(renderSubmittedItem).join('') : '<p style="color:var(--text-muted);">No submitted assignments yet.</p>'}
  `;
};
function animateCount(elId, targetVal, suffix, decimals) {
  const el = D.get(elId); if (!el) return;
  const start = 0, duration = 900, startTime = performance.now();
  const step = (now) => {
    const pct = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    const current = decimals ? (eased * targetVal).toFixed(decimals) : Math.floor(eased * targetVal);
    el.textContent = current + (suffix || '');
    if (pct < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderLecturerAnalytics() {
  const el = D.get('lecturer-students-table-body'); if (!el) return; let total = 0;

  // --- Build dynamic student list ---
  let studentsToShow = [...appState.students];
  if (typeof getSimulatedUsers === 'function') {
    const adminStudents = getSimulatedUsers().filter(u => u.role === 'student');
    adminStudents.forEach(as => {
      if (!studentsToShow.some(s => s.email.toLowerCase() === as.email.toLowerCase())) {
        studentsToShow.push({
          id: as.id || as.email,
          name: as.name,
          email: as.email,
          courses: as.department || 'General',
          attendance: Math.floor(70 + Math.random() * 25),
          cgpa: (2.0 + Math.random() * 2.0).toFixed(2),
          status: 'Good Stand'
        });
      }
    });
  }

  // --- Render student table ---
  el.innerHTML = studentsToShow.map(s => {
    total += parseFloat(s.cgpa);
    const editing = appState.editingStudentId === s.id;
    const gpaCell = editing
      ? `<td><input type="number" step="0.01" value="${s.cgpa}" id="editing-gpa-val" style="width:70px;"></td>`
      : `<td><strong>${s.cgpa}</strong></td>`;
    const actionsCell = editing
      ? `<td><button class="btn btn-primary btn-sm" onclick="saveStudentGpa('${s.id}')">Save</button></td>`
      : `<td><button class="btn btn-secondary btn-sm" onclick="editStudentGpa('${s.id}')">Edit</button></td>`;
    return `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.courses}</td>
        <td>${s.attendance}%</td>
        ${gpaCell}
        <td><span class="badge ${parseFloat(s.cgpa) < 2 ? 'badge-danger' : 'badge-success'}">${s.status}</span></td>
        ${actionsCell}
      </tr>`;
  }).join('');

  // --- Compute metrics dynamically ---
  const totalStudents = studentsToShow.length;
  const avgGpa = totalStudents ? (total / totalStudents) : 0;

  // Notes published = sum of notesCount across all courses
  const totalNotes = (appState.courses || []).reduce((sum, c) => sum + (c.notesCount || 0), 0);

  // Grading queue = submissions without a grade yet
  const ungradedCount = (appState.submissions || []).filter(s => !s.grade).length;

  // --- Animate metric cards ---
  animateCount('lec-roster-count', totalStudents, ' Students', 0);
  animateCount('class-average-gpa-display', avgGpa, '', 2);
  animateCount('lec-notes-count', totalNotes, ' Modules', 0);

  // Grading queue label
  const gradingEl = D.get('lecturer-grading-queue-count');
  if (gradingEl) {
    animateCount('lecturer-grading-queue-count', ungradedCount, ungradedCount === 1 ? ' Submission' : ' Submissions', 0);
    // Highlight badge if there are pending items
    const card = D.get('lec-metric-grading');
    if (card) card.style.borderLeft = ungradedCount > 0 ? '3px solid var(--danger)' : '3px solid var(--success)';
  }
}
const editStudentGpa = id => { appState.editingStudentId = id; renderLecturerAnalytics(); },
cancelEditStudentGpa = () => { appState.editingStudentId = null; renderLecturerAnalytics(); };
async function saveStudentGpa(id) {
  const gpa = parseFloat(D.val('editing-gpa-val')); if (isNaN(gpa) || gpa < 0 || gpa > 4) return showToastNotification('Enter a value between 0 and 4.'); const std = appState.students.find(s => s.id === id);
  if (std) {
    std.cgpa = gpa; std.status = gpa < 2 ? 'Needs Help' : 'Good Stand'; if (appState.user && appState.user.email.toLowerCase() === std.email.toLowerCase()) appState.user.cgpa = gpa; appState.editingStudentId = null; saveOfflineState(); showToastNotification('GPA updated!'); renderLecturerAnalytics(); const token = localStorage.getItem('proto_token');
    if (token && !token.startsWith('simulated_token_')) {
      try { await fetch(`${API_BASE}/api/students/update-gpa`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ studentId: id, cgpa: gpa }) }); } catch(e){} } } }
function renderLecturerSubmissions() {
  const el = D.get('lecturer-submissions-list'); if (!el) return;
  el.innerHTML = appState.submissions.map(sub => {
    const asg = appState.assignments.find(a => a.id === sub.assignmentId);

    // Plagiarism badge
    const reports = (appState.plagiarismReports || []).concat(appState.demoPlagiarismReports || []);
    const report = reports.find(r => r.documentName === sub.fileName);
    let plagHtml = '';
    if (report) {
      const recColor = report.recommendation === 'CLEAR' ? '#10b981' : report.recommendation === 'FLAG_CONCERN' ? '#ef4444' : '#f59e0b';
      plagHtml = `<span style="font-size:0.75rem;color:var(--text-muted);margin-left:8px;">Plagiarism: <strong style="color:${recColor};cursor:pointer;" onclick="viewPlagiarismReportForFile('${sub.fileName}')">${report.overallSimilarity}% (${report.recommendation.replace(/_/g,' ')})</strong></span>`;
    }

    const isEditing = appState.editingSubmissionId === sub.id;

    let gradingHtml;
    if (isEditing) {
      // ── Inline edit form ──
      gradingHtml = `
        <div style="display:flex;flex-direction:column;gap:8px;min-width:260px;">
          <label style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px;">New Grade (0–100)</label>
          <input type="number" id="grade-val-${sub.id}" value="${sub.grade || ''}" min="0" max="100"
                 style="width:100%;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:var(--text-primary);">
          <label style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px;">Feedback</label>
          <input type="text" id="feedback-val-${sub.id}" value="${sub.feedback || ''}" placeholder="Feedback note…"
                 style="width:100%;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:var(--text-primary);">
          <div style="display:flex;gap:8px;margin-top:4px;">
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="submitGrade(${sub.id})">💾 Save Grade</button>
            <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="cancelEditSubmission()">✕ Cancel</button>
          </div>
        </div>`;
    } else if (sub.grade) {
      // ── Already graded — show result + edit button ──
      const gradeNum = parseFloat(sub.grade);
      const gradeColor = gradeNum >= 75 ? '#10b981' : gradeNum >= 50 ? '#f59e0b' : '#ef4444';
      gradingHtml = `
        <div style="text-align:right;">
          <div style="font-size:1.4rem;font-weight:800;color:${gradeColor};">${sub.grade}<span style="font-size:0.85rem;font-weight:500;color:var(--text-muted);">/100</span></div>
          ${sub.feedback ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;max-width:180px;">"${sub.feedback}"</div>` : ''}
          <button class="btn btn-secondary btn-sm" style="font-size:0.72rem;" onclick="startEditSubmission(${sub.id})">✏️ Edit Grade</button>
        </div>`;
    } else {
      // ── Ungraded — fresh grade form ──
      gradingHtml = `
        <div style="display:flex;flex-direction:column;gap:8px;min-width:240px;">
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="number" id="grade-val-${sub.id}" placeholder="Grade /100" min="0" max="100"
                   style="width:90px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:var(--text-primary);">
            <input type="text" id="feedback-val-${sub.id}" placeholder="Feedback…"
                   style="flex:1;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:var(--text-primary);">
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;" onclick="submitGrade(${sub.id})">✅ Submit Grade</button>
        </div>`;
    }

    const borderColor = sub.grade ? (parseFloat(sub.grade) >= 75 ? 'rgba(16,185,129,0.3)' : parseFloat(sub.grade) >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)') : 'rgba(99,102,241,0.2)';

    return `
      <div class="glass" style="padding:20px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;border-left:3px solid ${borderColor};border-radius:14px;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 24px rgba(124,58,237,0.12)'" onmouseout="this.style.boxShadow=''">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">👤</div>
            <div>
              <h4 style="font-size:0.95rem;margin:0;">Student: <strong>${sub.studentName}</strong></h4>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(sub.date).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) || sub.date}</span>
            </div>
          </div>
          <div style="font-size:0.8rem;margin-bottom:4px;">📎 File: <a href="#" style="color:var(--primary);" onclick="event.preventDefault();viewPlagiarismReportForFile('${sub.fileName}')">${sub.fileName}</a>${plagHtml}</div>
          <div style="font-weight:600;font-size:0.88rem;">📋 ${asg ? asg.title : 'General Assignment'}</div>
        </div>
        <div style="flex-shrink:0;">${gradingHtml}</div>
      </div>`;
  }).join('');
}

function startEditSubmission(id) {
  appState.editingSubmissionId = id;
  renderLecturerSubmissions();
}

function cancelEditSubmission() {
  appState.editingSubmissionId = null;
  renderLecturerSubmissions();
}

async function submitGrade(id) {
  const grade = parseFloat(D.val(`grade-val-${id}`)), fb = D.val(`feedback-val-${id}`) || 'Well done.'; if (isNaN(grade)) return showToastNotification('Please enter a grade.'); const token = localStorage.getItem('proto_token'); if (!token) return;
  if (token.startsWith('simulated_token_') || isOfflineDemoMode) {
    const sub = appState.submissions.find(s => s.id == id);
    if (sub) {
      sub.grade = grade; sub.feedback = fb;
      const asg = appState.assignments.find(a => a.id == sub.assignmentId);
      if (asg) { asg.grade = grade.toString(); asg.feedback = fb; asg.status = 'Submitted'; }
      appState.editingSubmissionId = null;
      pushDynamicNotification(`📊 Your assignment "${asg ? asg.title : 'Assignment'}" was graded: ${grade}/100. Feedback: "${fb}"`, 'grading', sub.studentName);
      saveOfflineState(); showToastNotification('Grade saved!'); renderStateData();
    }
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/assignments/grade`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ submissionId: id, grade, feedback: fb }) });
    if (res.ok) {
      const sub = appState.submissions.find(s => s.id == id);
      const asg = sub ? appState.assignments.find(a => a.id == sub.assignmentId) : null;
      pushDynamicNotification(`📊 Your assignment "${asg ? asg.title : 'Assignment'}" was graded: ${grade}/100. Feedback: "${fb}"`, 'grading', sub?.studentName);
      showToastNotification('Graded successfully!'); renderStateData();
    }
  } catch (err) {} }
function renderForums() {
  const el = D.get('forum-posts-container'); if (!el) return;
  el.innerHTML = appState.forumThreads.map(t => {
    const repliesHtml = t.replies.map(r => `
      <div style="background:var(--bg-base); padding:10px; margin-top:8px; border-left:3px solid var(--secondary);">
        <strong>${r.author}</strong> <span class="badge badge-info">${r.role}</span>
        <p style="font-size:0.85rem; margin-top:4px;">${r.body}</p>
      </div>`).join('');
    return `
      <div class="widget glass">
        <div class="forum-header"><strong>${t.author}</strong> <span class="badge badge-primary">${t.category}</span></div>
        <div class="forum-body" style="margin:12px 0;"><h4>${t.title}</h4><p>${t.body}</p></div>
        <div class="forum-actions">
          <button class="forum-action-btn" onclick="upvoteThread(${t.id})">👍 ${t.upvotes} Upvotes</button>
          <button class="forum-action-btn" onclick="toggleRepliesBox(${t.id})">💬 ${t.replies.length} Replies</button>
        </div>
        <div id="replies-box-${t.id}" style="margin-top:16px;">
          ${repliesHtml}
          <div style="display:flex; gap:8px; margin-top:12px;">
            <input type="text" id="reply-input-${t.id}" placeholder="Reply..." class="form-control">
            <button class="btn btn-secondary btn-sm" onclick="submitForumReply(${t.id})">Comment</button>
          </div>
        </div>
      </div>`;
  }).join(''); }
async function upvoteThread(id) {
  const token = localStorage.getItem('proto_token');
  if (token && token.startsWith('simulated_token_')) {
    const t = appState.forumThreads.find(x => x.id == id);
    if (t) { t.upvotes++; saveOfflineState(); renderStateData(); } return; }
  try { await fetch(`${API_BASE}/api/forums/upvote/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); renderStateData(); } catch(e){} }
const toggleRepliesBox = id => {
  const el = D.get(`replies-box-${id}`); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; };
async function submitForumReply(id) {
  const input = D.get(`reply-input-${id}`); if (!input || !input.value.trim()) return; const token = localStorage.getItem('proto_token');
  const replyRole = appState.role === 'lecturer' ? 'Lecturer' : (appState.role === 'admin' ? 'Admin' : 'Student');
  const replyAvatar = appState.role === 'lecturer' ? 'avatar_lecturer.jpg' : 'avatar_student.jpg';
  if (token && token.startsWith('simulated_token_')) {
    const t = appState.forumThreads.find(x => x.id == id);
    if (t) {
      t.replies.push({ author: appState.user?.name || replyRole, avatar: replyAvatar, role: replyRole, body: input.value });
      // Cross-role notification: Lecturer/Admin reply → notify thread author
      if (appState.role === 'lecturer' || appState.role === 'admin') {
        pushDynamicNotification(`💬 ${appState.user?.name || replyRole} replied to your forum thread: "${t.title}"`, 'forum', t.author);
      }
      input.value = ''; saveOfflineState(); renderStateData();
    } return; }
  try {
    const res = await fetch(`${API_BASE}/api/forums/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ threadId: id, body: input.value }) });
    if (res.ok) {
      const t = appState.forumThreads.find(x => x.id == id);
      if (t && (appState.role === 'lecturer' || appState.role === 'admin')) {
        pushDynamicNotification(`💬 ${appState.user?.name || replyRole} replied to your forum thread: "${t.title}"`, 'forum', t.author);
      }
      input.value = ''; renderStateData();
    }
  } catch(e){} }
async function createForumThread() {
  const title = D.val('new-thread-title'), cat = D.val('new-thread-category'), body = D.val('new-thread-body'); if (!title || !body) return showToastNotification('Fill in title and description.'); const token = localStorage.getItem('proto_token');
  if (token && token.startsWith('simulated_token_')) {
    appState.forumThreads.unshift({ id: Date.now(), category: cat, author: appState.user?.name || 'Student', avatar: 'avatar_student.jpg', title, body, upvotes: 0, replies: [] }); D.val('new-thread-title', ''); D.val('new-thread-body', ''); saveOfflineState(); renderStateData(); return; }
  try {
    const res = await fetch(`${API_BASE}/api/forums/thread`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ category: cat, title, body }) });
    if (res.ok) { D.val('new-thread-title', ''); D.val('new-thread-body', ''); renderStateData(); }
  } catch(e){} }
let currentAiMode = 'study', chatSessionHistory = [];
const getSystemPrompt = mode => ({
  study: 'You are an intelligent, empathetic Academic Study Assistant at a Ghanaian university. Explain concepts clearly, suggest study strategies, and reference local Ghanaian context.', career: 'You are an expert Career and Academic Advisor for tertiary students in Ghana. Guide on matching majors, job opportunities in Accra/Kumasi, salaries, and skills.', helper: 'You are an academic writing counselor. Assist students with structuring essays and checking logic. Remind them to avoid plagiarism.',
  tutor: 'You are a Programming Tutor. Explain code, debug, and provide brief examples in Python, JS, SQL.',
  research: 'You are an expert AI Research Assistant helping Ghanaian university students. Critically evaluate methodology, search and critique literature, extract findings from abstracts, suggest regional West African/Ghanaian context, and format citations (APA, Harvard, IEEE, MLA).',
  innovation: 'You are a Startup Advisor and Business Plan Optimizer helping students commercialize their research in Ghana. Validate product-market fit, analyze risk, suggest funding, highlight local regulatory compliance (e.g. Ghana FDA, GSA, registrar general), and structure pitches.',
  admission: `You are SmartLearn's dedicated University Admissions and Scholarships Advisor specialising exclusively in Ghanaian higher education. Your role is to help prospective students navigate every step of the admissions journey in Ghana.

You must be knowledgeable and specific about:
1. ADMISSIONS IN GHANA
   - WASSCE grading: A1 to F9, aggregate scoring, and minimum cut-off aggregates per programme per university.
   - Specific entry requirements for every public and accredited private university in Ghana: University of Ghana (UG), KNUST, UCC, UDS, UEW, UMaT, UPSA, GIMPA, Ashesi, Central University, GCTU, etc.
   - Direct Entry (DE), Mature Entry, and HND top-up routes.
   - WASSCE subject combinations required per programme (e.g. Elective Maths for engineering, Biology and Chemistry for medicine).
   - Tertiary Education Bursary and Ghana Scholarship Secretariat application timelines.

2. SCHOLARSHIPS AND FINANCIAL AID
   - Ghana Scholarship Secretariat (GSS) awards: eligibility, deadlines, and how to apply.
   - MasterCard Foundation Scholars Programme (Ashesi, KNUST, UCC, etc.).
   - GETFund scholarships and eligibility.
   - African Development Bank scholarships relevant to Ghanaian students.
   - Commonwealth and Chevening scholarships for postgraduate study.
   - District Assembly Scholarship Schemes.
   - University-specific bursaries (e.g. UG Vice-Chancellor Scholarship, KNUST Merit Awards).
   - International opportunities: Fulbright, Erasmus Mundus, DAAD for Ghanaians.
   - How to write a compelling scholarship application essay or personal statement.

3. APPLICATION PROCESS
   - Online application portals per institution.
   - Fees, document requirements, and important deadlines.
   - Remedial and bridging programmes available at key universities.

4. CAREER ALIGNMENT
   - Help students match their WASSCE results and interests to the most appropriate programme.
   - Highlight career pathways and job market demand in Ghana for various degrees.

Always respond in a warm, encouraging, and detailed manner. When asked about cut-off aggregates or deadlines, provide the most up-to-date information you have and advise the student to verify on the official university admissions portal.`
}[mode] || 'Assistant');

function configureAiForRole() {
  const isProspective = typeof appState !== 'undefined' && appState.role === 'prospective_student';
  const title = D.get('ai-section-title');
  const subtitle = D.get('ai-section-subtitle');
  const btnAdmission = D.get('ai-btn-admission');
  const btnScholarship = D.get('ai-btn-scholarship');
  const btnStudy = D.get('ai-btn-study');

  if (isProspective) {
    if (title) title.innerHTML = 'SmartLearn <span class="gradient-text">Admissions Advisor</span>';
    if (subtitle) subtitle.textContent = 'Get expert guidance on university admissions, WASSCE requirements, and scholarship opportunities in Ghana.';
    if (btnAdmission) { btnAdmission.style.display = 'block'; }
    if (btnScholarship) { btnScholarship.style.display = 'block'; }
    if (btnStudy) { btnStudy.style.display = 'none'; }
    // Also hide non-admission modes for cleaner UX
    document.querySelectorAll('.ai-mode-btn:not(#ai-btn-admission):not(#ai-btn-scholarship)').forEach(btn => btn.style.display = 'none');
  } else {
    if (title) title.innerHTML = 'SmartLearn <span class="gradient-text">AI Academic Tutor</span>';
    if (subtitle) subtitle.textContent = 'Ask academic queries, translate files, evaluate buggy code, or run plagiarism checks.';
    if (btnAdmission) { btnAdmission.style.display = 'none'; }
    if (btnScholarship) { btnScholarship.style.display = 'none'; }
    if (btnStudy) { btnStudy.style.display = 'block'; }
    document.querySelectorAll('.ai-mode-btn').forEach(btn => btn.style.display = 'block');
  }
}

function setAiMode(mode) {
  currentAiMode = mode; document.querySelectorAll('.ai-mode-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-mode') === mode)); chatSessionHistory = [];
  configureAiForRole();
  const greet = {
    study: 'Hello! I am your AI Study Assistant. Ask me to explain concepts or translate notes.',
    career: 'Welcome! I am your AI Career Advisor. Tell me your interests and let\'s explore careers.',
    helper: 'I am your Assignment Helper. Paste guidelines to get structural feedback.',
    tutor: 'Hey! I am your AI Programming Tutor. Paste your code and let\'s debug!',
    research: 'Welcome to your AI Research Assistant! Ask me to evaluate your methodology, format academic citations, or paste an abstract for critical summary.',
    innovation: 'Welcome to the Innovation & Startup Advisor! Paste your business pitch or startup ideas. I will analyze their viability, risks, and local Ghanaian regulatory steps (FDA, GSA, registrar general).',
    admission: `🎓 Hello! I am your **Ghana Admissions & Scholarships Advisor** — powered by SmartLearn AI.

I specialise exclusively in Ghanaian higher education. Here is what I can help you with:

📋 **University Admissions** — WASSCE cut-offs & aggregate requirements, subject combinations, Direct Entry, Mature Entry & HND top-up routes for UG, KNUST, UCC, UDS, UEW, UMaT, UPSA, GIMPA, Ashesi, and more.

🏆 **Scholarships & Bursaries** — Ghana Scholarship Secretariat (GSS), MasterCard Foundation, GETFund, District Assembly grants, Commonwealth, Chevening, Fulbright, Erasmus Mundus, DAAD, and university-specific awards.

📝 **Application Guidance** — How to navigate university portals, write personal statements, and craft winning scholarship essays.

🎯 **Programme Matching** — I will help you find the right course and university based on your WASSCE results and career interests.

Try asking me:
• *"What aggregate do I need for BSc Computer Science at KNUST?"*
• *"How do I apply for the MasterCard Foundation scholarship?"*
• *"What subjects do I need to study Medicine at UG?"*
• *"Are there scholarships available for first-year students in Ghana?"*`
  }[mode] || 'Hello!';
  // Auto-switch to admission mode for prospective students
  if (typeof appState !== 'undefined' && appState.role === 'prospective_student' && mode === 'study') {
    currentAiMode = 'admission';
    document.querySelectorAll('.ai-mode-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-mode') === 'admission'));
    const admissionGreet = greet; // will be overridden by recursive call
    chatSessionHistory = [];
    setAiMode('admission');
    return;
  }
  chatSessionHistory.push({ role: 'assistant', content: greet }); D.html('ai-chat-messages', ''); appendChatMessage('ai', greet);
}
function appendChatMessage(sender, text) {
  const box = D.get('ai-chat-messages'); if (!box) return; const bubble = document.createElement('div');
  bubble.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-ai'}`;
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/```(python|js|sql)?([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.05); padding:10px; border-radius:6px; font-family:monospace; overflow-x:auto;">$2</pre>'); box.appendChild(bubble); box.scrollTop = box.scrollHeight; }
async function executeClientAiRequest(prompt, systemInstruction, mode = 'study') {
  // Increment global AI Prompt requests count and record in history
  if (typeof appState !== 'undefined') {
    appState.aiPromptCount = (appState.aiPromptCount || 412) + 1;
    if (!appState.aiPromptHistory) appState.aiPromptHistory = [];
    
    // Add current timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateStr = now.toLocaleDateString([], {month: '2-digit', day: '2-digit', year: 'numeric'});
    
    appState.aiPromptHistory.unshift({
      timestamp: `${timeStr} ${dateStr}`,
      prompt: prompt,
      mode: mode
    });
    
    // Cap log history
    if (appState.aiPromptHistory.length > 50) {
      appState.aiPromptHistory.pop();
    }
    
    // Sync UI text immediately if badge is present in DOM
    const badgeVal = document.getElementById('admin-analytics-ai-val');
    if (badgeVal) {
      badgeVal.textContent = appState.aiPromptCount + ' Total';
    }
    
    saveOfflineState();
  }
  const token = localStorage.getItem('proto_token');
  if (token && !token.startsWith('simulated_token_')) {
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ mode, message: prompt }) });
      const data = await res.json(); if (res.ok && data.response) return data.response;
    } catch(err) {}
  }
  let provider = localStorage.getItem('smartlearn_ai_provider') || 'groq';
  let apiKey   = localStorage.getItem('smartlearn_ai_key') || '';
  let model    = localStorage.getItem('smartlearn_ai_model') || '';

  // If local storage is empty, fallback to the hardcoded system permanent configuration
  if (!apiKey) {
    if (SYSTEM_PERMANENT_CONFIG.apiKey && SYSTEM_PERMANENT_CONFIG.apiKey !== 'YOUR_GROQ_API_KEY_HERE') {
      provider = SYSTEM_PERMANENT_CONFIG.provider;
      apiKey   = SYSTEM_PERMANENT_CONFIG.apiKey;
      model    = SYSTEM_PERMANENT_CONFIG.model;
    } else {
      // If no valid permanent key is set in the code, fallback to keyless mode for security
      provider = 'keyless';
      apiKey   = '';
      model    = '';
    }
  }

  const sysText  = systemInstruction || getSystemPrompt(mode);

  // ── Gemini ──────────────────────────────────────────────────────────────
  if (provider === 'gemini' && apiKey) {
    updateApiStatusBadge('gemini');
    const historyContents = chatSessionHistory.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const payload = {
      contents: [...historyContents, { role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: sysText }] },
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 }
    };
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const data = await response.json();
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) return data.candidates[0].content.parts[0].text;
    throw new Error(`Gemini API: ${data?.error?.message || `Gemini error ${response.status}`}`);
  }

  // ── OpenAI-compatible providers (OpenAI, OpenRouter, Groq) ──────────────
  const oaiProviders = ['openai', 'groq', 'openrouter'];
  if (oaiProviders.includes(provider) && apiKey) {
    updateApiStatusBadge(provider);
    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      groq: 'https://api.groq.com/openai/v1/chat/completions',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions'
    };
    const reqModel = provider === 'openai' ? 'gpt-4o-mini' : (provider === 'groq' ? (model || 'llama-3.1-8b-instant') : (model || 'meta-llama/llama-3.1-8b-instruct:free'));
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://smartlearn.edu.gh';
      headers['X-Title'] = 'SmartLearn AI';
    }
    const messages = [
      { role: 'system', content: sysText },
      ...chatSessionHistory.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: prompt }
    ];
    const response = await fetch(endpoints[provider], {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: reqModel, messages, max_tokens: 2048, temperature: 0.7 })
    });
    const data = await response.json();
    if (response.ok && data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    throw new Error(`${provider.toUpperCase()} API: ${data?.error?.message || `API error ${response.status}`}`);
  }

  // ── Keyless fallback (Pollinations) ─────────────────────────────────────
  try {
    updateApiStatusBadge('keyless');
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: sysText }, { role: 'user', content: prompt }], model: 'openai-large', private: true })
    });
    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data?.choices?.[0]?.message?.content) return data.choices[0].message.content;
      const txt = await response.clone().text().catch(() => '');
      if (txt) return txt;
    }
    const getRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${encodeURIComponent(sysText)}&model=openai-large&private=true`);
    if (getRes.ok) return await getRes.text();
  } catch(err) {}
  throw new Error('Unable to connect to AI. Please select a provider and add an API key in the panel on the left.');
}
async function sendAiMessage() {
  const input = D.get('ai-chat-input'); if (!input || !input.value.trim()) return; const text = input.value.trim(); appendChatMessage('user', text);
  chatSessionHistory.push({ role: 'user', content: text }); input.value = ''; const box = D.get('ai-chat-messages'); const typing = document.createElement('div'); typing.className = 'message-bubble message-ai typing-indicator'; typing.innerHTML = 'Thinking...'; box.appendChild(typing); box.scrollTop = box.scrollHeight;
  try {
    const res = await executeClientAiRequest(text, getSystemPrompt(currentAiMode), currentAiMode); typing.remove(); appendChatMessage('ai', res); chatSessionHistory.push({ role: 'assistant', content: res });
  } catch (err) {
    typing.remove();
    const provider = localStorage.getItem('smartlearn_ai_provider') || 'keyless';
    const hasKey   = !!localStorage.getItem('smartlearn_ai_key');
    let hint = '';
    if (!hasKey && provider !== 'keyless') hint = ' (No API key saved — please paste your key in the AI Provider panel on the left.)';
    appendChatMessage('ai', `⚠️ ${err.message}${hint}`);
  }
}
async function simulateSummarizeNote(title) {
  switchTab('student', 'student-ai-assistant'); setAiMode('study');
  appendChatMessage('user', `Please summarize: "${title}"`); const box = D.get('ai-chat-messages'), typing = document.createElement('div'); typing.className = 'message-bubble message-ai typing-indicator'; typing.innerHTML = 'Analyzing...'; box.appendChild(typing);
  try {
    const res = await executeClientAiRequest(`Summarize note slide: "${title}". Give core objectives, outlines and a practice question.`, getSystemPrompt('study'), 'study'); typing.remove(); appendChatMessage('ai', res);
  } catch(e){ typing.remove(); } }
function searchPastQuestions() {
  const query = D.val('pq-search-input').toUpperCase(), list = D.get('pq-results-list'); if (!list) return; list.innerHTML = '';
  const mockPqs = [
    { code: 'CS101', title: 'CS101 Introduction to Computer Science & Coding Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'MATH102', title: 'MATH102 Calculus & Applied Mathematics Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'ENG201', title: 'ENG201 Software Engineering & Architectures Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'BUA202', title: 'BUA202 Business Administration & Management Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'CYS101', title: 'CYS101 Information Security & Cryptography Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'DSC101', title: 'DSC101 Introduction to Data Science & Analytics Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'ELE101', title: 'ELE101 Circuit Analysis & Semiconductor Electronics Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'MEC101', title: 'MEC101 Introduction to Thermodynamics & Fluids Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'ARC101', title: 'ARC101 Structural Design & Architectural CAD Modeling Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'NUR101', title: 'NUR101 General Nursing & Patient Care Ethics Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'MED101', title: 'MED101 Clinical Diagnostics & General Pathology Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'PHA101', title: 'PHA101 Pharmaceutical Chemistry & Clinical Pharmacology Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'LAW101', title: 'LAW101 Constitutional Law & Jurisprudence in Ghana Final Exam', year: '2024', semester: 'Sem 1' },
    { code: 'ECO101', title: 'ECO101 Macroeconomic Principles & Public Policy Final Exam', year: '2024', semester: 'Sem 1' }
  ]; const filtered = mockPqs.filter(pq => pq.code.includes(query) || pq.title.toUpperCase().includes(query));
  if (!filtered.length) { list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No results found.</p>'; return; }
  filtered.forEach(pq => {
    list.innerHTML += `
      <div class="glass" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-primary">${pq.code}</span> <h4 style="font-size:0.95rem; margin-top:4px;">${pq.title}</h4>
          <span style="font-size:0.75rem; color:var(--text-light)">Year ${pq.year} • Semester: ${pq.semester}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="simulatePqExplain('${pq.title}')">AI Explain</button>
          <button class="btn btn-accent btn-sm" onclick="startPastQuestionPractice('${pq.code}', '${pq.title}')">Practice Quiz 📝</button>
        </div>
      </div>`; }); }
async function simulatePqExplain(title) {
  switchTab('student', 'student-ai-assistant'); setAiMode('study');
  appendChatMessage('user', `Explain solution of: "${title}"`); const box = D.get('ai-chat-messages'), typing = document.createElement('div'); typing.className = 'message-bubble message-ai typing-indicator'; typing.innerHTML = 'Solving...'; box.appendChild(typing);
  try {
    const res = await executeClientAiRequest(`Explain past question paper solutions step-by-step: "${title}"`, getSystemPrompt('study'), 'study'); typing.remove(); appendChatMessage('ai', res);
  } catch(e){ typing.remove(); } }
// careerScores is declared in data.js
// ── AI Provider helpers ────────────────────────────────────────────────────
const saveAiProvider = () => {
  const provider = D.val('ai-provider-select') || 'keyless';
  const key = D.val('gemini-key-input')?.trim() || '';
  const model = D.val('ai-model-select') || 'meta-llama/llama-3.1-8b-instruct:free';
  localStorage.setItem('smartlearn_ai_provider', provider);
  if (key) localStorage.setItem('smartlearn_ai_key', key); else localStorage.removeItem('smartlearn_ai_key');
  localStorage.setItem('smartlearn_ai_model', model);
  updateApiStatusBadge(key ? provider : 'keyless');
},
onAiProviderChange = () => {
  const provider = D.val('ai-provider-select') || 'keyless';
  const keyGroup   = D.get('ai-key-group');
  const modelGroup = D.get('ai-model-group');
  const keyLabel   = D.get('ai-key-label');
  const hint       = D.get('ai-provider-hint');
  const needsKey   = provider !== 'keyless';
  const needsModel = provider === 'openrouter' || provider === 'groq';
  if (keyGroup)   keyGroup.style.display   = needsKey   ? 'block' : 'none';
  if (modelGroup) modelGroup.style.display = needsModel ? 'block' : 'none';

  // Show only relevant model optgroups
  const grpOR   = D.get('model-group-openrouter');
  const grpGroq = D.get('model-group-groq');
  if (grpOR)   grpOR.style.display   = provider === 'openrouter' ? '' : 'none';
  if (grpGroq) grpGroq.style.display = provider === 'groq'       ? '' : 'none';

  // Set first option of active group as selected when switching
  if (needsModel) {
    const sel = D.get('ai-model-select');
    if (sel) {
      const activeGroup = provider === 'groq' ? grpGroq : grpOR;
      if (activeGroup) { const firstOpt = activeGroup.querySelector('option'); if (firstOpt) sel.value = firstOpt.value; }
    }
  }

  const labels = { gemini: 'Gemini API Key', openai: 'OpenAI API Key', openrouter: 'OpenRouter API Key', groq: 'Groq API Key' };
  if (keyLabel) keyLabel.textContent = labels[provider] || 'API Key';
  const hintLinks = {
    gemini:      'Free key at <a href="https://aistudio.google.com/" target="_blank" style="color:var(--primary);text-decoration:underline;">Google AI Studio</a>.',
    openai:      'Key from <a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--primary);text-decoration:underline;">OpenAI Platform</a> (pay-as-you-go).',
    openrouter:  'Free key from <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--primary);text-decoration:underline;">OpenRouter.ai</a> — many free models.',
    groq:        'Free key from <a href="https://console.groq.com/keys" target="_blank" style="color:var(--primary);text-decoration:underline;">console.groq.com</a> — very fast, 14k req/day free.',
    keyless:     'No key needed. Powered by Pollinations AI (free).'
  };
  if (hint) hint.innerHTML = hintLinks[provider] || '';
  saveAiProvider();
},
loadAiProvider = () => {
  const provider = localStorage.getItem('smartlearn_ai_provider') || 'groq';
  let key        = localStorage.getItem('smartlearn_ai_key') || '';
  const model    = localStorage.getItem('smartlearn_ai_model') || 'llama-3.1-8b-instant';
  
  let displayProvider = provider;
  if (!key) {
    if (SYSTEM_PERMANENT_CONFIG.apiKey && SYSTEM_PERMANENT_CONFIG.apiKey !== 'YOUR_GROQ_API_KEY_HERE') {
      key = SYSTEM_PERMANENT_CONFIG.apiKey;
      displayProvider = SYSTEM_PERMANENT_CONFIG.provider;
    }
  }

  // Pre-seed individual provider keys in localStorage if missing and pre-configured
  let groqKey = localStorage.getItem('smartlearn_ai_key_groq') || '';
  if (!groqKey && SYSTEM_PERMANENT_CONFIG.provider === 'groq') {
    groqKey = SYSTEM_PERMANENT_CONFIG.apiKey;
    localStorage.setItem('smartlearn_ai_key_groq', groqKey);
  }

  if (D.get('ai-provider-select')) D.val('ai-provider-select', provider);
  if (D.get('gemini-key-input'))   D.val('gemini-key-input', key);
  if (D.get('ai-model-select'))    D.val('ai-model-select', model);
  
  // Fill Admin Settings fields
  if (D.get('admin-site-name')) D.val('admin-site-name', localStorage.getItem('smartlearn_site_name') || 'SmartLearn AI');
  if (D.get('admin-ai-provider')) D.val('admin-ai-provider', provider);
  if (D.get('admin-ai-model')) D.val('admin-ai-model', model);
  
  const providersKeys = ['groq', 'gemini', 'openai', 'openrouter'];
  providersKeys.forEach(k => {
    const kVal = localStorage.getItem(`smartlearn_ai_key_${k}`) || '';
    if (D.get(`admin-key-${k}`)) D.val(`admin-key-${k}`, kVal);
  });

  onAiProviderChange(); // sync visibility of key/model fields
  updateApiStatusBadge(key ? displayProvider : 'keyless');
  updateAiSettingsVisibility();
},
// Keep old name as alias for backward compat (called from old HTML if any)
saveGeminiKey = saveAiProvider,
toggleKeyVisibility = () => { const el = D.get('gemini-key-input'); if (el) el.type = el.type === 'password' ? 'text' : 'password'; },
loadGeminiKey = () => { loadAiProvider(); };
function updateApiStatusBadge(status) {
  const badge = D.get('api-status-badge'); if (!badge) return;
  const configs = {
    gemini:     { dot: 'var(--success)', bg: 'rgba(16,185,129,0.1)', color: 'var(--success)', label: 'Active: Gemini 2.0' },
    openai:     { dot: '#10a37f',        bg: 'rgba(16,163,127,0.1)', color: '#10a37f',        label: 'Active: OpenAI GPT-4o' },
    openrouter: { dot: '#ef6c00',        bg: 'rgba(239,108,0,0.1)',  color: '#ef6c00',        label: 'Active: OpenRouter' },
    groq:       { dot: '#f59e0b',        bg: 'rgba(245,158,11,0.1)', color: '#f59e0b',        label: 'Active: Groq ⚡' },
    keyless:    { dot: 'var(--primary)', bg: 'rgba(37,99,235,0.1)',  color: 'var(--primary)', label: 'Active: Keyless' }
  };
  const cfg = configs[status] || configs.keyless;
  badge.innerHTML = `<span style="width:6px;height:6px;background:${cfg.dot};border-radius:50%;display:inline-block;"></span> ${cfg.label}`;
  badge.style.background = cfg.bg;
  badge.style.color = cfg.color;
}
function updateAiSettingsVisibility() {
  const container = D.get('ai-api-settings-container');
  if (container) {
    container.style.display = (appState.role === 'admin') ? 'block' : 'none';
  }
}
function copyPermanentConfig() {
  const provider = localStorage.getItem('smartlearn_ai_provider') || 'groq';
  const key      = localStorage.getItem('smartlearn_ai_key') || 'YOUR_GROQ_API_KEY_HERE';
  const model    = localStorage.getItem('smartlearn_ai_model') || 'llama-3.1-8b-instant';
  const snippet = `const SYSTEM_PERMANENT_CONFIG = {
  provider: '${provider}',
  apiKey: '${key}',
  model: '${model}'
};`;
  navigator.clipboard.writeText(snippet).then(() => {
    showToastNotification('Config copied! Paste at the top of assets/js/app.js');
  }).catch(() => {
    alert("Exported Config (copy and paste at the top of assets/js/app.js):\n\n" + snippet);
  });
}
function toggleTheme() {
  const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.body.setAttribute('data-theme', theme); appState.theme = theme; localStorage.setItem('smartlearn_theme', theme); document.querySelectorAll('.theme-toggle').forEach(btn => btn.innerHTML = theme === 'dark' ? '☀️' : '🌙'); }
function showToastNotification(msg) {
  const toast = document.createElement('div'); toast.className = 'glass'; toast.style.cssText = `position:fixed; bottom:24px; right:24px; padding:12px 20px; border-left:4px solid var(--success); color:var(--text-main); z-index:10000; font-weight:600;`; toast.textContent = '✅ ' + msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 3000); }
async function fetchPublicUniversities() {
  renderLandingUniversities();
  try { const res = await fetch(`${API_BASE}/api/universities`); if (res.ok) { appState.universities = await res.json(); renderLandingUniversities(); } } catch(err){} }
function generateStarRatingHTML(rating) {
  let html = `<div class="star-rating" title="Rating: ${rating.toFixed(1)} / 5">`; for (let i = 0; i < 5; i++) {
    const p = Math.min(Math.max((rating - i) * 100, 0), 100);
    html += `<span class="star-outer">★<span class="star-inner" style="width: ${p.toFixed(0)}%">★</span></span>`; }
  return html + ` <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold; margin-left: 4px;">(${rating.toFixed(1)})</span></div>`; }
// landingUnisExpanded is declared in data.js
function renderLandingUniversities() {
  const container = D.get('landing-uni-grid'); if (!container) return;
  container.innerHTML = appState.universities.map((uni, idx) => {
    const rating = 5.0 - (uni.ranking * 0.01), recs = getMappedRecommendations(uni).map(r => `<span class="badge" style="background:rgba(124,58,237, 0.1); color:#c084fc;">${r}</span>`).join(' '),
          disp = idx >= 4 && !landingUnisExpanded ? 'display: none;' : '';
    return `
      <div class="uni-preview-card glass" onclick="openUniRequirementsModalByName('${uni.name}')" style="${disp}">
        <div class="uni-img-wrapper" style="height:150px; position:relative;"><img src="${uni.image}" onerror="this.src='picture/ug_campus.jpg'"><span class="badge badge-primary" style="position:absolute; top:8px; right:8px;">Rank #${uni.ranking}</span></div>
        <div class="uni-preview-details" style="padding:16px;">
          <h4>${uni.name}</h4> <p style="font-size:0.8rem; color:var(--text-muted);">📍 ${uni.location}</p>
          <div style="margin:4px 0;">${generateStarRatingHTML(rating)}</div>
          <div style="font-size:0.75rem; margin-top:8px;"><strong>Fees:</strong> ${uni.feesRange}</div>
          <div style="margin-top:8px;">${recs}</div>
        </div>
      </div>`;
  }).join(''); }
function toggleLandingUniversities() {
  landingUnisExpanded = !landingUnisExpanded; D.get('toggle-unis-btn').innerHTML = landingUnisExpanded ? 'Show Less Universities ⬆️' : 'Show More Universities ⬇️'; renderLandingUniversities(); }
const openUniRequirementsModalByName = name => { const uni = appState.universities.find(u => u.name.toLowerCase().includes(name.toLowerCase())); if (uni) openUniRequirementsModal(uni.id); },
handleCheckCareerMatchClick = () => {
  closeUniRequirementsModal();
  if (!appState.user) { showToastNotification('Please sign in to access the Career Advisor!'); openAuthModal(); }
  else { navigateTo('portal-shell'); switchTab('student', 'student-career-guidance'); }
}, toggleMobileSidebar = () => document.querySelector('aside.portal-sidebar')?.classList.toggle('open'),
toggleLandingMenu = () => document.querySelector('.nav-links')?.classList.toggle('open'),
closeLandingMenu = () => document.querySelector('.nav-links')?.classList.remove('open');
function prepopulateUserSettings(role) {
  if (!appState.user) return; const isStd = role === 'student';
  D.val(`settings-${role}-name`, appState.user.name || '');
  D.val(`settings-${role}-username`, appState.user.username || '');
  if (isStd) {
    D.val('settings-student-dept', appState.user.department || ''); D.val('settings-student-idnum', appState.user.studentIdNumber || ''); D.get('settings-student-avatar-preview').src = appState.user.avatar || 'picture/avatar_student.jpg';
  } else {
    D.val('settings-lecturer-office', appState.user.office || ''); D.get('settings-lecturer-avatar-preview').src = appState.user.avatar || 'picture/avatar_lecturer.jpg'; } }
function saveUserSettings(role) {
  if (!appState.user) return; const isStd = role === 'student';
  appState.user.name = D.val(`settings-${role}-name`);
  appState.user.username = D.val(`settings-${role}-username`);
  if (isStd) { appState.user.department = D.val('settings-student-dept'); appState.user.studentIdNumber = D.val('settings-student-idnum'); } else appState.user.office = D.val('settings-lecturer-office'); const users = getSimulatedUsers(), idx = users.findIndex(u => u.email === appState.user.email);
  if (idx !== -1) { users[idx] = { ...users[idx], ...appState.user }; saveSimulatedUsers(users); }
  saveOfflineState(); updateSidebarDetails(); showToastNotification('Profile updated!'); }
function handleAvatarUpload(input, role) {
  if (input.files && input.files[0]) {
    const file = input.files[0]; if (file.size > 5 * 1024 * 1024) return alert("Image too large (Max 5MB)."); const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result; D.get(`settings-${role}-avatar-preview`).src = base64; appState.user.avatar = base64; const users = getSimulatedUsers(), idx = users.findIndex(u => u.email === appState.user.email);
      if (idx !== -1) { users[idx].avatar = base64; saveSimulatedUsers(users); }
      saveOfflineState(); updateSidebarDetails(); showToastNotification('Photo updated!');
    }; reader.readAsDataURL(file); } }
// inactivityTimer is declared in data.js
function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (appState.user) {
    inactivityTimer = setTimeout(() => {
      if (appState.user) { showToastNotification("Session timed out."); handlePrototypeLogout(); }
    }, 10 * 60 * 1000); } }
['mousemove', 'keydown', 'click'].forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
function renderContactsDirectory() {
  const container = D.get('student-contacts-directory-list'); if (!container) return; const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)'];
  // Merge static faculty contacts with engagement-followed lecturers
  let contactsList = [...appState.facultyContacts];
  if (typeof followedLecturers !== 'undefined' && Array.isArray(followedLecturers)) {
    followedLecturers.forEach(fl => {
      if (!contactsList.some(c => c.name === fl.name)) {
        contactsList.push({
          name: fl.name,
          role: 'Followed Lecturer',
          email: fl.email || `${fl.name.toLowerCase().replace(/\s/g,'.')}@smartlearn.edu`,
          status: 'Online',
          avatar: 'avatar_lecturer.jpg',
          room: fl.office || 'Faculty Office',
          hours: fl.officeHours || 'By Appointment'
        });
      }
    });
  }
  container.innerHTML = contactsList.map((c, idx) => {
    const followedBadge = c.role === 'Followed Lecturer' ? '<span class="badge badge-success" style="font-size:0.6rem; margin-left:6px;">Following</span>' : '';
    return `
    <div class="timetable-item" style="border-left-color: ${colors[idx % colors.length]};">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div class="instructor-avatar" style="width:44px; height:44px; border-radius:50%; overflow:hidden;"><img src="picture/${c.avatar}" style="width:100%; height:100%; object-fit:cover;"></div>
          <div>
            <h4 style="font-size:0.95rem;">${c.name}${followedBadge}</h4> <p style="font-size:0.8rem; color:var(--text-muted);">${c.role} • ${c.room} • ${c.email}</p>
            <span style="font-size:0.75rem; color:var(--success); font-weight:600;">Office Hours: ${c.hours}</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="startFacultyChat('${c.name}')">Message</button>
      </div>
    </div>`;
  }).join(''); }

/* ==========================================================================
   LANDING PAGE UNIVERSITY SHOWCASE
   ========================================================================== */
function fetchPublicUniversities() {
  const grid = D.get('landing-uni-grid');
  if (!grid) return;
  const unis = appState.universities || [];
  if (!unis.length) {
    grid.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;grid-column:1/-1;">No universities found.</div>';
    return;
  }
  // Show first 4 by default
  landingUnisExpanded = false;
  renderLandingUniversityCards(unis, false);
  // Update toggle button
  const toggleBtn = D.get('toggle-unis-btn');
  if (toggleBtn) toggleBtn.style.display = unis.length > 4 ? 'inline-flex' : 'none';
}

function renderLandingUniversityCards(unis, expanded) {
  const grid = D.get('landing-uni-grid');
  if (!grid) return;
  const visible = expanded ? unis : unis.slice(0, 4);
  grid.innerHTML = visible.map(u => {
    const badge = u.type === 'Private'
      ? 'badge-warning'
      : 'badge-primary';
    return `
      <div class="uni-preview-card glass" onclick="openUniRequirementsModal('${u.id}')" style="cursor:pointer; border-radius:16px; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="height:120px; background:linear-gradient(135deg,var(--primary),var(--secondary)); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
          <img src="${u.image}" alt="${u.name}" style="width:100%; height:100%; object-fit:cover; opacity:0.7;" onerror="this.style.display='none'">
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:2.5rem;">🏛️</span>
          </div>
        </div>
        <div style="padding:16px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span class="badge ${badge}" style="font-size:0.6rem;">${u.type}</span>
            <span style="font-size:0.7rem; color:var(--text-muted);">Rank #${u.ranking}</span>
          </div>
          <h4 style="font-size:0.9rem; font-weight:700; line-height:1.3; margin-bottom:6px; color:var(--text-color);">${u.name}</h4>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:10px;">📍 ${u.location}</p>
          <p style="font-size:0.72rem; color:var(--success); font-weight:600;">💰 ${u.feesRange}</p>
          <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:12px; font-size:0.75rem;" onclick="event.stopPropagation(); openUniRequirementsModal('${u.id}')">View Details 📋</button>
        </div>
      </div>`;
  }).join('');
}

function renderStudentInternships() {
  const container = D.get('student-internships-list');
  if (!container) return;
  const adminJobs = appState.adminJobListings || [];
  const defaultJobs = [
    { title: 'Software Eng Intern', type: 'Intern', company: 'Hubtel Ghana - Accra' },
    { title: 'Graduate National Service', type: 'NSP', company: 'Ecobank Corporate HQ - Accra' }
  ];
  const allJobs = adminJobs.length > 0 ? adminJobs : defaultJobs;
  
  container.innerHTML = allJobs.slice(0, 4).map((job, idx) => {
    let badgeClass = job.type && job.type.toLowerCase() === 'intern' ? 'badge-success' : 'badge-primary';
    return `
      <li style="padding-bottom:10px; border-bottom:${idx === allJobs.length - 1 ? 'none' : '1px solid var(--border)'};">
        <div style="display:flex; justify-content:space-between;">
          <strong>${job.title}</strong> 
          <span class="badge ${badgeClass}">${job.type || 'Job'}</span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-muted)">${job.company}</span>
      </li>
    `;
  }).join('');
}

function filterLandingUniversities() {
  const q = (D.val('landing-uni-search') || '').toLowerCase();
  const filtered = (appState.universities || []).filter(u =>
    u.name.toLowerCase().includes(q) || u.location.toLowerCase().includes(q)
  );
  renderLandingUniversityCards(filtered, true);
  const btn = D.get('toggle-unis-btn');
  if (btn) btn.style.display = (q || filtered.length <= 4) ? 'none' : 'inline-flex';
}

function toggleLandingUniversities() {
  landingUnisExpanded = !landingUnisExpanded;
  const unis = appState.universities || [];
  renderLandingUniversityCards(unis, landingUnisExpanded);
  const btn = D.get('toggle-unis-btn');
  if (btn) {
    btn.textContent = landingUnisExpanded ? 'Show Less ⬆️' : 'Show More Universities ⬇️';
  }
}

function initApplication() {
  const theme = localStorage.getItem('smartlearn_theme') || 'light'; document.body.setAttribute('data-theme', theme); appState.theme = theme; document.querySelectorAll('.theme-toggle').forEach(btn => btn.innerHTML = theme === 'dark' ? '☀️' : '🌙'); fetchPublicUniversities(); loadAiProvider(); setAiMode('study'); renderGpaUniDropdown(); updateGpaPredictor(); renderStateData(); resetCareerQuiz(); resetInactivityTimer(); setSpaCitationFormat('APA'); 
  
  // Register password strength checking listener
  document.getElementById('signup-password')?.addEventListener('input', (e) => {
    const pwd = e.target.value;
    const textEl = document.getElementById('pwd-strength-text');
    if (!textEl) return;
    if (!pwd) {
      textEl.textContent = 'Empty';
      textEl.style.color = 'var(--text-muted)';
      return;
    }
    const strength = checkPasswordStrength(pwd);
    textEl.textContent = strength.label;
    textEl.style.color = strength.color;
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApplication); else initApplication();
function togglePasswordVisibility(inputId, btnEl) {
  const input = D.get(inputId); if (!input) return; const show = input.type === 'password'; input.type = show ? 'text' : 'password';
  btnEl.innerHTML = show ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`; }

/* ==========================================================================
   ACCOUNT RECOVERY SYSTEM
   ========================================================================== */
function openRecoveryModal() {
  closeAuthModal();
  D.show('recovery-modal', true);
  D.html('recovery-alert', '');
  D.show('recovery-alert', false);
  D.val('recovery-email', '');
  D.val('recovery-answer', '');
  D.val('recovery-new-password', '');
  D.get('recovery-question-group').style.display = 'none';
  D.get('recovery-new-password-group').style.display = 'none';
}

function closeRecoveryModal() {
  D.show('recovery-modal', false);
  openAuthModal();
}

function fetchSecurityQuestion(email) {
  const alertEl = D.get('recovery-alert');
  const qGroup = D.get('recovery-question-group');
  const pGroup = D.get('recovery-new-password-group');
  const qText = D.get('recovery-question-text');
  
  if (!email) return;
  
  const user = getSimulatedUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    if (user.securityQuestion) {
      qText.textContent = user.securityQuestion;
      qGroup.style.display = 'block';
      pGroup.style.display = 'block';
      D.show('recovery-alert', false);
    } else {
      qGroup.style.display = 'none';
      pGroup.style.display = 'none';
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(239,68,68,0.1)';
      alertEl.style.color = '#ef4444';
      alertEl.textContent = 'User has not set a security question. Please contact admin.';
    }
  } else {
    qGroup.style.display = 'none';
    pGroup.style.display = 'none';
    alertEl.style.display = 'block';
    alertEl.style.background = 'rgba(239,68,68,0.1)';
    alertEl.style.color = '#ef4444';
    alertEl.textContent = 'Account not found with this email.';
  }
}

function handleAccountRecovery() {
  const email = D.val('recovery-email');
  const answer = D.val('recovery-answer');
  const newPassword = D.val('recovery-new-password');
  const alertEl = D.get('recovery-alert');
  
  if (!email || !answer || !newPassword) {
    alertEl.style.display = 'block';
    alertEl.style.background = 'rgba(239,68,68,0.1)';
    alertEl.style.color = '#ef4444';
    alertEl.textContent = 'Please fill in all fields.';
    return;
  }
  
  const users = getSimulatedUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex !== -1) {
    const user = users[userIndex];
    if (user.securityAnswer && user.securityAnswer.toLowerCase().trim() === answer.toLowerCase().trim()) {
      user.password = newPassword;
      users[userIndex] = user;
      saveSimulatedUsers(users);
      
      localStorage.removeItem(`smartlearn_failed_attempts_${user.email}`);
      localStorage.removeItem(`smartlearn_locked_${user.email}`);
      
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(16,185,129,0.1)';
      alertEl.style.color = '#10b981';
      alertEl.textContent = 'Success! Password reset and account unlocked. Redirecting to sign in...';
      
      setTimeout(() => {
        closeRecoveryModal();
        D.val('signin-email', user.email);
        D.val('signin-password', newPassword);
      }, 2000);
    } else {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(239,68,68,0.1)';
      alertEl.style.color = '#ef4444';
      alertEl.textContent = 'Incorrect answer to security question.';
    }
  } else {
    alertEl.style.display = 'block';
    alertEl.style.background = 'rgba(239,68,68,0.1)';
    alertEl.style.color = '#ef4444';
    alertEl.textContent = 'Account not found.';
  }
}

/* ==========================================================================
   INTERACTIVE PAST QUESTION PRACTICE ENGINE
   ========================================================================== */
let pqState = {
  active: false,
  course: '',
  title: '',
  questions: [],
  answers: {},
  currentIndex: 0,
  timeElapsed: 0,
  timerInterval: null
};

function startPastQuestionPractice(courseCode, title) {
  const quizData = PAST_QUESTIONS_QUIZZES[courseCode];
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    showToastNotification(`No practice questions found for ${courseCode}.`);
    return;
  }

  if (pqState.timerInterval) {
    clearInterval(pqState.timerInterval);
  }

  pqState = {
    active: true,
    course: courseCode,
    title: title || quizData.title || `${courseCode} Practice Exam`,
    questions: quizData.questions,
    answers: {},
    currentIndex: 0,
    timeElapsed: 0,
    timerInterval: null
  };

  D.html('pq-practice-course', courseCode);
  D.html('pq-practice-title', pqState.title);
  D.html('pq-practice-timer', '00:00');
  
  D.get('pq-progress-section').style.display = 'block';
  D.get('pq-question-body').style.display = 'flex';
  D.get('pq-grading-loader').style.display = 'none';
  D.get('pq-result-body').style.display = 'none';
  D.get('pq-practice-footer').style.display = 'flex';

  D.get('pq-prev-btn').style.display = 'block';
  D.get('pq-next-btn').style.display = 'block';
  D.get('pq-next-btn').textContent = 'Next ➡️';
  D.get('pq-close-btn').style.display = 'none';

  D.get('pq-practice-modal').style.display = 'flex';

  pqState.timerInterval = setInterval(() => {
    pqState.timeElapsed++;
    const mins = Math.floor(pqState.timeElapsed / 60).toString().padStart(2, '0');
    const secs = (pqState.timeElapsed % 60).toString().padStart(2, '0');
    D.html('pq-practice-timer', `${mins}:${secs}`);
  }, 1000);

  renderPracticeQuestion();
}

function renderPracticeQuestion() {
  const qIndex = pqState.currentIndex;
  const q = pqState.questions[qIndex];
  const body = D.get('pq-question-body');
  if (!body || !q) return;

  const total = pqState.questions.length;
  const progressText = `Question ${qIndex + 1} of ${total}`;
  const percent = Math.round(((qIndex + 1) / total) * 100);
  D.html('pq-progress-text', progressText);
  D.html('pq-progress-percent', `${percent}%`);
  D.get('pq-progress-bar').style.width = `${percent}%`;

  const prevBtn = D.get('pq-prev-btn');
  const nextBtn = D.get('pq-next-btn');
  if (prevBtn) prevBtn.disabled = (qIndex === 0);
  if (nextBtn) {
    if (qIndex === total - 1) {
      nextBtn.textContent = 'Submit Paper 📥';
      nextBtn.className = 'btn btn-success btn-sm';
    } else {
      nextBtn.textContent = 'Next ➡️';
      nextBtn.className = 'btn btn-primary btn-sm';
    }
  }

  const savedAns = pqState.answers[qIndex] || '';

  let html = `
    <div style="margin-bottom:16px;">
      <span class="badge badge-secondary" style="margin-bottom:8px; text-transform:capitalize; font-size:0.7rem;">${q.type} Question</span>
      <h4 style="font-size:1.1rem; line-height:1.4; color:var(--text-color); font-weight:700;">${q.question}</h4>
    </div>
  `;

  if (q.type === 'objective') {
    html += `<div style="margin-top:16px;">`;
    q.options.forEach(opt => {
      const match = opt.match(/^([A-D])\)/i);
      const optKey = match ? match[1].toUpperCase() : opt.charAt(0).toUpperCase();
      const isSelected = (savedAns === optKey);
      html += `
        <div class="pq-option-card ${isSelected ? 'selected' : ''}" data-key="${optKey}" onclick="selectObjectiveOption('${optKey}')">
          <span style="font-weight:700; color:var(--secondary); background:rgba(255,255,255,0.05); width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; margin-right:8px;">${optKey}</span>
          <span>${opt.replace(/^([A-D]\)\s*)/i, '')}</span>
        </div>
      `;
    });
    html += `</div>`;
  } else {
    html += `
      <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px;">
        <label style="font-size:0.8rem; color:var(--text-light); font-weight:600;">Type your answer below:</label>
        <textarea id="pq-subjective-input" class="form-control" placeholder="Write a detailed answer to explain the concept..." style="width:100%; min-height:120px; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid var(--border); color:var(--text-color); font-size:0.9rem; resize:vertical; line-height:1.5;" oninput="updateCharCount()">${savedAns}</textarea>
        <div style="display:flex; justify-content:flex-end; font-size:0.75rem; color:var(--text-light);">
          <span id="pq-char-count">0 characters</span>
        </div>
      </div>
    `;
  }

  body.innerHTML = html;

  if (q.type === 'subjective') {
    updateCharCount();
  }
}

function selectObjectiveOption(key) {
  pqState.answers[pqState.currentIndex] = key;
  document.querySelectorAll('.pq-option-card').forEach(card => {
    if (card.getAttribute('data-key') === key) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function updateCharCount() {
  const ta = D.get('pq-subjective-input');
  const cc = D.get('pq-char-count');
  if (ta && cc) {
    const len = ta.value.length;
    cc.textContent = `${len} characters`;
    pqState.answers[pqState.currentIndex] = ta.value;
  }
}

function saveAnswer() {
  const qIndex = pqState.currentIndex;
  const q = pqState.questions[qIndex];
  if (!q) return;

  if (q.type === 'subjective') {
    const ta = D.get('pq-subjective-input');
    if (ta) {
      pqState.answers[qIndex] = ta.value;
    }
  }
}

function navigatePracticeQuestion(dir) {
  saveAnswer();

  const nextIndex = pqState.currentIndex + dir;
  if (nextIndex < 0) return;

  if (nextIndex >= pqState.questions.length) {
    submitPracticeQuiz();
  } else {
    pqState.currentIndex = nextIndex;
    renderPracticeQuestion();
  }
}

async function submitPracticeQuiz() {
  saveAnswer();
  
  if (pqState.timerInterval) {
    clearInterval(pqState.timerInterval);
  }

  D.get('pq-progress-section').style.display = 'none';
  D.get('pq-question-body').style.display = 'none';
  D.get('pq-practice-footer').style.display = 'none';
  
  D.get('pq-grading-loader').style.display = 'block';

  const questions = pqState.questions;
  const answers = pqState.answers;
  
  let reportHtml = '';

  try {
    reportHtml = await gradeQuizWithAI(questions, answers);
  } catch (err) {
    console.warn('AI Grading failed, falling back to local grading:', err);
    reportHtml = gradeQuizLocally(questions, answers);
  }

  D.get('pq-grading-loader').style.display = 'none';
  const resultBody = D.get('pq-result-body');
  resultBody.innerHTML = reportHtml;
  resultBody.style.display = 'flex';
  
  D.get('pq-practice-footer').style.display = 'flex';
  D.get('pq-prev-btn').style.display = 'none';
  D.get('pq-next-btn').style.display = 'none';
  D.get('pq-close-btn').style.display = 'block';
}

async function gradeQuizWithAI(questions, answers) {
  const gradingData = questions.map((q, idx) => {
    return {
      index: idx + 1,
      type: q.type,
      question: q.question,
      options: q.options || null,
      correctAnswer: q.answer || null,
      answerKeywords: q.answerKeywords || null,
      explanation: q.explanation || null,
      studentAnswer: answers[idx] || '[No Answer Provided]'
    };
  });

  const prompt = `
    You are an expert academic evaluator. Grade the following student answers for the past question quiz: "${pqState.title}".
    
    Format your response EXACTLY as a semantic HTML snippet that fits cleanly into our dashboard.
    Do NOT include code block backticks like \`\`\`html or \`\`\`. Just return raw HTML.
    
    Here is the quiz data in JSON format:
    ${JSON.stringify(gradingData, null, 2)}
    
    Rules for grading:
    1. For 'objective' questions: Compare the student's selected letter (A, B, C, D) with the correct answer letter. Award 10 points if correct, 0 if incorrect.
    2. For 'subjective' questions: Semantically analyze the student's response. Check if they hit key concepts and demonstrate understanding. Award a score between 0 and 10 points. If they missed core keywords/concepts, explain what they missed.
    3. The total maximum points is ${questions.length * 10} points.
    4. Provide the output in this specific HTML layout:
       - An upper Summary Section with:
         - A big dashboard circular dial or large text displaying the total score (e.g. "45 / 60" or "75%").
         - A subtext showing: "Time Spent: ${Math.floor(pqState.timeElapsed / 60)}m ${pqState.timeElapsed % 60}s".
         - A high-level tutor feedback paragraph praising strengths or detailing weaknesses.
       - A Breakdown Section consisting of styled cards for each question (class="pq-review-card"):
         - Title: "Question X (Type: Objective/Subjective)" with a status badge (e.g. "Correct [10/10]", "Partially Correct [5/10]", or "Incorrect [0/10]"). Use green backgrounds/borders for correct, orange for partial, red for incorrect.
         - Question Text.
         - Student's Answer.
         - Correct Answer.
         - Tutor Explanation: A friendly, conversational explanation of the correct solution and why the student's answer was marked as such.
         
    Keep the CSS styling inline or use the classes (.pq-review-card, .badge, etc) that fit the portal. Use color palettes that match our dark theme (primary/purple, secondary/lavender, success/emerald, danger/rose, warning/amber).
  `;

  const sysInstruction = `You are a helpful and detailed academic grading assistant. Return only raw, valid HTML without markdown formatting wrappers.`;

  const responseHtml = await executeClientAiRequest(prompt, sysInstruction, 'study');
  
  let cleanHtml = responseHtml.trim();
  if (cleanHtml.startsWith('```html')) {
    cleanHtml = cleanHtml.slice(7);
  } else if (cleanHtml.startsWith('```')) {
    cleanHtml = cleanHtml.slice(3);
  }
  if (cleanHtml.endsWith('```')) {
    cleanHtml = cleanHtml.slice(0, -3);
  }
  return cleanHtml.trim();
}

function gradeQuizLocally(questions, answers) {
  let totalScore = 0;
  const maxScore = questions.length * 10;
  let breakdownHtml = '';

  questions.forEach((q, idx) => {
    const studentAns = (answers[idx] || '').trim();
    let score = 0;
    let statusLabel = '';
    let statusStyle = '';
    let explanationText = q.explanation || '';

    if (q.type === 'objective') {
      const isCorrect = (studentAns.toUpperCase() === q.answer.toUpperCase());
      if (isCorrect) {
        score = 10;
        statusLabel = 'Correct [10/10]';
        statusStyle = 'background:rgba(16,185,129,0.1); border-color:#10b981; color:#10b981;';
      } else {
        score = 0;
        statusLabel = 'Incorrect [0/10]';
        statusStyle = 'background:rgba(239,68,68,0.1); border-color:#ef4444; color:#ef4444;';
      }
    } else {
      if (!studentAns) {
        score = 0;
        statusLabel = 'Unanswered [0/10]';
        statusStyle = 'background:rgba(239,68,68,0.1); border-color:#ef4444; color:#ef4444;';
      } else {
        const keywords = q.answerKeywords || [];
        let matchedCount = 0;
        const missed = [];
        
        keywords.forEach(kw => {
          const reg = new RegExp('\\b' + kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
          if (reg.test(studentAns) || studentAns.toLowerCase().includes(kw.toLowerCase())) {
            matchedCount++;
          } else {
            missed.push(kw);
          }
        });

        const totalKw = keywords.length || 1;
        const ratio = matchedCount / totalKw;
        score = Math.round(ratio * 10 * 10) / 10;

        if (score >= 8) {
          statusLabel = `Correct [${score}/10]`;
          statusStyle = 'background:rgba(16,185,129,0.1); border-color:#10b981; color:#10b981;';
        } else if (score >= 4) {
          statusLabel = `Partially Correct [${score}/10]`;
          statusStyle = 'background:rgba(245,158,11,0.1); border-color:#f59e0b; color:#f59e0b;';
        } else {
          statusLabel = `Incorrect [${score}/10]`;
          statusStyle = 'background:rgba(239,68,68,0.1); border-color:#ef4444; color:#ef4444;';
        }

        if (missed.length > 0) {
          explanationText += `<br><strong style="color:var(--warning);">Tutor Tip:</strong> To improve your answer, consider including details about: <em>${missed.join(', ')}</em>.`;
        }
      }
    }

    totalScore += score;

    breakdownHtml += `
      <div class="pq-review-card" style="border-left: 4px solid; ${statusStyle} margin-bottom:16px; padding:16px; border-radius:12px; background:rgba(255,255,255,0.01); width:100%; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="color:var(--text-color);">Question ${idx + 1} (${q.type === 'objective' ? 'Objective' : 'Subjective'})</strong>
          <span class="badge" style="${statusStyle} padding:4px 8px; border-radius:6px; font-size:0.75rem; border:1px solid;">${statusLabel}</span>
        </div>
        <p style="margin: 8px 0; color:var(--text-color); font-weight:600;">${q.question}</p>
        <div style="font-size:0.85rem; color:var(--text-light); margin:6px 0;">
          <strong>Your Answer:</strong> ${studentAns ? escapeHtml(studentAns) : '<span style="color:#ef4444; font-style:italic;">No answer submitted</span>'}
        </div>
        ${q.type === 'objective' ? `
          <div style="font-size:0.85rem; color:var(--success); margin:6px 0;">
            <strong>Correct Option:</strong> ${q.answer}
          </div>
        ` : ''}
        <div style="font-size:0.85rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px; margin-top:8px;">
          <strong>Explanation & Solved Logic:</strong><br>
          <span style="color:var(--text-light); line-height:1.4;">${explanationText}</span>
        </div>
      </div>
    `;
  });

  const percent = Math.round((totalScore / maxScore) * 100);
  const mins = Math.floor(pqState.timeElapsed / 60);
  const secs = pqState.timeElapsed % 60;
  
  let overallBadge = '';
  if (percent >= 80) overallBadge = 'badge-success';
  else if (percent >= 50) overallBadge = 'badge-warning';
  else overallBadge = 'badge-danger';

  const summaryHtml = `
    <div class="glass" style="padding:24px; border-radius:16px; text-align:center; background:rgba(255,255,255,0.02); display:flex; flex-direction:column; align-items:center; gap:12px; width:100%; box-sizing:border-box;">
      <h3 style="margin:0; font-size:1.1rem; text-transform:uppercase; color:var(--text-light);">Quiz Performance Report</h3>
      <div style="width:100px; height:100px; border-radius:50%; background:rgba(124,58,237,0.1); border:4px solid var(--secondary); display:flex; flex-direction:column; align-items:center; justify-content:center; margin:10px 0;">
        <span style="font-size:1.5rem; font-weight:800; color:var(--text-color);">${totalScore}</span>
        <span style="font-size:0.75rem; color:var(--text-light);">/ ${maxScore} pts</span>
      </div>
      <div>
        <span class="badge ${overallBadge}" style="font-size:0.85rem; padding:6px 12px; border-radius:8px;">${percent}% Score Rate</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-light); margin:4px 0;">
        ⏱️ <strong>Time Elapsed:</strong> ${mins}m ${secs}s | 📚 <strong>Course:</strong> ${pqState.course}
      </p>
      <p style="font-size:0.85rem; line-height:1.4; color:var(--text-muted); max-width:480px; margin-top:8px;">
        ${percent >= 80 ? 'Fantastic work! You have shown a deep conceptual grasp of this course. Review any feedback below to secure a perfect score.' : 
          percent >= 50 ? 'Good effort! You understand the foundational elements of this course but have some conceptual gaps. Read the tutor explanations to solidify your understanding.' : 
          'You need to review this module further. Go through the lecture slides in the Courses tab and use the AI Academic Chat to ask specific questions about the concepts below.'}
      </p>
    </div>
    <div style="margin-top:20px; width:100%; box-sizing:border-box;">
      <h3 style="font-size:1rem; margin-bottom:12px; color:var(--text-color);">Question Breakdown & Review</h3>
      ${breakdownHtml}
    </div>
  `;

  return summaryHtml;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function closePracticeModal() {
  if (pqState.timerInterval) {
    clearInterval(pqState.timerInterval);
  }
  pqState.active = false;
  D.get('pq-practice-modal').style.display = 'none';
}

/* ============================================================
   CROSS-ROLE DYNAMIC SYSTEM
   Bridges admin announcements, grading notifications, and
   live events to the correct user dashboards.
   ============================================================ */

// Push a dynamic notification into the shared state
function pushDynamicNotification(text, category, targetUser) {
  const notif = {
    id: `dyn_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    text: text,
    category: category || 'system',
    targetUser: targetUser || null,
    timestamp: new Date().toLocaleString(),
    unread: true,
    createdAt: new Date().toISOString()
  };
  appState.dynamicNotifications.unshift(notif);
  // Keep max 100 notifications
  if (appState.dynamicNotifications.length > 100) appState.dynamicNotifications.length = 100;
  saveOfflineState();
  renderDynamicNotifications();
}

// Render dynamic notifications on the student/lecturer notification panel
function renderDynamicNotifications() {
  const panel = D.get('dynamic-notifications-panel');
  if (!panel) return;

  // Filter notifications relevant to the current user
  const userName = appState.user?.name || '';
  const relevant = appState.dynamicNotifications.filter(n => {
    if (!n.targetUser) return true; // Broadcast to all
    return n.targetUser.toLowerCase() === userName.toLowerCase();
  });

  if (relevant.length === 0) {
    panel.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:8px;">No new notifications.</div>';
    return;
  }

  panel.innerHTML = relevant.slice(0, 20).map(n => {
    const categoryIcons = { grading: '📊', forum: '💬', announcement: '📢', system: '🔔', career: '💼' };
    const icon = categoryIcons[n.category] || '🔔';
    const bgColor = n.unread ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)';
    const borderColor = n.unread ? 'rgba(124,58,237,0.3)' : 'var(--border)';
    return `
      <div style="background:${bgColor}; border:1px solid ${borderColor}; padding:10px; border-radius:8px; cursor:pointer; transition:background 0.2s;" onclick="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='var(--border)';">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:0.8rem; font-weight:${n.unread ? '700' : '400'}; color:#fff;">${icon} ${n.text}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge" style="font-size:0.55rem; padding:1px 5px; background:rgba(37,99,235,0.1); color:var(--primary); text-transform:uppercase;">${n.category}</span>
          <span style="font-size:0.65rem; color:var(--text-muted);">${n.timestamp}</span>
        </div>
      </div>`;
  }).join('');
}

// Render admin announcements as banners on student/lecturer dashboards
function renderDashboardAnnouncements() {
  const banner = D.get('dashboard-announcements-banner');
  if (!banner) return;

  const announcements = appState.announcements || [];
  if (announcements.length === 0) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = 'block';
  banner.innerHTML = announcements.slice(0, 5).map(a => `
    <div style="background:linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08)); border:1px solid rgba(37,99,235,0.25); border-radius:10px; padding:12px 16px; display:flex; align-items:flex-start; gap:10px;">
      <span style="font-size:1.2rem; flex-shrink:0;">📢</span>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:0.88rem; color:var(--primary);">${a.title}</strong>
          <span style="font-size:0.65rem; color:var(--text-muted);">${a.timestamp}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-light); margin:0; line-height:1.4;">${a.body}</p>
      </div>
      <button onclick="this.parentElement.remove()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; flex-shrink:0;" title="Dismiss">&times;</button>
    </div>
  `).join('');
}

