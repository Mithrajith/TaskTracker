import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ACCOUNT_STATUS, ROLES } from '../config/constants.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_task_tracker_secure_2026_xyz';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated. Please contact your instructor.',
      });
    }

    // Touch lastActivityAt asynchronously without delaying the request
    User.findByIdAndUpdate(user._id, { lastActivityAt: new Date() }).exec();

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this action',
      });
    }

    next();
  };
};

export const requirePasswordChanged = (req, res, next) => {
  if (req.user && req.user.role === ROLES.STUDENT && req.user.mustChangePassword) {
    return res.status(403).json({
      success: false,
      requirePasswordChange: true,
      message: 'You must change your initial password before accessing other features.',
    });
  }
  next();
};

