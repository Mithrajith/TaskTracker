import User from '../models/User.js';
import StudentTask from '../models/StudentTask.js';
import Submission from '../models/Submission.js';
import TaskReview from '../models/TaskReview.js';
import Task from '../models/Task.js';
import { ROLES, ACCOUNT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import {
  getStudentProgressionStats,
  assignTaskToEligibleStudents,
} from '../services/progressionService.js';
import { logAudit } from '../utils/auditLogger.js';
import { parseCSV } from '../utils/csvParser.js';

export const getAllStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { role: ROLES.STUDENT };

    if (status && Object.values(ACCOUNT_STATUS).includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      User.find(query).sort(sortOption).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    // Attach progression statistics for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const stats = await getStudentProgressionStats(student._id);
        return {
          ...student.toJSON(),
          stats,
        };
      })
    );

    res.json({
      success: true,
      data: studentsWithStats,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Security ownership check: students can only view their own profile
    if (req.user.role === ROLES.STUDENT && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own student profile',
      });
    }

    const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found',
      });
    }

    // Get progression stats
    const stats = await getStudentProgressionStats(student._id);

    // Get all assigned tasks
    const studentTasks = await StudentTask.find({ student: student._id })
      .populate('task')
      .sort({ 'task.taskNumber': 1 });

    // For each student task, get full submission history with reviews
    const taskHistory = await Promise.all(
      studentTasks.map(async (st) => {
        const submissions = await Submission.find({ studentTask: st._id })
          .sort({ version: -1 });

        const submissionsWithReviews = await Promise.all(
          submissions.map(async (sub) => {
            const reviews = await TaskReview.find({ submission: sub._id })
              .populate('reviewer', 'name registerNumber')
              .sort({ reviewedAt: -1 });
            return {
              ...sub.toJSON(),
              reviews,
            };
          })
        );

        return {
          ...st.toJSON(),
          submissions: submissionsWithReviews,
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...student.toJSON(),
        stats,
        taskHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { name, registerNumber, githubRepoUrl, initialPassword } = req.body;

    if (!name || !registerNumber || !initialPassword) {
      return res.status(400).json({
        success: false,
        message: 'Name, unique register number, and initial password are required',
      });
    }

    const cleanRegNo = registerNumber.trim().toUpperCase();

    const existing = await User.findOne({ registerNumber: cleanRegNo });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student with register number "${cleanRegNo}" already exists`,
      });
    }

    const student = await User.create({
      name: name.trim(),
      registerNumber: cleanRegNo,
      githubRepoUrl: (githubRepoUrl || '').trim(),
      password: initialPassword,
      role: ROLES.STUDENT,
      status: ACCOUNT_STATUS.ACTIVE,
      mustChangePassword: true,
    });

    // Check if Task 1 is published; if so, assign it to the new student
    const task1 = await Task.findOne({ taskNumber: 1, status: 'published' });
    if (task1) {
      await assignTaskToEligibleStudents(task1);
    }

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.STUDENT_CREATED,
      resourceType: 'User',
      resourceId: student._id,
      metadata: { registerNumber: student.registerNumber, name: student.name },
    });

    const stats = await getStudentProgressionStats(student._id);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: {
        ...student.toJSON(),
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, githubRepoUrl, status } = req.body;

    const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (name) student.name = name.trim();
    if (githubRepoUrl !== undefined) student.githubRepoUrl = githubRepoUrl.trim();
    if (status && Object.values(ACCOUNT_STATUS).includes(status)) {
      student.status = status;
    }

    await student.save();

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.STUDENT_UPDATED,
      resourceType: 'User',
      resourceId: student._id,
      metadata: { name: student.name, status: student.status },
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Temporary reset password must be at least 6 characters long',
      });
    }

    const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    student.password = newPassword;
    student.mustChangePassword = true;
    await student.save();

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      resourceType: 'User',
      resourceId: student._id,
      metadata: { registerNumber: student.registerNumber },
    });

    res.json({
      success: true,
      message: `Password reset successfully for student ${student.registerNumber}. Student must change password on next login.`,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStudentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    student.status =
      student.status === ACCOUNT_STATUS.ACTIVE
        ? ACCOUNT_STATUS.INACTIVE
        : ACCOUNT_STATUS.ACTIVE;

    await student.save();

    await logAudit({
      actorId: req.user._id,
      action:
        student.status === ACCOUNT_STATUS.ACTIVE
          ? AUDIT_ACTIONS.STUDENT_ACTIVATED
          : AUDIT_ACTIONS.STUDENT_DEACTIVATED,
      resourceType: 'User',
      resourceId: student._id,
      metadata: { status: student.status, registerNumber: student.registerNumber },
    });

    res.json({
      success: true,
      message: `Student account ${student.status === ACCOUNT_STATUS.ACTIVE ? 'activated' : 'deactivated'}`,
      data: student.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found',
      });
    }

    await StudentTask.deleteMany({ student: student._id });
    await Submission.deleteMany({ student: student._id });
    await User.findByIdAndDelete(id);

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.STUDENT_DEACTIVATED,
      resourceType: 'User',
      resourceId: student._id,
      metadata: { deletedStudent: student.registerNumber, name: student.name },
    });

    res.json({
      success: true,
      message: `Student ${student.name} (${student.registerNumber}) deleted successfully from database`,
    });
  } catch (error) {
    next(error);
  }
};

export const importStudentsFromCSV = async (req, res, next) => {
  try {
    let rows = [];
    const defaultPassword = (req.body.defaultPassword || 'Student@123').trim();
    const updateExisting =
      req.body.updateExisting === true || req.body.updateExisting === 'true';

    if (req.file) {
      const csvText = req.file.buffer.toString('utf-8');
      rows = parseCSV(csvText);
    } else if (req.body.csvText) {
      rows = parseCSV(req.body.csvText);
    } else if (Array.isArray(req.body.students)) {
      rows = req.body.students.map((s, idx) => ({
        rowNumber: idx + 2,
        registerNumber: (s.registerNumber || s.regNo || '').trim(),
        name: (s.name || '').trim(),
        githubRepoUrl: (s.githubRepoUrl || s.githubLink || s.github || '').trim(),
        password: (s.password || '').trim(),
      }));
    } else {
      return res.status(400).json({
        success: false,
        message:
          'No CSV file or student data provided. Please upload a .csv file or submit student records.',
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid student rows found in the provided CSV.',
      });
    }

    const created = [];
    const updated = [];
    const skipped = [];
    const errors = [];
    const seenInBatch = new Set();

    // Check if Task 1 is published; if so, assign it
    const task1 = await Task.findOne({ taskNumber: 1, status: 'published' });

    for (const item of rows) {
      const { rowNumber, registerNumber, name, githubRepoUrl, password } = item;
      const cleanRegNo = (registerNumber || '').toUpperCase().trim();
      const cleanName = (name || '').trim();
      const cleanGithub = (githubRepoUrl || '').trim();
      const studentPass = password || defaultPassword;

      if (!cleanRegNo) {
        errors.push({
          row: rowNumber,
          registerNumber: cleanRegNo,
          name: cleanName,
          reason: 'Register number is required',
        });
        continue;
      }

      if (!cleanName) {
        errors.push({
          row: rowNumber,
          registerNumber: cleanRegNo,
          name: cleanName,
          reason: 'Student name is required',
        });
        continue;
      }

      if (seenInBatch.has(cleanRegNo)) {
        skipped.push({
          row: rowNumber,
          registerNumber: cleanRegNo,
          name: cleanName,
          reason: 'Duplicate register number within the same CSV',
        });
        continue;
      }
      seenInBatch.add(cleanRegNo);

      const existing = await User.findOne({ registerNumber: cleanRegNo });
      if (existing) {
        if (updateExisting) {
          existing.name = cleanName;
          if (cleanGithub) existing.githubRepoUrl = cleanGithub;
          await existing.save();
          updated.push({
            registerNumber: existing.registerNumber,
            name: existing.name,
          });
        } else {
          skipped.push({
            row: rowNumber,
            registerNumber: cleanRegNo,
            name: cleanName,
            reason: 'Student already exists in database',
          });
        }
        continue;
      }

      // Create new student
      const newStudent = await User.create({
        name: cleanName,
        registerNumber: cleanRegNo,
        githubRepoUrl: cleanGithub,
        password: studentPass,
        role: ROLES.STUDENT,
        status: ACCOUNT_STATUS.ACTIVE,
        mustChangePassword: true,
      });

      if (task1) {
        await assignTaskToEligibleStudents(task1);
      }

      await logAudit({
        actorId: req.user._id,
        action: AUDIT_ACTIONS.STUDENT_CREATED,
        resourceType: 'User',
        resourceId: newStudent._id,
        metadata: {
          registerNumber: newStudent.registerNumber,
          name: newStudent.name,
          source: 'CSV_IMPORT',
        },
      });

      created.push({
        _id: newStudent._id,
        registerNumber: newStudent.registerNumber,
        name: newStudent.name,
        githubRepoUrl: newStudent.githubRepoUrl,
      });
    }

    res.json({
      success: true,
      message: `CSV import completed: ${created.length} created, ${updated.length} updated, ${skipped.length} skipped, ${errors.length} errors`,
      data: {
        totalProcessed: rows.length,
        createdCount: created.length,
        updatedCount: updated.length,
        skippedCount: skipped.length,
        errorCount: errors.length,
        created,
        updated,
        skipped,
        errors,
      },
    });
  } catch (error) {
    next(error);
  }
};



