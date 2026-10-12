import mongoose from 'mongoose';
import StudentTask from '../models/StudentTask.js';
import Submission from '../models/Submission.js';
import TaskReview from '../models/TaskReview.js';
import { STUDENT_TASK_STATUS, SUBMISSION_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import { validateImageBuffer } from '../utils/fileValidation.js';
import { processAndOptimizeImage } from '../services/imageService.js';
import { uploadFileToGridFS, deleteFileFromGridFS } from '../services/gridfsService.js';
import { logAudit } from '../utils/auditLogger.js';

export const submitTask = async (req, res, next) => {
  let uploadedGridFSFileId = null;

  try {
    const { studentTaskId, githubUrl, explanation, preserveLossless } = req.body;
    const file = req.file;

    if (!studentTaskId) {
      return res.status(400).json({
        success: false,
        message: 'studentTaskId is required',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Proof image file is required',
      });
    }

    // Verify student task exists and belongs to this student
    const studentTask = await StudentTask.findById(studentTaskId).populate('task');
    if (!studentTask) {
      return res.status(404).json({
        success: false,
        message: 'Assigned task not found',
      });
    }

    if (studentTask.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only submit your own tasks',
      });
    }

    if (studentTask.status === STUDENT_TASK_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'This task is already approved and completed. Resubmission is closed.',
      });
    }

    // Validate and optimize image: resize to max 1600x1600, compress to WebP/PNG, target 150-300KB
    let optimized;
    try {
      optimized = await processAndOptimizeImage(file.buffer, file.originalname, {
        preserveLossless: preserveLossless === 'true' || preserveLossless === true,
      });
    } catch (optError) {
      return res.status(400).json({
        success: false,
        message: optError.message || 'Image processing and validation failed',
      });
    }

    // Determine submission version: count previous submissions for this student task
    const previousSubmissionsCount = await Submission.countDocuments({
      studentTask: studentTask._id,
    });
    const newVersion = previousSubmissionsCount + 1;

    // Stream optimized image buffer directly into GridFS
    const uploadResult = await uploadFileToGridFS({
      buffer: optimized.buffer,
      originalName: file.originalname,
      mimeType: optimized.mimeType,
      metadata: {
        studentId: req.user._id,
        taskId: studentTask.task._id,
        studentTaskId: studentTask._id,
        version: newVersion,
        width: optimized.width,
        height: optimized.height,
        originalSize: optimized.originalSize,
        compressedSize: optimized.compressedSize,
        savedPercentage: optimized.savedPercentage,
        format: optimized.extension,
      },
    });

    uploadedGridFSFileId = uploadResult.fileId;

    // Create Submission document
    const submission = await Submission.create({
      studentTask: studentTask._id,
      student: req.user._id,
      task: studentTask.task._id,
      version: newVersion,
      fileId: uploadResult.fileId,
      fileName: file.originalname,
      fileMimeType: optimized.mimeType,
      fileSize: optimized.compressedSize,
      width: optimized.width,
      height: optimized.height,
      originalSize: optimized.originalSize,
      compressedSize: optimized.compressedSize,
      savedPercentage: optimized.savedPercentage,
      format: optimized.extension,
      githubUrl: (githubUrl || '').trim(),
      explanation: (explanation || '').trim(),
      status: SUBMISSION_STATUS.SUBMITTED,
      submittedAt: new Date(),
    });

    // Update StudentTask state to submitted
    studentTask.status = STUDENT_TASK_STATUS.SUBMITTED;
    studentTask.isStudentCompleted = true;
    studentTask.currentSubmission = submission._id;
    await studentTask.save();

    await logAudit({
      actorId: req.user._id,
      action: AUDIT_ACTIONS.SUBMISSION_CREATED,
      resourceType: 'Submission',
      resourceId: submission._id,
      metadata: {
        taskNumber: studentTask.task.taskNumber,
        version: newVersion,
        fileName: file.originalname,
      },
    });

    res.status(201).json({
      success: true,
      message: `Work submitted successfully (Version ${newVersion})! Your mentor will review it shortly.`,
      data: submission.toJSON(),
    });
  } catch (error) {
    // Cleanup orphaned GridFS file if error happened after GridFS upload
    if (uploadedGridFSFileId) {
      await deleteFileFromGridFS(uploadedGridFSFileId);
    }
    next(error);
  }
};

export const getSubmissionsForTask = async (req, res, next) => {
  try {
    const { studentTaskId } = req.params;

    const studentTask = await StudentTask.findById(studentTaskId);
    if (!studentTask) {
      return res.status(404).json({
        success: false,
        message: 'Assigned task not found',
      });
    }

    // Ownership check: Admin or the student
    if (
      req.user.role === 'student' &&
      studentTask.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these submissions',
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
      data: submissionsWithReviews,
    });
  } catch (error) {
    next(error);
  }
};

