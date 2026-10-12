import express from 'express';
import {
  login,
  changePassword,
  getMe,
  logout,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;

