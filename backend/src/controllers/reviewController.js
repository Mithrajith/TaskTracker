import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import StudentTask from '../models/StudentTask.js';
import TaskReview from '../models/TaskReview.js';
import Task from '../models/Task.js';
import {
  STUDENT_TASK_STATUS,
  SUBMISSION_STATUS,
  REVIEW_DECISION,
  AUDIT_ACTIONS,
} from '../config/constants.js';
import { unlockNextTaskForStudent } from '../services/progressionService.js';
import { logAudit } from '../utils/auditLogger.js';

export const getPendingReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, taskId, studentId } = req.query;

    const query = { status: SUBMISSION_STATUS.SUBMITTED };

    if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
      query.task = taskId;
    }
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      query.student = studentId;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate('student', 'name registerNumber githubRepoUrl')
        .populate('task', 'taskNumber title description instructions deadline')
        .populate('studentTask')
        .sort({ submittedAt: 1 }) // FIFO: review oldest pending first
        .skip(skip)
        .limit(limitNum),
      Submission.countDocuments(query),
    ]);

    // Attach previous review history for this student's task
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const history = await TaskReview.find({
          studentTask: sub.studentTask?._id,
        })
          .populate('reviewer', 'name registerNumber')
          .sort({ reviewedAt: -1 });

        return {
          ...sub.toJSON(),
          previousReviews: history,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
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

export const approveSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { feedback = 'Great work! Task approved.' } = req.body;

    const submission = await Submission.findById(submissionId)
      .populate('student', 'name registerNumber')
      .populate('task', 'taskNumber title');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Concurrency protection: atomically transition studentTask only if not already approved
    const updatedStudentTask = await StudentTask.findOneAndUpdate(
      {
        _id: submission.studentTask,
        status: { $ne: STUDENT_TASK_STATUS.APPROVED },
      },
      {
        $set: {
          status: STUDENT_TASK_STATUS.APPROVED,
          approvedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedStudentTask) {
      return res.status(400).json({
        success: false,
        message: 'This task has already been approved or is currently locked against duplicate approvals.',
      });
    }

    // Update submission status
    submission.status = SUBMISSION_STATUS.APPROVED;
    await submission.save();

    // Create review record
    const review = await TaskReview.create({
      submission: submission._id,
      studentTask: updatedStudentTask._id,
      reviewer: req.user._id,
      decision: REVIEW_DECISION.APPROVED,
      feedback: feedback.trim(),
      reviewedAt: new Date(),
    });

    // Progression Engine: Atomically unlock the next task for the student if published
    const nextTaskProgression = await unlockNextTaskForStudent(
      submission.student._id,
      submission.task.taskNumber
    );

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.SUBMISSION_APPROVED,
      resourceType: 'Submission',
      resourceId: submission._id,
      metadata: {
        taskNumber: submission.task.taskNumber,
        studentRegisterNumber: submission.student.registerNumber,
        unlockedNextTask: nextTaskProgression.unlocked,
      },
    });

    res.json({
      success: true,
      message: `Task ${submission.task.taskNumber} approved successfully for ${submission.student.name}!`,
      data: {
        submission: submission.toJSON(),
        review: review.toJSON(),
        studentTask: updatedStudentTask.toJSON(),
        nextTaskProgression,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestChanges = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Meaningful mentor feedback (at least 5 characters) is required when requesting corrections',
      });
    }

    const submission = await Submission.findById(submissionId)
      .populate('student', 'name registerNumber')
      .populate('task', 'taskNumber title');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Update StudentTask state to changes_requested
    const updatedStudentTask = await StudentTask.findByIdAndUpdate(
      submission.studentTask,
      {
        $set: {
          status: STUDENT_TASK_STATUS.CHANGES_REQUESTED,
        },
      },
      { returnDocument: 'after' }
    );

    submission.status = SUBMISSION_STATUS.CHANGES_REQUESTED;
    await submission.save();

    const review = await TaskReview.create({
      submission: submission._id,
      studentTask: updatedStudentTask._id,
      reviewer: req.user._id,
      decision: REVIEW_DECISION.CHANGES_REQUESTED,
      feedback: feedback.trim(),
      reviewedAt: new Date(),
    });

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.CHANGES_REQUESTED,
      resourceType: 'Submission',
      resourceId: submission._id,
      metadata: {
        taskNumber: submission.task.taskNumber,
        studentRegisterNumber: submission.student.registerNumber,
      },
    });

    res.json({
      success: true,
      message: 'Corrections requested. The student has been notified to resubmit.',
      data: {
        submission: submission.toJSON(),
        review: review.toJSON(),
        studentTask: updatedStudentTask.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Meaningful mentor feedback (at least 5 characters) is required when rejecting a submission',
      });
    }

    const submission = await Submission.findById(submissionId)
      .populate('student', 'name registerNumber')
      .populate('task', 'taskNumber title');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    const updatedStudentTask = await StudentTask.findByIdAndUpdate(
      submission.studentTask,
      {
        $set: {
          status: STUDENT_TASK_STATUS.REJECTED,
        },
      },
      { returnDocument: 'after' }
    );

    submission.status = SUBMISSION_STATUS.REJECTED;
    await submission.save();

    const review = await TaskReview.create({
      submission: submission._id,
      studentTask: updatedStudentTask._id,
      reviewer: req.user._id,
      decision: REVIEW_DECISION.REJECTED,
      feedback: feedback.trim(),
      reviewedAt: new Date(),
    });

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.SUBMISSION_REJECTED,
      resourceType: 'Submission',
      resourceId: submission._id,
      metadata: {
        taskNumber: submission.task.taskNumber,
        studentRegisterNumber: submission.student.registerNumber,
      },
    });

    res.json({
      success: true,
      message: 'Submission rejected with mentor feedback',
      data: {
        submission: submission.toJSON(),
        review: review.toJSON(),
        studentTask: updatedStudentTask.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};
