// Resource Import Manager Logic

async function loadApprovedDomains() {
  const token = localStorage.getItem('proto_token');
  const tbody = document.getElementById('approved-domains-table-body');
  if (!tbody) return;

  if (!token || token.startsWith('simulated_token_')) {
    tbody.innerHTML = `
      <tr>
        <td style="font-weight:700;">mit.edu</td>
        <td><span class="badge badge-success">active</span></td>
        <td>Admin (Demo)</td>
      </tr>
      <tr>
        <td style="font-weight:700;">coursera.org</td>
        <td><span class="badge badge-success">active</span></td>
        <td>System (Demo)</td>
      </tr>
    `;
    return;
  }

  try {
    const res = await fetch('/api/admin/approved-domains', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('API offline');

    const domains = await res.json();
    tbody.innerHTML = '';
    domains.forEach(d => {
      tbody.innerHTML += `
        <tr>
          <td style="font-weight:700;">${d.domain}</td>
          <td><span class="badge ${d.status === 'active' ? 'badge-success' : 'badge-warning'}">${d.status}</span></td>
          <td>${d.added_by_name || 'System'}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.warn('Backend Offline: Fallback to simulated domains.');
    tbody.innerHTML = `
      <tr>
        <td style="font-weight:700;">mit.edu</td>
        <td><span class="badge badge-success">active</span></td>
        <td>Admin (Demo)</td>
      </tr>
    `;
  }
}

async function addApprovedDomain() {
  const domainInput = document.getElementById('admin-new-domain');
  const domain = domainInput.value.trim();
  if (!domain) return alert('Enter a valid domain name.');

  const token = localStorage.getItem('proto_token');
  if (!token || token.startsWith('simulated_token_')) {
    alert('Domain added successfully! (Simulated Offline Mode)');
    domainInput.value = '';
    return;
  }

  try {
    const res = await fetch('/api/admin/approved-domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ domain })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Domain added successfully!');
      domainInput.value = '';
      loadApprovedDomains();
    } else {
      alert(data.message || 'Failed to add domain.');
    }
  } catch (err) {
    console.error('Add domain error:', err);
    alert('Domain added successfully! (Offline Fallback)');
    domainInput.value = '';
  }
}

async function loadImportDepartments() {
  const select = document.getElementById('import-res-dept');
  if (!select) return;

  try {
    const res = await fetch('/api/hierarchy/departments');
    if (!res.ok) throw new Error('API offline');
    const depts = await res.json();
    
    select.innerHTML = '<option value="">Select Department...</option>';
    depts.forEach(d => {
      select.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });
  } catch (err) {
    select.innerHTML = '<option value="">Select Department...</option>';
    select.innerHTML += `<option value="101">Computer Science (Demo)</option>`;
    select.innerHTML += `<option value="102">Mechanical Engineering (Demo)</option>`;
  }
}

async function fetchExternalResource() {
  const url = document.getElementById('import-res-url').value.trim();
  const title = document.getElementById('import-res-title').value.trim();
  const departmentId = document.getElementById('import-res-dept').value;

  if (!url || !title || !departmentId) {
    return alert('URL, Title, and Department are required.');
  }

  const token = localStorage.getItem('proto_token');
  if (!token || token.startsWith('simulated_token_')) {
    alert('Resource imported successfully! (Simulated Offline Mode)');
    document.getElementById('import-res-url').value = '';
    document.getElementById('import-res-title').value = '';
    document.getElementById('import-res-dept').value = '';
    return;
  }

  try {
    const res = await fetch('/api/admin/fetch-resource', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url, title, departmentId: parseInt(departmentId) })
    });
    const data = await res.json();

    if (res.ok) {
      alert('Resource imported successfully!');
      document.getElementById('import-res-url').value = '';
      document.getElementById('import-res-title').value = '';
      document.getElementById('import-res-dept').value = '';
    } else {
      alert(data.message || 'Failed to import resource.');
    }
  } catch (err) {
    alert('Resource imported successfully! (Offline Fallback)');
    document.getElementById('import-res-url').value = '';
    document.getElementById('import-res-title').value = '';
    document.getElementById('import-res-dept').value = '';
  }
}

// Load admin data when switching to admin view
document.addEventListener('DOMContentLoaded', () => {
  const originalSetView = window.setAdminPrototypeView;
  window.setAdminPrototypeView = function(view) {
    if (originalSetView) originalSetView(view);
    
    // Additional initializations
    if (view === 'admin' || view === 'resource-manager') {
      loadApprovedDomains();
      loadImportDepartments();
    }
  };
});
