import { PrismaClient, Role, ApplicationStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding comprehensive database...');

  const passwordHash = await argon2.hash('password123');

  // --- 1. FACULTIES ---
  const facComputing = await prisma.faculty.upsert({
    where: { code: 'FOC' }, update: {},
    create: { name: 'Faculty of Computing', code: 'FOC' },
  });
  const facBusiness = await prisma.faculty.upsert({
    where: { code: 'FOB' }, update: {},
    create: { name: 'Faculty of Business', code: 'FOB' },
  });
  const facHumanities = await prisma.faculty.upsert({
    where: { code: 'FOH' }, update: {},
    create: { name: 'Faculty of Humanities', code: 'FOH' },
  });
  const facEngineering = await prisma.faculty.upsert({
    where: { code: 'FOE' }, update: {},
    create: { name: 'Faculty of Engineering', code: 'FOE' },
  });

  // --- 2. DEPARTMENTS ---
  const deptCS = await prisma.department.upsert({
    where: { code: 'CS' }, update: {},
    create: { name: 'Computer Science', code: 'CS', facultyId: facComputing.id },
  });
  const deptBUS = await prisma.department.upsert({
    where: { code: 'BUS' }, update: {},
    create: { name: 'Business Administration', code: 'BUS', facultyId: facBusiness.id },
  });
  const deptENG = await prisma.department.upsert({
    where: { code: 'ENG' }, update: {},
    create: { name: 'English Department', code: 'ENG', facultyId: facHumanities.id },
  });
  const deptMECH = await prisma.department.upsert({
    where: { code: 'MECH' }, update: {},
    create: { name: 'Mechanical Engineering', code: 'MECH', facultyId: facEngineering.id },
  });

  // --- 3. PROGRAMS ---
  const progCS = await prisma.program.upsert({
    where: { code: 'BSC_CS' }, update: {},
    create: { name: 'BSc Computer Science', code: 'BSC_CS', departmentId: deptCS.id },
  });
  const progBUS = await prisma.program.upsert({
    where: { code: 'BSC_BUS' }, update: {},
    create: { name: 'BSc Business Administration', code: 'BSC_BUS', departmentId: deptBUS.id },
  });
  const progENG = await prisma.program.upsert({
    where: { code: 'BA_ENG' }, update: {},
    create: { name: 'BA English Literature', code: 'BA_ENG', departmentId: deptENG.id },
  });
  const progMECH = await prisma.program.upsert({
    where: { code: 'BENG_MECH' }, update: {},
    create: { name: 'BEng Mechanical Engineering', code: 'BENG_MECH', departmentId: deptMECH.id },
  });

  // --- 4. LECTURERS (INSTRUCTORS) ---
  const lecCS = await prisma.user.upsert({
    where: { email: 'lecturer_cs@smartlearn.edu' }, update: { passwordHash, roles: [Role.LECTURER, Role.RESEARCHER] },
    create: {
      email: 'lecturer_cs@smartlearn.edu', passwordHash,
      firstName: 'Alan', lastName: 'Turing',
      roles: [Role.LECTURER, Role.RESEARCHER], departmentId: deptCS.id,
    },
  });
  const lecBUS = await prisma.user.upsert({
    where: { email: 'lecturer_bus@smartlearn.edu' }, update: { passwordHash },
    create: {
      email: 'lecturer_bus@smartlearn.edu', passwordHash,
      firstName: 'Peter', lastName: 'Drucker',
      roles: [Role.LECTURER], departmentId: deptBUS.id,
    },
  });
  const lecENG = await prisma.user.upsert({
    where: { email: 'lecturer_eng@smartlearn.edu' }, update: { passwordHash },
    create: {
      email: 'lecturer_eng@smartlearn.edu', passwordHash,
      firstName: 'Virginia', lastName: 'Woolf',
      roles: [Role.LECTURER], departmentId: deptENG.id,
    },
  });
  const lecMECH = await prisma.user.upsert({
    where: { email: 'lecturer_mech@smartlearn.edu' }, update: { passwordHash },
    create: {
      email: 'lecturer_mech@smartlearn.edu', passwordHash,
      firstName: 'Nikola', lastName: 'Tesla',
      roles: [Role.LECTURER], departmentId: deptMECH.id,
    },
  });

  // --- ADMIN USER ---
  const sysAdmin = await prisma.user.upsert({
    where: { email: 'admin@smartlearn.edu' }, update: { passwordHash, roles: [Role.SYSTEM_ADMINISTRATOR] },
    create: {
      email: 'admin@smartlearn.edu', passwordHash,
      firstName: 'Ada', lastName: 'Lovelace',
      roles: [Role.SYSTEM_ADMINISTRATOR], departmentId: deptCS.id,
    },
  });


  // --- 5. COURSES AND MATERIALS (5 PER PROGRAM) ---

  const coursesData = [
    // --- Computer Science ---
    {
      code: 'CS101', title: 'Introduction to Programming', credits: 3,
      description: 'Fundamentals of coding, variables, loops, logic, and core coding principles.',
      programId: progCS.id, instructorId: lecCS.id, materialFile: 'cs_programming.pdf', materialTitle: 'Introduction to Programming Lecture Notes'
    },
    {
      code: 'AI400', title: 'Advanced Artificial Intelligence', credits: 4,
      description: 'Deep learning, neural networks, machine intelligence, and LLM applications.',
      programId: progCS.id, instructorId: lecCS.id, materialFile: 'cs_programming.pdf', materialTitle: 'Advanced AI & Neural Networks Pack'
    },
    {
      code: 'CS201', title: 'Data Structures and Algorithms', credits: 4,
      description: 'Sorting, searching, trees, graphs, and Big-O computational analysis.',
      programId: progCS.id, instructorId: lecCS.id, materialFile: 'cs_programming.pdf', materialTitle: 'Algorithms & Data Structures Reference'
    },
    {
      code: 'CS302', title: 'Database Management Systems', credits: 3,
      description: 'Relational database designs, normalization, advanced SQL queries, and transaction controls.',
      programId: progCS.id, instructorId: lecCS.id, materialFile: 'cs_programming.pdf', materialTitle: 'DBMS & Relational Algebra Handout'
    },
    {
      code: 'CS403', title: 'Computer Networks', credits: 3,
      description: 'IP networking, TCP/UDP protocols, routing, network security, and architecture.',
      programId: progCS.id, instructorId: lecCS.id, materialFile: 'cs_programming.pdf', materialTitle: 'Computer Networks Study Guide'
    },

    // --- Business Administration ---
    {
      code: 'BUS101', title: 'Introduction to Business', credits: 3,
      description: 'Overview of business structures, legal ownerships, entrepreneurship, and economics.',
      programId: progBUS.id, instructorId: lecBUS.id, materialFile: 'bus_marketing.pdf', materialTitle: 'Introduction to Business Foundations'
    },
    {
      code: 'BUS201', title: 'Principles of Marketing', credits: 3,
      description: 'Exploration of the 4 Ps of Marketing, consumer behavior, and marketing mix strategies.',
      programId: progBUS.id, instructorId: lecBUS.id, materialFile: 'bus_marketing.pdf', materialTitle: 'Marketing Principles & Mix Analysis'
    },
    {
      code: 'BUS302', title: 'Financial Accounting', credits: 4,
      description: 'Analyzing financial statements, balance sheets, ledger structures, and transaction audits.',
      programId: progBUS.id, instructorId: lecBUS.id, materialFile: 'bus_marketing.pdf', materialTitle: 'Financial Accounting Handbook'
    },
    {
      code: 'BUS401', title: 'Organizational Behavior', credits: 3,
      description: 'Understanding workplace dynamics, team interactions, motivation, and leadership structures.',
      programId: progBUS.id, instructorId: lecBUS.id, materialFile: 'bus_marketing.pdf', materialTitle: 'Workplace Interactions & HR Theories'
    },
    {
      code: 'BUS405', title: 'Strategic Management', credits: 3,
      description: 'Formulating business plans, SWOT analysis, industry analysis, and competitive positioning.',
      programId: progBUS.id, instructorId: lecBUS.id, materialFile: 'bus_marketing.pdf', materialTitle: 'Strategic Management Core Slides'
    },

    // --- English Literature ---
    {
      code: 'ENG101', title: 'Introduction to Literary Studies', credits: 3,
      description: 'Analyzing prose, poetry, and dramas, with an introduction to critical reading frameworks.',
      programId: progENG.id, instructorId: lecENG.id, materialFile: 'eng_shakespeare.pdf', materialTitle: 'Literary Critique Guide'
    },
    {
      code: 'ENG202', title: 'Shakespeare: Plays and Sonnets', credits: 3,
      description: 'Detailed analysis of Shakespearean tragedies, comedies, historical plays, and sonnets.',
      programId: progENG.id, instructorId: lecENG.id, materialFile: 'eng_shakespeare.pdf', materialTitle: 'Shakespearean Tragedy & Hamlet Analysis'
    },
    {
      code: 'ENG301', title: 'Creative Writing Workshop', credits: 3,
      description: 'Developing voice, style, characterization, and plot structures in fiction and poetry.',
      programId: progENG.id, instructorId: lecENG.id, materialFile: 'eng_shakespeare.pdf', materialTitle: 'Creative Writing Prompts & Guidelines'
    },
    {
      code: 'ENG305', title: '19th Century English Novel', credits: 4,
      description: 'Analyzing novels from the Victorian era including works of Bronte, Austen, and Dickens.',
      programId: progENG.id, instructorId: lecENG.id, materialFile: 'eng_shakespeare.pdf', materialTitle: 'Victorian Era Novels Critical Essays'
    },
    {
      code: 'ENG402', title: 'Modern Literary Theory', credits: 3,
      description: 'Exploration of structuralism, post-structuralism, post-colonialism, and feminist critiques.',
      programId: progENG.id, instructorId: lecENG.id, materialFile: 'eng_shakespeare.pdf', materialTitle: 'Modern Literary Theoretical Frameworks'
    },

    // --- Mechanical Engineering ---
    {
      code: 'MECH101', title: 'Introduction to Mechanical Engineering', credits: 3,
      description: 'Overview of safety standards, mechanical designs, vector mechanics, and fabrication principles.',
      programId: progMECH.id, instructorId: lecMECH.id, materialFile: 'mech_thermo.pdf', materialTitle: 'Intro to Mechanical Engineering Guide'
    },
    {
      code: 'MECH201', title: 'Engineering Thermodynamics', credits: 4,
      description: 'Studies in laws of thermodynamics, entropy, energy transformations, and power cycles.',
      programId: progMECH.id, instructorId: lecMECH.id, materialFile: 'mech_thermo.pdf', materialTitle: 'Engineering Thermodynamics Coursepack'
    },
    {
      code: 'MECH302', title: 'Fluid Mechanics', credits: 4,
      description: 'Fluid statics and dynamics, Bernoulli equation, pipe flows, and boundary layer theory.',
      programId: progMECH.id, instructorId: lecMECH.id, materialFile: 'mech_thermo.pdf', materialTitle: 'Fluid Dynamics & Mechanics Text'
    },
    {
      code: 'MECH305', title: 'Mechanics of Materials', credits: 3,
      description: 'Stress, strain, shear deformation, torsion, bending moments, and structural load analysis.',
      programId: progMECH.id, instructorId: lecMECH.id, materialFile: 'mech_thermo.pdf', materialTitle: 'Stress Strain & Deformation Analysis'
    },
    {
      code: 'MECH401', title: 'Theory of Machines', credits: 3,
      description: 'Analysis of relative motion, gears, gear trains, cams, gyroscopic actions, and vibrations.',
      programId: progMECH.id, instructorId: lecMECH.id, materialFile: 'mech_thermo.pdf', materialTitle: 'Machine Kinematics & Vibration Slides'
    }
  ];

  const dbCourses: any[] = [];

  for (const c of coursesData) {
    const dbCourse = await prisma.course.upsert({
      where: { code: c.code },
      update: {
        title: c.title,
        credits: c.credits,
        description: c.description,
        programId: c.programId,
        instructorId: c.instructorId
      },
      create: {
        code: c.code,
        title: c.title,
        credits: c.credits,
        description: c.description,
        programId: c.programId,
        instructorId: c.instructorId
      }
    });

    dbCourses.push(dbCourse);

    // Create course material
    const materialUrl = `/materials/${c.materialFile}`;
    const existingMaterial = await prisma.courseMaterial.findFirst({
      where: { courseId: dbCourse.id, fileUrl: materialUrl }
    });

    if (!existingMaterial) {
      await prisma.courseMaterial.create({
        data: {
          courseId: dbCourse.id,
          title: c.materialTitle,
          fileUrl: materialUrl
        }
      });
    }
  }

  // --- 6. STUDENT & ENROLLMENT (ENROLLED IN 4 COURSES) ---
  const student = await prisma.user.upsert({
    where: { email: 'john@university.edu' },
    update: { passwordHash },
    create: {
      email: 'john@university.edu', passwordHash,
      firstName: 'John', lastName: 'Doe',
      roles: [Role.STUDENT], departmentId: deptCS.id,
    },
  });

  // Enroll student in 4 courses (one from each program)
  const coursesToEnroll = ['AI400', 'BUS201', 'ENG202', 'MECH201'];
  for (const code of coursesToEnroll) {
    const course = dbCourses.find(c => c.code === code);
    if (course) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: course.id
          }
        },
        update: {},
        create: {
          userId: student.id,
          courseId: course.id,
          status: 'ACTIVE'
        }
      });
    }
  }

  // --- 7. RESEARCH DATA ---
  const projectTitle = "SmartLearn AI: Decentralized LMS Integration";
  await prisma.publication.deleteMany({ where: { project: { title: projectTitle } } });
  await prisma.ethicsApplication.deleteMany({ where: { project: { title: projectTitle } } });
  await prisma.milestone.deleteMany({ where: { project: { title: projectTitle } } });
  await prisma.task.deleteMany({ where: { project: { title: projectTitle } } });
  await prisma.researchProject.deleteMany({ where: { title: projectTitle } });

  await prisma.researchProject.create({
    data: {
      title: projectTitle,
      description: "Researching privacy-preserving decentralized ledgers and peer-to-peer distribution of course materials with zero-knowledge metadata compliance.",
      piId: lecCS.id,
      status: "ACTIVE",
      totalBudget: 120000.00,
      tasks: {
        create: [
          { title: "Design decentralized schema", status: "DONE", assigneeId: lecCS.id },
          { title: "Conduct benchmark analysis", status: "IN_PROGRESS", assigneeId: lecCS.id },
          { title: "Prepare ethics proposal", status: "TODO", assigneeId: lecCS.id },
          { title: "Write final report", status: "TODO", assigneeId: lecCS.id },
        ]
      },
      milestones: {
        create: [
          { title: "Project kickoff and literature review", dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isCompleted: true },
          { title: "Prototype implementation", dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isCompleted: false },
          { title: "Security audit and submission", dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), isCompleted: false },
        ]
      },
      ethicsApps: {
        create: [
          { status: ApplicationStatus.APPROVED, submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), comments: "Approved pending minor guidelines updates." }
        ]
      },
      publications: {
        create: [
          { title: "Decentralized Access Management in Modern LMS Systems", journal: "IEEE Transactions on Education", doi: "10.1109/TE.2026.012345", status: "PUBLISHED", publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
        ]
      }
    }
  });

  console.log('Database seeded comprehensively with 20 courses, materials, enrollments, and research data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
