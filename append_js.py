with open('assets/js/research_hub.js', 'a', encoding='utf-8') as f:
    f.write("""

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

// Call these immediately if we enter the portal, or on load
document.addEventListener('DOMContentLoaded', () => {
  // Try fetching on load if authenticated or mock mode
  setTimeout(() => {
    fetchResearcherDashboard();
    fetchResearcherTasks();
  }, 1000);
});

// Update the switchTab hook to also fetch dashboard stats
setTimeout(() => {
  if (typeof switchTab !== 'undefined') {
    const prevSwitchTab = window.switchTab;
    window.switchTab = function(role, tabId) {
      if (prevSwitchTab) prevSwitchTab(role, tabId);
      if (tabId === 'researcher-dashboard') {
        fetchResearcherDashboard();
      } else if (tabId === 'researcher-collaboration') {
        fetchResearcherTasks();
      }
    }
  }
}, 600);
""")
