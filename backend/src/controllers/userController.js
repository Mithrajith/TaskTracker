import User from '../models/User.js';
import Task from '../models/Task.js';
import { ROLES, ACCOUNT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import { assignTaskToEligibleStudents } from '../services/progressionService.js';
import { logAudit } from '../utils/auditLogger.js';

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      registerNumber,
      role = ROLES.STUDENT,
      initialPassword,
      password,
      githubRepoUrl,
    } = req.body;

    const pass = initialPassword || password;

    if (!name || !registerNumber || !pass) {
      return res.status(400).json({
        success: false,
        message: 'Name, register number, and a password are required',
      });
    }

    if (pass.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or student',
      });
    }

    const cleanRegNo = registerNumber.trim().toUpperCase();
    const existing = await User.findOne({ registerNumber: cleanRegNo });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A user with register number "${cleanRegNo}" already exists`,
      });
    }

    const isStudent = role === ROLES.STUDENT;
    const cleanGithub = (githubRepoUrl || '').trim();

    const user = await User.create({
      name: name.trim(),
      registerNumber: cleanRegNo,
      githubRepoUrl: isStudent ? cleanGithub : '',
      password: pass,
      role,
      status: ACCOUNT_STATUS.ACTIVE,
      mustChangePassword: true,
      mustSetGithub: isStudent && !cleanGithub,
    });

    // Students start the roadmap at Task 1 when it is published
    if (isStudent) {
      const task1 = await Task.findOne({ taskNumber: 1, status: 'published' });
      if (task1) {
        await assignTaskToEligibleStudents(task1);
      }
    }

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.USER_CREATED,
      resourceType: 'User',
      resourceId: user._id,
      metadata: {
        registerNumber: user.registerNumber,
        name: user.name,
        role: user.role,
      },
    });

    res.status(201).json({
      success: true,
      message: `${isStudent ? 'Student' : 'Admin'} account created successfully`,
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
