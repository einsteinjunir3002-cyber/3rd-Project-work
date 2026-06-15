const auditData = [
  // Prospective Student
  { role: 'Prospective Student', feature: 'Create Account / Signup', status: 'Implemented', priority: 'Critical', rec: 'DBAC cascading dropdowns are fully functional.' },
  { role: 'Prospective Student', feature: 'View WASSCE Entry Requirements', status: 'Missing', priority: 'High', rec: 'Create static/dynamic admissions portal view.' },
  { role: 'Prospective Student', feature: 'View Cut-off Points', status: 'Missing', priority: 'High', rec: 'Integrate cut-off point tables into the public dashboard.' },
  { role: 'Prospective Student', feature: 'Track Application Status', status: 'Missing', priority: 'Medium', rec: 'Stub an application tracker using Demo Data Policy.' },
  { role: 'Prospective Student', feature: 'View Scholarships', status: 'Missing', priority: 'Low', rec: 'Add static UI for scholarships.' },
  { role: 'Prospective Student', feature: 'Local Payment Methods (Momo)', status: 'Missing', priority: 'High', rec: 'Integrate generic Mobile Money stub for admission fees.' },

  // Lecturer
  { role: 'Lecturer', feature: 'Manage Assigned Courses', status: 'Implemented', priority: 'Critical', rec: 'Tied to DBAC departmentId.' },
  { role: 'Lecturer', feature: 'Upload Teaching Materials', status: 'Implemented', priority: 'Critical', rec: 'Notes are uploaded to Postgres/Cloudinary.' },
  { role: 'Lecturer', feature: 'Grade Submissions / Assessments', status: 'Partially Implemented', priority: 'High', rec: 'Assignment UI exists, grading mechanism needs backend linking.' },
  { role: 'Lecturer', feature: 'Publish Announcements', status: 'Implemented', priority: 'Medium', rec: 'Communication Center allows global/departmental alerts.' },

  // Researcher
  { role: 'Researcher', feature: 'Create Research Profiles', status: 'Partially Implemented', priority: 'High', rec: 'Roles exist but profile UI is limited.' },
  { role: 'Researcher', feature: 'Publish Research Outputs', status: 'Implemented', priority: 'Critical', rec: 'Uploads linked via Resource Manager.' },
  { role: 'Researcher', feature: 'Apply for Grants', status: 'Missing', priority: 'Medium', rec: 'Create a generic grant application form (Demo Policy).' },

  // Entrepreneur
  { role: 'Entrepreneur', feature: 'Create Startup Profiles', status: 'Implemented', priority: 'High', rec: 'Handled via admin getStartups logic.' },
  { role: 'Entrepreneur', feature: 'Access Incubation Programs', status: 'Missing', priority: 'Low', rec: 'Stub incubation program timeline in dashboard.' },
  { role: 'Entrepreneur', feature: 'Pitch Events & Funding', status: 'Missing', priority: 'Low', rec: 'Add to dashboard events calendar.' },

  // Alumni
  { role: 'Alumni', feature: 'Alumni Directory', status: 'Partially Implemented', priority: 'Medium', rec: 'Currently viewable by admin, need public/alumni-only directory.' },
  { role: 'Alumni', feature: 'Request Transcripts', status: 'Missing', priority: 'High', rec: 'Add transcript request form.' },

  // Career Advisor
  { role: 'Career Advisor', feature: 'Manage Career Resources', status: 'Implemented', priority: 'High', rec: 'Advisors can upload via Resource Manager.' },
  { role: 'Career Advisor', feature: 'Schedule Appointments', status: 'Missing', priority: 'Low', rec: 'Basic appointment booking UI needed.' },

  // Industry Partner
  { role: 'Industry Partner', feature: 'Post Internships & Jobs', status: 'Partially Implemented', priority: 'High', rec: 'Admin handles this currently; needs partner UI.' },
  { role: 'Industry Partner', feature: 'Sponsor Projects', status: 'Missing', priority: 'Low', rec: 'Add sponsorship submission portal.' }
];

function showAuditDashboard(e) {
  if (e) e.preventDefault();
  document.getElementById('main-landing-view').style.display = 'none';
  document.getElementById('audit-dashboard-view').style.display = 'block';
  
  // Update stats
  const total = auditData.length;
  const implemented = auditData.filter(d => d.status === 'Implemented').length;
  const missing = auditData.filter(d => d.status === 'Missing').length;

  document.getElementById('audit-stat-total').innerText = total;
  document.getElementById('audit-stat-implemented').innerText = implemented;
  document.getElementById('audit-stat-missing').innerText = missing;

  renderAuditTable();
}

function hideAuditDashboard() {
  document.getElementById('audit-dashboard-view').style.display = 'none';
  document.getElementById('main-landing-view').style.display = 'block';
}

function renderAuditTable() {
  const roleFilter = document.getElementById('audit-filter-role').value;
  const statusFilter = document.getElementById('audit-filter-status').value;
  
  let filteredData = auditData;
  if (roleFilter !== 'all') {
    filteredData = filteredData.filter(d => d.role === roleFilter);
  }
  if (statusFilter !== 'all') {
    filteredData = filteredData.filter(d => d.status === statusFilter);
  }

  const tbody = document.getElementById('audit-table-body');
  tbody.innerHTML = '';

  filteredData.forEach(item => {
    let statusBadge = '';
    if (item.status === 'Implemented') statusBadge = '<span class="badge badge-success">Implemented</span>';
    else if (item.status === 'Partially Implemented') statusBadge = '<span class="badge badge-warning">Partial</span>';
    else statusBadge = '<span class="badge badge-danger">Missing</span>';

    tbody.innerHTML += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); font-weight: 700;">${item.role}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border);">${item.feature}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border);">${statusBadge}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border);">${item.priority}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem;">${item.rec}</td>
      </tr>
    `;
  });
}
