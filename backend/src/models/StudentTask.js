import mongoose from 'mongoose';
import { STUDENT_TASK_STATUS } from '../config/constants.js';

const studentTaskSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(STUDENT_TASK_STATUS),
      default: STUDENT_TASK_STATUS.ASSIGNED,
      index: true,
    },
    isStudentCompleted: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    currentSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique assignment: a student can have at most one StudentTask per Task
studentTaskSchema.index({ student: 1, task: 1 }, { unique: true });
studentTaskSchema.index({ student: 1, status: 1 });

const StudentTask = mongoose.model('StudentTask', studentTaskSchema);
export default StudentTask;

