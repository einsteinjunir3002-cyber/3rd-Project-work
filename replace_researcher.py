import re
import os

html_content = """
  <!-- ============================================================
       RESEARCHER PORTAL SECTIONS (7 Core Features, Expanded)
       ============================================================ -->
  
  <style>
    .researcher-tab-btn {
      background: transparent;
      color: var(--text-muted);
      border: none;
      padding: 8px 16px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .researcher-tab-btn.active {
      background: rgba(124, 58, 237, 0.2);
      color: var(--primary-light);
      border: 1px solid rgba(124, 58, 237, 0.4);
    }
    .researcher-tab-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-color);
    }
    .res-sub-view {
      display: none;
      animation: fadeIn 0.3s ease;
      margin-top: 16px;
    }
    .res-sub-view.active {
      display: block;
    }
    .glass-panel {
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.05);
    }
  </style>

  <script>
    function switchResearcherSubTab(sectionId, subTabId) {
      // Deactivate all buttons in this section
      const section = document.getElementById(sectionId);
      if (!section) return;
      section.querySelectorAll('.researcher-tab-btn').forEach(btn => btn.classList.remove('active'));
      // Activate clicked button
      event.currentTarget.classList.add('active');
      
      // Hide all sub-views in this section
      section.querySelectorAll('.res-sub-view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
      });
      // Show target sub-view
      const target = document.getElementById(subTabId);
      if (target) {
        target.classList.add('active');
        target.style.display = 'block';
      }
    }
  </script>

  <!-- 1. Research Project Dashboard -->
  <section id="researcher-dashboard" class="portal-view researcher-view">
    <h2>📊 Research Project <span class="gradient-text">Dashboard</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Overview of your ongoing research, funding utilization, and key milestones.</p>
    
    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-dashboard', 'res-dashboard-health')">📈 Project Health</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-dashboard', 'res-dashboard-funding')">💰 Funding Tracker</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-dashboard', 'res-dashboard-timeline')">📅 Milestone Timeline</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-dashboard', 'res-dashboard-activity')">🔄 Activity Feed</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-dashboard', 'res-dashboard-alerts')">🔔 Institutional Alerts</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-dashboard', 'res-dashboard-ai')">🤖 AI Insights</button>
    </nav>

    <div id="res-dashboard-health" class="res-sub-view active" style="display:block;">
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="stat-card glass"><h3>Active Projects</h3><div class="stat-val">4</div></div>
        <div class="stat-card glass"><h3>Completed Stages</h3><div class="stat-val">12/24</div></div>
        <div class="stat-card glass"><h3>Pending Reviews</h3><div class="stat-val" style="color:var(--warning);">3</div></div>
        <div class="stat-card glass"><h3>Overall Health</h3><div class="stat-val" style="color:var(--success);">92%</div></div>
      </div>
    </div>
    
    <div id="res-dashboard-funding" class="res-sub-view">
      <div class="glass-panel">
        <h3>Grant Utilization (GH₵ 120,500 Total)</h3>
        <div style="height:20px; background:rgba(255,255,255,0.1); border-radius:10px; margin:16px 0; overflow:hidden; display:flex;">
          <div style="width:45%; background:var(--primary); height:100%;" title="Equipment (45%)"></div>
          <div style="width:25%; background:var(--secondary); height:100%;" title="Travel (25%)"></div>
          <div style="width:15%; background:var(--warning); height:100%;" title="Software (15%)"></div>
        </div>
        <ul style="list-style:none; padding:0; font-size:0.9rem; color:var(--text-light);">
          <li>🟢 Equipment: GH₵ 54,225</li>
          <li>🔵 Travel: GH₵ 30,125</li>
          <li>🟡 Software/Data: GH₵ 18,075</li>
          <li>⚪ Remaining: GH₵ 18,075</li>
        </ul>
      </div>
    </div>

    <div id="res-dashboard-timeline" class="res-sub-view">
      <div class="glass-panel">
        <h3>Upcoming Deadlines</h3>
        <ul style="list-style:none; padding:0; margin-top:16px;">
          <li style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
            <span>Submit Ethics Form for IoT Smart Farming</span> <span class="badge badge-warning">Due in 3 days</span>
          </li>
          <li style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
            <span>Data Collection Completed (AI in Healthcare)</span> <span class="badge badge-success">Done</span>
          </li>
        </ul>
      </div>
    </div>

    <div id="res-dashboard-activity" class="res-sub-view">
      <div class="glass-panel">
        <h3>Recent Team Actions</h3>
        <ul style="list-style:none; padding:0; margin-top:16px;">
          <li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);"><strong>Dr. Mensah</strong> uploaded `Healthcare_IoT_Dataset.csv`</li>
          <li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);"><strong>Prof. Abena</strong> approved the ethics methodology.</li>
          <li style="padding:8px 0;"><strong>System</strong> generated automated backup of Repository.</li>
        </ul>
      </div>
    </div>

    <div id="res-dashboard-alerts" class="res-sub-view">
      <div class="glass-panel">
        <h3>Institutional Announcements</h3>
        <div style="padding:12px; background:rgba(239,68,68,0.1); border-left:4px solid var(--danger); margin-bottom:12px;">
          <strong>Urgent:</strong> All IoT research protocols must comply with the new Data Protection Act by Aug 1st.
        </div>
        <div style="padding:12px; background:rgba(16,185,129,0.1); border-left:4px solid var(--success);">
          <strong>Grant Call:</strong> Ministry of Education Seed Funding applications are open until Nov 15.
        </div>
      </div>
    </div>

    <div id="res-dashboard-ai" class="res-sub-view">
      <div class="glass-panel">
        <h3>SmartLearn AI Insights</h3>
        <p style="color:var(--text-muted);">Based on your recent activity, the AI suggests:</p>
        <ul style="margin-top:12px; color:var(--text-light);">
          <li>Your `IoT_Smart_Farming` paper is 85% ready for draft review. Consider assigning Dr. Mensah for peer-review.</li>
          <li>You have GH₵ 18,075 remaining in your grant; consider allocating it to AWS cloud compute credits before the fiscal year ends.</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- 2. Document and Data Repository -->
  <section id="researcher-repository" class="portal-view researcher-view">
    <h2>📁 Document and Data <span class="gradient-text">Repository</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Manage, version, and share your research data securely.</p>
    
    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-repository', 'res-repo-files')">☁️ File Manager</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-repository', 'res-repo-versioning')">🕒 Version History</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-repository', 'res-repo-access')">🔐 Access Management</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-repository', 'res-repo-analytics')">📊 Storage Analytics</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-repository', 'res-repo-metadata')">🏷️ Metadata & Tags</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-repository', 'res-repo-export')">📤 Import/Export Data</button>
    </nav>

    <div id="res-repo-files" class="res-sub-view active" style="display:block;">
      <div class="glass" style="padding:24px; border-radius:14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
          <input type="text" placeholder="Search datasets..." class="form-control" style="max-width:300px;">
          <div style="display:flex; gap:8px;">
            <input type="file" id="research-doc-upload" class="form-control" style="display:none;" onchange="uploadResearchDocument(event)">
            <button class="btn btn-primary" onclick="document.getElementById('research-doc-upload').click()">⬆️ Upload File</button>
          </div>
        </div>
        <table style="width:100%; text-align:left; border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
              <th style="padding:12px;">File Name</th><th style="padding:12px;">Type</th><th style="padding:12px;">Size</th><th style="padding:12px;">Action</th>
            </tr>
          </thead>
          <tbody id="research-doc-table-body">
            <tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Loading documents from Supabase...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="res-repo-versioning" class="res-sub-view">
      <div class="glass-panel">
        <h3>Dataset Version History</h3>
        <p style="color:var(--text-muted);">Select a file to view its immutable audit trail.</p>
        <select class="form-control" style="max-width:300px; margin-bottom:16px;">
          <option>Healthcare_IoT_Dataset.csv</option>
        </select>
        <ul style="list-style:none; padding:0; font-size:0.9rem;">
          <li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);">v1.2 - Added rural clinic nodes (Yesterday, 14:00)</li>
          <li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);">v1.1 - Cleaned null values (Tuesday, 09:15)</li>
          <li style="padding:8px 0;">v1.0 - Initial Upload (Monday, 11:30)</li>
        </ul>
      </div>
    </div>

    <div id="res-repo-access" class="res-sub-view">
      <div class="glass-panel">
        <h3>Folder Permissions</h3>
        <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
          <span>Principal Investigators</span>
          <select class="form-control" style="width:120px; padding:4px;"><option>Read & Write</option></select>
        </div>
        <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
          <span>Research Assistants</span>
          <select class="form-control" style="width:120px; padding:4px;"><option>Read Only</option><option>Read & Write</option></select>
        </div>
        <button class="btn btn-primary" style="margin-top:16px;">Save Permissions</button>
      </div>
    </div>

    <div id="res-repo-analytics" class="res-sub-view">
      <div class="glass-panel">
        <h3>Cloud Storage Usage</h3>
        <div style="font-size:2rem; font-weight:bold; margin-bottom:8px;">42.5 GB <span style="font-size:1rem; color:var(--text-muted); font-weight:normal;">/ 100 GB</span></div>
        <div style="height:12px; background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden;">
          <div style="width:42.5%; background:var(--primary); height:100%;"></div>
        </div>
      </div>
    </div>

    <div id="res-repo-metadata" class="res-sub-view">
      <div class="glass-panel">
        <h3>Metadata & Indexing</h3>
        <p style="color:var(--text-muted);">Ensure files are discoverable across the institution.</p>
        <div class="form-group"><label>Keywords (Comma separated)</label><input type="text" class="form-control" value="IoT, Healthcare, Ghana, AI"></div>
        <div class="form-group"><label>Data Collection Region</label><select class="form-control"><option>Greater Accra</option><option>Ashanti Region</option><option>Northern Region</option></select></div>
        <button class="btn btn-secondary">Update Metadata</button>
      </div>
    </div>

    <div id="res-repo-export" class="res-sub-view">
      <div class="glass-panel">
        <h3>Data Importers & Exporters</h3>
        <div style="display:flex; gap:16px; margin-top:16px;">
          <button class="btn btn-secondary" style="flex:1;">🔄 Sync with REDCap</button>
          <button class="btn btn-secondary" style="flex:1;">📤 Export to SPSS (.sav)</button>
          <button class="btn btn-secondary" style="flex:1;">📥 Import from Qualtrics</button>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. Collaboration and Team Management -->
  <section id="researcher-collaboration" class="portal-view researcher-view">
    <h2>🤝 Team <span class="gradient-text">Collaboration</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Real-time communication, task delegation, and peer-review workflows.</p>

    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-collaboration', 'res-collab-chat')">💬 Live Chat</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-collaboration', 'res-collab-whiteboard')">🖍️ Shared Whiteboard</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-collaboration', 'res-collab-meetings')">📹 Video Meetings</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-collaboration', 'res-collab-tasks')">📋 Task Delegation</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-collaboration', 'res-collab-roles')">👥 Co-Author Roles</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-collaboration', 'res-collab-peer')">🔍 Peer Review Hub</button>
    </nav>

    <div id="res-collab-chat" class="res-sub-view active" style="display:block;">
      <div style="display:grid; grid-template-columns:1fr 2fr; gap:20px;">
        <div class="glass" style="padding:24px; border-radius:14px;">
          <h3>Project Team</h3>
          <ul id="project-team-list" style="list-style:none; padding:0; margin-top:16px; display:flex; flex-direction:column; gap:12px;">
            <li style="display:flex; align-items:center; gap:12px;"><div style="width:40px;height:40px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">Dr</div> <div><div>Dr. Mensah</div><div style="font-size:0.75rem; color:var(--text-muted);">Principal Investigator</div></div></li>
          </ul>
          <button class="btn btn-secondary" style="width:100%; margin-top:16px;" onclick="alert('Add Member feature is coming in Phase 4.')">+ Add Member</button>
        </div>
        <div class="glass" style="padding:24px; border-radius:14px; display:flex; flex-direction:column;">
          <h3>Live Project Discussion</h3>
          <div id="project-chat-board" style="flex-grow:1; background:rgba(0,0,0,0.2); border-radius:8px; padding:12px; margin:16px 0; min-height:200px; max-height:350px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
            <div style="text-align:center; color:var(--text-muted); font-size:0.8rem;">Connecting to Supabase Realtime...</div>
          </div>
          <form onsubmit="sendResearchChatMessage(event)" style="display:flex; gap:8px;">
            <input type="text" id="research-chat-input" class="form-control" placeholder="Type a message...">
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </div>
      </div>
    </div>

    <div id="res-collab-whiteboard" class="res-sub-view">
      <div class="glass-panel" style="text-align:center; padding:40px;">
        <h3>Virtual Scratchpad</h3>
        <p style="color:var(--text-muted); margin-bottom:20px;">Draw and sketch architectural diagrams together.</p>
        <div style="width:100%; height:300px; background:white; border-radius:8px; border:2px dashed var(--border); display:flex; align-items:center; justify-content:center; color:#333;">[Canvas Rendering Engine Disabled in Demo]</div>
      </div>
    </div>

    <div id="res-collab-meetings" class="res-sub-view">
      <div class="glass-panel">
        <h3>Scheduled Syncs</h3>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:8px;">
          <div><strong>Weekly Architecture Review</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">Fridays at 14:00 GMT</span></div>
          <button class="btn btn-primary btn-sm">Join Zoom</button>
        </div>
        <button class="btn btn-secondary mt-2">+ Schedule New Meeting</button>
      </div>
    </div>

    <div id="res-collab-tasks" class="res-sub-view">
      <div class="glass-panel">
        <h3>Sprint & Task Delegation</h3>
        <div style="display:flex; gap:16px;">
          <div style="flex:1; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px;">
            <h4 style="margin-bottom:12px; font-size:0.9rem;">To Do</h4>
            <div class="glass" style="padding:8px; font-size:0.85rem; margin-bottom:8px;">Draft Abstract (Assigned: Dr. Mensah)</div>
          </div>
          <div style="flex:1; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px;">
            <h4 style="margin-bottom:12px; font-size:0.9rem;">In Progress</h4>
            <div class="glass" style="padding:8px; font-size:0.85rem; margin-bottom:8px;">Data Cleaning (Assigned: RA)</div>
          </div>
          <div style="flex:1; background:rgba(0,0,0,0.3); padding:12px; border-radius:8px;">
            <h4 style="margin-bottom:12px; font-size:0.9rem;">Review</h4>
            <div class="glass" style="padding:8px; font-size:0.85rem; margin-bottom:8px;">Hardware Specs (Assigned: Prof. Abena)</div>
          </div>
        </div>
      </div>
    </div>

    <div id="res-collab-roles" class="res-sub-view">
      <div class="glass-panel">
        <h3>Authorship & Contributions (CRediT)</h3>
        <p style="color:var(--text-muted);">Track contributions for future manuscript attribution using the CRediT taxonomy.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th>Name</th><th>Primary Roles</th></tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:8px;">Dr. Mensah</td><td style="padding:8px;">Conceptualization, Funding Acquisition</td></tr>
          <tr><td style="padding:8px;">Prof. Abena</td><td style="padding:8px;">Methodology, Supervision</td></tr>
        </table>
      </div>
    </div>

    <div id="res-collab-peer" class="res-sub-view">
      <div class="glass-panel">
        <h3>Internal Peer Review</h3>
        <p style="color:var(--text-muted);">Request internal feedback before journal submission.</p>
        <button class="btn btn-secondary">Request Review on 'Draft_v2.pdf'</button>
      </div>
    </div>
  </section>

  <!-- 4. Ethics and Approval Management -->
  <section id="researcher-ethics" class="portal-view researcher-view">
    <h2>✅ Ethics & <span class="gradient-text">Approvals</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Submit and track IRB/Ethics review proposals and compliance certificates.</p>

    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-ethics', 'res-ethics-status')">📈 Compliance Tracker</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-ethics', 'res-ethics-irb')">📋 IRB Application Forms</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-ethics', 'res-ethics-consent')">✍️ Consent Generators</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-ethics', 'res-ethics-integrity')">🛡️ Integrity Checker</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-ethics', 'res-ethics-coi')">⚖️ Conflict of Interest</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-ethics', 'res-ethics-amend')">📝 Protocol Amendments</button>
    </nav>

    <div id="res-ethics-status" class="res-sub-view active" style="display:block;">
      <div class="glass" style="padding:24px; border-radius:14px;">
        <button class="btn btn-primary" style="margin-bottom:20px;" onclick="alert('Ethics form wizard would open here.')">+ New Application</button>
        <div class="tracking-timeline" style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; padding:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px;">
            <div>
              <h4 style="margin-bottom:4px;">Smart Farming IoT Impact</h4>
              <div style="font-size:0.8rem; color:var(--text-muted);">Submitted: May 12, 2026</div>
            </div>
            <div class="badge badge-success" style="align-self:center;">Approved</div>
          </div>
          <div style="display:flex; justify-content:space-between; padding:16px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px;">
            <div>
              <h4 style="margin-bottom:4px;">AI in Healthcare Patient Data</h4>
              <div style="font-size:0.8rem; color:var(--text-muted);">Submitted: June 2, 2026</div>
            </div>
            <div class="badge badge-warning" style="align-self:center;">Under Review</div>
          </div>
        </div>
      </div>
    </div>

    <div id="res-ethics-irb" class="res-sub-view">
      <div class="glass-panel">
        <h3>Digital IRB Submission</h3>
        <p style="color:var(--text-muted);">Step-by-step wizard to formulate your ethical clearance application.</p>
        <div class="form-group"><label>Project Title</label><input type="text" class="form-control"></div>
        <div class="form-group"><label>Risk Level</label><select class="form-control"><option>Minimal Risk</option><option>High Risk (Clinical)</option></select></div>
        <button class="btn btn-secondary">Start Wizard</button>
      </div>
    </div>

    <div id="res-ethics-consent" class="res-sub-view">
      <div class="glass-panel">
        <h3>Consent Form Templates</h3>
        <ul style="list-style:none; padding:0; margin-bottom:16px;">
          <li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);">📄 General Adult Consent (English) <button class="btn btn-sm btn-secondary" style="float:right;">Download</button></li>
          <li style="padding:8px 0;">📄 Parental/Guardian Consent (Twi Translated) <button class="btn btn-sm btn-secondary" style="float:right;">Download</button></li>
        </ul>
      </div>
    </div>

    <div id="res-ethics-integrity" class="res-sub-view">
      <div class="glass-panel">
        <h3>Plagiarism & AI Generation Check</h3>
        <p style="color:var(--text-muted); margin-bottom:12px;">Pre-screen your proposal before submission.</p>
        <button class="btn btn-primary">Scan Document</button>
      </div>
    </div>

    <div id="res-ethics-coi" class="res-sub-view">
      <div class="glass-panel">
        <h3>Conflict of Interest Declarations</h3>
        <div style="padding:12px; background:rgba(0,0,0,0.2); border-radius:8px;">
          <strong>Status:</strong> Up to date (Declared Jan 2026)
          <br><button class="btn btn-sm btn-secondary" style="margin-top:8px;">Update Declaration</button>
        </div>
      </div>
    </div>

    <div id="res-ethics-amend" class="res-sub-view">
      <div class="glass-panel">
        <h3>Protocol Amendments</h3>
        <p style="color:var(--text-muted);">Request changes to already-approved methodologies.</p>
        <button class="btn btn-secondary">Submit Amendment for 'Smart Farming IoT'</button>
      </div>
    </div>
  </section>

  <!-- 5. Publication and Citation Management -->
  <section id="researcher-publications" class="portal-view researcher-view">
    <h2>📚 Publications & <span class="gradient-text">Citations</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Generate citations, analyze impact, and track manuscript submissions.</p>

    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-publications', 'res-pub-manuscript')">📝 Manuscript Manager</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-publications', 'res-pub-citations')">📌 Citation Generator</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-publications', 'res-pub-journals')">🎯 Journal Recommender</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-publications', 'res-pub-reviewers')">🕵️ Reviewer Tracking</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-publications', 'res-pub-impact')">📊 Impact Analytics</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-publications', 'res-pub-openaccess')">🔓 Open Access Linker</button>
    </nav>

    <div id="res-pub-manuscript" class="res-sub-view active" style="display:block;">
      <div class="glass-panel">
        <h3>My Published & Draft Works</h3>
        <button class="btn btn-primary" style="margin-bottom:16px;">+ Register Draft</button>
        <ul style="list-style:none; padding:0;">
          <li style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
            <span>1. "Adoption of E-Learning in Ghana"</span> <span class="badge badge-success">Published</span>
          </li>
          <li style="padding:12px; display:flex; justify-content:space-between;">
            <span>2. "IoT Crop Monitoring Sensors"</span> <span class="badge badge-warning">Draft</span>
          </li>
        </ul>
      </div>
    </div>

    <div id="res-pub-citations" class="res-sub-view">
      <div class="glass-panel">
        <h3>AI Citation Generator</h3>
        <div style="margin-top:16px;">
          <input type="text" class="form-control" placeholder="Enter DOI or Paper Title" style="margin-bottom:12px;">
          <select class="form-control" style="margin-bottom:12px;">
            <option>APA 7th Edition</option><option>MLA 9th Edition</option><option>Harvard</option><option>IEEE</option>
          </select>
          <button class="btn btn-secondary" onclick="alert('Generating citation...')">Generate Citation</button>
        </div>
      </div>
    </div>

    <div id="res-pub-journals" class="res-sub-view">
      <div class="glass-panel">
        <h3>Target Journal Recommender</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Enter your abstract to find journals with matching scopes.</p>
        <textarea class="form-control" placeholder="Paste abstract here..." rows="3" style="margin-bottom:12px;"></textarea>
        <button class="btn btn-primary">Find Journals</button>
      </div>
    </div>

    <div id="res-pub-reviewers" class="res-sub-view">
      <div class="glass-panel">
        <h3>Reviewer Response Tracker</h3>
        <p style="color:var(--text-muted);">Manage your point-by-point rebuttal documents.</p>
        <button class="btn btn-secondary">Upload Reviewer Comments</button>
      </div>
    </div>

    <div id="res-pub-impact" class="res-sub-view">
      <div class="glass-panel">
        <h3>Author Impact Metrics</h3>
        <div style="display:flex; gap:24px; margin-top:16px;">
          <div><h4 style="color:var(--text-muted);">h-index</h4><span style="font-size:2rem; font-weight:bold;">14</span></div>
          <div><h4 style="color:var(--text-muted);">i10-index</h4><span style="font-size:2rem; font-weight:bold;">18</span></div>
          <div><h4 style="color:var(--text-muted);">Total Citations</h4><span style="font-size:2rem; font-weight:bold;">1,204</span></div>
        </div>
      </div>
    </div>

    <div id="res-pub-openaccess" class="res-sub-view">
      <div class="glass-panel">
        <h3>Open Access Repository (Pre-prints)</h3>
        <p style="color:var(--text-muted);">Deposit your pre-prints to the institutional repository.</p>
        <button class="btn btn-secondary">Upload to DSpace Archive</button>
      </div>
    </div>
  </section>

  <!-- 6. Survey and Data Collection Tools -->
  <section id="researcher-surveys" class="portal-view researcher-view">
    <h2>📋 Surveys & <span class="gradient-text">Data Collection</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Design questionnaires, distribute securely, and monitor live responses.</p>

    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-surveys', 'res-survey-analytics')">📊 Live Analytics</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-surveys', 'res-survey-builder')">🏗️ Survey Builder</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-surveys', 'res-survey-distro')">📨 Distribution Hub</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-surveys', 'res-survey-anon')">🕵️ Data Anonymization</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-surveys', 'res-survey-export')">📤 Results Export</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-surveys', 'res-survey-quota')">🎯 Audience Quotas</button>
    </nav>

    <div id="res-survey-analytics" class="res-sub-view active" style="display:block;">
      <div class="glass" style="padding:24px; border-radius:14px;">
        <button class="btn btn-primary" style="margin-bottom:20px;">+ Create New Survey</button>
        <table style="width:100%; text-align:left; border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
              <th style="padding:12px;">Survey Title</th><th style="padding:12px;">Status</th><th style="padding:12px;">Responses</th><th style="padding:12px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px;">Student Perceptions of AI Tutors</td><td style="padding:12px;"><span class="badge badge-success">Active</span></td><td style="padding:12px;">342</td><td style="padding:12px;"><button class="btn btn-sm btn-secondary">View Charts</button></td>
            </tr>
            <tr>
              <td style="padding:12px;">Lecturer Feedback 2024</td><td style="padding:12px;"><span class="badge badge-secondary">Closed</span></td><td style="padding:12px;">56</td><td style="padding:12px;"><button class="btn btn-sm btn-secondary">View Report</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="res-survey-builder" class="res-sub-view">
      <div class="glass-panel">
        <h3>Drag-and-Drop Builder</h3>
        <div style="height:150px; border:2px dashed var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); margin-bottom:16px;">[Form Builder Workspace]</div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-secondary">+ Text Input</button>
          <button class="btn btn-sm btn-secondary">+ Multiple Choice</button>
          <button class="btn btn-sm btn-secondary">+ Likert Scale</button>
        </div>
      </div>
    </div>

    <div id="res-survey-distro" class="res-sub-view">
      <div class="glass-panel">
        <h3>Participant Outreach</h3>
        <p style="color:var(--text-muted);">Manage email lists and magic-link distributions.</p>
        <div class="form-group"><label>Target Mailing List</label><select class="form-control"><option>All Engineering Students (Year 4)</option></select></div>
        <button class="btn btn-primary">Send 150 Invitations</button>
      </div>
    </div>

    <div id="res-survey-anon" class="res-sub-view">
      <div class="glass-panel">
        <h3>Data Anonymization Tool</h3>
        <p style="color:var(--text-muted);">Automatically scrub PII (Names, Emails, Phone numbers) before export.</p>
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"><input type="checkbox" checked> Remove Email Addresses</label>
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:16px;"><input type="checkbox" checked> Hash IP Addresses</label>
        <button class="btn btn-secondary">Apply Privacy Filters</button>
      </div>
    </div>

    <div id="res-survey-export" class="res-sub-view">
      <div class="glass-panel">
        <h3>Export Survey Results</h3>
        <div style="display:flex; gap:16px; margin-top:16px;">
          <button class="btn btn-secondary" style="flex:1;">CSV (Raw Data)</button>
          <button class="btn btn-secondary" style="flex:1;">SPSS (.sav format)</button>
          <button class="btn btn-secondary" style="flex:1;">PDF Summary</button>
        </div>
      </div>
    </div>

    <div id="res-survey-quota" class="res-sub-view">
      <div class="glass-panel">
        <h3>Audience Quota Tracker</h3>
        <p style="color:var(--text-muted);">Ensure demographic representation.</p>
        <div style="margin-top:12px;">
          <strong>Female Respondents:</strong> 120 / 150 <span style="font-size:0.8rem; color:var(--warning);">(Needs 30 more)</span>
        </div>
        <div style="margin-top:8px;">
          <strong>Male Respondents:</strong> 222 / 150 <span style="font-size:0.8rem; color:var(--success);">(Quota met)</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 7. Profile Settings -->
  <section id="researcher-settings" class="portal-view researcher-view">
    <h2>⚙️ Profile <span class="gradient-text">Settings</span></h2>
    <p style="color:var(--text-muted);margin-bottom:20px;">Manage your academic identity, security, and portal preferences.</p>

    <nav class="hub-tab-nav" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="researcher-tab-btn active" onclick="switchResearcherSubTab('researcher-settings', 'res-set-bio')">👤 Academic Bio</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-settings', 'res-set-ids')">🔗 External Identifiers</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-settings', 'res-set-security')">🔒 Security & 2FA</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-settings', 'res-set-notifications')">🔔 Notifications</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-settings', 'res-set-theme')">🎨 UI & Accessibility</button>
      <button class="researcher-tab-btn" onclick="switchResearcherSubTab('researcher-settings', 'res-set-affil')">🏛️ Affiliations</button>
    </nav>

    <div id="res-set-bio" class="res-sub-view active" style="display:block;">
      <div class="glass-panel">
        <div class="form-group"><label>Full Name</label><input type="text" class="form-control" value="Dr. Mensah"></div>
        <div class="form-group"><label>Research Focus / Title</label><input type="text" class="form-control" value="Principal Investigator, AI Systems"></div>
        <button class="btn btn-primary">Save Changes</button>
      </div>
    </div>

    <div id="res-set-ids" class="res-sub-view">
      <div class="glass-panel">
        <h3>Link External Academic Profiles</h3>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px;">
          <span><strong>ORCID iD</strong> <br><span style="font-size:0.8rem; color:var(--text-muted);">0000-0002-1234-5678</span></span>
          <button class="btn btn-sm btn-secondary">Unlink</button>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px;">
          <span><strong>Google Scholar</strong> <br><span style="font-size:0.8rem; color:var(--text-muted);">Not linked</span></span>
          <button class="btn btn-sm btn-primary">Connect Account</button>
        </div>
      </div>
    </div>

    <div id="res-set-security" class="res-sub-view">
      <div class="glass-panel">
        <h3>Security Settings</h3>
        <div class="form-group"><label>Current Password</label><input type="password" class="form-control"></div>
        <div class="form-group"><label>New Password</label><input type="password" class="form-control"></div>
        <button class="btn btn-secondary">Update Password</button>
        <hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:20px 0;">
        <h4>Two-Factor Authentication (2FA)</h4>
        <p style="color:var(--text-muted); font-size:0.85rem;">Enhance account security using an authenticator app.</p>
        <button class="btn btn-primary mt-2">Enable 2FA</button>
      </div>
    </div>

    <div id="res-set-notifications" class="res-sub-view">
      <div class="glass-panel">
        <h3>Alert Preferences</h3>
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;"><input type="checkbox" checked> Email me when ethics applications are approved</label>
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;"><input type="checkbox" checked> Receive daily digest of team activity</label>
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;"><input type="checkbox"> Push notifications for new Chat messages</label>
        <button class="btn btn-secondary mt-2">Save Preferences</button>
      </div>
    </div>

    <div id="res-set-theme" class="res-sub-view">
      <div class="glass-panel">
        <h3>Interface Settings</h3>
        <div class="form-group"><label>Color Theme</label><select class="form-control"><option>Deep Space (Dark)</option><option>Light Mode</option></select></div>
        <div class="form-group"><label>Font Size</label><select class="form-control"><option>Default</option><option>Large</option><option>Extra Large</option></select></div>
        <button class="btn btn-secondary">Apply Display Settings</button>
      </div>
    </div>

    <div id="res-set-affil" class="res-sub-view">
      <div class="glass-panel">
        <h3>Institutional Affiliations</h3>
        <p style="color:var(--text-muted); margin-bottom:12px;">Manage your active departments and laboratory associations.</p>
        <ul style="list-style:none; padding:0; margin-bottom:16px;">
          <li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);">Dept of Computer Science, SmartLearn University</li>
          <li style="padding:8px 0;">IoT Excellence Center (Lab Director)</li>
        </ul>
        <button class="btn btn-sm btn-secondary">+ Add Affiliation</button>
      </div>
    </div>
  </section>
"""

def process():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start and end of the Researcher Portal Sections
    start_marker = "<!-- ============================================================\n       RESEARCHER PORTAL SECTIONS"
    end_marker = "<!-- Industry Partner Hub -->"

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print("Markers not found!")
        return

    new_content = content[:start_idx] + html_content + "\n  " + content[end_idx:]

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Successfully replaced Researcher Portal Sections.")

if __name__ == "__main__":
    process()
