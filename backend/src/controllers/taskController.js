import Task from '../models/Task.js';
import StudentTask from '../models/StudentTask.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { TASK_STATUS, ROLES, ACCOUNT_STATUS, STUDENT_TASK_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import {
  getEligibleStudentsForTask,
  assignTaskToEligibleStudents,
} from '../services/progressionService.js';
import { logAudit } from '../utils/auditLogger.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === ROLES.ADMIN;
    const query = {};

    // Students only see published tasks
    if (!isAdmin) {
      query.status = TASK_STATUS.PUBLISHED;
    }

    const tasks = await Task.find(query)
      .sort({ taskNumber: 1 })
      .populate('createdBy', 'name registerNumber');

    // For admin, enrich with submission and assignment statistics
    if (isAdmin) {
      const enrichedTasks = await Promise.all(
        tasks.map(async (task) => {
          const totalAssigned = await StudentTask.countDocuments({ task: task._id });
          const totalSubmitted = await StudentTask.countDocuments({
            task: task._id,
            status: { $in: ['submitted', 'changes_requested', 'rejected', 'approved'] },
          });
          const totalApproved = await StudentTask.countDocuments({
            task: task._id,
            status: 'approved',
          });
          const totalPending = await StudentTask.countDocuments({
            task: task._id,
            status: 'submitted',
          });
          const eligibleCount =
            task.status === TASK_STATUS.DRAFT
              ? (await getEligibleStudentsForTask(task.taskNumber)).length
              : 0;

          return {
            ...task.toJSON(),
            stats: {
              totalAssigned,
              totalSubmitted,
              totalApproved,
              totalPending,
              eligibleCount,
            },
          };
        })
      );

      return res.json({
        success: true,
        data: enrichedTasks,
      });
    }

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate('createdBy', 'name registerNumber');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (
      req.user.role === ROLES.STUDENT &&
      task.status !== TASK_STATUS.PUBLISHED
    ) {
      return res.status(403).json({
        success: false,
        message: 'Draft tasks are not accessible to students',
      });
    }

    let stats = null;
    let eligibleStudents = [];

    if (req.user.role === ROLES.ADMIN) {
      const totalAssigned = await StudentTask.countDocuments({ task: task._id });
      const totalApproved = await StudentTask.countDocuments({
        task: task._id,
        status: 'approved',
      });
      const totalPending = await StudentTask.countDocuments({
        task: task._id,
        status: 'submitted',
      });
      stats = { totalAssigned, totalApproved, totalPending };

      if (task.status === TASK_STATUS.DRAFT) {
        eligibleStudents = await getEligibleStudentsForTask(task.taskNumber);
      }
    }

    res.json({
      success: true,
      data: {
        ...task.toJSON(),
        stats,
        eligibleStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, instructions, deadline, status = TASK_STATUS.DRAFT } = req.body;

    if (!title || !description || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and instructions are required',
      });
    }

    // Auto-generate sequential task number
    const highestTask = await Task.findOne().sort({ taskNumber: -1 });
    const nextTaskNumber = highestTask ? highestTask.taskNumber + 1 : 1;

    const task = await Task.create({
      taskNumber: nextTaskNumber,
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      deadline: deadline ? new Date(deadline) : null,
      status: status === TASK_STATUS.PUBLISHED ? TASK_STATUS.PUBLISHED : TASK_STATUS.DRAFT,
      publishedAt: status === TASK_STATUS.PUBLISHED ? new Date() : null,
      createdBy: req.user._id,
    });

    let assignmentResult = null;
    if (task.status === TASK_STATUS.PUBLISHED) {
      assignmentResult = await assignTaskToEligibleStudents(task);
    }

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.TASK_CREATED,
      resourceType: 'Task',
      resourceId: task._id,
      metadata: {
        taskNumber: task.taskNumber,
        title: task.title,
        status: task.status,
      },
    });

    res.status(201).json({
      success: true,
      message: `Task ${task.taskNumber} created successfully`,
      data: task.toJSON(),
      assignmentResult,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, instructions, deadline } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Submission-history protection: Check if any student has submitted work for this task
    const submissionCount = await Submission.countDocuments({ task: task._id });
    if (submissionCount > 0) {
      // Allow updating deadline and minor clarification instructions, but preserve audit log
      if (instructions && instructions !== task.instructions) {
        task.instructions = instructions.trim();
      }
      if (title && title !== task.title) {
        task.title = title.trim();
      }
      if (description && description !== task.description) {
        task.description = description.trim();
      }
      if (deadline !== undefined) {
        task.deadline = deadline ? new Date(deadline) : null;
      }
    } else {
      if (title) task.title = title.trim();
      if (description) task.description = description.trim();
      if (instructions) task.instructions = instructions.trim();
      if (deadline !== undefined) {
        task.deadline = deadline ? new Date(deadline) : null;
      }
    }

    await task.save();

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.TASK_UPDATED,
      resourceType: 'Task',
      resourceId: task._id,
      metadata: { taskNumber: task.taskNumber, submissionCount },
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const publishTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.status === TASK_STATUS.PUBLISHED) {
      return res.status(400).json({
        success: false,
        message: 'Task is already published',
      });
    }

    task.status = TASK_STATUS.PUBLISHED;
    task.publishedAt = new Date();
    await task.save();

    // Assign to all eligible students according to progression
    const assignmentResult = await assignTaskToEligibleStudents(task);

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.TASK_PUBLISHED,
      resourceType: 'Task',
      resourceId: task._id,
      metadata: {
        taskNumber: task.taskNumber,
        assignedCount: assignmentResult.assignedCount,
      },
    });

    res.json({
      success: true,
      message: `Task ${task.taskNumber} published! Assigned to ${assignmentResult.assignedCount} eligible students.`,
      data: task.toJSON(),
      assignmentResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getEligibleStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const eligibleStudents = await getEligibleStudentsForTask(task.taskNumber);

    res.json({
      success: true,
      data: eligibleStudents,
      count: eligibleStudents.length,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await StudentTask.deleteMany({ task: task._id });
    await Submission.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(id);

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.TASK_UPDATED,
      resourceType: 'Task',
      resourceId: task._id,
      metadata: { deletedTaskNumber: task.taskNumber, title: task.title },
    });

    res.json({
      success: true,
      message: `Task #${task.taskNumber} deleted successfully from database`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks/:id/backfill
 * Admin-only: Assigns a published task to every active student who doesn't
 * have it yet. Existing StudentTask records (including approved/submitted ones)
 * are NEVER modified — upsert uses $setOnInsert so existing docs are untouched.
 */
export const backfillTaskAssignments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== TASK_STATUS.PUBLISHED) {
      return res.status(400).json({
        success: false,
        message: `Task #${task.taskNumber} must be published before backfilling assignments`,
      });
    }

    // All active students
    const allStudents = await User.find({
      role: ROLES.STUDENT,
      status: ACCOUNT_STATUS.ACTIVE,
    }).select('_id name registerNumber');

    // Students who already have this task
    const existingIds = await StudentTask.distinct('student', { task: task._id });
    const existingSet = new Set(existingIds.map((id) => id.toString()));

    const toAssign = allStudents.filter((s) => !existingSet.has(s._id.toString()));
    const alreadyHad = allStudents.length - toAssign.length;

    const newlyAssigned = [];
    const failed = [];

    for (const student of toAssign) {
      try {
        await StudentTask.findOneAndUpdate(
          { student: student._id, task: task._id },
          {
            $setOnInsert: {
              student: student._id,
              task: task._id,
              status: STUDENT_TASK_STATUS.ASSIGNED,
              unlockedAt: new Date(),
              isStudentCompleted: false,
            },
          },
          { upsert: true, returnDocument: 'after' }
        );
        newlyAssigned.push({ registerNumber: student.registerNumber, name: student.name });
      } catch (err) {
        failed.push({ registerNumber: student.registerNumber, reason: err.message });
      }
    }

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.TASK_UPDATED,
      resourceType: 'Task',
      resourceId: task._id,
      metadata: {
        action: 'backfill',
        taskNumber: task.taskNumber,
        newlyAssigned: newlyAssigned.length,
        alreadyHad,
        failed: failed.length,
      },
    });

    res.json({
      success: true,
      message: `Backfill complete for Task #${task.taskNumber}: ${newlyAssigned.length} newly assigned, ${alreadyHad} already had it.`,
      data: {
        taskNumber: task.taskNumber,
        taskTitle: task.title,
        totalStudents: allStudents.length,
        alreadyHad,
        newlyAssigned: newlyAssigned.length,
        failed: failed.length,
        newlyAssignedList: newlyAssigned,
        failedList: failed,
      },
    });
  } catch (error) {
    next(error);
  }
};


