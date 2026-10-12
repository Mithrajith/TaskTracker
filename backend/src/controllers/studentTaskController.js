import StudentTask from '../models/StudentTask.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import TaskReview from '../models/TaskReview.js';
import { TASK_STATUS, STUDENT_TASK_STATUS } from '../config/constants.js';
import { getStudentProgressionStats } from '../services/progressionService.js';

export const getMyTasks = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Get all assigned tasks for this student
    const assignedTasks = await StudentTask.find({ student: studentId })
      .populate('task')
      .sort({ 'task.taskNumber': 1 });

    const assignedTaskIds = assignedTasks
      .map((at) => at.task?._id?.toString())
      .filter(Boolean);

    // Get all published tasks to identify locked upcoming tasks
    const allPublishedTasks = await Task.find({ status: TASK_STATUS.PUBLISHED }).sort({
      taskNumber: 1,
    });

    // Populate submissions and reviews for each assigned task
    const assignedWithDetails = await Promise.all(
      assignedTasks.map(async (st) => {
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

    // Find locked tasks that are published but not yet unlocked for this student
    const lockedTasks = allPublishedTasks
      .filter((t) => !assignedTaskIds.includes(t._id.toString()))
      .map((t) => ({
        _id: t._id,
        taskNumber: t.taskNumber,
        title: t.title,
        description: t.description,
        status: 'locked',
        lockReason: `Task ${t.taskNumber - 1} must be completed and approved by your mentor before unlocking Task ${t.taskNumber}.`,
      }));

    // Overall progression stats
    const stats = await getStudentProgressionStats(studentId);

    res.json({
      success: true,
      data: {
        assignedTasks: assignedWithDetails,
        lockedTasks,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentTask = await StudentTask.findById(id).populate('task');

    if (!studentTask) {
      return res.status(404).json({
        success: false,
        message: 'Assigned task not found',
      });
    }

    // Ownership check: Students can only view their own student tasks
    if (
      req.user.role === 'student' &&
      studentTask.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this student task',
      });
    }

    const submissions = await Submission.find({ studentTask: studentTask._id })
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

    res.json({
      success: true,
      data: {
        ...studentTask.toJSON(),
        submissions: submissionsWithReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCheckbox = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isStudentCompleted } = req.body;

    const studentTask = await StudentTask.findById(id);
    if (!studentTask) {
      return res.status(404).json({
        success: false,
        message: 'Assigned task not found',
      });
    }

    // Ownership check
    if (studentTask.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own tasks',
      });
    }

    // Cannot check box on approved tasks
    if (studentTask.status === STUDENT_TASK_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'This task has already been approved',
      });
    }

    studentTask.isStudentCompleted =
      typeof isStudentCompleted === 'boolean'
        ? isStudentCompleted
        : !studentTask.isStudentCompleted;

    if (
      studentTask.isStudentCompleted &&
      studentTask.status === STUDENT_TASK_STATUS.ASSIGNED
    ) {
      studentTask.status = STUDENT_TASK_STATUS.IN_PROGRESS;
    }

    await studentTask.save();

    res.json({
      success: true,
      message: studentTask.isStudentCompleted
        ? 'Practical checklist marked as completed'
        : 'Practical checklist unchecked',
      data: studentTask.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

