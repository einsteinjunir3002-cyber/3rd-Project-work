import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  suspendUser,
  deleteUser,
  resetUserPassword,
  bulkImportUsers,
  getRoles,
  createRole,
  updateRolePermissions,
  createFaculty,
  getFaculties,
  createDepartment,
  getDepartments,
  createStartupProgram,
  getStartups,
  getResearchProjects,
  getJobListings,
  getAuditLogs,
  getPlatformStats,
  getSiteSettings,
  updateSiteSettings,
  testAiConnection,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Secure all admin endpoints to Admin / Super Admin roles only
router.get('/users', authenticateToken, requireRole(['admin', 'superadmin']), getUsers);
router.post('/users/create', authenticateToken, requireRole(['admin', 'superadmin']), createUser);
router.post('/users/update', authenticateToken, requireRole(['admin', 'superadmin']), updateUser);
router.post('/users/suspend', authenticateToken, requireRole(['admin', 'superadmin']), suspendUser);
router.post('/users/delete', authenticateToken, requireRole(['admin', 'superadmin']), deleteUser);
router.post('/users/reset-password', authenticateToken, requireRole(['admin', 'superadmin']), resetUserPassword);
router.post('/users/bulk-import', authenticateToken, requireRole(['admin', 'superadmin']), bulkImportUsers);

// Roles
router.get('/roles', authenticateToken, requireRole(['admin', 'superadmin']), getRoles);
router.post('/roles/create', authenticateToken, requireRole(['admin', 'superadmin']), createRole);
router.post('/roles/permissions', authenticateToken, requireRole(['admin', 'superadmin']), updateRolePermissions);

// Academics
router.get('/faculties', authenticateToken, requireRole(['admin', 'superadmin']), getFaculties);
router.post('/faculties/create', authenticateToken, requireRole(['admin', 'superadmin']), createFaculty);
router.get('/departments', authenticateToken, requireRole(['admin', 'superadmin']), getDepartments);
router.post('/departments/create', authenticateToken, requireRole(['admin', 'superadmin']), createDepartment);

// Program trackers
router.get('/startups', authenticateToken, requireRole(['admin', 'superadmin']), getStartups);
router.post('/startups/create', authenticateToken, requireRole(['admin', 'superadmin']), createStartupProgram);
router.get('/research', authenticateToken, requireRole(['admin', 'superadmin']), getResearchProjects);
router.get('/jobs', authenticateToken, requireRole(['admin', 'superadmin']), getJobListings);

// Logs and Config
router.get('/audit-logs', authenticateToken, requireRole(['admin', 'superadmin']), getAuditLogs);
router.get('/stats', authenticateToken, requireRole(['admin', 'superadmin']), getPlatformStats);
router.get('/settings', authenticateToken, requireRole(['admin', 'superadmin']), getSiteSettings);
router.post('/settings', authenticateToken, requireRole(['superadmin']), updateSiteSettings); // Super Admin only can update configuration
router.post('/ai/test', authenticateToken, requireRole(['admin', 'superadmin']), testAiConnection);

export default router;
