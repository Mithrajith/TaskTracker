import User from '../models/User.js';
import Task from '../models/Task.js';
import StudentTask from '../models/StudentTask.js';
import Submission from '../models/Submission.js';
import TaskReview from '../models/TaskReview.js';
import {
  ROLES,
  ACCOUNT_STATUS,
  TASK_STATUS,
  STUDENT_TASK_STATUS,
  SUBMISSION_STATUS,
} from '../config/constants.js';

export const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalStudents,
      activeStudents,
      tasksPublished,
      submissionsAwaitingReview,
      tasksApprovedToday,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.STUDENT, status: ACCOUNT_STATUS.ACTIVE }),
      Task.countDocuments({ status: TASK_STATUS.PUBLISHED }),
      Submission.countDocuments({ status: SUBMISSION_STATUS.SUBMITTED }),
      TaskReview.countDocuments({
        decision: 'approved',
        reviewedAt: { $gte: startOfToday },
      }),
    ]);

    // Overdue tasks: find student tasks where task deadline < now and status != 'approved'
    const overdueStudentTasks = await StudentTask.find({
      status: { $ne: STUDENT_TASK_STATUS.APPROVED },
    }).populate({
      path: 'task',
      match: { deadline: { $ne: null, $lt: now } },
    });

    const overdueCount = overdueStudentTasks.filter((st) => st.task !== null).length;

    // Recently submitted work (latest 5)
    const recentlySubmitted = await Submission.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('student', 'name registerNumber')
      .populate('task', 'taskNumber title');

    // Students falling behind:
    // Active students with either overdue tasks OR status === 'changes_requested' OR assigned for > 3 days without submission
    const activeStudentList = await User.find({
      role: ROLES.STUDENT,
      status: ACCOUNT_STATUS.ACTIVE,
    });

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const fallingBehindStudents = [];

    for (const student of activeStudentList) {
      // Find latest assigned task
      const latestTask = await StudentTask.findOne({ student: student._id })
        .populate('task')
        .sort({ 'task.taskNumber': -1 });

      if (latestTask && latestTask.status !== STUDENT_TASK_STATUS.APPROVED) {
        const isOverdue =
          latestTask.task?.deadline && new Date(latestTask.task.deadline) < now;
        const isStalled =
          latestTask.status === STUDENT_TASK_STATUS.ASSIGNED &&
          new Date(latestTask.unlockedAt) < threeDaysAgo;
        const needsCorrection =
          latestTask.status === STUDENT_TASK_STATUS.CHANGES_REQUESTED;

        if (isOverdue || isStalled || needsCorrection) {
          fallingBehindStudents.push({
            student: {
              _id: student._id,
              name: student.name,
              registerNumber: student.registerNumber,
            },
            currentTaskNumber: latestTask.task?.taskNumber,
            currentTaskTitle: latestTask.task?.title,
            status: latestTask.status,
            reason: isOverdue
              ? 'Deadline passed'
              : needsCorrection
              ? 'Corrections pending'
              : 'Stalled on task for over 3 days',
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        tasksPublished,
        submissionsAwaitingReview,
        tasksApprovedToday,
        overdueCount,
        recentlySubmitted,
        fallingBehindStudents: fallingBehindStudents.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};

