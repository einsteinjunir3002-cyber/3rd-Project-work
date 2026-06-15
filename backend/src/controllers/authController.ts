import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey1234567890!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signUp = async (req: Request, res: Response) => {
  const { 
    name, email, password, role, facultyId, departmentId, programId, courseId
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password and role are required.' });
  }

  const allowedRoles = ['student', 'lecturer', 'department_admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role assignment.' });
  }

  try {
    // 1. Check if email exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email address already in use.' });
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Begin Transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Insert User
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, department_id, program_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, department_id, program_id`,
        [name.trim(), email.toLowerCase().trim(), passwordHash, role, departmentId || null, programId || null]
      );
      
      const newUser = userRes.rows[0];

      // Insert specific role data
      if (role === 'student') {
        const studentIdNumber = `SL-${Math.floor(100000 + Math.random() * 900000)}`;
        await client.query(
          `INSERT INTO students (user_id, student_id_number, year_of_study) VALUES ($1, $2, $3)`,
          [newUser.id, studentIdNumber, 1]
        );
        
        // Enroll in course if provided
        if (courseId) {
          await client.query(
            `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)`,
            [newUser.id, courseId]
          );
        }
      } else if (role === 'lecturer') {
        await client.query(
          `INSERT INTO lecturers (user_id, title) VALUES ($1, $2)`,
          [newUser.id, 'Dr.']
        );
        
        // Assign to course if provided
        if (courseId) {
          await client.query(
            `INSERT INTO lecturer_assignments (lecturer_id, course_id) VALUES ($1, $2)`,
            [newUser.id, courseId]
          );
        }
      }

      await client.query('COMMIT');

      // 4. Generate Token
      const token = jwt.sign(
        { id: newUser.id.toString(), name: newUser.name, email: newUser.email, role: newUser.role, departmentId: newUser.department_id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: newUser
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign(
      { id: user.id.toString(), name: user.name, email: user.email, role: user.role, departmentId: user.department_id },
      JWT_SECRET,
      { expiresIn: expiresIn as any }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'Signed in successfully!',
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
        programId: user.program_id
      },
    });
  } catch (err) {
    console.error('SignIn error:', err);
    return res.status(500).json({ message: 'Internal server error during signin.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully.' });
};

export const verifySession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No active session.' });
  }

  try {
    const result = await db.query('SELECT id, name, email, role, department_id, program_id FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('VerifySession error:', err);
    return res.status(500).json({ message: 'Internal server error validating session.' });
  }
};

// Simplified fallbacks for forgot/reset password
export const forgotPassword = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'If that email is in our database, we have sent instructions.' });
};
export const resetPassword = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Password reset feature pending implementation.' });
};
export const verifyEmail = async (req: Request, res: Response) => {
  return res.status(200).send('<h1>Verification pending.</h1>');
};
export const getBiometricRegisterOptions = async (req: Request, res: Response) => res.status(400).json({ message: 'Biometrics disabled' });
export const verifyBiometricRegister = async (req: Request, res: Response) => res.status(400).json({ message: 'Biometrics disabled' });
export const getBiometricLoginOptions = async (req: Request, res: Response) => res.status(400).json({ message: 'Biometrics disabled' });
export const verifyBiometricLogin = async (req: Request, res: Response) => res.status(400).json({ message: 'Biometrics disabled' });
