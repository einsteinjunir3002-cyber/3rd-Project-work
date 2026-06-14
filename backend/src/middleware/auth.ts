import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey1234567890!';

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
export const requireRole = (allowedRoles: ('student' | 'lecturer' | 'admin' | 'superadmin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    if (allowedRoles.includes(req.user.role) || (req.user.role === 'superadmin' && !allowedRoles.includes('student') && !allowedRoles.includes('lecturer'))) {
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
