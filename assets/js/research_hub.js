/* SMARTLEARN AI - RESEARCH ASSISTANT & STARTUP HUB SERVICES */

async function spaSearchResearch() {
  const query = (D.val('spa-research-search-input') || '').trim();
  const list = D.get('spa-research-results-list');
  if (!list) return;
  if (!query) return showToastNotification('Please enter a search term.');

  list.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div> Searching academic index...';
  
  // Attempt online call to EuropePMC proxy, with offline fallback
  let papers = [];
  const token = localStorage.getItem('proto_token');
  try {
    if (token && !token.startsWith('simulated_token_')) {
      const res = await fetch(`${API_BASE}/api/ai/research/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.papers) papers = data.papers;
      }
    }
  } catch (err) {}

  // Local fallback
  if (papers.length === 0) {
    const qLower = query.toLowerCase();
    papers = mockResearchPapers.filter(p => 
      p.title.toLowerCase().includes(qLower) || 
      p.abstract.toLowerCase().includes(qLower) ||
      p.journal.toLowerCase().includes(qLower)
    );
  }

  if (papers.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px; font-size:0.8rem;">No publications found matching criteria.</p>';
    return;
  }

  list.innerHTML = papers.map((p, idx) => {
    // Escape quotes for JS inline calls
    const escapedTitle = (p.title || '').replace(/'/g, "\\'");
    const escapedAuthors = (p.authors || '').replace(/'/g, "\\'");
    const escapedJournal = (p.journal || '').replace(/'/g, "\\'");
    const escapedYear = p.year || '';
    const escapedVolume = (p.volume || '').replace(/'/g, "\\'");
    const escapedPages = (p.pages || '').replace(/'/g, "\\'");
    const escapedAbstract = (p.abstract || '').replace(/'/g, "\\'").replace(/\n/g, " ");

    return `
      <div class="glass" style="padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border); background:rgba(255,255,255,0.02); display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <h4 style="font-size:0.9rem; margin:0; line-height:1.4; color:#fff;">${p.title}</h4>
          <span class="badge badge-primary" style="font-size:0.65rem; font-weight:700;">Paper</span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">🧑‍🔧 ${p.authors} • 📖 ${p.journal} (${p.year})</p>
        <p style="font-size:0.75rem; color:var(--text-light); line-height:1.4; margin-top:4px;">${p.abstract.slice(0, 150)}...</p>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn btn-secondary btn-sm" style="font-size:0.7rem; padding:4px 8px;" onclick="spaApplyToBibliography('${escapedTitle}', '${escapedAuthors}', '${escapedJournal}', '${escapedYear}', '${escapedVolume}', '${escapedPages}')">📋 Cite Paper</button>
          <button class="btn btn-primary btn-sm" style="font-size:0.7rem; padding:4px 8px;" onclick="spaApplyToAbstractSummarizer('${escapedAbstract}')">📑 Summarize</button>
        </div>
      </div>
    `;
  }).join('');
}

function spaApplyToBibliography(title, authors, journal, year, volume, pages) {
  D.val('cite-title', title);
  D.val('cite-authors', authors);
  D.val('cite-journal', journal);
  D.val('cite-year', year);
  D.val('cite-volume', volume);
  D.val('cite-pages', pages);
  showToastNotification('Article details loaded into citation builder!');
  D.get('cite-title').scrollIntoView({ behavior: 'smooth' });
}

function spaApplyToAbstractSummarizer(abstract) {
  D.val('spa-abstract-input', abstract);
  showToastNotification('Abstract loaded into analyzer!');
  D.get('spa-abstract-input').scrollIntoView({ behavior: 'smooth' });
}

function setSpaCitationFormat(format) {
  currentCitationFormat = format;
  const formats = ['APA', 'Harvard', 'IEEE', 'MLA'];
  formats.forEach(f => {
    const btn = D.get(`btn-cite-${f.toLowerCase()}`);
    if (btn) {
      if (f === format) {
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';
      } else {
        btn.style.background = 'rgba(255,255,255,0.05)';
        btn.style.color = 'var(--text-muted)';
      }
    }
  });
  if (D.val('cite-title') || D.val('cite-authors')) {
    spaGenerateCitation();
  }
}

function spaGenerateCitation() {
  const title = (D.val('cite-title') || '').trim();
  const authors = (D.val('cite-authors') || '').trim();
  const journal = (D.val('cite-journal') || '').trim();
  const year = (D.val('cite-year') || '').trim();
  const volume = (D.val('cite-volume') || '').trim();
  const pages = (D.val('cite-pages') || '').trim();

  if (!title || !authors) {
    return showToastNotification('Authors and Title are required for citation generation.');
  }

  let formatted = '';
  const y = year || 'n.d.';
  const v = volume ? `, ${volume}` : '';
  const p = pages ? `, pp. ${pages}` : '';
  const pNoPp = pages ? `, ${pages}` : '';

  if (currentCitationFormat === 'APA') {
    formatted = `${authors} (${y}). ${title}. *${journal || 'Unspecified Journal'}*${v}${pNoPp}.`;
  } else if (currentCitationFormat === 'Harvard') {
    formatted = `${authors}, ${y}. ${title}. *${journal || 'Unspecified Journal'}*${v}${p}.`;
  } else if (currentCitationFormat === 'IEEE') {
    const primaryAuthor = authors.split(',')[0] || authors;
    formatted = `${primaryAuthor}, "${title}," *${journal || 'Unspecified Journal'}*${volume ? `, vol. ${volume}` : ''}${pages ? `, pp. ${pages}` : ''}, ${y}.`;
  } else {
    formatted = `${authors}. "${title}." *${journal || 'Unspecified Journal'}*${volume ? `, vol. ${volume}` : ''}, ${y}${pages ? `, pp. ${pages}` : ''}.`;
  }

  D.html('spa-citation-text', formatted);
  D.show('spa-citation-output-box', true);
}

function copySpaCitation() {
  const text = D.get('spa-citation-text').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToastNotification('Citation copied to clipboard!');
  }).catch(() => {
    alert("Citation: " + text);
  });
}

async function spaAnalyzeMethodology() {
  const topic = (D.val('spa-research-topic') || '').trim();
  const domain = D.val('spa-research-domain');
  const draft = (D.val('spa-research-draft') || '').trim();
  const resultBox = D.get('spa-methodology-result');

  if (!topic || !draft) {
    return showToastNotification('Please fill in research topic and draft methodology outline.');
  }

  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div> Critically analyzing methodology boundaries...';
  }

  try {
    const prompt = `Analyze research topic: "${topic}" in the domain "${domain}".\nMethodology Outline:\n${draft}\n\nProvide critical academic critique. Outline:\n1. Methodology Gaps & Limitations\n2. Specific Contextual Boundaries for Ghana/West Africa (e.g. telecom infrastructure, cultural factors, local regulatory bodies like FDA/GSA)\n3. Improvement Suggestions.`;
    const res = await executeClientAiRequest(prompt, getSystemPrompt('research'), 'research');
    if (resultBox) resultBox.innerHTML = res;
  } catch (err) {
    if (resultBox) resultBox.innerHTML = `<span style="color:var(--danger)">Analysis failed: ${err.message}</span>`;
  }
}

async function spaSummarizeAbstract() {
  const abstract = (D.val('spa-abstract-input') || '').trim();
  const resultBox = D.get('spa-abstract-result');

  if (!abstract) {
    return showToastNotification('Please paste an abstract to summarize.');
  }

  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div> Extracting key parameters...';
  }

  try {
    const prompt = `Critically summarize this scientific abstract:\n${abstract}\n\nHighlight Objective, Methods, Findings, and Limitations.`;
    const res = await executeClientAiRequest(prompt, getSystemPrompt('research'), 'research');
    if (resultBox) resultBox.innerHTML = res;
  } catch (err) {
    if (resultBox) resultBox.innerHTML = `<span style="color:var(--danger)">Summarization failed: ${err.message}</span>`;
  }
}

async function spaValidateBusiness() {
  const name = (D.val('spa-startup-name') || '').trim();
  const industry = D.val('spa-startup-industry');
  const audience = (D.val('spa-startup-audience') || '').trim();
  const desc = (D.val('spa-startup-desc') || '').trim();
  const resultBox = D.get('spa-business-result');

  if (!name || !desc) {
    return showToastNotification('Please provide business name and value proposition summary.');
  }

  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div> Optimizing business model viability...';
  }

  try {
    const prompt = `Optimize and validate startup model:\nVenture Name: ${name}\nIndustry: ${industry}\nTarget Audience in Ghana: ${audience}\nValue Proposition & Operations:\n${desc}\n\nProvide structured analysis: \n1. Product-Market Fit in Ghana\n2. Key Operational Risks\n3. Ghana Regulatory Compliance Pathway (e.g. Registrar General's Dept, Food & Drugs Authority (FDA) or Ghana Standards Authority (GSA) if applicable)\n4. Recommended Local Funding Programs (e.g. NEIP, GEDA, MEST).`;
    const res = await executeClientAiRequest(prompt, getSystemPrompt('innovation'), 'innovation');
    if (resultBox) resultBox.innerHTML = res;
  } catch (err) {
    if (resultBox) resultBox.innerHTML = `<span style="color:var(--danger)">Validation failed: ${err.message}</span>`;
  }
}

function renderSpaStartupsList() {
  const container = D.get('spa-startups-showcase-list');
  if (!container) return;

  if (appState.studentStartups.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:10px; font-size:0.75rem;">No active student startups listed yet.</p>';
    return;
  }

  container.innerHTML = appState.studentStartups.map(item => {
    return `
      <div class="glass" style="padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.12);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="font-size:0.85rem; margin:0; font-weight:700; color:#fff;">${item.name}</h4>
          <span class="badge badge-info" style="font-size:0.62rem; font-weight:700;">${item.industry}</span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">Pitch: ${item.desc}</p>
        <div style="font-size:0.7rem; color:var(--text-light); margin-top:2px;">Founder: <strong>${item.author}</strong></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid rgba(255,255,255,0.03); padding-top:6px;">
          <button class="forum-action-btn" style="font-size:0.7rem; padding:4px 8px;" onclick="upvoteSpaStartup(${item.id})">👍 ${item.upvotes} Upvotes</button>
          <button class="btn ${item.joined ? 'btn-secondary' : 'btn-primary'} btn-sm" style="font-size:0.68rem; padding:3px 8px;" onclick="joinSpaStartupTeam(${item.id})">
            ${item.joined ? 'Joined Team ✅' : 'Join Team 🤝'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function spaPublishStartup() {
  const name = (D.val('spa-pub-name') || '').trim();
  const industry = D.val('spa-pub-industry');
  const desc = (D.val('spa-pub-desc') || '').trim();

  if (!name || !desc) {
    return showToastNotification('Please enter startup project name and pitch description.');
  }

  appState.studentStartups.unshift({
    id: Date.now(),
    name: name,
    industry: industry,
    desc: desc,
    author: appState.user?.name || 'Kofi Mensah',
    upvotes: 1,
    joined: false
  });

  saveOfflineState();
  renderSpaStartupsList();
  D.val('spa-pub-name', '');
  D.val('spa-pub-desc', '');
  showToastNotification('Startup successfully published in the showcase hub!');
}

function upvoteSpaStartup(id) {
  const item = appState.studentStartups.find(x => x.id === id);
  if (item) {
    item.upvotes++;
    saveOfflineState();
    renderSpaStartupsList();
  }
}

function joinSpaStartupTeam(id) {
  const item = appState.studentStartups.find(x => x.id === id);
  if (item) {
    item.joined = !item.joined;
    saveOfflineState();
    renderSpaStartupsList();
    if (item.joined) {
      showToastNotification(`Applied to join ${item.name} development team!`);
    } else {
      showToastNotification(`Withdrew application from ${item.name}.`);
    }
  }
}

// currentMentorName is declared in data.js
function openSpaMentorModal(name) {
  currentMentorName = name;
  D.html('spa-mentor-modal-title', `Message to Mentor: ${name}`);
  D.val('spa-mentor-message-text', '');
  D.show('spa-mentor-modal', true);
}

function sendSpaMentorMessage() {
  const message = (D.val('spa-mentor-message-text') || '').trim();
  if (!message) {
    return showToastNotification('Please enter a message to send.');
  }

  // Determine email and role details
  let mentorEmail = 'elikem@smartlearn.edu';
  let mentorRole = 'Partner/Advisor, Accra Venture Capital';
  if (currentMentorName.toLowerCase().includes('naa')) {
    mentorEmail = 'naa@smartlearn.edu';
    mentorRole = 'Founder/Alum, AgriFlow Ltd (2021)';
  } else if (!currentMentorName.toLowerCase().includes('elikem')) {
    mentorEmail = currentMentorName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@smartlearn.edu';
    mentorRole = 'Mentor / Industry Partner';
  }

  // 1. Add to facultyContacts if not present
  if (!appState.facultyContacts.some(c => c.email === mentorEmail)) {
    appState.facultyContacts.push({
      name: currentMentorName,
      role: mentorRole,
      email: mentorEmail,
      status: 'Online',
      avatar: 'avatar_lecturer.jpg',
      room: 'Off-Campus',
      hours: 'By Appointment'
    });
  }

  // 2. Add message to facultyChats
  if (!appState.facultyChats[mentorEmail]) {
    appState.facultyChats[mentorEmail] = [];
  }
  appState.facultyChats[mentorEmail].push({
    sender: 'student',
    text: message,
    timestamp: 'Just now'
  });

  // 3. Save offline state
  saveOfflineState();

  // 4. Hide Modal
  D.show('spa-mentor-modal', false);

  // 5. Navigate to Chat interface
  startFacultyChat(currentMentorName);
}
/* ==========================================================================
   SUPABASE RESEARCHER PORTAL INTEGRATION
   ========================================================================== */

let activeProjectId = 'b189a815-5e03-4f11-9685-6d63428f5223'; // Hardcoded for prototype demo
let researchChatChannel = null;

async function fetchResearchDocuments() {
  const tbody = document.getElementById('research-doc-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

  if (!appState.researchDocuments) {
    appState.researchDocuments = [
      {
        id: 'doc_sim_1',
        title: 'Healthcare_IoT_Dataset.csv',
        filename: 'Healthcare_IoT_Dataset.csv',
        fileUrl: '#',
        sizeBytes: 204800,
        mimeType: 'text/csv'
      }
    ];
  }

  let docs = [...appState.researchDocuments];

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('Document')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data) {
        // Merge Supabase documents with local ones (avoid duplicates)
        data.forEach(dbDoc => {
          if (!docs.some(d => d.id === dbDoc.id || d.title === dbDoc.title)) {
            docs.unshift(dbDoc);
          }
        });
      } else if (error) {
        console.warn('Supabase Document table error (falling back to local):', error);
      }
    } catch (err) {
      console.warn('Supabase fetch error (falling back to local):', err);
    }
  }

  if (docs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No documents found.</td></tr>';
    return;
  }

  tbody.innerHTML = docs.map(doc => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px;">${doc.title}</td>
      <td style="padding:12px;">${doc.mimeType}</td>
      <td style="padding:12px;">${Math.round(doc.sizeBytes / 1024)} KB</td>
      <td style="padding:12px;">
        <a href="${doc.fileUrl}" target="_blank" download="${doc.title}" class="btn btn-sm btn-secondary" style="margin-right:4px;">Download</a>
        <button class="btn btn-sm btn-danger" onclick="deleteResearchDocument('${doc.id}', '${doc.filename}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function uploadResearchDocument(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Local fallback / custom object URL generation
  const localUrl = URL.createObjectURL(file);
  const localDoc = {
    id: `doc_sim_${Date.now()}`,
    title: file.name,
    filename: file.name,
    fileUrl: localUrl,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream'
  };

  if (!appState.researchDocuments) {
    appState.researchDocuments = [];
  }

  // Push to local list first for instant offline capability
  appState.researchDocuments.unshift(localDoc);
  saveOfflineState();

  if (!supabaseClient) {
    showToastNotification('Document uploaded successfully (Local Fallback)!');
    fetchResearchDocuments();
    // Reset file input
    event.target.value = '';
    return;
  }

  try {
    showToastNotification('Uploading document to Supabase...');
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `project-documents/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('project-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('project-documents')
      .getPublicUrl(filePath);

    // Insert into Document table
    const { error: dbError } = await supabaseClient
      .from('Document')
      .insert([
        {
          title: file.name,
          filename: fileName,
          fileUrl: publicUrl,
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          projectId: activeProjectId,
          uploadedById: appState.user?.id || 'd3b07384-d113-4d6b-b2b9-e1f2b0ff6b8e' // Fallback UUID
        }
      ]);

    if (dbError) throw dbError;

    // Remove the temporary local placeholder since it was successfully uploaded to cloud
    appState.researchDocuments = appState.researchDocuments.filter(d => d.id !== localDoc.id);
    saveOfflineState();

    showToastNotification('Document uploaded successfully to Supabase!');
    fetchResearchDocuments(); // Refresh list

  } catch (err) {
    console.error('Supabase upload error (local copy preserved):', err);
    showToastNotification('Cloud sync failed. Preserved locally.');
    fetchResearchDocuments();
  } finally {
    // Reset file input
    event.target.value = '';
  }
}

async function deleteResearchDocument(id, filename) {
  if (!confirm('Are you sure you want to delete this document?')) return;

  // Try local first
  if (appState.researchDocuments) {
    const idx = appState.researchDocuments.findIndex(d => d.id === id);
    if (idx !== -1) {
      appState.researchDocuments.splice(idx, 1);
      saveOfflineState();
      showToastNotification('Document deleted.');
      fetchResearchDocuments();
      return;
    }
  }

  if (supabaseClient) {
    try {
      // Delete from Storage
      await supabaseClient.storage.from('project-documents').remove([`project-documents/${filename}`]);
      
      // Delete from DB
      const { error } = await supabaseClient.from('Document').delete().match({ id: id });
      if (error) throw error;
      
      showToastNotification('Document deleted from cloud.');
      fetchResearchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Delete failed: ${err.message}`);
    }
  }
}

function initResearchChat() {
  if (!supabaseClient) return;
  const board = document.getElementById('project-chat-board');
  if (!board) return;
  board.innerHTML = '';
  
  if (researchChatChannel) {
    supabaseClient.removeChannel(researchChatChannel);
  }

  researchChatChannel = supabaseClient.channel('project-chat')
    .on('broadcast', { event: 'new_message' }, payload => {
      const isMe = payload.payload.user === (appState.user?.name || 'Researcher');
      const msgDiv = document.createElement('div');
      msgDiv.style = isMe 
        ? 'background:var(--primary); padding:10px; border-radius:8px; align-self:flex-end;' 
        : 'background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; align-self:flex-start;';
      msgDiv.innerHTML = `<strong>${payload.payload.user}:</strong> ${payload.payload.text}`;
      board.appendChild(msgDiv);
      board.scrollTop = board.scrollHeight;
    })
    .subscribe((status) => {
      if(status === 'SUBSCRIBED') {
        board.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:0.8rem;">Connected to Live Chat</div>';
      }
    });
}

function sendResearchChatMessage(event) {
  event.preventDefault();
  if (!supabaseClient || !researchChatChannel) return alert('Chat not connected.');
  
  const input = document.getElementById('research-chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  const userName = appState.user?.name || 'Researcher';

  researchChatChannel.send({
    type: 'broadcast',
    event: 'new_message',
    payload: { user: userName, text: text }
  });

  // Optimistically add to UI
  const board = document.getElementById('project-chat-board');
  const msgDiv = document.createElement('div');
  msgDiv.style = 'background:var(--primary); padding:10px; border-radius:8px; align-self:flex-end;';
  msgDiv.innerHTML = `<strong>${userName}:</strong> ${text}`;
  board.appendChild(msgDiv);
  board.scrollTop = board.scrollHeight;

  input.value = '';
}

// switchTab hooks are consolidated lower down



// ==========================================
// BACKEND API INTEGRATION (PHASE 2)
// ==========================================

async function fetchResearcherDashboard() {
  try {
    // API_BASE is declared in app.js
    const res = await fetch(`${API_BASE}/api/research/dashboard`);
    if (res.ok) {
      const data = await res.json();
      const d = document;
      if(d.getElementById('api-active-projects')) d.getElementById('api-active-projects').innerText = data.activeProjects;
      if(d.getElementById('api-completed-stages')) d.getElementById('api-completed-stages').innerText = `${data.completedStages}`;
      if(d.getElementById('api-pending-reviews')) d.getElementById('api-pending-reviews').innerText = data.pendingReviews;
      if(d.getElementById('api-overall-health')) d.getElementById('api-overall-health').innerText = `${Math.round(data.overallHealth)}%`;
    }
  } catch (err) {
    console.error('Failed to fetch dashboard metrics:', err);
  }
}

async function fetchResearcherTasks() {
  try {
    const res = await fetch(`${API_BASE}/api/research/tasks`);
    if (res.ok) {
      const tasks = await res.json();
      const todo = document.getElementById('api-tasks-todo');
      const inprog = document.getElementById('api-tasks-inprogress');
      const review = document.getElementById('api-tasks-review');
      
      if(todo) todo.innerHTML = '';
      if(inprog) inprog.innerHTML = '';
      if(review) review.innerHTML = '';

      tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'glass';
        div.style = 'padding:8px; font-size:0.85rem; margin-bottom:8px;';
        div.innerText = `${task.title} (Assigned: ${task.assignee})`;

        if (task.status === 'To Do' && todo) todo.appendChild(div);
        else if (task.status === 'In Progress' && inprog) inprog.appendChild(div);
        else if (task.status === 'Review' && review) review.appendChild(div);
        else if (todo) todo.appendChild(div); // fallback
      });
    }
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
  }
}

// Hook into the tab switcher to initialize safely
setTimeout(() => {
  if (typeof switchTab !== 'undefined') {
    const originalSwitchTab = switchTab;
    window.switchTab = function(role, tabId) {
      try {
        originalSwitchTab(role, tabId);
        if (tabId === 'researcher-repository') {
          fetchResearchDocuments();
        } else if (tabId === 'researcher-collaboration') {
          initResearchChat();
          fetchResearcherTasks();
        } else if (tabId === 'researcher-dashboard') {
          fetchResearcherDashboard();
        } else if (tabId === 'researcher-ethics') {
          renderResearcherScansTable();
        } else if (tabId === 'researcher-publications') {
          fetchResearcherPublications();
        }
      } catch (err) {
        console.error("Error in switchTab wrapper:", err);
      }
    }
  }
}, 500);

// Call these immediately if we enter the portal, or on load
document.addEventListener('DOMContentLoaded', () => {
  // Try fetching on load if authenticated or mock mode
  setTimeout(() => {
    fetchResearcherDashboard();
    fetchResearcherTasks();
  }, 1000);
});

/* ---------- Researcher Plagiarism Scanner ---------- */
function handleResearcherPlagFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.toLowerCase().endsWith('.txt')) {
    return showToastNotification('Allowed manual upload format for scanning: .txt files only.');
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    D.val('researcher-plag-text', e.target.result);
    D.val('researcher-plag-docname', file.name);
    showToastNotification('File content successfully loaded into the editor!');
  };
  reader.readAsText(file);
}

function runResearcherPlagScan() {
  const text = (D.val('researcher-plag-text') || '').trim();
  const docName = (D.val('researcher-plag-docname') || '').trim();

  if (!text || text.length < 50) {
    return showToastNotification('⚠️ Text too short. Please provide at least 50 characters.');
  }

  const name = docName || 'Research_Draft_Scan.txt';
  if (typeof analyzeTextForPlagiarism === 'function') {
    const report = analyzeTextForPlagiarism(text, name);
    if (report.valid) {
      if (!appState.plagiarismReports) appState.plagiarismReports = [];
      appState.plagiarismReports.unshift(report);
      saveOfflineState();
      
      renderPlagiarismReport(report);
      renderResearcherScansTable();
      earnBadge('plagiarism');
      showToastNotification('Scan complete! Opening integrity analysis report.');
      
      // Clear inputs
      D.val('researcher-plag-text', '');
      D.val('researcher-plag-docname', '');
      const fileInput = D.get('researcher-plag-file');
      if (fileInput) fileInput.value = '';
    }
  } else {
    showToastNotification('Plagiarism engine is not loaded.');
  }
}

function renderResearcherScansTable() {
  const container = D.get('researcher-scans-list');
  if (!container) return;

  const reports = (appState.plagiarismReports || []).concat(appState.demoPlagiarismReports || []);
  
  // Filter reports that are research/proposal/draft drafts or manual scans
  const researchReports = reports.filter(r => 
    r.documentName.toLowerCase().includes('proposal') || 
    r.documentName.toLowerCase().includes('draft') ||
    r.documentName.toLowerCase().includes('research') || 
    r.documentName.toLowerCase().includes('malaria') ||
    r.documentName.toLowerCase().includes('survey') || 
    r.documentName.toLowerCase().includes('scan') ||
    r.documentName.toLowerCase().endsWith('.txt')
  );

  if (!researchReports.length) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; margin-top: 40px;">No scan history found. Run a new scan above to see reports here.</p>';
    return;
  }

  container.innerHTML = researchReports.map((r, idx) => {
    const recColor = r.recommendation === 'CLEAR' ? '#10b981' : r.recommendation === 'FLAG_CONCERN' ? '#ef4444' : '#f59e0b';
    return `
      <div class="glass" style="padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
        <div style="flex:1; min-width:0;">
          <h4 style="font-size:0.8rem; margin:0 0 2px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${r.documentName}">📄 ${r.documentName}</h4>
          <p style="font-size:0.7rem; color:var(--text-muted); margin:0;">${r.analysisDate} · ${r.wordCount || '?'} words</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="text-align:right;">
            <div style="font-size:0.95rem; font-weight:800; color:${recColor};">${r.overallSimilarity}%</div>
            <div style="font-size:0.55rem; color:var(--text-muted);">Match</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="viewPlagiarismReportForFile('${r.documentName}')" style="font-size:0.65rem; padding:3px 6px;">Report</button>
        </div>
      </div>`;
  }).join('');
}

/* ---------- Reviewer Comments & Open Access uploads ---------- */
function fetchResearcherPublications() {
  if (!appState.rebuttalDocs) {
    appState.rebuttalDocs = [
      {
        id: 'rebuttal_sim_1',
        title: 'Reviewer_Comments_Response_IEEE.docx',
        sizeBytes: 153600,
        uploadedAt: '15/06/2026, 14:32',
        fileUrl: '#'
      }
    ];
  }
  if (!appState.dspaceDocs) {
    appState.dspaceDocs = [
      {
        id: 'dspace_sim_1',
        title: 'Preprint_ML_Healthcare_ATU.pdf',
        sizeBytes: 1048576,
        uploadedAt: '12/06/2026, 10:15',
        status: 'Deposited',
        fileUrl: '#'
      }
    ];
  }
  renderReviewerComments();
  renderDSpaceArchive();
}

function renderReviewerComments() {
  const tbody = document.getElementById('reviewer-comments-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('reviewer-comments-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const docs = (appState.rebuttalDocs || []).filter(doc => doc.title.toLowerCase().includes(query));

  if (docs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No reviewer comments found.</td></tr>';
    return;
  }

  tbody.innerHTML = docs.map(doc => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px;">${doc.title}</td>
      <td style="padding:12px;">${Math.round(doc.sizeBytes / 1024)} KB</td>
      <td style="padding:12px;">${doc.uploadedAt}</td>
      <td style="padding:12px;">
        <a href="${doc.fileUrl}" target="_blank" download="${doc.title}" class="btn btn-sm btn-secondary" style="margin-right:4px;">Download</a>
        <button class="btn btn-sm btn-danger" onclick="deleteReviewerComment('${doc.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function handleReviewerCommentsUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const localDoc = {
    id: `rebuttal_sim_${Date.now()}`,
    title: file.name,
    sizeBytes: file.size,
    uploadedAt: new Date().toLocaleString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    fileUrl: URL.createObjectURL(file)
  };

  if (!appState.rebuttalDocs) appState.rebuttalDocs = [];
  appState.rebuttalDocs.unshift(localDoc);
  saveOfflineState();

  showToastNotification('Reviewer comments document uploaded successfully!');
  renderReviewerComments();

  // Reset file input
  event.target.value = '';
}

function deleteReviewerComment(id) {
  if (!confirm('Are you sure you want to delete this reviewer comment document?')) return;
  if (appState.rebuttalDocs) {
    appState.rebuttalDocs = appState.rebuttalDocs.filter(d => d.id !== id);
    saveOfflineState();
    showToastNotification('Document deleted.');
    renderReviewerComments();
  }
}

// Open Access pre-prints logic
function renderDSpaceArchive() {
  const tbody = document.getElementById('dspace-archive-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('dspace-archive-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const docs = (appState.dspaceDocs || []).filter(doc => doc.title.toLowerCase().includes(query));

  if (docs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No deposited pre-prints found.</td></tr>';
    return;
  }

  tbody.innerHTML = docs.map(doc => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px;">${doc.title}</td>
      <td style="padding:12px;">${Math.round(doc.sizeBytes / 1024)} KB</td>
      <td style="padding:12px;">${doc.uploadedAt}</td>
      <td style="padding:12px;"><span class="badge ${doc.status === 'Deposited' ? 'badge-success' : 'badge-warning'}">${doc.status}</span></td>
      <td style="padding:12px;">
        <a href="${doc.fileUrl}" target="_blank" download="${doc.title}" class="btn btn-sm btn-secondary" style="margin-right:4px;">Download</a>
        <button class="btn btn-sm btn-danger" onclick="deleteDSpaceArchive('${doc.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function handleDSpaceArchiveUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const localDoc = {
    id: `dspace_sim_${Date.now()}`,
    title: file.name,
    sizeBytes: file.size,
    uploadedAt: new Date().toLocaleString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    status: 'Deposited',
    fileUrl: URL.createObjectURL(file)
  };

  if (!appState.dspaceDocs) appState.dspaceDocs = [];
  appState.dspaceDocs.unshift(localDoc);
  saveOfflineState();

  showToastNotification('Pre-print deposited to DSpace archive successfully!');
  renderDSpaceArchive();

  // Reset file input
  event.target.value = '';
}

function deleteDSpaceArchive(id) {
  if (!confirm('Are you sure you want to delete this pre-print from the DSpace archive?')) return;
  if (appState.dspaceDocs) {
    appState.dspaceDocs = appState.dspaceDocs.filter(d => d.id !== id);
    saveOfflineState();
    showToastNotification('Pre-print deleted.');
    renderDSpaceArchive();
  }
}
