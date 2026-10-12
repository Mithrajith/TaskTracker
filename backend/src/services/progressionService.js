import mongoose from 'mongoose';
import Task from '../models/Task.js';
import StudentTask from '../models/StudentTask.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import {
  ROLES,
  ACCOUNT_STATUS,
  TASK_STATUS,
  STUDENT_TASK_STATUS,
} from '../config/constants.js';

/**
 * Calculates comprehensive task statistics for a student
 */
export const getStudentProgressionStats = async (studentId) => {
  const studentTasks = await StudentTask.find({ student: studentId })
    .populate('task')
    .sort({ 'task.taskNumber': 1 });

  const assignedTasksCount = studentTasks.length;
  let approvedTasksCount = 0;
  let submittedTasksCount = 0;
  let awaitingReviewCount = 0;
  let requiringCorrectionsCount = 0;
  let overdueTasksCount = 0;

  const now = new Date();
  let latestAssignedTask = null;
  let highestTaskNumber = 0;

  for (const st of studentTasks) {
    if (!st.task) continue;

    if (st.task.taskNumber > highestTaskNumber) {
      highestTaskNumber = st.task.taskNumber;
      latestAssignedTask = st;
    }

    if (st.status === STUDENT_TASK_STATUS.APPROVED) {
      approvedTasksCount += 1;
    } else if (st.status === STUDENT_TASK_STATUS.SUBMITTED) {
      submittedTasksCount += 1;
      awaitingReviewCount += 1;
    } else if (st.status === STUDENT_TASK_STATUS.CHANGES_REQUESTED) {
      requiringCorrectionsCount += 1;
    }

    // Check overdue: deadline passed and not approved
    if (
      st.task.deadline &&
      new Date(st.task.deadline) < now &&
      st.status !== STUDENT_TASK_STATUS.APPROVED
    ) {
      overdueTasksCount += 1;
    }
  }

  const approvedPercentage =
    assignedTasksCount > 0
      ? Math.round((approvedTasksCount / assignedTasksCount) * 100)
      : 0;

  // Retrieve latest submission for latest proof image preview
  let latestSubmission = null;
  if (latestAssignedTask) {
    latestSubmission = await Submission.findOne({
      student: studentId,
    })
      .sort({ createdAt: -1 })
      .populate('task', 'title taskNumber');
  }

  return {
    studentId,
    currentTaskNumber: highestTaskNumber, // 0 for brand new students with 0 tasks
    currentTaskTitle: latestAssignedTask?.task?.title || 'No tasks assigned yet',
    currentTaskStatus: latestAssignedTask?.status || 'none',
    assignedTasksCount,
    approvedTasksCount,
    submittedTasksCount,
    awaitingReviewCount,
    requiringCorrectionsCount,
    overdueTasksCount,
    approvedPercentage,
    latestAssignedTask,
    latestSubmission,
  };
};

/**
 * Returns eligible active students for a given task number
 */
export const getEligibleStudentsForTask = async (taskNumber) => {
  // Task 1: Eligible students are active students who have NOT been assigned Task 1 yet
  if (taskNumber === 1) {
    const task1 = await Task.findOne({ taskNumber: 1 });
    if (!task1) return [];

    const assignedStudentIds = await StudentTask.distinct('student', {
      task: task1._id,
    });

    const eligibleStudents = await User.find({
      role: ROLES.STUDENT,
      status: ACCOUNT_STATUS.ACTIVE,
      _id: { $nin: assignedStudentIds },
    }).select('name registerNumber githubRepoUrl status');

    return eligibleStudents;
  }

  // Task N > 1: Eligible students are active students who:
  // 1. Have Task N-1 APPROVED
  // 2. Have NOT been assigned Task N yet
  const prevTask = await Task.findOne({ taskNumber: taskNumber - 1 });
  const currentTask = await Task.findOne({ taskNumber });

  if (!prevTask || !currentTask) return [];

  // Students who completed prev task
  const approvedPrevStudentIds = await StudentTask.distinct('student', {
    task: prevTask._id,
    status: STUDENT_TASK_STATUS.APPROVED,
  });

  // Students who already have current task
  const alreadyAssignedStudentIds = await StudentTask.distinct('student', {
    task: currentTask._id,
  });

  const eligibleStudentIds = approvedPrevStudentIds.filter(
    (id) => !alreadyAssignedStudentIds.some((assignedId) => assignedId.equals(id))
  );

  const eligibleStudents = await User.find({
    _id: { $in: eligibleStudentIds },
    role: ROLES.STUDENT,
    status: ACCOUNT_STATUS.ACTIVE,
  }).select('name registerNumber githubRepoUrl status');

  return eligibleStudents;
};

/**
 * Assigns a published task to all currently eligible students
 */
export const assignTaskToEligibleStudents = async (taskDoc) => {
  if (taskDoc.status !== TASK_STATUS.PUBLISHED) {
    throw new Error('Cannot assign draft tasks to students');
  }

  const eligibleStudents = await getEligibleStudentsForTask(taskDoc.taskNumber);
  const assigned = [];

  for (const student of eligibleStudents) {
    try {
      // Use upsert or findOneAndUpdate to prevent duplicate assignments
      const studentTask = await StudentTask.findOneAndUpdate(
        {
          student: student._id,
          task: taskDoc._id,
        },
        {
          $setOnInsert: {
            student: student._id,
            task: taskDoc._id,
            status: STUDENT_TASK_STATUS.ASSIGNED,
            unlockedAt: new Date(),
            isStudentCompleted: false,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      assigned.push({ studentId: student._id, studentTaskId: studentTask._id });
    } catch (err) {
      console.error(`Error assigning task ${taskDoc.taskNumber} to student ${student._id}:`, err.message);
    }
  }

  return {
    eligibleCount: eligibleStudents.length,
    assignedCount: assigned.length,
    assigned,
  };
};

/**
 * Unlocks the next task for a student when their current task is approved
 */
export const unlockNextTaskForStudent = async (studentId, currentTaskNumber) => {
  const nextTaskNumber = currentTaskNumber + 1;
  const nextTask = await Task.findOne({
    taskNumber: nextTaskNumber,
    status: TASK_STATUS.PUBLISHED,
  });

  // If next task does not exist or is still a draft, nothing to unlock yet
  if (!nextTask) {
    return {
      unlocked: false,
      reason: `Task ${nextTaskNumber} is not yet published by the mentor`,
      nextTask: null,
    };
  }

  // Atomically create or fetch next student task
  const studentTask = await StudentTask.findOneAndUpdate(
    {
      student: studentId,
      task: nextTask._id,
    },
    {
      $setOnInsert: {
        student: studentId,
        task: nextTask._id,
        status: STUDENT_TASK_STATUS.ASSIGNED,
        unlockedAt: new Date(),
        isStudentCompleted: false,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return {
    unlocked: true,
    nextTask,
    studentTask,
  };
};
