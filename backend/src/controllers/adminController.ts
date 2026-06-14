import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth';
import User from '../models/User';
import Course from '../models/Course';
import Note from '../models/Note';
import Submission from '../models/Submission';
import Consultation from '../models/Consultation';
import SystemSetting from '../models/SystemSetting';
import Role from '../models/Role';
import AuditLog from '../models/AuditLog';
import { Faculty, Department, Semester, AcademicYear } from '../models/Academic';
import { StartupProgram, ResearchProject, JobListing } from '../models/ProgramEntities';
import { AiService } from '../services/aiService';

// Helper to log administrative actions to the read-only audit log
const logAuditTrail = async (
  req: AuthenticatedRequest,
  action: string,
  previousValue: string = '',
  newValue: string = ''
) => {
  try {
    const audit = new AuditLog({
      userId: req.user?.id,
      userEmail: req.user?.email || 'system@smartlearn.edu',
      action,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      device: req.headers['user-agent'] || 'Unknown Browser',
      previousValue,
      newValue,
    });
    await audit.save();
  } catch (err) {
    console.error('⚠️ Failed to log audit trail:', err);
  }
};

// 1. Get all users for administration dashboard
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { query, role } = req.query;
  try {
    const filter: any = {};
    if (role) {
      filter.role = role as string;
    }
    if (query) {
      const searchRegex = new RegExp(query as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentIdNumber: searchRegex },
      ];
    }

    const users = await User.find(filter).sort({ name: 1 });
    const mapped = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      isSuspended: u.isSuspended,
      department: u.department,
      studentIdNumber: u.studentIdNumber,
      title: u.title,
      office: u.office,
      createdAt: u.createdAt,
    }));
    return res.status(200).json(mapped);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error listing users.' });
  }
};

// Create User
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, department, studentIdNumber, title, office } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password || 'password', 10);
    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      department,
      studentIdNumber,
      title,
      office,
    });
    await newUser.save();

    await logAuditTrail(req, `User Account Created`, '', `Email: ${email}, Role: ${role}`);
    return res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error creating user.' });
  }
};

// Edit User
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId, name, email, role, department, studentIdNumber, title, office } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const prevInfo = `Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`;
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.studentIdNumber = studentIdNumber || user.studentIdNumber;
    user.title = title || user.title;
    user.office = office || user.office;

    await user.save();
    const newInfo = `Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`;
    await logAuditTrail(req, `User Account Updated: ${user.email}`, prevInfo, newInfo);

    return res.status(200).json({ message: 'User updated successfully!', user });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating user.' });
  }
};

// Suspend/Restore accounts
export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId, suspend } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'superadmin' && suspend) {
      return res.status(400).json({ message: 'Cannot suspend a superadmin account.' });
    }

    user.isSuspended = !!suspend;
    await user.save();

    await logAuditTrail(
      req,
      `User Suspension Toggle: ${user.email}`,
      `Suspended: ${!suspend}`,
      `Suspended: ${suspend}`
    );

    return res.status(200).json({
      message: `User account has been successfully ${suspend ? 'suspended' : 'restored'}.`,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating user account status.' });
  }
};

// Delete User
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Root super administrators cannot be deleted.' });
    }

    await User.findByIdAndDelete(userId);
    await logAuditTrail(req, `User Account Deleted`, `Email: ${user.email}`, 'DELETED');
    return res.status(200).json({ message: 'User deleted successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting user.' });
  }
};

// Reset Password
export const resetUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { userId, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.passwordHash = await bcrypt.hash(newPassword || 'password', 10);
    await user.save();

    await logAuditTrail(req, `User Password Reset`, `User: ${user.email}`, 'PASSWORD_RESET');
    return res.status(200).json({ message: 'User password reset successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Error resetting password.' });
  }
};

// Bulk Import Users
export const bulkImportUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { users } = req.body; // Array of user objects
  if (!Array.isArray(users)) {
    return res.status(400).json({ message: 'Invalid payload: users must be an array.' });
  }
  try {
    let imported = 0;
    const defaultPassword = 'password';
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

    for (const u of users) {
      if (!u.email || !u.name) continue;
      const exists = await User.findOne({ email: u.email });
      if (exists) continue;

      const newUser = new User({
        name: u.name,
        email: u.email,
        role: u.role || 'student',
        passwordHash: defaultPasswordHash,
        department: u.department,
        studentIdNumber: u.studentIdNumber,
        title: u.title,
        office: u.office,
      });
      await newUser.save();
      imported++;
    }

    await logAuditTrail(req, `Bulk Import Users`, '', `Imported: ${imported} users`);
    return res.status(201).json({ message: `Successfully imported ${imported} accounts!` });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error bulk importing users.' });
  }
};

// 2. Role and Permission Management
export const getRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let roles = await Role.find();
    if (roles.length === 0) {
      // Seed default roles
      const defaultRoles = [
        { name: 'student', description: 'Access student dashboard, lecture materials, and AI study tutor', permissions: ['View Courses', 'Take Quiz'] },
        { name: 'lecturer', description: 'Access faculty desk, publish slides, create tests, and grade tasks', permissions: ['Create Courses', 'Grade Assignments'] },
        { name: 'admin', description: 'Access global overview, manage accounts, and system parameters', permissions: ['Manage Users', 'View Reports', 'Manage Careers'] },
      ];
      await Role.insertMany(defaultRoles);
      roles = await Role.find();
    }
    return res.status(200).json(roles);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching roles.' });
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, permissions } = req.body;
  try {
    const exists = await Role.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Role already exists.' });

    const newRole = new Role({ name, description, permissions });
    await newRole.save();

    await logAuditTrail(req, `Role Created: ${name}`, '', `Permissions: ${permissions.join(',')}`);
    return res.status(201).json({ message: 'Role created successfully!', role: newRole });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating role.' });
  }
};

export const updateRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  const { roleId, permissions } = req.body;
  try {
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) return res.status(404).json({ message: 'Role not found.' });

    const prevVal = roleDoc.permissions.join(', ');
    roleDoc.permissions = permissions;
    await roleDoc.save();

    const newVal = permissions.join(', ');
    await logAuditTrail(req, `Role Permissions Updated: ${roleDoc.name}`, prevVal, newVal);

    return res.status(200).json({ message: 'Permissions updated successfully!', role: roleDoc });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating permissions.' });
  }
};

// 3. Academic Control Center
export const createFaculty = async (req: AuthenticatedRequest, res: Response) => {
  const { name, code } = req.body;
  try {
    const faculty = new Faculty({ name, code });
    await faculty.save();
    await logAuditTrail(req, `Academic Faculty Created: ${code}`, '', name);
    return res.status(201).json(faculty);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const getFaculties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await Faculty.find();
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Error loading faculties.' });
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  const { name, code, facultyId } = req.body;
  try {
    const dept = new Department({ name, code, facultyId });
    await dept.save();
    await logAuditTrail(req, `Academic Dept Created: ${code}`, '', name);
    return res.status(201).json(dept);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const getDepartments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await Department.find().populate('facultyId');
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Error loading departments.' });
  }
};

// 4. Incubation / Startups / Research / Careers Planners
export const createStartupProgram = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, startDate } = req.body;
  try {
    const program = new StartupProgram({ name, description, startDate, status: 'upcoming' });
    await program.save();
    await logAuditTrail(req, `Startup Program Created: ${name}`);
    return res.status(201).json(program);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const getStartups = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await StartupProgram.find();
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Error loading startups.' });
  }
};

export const getResearchProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await ResearchProject.find().populate('leadResearcher');
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Error loading research projects.' });
  }
};

export const getJobListings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await JobListing.find();
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Error loading job listings.' });
  }
};

// 5. Security & Auditing Logs
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching audit logs.' });
  }
};

export const getPlatformStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    const totalCourses = await Course.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalConsultations = await Consultation.countDocuments();

    // Cumulative GPA average of all students
    const studentGrades = await User.find({ role: 'student' }).select('projectedGpa');
    const validGpas = studentGrades.map((s) => s.projectedGpa || 4.0);
    const averageGpa = validGpas.length
      ? parseFloat((validGpas.reduce((a, b) => a + b, 0) / validGpas.length).toFixed(2))
      : 4.0;

    const settings = await AiService.getSettings();

    return res.status(200).json({
      studentsCount: totalStudents,
      lecturersCount: totalLecturers,
      coursesCount: totalCourses,
      notesCount: totalNotes,
      submissionsCount: totalSubmissions,
      consultationsCount: totalConsultations,
      averageGpa,
      apiUsageStats: settings.apiUsageStats,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error aggregating statistics.' });
  }
};

// 6. Retrieve Site Settings
export const getSiteSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await AiService.getSettings();
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error fetching site configurations.' });
  }
};

// 7. Site configuration AI parameters
export const updateSiteSettings = async (req: AuthenticatedRequest, res: Response) => {
  const {
    siteName,
    activeAiProvider,
    activeAiModel,
    geminiApiKey,
    openaiApiKey,
    openrouterApiKey,
    groqApiKey,
    togetherApiKey,
  } = req.body;

  try {
    const settings = await AiService.getSettings();
    const prevSiteName = settings.siteName;

    if (siteName) settings.siteName = siteName;
    if (activeAiProvider) settings.activeAiProvider = activeAiProvider;
    if (activeAiModel) settings.activeAiModel = activeAiModel;

    if (geminiApiKey && !geminiApiKey.endsWith('...')) settings.geminiApiKey = geminiApiKey;
    if (openaiApiKey && !openaiApiKey.endsWith('...')) settings.openaiApiKey = openaiApiKey;
    if (openrouterApiKey && !openrouterApiKey.endsWith('...')) settings.openrouterApiKey = openrouterApiKey;
    if (groqApiKey && !groqApiKey.endsWith('...')) settings.groqApiKey = groqApiKey;
    if (togetherApiKey && !togetherApiKey.endsWith('...')) settings.togetherApiKey = togetherApiKey;

    await settings.save();
    await logAuditTrail(req, `System Settings Updated`, prevSiteName, settings.siteName);

    return res.status(200).json({
      message: 'System settings saved successfully!',
      settings,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error updating settings.' });
  }
};

// 8. Test AI Connection
export const testAiConnection = async (req: AuthenticatedRequest, res: Response) => {
  const { provider, apiKey, modelName } = req.body;

  if (!provider) {
    return res.status(400).json({ message: 'Provider is required.' });
  }

  try {
    let keyToUse = apiKey;
    if (!keyToUse || keyToUse.endsWith('...')) {
      const settings = await AiService.getSettings();
      keyToUse = AiService.getApiKey(settings, provider);
    }

    if (!keyToUse) {
      return res.status(400).json({ message: `No API key found or configured for provider "${provider}".` });
    }

    const isConnected = await AiService.testConnection(provider, keyToUse, modelName);
    if (isConnected) {
      return res.status(200).json({ success: true, message: `Successfully connected to "${provider}" AI provider!` });
    } else {
      return res.status(400).json({ success: false, message: `Failed to authenticate connection with "${provider}" provider.` });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Error executing connection test.' });
  }
};
