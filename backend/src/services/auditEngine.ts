import Role from '../models/Role';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import express from 'express';

export interface AuditReport {
  timestamp: Date;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  issues: string[];
  findings: {
    missingPermissions: string[];
    unauthorizedPermissions: string[];
    privilegeEscalations: string[];
    duplicatePermissions: string[];
    routeConflicts: string[];
    databaseConflicts: string[];
  };
}

export const runRoleAudit = async (app?: express.Application): Promise<AuditReport> => {
  const issues: string[] = [];
  const findings = {
    missingPermissions: [] as string[],
    unauthorizedPermissions: [] as string[],
    privilegeEscalations: [] as string[],
    duplicatePermissions: [] as string[],
    routeConflicts: [] as string[],
    databaseConflicts: [] as string[]
  };

  try {
    // 1. Get all roles and permissions from database
    const roles = await Role.find();
    
    // Define expected roles and their standard permission bounds
    const expectedRolePermissions: Record<string, string[]> = {
      prospective_student: [
        'View Admissions', 'Use Admission Advisor', 'View Universities', 
        'Compare Universities', 'View Scholarships', 'Participate in Discussions', 
        'Access Preparation Resources'
      ],
      student: [
        'Learning Resources', 'Course Enrollment', 'Assignments', 'GPA System', 
        'Academic Analytics', 'Student Discussions', 'AI Tutoring',
        'View Courses', 'Take Quiz'
      ],
      lecturer: [
        'Course Management', 'Assignment Creation', 'Grading', 'Attendance', 
        'Student Performance Analytics', 'Academic Content Management',
        'Create Courses', 'Grade Assignments'
      ],
      researcher: [
        'Research Workspace', 'Publications', 'Datasets', 
        'Research Collaboration', 'Research Analytics'
      ],
      entrepreneur: [
        'Startup Tools', 'Business Planning', 'Funding Opportunities', 
        'Innovation Hub', 'Entrepreneur Community'
      ],
      alumni: [
        'Mentorship', 'Networking', 'Career Opportunities', 'Alumni Events'
      ],
      industry_partner: [
        'Internship Postings', 'Recruitment', 'Talent Discovery', 'Industry Collaboration'
      ],
      career_advisor: [
        'Counseling Tools', 'Career Analytics', 'Career Assessments', 'Student Guidance'
      ],
      admin: [
        'Full System Access', 'User Management', 'Security Management', 
        'Monitoring', 'Reports', 'Content Management',
        'Manage Users', 'View Reports', 'Manage Careers'
      ],
      superadmin: [
        'Full System Access', 'User Management', 'Security Management', 
        'Monitoring', 'Reports', 'Content Management', 'Global System Config'
      ]
    };

    // 2. Validate role permissions, detect missing, unauthorized, duplicates
    for (const roleName of Object.keys(expectedRolePermissions)) {
      const dbRole = roles.find(r => r.name === roleName);
      if (!dbRole) {
        // Missing role in database - let's seed it!
        issues.push(`Missing role definition in DB: ${roleName}. Automatically seeding.`);
        const newRole = new Role({
          name: roleName,
          description: `Auto-generated permission group for ${roleName}`,
          permissions: expectedRolePermissions[roleName]
        });
        await newRole.save();
        continue;
      }

      // Check duplicate permissions in DB
      const seenPerms = new Set<string>();
      const duplicates = dbRole.permissions.filter(p => {
        if (seenPerms.has(p)) return true;
        seenPerms.add(p);
        return false;
      });

      if (duplicates.length > 0) {
        const msg = `Duplicate permissions detected in role "${roleName}": ${duplicates.join(', ')}`;
        issues.push(msg);
        findings.duplicatePermissions.push(msg);
      }

      // Check missing permissions
      const required = expectedRolePermissions[roleName];
      const missing = required.filter(p => !dbRole.permissions.includes(p));
      if (missing.length > 0) {
        const msg = `Missing required permissions in role "${roleName}": ${missing.join(', ')}`;
        issues.push(msg);
        findings.missingPermissions.push(msg);
        
        // Auto-fix: append missing permissions to roleDoc
        dbRole.permissions = [...dbRole.permissions, ...missing];
        await dbRole.save();
      }

      // Check unauthorized permissions / Privilege Escalation risks
      const adminOnlyPermissions = ['User Management', 'Security Management', 'Full System Access', 'Global System Config'];
      if (!['admin', 'superadmin'].includes(roleName)) {
        const escalations = dbRole.permissions.filter(p => adminOnlyPermissions.includes(p));
        if (escalations.length > 0) {
          const msg = `Privilege escalation risk! Non-admin role "${roleName}" has administrative permissions: ${escalations.join(', ')}`;
          issues.push(msg);
          findings.privilegeEscalations.push(msg);
          
          // Auto-fix: strip unauthorized admin permissions for safety
          dbRole.permissions = dbRole.permissions.filter(p => !adminOnlyPermissions.includes(p));
          await dbRole.save();
        }
      }
    }

    // 3. Route conflicts checking
    if (app && app._router && app._router.stack) {
      const routes: { method: string; path: string }[] = [];
      const extractRoutes = (stack: any[], prefix = '') => {
        for (const layer of stack) {
          if (layer.route) {
            const path = prefix + layer.route.path;
            const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
            methods.forEach(method => routes.push({ method, path }));
          } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
            let routePrefix = layer.regexp.toString();
            routePrefix = routePrefix
              .replace(/^\/\^/, '')
              .replace(/\?\\\/.*$/, '')
              .replace(/\\\//g, '/');
            if (routePrefix.endsWith('/')) {
              routePrefix = routePrefix.slice(0, -1);
            }
            extractRoutes(layer.handle.stack, prefix + routePrefix);
          }
        }
      };
      
      extractRoutes(app._router.stack);
      
      const seenRoutes = new Set<string>();
      routes.forEach(r => {
        const key = `${r.method} ${r.path}`;
        if (seenRoutes.has(key)) {
          const msg = `Route conflict detected: Multiple handlers mapped to "${key}"`;
          issues.push(msg);
          findings.routeConflicts.push(msg);
        } else {
          seenRoutes.add(key);
        }
      });
    }

    // 4. Database integrity checks
    const userRolesInDb = await User.distinct('role');
    const roleNamesInDb = Object.keys(expectedRolePermissions);
    userRolesInDb.forEach(uRole => {
      if (!roleNamesInDb.includes(uRole)) {
        const msg = `Database integrity conflict: Users exist with role "${uRole}", which has no database Role permissions definition!`;
        issues.push(msg);
        findings.databaseConflicts.push(msg);
      }
    });

    const status = issues.length === 0 ? 'PASSED' : findings.privilegeEscalations.length > 0 ? 'FAILED' : 'WARNING';
    
    // 5. Generate Audit Log in database
    const auditLog = new AuditLog({
      userEmail: 'system-audit@smartlearn.edu',
      action: 'Automated Role Permission Audit',
      newValue: `Status: ${status}. Found ${issues.length} concerns.`,
      previousValue: issues.join('\n') || 'All checks passed successfully.'
    });
    await auditLog.save();

    console.log(`🛡️ Role Permission Audit finished with status: ${status}.`);
    if (issues.length > 0) {
      console.log('Issues found:\n' + issues.map(i => `  - ${i}`).join('\n'));
    }

    return {
      timestamp: new Date(),
      status,
      issues,
      findings
    };

  } catch (err: any) {
    console.error('❌ Error during role audit execution:', err);
    return {
      timestamp: new Date(),
      status: 'FAILED',
      issues: [err.message || 'Audit failed due to unexpected error.'],
      findings
    };
  }
};
