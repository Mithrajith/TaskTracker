import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES, ACCOUNT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import { getStudentProgressionStats } from '../services/progressionService.js';
import { logAudit } from '../utils/auditLogger.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_task_tracker_secure_2026_xyz';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      registerNumber: user.registerNumber,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

export const login = async (req, res, next) => {
  try {
    const { registerNumber, password } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both register number and password',
      });
    }

    const user = await User.findOne({
      registerNumber: registerNumber.trim().toUpperCase(),
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid register number or password',
      });
    }

    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid register number or password',
      });
    }

    const token = generateToken(user);

    let stats = null;
    if (user.role === ROLES.STUDENT) {
      stats = await getStudentProgressionStats(user._id);
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        githubRepoUrl: user.githubRepoUrl,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // If user is not required to change password, require current password verification
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required',
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    await logAudit({
      actorId: user._id,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      resourceType: 'User',
      resourceId: user._id,
      metadata: { registerNumber: user.registerNumber },
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let stats = null;

    if (user.role === ROLES.STUDENT) {
      stats = await getStudentProgressionStats(user._id);
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        githubRepoUrl: user.githubRepoUrl,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        status: user.status,
        lastActivityAt: user.lastActivityAt,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

