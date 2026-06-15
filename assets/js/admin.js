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
  currentJobListings.unshift({ title, company, type });
  logAdminAuditAction('Job Opportunity Created', `Created career listing: ${title} at ${company}`);
  showToastNotification('Career placement listing published!');
  ['admin-job-title', 'admin-job-company'].forEach(id => D.val(id, ''));
  renderAdminCareers();
}

function submitAdminAnnouncement() {
  const title = D.val('admin-notice-title');
  const body = D.val('admin-notice-body');
  if (!title || !body) return showToastNotification('Please fill in notice title and body.');
  
  logAdminAuditAction('Notice Published', `Announced bulletin: "${title}"`);
  showToastNotification('Institutional notice published to all dashboards!');
  ['admin-notice-title', 'admin-notice-body'].forEach(id => D.val(id, ''));
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
}