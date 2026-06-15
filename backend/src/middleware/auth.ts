import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables!');
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const role = req.user.role;
    if (role === 'super_admin') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
  };
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access Denied: Super Admin Only' });
  }
  next();
};

export const requireDepartmentAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['super_admin', 'department_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access Denied: Department Admin Only' });
  }
  next();
};

export const requireDepartment = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  
  // Super admins bypass department checks
  if (req.user.role === 'super_admin') {
    return next();
  }

  // The requested department usually comes from body, params, or query
  const targetDepartmentId = parseInt(req.params.departmentId || req.body.departmentId || req.query.departmentId as string);
  
  if (targetDepartmentId && req.user.departmentId !== targetDepartmentId) {
    return res.status(403).json({ message: 'Access Denied: You cannot access resources outside your assigned department.' });
  }

  next();
};
