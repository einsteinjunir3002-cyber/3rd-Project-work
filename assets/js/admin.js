/* SMARTLEARN AI - ADMINISTRATIVE SIMULATION ENGINE */

function saveAdminSettings() {
  const siteName = D.val('admin-site-name') || 'SmartLearn AI';
  const provider = D.val('admin-ai-provider') || 'groq';
  const model = D.val('admin-ai-model') || '';

  localStorage.setItem('smartlearn_site_name', siteName);
  localStorage.setItem('smartlearn_ai_provider', provider);
  localStorage.setItem('smartlearn_ai_model', model);

  // Save individual keys
  const groqKey = D.val('admin-key-groq')?.trim() || '';
  const geminiKey = D.val('admin-key-gemini')?.trim() || '';
  const openaiKey = D.val('admin-key-openai')?.trim() || '';
  const openrouterKey = D.val('admin-key-openrouter')?.trim() || '';

  if (groqKey) localStorage.setItem('smartlearn_ai_key_groq', groqKey); else localStorage.removeItem('smartlearn_ai_key_groq');
  if (geminiKey) localStorage.setItem('smartlearn_ai_key_gemini', geminiKey); else localStorage.removeItem('smartlearn_ai_key_gemini');
  if (openaiKey) localStorage.setItem('smartlearn_ai_key_openai', openaiKey); else localStorage.removeItem('smartlearn_ai_key_openai');
  if (openrouterKey) localStorage.setItem('smartlearn_ai_key_openrouter', openrouterKey); else localStorage.removeItem('smartlearn_ai_key_openrouter');

  // Set current active key based on provider
  let activeKey = '';
  if (provider === 'groq') activeKey = groqKey;
  else if (provider === 'gemini') activeKey = geminiKey;
  else if (provider === 'openai') activeKey = openaiKey;
  else if (provider === 'openrouter') activeKey = openrouterKey;

  if (activeKey) {
    localStorage.setItem('smartlearn_ai_key', activeKey);
  } else {
    localStorage.removeItem('smartlearn_ai_key');
  }

  // Update branding globally in the prototype UI
  document.querySelectorAll('.logo span.gradient-text').forEach(el => {
    el.textContent = siteName;
  });

  updateApiStatusBadge(activeKey ? provider : 'keyless');
  updateAiSettingsVisibility();
}

function onAdminProviderChange() {
  const provider = D.val('admin-ai-provider') || 'groq';
  let defaultModel = 'llama-3.1-8b-instant';
  if (provider === 'gemini') defaultModel = 'gemini-2.0-flash';
  else if (provider === 'openai') defaultModel = 'gpt-4o-mini';
  else if (provider === 'openrouter') defaultModel = 'meta-llama/llama-3.1-8b-instruct:free';
  else if (provider === 'keyless') defaultModel = 'openai-large';

  D.val('admin-ai-model', defaultModel);
  saveAdminSettings();
}

async function testAdminConnection() {
  const provider = D.val('admin-ai-provider') || 'groq';
  const model = D.val('admin-ai-model') || '';
  let key = '';
  if (provider === 'groq') key = D.val('admin-key-groq');
  else if (provider === 'gemini') key = D.val('admin-key-gemini');
  else if (provider === 'openai') key = D.val('admin-key-openai');
  else if (provider === 'openrouter') key = D.val('admin-key-openrouter');

  showToastNotification(`Testing connection to ${provider}...`);

  // Override config temporarily for connection check
  const oldProv = localStorage.getItem('smartlearn_ai_provider');
  const oldKey = localStorage.getItem('smartlearn_ai_key');
  const oldModel = localStorage.getItem('smartlearn_ai_model');

  localStorage.setItem('smartlearn_ai_provider', provider);
  if (key) localStorage.setItem('smartlearn_ai_key', key); else localStorage.removeItem('smartlearn_ai_key');
  localStorage.setItem('smartlearn_ai_model', model);

  try {
    const res = await executeClientAiRequest("test connection - reply with exact word 'connected' and nothing else", "Connected check.", "study");
    if (res && res.toLowerCase().includes('connected')) {
      showToastNotification(`Successfully connected to ${provider}!`);
    } else {
      showToastNotification(`Connection successful. Received: ${res.slice(0, 30)}...`);
    }
  } catch (err) {
    showToastNotification(`Connection failed: ${err.message}`);
  } finally {
    // Restore config
    if (oldProv) localStorage.setItem('smartlearn_ai_provider', oldProv); else localStorage.removeItem('smartlearn_ai_provider');
    if (oldKey) localStorage.setItem('smartlearn_ai_key', oldKey); else localStorage.removeItem('smartlearn_ai_key');
    if (oldModel) localStorage.setItem('smartlearn_ai_model', oldModel); else localStorage.removeItem('smartlearn_ai_model');
  }
}

function copyPermanentConfigFromAdmin() {
  const provider = D.val('admin-ai-provider') || 'groq';
  let key = '';
  if (provider === 'groq') key = D.val('admin-key-groq');
  else if (provider === 'gemini') key = D.val('admin-key-gemini');
  else if (provider === 'openai') key = D.val('admin-key-openai');
  else if (provider === 'openrouter') key = D.val('admin-key-openrouter');
  const model = D.val('admin-ai-model') || '';

  const snippet = `const SYSTEM_PERMANENT_CONFIG = {
  provider: '${provider}',
  apiKey: '${key || 'YOUR_API_KEY_HERE'}',
  model: '${model}'
};`;

  navigator.clipboard.writeText(snippet).then(() => {
    showToastNotification('Config copied to clipboard!');
  }).catch(() => {
    alert("Exported Config:\n\n" + snippet);
  });
}

/* =========================================================
   ADMINISTRATIVE SIMULATION & DIRECTORIES CONTROL ENGINE
   ========================================================= */

// [Admin Global Lists moved to data.js]
function logAdminAuditAction(action, detail, prev = 'N/A', next = 'N/A') {
  currentAuditLogs.unshift({
    user: appState.user?.email || 'admin@smartlearn.com',
    action: action,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    prev: prev,
    next: next || detail
  });
  renderAdminAudit();
}

function renderAdminAudit() {
  const tbody = D.get('admin-audits-table-body');
  if (!tbody) return;
  tbody.innerHTML = currentAuditLogs.map(l => `
    <tr style="font-size:0.75rem;">
      <td><strong>${l.user}</strong></td>
      <td style="color:var(--primary); font-weight:700;">${l.action}</td>
      <td style="color:var(--text-light);">${l.timestamp}</td>
      <td style="font-family:monospace; color:var(--text-muted); max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.prev}">${l.prev}</td>
      <td style="font-family:monospace; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.next}">${l.next}</td>
    </tr>
  `).join('');
}

function renderAdminUsers() {
  const tbody = D.get('admin-users-table-body');
  if (!tbody) return;
  const users = getSimulatedUsers();
  const query = (D.val('admin-search-users-input') || '').toLowerCase().trim();
  
  tbody.innerHTML = users.filter(u => {
    if (!query) return true;
    return (u.name || '').toLowerCase().includes(query) || 
           (u.email || '').toLowerCase().includes(query) || 
           (u.role || '').toLowerCase().includes(query) ||
           (u.department || '').toLowerCase().includes(query);
  }).map(u => {
    const isSuspended = u.isSuspended || false;
    const statusBadge = isSuspended ? '<span class="badge badge-danger">Suspended</span>' : '<span class="badge badge-success">Active</span>';
    const suspendBtnText = isSuspended ? 'Reactivate' : 'Suspend';
    const suspendBtnClass = isSuspended ? 'btn-primary' : 'btn-secondary';
    
    let meta = '';
    if (u.role === 'student') meta = `Dept: ${u.department || 'Computer Science'} • ID: ${u.studentIdNumber || 'SL-0000'}`;
    else if (u.role === 'lecturer') meta = `Office: ${u.office || 'Block C, Rm 4'}`;
    else meta = 'Platform Admin';

    return `
      <tr>
        <td>
          <strong>${u.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-muted);">${u.email}</span>
        </td>
        <td><span class="badge badge-info" style="text-transform:uppercase;">${u.role}</span></td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${meta}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn ${suspendBtnClass} btn-sm" onclick="toggleAdminUserSuspension('${u.id || u.email}')">${suspendBtnText}</button>
          <button class="btn btn-secondary btn-sm" style="color:var(--danger); border-color:var(--danger);" onclick="deleteAdminUser('${u.id || u.email}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleAdminUserSuspension(idOrEmail) {
  const users = getSimulatedUsers();
  const u = users.find(x => x.id === idOrEmail || x.email === idOrEmail);
  if (u) {
    u.isSuspended = !u.isSuspended;
    saveSimulatedUsers(users);
    const action = u.isSuspended ? 'User Account Suspended' : 'User Account Reactivated';
    logAdminAuditAction(action, `Modified state of user account: ${u.email}`);
    showToastNotification(`User suspension toggled: ${u.isSuspended ? 'Suspended' : 'Active'}`);
    renderAdminUsers();
  }
}

function deleteAdminUser(idOrEmail) {
  if (!confirm('Are you sure you want to permanently delete this user?')) return;
  let users = getSimulatedUsers();
  const u = users.find(x => x.id === idOrEmail || x.email === idOrEmail);
  if (u) {
    users = users.filter(x => x.id !== idOrEmail && x.email !== idOrEmail);
    saveSimulatedUsers(users);
    logAdminAuditAction('User Account Deleted', `Permanently removed user account: ${u.email}`);
    showToastNotification(`Deleted account for ${u.email}`);
    renderAdminUsers();
  }
}

function submitAdminCreateUser() {
  const name = D.val('admin-create-name');
  const email = D.val('admin-create-email');
  const password = D.val('admin-create-password');
  const role = D.val('admin-create-role');
  
  if (!name || !email || !password) return showToastNotification('Please fill in all general fields.');
  
  const users = getSimulatedUsers();
  if (users.some(u => u.email === email)) return showToastNotification('Email already registered.');
  
  const newUser = {
    id: `user_sim_${Date.now()}`,
    name,
    email,
    password,
    role,
    isSuspended: false
  };
  
  if (role === 'student') {
    newUser.department = D.val('admin-create-dept') || 'Computer Science';
    newUser.studentIdNumber = D.val('admin-create-stdid') || `SL-${Math.floor(100000 + Math.random() * 900000)}`;
  } else if (role === 'lecturer') {
    newUser.office = D.val('admin-create-office') || 'Office Block C';
  }
  
  users.push(newUser);
  saveSimulatedUsers(users);
  logAdminAuditAction('User Account Created', `Created new credential for ${email} with role ${role}`);
  showToastNotification(`Account created for ${email}!`);
  
  D.val('admin-create-name', '');
  D.val('admin-create-email', '');
  D.val('admin-create-password', '');
  D.val('admin-create-stdid', '');
  D.val('admin-create-office', '');
  D.show('admin-create-user-modal', false);
  renderAdminUsers();
}

function toggleAdminCreateRoleFields() {
  const role = D.val('admin-create-role');
  D.show('admin-create-student-fields', role === 'student');
  D.show('admin-create-lecturer-fields', role === 'lecturer');
}

function openAdminCreateUserModal() {
  D.val('admin-create-role', 'student');
  toggleAdminCreateRoleFields();
  D.show('admin-create-user-modal', true);
}

function openAdminBulkImportModal() {
  D.val('admin-bulk-csv-text', '');
  D.show('admin-bulk-import-modal', true);
}

function submitAdminBulkImport() {
  const csvText = D.val('admin-bulk-csv-text').trim();
  if (!csvText) return;
  const lines = csvText.split('\n');
  let count = 0;
  const users = getSimulatedUsers();
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length >= 3) {
      const email = row[1]?.trim();
      if (!users.some(u => u.email === email)) {
        users.push({
          id: `user_sim_bulk_${Date.now()}_${i}`,
          name: row[0]?.trim(),
          email: email,
          password: 'password',
          role: row[2]?.trim(),
          department: row[3]?.trim() || '',
          studentIdNumber: row[4]?.trim() || '',
          isSuspended: false
        });
        count++;
      }
    }
  }
  saveSimulatedUsers(users);
  logAdminAuditAction('Bulk CSV Upload', `Imported ${count} user profiles via batch registry.`);
  showToastNotification(`Successfully imported ${count} accounts!`);
  D.show('admin-bulk-import-modal', false);
  renderAdminUsers();
}

function filterAdminUsers() {
  renderAdminUsers();
}

function renderAdminRoles() {
  const container = D.get('admin-roles-list-container');
  if (!container) return;
  container.innerHTML = currentRolesList.map(r => {
    const isSelected = r.name === adminSelectedRoleName;
    return `
      <div class="timetable-item" style="border-left-color: var(--secondary); cursor:pointer; background:${isSelected ? 'rgba(124,58,237,0.1)' : 'var(--bg-base)'};" onclick="selectAdminRole('${r.name}')">
        <div class="timetable-details">
          <h5 style="text-transform:capitalize;">${r.name}</h5>
          <p style="color:var(--text-muted); font-size:0.75rem; margin-top:2px;">${r.description}</p>
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
            ${r.permissions.map(p => `<span class="badge" style="font-size:0.6rem; padding:2px 6px; background:rgba(37,99,235,0.08); color:var(--primary);">${p}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectAdminRole(roleName) {
  adminSelectedRoleName = roleName;
  renderAdminRoles();
  const role = currentRolesList.find(r => r.name === roleName);
  if (role) {
    D.show('admin-edit-permissions-panel', true);
    D.get('admin-edit-role-title').textContent = `Configure Permissions: ${roleName.toUpperCase()}`;
    const allPerms = ['Create Courses', 'Grade Assignments', 'Manage Users', 'View Reports', 'Manage Research', 'Manage Startups', 'Manage Careers', 'Access System Settings'];
    const container = D.get('admin-permissions-checkbox-container');
    container.innerHTML = allPerms.map(p => {
      const hasIt = role.permissions.includes(p);
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer; margin-bottom: 4px;">
          <input type="checkbox" value="${p}" ${hasIt ? 'checked' : ''} style="width:16px; height:16px;">
          <span>${p}</span>
        </label>
      `;
    }).join('');
  }
}

function saveAdminRolePermissions() {
  const role = currentRolesList.find(r => r.name === adminSelectedRoleName);
  if (role) {
    const checkboxes = document.querySelectorAll('#admin-permissions-checkbox-container input[type="checkbox"]');
    const checked = [];
    checkboxes.forEach(cb => { if (cb.checked) checked.push(cb.value); });
    const prevVal = role.permissions.join(', ');
    role.permissions = checked;
    const newVal = checked.join(', ');
    logAdminAuditAction('Role Modified', `Modified ${role.name} permissions. Previous: [${prevVal}], New: [${newVal}]`);
    showToastNotification(`Permissions saved for ${role.name}!`);
    renderAdminRoles();
  }
}

function renderAdminAcademics() {
  const dropdown = D.get('admin-dept-faculty');
  if (dropdown) {
    dropdown.innerHTML = currentFacultiesList.map(f => `<option value="${f.code}">${f.name}</option>`).join('');
  }
  const deptsTbody = D.get('admin-depts-table-body');
  if (deptsTbody) {
    deptsTbody.innerHTML = currentDepartmentsList.map(d => `
      <tr>
        <td><strong>${d.name}</strong><br><span style="font-size:0.7rem; color:var(--text-light);">Faculty: ${d.faculty}</span></td>
        <td><span class="badge badge-primary">${d.code}</span></td>
        <td><button class="btn btn-secondary btn-sm" onclick="deleteAdminDept('${d.code}')">Delete</button></td>
      </tr>
    `).join('');
  }
  const facsTbody = D.get('admin-faculties-table-body');
  if (facsTbody) {
    facsTbody.innerHTML = currentFacultiesList.map(f => `
      <tr>
        <td><strong>${f.name}</strong></td>
        <td><span class="badge badge-secondary">${f.code}</span></td>
        <td><button class="btn btn-secondary btn-sm" onclick="deleteAdminFaculty('${f.code}')">Delete</button></td>
      </tr>
    `).join('');
  }
}

function deleteAdminDept(code) {
  currentDepartmentsList = currentDepartmentsList.filter(d => d.code !== code);
  logAdminAuditAction('Department Deleted', `Removed department: ${code}`);
  showToastNotification(`Department ${code} deleted.`);
  renderAdminAcademics();
}

function deleteAdminFaculty(code) {
  currentFacultiesList = currentFacultiesList.filter(f => f.code !== code);
  logAdminAuditAction('Faculty Deleted', `Removed faculty: ${code}`);
  showToastNotification(`Faculty ${code} deleted.`);
  renderAdminAcademics();
}

function submitAdminCreateDept() {
  const name = D.val('admin-dept-name');
  const code = D.val('admin-dept-code').toUpperCase();
  const faculty = D.val('admin-dept-faculty');
  if (!name || !code) return showToastNotification('Fill in department details.');
  if (currentDepartmentsList.some(d => d.code === code)) return showToastNotification('Code already exists.');
  currentDepartmentsList.push({ name, code, faculty });
  logAdminAuditAction('Department Created', `Added department ${code} under faculty ${faculty}`);
  showToastNotification(`Department ${code} added!`);
  ['admin-dept-name', 'admin-dept-code'].forEach(id => D.val(id, ''));
  renderAdminAcademics();
}

function submitAdminCreateFaculty() {
  const name = D.val('admin-fac-name');
  const code = D.val('admin-fac-code').toUpperCase();
  if (!name || !code) return showToastNotification('Fill in faculty details.');
  if (currentFacultiesList.some(f => f.code === code)) return showToastNotification('Code already exists.');
  currentFacultiesList.push({ name, code });
  logAdminAuditAction('Faculty Created', `Added faculty code: ${code}`);
  showToastNotification(`Faculty ${code} added!`);
  ['admin-fac-name', 'admin-fac-code'].forEach(id => D.val(id, ''));
  renderAdminAcademics();
}

function renderAdminStartups() {
  const tbody = D.get('admin-startups-table-body');
  if (!tbody) return;
  tbody.innerHTML = appState.studentStartups.map(s => {
    const status = s.joined ? 'Incubated' : 'Pending Review';
    const statusBadge = s.joined ? '<span class="badge badge-success">Incubated</span>' : '<span class="badge badge-warning">Pending Review</span>';
    const actBtn = s.joined ? `<button class="btn btn-secondary btn-sm" onclick="toggleIncubateStartup(${s.id})">De-incubate</button>` : `<button class="btn btn-primary btn-sm" onclick="toggleIncubateStartup(${s.id})">Approve & Incubate</button>`;
    return `
      <tr>
        <td><strong>${s.name}</strong><br><span style="font-size:0.75rem; color:var(--text-light);">${s.desc.slice(0, 50)}...</span></td>
        <td>${s.industry}</td>
        <td>${s.author}</td>
        <td>👍 ${s.upvotes} Votes</td>
        <td>${statusBadge}</td>
        <td>${actBtn}</td>
      </tr>
    `;
  }).join('');
}

function toggleIncubateStartup(id) {
  const s = appState.studentStartups.find(x => x.id === id);
  if (s) {
    s.joined = !s.joined;
    const action = s.joined ? 'Startup Incubated' : 'Startup Incubation Suspended';
    logAdminAuditAction(action, `Incubation status toggled for startup ${s.name} to: ${s.joined ? 'Active' : 'Pending'}`);
    showToastNotification(`Startup ${s.name} incubation status updated!`);
    saveOfflineState();
    renderAdminStartups();
  }
}

function renderAdminResearch() {
  const tbody = D.get('admin-research-table-body');
  if (!tbody) return;
  tbody.innerHTML = currentResearchProjects.map(p => {
    const isApproved = p.status === 'Approved';
    const statusBadge = isApproved ? '<span class="badge badge-success">Approved</span>' : '<span class="badge badge-warning">Pending</span>';
    const actBtn = isApproved ? `<button class="btn btn-secondary btn-sm" onclick="toggleResearchApproval(${p.id})">Revoke</button>` : `<button class="btn btn-primary btn-sm" onclick="toggleResearchApproval(${p.id})">Approve Grant</button>`;
    return `
      <tr>
        <td><strong>${p.title}</strong></td>
        <td>${p.domain}</td>
        <td>${p.lead}</td>
        <td style="color:var(--success); font-weight:700;">GH₵ ${p.funding.toLocaleString()}</td>
        <td>${statusBadge}</td>
        <td>${actBtn}</td>
      </tr>
    `;
  }).join('');
}

function toggleResearchApproval(id) {
  const p = currentResearchProjects.find(x => x.id === id);
  if (p) {
    p.status = p.status === 'Approved' ? 'Pending Approval' : 'Approved';
    
    // Sync with appState for the Researcher Hub
    if (appState.demoResearchProjects) {
      const globalProject = appState.demoResearchProjects.find(x => x.title === p.title);
      if (globalProject) globalProject.status = p.status;
    }
    
    logAdminAuditAction('Research Status Changed', `Research project "${p.title}" status set to ${p.status}`);
    showToastNotification(`Research project "${p.title}" status updated!`);
    renderAdminResearch();
  }
}

function renderAdminCareers() {
  const tbody = D.get('admin-jobs-table-body');
  if (tbody) {
    tbody.innerHTML = currentJobListings.map(j => `
      <tr>
        <td><strong>${j.title}</strong></td>
        <td>${j.company}</td>
        <td><span class="badge badge-primary">${j.type}</span></td>
      </tr>
    `).join('');
  }
}

function submitAdminCreateJob() {
  const title = D.val('admin-job-title');
  const company = D.val('admin-job-company');
  const type = D.val('admin-job-type');
  if (!title || !company) return showToastNotification('Fill in job details.');
  const newJob = { title, company, type, postedDate: new Date().toLocaleDateString() };
  currentJobListings.unshift(newJob);
  // Bridge to appState so students can see in Career Hub
  appState.adminJobListings.unshift(newJob);
  pushDynamicNotification(`💼 New Job Posted: "${title}" at ${company}`, 'career', null);
  logAdminAuditAction('Job Opportunity Created', `Created career listing: ${title} at ${company}`);
  showToastNotification('Career placement listing published!');
  ['admin-job-title', 'admin-job-company'].forEach(id => D.val(id, ''));
  saveOfflineState();
  renderAdminCareers();
}

function submitAdminAnnouncement() {
  const title = D.val('admin-notice-title');
  const body = D.val('admin-notice-body');
  if (!title || !body) return showToastNotification('Please fill in notice title and body.');
  
  // Store announcement in appState so it appears on all dashboards
  const announcement = {
    id: `ann_${Date.now()}`,
    title: title,
    body: body,
    timestamp: new Date().toLocaleString(),
    author: appState.user?.name || 'Admin'
  };
  appState.announcements.unshift(announcement);
  if (appState.announcements.length > 20) appState.announcements.length = 20;
  
  // Push as a dynamic notification for all users
  pushDynamicNotification(`📢 New Announcement: "${title}"`, 'announcement', null);
  
  logAdminAuditAction('Notice Published', `Announced bulletin: "${title}"`);
  showToastNotification('Institutional notice published to all dashboards!');
  ['admin-notice-title', 'admin-notice-body'].forEach(id => D.val(id, ''));
  saveOfflineState();
  renderDashboardAnnouncements();
}

function renderAdminCourses() {
  const tbody = D.get('admin-courses-table-body');
  if (!tbody) return;
  tbody.innerHTML = appState.courses.map(c => `
    <tr>
      <td><strong>${c.title}</strong></td>
      <td><span class="badge badge-info">${c.code}</span></td>
      <td>${c.instructor}</td>
    </tr>
  `).join('');
}

function submitAdminCreateCourse() {
  const title = D.val('admin-course-name');
  const code = D.val('admin-course-code').toUpperCase();
  const lecturer = D.val('admin-course-lecturer');
  if (!title || !code || !lecturer) return showToastNotification('Please fill in course details.');
  appState.courses.unshift({
    id: code,
    title: title,
    code: code,
    instructor: lecturer,
    avatar: 'avatar_lecturer.jpg',
    notesCount: 0,
    assignmentsCount: 0
  });
  logAdminAuditAction('Course Created', `Published new course code: ${code}`);
  showToastNotification(`Course ${code} successfully published!`);
  ['admin-course-name', 'admin-course-code', 'admin-course-lecturer'].forEach(id => D.val(id, ''));
  saveOfflineState();
  renderAdminCourses();
}

function renderAdminViews() {
  if (appState.role !== 'admin') return;
  renderAdminUsers();
  renderAdminRoles();
  renderAdminAcademics();
  renderAdminStartups();
  renderAdminResearch();
  renderAdminCareers();
  renderAdminAudit();
  renderAdminCourses();
  
  // Sync dashboard metrics
  const users = getSimulatedUsers();
  D.html('admin-metric-users', users.length);
  D.html('admin-metric-students', users.filter(u => u.role === 'student').length);
  D.html('admin-metric-lecturers', users.filter(u => u.role === 'lecturer').length);
  D.html('admin-metric-startups', appState.studentStartups.length);

  // Sync Quick Analytics Insights dynamically
  const coursesActive = appState.courses ? appState.courses.length : 0;
  D.html('admin-analytics-courses-val', `${coursesActive} Running`);

  const currentRes = currentResearchProjects || [];
  const demoRes = appState.demoResearchProjects || [];
  const allRes = [...currentRes];
  demoRes.forEach(d => {
    if (!allRes.some(r => r.title === d.title)) {
      allRes.push({ status: d.funded ? 'Approved' : 'Pending Approval' });
    }
  });
  const approvedRes = allRes.filter(r => r.status === 'Approved' || r.status === 'In Progress' || r.status === 'Submitted' || r.funding > 0).length;
  D.html('admin-analytics-research-val', `${approvedRes} Approved`);

  const grads = appState.demoAlumniProfiles || [];
  const employed = grads.filter(g => g.company && g.role && !g.company.toLowerCase().includes('seeking') && !g.role.toLowerCase().includes('seeking')).length;
  const totalGrads = grads.length || 1;
  const rate = Math.round((employed / totalGrads) * 100);
  D.html('admin-analytics-grads-val', `${rate}% Rate`);

  const promptCount = appState.aiPromptCount || 412;
  D.html('admin-analytics-ai-val', `${promptCount} Total`);
}

function showAdminAnalyticsDetails(type) {
  const titleEl = D.get('admin-analytics-title');
  const bodyEl = D.get('admin-analytics-body');
  if (!titleEl || !bodyEl) return;

  let title = '';
  let html = '';

  if (type === 'courses') {
    title = '📚 Active Courses (All Registered)';
    const activeCourses = appState.courses || [];
    html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
    if (activeCourses.length === 0) {
      html += `<p style="color:var(--text-muted); text-align:center; padding:10px;">No active courses.</p>`;
    } else {
      activeCourses.forEach(c => {
        html += `
          <div style="padding:14px; border-radius:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:#fff;">${c.title}</strong>
              <span class="badge badge-primary" style="font-size:0.7rem;">${c.code}</span>
            </div>
            <div style="margin-top:6px; font-size:0.8rem; color:var(--text-muted);">
              Instructor: ${c.instructor} | Program: ${c.program}
            </div>
            <div style="margin-top:8px; font-size:0.75rem; display:flex; gap:12px; color:var(--text-light);">
              <span>📚 ${c.notesCount} lecture notes</span>
              <span>📝 ${c.assignmentsCount} assignments</span>
            </div>
          </div>`;
      });
    }
    html += `</div>`;
  } else if (type === 'research') {
    title = '🔬 Research Registries';
    const currentRes = currentResearchProjects || [];
    const demoRes = appState.demoResearchProjects || [];
    const allRes = [...currentRes];
    demoRes.forEach(d => {
      if (!allRes.some(r => r.title === d.title)) {
        allRes.push({
          id: d.id || Date.now(),
          title: d.title,
          domain: d.domain,
          lead: d.researcher,
          funding: d.funded ? 15000 : 0,
          status: d.funded ? 'Approved' : 'Pending Approval'
        });
      }
    });
    html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
    allRes.forEach(p => {
      const isApproved = p.status === 'Approved' || p.status === 'In Progress' || p.status === 'Submitted' || p.funding > 0;
      const statusBadge = isApproved ? '<span class="badge badge-success">Approved / Funded</span>' : '<span class="badge badge-warning">Pending Approval</span>';
      html += `
        <div style="padding:14px; border-radius:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <strong style="font-size:0.88rem; color:#fff;">${p.title}</strong>
            ${statusBadge}
          </div>
          <div style="margin-top:6px; font-size:0.8rem; color:var(--text-muted);">
            Lead: ${p.lead} | Domain: ${p.domain}
          </div>
          <div style="margin-top:6px; font-size:0.75rem; color:var(--success); font-weight:700;">
            Funding: GH₵ ${(p.funding || 0).toLocaleString()}
          </div>
        </div>`;
    });
    html += `</div>`;
  } else if (type === 'grads') {
    title = '💼 Alumni Employment Outcomes';
    const grads = appState.demoAlumniProfiles || [];
    const employed = grads.filter(g => g.company && g.role && !g.company.toLowerCase().includes('seeking') && !g.role.toLowerCase().includes('seeking'));
    const seeking = grads.filter(g => !g.company || g.company.toLowerCase().includes('seeking') || g.role.toLowerCase().includes('seeking'));
    
    html = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
        <div style="padding:14px; text-align:center; border-radius:10px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2);">
          <h4 style="font-size:1.6rem; color:#10b981; margin:0; font-weight:800;">${employed.length}</h4>
          <span style="font-size:0.75rem; color:var(--text-muted);">Placed in Employment (${Math.round((employed.length / grads.length) * 100)}%)</span>
        </div>
        <div style="padding:14px; text-align:center; border-radius:10px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);">
          <h4 style="font-size:1.6rem; color:#ef4444; margin:0; font-weight:800;">${seeking.length}</h4>
          <span style="font-size:0.75rem; color:var(--text-muted);">Seeking Placement (${Math.round((seeking.length / grads.length) * 100)}%)</span>
        </div>
      </div>
      <h4 style="margin-bottom:10px; font-size:0.95rem; color:#10b981; font-weight:700;">🟢 Employed Graduates (${employed.length})</h4>
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
    `;
    employed.forEach(g => {
      html += `
        <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#fff;">${g.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${g.role})</span>
            <div style="font-size:0.75rem; color:var(--text-light); margin-top:4px;">Company: ${g.company} | Location: ${g.location}</div>
          </div>
          <span style="font-size:0.72rem; color:var(--text-muted);">Class of ${g.graduationYear}</span>
        </div>`;
    });
    html += `
      </div>
      <h4 style="margin-bottom:10px; font-size:0.95rem; color:#ef4444; font-weight:700;">🔴 Seeking Opportunities (${seeking.length})</h4>
      <div style="display:flex; flex-direction:column; gap:10px;">
    `;
    seeking.forEach(g => {
      html += `
        <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#fff;">${g.name}</strong>
            <div style="font-size:0.75rem; color:var(--danger); margin-top:4px;">Status: ${g.role}</div>
          </div>
          <span style="font-size:0.72rem; color:var(--text-muted);">Class of ${g.graduationYear}</span>
        </div>`;
    });
    html += `</div>`;
  } else if (type === 'ai-prompts') {
    title = '🤖 AI Prompt Requests Logs';
    const totalCount = appState.aiPromptCount || 412;
    const history = appState.aiPromptHistory || [];
    
    html = `
      <div style="padding:14px; text-align:center; border-radius:10px; background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); margin-bottom:20px;">
        <h4 style="font-size:1.8rem; color:var(--accent); margin:0; font-weight:800;">${totalCount}</h4>
        <span style="font-size:0.75rem; color:var(--text-muted);">Cumulative Prompt Invocations</span>
      </div>
      <h4 style="margin-bottom:10px; font-size:0.95rem; font-weight:700;">📋 Recent Prompt History Logs (Real-time updates)</h4>
      <div style="display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:40vh; scrollbar-width:thin;">
    `;
    if (history.length === 0) {
      html += `<p style="color:var(--text-muted); text-align:center; padding:10px;">No prompt history logs available.</p>`;
    } else {
      history.forEach((h, idx) => {
        html += `
          <div style="padding:12px; border-radius:8px; background:rgba(0,0,0,0.15); border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="badge badge-info" style="font-size:0.6rem; padding:2px 6px; text-transform:uppercase;">Mode: ${h.mode || 'general'}</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">${h.timestamp}</span>
            </div>
            <p style="font-size:0.8rem; font-family:monospace; color:var(--text-light); margin:0; line-height:1.4; word-break:break-word;">${h.prompt}</p>
          </div>`;
      });
    }
  } else if (type === 'users') {
    title = '👥 Registered System Users';
    const users = getSimulatedUsers();
    html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
    users.forEach(u => {
      const isSuspended = u.isSuspended || false;
      const statusBadge = isSuspended ? '<span class="badge badge-danger" style="font-size:0.65rem;">Suspended</span>' : '<span class="badge badge-success" style="font-size:0.65rem;">Active</span>';
      
      let meta = '';
      if (u.role === 'student') meta = `Dept: ${u.department || 'CS'} | Student ID: ${u.studentIdNumber || 'SL-0001'}`;
      else if (u.role === 'lecturer') meta = `Office: ${u.office || 'Block C, Rm 4'}`;
      else meta = 'Platform Administrator';

      html += `
        <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#fff;">${u.name}</strong> <span class="badge badge-info" style="font-size:0.6rem; text-transform:uppercase; margin-left:6px;">${u.role}</span>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${u.email}</div>
            <div style="font-size:0.75rem; color:var(--text-light); margin-top:2px;">${meta}</div>
          </div>
          <div>${statusBadge}</div>
        </div>`;
    });
    html += `</div>`;
  } else if (type === 'students') {
    title = '🎓 Active Student Directory';
    const students = getSimulatedUsers().filter(u => u.role === 'student');
    html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
    if (students.length === 0) {
      html += `<p style="color:var(--text-muted); text-align:center; padding:10px;">No registered students.</p>`;
    } else {
      students.forEach(s => {
        const isSuspended = s.isSuspended || false;
        const statusBadge = isSuspended ? '<span class="badge badge-danger" style="font-size:0.65rem;">Suspended</span>' : '<span class="badge badge-success" style="font-size:0.65rem;">Active</span>';
        html += `
          <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#fff;">${s.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Email: ${s.email}</div>
              <div style="font-size:0.75rem; color:var(--text-light); margin-top:2px;">ID: ${s.studentIdNumber || 'stu/csc/0001'} | Program: ${s.program || 'BSc Computer Science'}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Dept: ${s.department || 'Computing & IT'}</div>
            </div>
            <div>${statusBadge}</div>
          </div>`;
      });
    }
    html += `</div>`;
  } else if (type === 'lecturers') {
    title = '👩‍🏫 Active Faculty Directory';
    const lecturers = getSimulatedUsers().filter(u => u.role === 'lecturer');
    html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
    if (lecturers.length === 0) {
      html += `<p style="color:var(--text-muted); text-align:center; padding:10px;">No registered faculty members.</p>`;
    } else {
      lecturers.forEach(l => {
        const isSuspended = l.isSuspended || false;
        const statusBadge = isSuspended ? '<span class="badge badge-danger" style="font-size:0.65rem;">Suspended</span>' : '<span class="badge badge-success" style="font-size:0.65rem;">Active</span>';
        html += `
          <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#fff;">${l.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Email: ${l.email}</div>
              <div style="font-size:0.75rem; color:var(--text-light); margin-top:2px;">Office: ${l.office || 'Block C, Rm 4'}</div>
            </div>
            <div>${statusBadge}</div>
          </div>`;
      });
    }
    html += `</div>`;
  } else if (type === 'startups') {
    title = '💡 Tracked Student Startups';
    const startups = appState.studentStartups || [];
    html = `<div style="display:flex; flex-direction:column; gap:12px;">`;
    if (startups.length === 0) {
      html += `<p style="color:var(--text-muted); text-align:center; padding:10px;">No startups tracked.</p>`;
    } else {
      startups.forEach(s => {
        const statusBadge = s.joined ? '<span class="badge badge-success" style="font-size:0.65rem;">Incubated</span>' : '<span class="badge badge-warning" style="font-size:0.65rem;">Pending Review</span>';
        html += `
          <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <strong style="color:#fff;">${s.name}</strong>
              ${statusBadge}
            </div>
            <p style="font-size:0.78rem; color:var(--text-light); margin:0 0 6px 0;">${s.desc}</p>
            <div style="font-size:0.72rem; color:var(--text-muted); display:flex; gap:12px;">
              <span>Founder: ${s.author}</span>
              <span>Industry: ${s.industry}</span>
              <span style="color:var(--primary); font-weight:700;">👍 ${s.upvotes} Votes</span>
            </div>
          </div>`;
      });
    }
    html += `</div>`;
  }

  titleEl.textContent = title;
  bodyEl.innerHTML = html;
  D.show('admin-analytics-modal', true);
}

function closeAdminAnalyticsModal() {
  D.show('admin-analytics-modal', false);
}