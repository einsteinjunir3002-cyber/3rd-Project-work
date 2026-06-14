import { Router } from 'express';
import { 
  signUp, 
  signIn, 
  logout, 
  verifySession, 
  forgotPassword, 
  resetPassword, 
  verifyEmail,
  getBiometricRegisterOptions,
  verifyBiometricRegister,
  getBiometricLoginOptions,
  verifyBiometricLogin
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);
router.get('/session', authenticateToken, verifySession);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);

// Biometrics Routes
router.post('/biometrics/register-options', authenticateToken, getBiometricRegisterOptions);
router.post('/biometrics/register-verify', authenticateToken, verifyBiometricRegister);
router.post('/biometrics/login-options', getBiometricLoginOptions);
router.post('/biometrics/login-verify', verifyBiometricLogin);

export default router;
