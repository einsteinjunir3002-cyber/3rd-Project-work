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
  const isStudentRole = ['student', 'entrepreneur', 'prospective_student'].includes(appState.role) || appState.role === 'admin';
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
  document.querySelector('aside.portal-sidebar')?.classList.remove('open'); }
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
const API_BASE = 'http://localhost:5000';
// Hardcoded demo accounts — always available regardless of localStorage state
const DEMO_ACCOUNTS = [
  { id: 'user_std_1', name: 'Kofi Mensah', email: 'stu@smartlearn.com', password: 'password', role: 'student', department: 'Computing & Information Technology', program: 'BSc Computer Science', studentIdNumber: 'stu/csc/0001', phone: '+233 24 111 2222', gender: 'Male', level: '300', securityQuestion: 'What was the name of your first pet?', securityAnswer: 'Rex' },
  { id: 'user_lec_1', name: 'Dr. Kwame Mensah', email: 'lec@smartlearn.com', password: 'password', role: 'lecturer', office: 'Block C, Rm 4', securityQuestion: "What is your mother's maiden name?", securityAnswer: 'Serwaa' },
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
  const s = localStorage.getItem('smartlearn_offline_appstate');
  if (s) {
    try {
      const parsed = JSON.parse(s);
      if (parsed.courses) {
        SMARTLEARN_STATIC_DATA.courses.forEach(c => {
          if (!parsed.courses.some(pc => pc.id === c.id)) {
            parsed.courses.push(c);
          }
        });
      }
      if (parsed.notes) {
        SMARTLEARN_STATIC_DATA.notes.forEach(n => {
          if (!parsed.notes.some(pn => pn.id === n.id)) {
            parsed.notes.push(n);
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
      Object.assign(appState, parsed);
    } catch(e) {}
  }
}, saveOfflineState = () => {
  localStorage.setItem('smartlearn_offline_appstate', JSON.stringify({
    courses: appState.courses, notes: appState.notes, assignments: appState.assignments, submissions: appState.submissions, forumThreads: appState.forumThreads, universities: appState.universities, students: appState.students,
    facultyContacts: appState.facultyContacts, facultyChats: appState.facultyChats, activeFacultyEmail: appState.activeFacultyEmail, studentStartups: appState.studentStartups
  }));
}, enableOfflineDemoIndicator = enable => { isOfflineDemoMode = enable; D.show('offline-demo-indicator', enable); }; if (!localStorage.getItem('smartlearn_offline_appstate')) saveOfflineState(); else loadOfflineState();

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
  D.show('signup-entrepreneur-fields', role === 'entrepreneur');
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
      payload.avatar = 'picture/avatar_student.jpg';
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
  } else if (activeSignupRole === 'entrepreneur') {
    payload.startupName = D.val('signup-startup-name') || 'InnovateGhana';
    payload.businessIdea = D.val('signup-business-idea') || 'AgriTech Solutions';
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
        <option value="entrepreneur">💡 View: Founder Dashboard</option>
        <option value="alumni">🎓 View: Alumni Console</option>
        <option value="industry_partner">🤝 View: Partner Hub</option>
        <option value="career_advisor">🧭 View: Advisor Dashboard</option>
        <option value="prospective_student">🏫 View: Admissions Desk</option>
      </select>` : ''; }
  if (role === 'admin') setAdminPrototypeView('admin');
  else {
    const isStudentWorkspace = ['student', 'entrepreneur', 'prospective_student'].includes(role);
    const isResearcherWorkspace = role === 'researcher';
    const isLecturerWorkspace = ['lecturer', 'alumni', 'industry_partner', 'career_advisor'].includes(role);
    document.querySelectorAll('.student-only').forEach(el => el.style.display = (isStudentWorkspace ? 'flex' : 'none')); 
    document.querySelectorAll('.researcher-only').forEach(el => el.style.display = (isResearcherWorkspace ? 'flex' : 'none'));
    document.querySelectorAll('.lecturer-only').forEach(el => el.style.display = (isLecturerWorkspace ? 'flex' : 'none')); 
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none'); 
    
    customizeSidebarMenuItems(role);
    
    switchTab(isStudentWorkspace ? 'student' : (isResearcherWorkspace ? 'researcher' : 'lecturer'), isStudentWorkspace ? 'student-dashboard' : (isResearcherWorkspace ? 'researcher-dashboard' : 'lecturer-dashboard')); 
  }
  updateAiSettingsVisibility();
}
const setAdminPrototypeView = view => {
  const studentRoles = ['student', 'entrepreneur', 'prospective_student'];
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
  else if (view === 'entrepreneur') targetTab = 'student-dashboard';
  else if (view === 'prospective_student') targetTab = 'student-dashboard';

  const roleGroup = studentRoles.includes(view) ? 'student' : (researcherRoles.includes(view) ? 'researcher' : (lecturerRoles.includes(view) ? 'lecturer' : 'admin'));
  if (typeof switchTabExtended === 'function') {
    switchTabExtended(roleGroup, targetTab);
  } else {
    switchTab(roleGroup, targetTab);
  }
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
  } else if (role === 'entrepreneur') {
    avatarEl.src = appState.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${appState.user.name}`;
    roleEl.textContent = `Founder, ${appState.user.startupName || 'InnovateGhana'}`;
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
  const isStudentWorkspace = ['student', 'entrepreneur', 'prospective_student'].includes(role);
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
      if (role === 'entrepreneur') {
        visible = ['student-dashboard', 'student-innovation', 'student-forum', 'student-ai-assistant', 'student-contacts', 'student-settings'].includes(tab);
        if (tab === 'student-dashboard') el.textContent = '💡 Founder Dashboard';
      } else if (role === 'prospective_student') {
        visible = ['student-dashboard', 'student-universities', 'student-forum', 'student-ai-assistant', 'student-settings'].includes(tab);
        if (tab === 'student-dashboard') el.textContent = '🏫 Admissions Desk';
        if (tab === 'student-universities') el.textContent = '🏛️ University Explorer';
        if (tab === 'student-forum') el.textContent = '💬 Community Board';
        if (tab === 'student-ai-assistant') el.textContent = '🤖 Admission Advisor';
      } else {
        if (tab === 'student-dashboard') el.textContent = '📊 Dashboard Overview';
      }
      el.style.display = visible ? 'block' : 'none';
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
        if (tab === 'lecturer-dashboard') el.textContent = '🎓 Alumni Console';
      } else if (role === 'industry_partner') {
        visible = ['lecturer-dashboard', 'lecturer-settings'].includes(tab);
        if (tab === 'lecturer-dashboard') el.textContent = '🏢 Partner Hub';
      } else if (role === 'career_advisor') {
        visible = ['lecturer-dashboard', 'lecturer-settings'].includes(tab);
        if (tab === 'lecturer-dashboard') el.textContent = '👔 Advisor Dashboard';
      } else {
        if (tab === 'lecturer-dashboard') el.textContent = '📊 Lecturer Dashboard';
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
        if (!apiCourses.some(pc => pc.id === c.id)) {
          apiCourses.push(c);
        }
      });
      appState.courses = apiCourses;
    }
    
    const apiNotes = await getJSON(`${API_BASE}/api/courses/notes`);
    if (apiNotes) {
      SMARTLEARN_STATIC_DATA.notes.forEach(n => {
        if (!apiNotes.some(pn => pn.id === n.id)) {
          apiNotes.push(n);
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
const renderAllComponents = () => {
  renderStudentCourses(); renderStudentNotes(); renderStudentAssignments(); renderLecturerAnalytics(); renderLecturerSubmissions(); renderForums(); generateCalendarGrid(); renderDedicatedAssignmentsDeck(); renderStudentUniversities(); renderFacultyChat(); renderContactsDirectory(); renderProgramSelectionCards(); updateStudentDashboardMetrics(); renderSpaStartupsList();
  if (appState.role === 'admin' && typeof renderAdminViews === 'function') renderAdminViews();
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
  appState.facultyChats[appState.activeFacultyEmail].push({ sender: 'student', text: text, timestamp: 'Just now' }); saveOfflineState(); renderFacultyChat(); const name = appState.facultyContacts.find(c => c.email === appState.activeFacultyEmail)?.name || 'Professor';
  setTimeout(() => {
    const resText = getSimulatedFacultyResponse(name, text);
    appState.facultyChats[appState.activeFacultyEmail].push({ sender: 'faculty', text: resText, timestamp: 'Just now' }); saveOfflineState(); renderFacultyChat(); showToastNotification(`New message from ${name}`);
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
  el.innerHTML = filteredCourses.map(c => `
    <div class="course-card">
      <div class="course-banner"><span class="course-code">${c.code}</span><h3 style="font-size:1.05rem; margin-top:10px;">${c.title}</h3></div>
      <div class="course-body">
        <p>Complete introduction course mapping foundations, tests, and research guides.</p>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
          <span>📚 ${c.notesCount} Lecture Notes</span><span>📝 ${c.assignmentsCount} Assignments</span>
        </div>
      </div>
      <div class="course-footer">
        <div class="instructor-profile"><div class="instructor-avatar"><img src="picture/${c.avatar}"></div><span>${c.instructor}</span></div>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('student', 'student-contacts')">Contact</button>
      </div>
    </div>`).join('');
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
  const pending = appState.assignments.filter(a => a.status === 'Pending');
  const submitted = appState.assignments.filter(a => a.status !== 'Pending');

  const renderItem = asg => {
    const code = appState.courses.find(c => c.id === asg.courseId)?.code || 'GEN';
    let act = asg.status === 'Pending' ? `<button class="btn btn-primary btn-sm" onclick="openSubmitAssignmentModal(${asg.id}, '${asg.title}')">Submit File</button>`
      : `<div style="text-align:right;"><span style="font-weight:700; color:var(--success)">Grade: ${asg.grade || 'Awaiting'}</span></div>`;
    return `
      <div class="glass" style="padding:20px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-info" style="font-size:0.65rem; margin-bottom:6px;">${code}</span>
          <h4 style="font-size:1.05rem; margin-bottom:4px;">${asg.title}</h4>
          <span style="font-size:0.8rem; color:var(--danger)">Deadline: ${asg.deadline}</span>
        </div>
        <div>${act}</div>
      </div>`;
  };

  el.innerHTML = `
    <h3 style="margin-bottom:12px;">Pending Assignments</h3>
    ${pending.length ? pending.map(renderItem).join('') : '<p style="color:var(--text-muted);">No pending assignments.</p>'}
    <h3 style="margin-top:24px; margin-bottom:12px;">Submitted Assignments</h3>
    ${submitted.length ? submitted.map(renderItem).join('') : '<p style="color:var(--text-muted);">No submitted assignments yet.</p>'}
  `;
};
function renderLecturerAnalytics() {
  const el = D.get('lecturer-students-table-body'); if (!el) return; let total = 0;
  el.innerHTML = appState.students.map(s => {
    total += parseFloat(s.cgpa); const editing = appState.editingStudentId === s.id;
    const gpaCell = editing ? `<td><input type="number" step="0.01" value="${s.cgpa}" id="editing-gpa-val" style="width:70px;"></td>` : `<td><strong>${s.cgpa}</strong></td>`;
    const actionsCell = editing ? `<td><button class="btn btn-primary btn-sm" onclick="saveStudentGpa('${s.id}')">Save</button></td>` : `<td><button class="btn btn-secondary btn-sm" onclick="editStudentGpa('${s.id}')">Edit</button></td>`;
    return `
      <tr>
        <td><strong>${s.name}</strong></td><td>${s.courses}</td><td>${s.attendance}%</td>
        ${gpaCell}<td><span class="badge ${s.cgpa < 2 ? 'badge-danger' : 'badge-success'}">${s.status}</span></td>
        ${actionsCell}
      </tr>`;
  }).join(''); const avg = appState.students.length ? (total / appState.students.length).toFixed(2) : '0.00'; D.html('class-average-gpa-display', avg); }
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
    const asg = appState.assignments.find(a => a.id === sub.assignmentId); const gradingHtml = sub.grade ? `<span style="color:var(--success); font-weight:700;">Graded: ${sub.grade}/100</span>` : `
      <div style="display:flex; gap:8px;">
        <input type="number" id="grade-val-${sub.id}" placeholder="Grade" style="width:70px;">
        <input type="text" id="feedback-val-${sub.id}" placeholder="Feedback" style="width:150px;">
        <button class="btn btn-primary btn-sm" onclick="submitGrade(${sub.id})">Grade</button>
      </div>`;
    return `
      <div class="glass" style="padding:20px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4>Student: <strong>${sub.studentName}</strong></h4>
          <span style="font-size:0.8rem;">File: <a href="#" style="color:var(--primary);">${sub.fileName}</a></span><br>
          <span style="font-weight:600;">Assignment: ${asg ? asg.title : 'General'}</span>
        </div>
        <div>${gradingHtml}</div>
      </div>`;
  }).join(''); }
async function submitGrade(id) {
  const grade = parseFloat(D.val(`grade-val-${id}`)), fb = D.val(`feedback-val-${id}`) || 'Well done.'; if (isNaN(grade)) return showToastNotification('Please enter a grade.'); const token = localStorage.getItem('proto_token'); if (!token) return;
  if (token.startsWith('simulated_token_') || isOfflineDemoMode) {
    const sub = appState.submissions.find(s => s.id == id);
    if (sub) {
      sub.grade = grade; sub.feedback = fb; const asg = appState.assignments.find(a => a.id == sub.assignmentId);
      if (asg) { asg.grade = grade.toString(); asg.feedback = fb; asg.status = 'Submitted'; }
      saveOfflineState(); showToastNotification('Graded (Offline)!'); renderStateData(); }
    return; }
  try {
    const res = await fetch(`${API_BASE}/api/assignments/grade`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ submissionId: id, grade, feedback: fb }) });
    if (res.ok) { showToastNotification('Graded successfully!'); renderStateData(); }
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
  if (token && token.startsWith('simulated_token_')) {
    const t = appState.forumThreads.find(x => x.id == id);
    if (t) {
      t.replies.push({ author: appState.user?.name || 'Student', avatar: 'avatar_student.jpg', role: 'Student', body: input.value }); input.value = ''; saveOfflineState(); renderStateData();
    } return; }
  try {
    const res = await fetch(`${API_BASE}/api/forums/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ threadId: id, body: input.value }) });
    if (res.ok) { input.value = ''; renderStateData(); }
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
  admission: 'You are a University Admission Advisor for Ghanaian universities (e.g., KNUST, UG). Answer questions based on admission enquiries, WASSCE cut-offs, entry requirements, and provide helpful admission advice.'
}[mode] || 'Assistant');
function setAiMode(mode) {
  currentAiMode = mode; document.querySelectorAll('.ai-mode-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-mode') === mode)); chatSessionHistory = [];
  const greet = {
    study: 'Hello! I am your AI Study Assistant. Ask me to explain concepts or translate notes.', career: 'Welcome! I am your AI Career Advisor. Tell me your interests and let\'s explore careers.',
    helper: 'I am your Assignment Helper. Paste guidelines to get structural feedback.',
    tutor: 'Hey! I am your AI Programming Tutor. Paste your code and let\'s debug!',
    research: 'Welcome to your AI Research Assistant! Ask me to evaluate your methodology, format academic citations, or paste an abstract for critical summary.',
    innovation: 'Welcome to the Innovation & Startup Advisor! Paste your business pitch or startup ideas. I will analyze their viability, risks, and local Ghanaian regulatory steps (FDA, GSA, registrar general).',
    admission: 'Welcome! I am your Admissions Advisor. Ask me any questions about WASSCE cut-offs, program requirements, and general admission advice for universities in Ghana.'
  }[mode] || 'Hello!';
  chatSessionHistory.push({ role: 'assistant', content: greet }); D.html('ai-chat-messages', ''); appendChatMessage('ai', greet); }
function appendChatMessage(sender, text) {
  const box = D.get('ai-chat-messages'); if (!box) return; const bubble = document.createElement('div');
  bubble.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-ai'}`;
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/```(python|js|sql)?([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.05); padding:10px; border-radius:6px; font-family:monospace; overflow-x:auto;">$2</pre>'); box.appendChild(bubble); box.scrollTop = box.scrollHeight; }
async function executeClientAiRequest(prompt, systemInstruction, mode = 'study') {
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
    { code: 'CS101', title: 'CS101 Intro to Coding Exam (2024)', year: '2024', semester: 'Sem 1' },
    { code: 'CS101', title: 'CS101 Mid-Sem Test Questions (2023)', year: '2023', semester: 'Sem 2' },
    { code: 'MATH102', title: 'MATH102 Calculus II Final Exam (2024)', year: '2024', semester: 'Sem 1' },
    { code: 'ENG201', title: 'ENG201 Software Architectures Final (2024)', year: '2024', semester: 'Sem 1' }
  ]; const filtered = mockPqs.filter(pq => pq.code.includes(query) || pq.title.toUpperCase().includes(query));
  if (!filtered.length) { list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No results found.</p>'; return; }
  filtered.forEach(pq => {
    list.innerHTML += `
      <div class="glass" style="padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-primary">${pq.code}</span> <h4 style="font-size:0.95rem; margin-top:4px;">${pq.title}</h4>
          <span style="font-size:0.75rem; color:var(--text-light)">Year ${pq.year} • Semester: ${pq.semester}</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="simulatePqExplain('${pq.title}')">AI Explain</button>
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
    }, 5 * 60 * 1000); } }
['mousemove', 'keydown', 'click'].forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
function renderContactsDirectory() {
  const container = D.get('student-contacts-directory-list'); if (!container) return; const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)'];
  container.innerHTML = appState.facultyContacts.map((c, idx) => `
    <div class="timetable-item" style="border-left-color: ${colors[idx % colors.length]};">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div class="instructor-avatar" style="width:44px; height:44px; border-radius:50%; overflow:hidden;"><img src="picture/${c.avatar}" style="width:100%; height:100%; object-fit:cover;"></div>
          <div>
            <h4 style="font-size:0.95rem;">${c.name}</h4> <p style="font-size:0.8rem; color:var(--text-muted);">${c.role} • ${c.room} • ${c.email}</p>
            <span style="font-size:0.75rem; color:var(--success); font-weight:600;">Office Hours: ${c.hours}</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="startFacultyChat('${c.name}')">Message</button>
      </div>
    </div>`).join(''); }

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

