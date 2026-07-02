/* ============================================================
   SMARTLEARN AI — CREATIVITY & GAMIFICATION MODULE
   Badges, onboarding, progress rings, leaderboard, quick actions.
   ============================================================ */

/* ============================================================
   ACHIEVEMENT BADGE SYSTEM
   ============================================================ */
const BADGE_DEFINITIONS = [
  { id: 'first_login',    icon: '🎉', name: 'First Login',       desc: 'Welcome to SmartLearn AI!',                trigger: 'login' },
  { id: 'first_submit',  icon: '📤', name: 'First Submission',   desc: 'Submitted your first assignment.',         trigger: 'submit' },
  { id: 'forum_post',    icon: '💬', name: 'Community Voice',    desc: 'Posted your first forum thread.',           trigger: 'forum' },
  { id: 'quiz_complete', icon: '🎯', name: 'Career Mapped',      desc: 'Completed the Career Interest Quiz.',       trigger: 'quiz' },
  { id: 'research_start',icon: '🔬', name: 'Research Pioneer',   desc: 'Performed your first research search.',     trigger: 'research' },
  { id: 'gpa_predict',   icon: '📊', name: 'GPA Analyst',        desc: 'Used the GPA Predictor tool.',              trigger: 'gpa' },
  { id: 'ai_chat',       icon: '🤖', name: 'AI Enthusiast',      desc: 'Had your first AI tutor conversation.',     trigger: 'ai_chat' },
  { id: 'streak_3',      icon: '🔥', name: 'On Fire!',           desc: 'Logged in 3 days in a row.',               trigger: 'streak' },
  { id: 'dark_mode',     icon: '🌙', name: 'Night Owl',          desc: 'Switched to Dark Mode.',                   trigger: 'theme' },
  { id: 'plagiarism_run',icon: '🛡️', name: 'Integrity Guardian', desc: 'Ran your first plagiarism check.',         trigger: 'plagiarism' },
];

function getEarnedBadges() {
  try { return JSON.parse(localStorage.getItem('smartlearn_badges') || '[]'); }
  catch { return []; }
}

function earnBadge(triggerId) {
  const badge = BADGE_DEFINITIONS.find(b => b.trigger === triggerId);
  if (!badge) return;
  const earned = getEarnedBadges();
  if (earned.includes(badge.id)) return; // already earned
  earned.push(badge.id);
  localStorage.setItem('smartlearn_badges', JSON.stringify(earned));
  showBadgeUnlockModal(badge);
}

function showBadgeUnlockModal(badge) {
  const modal = D.get('badge-unlock-modal');
  const icon = D.get('badge-unlock-icon');
  const name = D.get('badge-unlock-name');
  const desc = D.get('badge-unlock-desc');
  if (!modal) return;
  if (icon) icon.textContent = badge.icon;
  if (name) name.textContent = badge.name;
  if (desc) desc.textContent = badge.desc;
  modal.style.display = 'flex';
  setTimeout(() => { if (modal) modal.style.display = 'none'; }, 4000);
}

function closeBadgeModal() {
  const modal = D.get('badge-unlock-modal');
  if (modal) modal.style.display = 'none';
}

function renderBadgesPanel(containerId) {
  const container = D.get(containerId);
  if (!container) return;
  const earned = getEarnedBadges();
  container.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      ${BADGE_DEFINITIONS.map(b => {
        const isEarned = earned.includes(b.id);
        return `
          <div title="${b.name}: ${b.desc}" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px;border-radius:10px;background:${isEarned?'rgba(124,58,237,0.12)':'rgba(0,0,0,0.08)'};opacity:${isEarned?1:0.4};min-width:70px;text-align:center;cursor:${isEarned?'default':'help'};">
            <span style="font-size:1.8rem;">${b.icon}</span>
            <span style="font-size:0.62rem;font-weight:600;color:${isEarned?'var(--primary)':'var(--text-muted)'};">${b.name}</span>
            ${isEarned?'<span style="font-size:0.55rem;color:#10b981;">✓ Earned</span>':''}
          </div>`;
      }).join('')}
    </div>`;
}


/* ============================================================
   DAILY LOGIN STREAK
   ============================================================ */
function updateLoginStreak() {
  try {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('sl_last_login');
    let streak = parseInt(localStorage.getItem('sl_login_streak') || '0');

    if (lastLogin === today) return streak;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streak = lastLogin === yesterday ? streak + 1 : 1;

    localStorage.setItem('sl_last_login', today);
    localStorage.setItem('sl_login_streak', String(streak));

    if (streak >= 3) earnBadge('streak');
    return streak;
  } catch { return 1; }
}

function renderStreakCounter(containerId) {
  const container = D.get(containerId);
  if (!container) return;
  const streak = updateLoginStreak();
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);border-radius:10px;cursor:default;" title="Daily login streak">
      <span style="font-size:1.1rem;">🔥</span>
      <div>
        <div style="font-size:0.9rem;font-weight:800;color:#f59e0b;">${streak} Day${streak!==1?'s':''}</div>
        <div style="font-size:0.6rem;color:var(--text-muted);">Login Streak</div>
      </div>
    </div>`;
}


/* ============================================================
   PROGRESS RINGS (SVG)
   ============================================================ */
function createProgressRing(pct, color, size, label) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <svg width="${size}" height="${size}" style="transform:rotate(-90deg);">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="7"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="7"
          stroke-dasharray="${circ}" stroke-dashoffset="${dash}"
          stroke-linecap="round" style="transition:stroke-dashoffset 1.2s ease;"/>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
          style="fill:var(--text-color);font-size:${Math.round(size*0.18)}px;font-weight:800;transform:rotate(90deg);transform-origin:center;">${pct}%</text>
      </svg>
      <span style="font-size:0.7rem;color:var(--text-muted);text-align:center;">${label}</span>
    </div>`;
}

function renderProgressRings(containerId) {
  const container = D.get(containerId);
  if (!container) return;
  const user = appState.user;
  const cgpa = user ? parseFloat(user.cgpa || 3.82) : 3.82;
  const cgpaPct = Math.round((cgpa / 4.0) * 100);
  container.innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
      ${createProgressRing(cgpaPct, 'var(--primary)', 90, 'GPA Score')}
      ${createProgressRing(95, '#10b981', 90, 'Attendance')}
      ${createProgressRing(71, '#f59e0b', 90, 'Assignments')}
      ${createProgressRing(60, '#6366f1', 90, 'AI Chats')}
    </div>`;
}


/* ============================================================
   CLASS LEADERBOARD
   ============================================================ */
function renderLeaderboard(containerId) {
  const container = D.get(containerId);
  if (!container) return;
  const students = (appState.students || []).sort((a,b) => b.cgpa - a.cgpa);
  const medals = ['🥇','🥈','🥉'];
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${students.slice(0,8).map((s, idx) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:${idx<3?'rgba(124,58,237,0.1)':'rgba(0,0,0,0.05)'};border:${idx===0?'1px solid rgba(124,58,237,0.3)':'1px solid transparent'};">
          <span style="font-size:1.1rem;min-width:24px;text-align:center;">${medals[idx]||`${idx+1}`}</span>
          <div style="flex:1;">
            <strong style="font-size:0.85rem;">${s.name}</strong>
            <p style="font-size:0.72rem;color:var(--text-muted);">${s.department}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1rem;font-weight:800;color:${idx===0?'#f59e0b':idx===1?'#9ca3af':idx===2?'#b45309':'var(--text-muted)'};">${s.cgpa}</div>
            <div style="font-size:0.6rem;color:var(--text-muted);">CGPA</div>
          </div>
        </div>`).join('')}
    </div>`;
}


/* ============================================================
   PERSONALIZED GREETING
   ============================================================ */
function getTimeGreeting(name) {
  const h = new Date().getHours();
  const emoji = h < 12 ? '☀️' : h < 17 ? '🌤️' : '🌙';
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${emoji} ${greeting}, ${name || 'there'}!`;
}

function updatePersonalizedGreeting() {
  const el = D.get('personalized-greeting');
  if (!el) return;
  const name = appState.user ? appState.user.name.split(' ')[0] : 'Student';
  el.textContent = getTimeGreeting(name);
}


/* ============================================================
   FLOATING AI QUICK ACTIONS BUTTON
   ============================================================ */
function renderQuickActionsBtn() {
  if (D.get('quick-actions-fab')) return; // Already rendered
  const fab = document.createElement('div');
  fab.id = 'quick-actions-fab';
  fab.innerHTML = `
    <button id="fab-main-btn" onclick="toggleQuickActions()" title="Quick Actions" style="
      position:fixed;bottom:28px;right:28px;z-index:9998;
      width:52px;height:52px;border-radius:50%;
      background:linear-gradient(135deg,var(--primary),var(--secondary));
      border:none;cursor:pointer;font-size:1.3rem;color:#fff;
      box-shadow:0 8px 24px rgba(124,58,237,0.45);
      display:flex;align-items:center;justify-content:center;
      transition:transform 0.2s, box-shadow 0.2s;
    " onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 12px 32px rgba(124,58,237,0.55)'"
       onmouseout="this.style.transform='';this.style.boxShadow='0 8px 24px rgba(124,58,237,0.45)'">⚡</button>
    <div id="quick-actions-panel" style="
      display:none;position:fixed;bottom:92px;right:28px;z-index:9997;
      background:var(--bg-surface);border:1px solid var(--border);border-radius:16px;
      padding:12px;min-width:220px;box-shadow:0 16px 40px rgba(0,0,0,0.25);
      animation:tooltipFadeIn 0.2s ease;
    ">
      <div style="font-size:0.7rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;padding:4px 8px 10px;border-bottom:1px solid var(--border);margin-bottom:8px;">Quick Actions</div>
      ${[
        ['🤖','Open AI Tutor', "switchTab('student','student-ai-assistant'); earnBadge('ai_chat'); toggleQuickActions();"],
        ['📤','Submit Assignment', "switchTab('student','student-assignments'); earnBadge('submit'); toggleQuickActions();"],
        ['🔍','Check Plagiarism', "openQuickPlagiarism(); toggleQuickActions();"],
        ['📚','Search Research', "switchTab('student','student-research'); earnBadge('research'); toggleQuickActions();"],
        ['🎯','Career Quiz', "switchTab('student','student-career-guidance'); earnBadge('quiz'); toggleQuickActions();"],
        ['💬','Open Forum', "switchTab('student','student-forum'); earnBadge('forum_post'); toggleQuickActions();"],
      ].map(([icon,label,action]) => `
        <button onclick="${action}" style="
          display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;
          border:none;border-radius:8px;background:none;cursor:pointer;
          font-size:0.82rem;color:var(--text-main);text-align:left;
          transition:background 0.15s;
        " onmouseover="this.style.background='rgba(124,58,237,0.1)'"
           onmouseout="this.style.background='none'">
          <span>${icon}</span><span>${label}</span>
        </button>`).join('')}
    </div>`;
  document.body.appendChild(fab);
}

function toggleQuickActions() {
  const panel = D.get('quick-actions-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function openQuickPlagiarism() {
  const modal = D.get('plagiarism-upload-modal');
  if (!modal) { showToastNotification('Required modal elements are missing.'); return; }
  modal.style.display = 'flex';
  
  // Reset fields
  D.get('plag-text-input').value = '';
  D.get('plag-file-input').value = '';
  D.get('plag-drop-zone').querySelector('div:nth-child(2)').innerText = 'Drag & Drop File Here';
  D.get('plag-upload-progress').style.display = 'none';
}

function closePlagiarismUploadModal() {
  const modal = D.get('plagiarism-upload-modal');
  if (modal) modal.style.display = 'none';
}

// Close quick actions when clicking outside
document.addEventListener('click', (e) => {
  const panel = D.get('quick-actions-panel');
  const btn = D.get('fab-main-btn');
  if (panel && panel.style.display !== 'none' && !panel.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
    panel.style.display = 'none';
  }
});


/* ============================================================
   ONBOARDING TOUR
   ============================================================ */
const ONBOARDING_STEPS = [
  { target: 'student-dashboard', title: '📊 Your Dashboard', text: 'This is your command center. Monitor your CGPA, attendance, and upcoming deadlines at a glance.' },
  { target: 'student-ai-assistant', title: '🤖 AI Academic Tutor', text: 'Ask anything — study questions, career advice, code debugging, assignment help. Powered by real AI models.' },
  { target: 'student-career-guidance', title: '🎯 Career & University Finder', text: 'Take our personalized quiz to discover your ideal career path and matched Ghanaian universities.' },
  { target: 'student-research', title: '🔬 AI Research Portal', text: 'Search global academic databases, analyze methodology gaps, and generate formatted citations automatically.' },
  { target: 'student-assignments', title: '📤 Assignment Submissions', text: 'Submit assignments with automatic plagiarism checking, deadline countdowns, and instructor feedback.' },
];

let onboardingStep = 0;

function startOnboardingTour() {
  const overlay = D.get('onboarding-overlay');
  if (!overlay) return;
  onboardingStep = 0;
  overlay.style.display = 'flex';
  showOnboardingStep(0);
  localStorage.setItem('sl_onboarded', '1');
}

function showOnboardingStep(step) {
  const s = ONBOARDING_STEPS[step];
  if (!s) { endOnboardingTour(); return; }
  const title = D.get('onboarding-title');
  const text = D.get('onboarding-text');
  const counter = D.get('onboarding-counter');
  const nextBtn = D.get('onboarding-next-btn');
  if (title) title.textContent = s.title;
  if (text) text.textContent = s.text;
  if (counter) counter.textContent = `${step + 1} / ${ONBOARDING_STEPS.length}`;
  if (nextBtn) nextBtn.textContent = step === ONBOARDING_STEPS.length - 1 ? "Let's Start! 🚀" : 'Next →';
}

function nextOnboardingStep() {
  onboardingStep++;
  if (onboardingStep >= ONBOARDING_STEPS.length) { endOnboardingTour(); return; }
  showOnboardingStep(onboardingStep);
}

function endOnboardingTour() {
  const overlay = D.get('onboarding-overlay');
  if (overlay) overlay.style.display = 'none';
  earnBadge('first_login');
  showToastNotification('🎉 Welcome to SmartLearn AI! Your first badge has been unlocked.');
}

function checkAndStartOnboarding() {
  const done = localStorage.getItem('sl_onboarded');
  if (!done && appState.user) {
    setTimeout(startOnboardingTour, 800);
  }
}


/* ============================================================
   SMART CONTEXTUAL NOTIFICATIONS
   ============================================================ */
function renderContextualNotifications(containerId) {
  const container = D.get(containerId);
  if (!container) return;
  const user = appState.user;
  const notifications = [
    { icon: '📅', text: 'CS101 assignment due in 2 days. Don\'t forget to check for plagiarism before submission!', color: '#f59e0b', time: '2 hours ago' },
    { icon: '🤖', text: 'New AI model available! Try Llama 3.3 70B for more detailed academic responses.', color: 'var(--primary)', time: '5 hours ago' },
    { icon: '🎓', text: 'KNUST just opened admissions for MSc Computer Science. Check the Graduate section!', color: '#10b981', time: '1 day ago' },
  ];
  container.innerHTML = notifications.map(n => `
    <div style="display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:10px;background:rgba(0,0,0,0.05);border-left:3px solid ${n.color};">
      <span style="font-size:1.2rem;flex-shrink:0;">${n.icon}</span>
      <div>
        <p style="font-size:0.8rem;line-height:1.5;margin-bottom:4px;">${n.text}</p>
        <span style="font-size:0.65rem;color:var(--text-muted);">${n.time}</span>
      </div>
    </div>`).join('');
}


/* ============================================================
   CREATIVITY SHOWCASE (Landing Page Section)
   ============================================================ */
function renderCreativityShowcase() {
  const container = D.get('creativity-showcase-grid');
  if (!container) return;
  const features = [
    { icon: '🧠', title: 'AI Multi-Provider Tutor', desc: 'Switch between 5 AI providers including Groq, Gemini, OpenAI, and OpenRouter. Zero-config keyless mode included.', color: '#7c3aed' },
    { icon: '🛡️', title: 'Plagiarism Detection', desc: 'Client-side Jaccard + n-gram text similarity engine checks submissions against a real academic corpus instantly.', color: '#2563eb' },
    { icon: '🏆', title: 'Badge & Achievement System', desc: 'Unlock badges for every milestone — from your first login to research breakthroughs. Gamified learning.', color: '#f59e0b' },
    { icon: '📊', title: 'Interactive GPA Predictor', desc: 'Drag sliders and watch your projected GPA update in real-time with university-specific grade scale support.', color: '#10b981' },
    { icon: '🎓', title: '7 Role-Based Hubs', desc: 'Distinct portals for Students, Lecturers, Alumni, Researchers, Partners, Advisors, and Admins.', color: '#ef4444' },
    { icon: '🌍', title: 'Ghana-First Intelligence', desc: 'Built for Ghanaian tertiary education — local universities, WASSCE admission requirements, GH₵ salary data.', color: '#6366f1' },
  ];
  container.innerHTML = features.map((f,i) => `
    <div class="glass creativity-showcase-card" style="padding:28px;border-radius:18px;transition:transform 0.3s,box-shadow 0.3s;cursor:default;animation:cardFadeIn 0.5s ease ${i*0.1}s both;border-top:3px solid ${f.color};"
      onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div style="font-size:2.5rem;margin-bottom:14px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.2));">${f.icon}</div>
      <h3 style="font-size:1rem;font-weight:800;margin-bottom:8px;color:${f.color};">${f.title}</h3>
      <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.6;">${f.desc}</p>
    </div>`).join('');
}

/* ============================================================
   INIT
   ============================================================ */
function initCreativity() {
  // Render FAB only in portal shell
  const portal = D.get('portal-shell');
  const fab = D.get('quick-actions-fab');
  if (portal && !portal.classList.contains('hidden') && !fab) {
    renderQuickActionsBtn();
  }

  // Update personalized greeting
  updatePersonalizedGreeting();

  // Render creativity showcase on landing
  renderCreativityShowcase();

  // Render streak counter in dashboard widget area
  renderStreakCounter('streak-counter-widget');

  // Render progress rings
  renderProgressRings('progress-rings-widget');

  // Render leaderboard
  renderLeaderboard('leaderboard-widget');

  // Render badges panel
  renderBadgesPanel('badges-panel-widget');

  // Check if onboarding needed
  checkAndStartOnboarding();

  // Earn first_login badge
  earnBadge('first_login');
}

// Hook into the existing login flow
const _origSetUserRole = typeof setUserRole === 'function' ? setUserRole : null;
// Supplement: call initCreativity after portal loads
document.addEventListener('portal-loaded', () => {
  setTimeout(initCreativity, 300);
});

// Also trigger creativity on DOMContentLoaded for landing page showcase
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { renderCreativityShowcase(); });
} else {
  renderCreativityShowcase();
}
