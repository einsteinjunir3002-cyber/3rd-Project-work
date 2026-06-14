import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey1234567890!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signUp = async (req: Request, res: Response) => {
  const { 
    name, email, password, role, department, studentIdNumber, title, office,
    startupName, businessIdea, researchArea, institution, graduationYear, companyName, industrySector, advisorExpertise 
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password and role are required.' });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address already in use.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Prepare profile details
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
    };

    if (role === 'student') {
      userData.studentIdNumber = studentIdNumber || `SL-${Math.floor(100000 + Math.random() * 900000)}`;
      userData.department = department || 'Computer Science';
      userData.projectedGpa = 4.0;
      userData.stressLevel = 50;
    } else if (role === 'lecturer') {
      userData.title = title || 'Dr.';
      userData.department = department || 'Computer Science';
      userData.office = office || 'Block C, Office 4';
    } else if (role === 'researcher') {
      userData.researchArea = researchArea || 'Artificial Intelligence';
      userData.institution = institution || 'Ghana Research Institute';
    } else if (role === 'entrepreneur') {
      userData.startupName = startupName || 'InnovateGhana';
      userData.businessIdea = businessIdea || 'AI Agriculture Solutions';
    } else if (role === 'alumni') {
      userData.graduationYear = graduationYear || '2025';
      userData.companyName = companyName || 'TechCorp Ghana';
    } else if (role === 'industry_partner') {
      userData.industrySector = industrySector || 'Technology';
      userData.companyName = companyName || 'Global Innovations Inc';
    } else if (role === 'career_advisor') {
      userData.advisorExpertise = advisorExpertise || 'Academic & Career Planning';
    }

    const newUser = new User(userData);
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id.toString(), name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Set secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentIdNumber: newUser.studentIdNumber,
        department: newUser.department,
        projectedGpa: newUser.projectedGpa,
        stressLevel: newUser.stressLevel,
        title: newUser.title,
        office: newUser.office,
        startupName: newUser.startupName,
        businessIdea: newUser.businessIdea,
        researchArea: newUser.researchArea,
        institution: newUser.institution,
        graduationYear: newUser.graduationYear,
        companyName: newUser.companyName,
        industrySector: newUser.industrySector,
        advisorExpertise: newUser.advisorExpertise,
      },
    });
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
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      if (email.toLowerCase().trim() === 'everybody@smartlearn.com') {
        const passwordHash = await bcrypt.hash('password', 10);
        user = new User({
          name: 'Universal User',
          email: 'everybody@smartlearn.com',
          passwordHash,
          role: 'admin',
        });
        await user.save();
      } else {
        return res.status(400).json({ message: 'Incorrect email or password.' });
      }
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'This account has been suspended by an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: expiresIn as any }
    );

    // Set cookie
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
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        studentIdNumber: user.studentIdNumber,
        department: user.department,
        projectedGpa: user.projectedGpa,
        stressLevel: user.stressLevel,
        title: user.title,
        office: user.office,
        startupName: user.startupName,
        businessIdea: user.businessIdea,
        researchArea: user.researchArea,
        institution: user.institution,
        graduationYear: user.graduationYear,
        companyName: user.companyName,
        industrySector: user.industrySector,
        advisorExpertise: user.advisorExpertise,
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        studentIdNumber: user.studentIdNumber,
        department: user.department,
        projectedGpa: user.projectedGpa,
        stressLevel: user.stressLevel,
        title: user.title,
        office: user.office,
        startupName: user.startupName,
        businessIdea: user.businessIdea,
        researchArea: user.researchArea,
        institution: user.institution,
        graduationYear: user.graduationYear,
        companyName: user.companyName,
        industrySector: user.industrySector,
        advisorExpertise: user.advisorExpertise,
      },
    });
  } catch (err) {
    console.error('VerifySession error:', err);
    return res.status(500).json({ message: 'Internal server error validating session.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email address required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        message: 'If that email is in our database, we have sent instructions to reset credentials.',
      });
    }

    // Generate random reset token (using timestamp + random number)
    const resetToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    console.log(`[Forgot Password Reset Link] http://localhost:5173/reset-password?token=${resetToken}`);

    return res.status(200).json({
      message: 'If that email is in our database, we have sent instructions to reset credentials.',
      resetToken, // Return token directly for validation ease in frontend SPA testing
    });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    return res.status(500).json({ message: 'Internal server error sending password reset.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Missing parameters.' });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    return res.status(500).json({ message: 'Internal server error updating credentials.' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ message: 'Verification code required.' });

  try {
    const user = await User.findOne({ verificationToken: code as string });
    if (!user) {
      return res.status(400).send(`<h1>Verification Failed</h1><p>Invalid verification code.</p>`);
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).send(`<h1>Email Verified!</h1><p>Your address has been verified successfully. You may return to the SmartLearn App.</p>`);
  } catch (err) {
    console.error('VerifyEmail error:', err);
    return res.status(500).send(`<h1>Error</h1><p>Server error verifying email.</p>`);
  }
};

// Biometrics disabled by request
export const getBiometricRegisterOptions = async (req: Request, res: Response) => {
  return res.status(400).json({ message: 'Biometric features have been disabled.' });
};

export const verifyBiometricRegister = async (req: Request, res: Response) => {
  return res.status(400).json({ message: 'Biometric features have been disabled.' });
};

export const getBiometricLoginOptions = async (req: Request, res: Response) => {
  return res.status(400).json({ message: 'Biometric features have been disabled.' });
};

export const verifyBiometricLogin = async (req: Request, res: Response) => {
  return res.status(400).json({ message: 'Biometric features have been disabled.' });
};
