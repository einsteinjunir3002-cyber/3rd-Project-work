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