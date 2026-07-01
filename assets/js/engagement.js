/* ============================================================
   SMARTLEARN AI — STUDENT-LECTURER ENGAGEMENT SYSTEM CONTROLLER
   ============================================================ */

// --- OFFLINE MOCK API INTERCEPTOR FOR ENGAGEMENT ---
(function initEngagementMocks() {
  if (typeof appState === 'undefined') {
    setTimeout(initEngagementMocks, 50);
    return;
  }
  
  if (!appState.demoLecturerStats) {
    appState.demoLecturerStats = [
      { id: 'lec_1', name: 'Dr. Kwame Mensah', research: 'AI & Machine Learning', officeHours: 'Mon/Wed 2pm-4pm', followerCount: 120, followed: false },
      { id: 'lec_2', name: 'Prof. Ama Serwaa', research: 'Data Science', officeHours: 'Tue/Thu 10am-12pm', followerCount: 85, followed: false },
      { id: 'lec_3', name: 'Dr. Sophia Tetteh', research: 'Software Engineering', officeHours: 'Fri 1pm-3pm', followerCount: 40, followed: false },
      { id: 'lec_4', name: 'Mr. Emmanuel Osei', research: 'Cybersecurity', officeHours: 'Mon 9am-11am', followerCount: 200, followed: true }
    ];
  }
  
  if (!appState.demoAppointments) {
    appState.demoAppointments = [
      { id: 1, student_id: 'user_std_1', student_name: 'Kofi Mensah', lecturer_id: 'lec_1', topic: 'Project Guidance', scheduled_time: '2026-06-25T14:00', status: 'Pending', notes: '', feedback: '' }
    ];
  }
  
  if (!appState.demoQa) {
    appState.demoQa = [
      { id: 1, student_id: 'user_std_1', student_name: 'Kofi Mensah', lecturer_id: 'lec_1', question_text: 'How do I optimize my ML model?', answer_text: 'Try adjusting the learning rate.', answered_at: '2026-06-20T10:00' }
    ];
  }

  if (!appState.demoCommunities) {
    appState.demoCommunities = [
      { id: 1, name: 'AI Enthusiasts', description: 'Discussing the latest in AI', memberCount: 45, joined: true, lecturer_id: 'lec_1' },
      { id: 2, name: 'Web Dev Mastery', description: 'Frontend and Backend tips', memberCount: 120, joined: false, lecturer_id: 'lec_3' }
    ];
  }

  if (!appState.demoCommunityPosts) {
    appState.demoCommunityPosts = [];
  }

  const originalFetch = window.fetch;
  window.fetch = async function() {
    const url = arguments[0];
    const opts = arguments[1] || {};
    
    // Only intercept /api/ requests
    if (typeof url === 'string' && url.includes('/api/')) {
      const path = url.split('?')[0];
      const searchParams = new URLSearchParams(url.split('?')[1] || '');
      
      const mockResponse = (data) => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data)
      });

      // GET /api/lecturers/stats
      if (path.endsWith('/api/lecturers/stats')) {
        return mockResponse(appState.demoLecturerStats);
      }
      
      // POST /api/lecturers/follow
      if (path.endsWith('/api/lecturers/follow')) {
        const body = JSON.parse(opts.body);
        const lec = appState.demoLecturerStats.find(l => l.id === body.lecturer_id);
        if(lec) { lec.followed = true; lec.followerCount++; }
        return mockResponse({ success: true });
      }
      
      // POST /api/lecturers/unfollow
      if (path.endsWith('/api/lecturers/unfollow')) {
        const body = JSON.parse(opts.body);
        const lec = appState.demoLecturerStats.find(l => l.id === body.lecturer_id);
        if(lec) { lec.followed = false; lec.followerCount--; }
        return mockResponse({ success: true });
      }
      
      // GET /api/appointments
      if (path.endsWith('/api/appointments')) {
        const role = searchParams.get('role');
        const userId = searchParams.get('user_id');
        let appts = [];
        if (role === 'student') appts = appState.demoAppointments.filter(a => a.student_id === userId);
        else appts = appState.demoAppointments;
        return mockResponse(appts);
      }
      
      // POST /api/appointments/request
      if (path.endsWith('/api/appointments/request')) {
        const body = JSON.parse(opts.body);
        appState.demoAppointments.push({
          id: Date.now(),
          student_id: body.student_id,
          student_name: body.student_name,
          lecturer_id: body.lecturer_id,
          topic: body.topic,
          scheduled_time: body.scheduled_time,
          status: 'Pending',
          notes: body.notes,
          feedback: ''
        });
        return mockResponse({ success: true });
      }

      // POST /api/appointments/respond
      if (path.endsWith('/api/appointments/respond')) {
        const body = JSON.parse(opts.body);
        const appt = appState.demoAppointments.find(a => a.id == body.appointment_id);
        if(appt) {
          appt.status = body.status;
          appt.feedback = body.feedback;
        }
        return mockResponse({ success: true });
      }
      
      // GET /api/qa
      if (path.endsWith('/api/qa')) {
        const role = searchParams.get('role');
        const userId = searchParams.get('user_id');
        let qas = [];
        if (role === 'student') qas = appState.demoQa.filter(q => q.student_id === userId);
        else qas = appState.demoQa;
        return mockResponse(qas);
      }
      
      // POST /api/qa/question
      if (path.endsWith('/api/qa/question')) {
        const body = JSON.parse(opts.body);
        appState.demoQa.push({
          id: Date.now(),
          student_id: body.student_id,
          student_name: body.student_name,
          lecturer_id: body.lecturer_id,
          question_text: body.question_text,
          answer_text: '',
          answered_at: null
        });
        return mockResponse({ success: true });
      }

      // POST /api/qa/answer
      if (path.endsWith('/api/qa/answer')) {
        const body = JSON.parse(opts.body);
        const qa = appState.demoQa.find(q => q.id == body.question_id);
        if(qa) {
          qa.answer_text = body.answer_text;
          qa.answered_at = new Date().toISOString();
        }
        return mockResponse({ success: true });
      }
      
      // GET /api/communities
      if (path.endsWith('/api/communities')) {
        return mockResponse(appState.demoCommunities);
      }
      
      // POST /api/communities/create
      if (path.endsWith('/api/communities/create')) {
        const body = JSON.parse(opts.body);
        appState.demoCommunities.push({
          id: Date.now(),
          name: body.name,
          description: body.description,
          memberCount: 1,
          joined: true,
          lecturer_id: body.lecturer_id
        });
        return mockResponse({ success: true });
      }
      
      // POST /api/communities/join
      if (path.endsWith('/api/communities/join')) {
        const body = JSON.parse(opts.body);
        const com = appState.demoCommunities.find(c => c.id == body.community_id);
        if(com) { com.joined = true; com.memberCount++; }
        return mockResponse({ success: true });
      }

      // POST /api/communities/leave
      if (path.endsWith('/api/communities/leave')) {
        const body = JSON.parse(opts.body);
        const com = appState.demoCommunities.find(c => c.id == body.community_id);
        if(com) { com.joined = false; com.memberCount--; }
        return mockResponse({ success: true });
      }

      // GET /api/communities/posts
      if (path.endsWith('/api/communities/posts')) {
        const cid = searchParams.get('community_id');
        const posts = appState.demoCommunityPosts.filter(p => p.community_id == cid);
        return mockResponse(posts);
      }

      // POST /api/communities/post
      if (path.endsWith('/api/communities/post')) {
        const body = JSON.parse(opts.body);
        appState.demoCommunityPosts.push({
          id: Date.now(),
          community_id: body.community_id,
          author_name: body.author_name || appState.user.name,
          content: body.content,
          type: body.type || 'text',
          created_at: new Date().toISOString(),
          likes: 0,
          comments: []
        });
        return mockResponse({ success: true });
      }
      
      // POST /api/communities/react
      if (path.endsWith('/api/communities/react')) {
        return mockResponse({ success: true });
      }
      
      // POST /api/communities/comment
      if (path.endsWith('/api/communities/comment')) {
        const body = JSON.parse(opts.body);
        const post = appState.demoCommunityPosts.find(p => p.id == body.post_id);
        if(post) {
           post.comments.push({
             id: Date.now(),
             author_name: body.author_name || appState.user.name,
             content: body.content,
             created_at: new Date().toISOString()
           });
        }
        return mockResponse({ success: true });
      }
      
      // GET /api/insights
      if (path.endsWith('/api/insights')) {
        return mockResponse([]);
      }

      // POST /api/insights
      if (opts.method === 'POST' && path.endsWith('/api/insights')) {
        return mockResponse({ success: true });
      }

      // GET /api/endorsements
      if (path.endsWith('/api/endorsements')) {
        return mockResponse([]);
      }

      // POST /api/endorsements
      if (opts.method === 'POST' && path.endsWith('/api/endorsements')) {
        return mockResponse({ success: true });
      }

      // GET /api/notifications
      if (path.endsWith('/api/notifications')) {
        return mockResponse([]);
      }

      // POST /api/notifications/read
      if (path.endsWith('/api/notifications/read')) {
        return mockResponse({ success: true });
      }

      // GET /api/engagement/analytics
      if (path.endsWith('/api/engagement/analytics')) {
        return mockResponse({
          followers: 12, questions_asked: 5, communities_joined: 2, total_points: 150
        });
      }

      // GET /api/lecturer/students
      if (path.endsWith('/api/lecturer/students')) {
        return mockResponse([
          { id: 'user_std_1', name: 'Kofi Mensah' },
          { id: 'user_std_2', name: 'Efua Ampah' }
        ]);
      }

      // POST /api/feedback
      if (path.endsWith('/api/feedback')) {
        return mockResponse({ success: true });
      }

      // POST /api/communities
      if (opts.method === 'POST' && path.endsWith('/api/communities')) {
        const body = JSON.parse(opts.body);
        appState.demoCommunities.push({
          id: Date.now(),
          name: body.name,
          description: body.description,
          memberCount: 1,
          joined: true,
          lecturer_id: body.lecturer_id
        });
        return mockResponse({ success: true });
      }
    }
    
    return originalFetch.apply(this, arguments);
  };
})();

let wsConn = null;
let activeEngagementRole = null;
let activeEngagementTab = {};
let activeCommunityId = null;
let followedLecturers = [];

// Determine WebSocket Base URL
const getWsBaseUrl = () => {
  const base = typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:5000';
  return base.replace(/^http/, 'ws');
};

// Initialize WebSocket Connection
function initEngagementWebSocket() {
  if (!appState.user) return;
  
  if (wsConn && (wsConn.readyState === WebSocket.OPEN || wsConn.readyState === WebSocket.CONNECTING)) {
    return; // Already connecting or connected
  }

  const wsUrl = getWsBaseUrl();
  console.log(`Connecting to WebSocket Server at ${wsUrl}`);
  
  try {
    wsConn = new WebSocket(wsUrl);

    wsConn.onopen = () => {
      console.log('WebSocket Connection Opened.');
      // Authenticate WebSocket Session
      wsConn.send(JSON.stringify({
        type: 'auth',
        userId: appState.user.id
      }));
    };

    wsConn.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('Received WebSocket message:', msg);
        
        if (msg.type === 'notification') {
          handleIncomingNotification(msg.data);
        } else if (msg.type === 'community_sync') {
          handleIncomingCommunitySync(msg.payload);
        } else if (msg.type === 'qa_answer') {
          handleIncomingQaAnswer(msg);
        } else if (msg.type === 'chat_relay') {
          handleIncomingChatMessage(msg);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    wsConn.onclose = () => {
      console.log('WebSocket Connection Closed. Attempting reconnect in 5 seconds...');
      setTimeout(initEngagementWebSocket, 5000);
    };

    wsConn.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  } catch (e) {
    console.error('Failed to establish WebSocket connection:', e);
  }
}

// Handle Real-Time Notifications
function handleIncomingNotification(notification) {
  // Show toast alert
  if (typeof showToastNotification === 'function') {
    showToastNotification(`🔔 ${notification.text}`);
  }
  
  // Prepends to the local list if tab is active
  const notifsList = document.getElementById('engagement-std-notifications-list');
  if (notifsList) {
    const item = createNotificationElement(notification);
    notifsList.insertBefore(item, notifsList.firstChild);
  }
  
  // Refresh stats if notifications or analytics changes
  if (appState.role === 'student') {
    loadEngagementAnalytics();
  }
}

// Handle Live Q&A updates
function handleIncomingQaAnswer(msg) {
  if (typeof showToastNotification === 'function') {
    showToastNotification(`💬 Your question was answered!`);
  }
  if (activeEngagementRole === 'student') {
    loadQaLog();
  }
}

// Handle Incoming Chat Message
function handleIncomingChatMessage(msg) {
  // If the receiver is a lecturer, they are receiving a message from a student.
  // If the receiver is a student, they are receiving a message from a faculty member.
  const isLecturer = appState.role === 'lecturer';
  const chatKey = isLecturer ? msg.senderId : msg.senderId; // Store by sender's ID/email
  
  if (!appState.facultyChats) appState.facultyChats = {};
  if (!appState.facultyChats[chatKey]) appState.facultyChats[chatKey] = [];
  
  appState.facultyChats[chatKey].push({
    sender: isLecturer ? 'student' : 'faculty',
    text: msg.text,
    timestamp: msg.timestamp || 'Just now'
  });
  
  if (typeof saveOfflineState === 'function') saveOfflineState();
  if (typeof renderFacultyChat === 'function') renderFacultyChat();
  if (typeof showToastNotification === 'function') {
    showToastNotification(`💬 New message from ${msg.senderName}`);
  }
}

// Handle Community Real-time Updates (Posts, Comments, Reactions)
function handleIncomingCommunitySync(payload) {
  if (!activeCommunityId) return;

  if (payload.action === 'new_post' && payload.post.community_id == activeCommunityId) {
    // Inject post into feed
    const feed = document.getElementById(activeEngagementRole === 'student' ? 'engagement-std-posts-list' : 'engagement-lec-posts-list');
    if (feed) {
      const card = createPostCardElement(payload.post);
      feed.insertBefore(card, feed.firstChild);
    }
  } else if (payload.action === 'new_comment' && payload.comment.post_id) {
    // Find comment list for that post
    const commentList = document.getElementById(`comments-list-${payload.comment.post_id}`);
    if (commentList) {
      const commentDiv = createCommentElement(payload.comment);
      commentList.appendChild(commentDiv);
      
      // Update comment count text
      const countEl = document.getElementById(`comment-count-${payload.comment.post_id}`);
      if (countEl) {
        const curCount = parseInt(countEl.textContent) || 0;
        countEl.textContent = `${curCount + 1} Comments`;
      }
    }
  } else if (payload.action === 'reaction_sync' && payload.post_id) {
    // Sync likes count
    const likeBtn = document.getElementById(`like-btn-${payload.post_id}`);
    if (likeBtn) {
      const heartCount = payload.reactions.filter(r => r.reaction_type === 'like').length;
      likeBtn.innerHTML = `👍 Like (${heartCount})`;
    }
  }
}

// Load All Engagement Systems Data
async function loadEngagementData() {
  if (!appState.user) return;
  activeEngagementRole = appState.role;
  console.log(`Loading Engagement Module Data for Role: ${activeEngagementRole}`);

  if (activeEngagementRole === 'student') {
    loadLecturerDirectory();
    loadAppointments();
    loadQaLog();
    loadCommunities();
    loadInsightsFeed();
    loadProjectEndorsements();
    loadNotifications();
    loadEngagementAnalytics();
  } else if (activeEngagementRole === 'lecturer') {
    loadLecturerAppointments();
    loadLecturerCommunities();
    loadLecturerQaInbox();
    loadFacultyStudentsDropdown();
  }
}

// TAB TOGGLE INTERACTION
window.switchEngagementTab = function(role, tabName) {
  activeEngagementTab[role] = tabName;
  
  // Toggle active button styles
  const prefix = role === 'student' ? 'tab-btn-std-' : 'tab-btn-lec-';
  const buttons = document.querySelectorAll(role === 'student' ? '#student-engagement .engagement-tab-btn' : '#lecturer-engagement .engagement-tab-btn');
  buttons.forEach(btn => {
    btn.classList.remove('btn-primary', 'active');
    btn.classList.add('btn-secondary');
  });

  const activeBtn = document.getElementById(`${prefix}${tabName}`);
  if (activeBtn) {
    activeBtn.classList.remove('btn-secondary');
    activeBtn.classList.add('btn-primary', 'active');
  }

  // Toggle tab contents
  const panePrefix = role === 'student' ? 'engagement-std-' : 'engagement-lec-';
  const panes = document.querySelectorAll(role === 'student' ? '#student-engagement .engagement-tab-pane' : '#lecturer-engagement .engagement-tab-pane');
  panes.forEach(pane => pane.style.display = 'none');

  const targetPane = document.getElementById(`${panePrefix}${tabName}`);
  if (targetPane) targetPane.style.display = 'block';

  // Load contextual data if necessary
  if (role === 'student') {
    if (tabName === 'appointments') {
      loadAppointments();
      loadQaLog();
    } else if (tabName === 'communities') {
      loadCommunities();
    } else if (tabName === 'insights') {
      loadInsightsFeed();
      loadProjectEndorsements();
    }
  } else if (role === 'lecturer') {
    if (tabName === 'appointments') {
      loadLecturerAppointments();
    } else if (tabName === 'communities') {
      loadLecturerCommunities();
    } else if (tabName === 'qa') {
      loadLecturerQaInbox();
      loadFacultyStudentsDropdown();
    }
  }
};

/* ============================================================
   1. STUDENT PORTAL ACTIONS
   ============================================================ */

// 1.1 Follow & Directory
async function loadLecturerDirectory() {
  const grid = document.getElementById('lecturer-directory-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="color:var(--text-muted);">Loading lecturers...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/api/lecturers/stats?student_id=${appState.user.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch lecturer stats');

    followedLecturers = data.filter(lec => lec.followed);
    renderLecturerSelectDropdowns();

    renderDirectoryUI(data);
  } catch (err) {
    console.error('Error loading directory:', err);
    grid.innerHTML = `<div style="color:var(--text-danger);">Error: ${err.message}</div>`;
  }
}

function renderDirectoryUI(lecturers) {
  const grid = document.getElementById('lecturer-directory-grid');
  const searchVal = document.getElementById('engagement-std-search-lecturer')?.value.toLowerCase() || '';
  
  const filtered = lecturers.filter(lec => 
    lec.name.toLowerCase().includes(searchVal) ||
    lec.research.toLowerCase().includes(searchVal) ||
    lec.officeHours.toLowerCase().includes(searchVal)
  );

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="color:var(--text-muted); grid-column:span 3; padding:20px 0;">No lecturers found matching query.</div>';
    return;
  }

  grid.innerHTML = filtered.map(lec => `
    <div class="widget glass" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between; border: 1px solid var(--border);">
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <img src="picture/avatar_lecturer.jpg" alt="${lec.name}" style="width:48px; height:48px; border-radius:50%; border:2px solid var(--primary); object-fit:cover;">
          <div>
            <h4 style="margin:0; font-size:1rem;">${lec.name}</h4>
            <span style="font-size:0.75rem; color:var(--primary); font-weight:700;">Faculty Member</span>
          </div>
        </div>
        <p style="font-size:0.8rem; margin-bottom:8px; line-height:1.4;"><strong>🔬 Research:</strong> ${lec.research}</p>
        <p style="font-size:0.8rem; margin-bottom:12px;"><strong>⏰ Office Hours:</strong> ${lec.officeHours}</p>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:12px;">
        <span style="font-size:0.75rem; color:var(--text-muted);">👥 ${lec.followerCount} followers</span>
        <button class="btn btn-sm ${lec.followed ? 'btn-secondary' : 'btn-primary'}" onclick="toggleFollowLecturer('${lec.id}', ${lec.followed})" style="font-size:0.75rem; padding:4px 8px;">
          ${lec.followed ? 'Unfollow ❌' : 'Follow 🤝'}
        </button>
      </div>
    </div>
  `).join('');
}

window.renderLecturerDirectory = () => {
  // Safe execution handler for live search
  loadLecturerDirectory();
};

async function toggleFollowLecturer(lecturerId, isFollowed) {
  const url = isFollowed ? '/api/lecturers/unfollow' : '/api/lecturers/follow';
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: appState.user.id, lecturer_id: lecturerId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle follow status');
    
    if (typeof showToastNotification === 'function') {
      showToastNotification(isFollowed ? 'Unfollowed lecturer.' : 'Started following lecturer!');
    }
    loadLecturerDirectory();
  } catch (err) {
    console.error('Error toggling follow:', err);
  }
}

function renderLecturerSelectDropdowns() {
  const apptSelect = document.getElementById('appt-lecturer-select');
  const qaSelect = document.getElementById('qa-lecturer-select');
  
  if (!apptSelect || !qaSelect) return;

  if (followedLecturers.length === 0) {
    const emptyOpt = '<option value="">(No followed lecturers - follow first)</option>';
    apptSelect.innerHTML = emptyOpt;
    qaSelect.innerHTML = emptyOpt;
    return;
  }

  const opts = followedLecturers.map(lec => `<option value="${lec.id}">${lec.name}</option>`).join('');
  apptSelect.innerHTML = opts;
  qaSelect.innerHTML = opts;
}

// 1.2 Appointments
async function handleRequestAppointment(e) {
  e.preventDefault();
  const lecturer_id = document.getElementById('appt-lecturer-select').value;
  const scheduled_time = document.getElementById('appt-datetime').value;
  const topic = document.getElementById('appt-topic').value;
  const notes = document.getElementById('appt-notes').value;

  if (!lecturer_id) {
    alert('Please select a lecturer first (you must follow them).');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/appointments/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: appState.user.id,
        student_name: appState.user.name,
        lecturer_id,
        scheduled_time,
        topic,
        notes
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request consultation');

    if (typeof showToastNotification === 'function') {
      showToastNotification('Consultation request sent successfully!');
    }
    document.getElementById('engagement-std-appointment-form').reset();
    loadAppointments();
  } catch (err) {
    alert(err.message);
  }
}

async function loadAppointments() {
  const listDiv = document.getElementById('engagement-std-appointments-list');
  if (!listDiv) return;

  try {
    const res = await fetch(`${API_BASE}/api/appointments?user_id=${appState.user.id}&role=student`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load bookings');

    if (data.length === 0) {
      listDiv.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No consultation bookings found.</div>';
      return;
    }

    listDiv.innerHTML = data.map(appt => {
      let statusColor = '#f59e0b'; // pending
      if (appt.status === 'Approved') statusColor = '#10b981';
      else if (appt.status === 'Declined') statusColor = '#ef4444';

      return `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:10px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:0.85rem;">${appt.topic}</strong>
            <span style="font-size:0.7rem; padding:2px 6px; border-radius:12px; background:${statusColor}22; color:${statusColor}; font-weight:700;">${appt.status}</span>
          </div>
          <p style="font-size:0.75rem; color:var(--text-light); margin-bottom:4px;">📅 ${new Date(appt.scheduled_time).toLocaleString()}</p>
          ${appt.feedback ? `<p style="font-size:0.75rem; color:var(--primary); margin-top:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:4px;"><strong>Feedback:</strong> "${appt.feedback}"</p>` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading appointments:', err);
  }
}

// 1.3 Direct Q&A
async function handleAskQuestion(e) {
  e.preventDefault();
  const lecturer_id = document.getElementById('qa-lecturer-select').value;
  const question_text = document.getElementById('qa-question-text').value;

  if (!lecturer_id) {
    alert('Please select a lecturer first.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/qa/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: appState.user.id,
        student_name: appState.user.name,
        lecturer_id,
        question_text
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit question');

    if (typeof showToastNotification === 'function') {
      showToastNotification('Question sent successfully!');
    }
    document.getElementById('engagement-std-question-form').reset();
    loadQaLog();
  } catch (err) {
    alert(err.message);
  }
}

async function loadQaLog() {
  const qaDiv = document.getElementById('engagement-std-qa-list');
  if (!qaDiv) return;

  try {
    const res = await fetch(`${API_BASE}/api/qa?user_id=${appState.user.id}&role=student`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load Q&A');

    if (data.length === 0) {
      qaDiv.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No questions asked yet.</div>';
      return;
    }

    qaDiv.innerHTML = data.map(qa => `
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:10px; border-radius:8px;">
        <p style="font-size:0.8rem; margin-bottom:4px; font-weight:700; color:var(--text-main);">❓ Q: "${qa.question_text}"</p>
        ${qa.answer_text ? `
          <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); padding:8px; border-radius:6px; margin-top:8px;">
            <p style="font-size:0.75rem; color:#10b981; margin:0;"><strong>💡 Answer:</strong> "${qa.answer_text}"</p>
            <span style="font-size:0.65rem; color:var(--text-muted); display:block; margin-top:4px;">Answered at: ${new Date(qa.answered_at).toLocaleDateString()}</span>
          </div>
        ` : `
          <span style="font-size:0.7rem; color:#f59e0b; font-weight:700; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:10px; display:inline-block; margin-top:6px;">⌛ Awaiting Response</span>
        `}
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading Q&A:', err);
  }
}

// 1.4 Academic Communities
async function loadCommunities() {
  const comList = document.getElementById('engagement-std-communities-list');
  if (!comList) return;

  try {
    const res = await fetch(`${API_BASE}/api/communities?student_id=${appState.user.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load communities');

    if (data.length === 0) {
      comList.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No communities active.</div>';
      return;
    }

    comList.innerHTML = data.map(c => `
      <button class="btn ${activeCommunityId == c.id ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="selectCommunity(${c.id}, '${c.name}', '${c.description}', ${c.joined})" style="width:100%; text-align:left; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
        <span># ${c.name}</span>
        <span style="font-size:0.65rem; color:var(--text-muted);">👥 ${c.memberCount}</span>
      </button>
    `).join('');
  } catch (err) {
    console.error('Error loading communities:', err);
  }
}

window.selectCommunity = async function(id, name, desc, joined) {
  activeCommunityId = id;
  
  // Highlight sidebar boards
  loadCommunities();

  const header = document.getElementById('engagement-std-active-community-header');
  header.innerHTML = `
    <h3># ${name}</h3>
    <p style="color:var(--text-muted); font-size:0.85rem;">${desc}</p>
  `;

  const banner = document.getElementById('engagement-std-community-join-banner');
  const feedContainer = document.getElementById('engagement-std-community-feed-container');

  if (!joined) {
    banner.style.display = 'block';
    feedContainer.style.display = 'none';
  } else {
    banner.style.display = 'none';
    feedContainer.style.display = 'block';
    loadCommunityPosts(id);
  }
};

async function handleJoinCommunity() {
  if (!activeCommunityId) return;

  try {
    const res = await fetch(`${API_BASE}/api/communities/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ community_id: activeCommunityId, student_id: appState.user.id })
    });
    if (!res.ok) throw new Error('Failed to join');

    if (typeof showToastNotification === 'function') {
      showToastNotification('Joined community board successfully!');
    }
    
    // Toggle displays
    document.getElementById('engagement-std-community-join-banner').style.display = 'none';
    document.getElementById('engagement-std-community-feed-container').style.display = 'block';
    
    loadCommunities();
    loadCommunityPosts(activeCommunityId);
  } catch (err) {
    alert(err.message);
  }
}

async function loadCommunityPosts(communityId) {
  const list = document.getElementById('engagement-std-posts-list');
  if (!list) return;

  list.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">Loading discussion feed...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/communities/posts?community_id=${communityId}`);
    const posts = await res.json();
    if (!res.ok) throw new Error(posts.error || 'Failed to load posts');

    if (posts.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:20px 0; text-align:center;">No threads published yet. Start the conversation!</div>';
      return;
    }

    list.innerHTML = '';
    posts.forEach(post => {
      const card = createPostCardElement(post);
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<div style="color:var(--text-danger); font-size:0.8rem;">Error loading posts: ${err.message}</div>`;
  }
}

function createPostCardElement(post) {
  const card = document.createElement('div');
  card.className = 'widget glass';
  card.style.background = 'rgba(255,255,255,0.02)';
  card.style.border = '1px solid var(--border)';
  card.style.padding = '15px';
  card.style.borderRadius = '10px';
  card.style.marginBottom = '0';
  card.style.boxShadow = 'none';

  const heartCount = post.reactions ? post.reactions.filter(r => r.reaction_type === 'like').length : 0;
  
  // Format Comments
  const commentsHtml = post.comments ? post.comments.map(c => `
    <div style="background:rgba(0,0,0,0.15); border:1px solid var(--border); padding:8px; border-radius:6px; margin-top:6px; font-size:0.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <strong style="color:var(--primary);">${c.author_name || 'Member'}</strong>
        <span style="color:var(--text-muted); font-size:0.65rem;">${new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <p style="margin:0; color:var(--text-light);">${c.comment_text}</p>
    </div>
  `).join('') : '';

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <div>
        <h4 style="margin:0; font-size:0.95rem; color:var(--text-main); font-weight:700;">${post.title}</h4>
        <span style="font-size:0.7rem; color:var(--text-muted);">By ${post.author_name || 'Dr. Kwame Mensah'} • ${new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
    <p style="font-size:0.8rem; line-height:1.5; color:var(--text-light); margin-bottom:12px;">${post.content}</p>
    
    <div style="display:flex; gap:12px; border-top:1px solid var(--border); padding-top:10px; margin-bottom:12px;">
      <button class="btn btn-secondary btn-sm" id="like-btn-${post.id}" onclick="handleToggleReaction(${post.id})" style="font-size:0.7rem; padding:4px 8px; font-weight:700;">👍 Like (${heartCount})</button>
      <span style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center;" id="comment-count-${post.id}">${post.comments ? post.comments.length : 0} Comments</span>
    </div>

    <!-- Comments Section -->
    <div id="comments-list-${post.id}" style="display:flex; flex-direction:column; gap:4px; max-height:150px; overflow-y:auto; margin-bottom:10px; padding-left:10px; border-left:2px solid var(--border);">
      ${commentsHtml}
    </div>

    <!-- Comment Form -->
    <div style="display:flex; gap:8px; margin-top:8px;">
      <input type="text" id="comment-input-${post.id}" class="form-control form-control-sm" placeholder="Add a comment..." style="font-size:0.75rem; padding:4px 8px;" onkeydown="if(event.key==='Enter') handleCreateComment(${post.id})">
      <button class="btn btn-primary btn-sm" onclick="handleCreateComment(${post.id})" style="font-size:0.75rem; padding:4px 10px;">Post 💬</button>
    </div>
  `;
  return card;
}

async function handleCreatePost(e) {
  e.preventDefault();
  if (!activeCommunityId) return;

  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  try {
    const res = await fetch(`${API_BASE}/api/communities/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        community_id: activeCommunityId,
        author_id: appState.user.id,
        author_name: appState.user.name,
        title,
        content
      })
    });
    if (!res.ok) throw new Error('Failed to post');

    document.getElementById('engagement-std-post-form').reset();
    
    // Auto re-fetch posts
    loadCommunityPosts(activeCommunityId);
  } catch (err) {
    alert(err.message);
  }
}

window.handleCreateComment = async function(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;
  const comment_text = input.value.trim();
  if (!comment_text) return;

  try {
    const res = await fetch(`${API_BASE}/api/communities/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: postId,
        author_id: appState.user.id,
        author_name: appState.user.name,
        comment_text
      })
    });
    if (!res.ok) throw new Error('Comment failed');

    input.value = '';
    
    // Local list reload for instant feed sync
    loadCommunityPosts(activeCommunityId);
  } catch (err) {
    alert(err.message);
  }
};

window.handleToggleReaction = async function(postId) {
  try {
    const res = await fetch(`${API_BASE}/api/communities/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: postId,
        user_id: appState.user.id,
        reaction_type: 'like'
      })
    });
    if (!res.ok) throw new Error('Reaction failed');

    loadCommunityPosts(activeCommunityId);
  } catch (err) {
    console.error(err);
  }
};

// 1.5 Insights Feed
async function loadInsightsFeed() {
  const feedDiv = document.getElementById('engagement-std-insights-feed');
  if (!feedDiv) return;

  try {
    const res = await fetch(`${API_BASE}/api/insights`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch insights');

    if (data.length === 0) {
      feedDiv.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No academic insights recommended yet.</div>';
      return;
    }

    feedDiv.innerHTML = data.map(ins => `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); padding:12px; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:0.85rem; color:#fff;">${ins.title}</strong>
          <span style="font-size:0.65rem; color:#60a5fa; padding:2px 6px; border-radius:10px; background:rgba(96,165,250,0.1); font-weight:700; text-transform:uppercase;">${ins.type}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-light); line-height:1.4; margin-bottom:6px;">${ins.content}</p>
        ${ins.url ? `<p style="font-size:0.75rem; margin:0;"><a href="${ins.url}" target="_blank" style="color:var(--primary); font-weight:700;">🔗 Open Reference Link</a></p>` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 1.6 Project Endorsements
async function loadProjectEndorsements() {
  const listDiv = document.getElementById('engagement-std-endorsements-list');
  if (!listDiv) return;

  try {
    const res = await fetch(`${API_BASE}/api/endorsements`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch endorsements');

    if (data.length === 0) {
      listDiv.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No startup project endorsements recorded.</div>';
      return;
    }

    listDiv.innerHTML = data.map(end => {
      const projName = end.project_id === 2 ? 'SusuSmart Pitch' : (end.project_id === 1 ? 'AgriFlow Cocoa' : 'Student Pitch #' + end.project_id);
      return `
        <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:0.85rem; color:#fbbf24;">🏆 ${projName}</strong>
            <span style="font-size:0.65rem; color:var(--text-muted);">Endorsed by Dr. Kwame Mensah</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-light); line-height:1.4; font-style:italic;">"${end.endorsement_text}"</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

// 1.7 Notifications List
async function loadNotifications() {
  const listDiv = document.getElementById('engagement-std-notifications-list');
  if (!listDiv) return;

  try {
    const res = await fetch(`${API_BASE}/api/notifications?user_id=${appState.user.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error('Error loading');

    if (data.length === 0) {
      listDiv.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem;">No notification alerts.</div>';
      return;
    }

    listDiv.innerHTML = '';
    data.forEach(notif => {
      const el = createNotificationElement(notif);
      listDiv.appendChild(el);
    });
  } catch (err) {
    console.error(err);
  }
}

function createNotificationElement(notif) {
  const div = document.createElement('div');
  div.style.background = notif.unread ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)';
  div.style.border = notif.unread ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)';
  div.style.padding = '8px 10px';
  div.style.borderRadius = '6px';
  div.style.fontSize = '0.75rem';
  div.style.cursor = 'pointer';
  div.style.transition = 'background 0.2s';
  div.setAttribute('id', `notif-item-${notif.id}`);

  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
      <span style="font-weight:${notif.unread ? '700' : '400'}; color:#fff;">${notif.text}</span>
    </div>
    <span style="font-size:0.65rem; color:var(--text-muted);">${new Date(notif.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
  `;

  div.onclick = async () => {
    if (notif.unread) {
      try {
        await fetch(`${API_BASE}/api/notifications/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id })
        });
        div.style.background = 'rgba(255,255,255,0.02)';
        div.style.border = '1px solid var(--border)';
        notif.unread = false;
      } catch (err) {
        console.error(err);
      }
    }
  };

  return div;
}

// 1.8 Engagement Analytics Score
async function loadEngagementAnalytics() {
  const scoreEl = document.getElementById('engagement-std-score');
  const progEl = document.getElementById('engagement-std-score-progress');
  
  if (!scoreEl || !progEl) return;

  try {
    const res = await fetch(`${API_BASE}/api/engagement/analytics?student_id=${appState.user.id}`);
    const stats = await res.json();
    if (!res.ok) throw new Error('Analytics failed');

    // Update counts
    document.getElementById('engagement-stat-posts').textContent = stats.posts_count;
    document.getElementById('engagement-stat-comments').textContent = stats.comments_count;
    document.getElementById('engagement-stat-likes').textContent = stats.likes_count;
    document.getElementById('engagement-stat-appointments').textContent = stats.appointments_count;

    // Engagement score math: posts*15 + comments*5 + likes*2 + appointments*20
    const rawScore = (stats.posts_count * 15) + (stats.comments_count * 5) + (stats.likes_count * 2) + (stats.appointments_count * 20);
    const scoreIndex = Math.min(100, Math.max(10, rawScore + 40)); // minimum baseline offset of 40% for setup

    scoreEl.textContent = `${scoreIndex}%`;
    progEl.style.width = `${scoreIndex}%`;
  } catch (err) {
    console.error(err);
  }
}

/* ============================================================
   2. LECTURER HUB ACTIONS
   ============================================================ */

// 2.1 Appointments manager
async function loadLecturerAppointments() {
  const list = document.getElementById('engagement-lec-appointments-list');
  if (!list) return;

  try {
    const res = await fetch(`${API_BASE}/api/appointments?user_id=${appState.user.id}&role=lecturer`);
    const data = await res.json();
    if (!res.ok) throw new Error('Booking failed');

    if (data.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; grid-column:span 3; padding:20px 0;">No appointment requests received.</div>';
      return;
    }

    list.innerHTML = data.map(appt => {
      const isPending = appt.status === 'Pending';
      let statusColor = '#fbbf24';
      if (appt.status === 'Approved') statusColor = '#34d399';
      else if (appt.status === 'Declined') statusColor = '#f87171';

      return `
        <div class="widget glass" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between; border:1px solid var(--border);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Student ID: ${appt.student_id}</span>
              <span style="font-size:0.7rem; font-weight:700; color:${statusColor};">${appt.status.toUpperCase()}</span>
            </div>
            <h4 style="margin:0 0 4px; font-size:0.95rem; color:#fff;">${appt.topic}</h4>
            <p style="font-size:0.8rem; color:var(--text-light); margin-bottom:8px;">📅 ${new Date(appt.scheduled_time).toLocaleString()}</p>
            ${appt.notes ? `<p style="font-size:0.75rem; color:var(--text-muted); background:rgba(0,0,0,0.15); padding:6px; border-radius:4px;"><strong>Notes:</strong> "${appt.notes}"</p>` : ''}
          </div>
          
          <div style="margin-top:15px; border-top:1px solid var(--border); padding-top:12px;">
            ${isPending ? `
              <div class="form-group" style="margin-bottom:8px;">
                <input type="text" id="appt-feedback-${appt.id}" class="form-control form-control-sm" placeholder="Optional notes for student...">
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-primary btn-sm" onclick="respondAppointment(${appt.id}, 'Approved')" style="flex:1; padding:4px 0; font-size:0.75rem;">Approve ✅</button>
                <button class="btn btn-secondary btn-sm" onclick="respondAppointment(${appt.id}, 'Declined')" style="flex:1; padding:4px 0; font-size:0.75rem;">Decline ❌</button>
              </div>
            ` : `
              <p style="font-size:0.75rem; color:var(--primary); margin:0;"><strong>Delivered feedback:</strong> "${appt.feedback || 'None'}"</p>
            `}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

window.respondAppointment = async function(id, status) {
  const feedbackInput = document.getElementById(`appt-feedback-${id}`);
  const feedback = feedbackInput ? feedbackInput.value : '';

  try {
    const res = await fetch(`${API_BASE}/api/appointments/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment_id: id, status, feedback })
    });
    if (!res.ok) throw new Error('Response dispatch failed');

    if (typeof showToastNotification === 'function') {
      showToastNotification(`Appointment request ${status.toLowerCase()}!`);
    }
    loadLecturerAppointments();
  } catch (err) {
    alert(err.message);
  }
};

// 2.2 My Subject Communities
async function loadLecturerCommunities() {
  const comList = document.getElementById('engagement-lec-communities-list');
  if (!comList) return;

  try {
    const res = await fetch(`${API_BASE}/api/communities?student_id=null`);
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to load');

    // Filter to lecturer-owned boards
    const mine = data.filter(c => c.lecturer_id === appState.user.id);

    if (mine.length === 0) {
      comList.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">You have not created any subject boards.</div>';
      return;
    }

    comList.innerHTML = mine.map(c => `
      <button class="btn ${activeCommunityId == c.id ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="selectLecturerCommunity(${c.id}, '${c.name}', '${c.description}')" style="width:100%; text-align:left; font-size:0.8rem;">
        # ${c.name}
      </button>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.selectLecturerCommunity = async function(id, name, desc) {
  activeCommunityId = id;
  
  loadLecturerCommunities();

  const header = document.getElementById('engagement-lec-active-community-header');
  header.innerHTML = `
    <h3># ${name}</h3>
    <p style="color:var(--text-muted); font-size:0.85rem;">${desc}</p>
  `;

  document.getElementById('engagement-lec-community-panel').style.display = 'block';
  loadLecturerCommunityPosts(id);
};

async function loadLecturerCommunityPosts(communityId) {
  const list = document.getElementById('engagement-lec-posts-list');
  if (!list) return;

  list.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">Loading board posts...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/communities/posts?community_id=${communityId}`);
    const posts = await res.json();
    if (!res.ok) throw new Error(posts.error || 'Failed');

    if (posts.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:20px 0; text-align:center;">No threads published on this board yet.</div>';
      return;
    }

    list.innerHTML = '';
    posts.forEach(post => {
      const card = createPostCardElement(post);
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<div style="color:var(--text-danger); font-size:0.85rem;">Error: ${err.message}</div>`;
  }
}

// Modals Trigger Handlers
window.openCreateCommunityModal = () => {
  document.getElementById('engagement-create-community-modal').style.display = 'flex';
};
window.closeCreateCommunityModal = () => {
  document.getElementById('engagement-create-community-modal').style.display = 'none';
};

async function handleCreateCommunity(e) {
  e.preventDefault();
  const name = document.getElementById('new-community-name').value;
  const description = document.getElementById('new-community-desc').value;

  try {
    const res = await fetch(`${API_BASE}/api/communities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecturer_id: appState.user.id, name, description })
    });
    if (!res.ok) throw new Error('Create board failed');

    closeCreateCommunityModal();
    document.getElementById('new-community-name').value = '';
    document.getElementById('new-community-desc').value = '';

    loadLecturerCommunities();
  } catch (err) {
    alert(err.message);
  }
}

window.openCreateCommunityPostModal = (type) => {
  const modal = document.getElementById('engagement-share-insight-modal');
  modal.style.display = 'flex';
  
  document.getElementById('share-insight-type').value = type;
  const titleLabel = document.getElementById('share-insight-title-label');
  const urlGroup = document.getElementById('share-insight-url-group');

  if (type === 'insight') {
    titleLabel.textContent = 'Share Academic Insight 💡';
    urlGroup.style.display = 'none';
  } else {
    titleLabel.textContent = 'Recommend Learning Resource 📚';
    urlGroup.style.display = 'block';
  }
};

window.closeShareInsightModal = () => {
  document.getElementById('engagement-share-insight-modal').style.display = 'none';
};

async function handleCreateInsight(e) {
  e.preventDefault();
  const type = document.getElementById('share-insight-type').value;
  const title = document.getElementById('share-insight-title').value;
  const content = document.getElementById('share-insight-content').value;
  const url = document.getElementById('share-insight-url').value;

  try {
    const res = await fetch(`${API_BASE}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecturer_id: appState.user.id, title, content, type, url })
    });
    if (!res.ok) throw new Error('Failed to share');

    closeShareInsightModal();
    document.getElementById('share-insight-title').value = '';
    document.getElementById('share-insight-content').value = '';
    document.getElementById('share-insight-url').value = '';

    if (typeof showToastNotification === 'function') {
      showToastNotification(`Shared ${type} successfully!`);
    }
  } catch (err) {
    alert(err.message);
  }
}

window.openEndorseProjectModal = () => {
  const modal = document.getElementById('engagement-endorse-project-modal');
  modal.style.display = 'flex';

  // Populates projects dropdown
  const select = document.getElementById('endorse-project-select');
  if (select) {
    const projects = appState.studentStartups || [];
    select.innerHTML = projects.map(p => `<option value="${p.id}">${p.name} - Pitch by ${p.author}</option>`).join('');
  }
};

window.closeEndorseProjectModal = () => {
  document.getElementById('engagement-endorse-project-modal').style.display = 'none';
};

async function handleCreateEndorsement(e) {
  e.preventDefault();
  const project_id = document.getElementById('endorse-project-select').value;
  const endorsement_text = document.getElementById('endorse-text').value;

  try {
    const res = await fetch(`${API_BASE}/api/endorsements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_type: 'startup',
        project_id,
        lecturer_id: appState.user.id,
        endorsement_text
      })
    });
    if (!res.ok) throw new Error('Endorsement failed');

    closeEndorseProjectModal();
    document.getElementById('endorse-text').value = '';

    if (typeof showToastNotification === 'function') {
      showToastNotification('Startup project endorsed successfully!');
    }
  } catch (err) {
    alert(err.message);
  }
}

// 2.3 Lecturer Q&A Inbox & Feedback
async function loadLecturerQaInbox() {
  const inbox = document.getElementById('engagement-lec-qa-list');
  if (!inbox) return;

  try {
    const res = await fetch(`${API_BASE}/api/qa?user_id=${appState.user.id}&role=lecturer`);
    const data = await res.json();
    if (!res.ok) throw new Error('Inbox fetch failed');

    if (data.length === 0) {
      inbox.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No student questions in your inbox.</div>';
      return;
    }

    inbox.innerHTML = data.map(qa => `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); padding:10px; border-radius:8px;">
        <p style="font-size:0.8rem; color:#fff; font-weight:700; margin-bottom:4px;">❓ Question: "${qa.question_text}"</p>
        <span style="font-size:0.65rem; color:var(--text-muted); display:block; margin-bottom:8px;">Asked by student: ${qa.student_id}</span>
        
        ${qa.answer_text ? `
          <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); padding:8px; border-radius:6px;">
            <p style="font-size:0.75rem; color:#34d399; margin:0;"><strong>Your Answer:</strong> "${qa.answer_text}"</p>
          </div>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="openReplyQaModal(${qa.id}, \`${qa.question_text.replace(/'/g, "\\'")}\`)" style="font-size:0.75rem; padding:4px 10px;">Reply Answer ✍️</button>
        `}
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.openReplyQaModal = (id, text) => {
  document.getElementById('engagement-reply-qa-modal').style.display = 'flex';
  document.getElementById('reply-qa-question-id').value = id;
  document.getElementById('reply-qa-question-text').textContent = `❓ Question: "${text}"`;
};

window.closeReplyQaModal = () => {
  document.getElementById('engagement-reply-qa-modal').style.display = 'none';
  document.getElementById('reply-qa-answer-text').value = '';
};

async function handleSendAnswer(e) {
  e.preventDefault();
  const question_id = document.getElementById('reply-qa-question-id').value;
  const answer_text = document.getElementById('reply-qa-answer-text').value;

  try {
    const res = await fetch(`${API_BASE}/api/qa/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id, answer_text })
    });
    if (!res.ok) throw new Error('Failed to reply');

    closeReplyQaModal();
    if (typeof showToastNotification === 'function') {
      showToastNotification('Answer sent to student!');
    }
    loadLecturerQaInbox();
  } catch (err) {
    alert(err.message);
  }
}

// Personalized feedback dispatcher
async function loadFacultyStudentsDropdown() {
  const select = document.getElementById('feedback-student-select');
  if (!select) return;

  try {
    const res = await fetch(`${API_BASE}/api/lecturer/students`);
    const students = await res.json();
    if (!res.ok) throw new Error('Students fetch failed');

    if (students.length === 0) {
      // In mock fallback mode, direct render kofi mensah
      select.innerHTML = '<option value="user_std_1">Kofi Mensah (stu/csc/0001)</option>';
      return;
    }

    select.innerHTML = students.map(s => `<option value="${s.id}">${s.name} (${s.student_id_number || s.id})</option>`).join('');
  } catch (err) {
    // Graceful fallback to default mock students
    select.innerHTML = '<option value="user_std_1">Kofi Mensah (stu/csc/0001)</option>';
  }
}

async function handleSendFeedback(e) {
  e.preventDefault();
  const student_id = document.getElementById('feedback-student-select').value;
  const feedback_text = document.getElementById('feedback-notes-text').value;

  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id,
        lecturer_id: appState.user.id,
        feedback_text
      })
    });
    if (!res.ok) throw new Error('Feedback delivery failed');

    document.getElementById('feedback-notes-text').value = '';
    if (typeof showToastNotification === 'function') {
      showToastNotification('Personal academic feedback delivered successfully!');
    }
  } catch (err) {
    alert(err.message);
  }
}

/* ============================================================
   AUTO INTERCEPTORS FOR APP STATE VISIBILITY & RECONCILIATION
   ============================================================ */

(function() {
  // Patches switchTab to load data on view activation
  const originalSwitchTab = window.switchTab;
  window.switchTab = function(role, tabId) {
    if (originalSwitchTab) originalSwitchTab(role, tabId);
    
    if (tabId === 'student-engagement' || tabId === 'lecturer-engagement') {
      loadEngagementData();
    }
  };

  // Re-patches switchTabExtended if defined
  const checkPatchExtended = () => {
    if (typeof window.switchTabExtended === 'function') {
      const originalSwitchTabExtended = window.switchTabExtended;
      window.switchTabExtended = function(role, tabId) {
        if (originalSwitchTabExtended) originalSwitchTabExtended(role, tabId);
        
        if (tabId === 'student-engagement' || tabId === 'lecturer-engagement') {
          loadEngagementData();
        }
      };
    } else {
      setTimeout(checkPatchExtended, 100);
    }
  };
  checkPatchExtended();

  // Instantiates WebSocket and loads data when user state session initializes
  const checkSessionUser = () => {
    if (typeof appState !== 'undefined' && appState.user) {
      initEngagementWebSocket();
      loadEngagementData();
    } else {
      setTimeout(checkSessionUser, 300);
    }
  };
  checkSessionUser();
})();
