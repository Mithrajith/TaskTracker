import mongoose from 'mongoose';
import { SUBMISSION_STATUS } from '../config/constants.js';

const submissionSchema = new mongoose.Schema(
  {
    studentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentTask',
      required: true,
      index: true,
    },
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
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileMimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    originalSize: {
      type: Number,
    },
    compressedSize: {
      type: Number,
    },
    savedPercentage: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.SUBMITTED,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ studentTask: 1, version: -1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;

