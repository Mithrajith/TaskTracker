import express from 'express';
import {
  submitTask,
  getSubmissionsForTask,
} from '../controllers/submissionController.js';
import { authenticate, requireRole, requirePasswordChanged } from '../middleware/auth.js';
import { uploadProof } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requirePasswordChanged);

router.post(
  '/',
  requireRole(ROLES.STUDENT),
  uploadProof.single('proofImage'),
  submitTask
);

router.get('/student-task/:studentTaskId', getSubmissionsForTask);

export default router;

