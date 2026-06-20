// Hierarchy Dropdown Logic for SmartLearn AI Portal

const PORTAL_HIERARCHY = {
  departments: [
    'Computing & Information Technology',
    'Business & Economics',
    'Engineering & Architecture',
    'Healthcare & Medical Sciences',
    'Legal & Social Sciences'
  ],
  programs: {
    'Computing & Information Technology': [
      'BSc Computer Science',
      'BSc Software Engineering',
      'BSc Cybersecurity',
      'BSc Data Science'
    ],
    'Business & Economics': [
      'BSc Business Administration',
      'BA Economics & Public Policy'
    ],
    'Engineering & Architecture': [
      'BSc Electrical Engineering',
      'BSc Mechanical Engineering',
      'BSc Architecture & Design'
    ],
    'Healthcare & Medical Sciences': [
      'BSc Nursing & Allied Health',
      'Medicine & Surgery (MBChB)',
      'Doctor of Pharmacy (PharmD)'
    ],
    'Legal & Social Sciences': [
      'Bachelor of Laws (LLB)'
    ]
  }
};

function loadPortalInstitutions() {
  const instSelect = document.getElementById('signup-institution');
  if (!instSelect) return;
  instSelect.innerHTML = '<option value="">Select Institution...</option>';
  
  // Use appState.universities loaded from data.js
  const unis = (typeof appState !== 'undefined' && appState.universities) ? appState.universities : [];
  if (unis.length > 0) {
    unis.forEach(u => {
      instSelect.innerHTML += `<option value="${u.name}">${u.name}</option>`;
    });
  } else {
    // Fallback if data is not loaded yet
    const fallbackUnis = [
      "University of Ghana (UG)",
      "Kwame Nkrumah University of Science and Technology (KNUST)",
      "University of Cape Coast (UCC)",
      "Ashesi University",
      "University of Professional Studies, Accra (UPSA)"
    ];
    fallbackUnis.forEach(name => {
      instSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
  }
}

function loadPortalDepartments() {
  const deptSelect = document.getElementById('signup-dept');
  if (!deptSelect) return;
  deptSelect.innerHTML = '<option value="">Select Department...</option>';
  
  PORTAL_HIERARCHY.departments.forEach(dept => {
    deptSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
  });
}

function loadPortalPrograms(deptName) {
  const progSelect = document.getElementById('signup-program');
  if (!progSelect) return;
  
  progSelect.innerHTML = '<option value="">Select Program...</option>';
  
  if (!deptName) {
    progSelect.disabled = true;
    return;
  }
  
  const progs = PORTAL_HIERARCHY.programs[deptName] || [];
  progs.forEach(prog => {
    progSelect.innerHTML += `<option value="${prog}">${prog}</option>`;
  });
  progSelect.disabled = false;
}

// Automatically populate fields when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  loadPortalInstitutions();
  loadPortalDepartments();
  
  // Also register an onchange fallback listener in case html bindings change
  const deptSelect = document.getElementById('signup-dept');
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      loadPortalPrograms(e.target.value);
    });
  }
});
