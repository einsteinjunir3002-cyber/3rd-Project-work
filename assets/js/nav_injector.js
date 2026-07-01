/* ============================================================
   SMARTLEARN AI — NAV INJECTOR
   Dynamically injects new sidebar navigation items for all
   expanded hubs. This avoids emoji encoding issues in HTML.
   ============================================================ */
(function injectNavItems() {
  function inject() {
    const nav = document.querySelector('.sidebar nav');
    if (!nav) { setTimeout(inject, 100); return; }

    // Check if already injected
    if (nav.querySelector('[data-tab="lecturer-plagiarism"]')) return;

    const newNavItems = [
      // Lecturer expansions
      { role: 'lecturer', tab: 'lecturer-plagiarism', icon: '\uD83D\uDEE1\uFE0F', label: 'Plagiarism Reports', title: 'View AI-powered plagiarism detection reports for all submissions', display: 'none', cls: 'lecturer-only' },
      { role: 'lecturer', tab: 'lecturer-attendance', icon: '\uD83D\uDCCB', label: 'Attendance Manager', title: 'Manage weekly student attendance records per course', display: 'none', cls: 'lecturer-only' },
      { role: 'lecturer', tab: 'lecturer-rubric', icon: '\uD83D\uDCD0', label: 'Rubric Builder', title: 'Build and publish assessment rubric templates for grading', display: 'none', cls: 'lecturer-only' },
      { role: 'lecturer', tab: 'lecturer-early-warning', icon: '\u26A0\uFE0F', label: 'Early Warning', title: 'Identify at-risk students using GPA and attendance analytics', display: 'none', cls: 'lecturer-only' },
      { role: 'lecturer', tab: 'lecturer-supervision', icon: '\uD83E\uDDD1\u200D\uD83D\uDCBC', label: 'Project Supervision', title: 'Track final year student projects and milestones', display: 'none', cls: 'lecturer-only' },
      { role: 'lecturer', tab: 'lecturer-office-hours', icon: '\uD83D\uDD50', label: 'Office Hours', title: 'Publish office hours schedule and manage student bookings', display: 'none', cls: 'lecturer-only' },
      { role: 'lecturer', tab: 'lecturer-ai-insights', icon: '\uD83D\uDCA1', label: 'AI Teaching Insights', title: 'AI-powered teaching recommendations based on class performance', display: 'none', cls: 'lecturer-only' },
      // Alumni Hub
      { role: 'alumni', tab: 'alumni-console', icon: '\uD83C\uDF93', label: 'Alumni Console', title: 'Alumni directory, mentorship, events, job board, and success stories', display: 'none', cls: 'alumni-only' },
      // Research Hub
      { role: 'researcher', tab: 'research-hub-expanded', icon: '\uD83D\uDD2C', label: 'Research Hub Pro', title: 'Kanban projects, grants, conferences, and ethics workflows', display: 'none', cls: 'researcher-only' },
      // Partner Hub
      { role: 'industry_partner', tab: 'partner-hub', icon: '\uD83C\uDFE2', label: 'Partner Hub', title: 'Manage internships, recruit graduates, and analyze skills demand', display: 'none', cls: 'partner-only' },
      // Career Advisor Dashboard
      { role: 'career_advisor', tab: 'advisor-dashboard', icon: '\uD83E\uDDED', label: 'Advisor Dashboard', title: 'Student profiles, appointments, job matching, interview prep', display: 'none', cls: 'advisor-only' },
    ];

    // Find the settings item to insert before it
    const settingsItem = nav.querySelector('[data-tab="lecturer-settings"]');

    newNavItems.forEach(item => {
      const div = document.createElement('div');
      div.className = `sidebar-nav-item ${item.cls}`;
      div.setAttribute('data-tab', item.tab);
      div.setAttribute('title', item.title);
      div.style.display = item.display;
      div.textContent = `${item.icon} ${item.label}`;
      div.addEventListener('click', () => {
        // Determine the role group for switchTab
        const roleGroup = ['lecturer','alumni','industry_partner','career_advisor'].includes(item.role) ? 'lecturer' : item.role;
        if (typeof switchTab === 'function') {
          // switchTab needs role string for access check; use actual role
          switchTabExtended(item.role, item.tab);
        }
      });

      if (settingsItem) {
        nav.insertBefore(div, settingsItem);
      } else {
        nav.appendChild(div);
      }
    });
  }

  // Extended switchTab that handles alumni/partner/advisor and all hub views including for admin
  window.switchTabExtended = function(role, tabId) {
    // Hide all portal-views (active class) and also all hub-only sections (with display:none)
    document.querySelectorAll('.portal-view').forEach(el => {
      el.classList.remove('active');
      // Don't forcibly hide display-block sections - just remove active
    });
    // Also hide hub sections that use display instead of class
    ['alumni-console', 'research-hub-expanded', 'partner-hub', 'advisor-dashboard'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.id !== tabId) el.style.display = 'none';
    });

    const target = document.getElementById(tabId);
    if (target) {
      // If the target uses display:none toggling (hub sections)
      if (['alumni-console', 'research-hub-expanded', 'partner-hub', 'advisor-dashboard'].includes(tabId)) {
        target.style.display = 'block';
        target.classList.add('active');
      } else {
        target.style.display = '';
        target.classList.add('active');
      }
      // Trigger lazy render if needed
      setTimeout(() => {
        if (tabId === 'alumni-console' && typeof renderAlumniConsole === 'function') renderAlumniConsole();
        if (tabId === 'research-hub-expanded' && typeof renderResearchHubExpanded === 'function') renderResearchHubExpanded();
        if (tabId === 'partner-hub' && typeof renderPartnerHubTab === 'function') renderPartnerHubTab('profile');
        if (tabId === 'advisor-dashboard' && typeof renderAdvisorDashboard === 'function') renderAdvisorDashboard();
      }, 200);
    }
    document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
    const btn = document.querySelector(`[data-tab="${tabId}"]`) || document.querySelector(`[onclick*="${tabId}"]`);
    if (btn) btn.classList.add('active');
    // Also close mobile sidebar
    document.querySelector('aside.portal-sidebar')?.classList.remove('open');
    window.scrollTo(0, 0);
  };

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // Also hook into role display to show/hide new nav items
  function updateNavVisibility() {
    if (typeof appState === 'undefined') { setTimeout(updateNavVisibility, 200); return; }
    const role = appState.role || '';

    const roleToClasses = {
      'lecturer': 'lecturer-only',
      'alumni': 'alumni-only',
      'researcher': 'researcher-only',
      'industry_partner': 'partner-only',
      'career_advisor': 'advisor-only',
      'admin': null
    };

    // For each injected nav item, update display
    document.querySelectorAll('.alumni-only, .researcher-only, .partner-only, .advisor-only').forEach(el => {
      const targetClass = roleToClasses[role];
      el.style.display = (targetClass && el.classList.contains(targetClass)) ? 'block' : 'none';
    });

    // Show lecturer-extra items only for lecturer
    document.querySelectorAll('.lecturer-only').forEach(el => {
      if (role === 'lecturer') {
        el.style.display = 'block';
      } else if (['alumni', 'industry_partner', 'career_advisor'].includes(role)) {
        // Keep only lecturer-dashboard and lecturer-settings
        const tab = el.getAttribute('data-tab');
        el.style.display = (['lecturer-dashboard', 'lecturer-settings'].includes(tab)) ? 'block' : 'none';
      } else {
        el.style.display = 'none';
      }
    });
  }
  window.updateNavVisibility = updateNavVisibility;

  // Patch the original setUserRole function to also trigger nav visibility update
  const originalSetUserRole = window.setUserRole;
  window.setUserRole = function(role, user) {
    if (originalSetUserRole) originalSetUserRole(role, user);
    setTimeout(updateNavVisibility, 300);
    // Also trigger creativity init for portal
    setTimeout(() => {
      if (typeof initCreativity === 'function') initCreativity();
      if (typeof renderQuickActionsBtn === 'function') renderQuickActionsBtn();
    }, 500);
  };

  // Initial run
  setTimeout(updateNavVisibility, 800);
})();
