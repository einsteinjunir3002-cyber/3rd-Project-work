import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables!');
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Authentication check middleware
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Grab token from cookie or header authorization
  let token = req.cookies?.token || req.headers['authorization'];
  
  if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired authentication token.' });
  }
};

import Role from '../models/Role';

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const role = req.user.role;
    if (role === 'superadmin') {
      return next();
    }

    const hasAccess = allowedRoles.some(allowed => {
      if (allowed === 'student') {
        return ['student', 'researcher', 'entrepreneur'].includes(role);
      }
      if (allowed === 'lecturer') {
        return ['lecturer', 'alumni', 'industry_partner', 'career_advisor'].includes(role);
      }
      if (allowed === 'admin') {
        return ['admin'].includes(role);
      }
      return role === allowed;
    });

    if (hasAccess) {
      return next();
    }

    return res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
  };
};

// Permission-based access control middleware (PBAC)
export const requirePermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    if (req.user.role === 'superadmin') {
      return next();
    }

    try {
      const roleDoc = await Role.findOne({ name: req.user.role });
      if (roleDoc && roleDoc.permissions.includes(permission)) {
        return next();
      }
      return res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server authorization error.' });
    }
  };
};
