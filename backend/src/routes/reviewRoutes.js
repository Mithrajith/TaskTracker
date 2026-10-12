import express from 'express';
import {
  getPendingReviews,
  approveSubmission,
  requestChanges,
  rejectSubmission,
} from '../controllers/reviewController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.get('/pending', getPendingReviews);
router.post('/:submissionId/approve', approveSubmission);
router.post('/:submissionId/request-changes', requestChanges);
router.post('/:submissionId/reject', rejectSubmission);

export default router;

