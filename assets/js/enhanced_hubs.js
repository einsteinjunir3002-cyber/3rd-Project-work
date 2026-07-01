/* ============================================================
   SMARTLEARN AI — ENHANCED HUBS MODULE
   Alumni, Research, Partner, Career Advisor, Lecturer expansions.
   All demo data is clearly labelled [DEMO CONTENT].
   ============================================================ */

/* ============================================================
   SECTION 1: ALUMNI CONSOLE
   ============================================================ */
function renderAlumniConsole() {
  const tab = appState.alumniTab || 'directory';
  renderAlumniTab(tab);
}

function switchAlumniTab(tab) {
  appState.alumniTab = tab;
  document.querySelectorAll('.alumni-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = D.get(`alumni-tab-${tab}`);
  if (btn) btn.classList.add('active');
  renderAlumniTab(tab);
}

function renderAlumniTab(tab) {
  const body = D.get('alumni-console-body');
  if (!body) return;

  const alumni = appState.demoAlumniProfiles || [];
  const events = appState.demoAlumniEvents || [];

  if (tab === 'directory') {
    body.innerHTML = `
      <div style="margin-bottom:20px;">
        <input type="text" id="alumni-search" class="form-control" placeholder="🔍 Search alumni by name, company, or year..." oninput="filterAlumni()" style="max-width:450px;">
      </div>
      <div class="course-grid" id="alumni-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px;">
        ${alumni.map(a => renderAlumniCard(a)).join('')}
      </div>`;

  } else if (tab === 'mentorship') {
    body.innerHTML = `
      <div class="dashboard-grid">
        <div>
          <h3 style="margin-bottom:16px;">🎯 Match a Mentor</h3>
          <div class="form-group"><label>Your Career Interest</label>
            <select id="mentorship-interest" class="form-control">
              <option>Software Engineering</option><option>Data Science & AI</option>
              <option>Finance & Banking</option><option>Healthcare & Medicine</option>
              <option>Entrepreneurship</option><option>Civil Engineering</option>
            </select></div>
          <div class="form-group"><label>Preferred Communication</label>
            <select id="mentorship-comms" class="form-control"><option>Video Call (Zoom)</option><option>WhatsApp</option><option>Email</option></select></div>
          <button class="btn btn-primary" style="width:100%;" onclick="matchMentor()">Find Mentors 🔍</button>
          <div id="mentor-match-results" style="margin-top:20px;"></div>
        </div>
        <div>
          <div class="widget glass">
            <h4 style="margin-bottom:12px;">📊 Active Mentorship Programs</h4>
            ${(appState.demoMentorships || []).map(m => `
              <div style="padding:12px; border-radius:10px; background:rgba(124,58,237,0.08); margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <strong style="font-size:0.88rem;">${m.mentorName}</strong>
                  <span class="badge badge-success" style="font-size:0.65rem;">Active</span>
                </div>
                <p style="font-size:0.75rem;color:var(--text-muted);">${m.field} · ${m.company}</p>
                <p style="font-size:0.75rem;color:var(--text-muted);">${m.mentees} current mentees</p>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

  } else if (tab === 'events') {
    body.innerHTML = `
      <h3 style="margin-bottom:20px;">📅 Upcoming Alumni Events</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px;">
        ${events.map(ev => `
          <div class="glass" style="border-radius:14px; overflow:hidden;">
            <div style="height:80px; background:linear-gradient(135deg,${ev.color||'var(--primary)'},var(--secondary)); display:flex;align-items:center;justify-content:center;font-size:2.5rem;">${ev.emoji||'📅'}</div>
            <div style="padding:16px;">
              <span class="badge badge-primary" style="font-size:0.6rem;margin-bottom:8px;">${ev.type}</span>
              <h4 style="font-size:0.95rem;margin-bottom:6px;">${ev.title}</h4>
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">📅 ${ev.date}</p>
              <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px;">📍 ${ev.venue}</p>
              <button class="btn btn-primary btn-sm" style="width:100%;" onclick="registerAlumniEvent('${ev.title}')">Register Now</button>
            </div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'careers') {
    body.innerHTML = `
      <h3 style="margin-bottom:20px;">💼 Alumni Career Outcomes Tracker</h3>
      <div class="dashboard-grid" style="margin-bottom:24px;">
        ${[['Employed',82,'#10b981'],['Post-Grad',11,'#6366f1'],['Self-Employed',7,'#f59e0b']].map(([label, val, color]) => `
          <div class="glass metric-card" style="text-align:center;">
            <div style="font-size:2.2rem;font-weight:900;color:${color};">${val}%</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${label}</div>
          </div>`).join('')}
      </div>
      <div class="widget glass">
        <h4 style="margin-bottom:16px;">🏆 Where Our Alumni Work</h4>
        ${(appState.demoAlumniProfiles || []).map(a => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
            <div>
              <strong style="font-size:0.88rem;">${a.name}</strong>
              <p style="font-size:0.75rem;color:var(--text-muted);">${a.role} @ ${a.company}</p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.72rem;color:var(--text-muted);">Class of ${a.graduationYear}</div>
              <span class="badge badge-success" style="font-size:0.6rem;">Employed</span>
            </div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'jobboard') {
    let alumniJobs = appState.demoCareerJobs || [];
    if (appState.adminJobListings && appState.adminJobListings.length > 0) {
      const mappedAdminJobs = appState.adminJobListings.map(j => ({
        title: j.title, company: j.company, location: j.location || 'Remote/Ghana',
        salary: j.salary || 'Competitive', type: j.type || 'Full-Time', match: 100
      }));
      alumniJobs = [...mappedAdminJobs, ...alumniJobs];
    }
    body.innerHTML = `
      <h3 style="margin-bottom:20px;">💼 Alumni Network Job Board</h3>
      <p style="color:var(--text-muted);margin-bottom:20px;">Exclusive opportunities posted by our alumni network for current students.</p>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${alumniJobs.map(job => `
          <div class="glass" style="padding:18px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <h4 style="font-size:0.95rem;margin-bottom:4px;">${job.title}</h4>
              <p style="font-size:0.8rem;color:var(--text-muted);">${job.company} · ${job.location}</p>
              <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                <span class="badge badge-primary" style="font-size:0.6rem;">${job.type}</span>
                <span class="badge badge-success" style="font-size:0.6rem;">${job.salary}</span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="applyForJob('${job.title}')">Apply Now →</button>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'stories') {
    const stories = (appState.demoAlumniProfiles || []).slice(0, 3);
    body.innerHTML = `
      <h3 style="margin-bottom:20px;">🌟 Alumni Success Stories</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
        ${stories.map(a => `
          <div class="glass" style="padding:24px;border-radius:16px;text-align:center;">
            <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 16px;">${a.avatar||'👤'}</div>
            <h4 style="font-size:1.05rem;margin-bottom:4px;">${a.name}</h4>
            <p style="font-size:0.8rem;color:var(--primary);font-weight:600;margin-bottom:4px;">${a.role}</p>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:16px;">${a.company} · Class of ${a.graduationYear}</p>
            <blockquote style="font-size:0.82rem;color:var(--text-muted);font-style:italic;border-left:3px solid var(--primary);padding-left:12px;text-align:left;">"${a.quote}"</blockquote>
          </div>`).join('')}
      </div>`;
  }
}

function renderAlumniCard(a) {
  return `
    <div class="glass" style="border-radius:14px;padding:20px;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${a.avatar||'👤'}</div>
        <div>
          <h4 style="font-size:0.92rem;font-weight:700;margin-bottom:2px;">${a.name}</h4>
          <p style="font-size:0.72rem;color:var(--text-muted);">Class of ${a.graduationYear}</p>
        </div>
      </div>
      <div style="font-size:0.78rem;color:var(--primary);font-weight:600;margin-bottom:4px;">💼 ${a.role}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">🏢 ${a.company}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px;">📍 ${a.location}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${a.skills.map(s => `<span class="badge" style="font-size:0.6rem;background:rgba(124,58,237,0.1);color:var(--primary);">${s}</span>`).join('')}
      </div>
      <button class="btn btn-secondary btn-sm" style="width:100%;margin-top:12px;font-size:0.75rem;" onclick="requestMentorship('${a.name}')">Request Mentorship</button>
    </div>`;
}

function filterAlumni() {
  const q = (D.val('alumni-search') || '').toLowerCase();
  const alumni = (appState.demoAlumniProfiles || []).filter(a =>
    a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || String(a.graduationYear).includes(q)
  );
  const grid = D.get('alumni-grid');
  if (grid) grid.innerHTML = alumni.map(a => renderAlumniCard(a)).join('');
}

function matchMentor() {
  const interest = D.val('mentorship-interest') || '';
  const results = D.get('mentor-match-results');
  if (!results) return;
  const matches = (appState.demoAlumniProfiles || []).filter(a =>
    a.skills.some(s => s.toLowerCase().includes(interest.toLowerCase().split(' ')[0].toLowerCase()))
  );
  if (!matches.length) {
    results.innerHTML = '<p style="color:var(--text-muted);">No exact matches found. Try a different interest area.</p>';
    return;
  }
  results.innerHTML = `<h4 style="margin-bottom:12px;font-size:0.9rem;">✅ ${matches.length} Mentor(s) Found</h4>` +
    matches.map(a => `
      <div class="glass" style="padding:12px;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <div><strong style="font-size:0.85rem;">${a.name}</strong><p style="font-size:0.72rem;color:var(--text-muted);">${a.role} @ ${a.company}</p></div>
        <button class="btn btn-primary btn-sm" onclick="requestMentorship('${a.name}')">Connect</button>
      </div>`).join('');
}

function requestMentorship(name) { showToastNotification(`Mentorship request sent to ${name}! They will respond within 48 hours.`); }
function registerAlumniEvent(title) { showToastNotification(`Successfully registered for "${title}"! Check your email for confirmation.`); }
function applyForJob(title) { showToastNotification(`Application submitted for "${title}"! The recruiter will be in touch.`); }


/* ============================================================
   SECTION 2: LECTURER HUB EXPANSION
   ============================================================ */
function renderLecturerAttendance() {
  const container = D.get('lecturer-attendance-content');
  if (!container) return;
  const records = appState.demoAttendanceRecords || [];
  const courses = ['CS101', 'ENG201', 'MATH102'];

  container.innerHTML = `
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      ${courses.map(c => `<button class="btn btn-secondary btn-sm lec-att-course-btn" id="att-btn-${c}" onclick="switchAttCourse('${c}')" style="${c==='CS101'?'background:var(--primary);color:#fff;':''}">${c}</button>`).join('')}
    </div>
    <div id="att-course-table"></div>`;
  switchAttCourse('CS101');
}

function switchAttCourse(courseCode) {
  document.querySelectorAll('.lec-att-course-btn').forEach(b => { b.style.background=''; b.style.color=''; });
  const btn = D.get(`att-btn-${courseCode}`);
  if (btn) { btn.style.background='var(--primary)'; btn.style.color='#fff'; }

  const records = (appState.demoAttendanceRecords || []).filter(r => r.course === courseCode);
  const container = D.get('att-course-table');
  if (!container) return;

  if (!records.length) { container.innerHTML = '<p style="color:var(--text-muted);">No attendance data for this course.</p>'; return; }

  const weeks = ['Week 1','Week 2','Week 3','Week 4'];
  const students = [...new Set(records.map(r => r.studentName))];

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="custom-table" style="width:100%;text-align:center;">
        <thead><tr>
          <th style="text-align:left;padding:10px;">Student</th>
          ${weeks.map(w => `<th style="padding:10px;">${w}</th>`).join('')}
          <th style="padding:10px;">Rate</th>
        </tr></thead>
        <tbody>
          ${students.map(name => {
            const stuRecs = records.filter(r => r.studentName === name);
            const present = stuRecs.filter(r => r.status === 'present').length;
            const rate = Math.round((present / weeks.length) * 100);
            return `<tr>
              <td style="text-align:left;padding:10px;font-weight:600;">${name}</td>
              ${weeks.map((w, wi) => {
                const rec = stuRecs.find(r => r.week === wi + 1);
                const status = rec ? rec.status : 'absent';
                return `<td style="padding:10px;"><span onclick="toggleAttRecord('${name}','${courseCode}',${wi+1})" style="cursor:pointer;font-size:1.1rem;" title="Click to toggle">${status === 'present' ? '✅' : '❌'}</span></td>`;
              }).join('')}
              <td style="padding:10px;font-weight:700;color:${rate>=75?'#10b981':rate>=50?'#f59e0b':'#ef4444'};">${rate}%</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:16px;">
      <button class="btn btn-primary btn-sm" onclick="showToastNotification('Attendance exported as CSV!')">📥 Export CSV</button>
    </div>`;
}

function toggleAttRecord(student, course, week) {
  if (!appState.demoAttendanceRecords) return;
  const rec = appState.demoAttendanceRecords.find(r => r.studentName === student && r.course === course && r.week === week);
  if (rec) { rec.status = rec.status === 'present' ? 'absent' : 'present'; switchAttCourse(course); }
}

function renderLecturerRubric() {
  const container = D.get('lecturer-rubric-content');
  if (!container) return;
  const templates = appState.demoRubricTemplates || [];
  container.innerHTML = `
    <div class="dashboard-grid">
      <div>
        <h4 style="margin-bottom:16px;">📋 Rubric Templates</h4>
        ${templates.map((t,i) => `
          <div class="glass" style="padding:16px;border-radius:12px;margin-bottom:12px;cursor:pointer;" onclick="loadRubricTemplate(${i})">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div><h5 style="font-size:0.9rem;">${t.name}</h5><p style="font-size:0.75rem;color:var(--text-muted);">${t.criteria.length} criteria · Max ${t.totalPoints} pts</p></div>
              <button class="btn btn-primary btn-sm">Load</button>
            </div>
          </div>`).join('')}
        <button class="btn btn-secondary" style="width:100%;margin-top:8px;" onclick="createNewRubric()">+ Create New Rubric</button>
      </div>
      <div id="rubric-editor-panel">
        <div class="glass" style="padding:24px;border-radius:14px;text-align:center;color:var(--text-muted);">
          <div style="font-size:3rem;margin-bottom:12px;">📐</div>
          <p>Select a template or create a new rubric to begin editing.</p>
        </div>
      </div>
    </div>`;
}

function loadRubricTemplate(idx) {
  const t = (appState.demoRubricTemplates || [])[idx];
  if (!t) return;
  const panel = D.get('rubric-editor-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="glass" style="padding:20px;border-radius:14px;">
      <h4 style="margin-bottom:16px;">✏️ Editing: ${t.name}</h4>
      <table class="custom-table" style="width:100%;text-align:left;">
        <thead><tr><th>Criteria</th><th>Weight</th><th>Max Score</th></tr></thead>
        <tbody>
          ${t.criteria.map(c => `
            <tr>
              <td style="padding:10px;">${c.name}</td>
              <td style="padding:10px;">${c.weight}%</td>
              <td style="padding:10px;">${c.maxScore}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:16px;display:flex;gap:10px;">
        <button class="btn btn-primary btn-sm" onclick="showToastNotification('Rubric saved and published to students!')">Save & Publish</button>
        <button class="btn btn-secondary btn-sm" onclick="showToastNotification('Rubric exported as PDF!')">Export PDF</button>
      </div>
    </div>`;
}

function createNewRubric() {
  const panel = D.get('rubric-editor-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="glass" style="padding:20px;border-radius:14px;">
      <h4 style="margin-bottom:16px;">➕ New Rubric</h4>
      <div class="form-group"><label>Rubric Name</label><input type="text" class="form-control" placeholder="e.g. CS101 Assignment 2 Rubric"></div>
      <div class="form-group"><label>Assignment</label><select class="form-control"><option>CS101 – Programming Assignment 2</option><option>ENG201 – System Design Report</option></select></div>
      <div id="rubric-criteria-list" style="margin-bottom:16px;"></div>
      <button class="btn btn-secondary btn-sm" onclick="addRubricCriterion()">+ Add Criterion</button>
      <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="showToastNotification('New rubric created!')">Create Rubric</button>
    </div>`;
}

function addRubricCriterion() {
  const list = D.get('rubric-criteria-list');
  if (!list) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;';
  div.innerHTML = `
    <input type="text" class="form-control" placeholder="Criterion name">
    <input type="number" class="form-control" placeholder="Weight %" value="25">
    <input type="number" class="form-control" placeholder="Max pts" value="20">
    <button class="btn btn-sm" style="background:rgba(239,68,68,0.15);color:#ef4444;height:38px;" onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(div);
}

function renderLecturerEarlyWarning() {
  const container = D.get('lecturer-early-warning-content');
  if (!container) return;
  const students = (appState.students || []).map(s => ({
    ...s,
    risk: s.cgpa < 2.0 ? 'High' : s.cgpa < 2.5 ? 'Medium' : 'Low',
    riskColor: s.cgpa < 2.0 ? '#ef4444' : s.cgpa < 2.5 ? '#f59e0b' : '#10b981'
  }));

  const highRisk = students.filter(s => s.risk === 'High').length;
  const medRisk = students.filter(s => s.risk === 'Medium').length;

  container.innerHTML = `
    <div class="metrics-row" style="margin-bottom:24px;">
      <div class="metric-card glass" style="border-left:3px solid #ef4444;">
        <div class="metric-icon-box" style="background:rgba(239,68,68,0.1);color:#ef4444;">🚨</div>
        <div class="metric-info"><p>High Risk</p><h3>${highRisk}</h3></div>
      </div>
      <div class="metric-card glass" style="border-left:3px solid #f59e0b;">
        <div class="metric-icon-box" style="background:rgba(245,158,11,0.1);color:#f59e0b;">⚠️</div>
        <div class="metric-info"><p>Medium Risk</p><h3>${medRisk}</h3></div>
      </div>
      <div class="metric-card glass" style="border-left:3px solid #10b981;">
        <div class="metric-icon-box" style="background:rgba(16,185,129,0.1);color:#10b981;">✅</div>
        <div class="metric-info"><p>On Track</p><h3>${students.length - highRisk - medRisk}</h3></div>
      </div>
    </div>
    <div class="glass" style="padding:20px;border-radius:14px;overflow-x:auto;">
      <h4 style="margin-bottom:16px;">📋 Student Risk Register</h4>
      <table class="custom-table" style="width:100%;text-align:left;">
        <thead><tr><th>Student</th><th>Department</th><th>CGPA</th><th>Risk Level</th><th>Action</th></tr></thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td style="padding:10px;font-weight:600;">${s.name}</td>
              <td style="padding:10px;color:var(--text-muted);font-size:0.82rem;">${s.department}</td>
              <td style="padding:10px;font-weight:700;color:${s.riskColor};">${s.cgpa}</td>
              <td style="padding:10px;"><span style="padding:3px 10px;border-radius:6px;background:${s.riskColor}22;color:${s.riskColor};font-size:0.72rem;font-weight:700;">${s.risk}</span></td>
              <td style="padding:10px;"><button class="btn btn-secondary btn-sm" style="font-size:0.7rem;" onclick="showToastNotification('Intervention email sent to ${s.name}')">Send Alert</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderLecturerSupervision() {
  const container = D.get('lecturer-supervision-content');
  if (!container) return;
  const projects = appState.demoSupervisionProjects || [];
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
      ${projects.map(p => `
        <div class="glass" style="padding:20px;border-radius:14px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
            <h4 style="font-size:0.92rem;flex:1;margin-right:8px;">${p.title}</h4>
            <span class="badge ${p.status==='Completed'?'badge-success':p.status==='In Progress'?'badge-primary':'badge-warning'}" style="font-size:0.62rem;white-space:nowrap;">${p.status}</span>
          </div>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">👤 ${p.studentName}</p>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">🏷️ ${p.department} · ${p.year}</p>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:0.72rem;color:var(--text-muted);">Progress</span>
              <span style="font-size:0.72rem;font-weight:700;">${p.progress}%</span>
            </div>
            <div style="height:6px;background:rgba(0,0,0,0.2);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${p.progress}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:3px;"></div>
            </div>
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);">
            <strong>Next Milestone:</strong> ${p.nextMilestone}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="btn btn-secondary btn-sm" style="flex:1;font-size:0.7rem;" onclick="showToastNotification('Feedback sent to ${p.studentName}')">📝 Feedback</button>
            <button class="btn btn-primary btn-sm" style="flex:1;font-size:0.7rem;" onclick="showToastNotification('Meeting scheduled!')">📅 Meet</button>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderLecturerOfficeHours() {
  const container = D.get('lecturer-office-hours-content');
  if (!container) return;
  const slots = appState.demoOfficeHours || [];
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  container.innerHTML = `
    <div class="dashboard-grid">
      <div>
        <h4 style="margin-bottom:16px;">📅 Your Office Hours Schedule</h4>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${days.map(day => {
            const daySlots = slots.filter(s => s.day === day);
            return `
              <div class="glass" style="padding:14px;border-radius:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font-size:0.88rem;">${day}</strong>
                  ${daySlots.length ? daySlots.map(s => `<span style="font-size:0.78rem;color:var(--primary);font-weight:600;">${s.time} — ${s.location}</span>`).join('') : '<span style="font-size:0.75rem;color:var(--text-muted);">No scheduled hours</span>'}
                </div>
              </div>`;
          }).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="showToastNotification('Office hours published to students!')">📢 Publish Hours</button>
      </div>
      <div class="widget glass">
        <h4 style="margin-bottom:16px;">🗓️ Incoming Bookings</h4>
        ${(appState.demoOfficeBookings || []).map(b => `
          <div style="padding:12px;border-radius:10px;background:rgba(124,58,237,0.07);margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <strong style="font-size:0.85rem;">${b.student}</strong>
              <span class="badge badge-primary" style="font-size:0.6rem;">${b.status}</span>
            </div>
            <p style="font-size:0.73rem;color:var(--text-muted);">${b.topic} · ${b.dateTime}</p>
            <div style="display:flex;gap:6px;margin-top:8px;">
              <button class="btn btn-success btn-sm" style="font-size:0.65rem;" onclick="showToastNotification('Booking confirmed!')">Confirm</button>
              <button class="btn btn-sm" style="font-size:0.65rem;background:rgba(239,68,68,0.15);color:#ef4444;" onclick="showToastNotification('Booking cancelled.')">Cancel</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderLecturerAiInsights() {
  const container = D.get('lecturer-ai-insights-content');
  if (!container) return;
  const students = appState.students || [];
  const avgCgpa = students.length ? (students.reduce((a,s) => a + s.cgpa, 0) / students.length).toFixed(2) : 'N/A';
  container.innerHTML = `
    <div class="dashboard-grid">
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="widget glass">
          <h4 style="margin-bottom:12px;">🎯 AI Teaching Recommendations</h4>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${[
              {icon:'📊',tip:'Consider dedicating extra lecture time to recursion — 68% of CS101 students showed difficulty in this area based on recent quiz analytics.', priority:'High'},
              {icon:'💡',tip:'Adding worked examples for Big O Notation could improve comprehension scores. Students who received worked examples scored 22% higher.', priority:'Medium'},
              {icon:'🎤',tip:'Interactive polls during lectures have improved engagement by 41% in similar courses. Consider integrating quick quizzes.', priority:'Low'},
            ].map(t => `
              <div style="padding:12px;border-radius:10px;background:rgba(124,58,237,0.07);border-left:3px solid ${t.priority==='High'?'#ef4444':t.priority==='Medium'?'#f59e0b':'#10b981'};">
                <div style="display:flex;gap:8px;align-items:flex-start;">
                  <span style="font-size:1.2rem;">${t.icon}</span>
                  <div>
                    <span class="badge" style="font-size:0.6rem;background:${t.priority==='High'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)'};color:${t.priority==='High'?'#ef4444':'#f59e0b'};margin-bottom:4px;">${t.priority} Priority</span>
                    <p style="font-size:0.78rem;color:var(--text-muted);line-height:1.5;">${t.tip}</p>
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="widget glass">
          <h4 style="margin-bottom:12px;">📈 Class Performance Summary</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="text-align:center;padding:12px;border-radius:10px;background:rgba(16,185,129,0.08);">
              <div style="font-size:1.8rem;font-weight:800;color:#10b981;">${avgCgpa}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">Average CGPA</div>
            </div>
            <div style="text-align:center;padding:12px;border-radius:10px;background:rgba(124,58,237,0.08);">
              <div style="font-size:1.8rem;font-weight:800;color:var(--primary);">${students.length}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">Active Students</div>
            </div>
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="widget glass">
          <h4 style="margin-bottom:12px;">🔥 Common Struggle Topics</h4>
          ${[['Recursion & Backtracking',85],['Pointer Arithmetic',72],['Big-O Complexity',68],['Dynamic Programming',55],['Tree Traversals',48]].map(([topic,pct]) => `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:0.78rem;">${topic}</span>
                <span style="font-size:0.72rem;font-weight:700;color:${pct>70?'#ef4444':pct>55?'#f59e0b':'#10b981'};">${pct}% struggle</span>
              </div>
              <div style="height:5px;background:rgba(0,0,0,0.15);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${pct>70?'linear-gradient(90deg,#ef4444,#f87171)':pct>55?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#10b981,#34d399)'};border-radius:3px;"></div>
              </div>
            </div>`).join('')}
        </div>
        <div class="widget glass">
          <h4 style="margin-bottom:12px;">📅 Suggested Next Lecture Topics</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;">
            ${['Review Recursion with 3 new examples','Live coding: Linked List manipulation','Group problem solving — Sorting algorithms','Mid-term exam preparation Q&A session'].map(t => `<li style="font-size:0.82rem;padding:8px 12px;border-radius:8px;background:rgba(124,58,237,0.07);">📌 ${t}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>`;
}


/* ============================================================
   SECTION 3: RESEARCH HUB EXPANSION
   ============================================================ */
function renderResearchHubExpanded() {
  const tab = appState.researchHubTab || 'projects';
  renderResearchTab(tab);
}

function switchResearchTab(tab) {
  appState.researchHubTab = tab;
  document.querySelectorAll('.research-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = D.get(`res-tab-${tab}`);
  if (btn) btn.classList.add('active');
  renderResearchTab(tab);
}

function renderResearchTab(tab) {
  const body = D.get('research-hub-body');
  if (!body) return;

  if (tab === 'projects') {
    const projects = appState.demoResearchProjects || [];
    const cols = {'Planning':[],'In Progress':[],'Submitted':[]};
    projects.forEach(p => { if (cols[p.status]) cols[p.status].push(p); });
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">🗂️ Research Project Kanban Board</h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;overflow-x:auto;">
        ${Object.entries(cols).map(([col, items]) => `
          <div style="background:rgba(0,0,0,0.1);border-radius:14px;padding:16px;min-height:300px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${col==='Submitted'?'#10b981':col==='In Progress'?'var(--primary)':'#f59e0b'};"></div>
              <strong style="font-size:0.88rem;">${col}</strong>
              <span class="badge" style="font-size:0.6rem;margin-left:auto;">${items.length}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${items.map(p => `
                <div class="glass" style="padding:14px;border-radius:10px;cursor:grab;">
                  <h5 style="font-size:0.82rem;margin-bottom:6px;">${p.title}</h5>
                  <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">👤 ${p.researcher} · 📅 ${p.deadline}</p>
                  <div style="display:flex;flex-wrap:wrap;gap:4px;">
                    <span class="badge" style="font-size:0.58rem;background:rgba(124,58,237,0.1);color:var(--primary);">${p.domain}</span>
                    ${p.funded?'<span class="badge badge-success" style="font-size:0.58rem;">Funded</span>':''}
                  </div>
                </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'grants') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">💰 Grant Applications Tracker</h4>
      ${(appState.demoGrantApplications || []).map(g => `
        <div class="glass" style="padding:18px;border-radius:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h4 style="font-size:0.92rem;margin-bottom:4px;">${g.title}</h4>
            <p style="font-size:0.75rem;color:var(--text-muted);">Funder: ${g.funder} · Deadline: ${g.deadline}</p>
            <p style="font-size:0.75rem;color:var(--success);font-weight:600;">Amount: ${g.amount}</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="badge ${g.status==='Approved'?'badge-success':g.status==='Pending'?'badge-warning':'badge-primary'}" style="font-size:0.65rem;">${g.status}</span>
            <button class="btn btn-secondary btn-sm" onclick="showToastNotification('Application details opened!')">View</button>
          </div>
        </div>`).join('')}
      <button class="btn btn-primary" style="margin-top:8px;" onclick="showToastNotification('New grant application form opened!')">+ New Application</button>`;

  } else if (tab === 'conferences') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">🌍 Upcoming Academic Conferences</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        ${(appState.demoConferences || []).map(c => `
          <div class="glass" style="padding:18px;border-radius:14px;">
            <div style="font-size:2rem;margin-bottom:10px;">${c.emoji}</div>
            <span class="badge badge-primary" style="font-size:0.6rem;">${c.type}</span>
            <h4 style="font-size:0.88rem;margin:8px 0;">${c.name}</h4>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">📅 ${c.date}</p>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px;">📍 ${c.location}</p>
            <p style="font-size:0.73rem;color:var(--text-muted);margin-bottom:12px;">Deadline: <strong style="color:#f59e0b;">${c.submissionDeadline}</strong></p>
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="showToastNotification('Abstract submission form opened!')">Submit Abstract</button>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'ethics') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">⚖️ Ethics Approval Workflow</h4>
      <div class="widget glass" style="padding:24px;">
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${[
            {step:1,label:'Initial Application',status:'complete'},
            {step:2,label:'Department Review',status:'complete'},
            {step:3,label:'IRB Panel Review',status:'active'},
            {step:4,label:'Revision & Resubmission',status:'pending'},
            {step:5,label:'Final Approval Certificate',status:'pending'},
          ].map(s => `
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:36px;height:36px;border-radius:50%;background:${s.status==='complete'?'#10b981':s.status==='active'?'var(--primary)':'rgba(0,0,0,0.2)'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;">
                ${s.status==='complete'?'✓':s.step}
              </div>
              <div style="flex:1;">
                <strong style="font-size:0.88rem;color:${s.status==='active'?'var(--primary)':'inherit'}">${s.label}</strong>
                <p style="font-size:0.72rem;color:var(--text-muted);">${s.status==='complete'?'Completed':s.status==='active'?'In Progress — Awaiting reviewer':'Not started'}</p>
              </div>
              ${s.status==='active'?'<button class="btn btn-primary btn-sm" onclick="showToastNotification(\'Reminder sent to IRB panel!\')">Ping Reviewer</button>':''}
            </div>
            ${s.step<5?'<div style="width:2px;height:16px;background:rgba(0,0,0,0.15);margin-left:17px;"></div>':''}`).join('')}
        </div>
      </div>`;
  }
}


/* ============================================================
   SECTION 4: INDUSTRY PARTNER HUB
   ============================================================ */
function renderPartnerHubTab(tab) {
  appState.partnerHubTab = tab;
  document.querySelectorAll('.partner-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = D.get(`partner-tab-${tab}`);
  if (btn) btn.classList.add('active');

  const body = D.get('partner-hub-body');
  if (!body) return;

  const partners = appState.demoPartnerOrgs || [];
  const internships = appState.demoInternshipListings || [];

  if (tab === 'profile') {
    const org = partners[0] || {};
    body.innerHTML = `
      <div class="dashboard-grid">
        <div class="widget glass">
          <h4 style="margin-bottom:16px;">🏢 Organization Profile</h4>
          <div class="form-group"><label>Company Name</label><input type="text" class="form-control" value="${org.name||''}"></div>
          <div class="form-group"><label>Sector</label><select class="form-control"><option selected>${org.sector||'Technology'}</option><option>Finance</option><option>Healthcare</option><option>Engineering</option></select></div>
          <div class="form-group"><label>Description</label><textarea class="form-control" rows="3">${org.description||''}</textarea></div>
          <div class="form-group"><label>Website</label><input type="url" class="form-control" value="${org.website||'https://'}"></div>
          <button class="btn btn-primary" style="width:100%;" onclick="showToastNotification('Profile updated successfully!')">💾 Save Profile</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="widget glass">
            <h4 style="margin-bottom:12px;">📊 Partnership Stats</h4>
            ${[['Students Hired',org.studentsHired||0,'#10b981'],['Interns Hosted',org.internsHosted||0,'var(--primary)'],['Open Roles',internships.length,'#f59e0b']].map(([label,val,color]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                <span style="font-size:0.85rem;">${label}</span>
                <strong style="color:${color};font-size:1.1rem;">${val}</strong>
              </div>`).join('')}
          </div>
          <div class="widget glass">
            <h4 style="margin-bottom:12px;">📄 Partnership Agreement</h4>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">MOU Status: <span style="color:#10b981;font-weight:700;">Active · Expires Dec 2026</span></p>
            <button class="btn btn-secondary" style="width:100%;" onclick="showToastNotification('MOU document opened for review!')">📋 View MOU</button>
          </div>
        </div>
      </div>`;

  } else if (tab === 'internships') {
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <h4>💼 Internship Listings Manager</h4>
        <button class="btn btn-primary btn-sm" onclick="showToastNotification('New internship form opened!')">+ Post Internship</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${internships.map((i, idx) => `
          <div class="glass" style="padding:18px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <h4 style="font-size:0.92rem;margin-bottom:4px;">${i.title}</h4>
              <p style="font-size:0.78rem;color:var(--text-muted);">${i.department} · ${i.duration} · GHC ${i.stipend}/month</p>
              <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                <span class="badge badge-success" style="font-size:0.6rem;">${i.applicants} Applicants</span>
                <span class="badge badge-primary" style="font-size:0.6rem;">${i.status}</span>
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" style="font-size:0.7rem;" onclick="viewInternshipApplicants(${idx})">👥 View Applicants</button>
              <button class="btn btn-sm" style="font-size:0.7rem;background:rgba(239,68,68,0.15);color:#ef4444;" onclick="showToastNotification('Listing closed.')">Close</button>
            </div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'recruitment') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">🎓 Graduate Recruitment Portal</h4>
      <div class="glass" style="padding:16px;border-radius:12px;margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <input type="text" class="form-control" placeholder="Search by name or department..." style="max-width:300px;">
        <select class="form-control" style="max-width:200px;"><option>All Departments</option><option>Computer Science</option><option>Engineering</option><option>Business</option></select>
        <select class="form-control" style="max-width:160px;"><option>All Years</option><option>Final Year</option><option>3rd Year</option></select>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
        ${(appState.students || []).slice(0,6).map(s => `
          <div class="glass" style="padding:16px;border-radius:12px;text-align:center;">
            <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:1.3rem;">👤</div>
            <h5 style="font-size:0.88rem;margin-bottom:4px;">${s.name}</h5>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">${s.department}</p>
            <p style="font-size:0.72rem;color:var(--primary);font-weight:600;margin-bottom:10px;">CGPA: ${s.cgpa}</p>
            <div style="display:flex;gap:6px;justify-content:center;">
              <button class="btn btn-primary btn-sm" style="font-size:0.65rem;" onclick="showToastNotification('Interview invite sent to ${s.name}!')">Shortlist</button>
              <button class="btn btn-secondary btn-sm" style="font-size:0.65rem;">Profile</button>
            </div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'analytics') {
    body.innerHTML = `
      <h4 style="margin-bottom:20px;">📊 Skills Demand Analytics</h4>
      <div class="dashboard-grid">
        <div class="widget glass">
          <h4 style="margin-bottom:16px;">🔥 Most In-Demand Graduate Skills</h4>
          ${[['Python / Data Science',92],['React / Frontend Dev',87],['Data Analysis & SQL',83],['Cloud (AWS/GCP)',76],['Communication & Soft Skills',71],['Project Management',65],['Cybersecurity',58],['Machine Learning',52]].map(([skill,pct]) => `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:0.8rem;">${skill}</span>
                <span style="font-size:0.75rem;font-weight:700;color:var(--primary);">${pct}%</span>
              </div>
              <div style="height:5px;background:rgba(0,0,0,0.15);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:3px;"></div>
              </div>
            </div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="widget glass">
            <h4 style="margin-bottom:12px;">📈 Hiring Trends</h4>
            ${[['Q1 2026','14 hires'],['Q2 2026','22 hires'],['Q3 2026 (Projected)','31 hires']].map(([q,h]) => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
                <span style="font-size:0.82rem;">${q}</span>
                <strong style="color:var(--primary);">${h}</strong>
              </div>`).join('')}
          </div>
          <div class="widget glass">
            <h4 style="margin-bottom:12px;">🎯 Top Recruiting Universities</h4>
            ${[['Ashesi University','38%'],['KNUST','29%'],['UG Legon','22%'],['Others','11%']].map(([uni,pct]) => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
                <span style="font-size:0.78rem;">${uni}</span>
                <span class="badge badge-primary" style="font-size:0.6rem;">${pct}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }
}


/* ============================================================
   SECTION 5: CAREER ADVISOR DASHBOARD
   ============================================================ */
function renderAdvisorDashboard() {
  const tab = appState.advisorTab || 'profiles';
  renderAdvisorTab(tab);
}

function switchAdvisorTab(tab) {
  appState.advisorTab = tab;
  document.querySelectorAll('.advisor-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = D.get(`advisor-tab-${tab}`);
  if (btn) btn.classList.add('active');
  renderAdvisorTab(tab);
}

function renderAdvisorTab(tab) {
  const body = D.get('advisor-dashboard-body');
  if (!body) return;
  const students = appState.demoCareerStudents || [];
  let jobs = appState.demoCareerJobs || [];
  if (appState.adminJobListings && appState.adminJobListings.length > 0) {
    const mappedAdminJobs = appState.adminJobListings.map(j => ({
      title: j.title,
      company: j.company,
      location: j.location || 'Remote/Ghana',
      salary: j.salary || 'Competitive',
      type: j.type || 'Full-Time',
      match: Math.floor(Math.random() * 20) + 75 // Mock match percentage
    }));
    jobs = [...mappedAdminJobs, ...jobs];
  }
  const qa = appState.demoInterviewQA || [];

  if (tab === 'profiles') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">👤 Student Career Profiles</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
        ${students.map(s => `
          <div class="glass" style="padding:18px;border-radius:14px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.3rem;">👤</div>
              <div>
                <strong style="font-size:0.88rem;">${s.name}</strong>
                <p style="font-size:0.72rem;color:var(--text-muted);">${s.program} · Level ${s.level}</p>
              </div>
            </div>
            <div style="margin-bottom:10px;">
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">Career Goal</div>
              <div style="font-size:0.82rem;font-weight:600;color:var(--primary);">${s.careerGoal}</div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;">
              ${s.skills.map(sk => `<span class="badge" style="font-size:0.58rem;background:rgba(124,58,237,0.1);color:var(--primary);">${sk}</span>`).join('')}
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-primary btn-sm" style="flex:1;font-size:0.7rem;" onclick="showToastNotification('Career session booked with ${s.name}!')">📅 Book Session</button>
              <button class="btn btn-secondary btn-sm" style="flex:1;font-size:0.7rem;" onclick="viewStudentCareerPlan('${s.name}')">📋 Plan</button>
            </div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'appointments') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">📅 Appointment Scheduler</h4>
      <div class="dashboard-grid">
        <div class="widget glass">
          <h4 style="margin-bottom:12px;">📋 Upcoming Sessions</h4>
          ${(appState.demoAdvisorSessions || []).map(s => `
            <div style="padding:12px;border-radius:10px;background:rgba(124,58,237,0.07);margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <strong style="font-size:0.85rem;">${s.studentName}</strong>
                <span class="badge badge-primary" style="font-size:0.6rem;">${s.type}</span>
              </div>
              <p style="font-size:0.72rem;color:var(--text-muted);">${s.topic}</p>
              <p style="font-size:0.72rem;color:var(--text-muted);">📅 ${s.dateTime} · ⏱️ ${s.duration}</p>
              <div style="display:flex;gap:6px;margin-top:8px;">
                <button class="btn btn-success btn-sm" style="font-size:0.65rem;" onclick="showToastNotification('Session confirmed!')">Confirm</button>
                <button class="btn btn-secondary btn-sm" style="font-size:0.65rem;" onclick="showToastNotification('Session rescheduled.')">Reschedule</button>
              </div>
            </div>`).join('')}
        </div>
        <div class="widget glass">
          <h4 style="margin-bottom:12px;">+ New Appointment</h4>
          <div class="form-group"><label>Student</label><select class="form-control">${students.map(s=>`<option>${s.name}</option>`).join('')}</select></div>
          <div class="form-group"><label>Session Type</label><select class="form-control"><option>CV Review</option><option>Career Planning</option><option>Interview Prep</option><option>Job Application Help</option></select></div>
          <div class="form-group"><label>Date & Time</label><input type="datetime-local" class="form-control"></div>
          <button class="btn btn-primary" style="width:100%;" onclick="showToastNotification('Appointment booked and student notified!')">Book Session</button>
        </div>
      </div>`;

  } else if (tab === 'jobs') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">🔍 Job Recommendation Engine</h4>
      <div class="glass" style="padding:16px;border-radius:12px;margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
        <div class="form-group" style="margin:0;flex:1;min-width:200px;">
          <label style="font-size:0.75rem;">Select Student Profile</label>
          <select class="form-control" id="advisor-job-student">${students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select>
        </div>
        <button class="btn btn-primary" onclick="runJobRecommendation()">Find Matches 🔍</button>
      </div>
      <div id="advisor-job-results">
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${jobs.map(j => `
            <div class="glass" style="padding:16px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <div>
                <h5 style="font-size:0.9rem;margin-bottom:4px;">${j.title}</h5>
                <p style="font-size:0.78rem;color:var(--text-muted);">${j.company} · ${j.location}</p>
                <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                  <span class="badge badge-success" style="font-size:0.58rem;">${j.salary}</span>
                  <span class="badge badge-primary" style="font-size:0.58rem;">${j.type}</span>
                  <span class="badge" style="font-size:0.58rem;background:rgba(16,185,129,0.15);color:#10b981;">${j.match}% match</span>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" style="font-size:0.72rem;" onclick="showToastNotification('Referred ${j.title} to student!')">Refer Student →</button>
            </div>`).join('')}
        </div>
      </div>`;

  } else if (tab === 'interview') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">🎤 Interview Preparation Deck</h4>
      <p style="color:var(--text-muted);margin-bottom:20px;font-size:0.88rem;">Click any card to reveal the answer. Use these to prepare students for technical and HR interviews.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
        ${qa.map((item, idx) => `
          <div class="glass interview-flip-card" id="qa-card-${idx}" style="padding:20px;border-radius:14px;cursor:pointer;min-height:140px;display:flex;flex-direction:column;justify-content:space-between;" onclick="flipInterviewCard(${idx})">
            <div>
              <span class="badge badge-primary" style="font-size:0.6rem;margin-bottom:8px;">${item.category}</span>
              <p id="qa-q-${idx}" style="font-size:0.85rem;font-weight:600;line-height:1.5;margin-bottom:10px;">Q: ${item.question}</p>
              <div id="qa-a-${idx}" style="display:none;font-size:0.78rem;color:var(--text-muted);line-height:1.5;border-top:1px solid var(--border);padding-top:10px;margin-top:10px;">💡 ${item.answer}</div>
            </div>
            <div style="font-size:0.65rem;color:var(--text-muted);text-align:right;">Click to reveal answer</div>
          </div>`).join('')}
      </div>`;

  } else if (tab === 'outcomes') {
    body.innerHTML = `
      <h4 style="margin-bottom:16px;">📊 Graduate Outcome Tracker</h4>
      <div class="metrics-row" style="margin-bottom:24px;">
        ${[['Placed in Employment',78,'#10b981'],['Pursuing Further Study',12,'#6366f1'],['Self-Employed/Startup',6,'#f59e0b'],['Still Job Seeking',4,'#ef4444']].map(([label,pct,color]) => `
          <div class="metric-card glass" style="text-align:center;border-left:3px solid ${color};">
            <div style="font-size:2rem;font-weight:800;color:${color};">${pct}%</div>
            <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.4;">${label}</div>
          </div>`).join('')}
      </div>
      <div class="widget glass">
        <h4 style="margin-bottom:16px;">📋 Individual Outcome Records</h4>
        ${students.map(s => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px;">
            <div>
              <strong style="font-size:0.88rem;">${s.name}</strong>
              <p style="font-size:0.75rem;color:var(--text-muted);">${s.program} · ${s.careerGoal}</p>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="badge badge-success" style="font-size:0.6rem;">Tracking Active</span>
              <button class="btn btn-secondary btn-sm" style="font-size:0.65rem;" onclick="showToastNotification('Outcome updated!')">Update</button>
            </div>
          </div>`).join('')}
      </div>`;
  }
}

function flipInterviewCard(idx) {
  const answer = D.get(`qa-a-${idx}`);
  const card = D.get(`qa-card-${idx}`);
  if (answer) {
    const showing = answer.style.display !== 'none';
    answer.style.display = showing ? 'none' : 'block';
    if (card) card.style.background = showing ? '' : 'rgba(124,58,237,0.12)';
  }
}

function runJobRecommendation() {
  showToastNotification('AI job matching complete! Showing top matches based on student profile.');
}

function viewStudentCareerPlan(name) {
  showToastNotification(`Opening career roadmap for ${name}...`);
}

/* ============================================================
   SECTION 6: SHARED UTILITY
   ============================================================ */
function initEnhancedHubs() {
  // Pre-populate demo plagiarism reports into appState if not already set
  if (!appState.demoPlagiarismReports) {
    appState.demoPlagiarismReports = (typeof DEMO_PLAGIARISM_REPORTS !== 'undefined') ? DEMO_PLAGIARISM_REPORTS : [];
  }
}

// Auto-init after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedHubs);
} else {
  initEnhancedHubs();
}

window.viewInternshipApplicants = function(idx, filter = 'all') {
  const internships = appState.demoInternshipListings || [];
  const internship = internships[idx];
  if (!internship) return;

  const body = document.getElementById('partner-hub-body');
  if (!body) return;

  // Mock applicants
  if (!internship._cachedApplicants) {
    const allStudents = appState.demoCareerStudents || appState.students || [];
    const numApplicants = internship.applicants;
    let applicants = [];
    for (let i = 0; i < numApplicants; i++) {
      const student = allStudents[i % allStudents.length];
      applicants.push({
        id: student?.id || `app_${i}`,
        name: student?.name || `Applicant ${i+1}`,
        department: student?.program || student?.department || 'General',
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-99
        status: i === 0 ? 'Shortlisted' : 'Pending',
        skills: student?.skills || ['Communication', 'Teamwork']
      });
    }
    internship._cachedApplicants = applicants;
  }
  
  let applicants = internship._cachedApplicants;
  if (filter === 'shortlisted') {
    applicants = applicants.filter(a => a.status === 'Shortlisted');
  }

  body.innerHTML = `
    <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-secondary btn-sm" onclick="renderPartnerHubTab('internships')">← Back to Internships</button>
      <div style="display:flex; gap:10px;">
        <button class="btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="viewInternshipApplicants(${idx}, 'all')">All Applicants (${internship._cachedApplicants.length})</button>
        <button class="btn ${filter === 'shortlisted' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="viewInternshipApplicants(${idx}, 'shortlisted')">Shortlisted (${internship._cachedApplicants.filter(a => a.status === 'Shortlisted').length})</button>
      </div>
    </div>
    <div style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">👥 ${filter === 'shortlisted' ? 'Shortlisted ' : ''}Applicants for ${internship.title}</h3>
      <p style="color:var(--text-muted);">Review and shortlist candidates for this position.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${applicants.length === 0 ? '<p style="color:var(--text-muted);">No applicants found.</p>' : ''}
      ${applicants.map((a, appIdx) => {
        // Need the real index in the cached array for shortlisting
        const realIdx = internship._cachedApplicants.findIndex(ca => ca === a);
        return `
        <div class="glass" style="padding:18px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.4rem;">👤</div>
            <div>
              <h4 style="font-size:1rem;margin-bottom:4px;">${a.name}</h4>
              <p style="font-size:0.78rem;color:var(--text-muted);">${a.department}</p>
              <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                ${a.skills.map(s => `<span class="badge" style="background:rgba(124,58,237,0.1);color:var(--primary);font-size:0.6rem;">${s}</span>`).join('')}
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
            <div style="font-size:0.75rem;font-weight:700;color:${a.matchScore >= 90 ? '#10b981' : '#f59e0b'};">Match: ${a.matchScore}%</div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" style="font-size:0.7rem;" onclick="viewApplicantResume('${a.name}', '${a.department}')">📄 Resume</button>
              ${a.status === 'Shortlisted' 
                ? `<button class="btn btn-success btn-sm" style="font-size:0.7rem;" disabled>✅ Shortlisted</button>` 
                : `<button class="btn btn-primary btn-sm" style="font-size:0.7rem;" id="shortlist-btn-${realIdx}" onclick="shortlistApplicant(${idx}, ${realIdx})">Shortlist</button>`
              }
            </div>
          </div>
        </div>
      `}).join('')}
    </div>
  `;
};

window.shortlistApplicant = function(internshipIdx, applicantIdx) {
  const internship = appState.demoInternshipListings[internshipIdx];
  const applicant = internship._cachedApplicants[applicantIdx];
  applicant.status = 'Shortlisted';

  if (typeof showToastNotification === 'function') {
    showToastNotification(`${applicant.name} has been shortlisted for an interview.`);
  } else {
    alert(`${applicant.name} has been shortlisted for an interview.`);
  }
  const btn = document.getElementById(`shortlist-btn-${applicantIdx}`);
  if (btn) {
    btn.className = 'btn btn-success btn-sm';
    btn.innerHTML = '✅ Shortlisted';
    btn.disabled = true;
  }
};

window.viewApplicantResume = function(name, department) {
  const modal = document.getElementById('applicant-resume-modal');
  if (modal) {
    document.getElementById('resume-modal-name').textContent = name;
    document.getElementById('resume-modal-dept').textContent = department;
    modal.style.display = 'flex';
  }
};

window.closeResumeModal = function() {
  const modal = document.getElementById('applicant-resume-modal');
  if (modal) modal.style.display = 'none';
};

