/* SMARTLEARN AI - ADVISORY, GPA & QUIZ SERVICES */

let careerChatHistory = [];

async function sendCareerChatMessage() {
  const input = D.get('career-chat-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  appendCareerChatMessage('user', text);
  careerChatHistory.push({ role: 'user', content: text });
  input.value = '';
  
  const box = D.get('career-chat-log');
  const typing = document.createElement('div');
  typing.className = 'message-bubble message-ai typing-indicator';
  typing.innerHTML = 'Assessing...';
  box.appendChild(typing);
  box.scrollTop = box.scrollHeight;
  
  try {
    const prompt = `User's response: "${text}". If they have stated any specific interest, hobby, or subject, output exactly: "RECOMMENDATION_READY" and do not output any other text. Only ask 1 follow up question if their answer was extremely vague. Do not drag out the conversation.`;
    const res = await executeClientAiRequest(prompt, "You are an expert career advisor assessing a student via chat. Keep your replies very short (1-2 sentences).", 'career');
    typing.remove();
    
    if (res.includes('RECOMMENDATION_READY')) {
       showCareerResults();
    } else {
       appendCareerChatMessage('ai', res);
       careerChatHistory.push({ role: 'assistant', content: res });
    }
  } catch (err) {
    typing.remove();
    const errBubble = document.createElement('div'); errBubble.className = 'message-bubble message-ai'; errBubble.style.color = 'var(--danger)'; errBubble.textContent = `Error: ${err.message}`; box.appendChild(errBubble);
  }
}

function appendCareerChatMessage(sender, text) {
  const box = D.get('career-chat-log'); if (!box) return;
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-ai'}`;
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  box.appendChild(bubble); box.scrollTop = box.scrollHeight;
}

async function showCareerResults() {
  D.show('career-quiz-box', false); D.show('career-result-box', true);
  D.html('career-result-title', `Analyzing Your Profile...`);
  D.html('career-result-desc', 'Please wait while AI constructs your personalized recommendation...');
  D.html('career-result-skills', ''); D.html('career-result-unis', '');
  
  const summaryPrompt = "Based on the conversation history, recommend 1 specific career track, salary range in GH₵, demand level, top 4 skills to build, 2 top Ghanaian universities to attend for this, the specific program/degree to offer, and 3-4 electives or courses to take. Output JSON: { \"track\": \"string\", \"desc\": \"string\", \"salary\": \"string\", \"demand\": \"string\", \"skills\": [\"string\"], \"unis\": [\"string\"], \"program\": \"string\", \"courses\": [\"string\"] }";
  
  try {
    const res = await executeClientAiRequest(summaryPrompt, "You are a JSON-only career generator. Do not include markdown blocks.", 'career');
    let clean = res.trim(); if (clean.includes('{')) clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1);
    const data = JSON.parse(clean);
    
    D.html('career-result-title', `Recommended Track: ${data.track}`);
    D.html('career-result-desc', data.desc);
    D.html('career-result-salary', data.salary);
    D.html('career-result-demand', data.demand);
    D.html('career-result-skills', (data.skills || []).map(s => `<span class="badge badge-primary">${s}</span>`).join(' '));
    D.html('career-result-unis', (data.unis || []).map(u => `<li>📍 <strong>${u}</strong> - Highly recommended</li>`).join(''));
    
    const programStr = data.program || 'General Studies';
    D.html('career-result-program', `🎓 ${programStr}`);
    D.html('career-result-courses', (data.courses || []).map(c => `<span class="badge" style="background:rgba(255,255,255,0.05); border:1px solid var(--border);">${c}</span>`).join(' '));
  } catch (e) {
    D.html('career-result-title', `Recommended Track: Business Administration`);
    D.html('career-result-desc', "A broad field suitable for your diverse interests.");
  }
}

function resetCareerQuiz() {
  careerChatHistory = [];
  D.show('career-quiz-box', true); D.show('career-result-box', false);
  const log = D.get('career-chat-log');
  if (log) log.innerHTML = '';
  
  const initMsg = "Hello! I am your AI Career Advisor. Briefly tell me your main interests, hobbies, or favorite subjects, and I will instantly match you with a career, university, and program in Ghana!";
  appendCareerChatMessage('ai', initMsg);
  careerChatHistory.push({ role: 'assistant', content: initMsg });
}
/* =========================================================
   GPA UNIVERSITY DROPDOWN — data + renderer
   ========================================================= */
// STANDARD_4_GPA_TIP is declared in data.js
// GPA_UNIVERSITIES is declared in data.js













































// currentGpaUniSystem and currentGpaUniName are declared in data.js

function renderGpaUniDropdown() {
  const container = D.get('gpa-uni-dropdown-container');
  if (!container) return;

  // Tooltip element (shared, singleton)
  let tooltip = D.get('gpu-tooltip-el');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'gpu-tooltip-el';
    tooltip.className = 'gpu-tooltip';
    document.body.appendChild(tooltip);
  }
  let hoverTimer = null;

  const wrap = document.createElement('div');
  wrap.className = 'gpu-wrap';

  // ── Trigger bar ──────────────────────────────────────────
  const trigger = document.createElement('div');
  trigger.className = 'gpu-trigger';
  const triggerLeft = document.createElement('span');
  triggerLeft.className = 'gpu-trigger-name';
  triggerLeft.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8rem;';
  triggerLeft.textContent = currentGpaUniName;
  const triggerBadge = document.createElement('span');
  triggerBadge.className = 'gpu-scale-badge';
  triggerBadge.textContent = currentGpaUniSystem === 'knust' ? 'CWA %' : '4.0 GPA';
  const chevron = document.createElement('span');
  chevron.className = 'gpu-chevron';
  chevron.textContent = '\u25BC';
  trigger.appendChild(triggerLeft);
  trigger.appendChild(triggerBadge);
  trigger.appendChild(chevron);

  // ── Options panel ─────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'gpu-panel';

  GPA_UNIVERSITIES.forEach(u => {
    if (u.group) {
      const hdr = document.createElement('div');
      hdr.className = 'gpu-group-header';
      hdr.textContent = u.group;
      panel.appendChild(hdr);
      return;
    }
    const sys = u.system || 'standard_4';
    const scale = u.scale || '4.0 GPA';
    const tip = u.tip || STANDARD_4_GPA_TIP;
    const opt = document.createElement('div');
    opt.className = 'gpu-option' + (u.id === (currentGpaUniSystem === 'knust' ? 'knust' : '') ? ' selected' : '');
    opt.dataset.system = sys;
    opt.dataset.name   = u.name;
    opt.dataset.tip    = tip;

    const nameEl = document.createElement('span');
    nameEl.className = 'gpu-option-name';
    nameEl.textContent = u.name;

    const badge = document.createElement('span');
    badge.className = 'gpu-option-badge ' + (sys === 'knust' ? 'cwa' : 'gpa4');
    badge.textContent = scale;

    opt.appendChild(nameEl);
    opt.appendChild(badge);

    // 3-second hover tooltip
    opt.addEventListener('mouseenter', function(e) {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        tooltip.innerHTML = `<strong>${u.name}</strong>${tip}`;
        tooltip.style.display = 'block';
        const x = Math.min(e.clientX + 12, window.innerWidth - 250);
        const y = Math.min(e.clientY + 12, window.innerHeight - 120);
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
      }, 3000);
    });
    opt.addEventListener('mousemove', function(e) {
      if (tooltip.style.display === 'block') {
        const x = Math.min(e.clientX + 12, window.innerWidth - 250);
        const y = Math.min(e.clientY + 12, window.innerHeight - 120);
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
      }
    });
    opt.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimer);
      tooltip.style.display = 'none';
    });

    // Selection
    opt.addEventListener('click', function() {
      currentGpaUniSystem = sys;
      currentGpaUniName   = u.name;
      triggerLeft.textContent = u.name;
      triggerBadge.textContent = scale;
      panel.querySelectorAll('.gpu-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      wrap.classList.remove('open');
      tooltip.style.display = 'none';
      clearTimeout(hoverTimer);
      updateGpaPredictor();
    });
    panel.appendChild(opt);
  });

  // Toggle open/close
  trigger.addEventListener('click', () => wrap.classList.toggle('open'));
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) wrap.classList.remove('open'); }, true);

  wrap.appendChild(trigger);
  wrap.appendChild(panel);
  container.innerHTML = '';
  container.appendChild(wrap);
}

function updateGpaPredictor() {
  const sys = currentGpaUniSystem || 'standard_4';
  const isKnust = sys === 'knust';
  const sliders = ['cs101','math102','eng201','bua202'];

  // Adapt slider range dynamically
  sliders.forEach(id => {
    const el = D.get(`gpa-slide-${id}`);
    if (!el) return;
    if (isKnust) { el.min = '0'; el.max = '100'; el.step = '1'; }
    else { el.min = '0'; el.max = '4'; el.step = '0.5'; }
  });

  const vals = sliders.map(id => parseFloat(D.val(`gpa-slide-${id}`) || 0));

  if (isKnust) {
    // KNUST: CWA = simple average of raw percentage marks
    vals.forEach((v,i) => D.html(`val-${sliders[i]}`, getGradeLabel(v, 'knust')));
    const cwa = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
    const display = D.get('predicted-gpa-score');
    if (display) { display.textContent = cwa + '%'; display.style.color = cwa>=70?'var(--success)':cwa>=60?'var(--primary)':cwa>=50?'var(--warning)':'var(--danger)'; }
    if (D.get('gpa-result-label')) D.html('gpa-result-label','Predicted Term CWA Score');
    if (D.get('gpa-honours-band')) D.html('gpa-honours-band', getHonoursBand(parseFloat(cwa), 'knust'));
  } else {
    // Standard 4.0 GPA
    vals.forEach((v,i) => D.html(`val-${sliders[i]}`, getGradeLabel(v, 'gpa4')));
    const avg = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
    const display = D.get('predicted-gpa-score');
    if (display) { display.textContent = avg; display.style.color = avg>=3.6?'var(--success)':avg>=3.0?'var(--primary)':avg>=2.0?'var(--warning)':'var(--danger)'; }
    if (D.get('gpa-result-label')) D.html('gpa-result-label','Predicted Term GPA Score');
    if (D.get('gpa-honours-band')) D.html('gpa-honours-band', getHonoursBand(parseFloat(avg), 'gpa4'));
  }
}
function getHonoursBand(score, system) {
  const bands = system === 'knust'
    ? [
        { label: '🏆 First Class',        range: 'CWA ≥ 70%',   min: 70,  max: Infinity },
        { label: '🥈 Second Class Upper', range: '60 – 69.9%',  min: 60,  max: 70 },
        { label: '🥉 Second Class Lower', range: '50 – 59.9%',  min: 50,  max: 60 },
        { label: '📘 Third Class',         range: '45 – 49.9%',  min: 45,  max: 50 },
        { label: '✅ Pass',                range: '40 – 44.9%',  min: 40,  max: 45 },
        { label: '❌ Fail',                range: '< 40%',       min: -Infinity, max: 40 }
      ]
    : [
        { label: '🏆 First Class',        range: 'GPA ≥ 3.60',  min: 3.60, max: Infinity },
        { label: '🥈 Second Class Upper', range: '3.00 – 3.59', min: 3.00, max: 3.60 },
        { label: '🥉 Second Class Lower', range: '2.50 – 2.99', min: 2.50, max: 3.00 },
        { label: '📘 Third Class',         range: '2.00 – 2.49', min: 2.00, max: 2.50 },
        { label: '✅ Pass',                range: '1.00 – 1.99', min: 1.00, max: 2.00 },
        { label: '❌ Fail',                range: '< 1.00',      min: -Infinity, max: 1.00 }
      ];

  const rows = bands.map(b => {
    const active = score >= b.min && score < b.max;
    const dotColor  = active ? (b.label.includes('🏆')?'#10b981': b.label.includes('🥈')?'#6366f1': b.label.includes('🥉')?'#f59e0b': b.label.includes('📘')?'#3b82f6': b.label.includes('✅')?'#94a3b8':'#ef4444') : 'transparent';
    const bg        = active ? `background:rgba(${b.label.includes('🏆')?'16,185,129': b.label.includes('🥈')?'99,102,241': b.label.includes('🥉')?'245,158,11': b.label.includes('📘')?'59,130,246': b.label.includes('✅')?'148,163,184':'239,68,68'},0.1);` : '';
    const textColor = active ? '' : 'opacity:0.45;';
    const fontW     = active ? 'font-weight:700;' : '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:6px;${bg}${textColor}">
      <span style="display:flex;align-items:center;gap:6px;font-size:0.74rem;${fontW}">
        <span style="width:7px;height:7px;border-radius:50%;background:${dotColor};border:1px solid #cbd5e1;flex-shrink:0;"></span>
        ${b.label}
      </span>
      <span style="font-size:0.7rem;color:#94a3b8;white-space:nowrap;">${b.range}</span>
    </div>`;
  }).join('');

  return `<div style="font-size:0.73rem;border:1px solid var(--border);border-radius:8px;overflow:hidden;">${rows}</div>`;
}
const getGradeLabel = (val, system) => {
  if (system === 'knust') {
    // KNUST CWA: raw percentage -> letter + grade description
    if (val >= 80) return 'A (Excellent)';
    if (val >= 70) return 'B (Very Good)';
    if (val >= 60) return 'C (Good)';
    if (val >= 50) return 'D (Pass)';
    if (val >= 45) return 'E (Weak Pass)';
    return 'F (Fail)';
  }
  // Standard 4.0 GPA
  if (val === 4.0) return 'A (4.0)';
  if (val === 3.5) return 'B+ (3.5)';
  if (val === 3.0) return 'B (3.0)';
  if (val === 2.5) return 'C+ (2.5)';
  if (val === 2.0) return 'C (2.0)';
  if (val === 1.5) return 'D+ (1.5)';
  if (val === 1.0) return 'D (1.0)';
  return 'F (0.0)';
},selectMood = (emoji, message) => {
  const tip = emoji === '😫' || emoji === '🤯' ? 'Take a 15-minute screen-free break. Put on comfortable shoes and walk around. Or ask your Study Planner to reduce your load!'
    : emoji === '😐' ? 'Keep going! Plan study intervals using the Pomodoro technique (25m study, 5m break).'
    : 'Leverage this high positive energy to master your heavy programming modules today!'; D.html('mood-response-box', `<div class="glass" style="padding:16px; margin-top:16px; border-left: 4px solid var(--primary);"><p>You selected ${emoji}.</p><p style="color:var(--text-muted); font-size:0.85rem; margin-top:6px;">${tip}</p></div>`);
},
updateStressMeter = val => {
  const bar = D.get('stress-fill-bar');
  if (bar) { bar.style.width = `${val}%`; bar.style.backgroundColor = val > 75 ? 'var(--danger)' : val > 45 ? 'var(--warning)' : 'var(--success)'; } };
async function generateDailyStudyPlan() {
  const hours = parseInt(D.val('plan-hours-input')) || 4, box = D.get('generated-study-plan-box'); if (!box) return; box.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div> Optimizing...';
  try {
    const res = await executeClientAiRequest(`Generate a customized study timetable for a ${hours}-hour study session covering CS101 and MATH102. Output only clean HTML list elements.`, 'Return HTML timetable lists.', 'study'); box.innerHTML = `<div class="glass" style="padding:20px; border-left:4px solid var(--secondary);"><h4>Custom study schedule (${hours}h)</h4>${res}</div>`;
  } catch (err) { box.innerHTML = `<div class="glass" style="color:var(--danger)">Failed to generate plan.</div>`; } }
let customCalendarEvents = [
  { day: 28, title: 'CS101 Deadline', type: 'danger' },
  { day: 30, title: 'MATH102 Exam', type: 'warning' }
];

window.addCustomCalendarEvent = function() {
  const day = parseInt(D.val('custom-event-day'));
  const title = D.val('custom-event-title');
  const type = D.val('custom-event-type') || 'primary';
  if (!day || day < 1 || day > 31 || !title) {
    showToastNotification('Enter a valid day and title.');
    return;
  }
  customCalendarEvents.push({ day, title, type });
  D.val('custom-event-day', '');
  D.val('custom-event-title', '');
  generateCalendarGrid();
  showToastNotification('Event added!');
};

function generateCalendarGrid() {
  const container = D.get('portal-calendar-grid'); if (!container) return;
  let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="calendar-header-day">${d}</div>`).join(''); 
  for (let i = 0; i < 5; i++) html += '<div class="calendar-day-cell inactive"></div>'; 
  
  for (let day = 1; day <= 30; day++) {
    const act = day === 24 ? 'today' : '';
    const dayEvents = customCalendarEvents.filter(e => e.day === day);
    const eventHtml = dayEvents.map(e => `<div class="calendar-event-dot ${e.type}">${e.title}</div>`).join('');
    html += `<div class="calendar-day-cell ${act}"><span>${day}</span>${eventHtml}</div>`; 
  }
  container.innerHTML = html; 
}
// activeSubmittingAsgId is declared in data.js
const openSubmitAssignmentModal = (id, title) => { activeSubmittingAsgId = id; D.html('modal-asg-title', title); D.show('assignment-submit-modal', true); }, closeSubmitAssignmentModal = () => D.show('assignment-submit-modal', false);
async function simulateSubmitFile() {
  const input = D.get('asg-file-upload'); if (!input || !input.files.length) return showToastNotification('Select a file.'); const file = input.files[0]; if (!/\.(pdf|docx|ppt|zip|txt)$/i.test(file.name)) return showToastNotification('Allowed formats: PDF, DOCX, PPT, ZIP, TXT.'); const token = localStorage.getItem('proto_token');
  if (token && token.startsWith('simulated_token_')) {
    const asg = appState.assignments.find(a => a.id == activeSubmittingAsgId); if (asg) asg.status = 'Submitted';
    
    // Auto-trigger plagiarism check
    let textToScan = "A control flow in programming is the order in which the computer executes statements in a script. Loops repeat a block of code while a condition is true.";
    if (file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        if (typeof quickScanSubmission === 'function') {
          quickScanSubmission(e.target.result, file.name);
        }
      };
      reader.readAsText(file);
    } else {
      if (typeof quickScanSubmission === 'function') {
        if (file.name.toLowerCase().includes('report') || file.name.toLowerCase().includes('design')) {
          textToScan = "Software engineering is a systematic approach to the development, operation, and maintenance of software. The Agile methodology is a popular approach that promotes iterative development.";
        } else if (file.name.toLowerCase().includes('essay') || file.name.toLowerCase().includes('business')) {
          textToScan = "Business administration involves the management and organization of business operations. Effective managers must possess strong leadership skills.";
        }
        quickScanSubmission(textToScan, file.name);
      }
    }
    
    appState.submissions.push({ id: Date.now(), assignmentId: parseInt(activeSubmittingAsgId), studentName: appState.user?.name || 'Kofi Mensah', fileName: file.name, date: new Date().toISOString().split('T')[0], grade: null, feedback: null }); saveOfflineState(); closeSubmitAssignmentModal(); showToastNotification('Submitted successfully (Offline)!'); renderStateData(); return; }
  const formData = new FormData(); formData.append('assignmentId', activeSubmittingAsgId); formData.append('homework', file);
  try {
    const res = await fetch(`${API_BASE}/api/assignments/submit`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }); const data = await res.json(); if (res.ok) { closeSubmitAssignmentModal(); showToastNotification(`Submitted! Plagiarism: ${data.plagiarismScore}%`); renderStateData(); }
  } catch (e) {} }
async function simulateLecturerUploadNote() {
  if (appState.role !== 'lecturer' && appState.role !== 'admin') return showToastNotification('Lecturers only.'); const title = D.val('lecturer-note-title'), courseId = D.val('lecturer-note-course'); if (!title) return showToastNotification('Enter a title.'); const token = localStorage.getItem('proto_token');
  if (token && token.startsWith('simulated_token_')) {
    appState.notes.push({ id: Date.now(), courseId, title: `${title}.pdf`, date: new Date().toISOString().split('T')[0], size: '1.2 MB' }); appState.courses.find(c => c.id == courseId).notesCount++;
    appState.notifications.unshift({ id: Date.now(), text: `New notes: ${title}`, date: 'Just now', unread: true }); D.val('lecturer-note-title', ''); saveOfflineState(); showToastNotification('Uploaded successfully (Offline)!'); renderStateData(); return; }
  const noteBlob = new Blob([`Content: ${title}`], { type: 'application/pdf' }), formData = new FormData(); formData.append('courseId', courseId); formData.append('title', title); formData.append('note', noteBlob, `${title}.pdf`);
  try {
    const res = await fetch(`${API_BASE}/api/courses/upload-note`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if (res.ok) { D.val('lecturer-note-title', ''); showToastNotification('Uploaded notes successfully!'); renderStateData(); }
  } catch (e) {} }
async function simulateLecturerCreateAsg() {
  if (appState.role !== 'lecturer' && appState.role !== 'admin') return showToastNotification('Lecturers only.'); const title = D.val('lecturer-asg-title'), courseId = D.val('lecturer-asg-course'), deadline = D.val('lecturer-asg-deadline') || '2026-06-10'; if (!title) return showToastNotification('Enter a title.'); const token = localStorage.getItem('proto_token');
  if (token && token.startsWith('simulated_token_')) {
    appState.assignments.push({ id: Date.now(), courseId, title, deadline, totalPoints: 100, status: 'Pending' }); appState.courses.find(c => c.id == courseId).assignmentsCount++; D.val('lecturer-asg-title', ''); saveOfflineState(); showToastNotification('Assignment created (Offline)!'); renderStateData(); return; }
  try {
    const res = await fetch(`${API_BASE}/api/assignments/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title, courseId, deadline, totalPoints: 100, description: 'Solve assignment guidelines.' }) });
    if (res.ok) { D.val('lecturer-asg-title', ''); showToastNotification('Assignment published!'); renderStateData(); }
  } catch (e) {} }
async function calculateProgramSuitability(program, score) {
  const box = D.get('ai-suitability-display-box'); if (!box) return; box.innerHTML = '<div class="glass" style="padding: 24px; text-align: center;">Calculating compatibility...</div>';
  try {
    const res = await executeClientAiRequest(`Analyze my suitability for "${program}" given my CGPA of 3.82 and CS101 grade of 4.0. Return ONLY JSON structure: {"score": 95, "standing": "Excellent", "justification": "Details"}`, 'Return JSON data only.', 'career'); let clean = res.trim(); if (clean.includes('{')) clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1); const data = JSON.parse(clean), suitabilityScore = data.score || score, color = suitabilityScore >= 85 ? 'var(--success)' : 'var(--primary)';
    box.innerHTML = `
      <div class="glass" style="padding: 24px; display: grid; grid-template-columns: 90px 1fr; gap: 20px; align-items: center;">
        <div style="width: 80px; height: 80px; border-radius: var(--radius-full); border: 4px solid ${color}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; color:${color};">${suitabilityScore}%</div>
        <div>
          <span class="badge badge-primary">${data.standing || 'Good Fit'}</span> <h3 style="margin:4px 0;">Compatibility: ${program}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted);">${data.justification}</p>
        </div>
      </div>`; showToastNotification(`Match calculated!`);
  } catch (err) { box.innerHTML = `<div class="glass" style="color:var(--danger)">Check failed.</div>`; } }
const startFacultyChat = name => {
  const contact = appState.facultyContacts.find(c => c.name.toLowerCase().includes(name.toLowerCase())); if (contact) appState.activeFacultyEmail = contact.email; switchTab('student', 'student-faculty-chat'); renderFacultyChat(); showToastNotification(`Bridge opened to ${name}!`); };
async function scheduleFacultyCall() {
  const select = D.get('consult-recipient').value, date = D.val('consult-date'), topic = D.val('consult-purpose'); if (!topic) return showToastNotification('Enter a topic.'); const token = localStorage.getItem('proto_token');
  if (token && token.startsWith('simulated_token_')) {
    if (!appState.consultations) appState.consultations = [];
    appState.consultations.push({ id: Date.now(), topic, scheduledTime: date, duration: 30 }); D.val('consult-purpose', ''); saveOfflineState(); showToastNotification('Session scheduled (Offline)!'); renderStateData(); return; }
  try {
    const res = await fetch(`${API_BASE}/api/consultations/book`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ lecturerId: select, scheduledTime: date, topic, duration: 30 }) });
    if (res.ok) { D.val('consult-purpose', ''); showToastNotification('Session booked!'); renderStateData(); }
  } catch (e) {} }
function renderDedicatedAssignmentsDeck() {
  const container = D.get('dedicated-assignments-deck'); if (!container) return;
  container.innerHTML = appState.assignments.map(asg => {
    const course = appState.courses.find(c => c.id === asg.courseId), diff = Math.ceil((new Date(asg.deadline) - new Date('2026-05-24')) / 86400000),
          countdown = diff > 0 ? `Due in ${diff} Days` : 'Past Due',
          status = asg.status === 'Pending' ? `<button class="btn btn-primary btn-sm" onclick="openSubmitAssignmentModal(${asg.id}, '${asg.title}')">Submit File 🚀</button>` : '', gradeDetails = asg.grade ? `<div style="background: rgba(16,185,129, 0.03); border:1px solid var(--success); padding:12px; border-radius:6px; margin-top:10px; font-size:0.85rem;"><strong>Grade: ${asg.grade}/100</strong> - Feedback: "${asg.feedback}"</div>` : (asg.status === 'Submitted' ? '<div style="color:var(--warning); font-size:0.85rem; margin-top:8px;">Awaiting Grading</div>' : '');
    return `
      <div class="widget glass" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><span class="badge badge-primary">${course ? course.code : 'GEN'}</span> <span class="badge badge-warning">${countdown}</span> <h4 style="margin-top:6px;">${asg.title}</h4></div>
          ${status}
        </div>
        ${gradeDetails}
      </div>`;
  }).join(''); }
function getMappedRecommendations(uni) {
  const name = uni.name.toLowerCase(); if (name.includes('ashesi')) return ['Software Engineering', 'Business Management', 'Tech Entrepreneurship']; if (name.includes('ghana (ug)') || name.includes('legon')) return ['Medicine & Health', 'Law & Public Policy', 'Corporate Finance']; if (name.includes('kwame nkrumah') || name.includes('knust')) return ['Mechanical & Civil Engineering', 'Computer Engineering', 'Pharmacy & Health']; if (name.includes('cape coast (ucc)')) return ['Educational Pedagogy', 'Accounting & Finance', 'Optometry']; return uni.programsOffered.slice(0, 2).map(p => p.replace(/^(BSc|BA|BEd|BTech|Doctor of|Bachelor of)\s+/, '')); }
function renderStudentUniversities() {
  const container = D.get('uni-dynamic-grid-container'); if (!container) return;
  const query = appState.uniSearchQuery.toLowerCase(),
        filtered = appState.universities.filter(uni => (uni.name.toLowerCase().includes(query) || uni.location.toLowerCase().includes(query)) && (appState.selectedUniType === 'All' || uni.type === appState.selectedUniType));
  if (!filtered.length) { container.innerHTML = '<div style="padding:20px; text-align:center;">No universities found.</div>'; return; }
  container.innerHTML = filtered.map(uni => {
    const rating = 5.0 - (uni.ranking * 0.01), recs = getMappedRecommendations(uni).map(r => `<span class="badge" style="background:rgba(124,58,237, 0.1); color:#c084fc;">${r}</span>`).join(' ');
    return `
      <div class="uni-preview-card glass">
        <div class="uni-img-wrapper" style="height:150px;"><img src="${uni.image}" onerror="this.src='picture/ug_campus.jpg'"><span class="badge badge-primary" style="position:absolute; top:8px; right:8px;">Rank #${uni.ranking}</span></div>
        <div class="uni-preview-details" style="padding:16px;">
          <h4>${uni.name}</h4> <p style="font-size:0.8rem; color:var(--text-muted);">📍 ${uni.location} • Est. ${uni.established}</p>
          <div style="margin:4px 0;">${generateStarRatingHTML(rating)}</div>
          <div style="font-size:0.8rem; margin:8px 0;"><strong>Fees:</strong> ${uni.feesRange}</div>
          <div style="margin-top:6px;">${recs}</div>
          <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:12px;" onclick="openUniRequirementsModal('${uni.id}')">View Details</button>
        </div>
      </div>`;
  }).join(''); }
const filterUniversitiesList = () => { appState.uniSearchQuery = D.val('uni-search-input') || ''; renderStudentUniversities(); },
filterUniversitiesType = type => {
  appState.selectedUniType = type;
  document.querySelectorAll('.uni-filter-btn').forEach(btn => btn.classList.toggle('active', btn.id === `filter-uni-${type.toLowerCase()}`)); renderStudentUniversities(); };
function openUniRequirementsModal(id) {
  const uni = appState.universities.find(u => u.id === id); if (!uni) return; D.html('uni-modal-badge', uni.type); D.get('uni-modal-badge').className = uni.type === 'Public' ? 'badge badge-success' : 'badge badge-primary'; D.html('uni-modal-name', uni.name); D.html('uni-modal-meta', `Ranked #${uni.ranking} • Est. ${uni.established} • 📍 ${uni.location}`); D.html('uni-modal-requirements', uni.admissionRequirements); D.html('uni-modal-performance', uni.performanceReview); D.html('uni-modal-fees', uni.feesRange); D.html('uni-modal-scholarships', uni.scholarshipsInfo); D.html('uni-modal-mapped-recs', getMappedRecommendations(uni).map(rec => `<span class="badge" style="background:rgba(124,58,237,0.1); color:#c084fc; margin-right:4px;">${rec}</span>`).join('')); D.html('uni-modal-programs', uni.programsOffered.map(p => `<span class="badge" style="background:rgba(255,255,255,0.05); margin-right:4px;">${p}</span>`).join('')); D.show('uni-requirements-modal', true); }
const closeUniRequirementsModal = () => D.show('uni-requirements-modal', false);

function renderProgramSelectionCards() {
  const container = document.querySelector('#student-programs .course-grid'); if (!container) return;
  container.innerHTML = programCardsData.map(p => `
    <div class="course-card">
      <div class="course-banner" style="background:${p.bg};"><span class="course-code">${p.duration}</span><h3 style="font-size:1.1rem; margin-top:8px;">${p.title}</h3></div>
      <div class="course-body">
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">${p.desc}</p>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:6px; font-size:0.8rem; color:var(--text-muted); margin-bottom:16px;">
          <li>💼 <strong>Top Careers:</strong> ${p.careers}</li> <li>📈 <strong>Ghana Job Demand:</strong> ${p.demand}</li> <li>💰 <strong>Avg Salary Range:</strong> ${p.salary}</li>
        </ul>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-accent btn-sm" style="flex:1;" onclick="calculateProgramSuitability('${p.title}', ${p.suitability})">Check AI Suitability</button>
          <a class="btn btn-primary btn-sm" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px; font-size:0.75rem;" href="${p.pdfPath || '#'}" target="_blank">📘 Syllabus PDF</a>
        </div>
      </div>
    </div>`).join(''); }
