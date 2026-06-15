// Hierarchy Dropdown Logic

const MOCK_HIERARCHY = {
  faculties: [
    { id: 1, name: 'Faculty of Science & Engineering' },
    { id: 2, name: 'Faculty of Business & Economics' },
    { id: 3, name: 'Faculty of Arts & Humanities' }
  ],
  departments: {
    1: [
      { id: 101, name: 'Computer Science' },
      { id: 102, name: 'Mechanical Engineering' }
    ],
    2: [
      { id: 201, name: 'Accounting & Finance' },
      { id: 202, name: 'Business Administration' }
    ],
    3: [
      { id: 301, name: 'History & Political Science' }
    ]
  },
  programs: {
    101: [{ id: 1001, name: 'BSc Computer Science' }, { id: 1002, name: 'MSc Artificial Intelligence' }],
    102: [{ id: 1003, name: 'BSc Mechanical Engineering' }],
    201: [{ id: 2001, name: 'BSc Accounting' }],
    202: [{ id: 2002, name: 'BBA Business Administration' }],
    301: [{ id: 3001, name: 'BA Political Science' }]
  },
  courses: {
    1001: [{ id: 10001, title: 'CS101: Introduction to Programming' }, { id: 10002, title: 'CS201: Data Structures' }],
    1002: [{ id: 10003, title: 'AI501: Machine Learning' }],
    1003: [{ id: 10004, title: 'ME101: Thermodynamics' }],
    2001: [{ id: 20001, title: 'ACC101: Financial Accounting' }],
    2002: [{ id: 20002, title: 'BUS101: Principles of Management' }],
    3001: [{ id: 30001, title: 'POL101: Intro to Politics' }]
  }
};

async function loadFaculties() {
  const facultySelect = document.getElementById('signup-faculty');
  if (!facultySelect) return;
  facultySelect.innerHTML = '<option value="">Select Faculty...</option>';

  try {
    const res = await fetch('/api/hierarchy/faculties');
    if (!res.ok) throw new Error('API Response not OK');
    const faculties = await res.json();
    
    faculties.forEach(f => {
      facultySelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    });
  } catch (err) {
    console.warn('Backend Offline: Using simulated faculties for static preview.');
    MOCK_HIERARCHY.faculties.forEach(f => {
      facultySelect.innerHTML += `<option value="${f.id}">${f.name} (Demo)</option>`;
    });
  }
}

async function loadDepartments(facultyId) {
  const deptSelect = document.getElementById('signup-dept');
  const programSelect = document.getElementById('signup-program');
  const courseSelect = document.getElementById('signup-course');

  deptSelect.innerHTML = '<option value="">Select Dept...</option>';
  programSelect.innerHTML = '<option value="">Select Program...</option>';
  courseSelect.innerHTML = '<option value="">Select Course...</option>';
  
  if (!facultyId) {
    deptSelect.disabled = true;
    programSelect.disabled = true;
    courseSelect.disabled = true;
    return;
  }
  
  try {
    const res = await fetch(`/api/hierarchy/departments?facultyId=${facultyId}`);
    if (!res.ok) throw new Error('API Response not OK');
    const departments = await res.json();
    
    departments.forEach(d => {
      deptSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });
  } catch (err) {
    const depts = MOCK_HIERARCHY.departments[facultyId] || [];
    depts.forEach(d => {
      deptSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });
  }
  deptSelect.disabled = false;
}

async function loadPrograms(departmentId) {
  const programSelect = document.getElementById('signup-program');
  const courseSelect = document.getElementById('signup-course');

  programSelect.innerHTML = '<option value="">Select Program...</option>';
  courseSelect.innerHTML = '<option value="">Select Course...</option>';
  
  if (!departmentId) {
    programSelect.disabled = true;
    courseSelect.disabled = true;
    return;
  }
  
  try {
    const res = await fetch(`/api/hierarchy/programs?departmentId=${departmentId}`);
    if (!res.ok) throw new Error('API Response not OK');
    const programs = await res.json();
    
    programs.forEach(p => {
      programSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
  } catch (err) {
    const progs = MOCK_HIERARCHY.programs[departmentId] || [];
    progs.forEach(p => {
      programSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
  }
  programSelect.disabled = false;
}

async function loadCourses(programId) {
  const courseSelect = document.getElementById('signup-course');

  courseSelect.innerHTML = '<option value="">Select Course...</option>';
  
  if (!programId) {
    courseSelect.disabled = true;
    return;
  }
  
  try {
    const res = await fetch(`/api/hierarchy/courses?programId=${programId}`);
    if (!res.ok) throw new Error('API Response not OK');
    const courses = await res.json();
    
    courses.forEach(c => {
      courseSelect.innerHTML += `<option value="${c.id}">${c.title}</option>`;
    });
  } catch (err) {
    const courses = MOCK_HIERARCHY.courses[programId] || [];
    courses.forEach(c => {
      courseSelect.innerHTML += `<option value="${c.id}">${c.title}</option>`;
    });
  }
  courseSelect.disabled = false;
}

// Load faculties when the modal opens or page loads
document.addEventListener('DOMContentLoaded', () => {
  loadFaculties();
});
