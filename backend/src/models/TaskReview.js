import mongoose from 'mongoose';
import { REVIEW_DECISION } from '../config/constants.js';

const taskReviewSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    studentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentTask',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: Object.values(REVIEW_DECISION),
      required: [true, 'Review decision is required'],
      index: true,
    },
    feedback: {
      type: String,
      required: [true, 'Meaningful mentor feedback is required'],
      trim: true,
      minlength: [5, 'Feedback must be at least 5 characters'],
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TaskReview = mongoose.model('TaskReview', taskReviewSchema);
export default TaskReview;

