import express from 'express';
import {
  getPendingReviews,
  approveSubmission,
  requestChanges,
  rejectSubmission,
  bulkApproveSubmissions,
  bulkRejectSubmissions,
} from '../controllers/reviewController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.get('/pending', getPendingReviews);
// Bulk routes must be registered before the /:submissionId/* routes so that
// "bulk" is not captured as a submissionId.
router.post('/bulk/approve', bulkApproveSubmissions);
router.post('/bulk/reject', bulkRejectSubmissions);
router.post('/:submissionId/approve', approveSubmission);
router.post('/:submissionId/request-changes', requestChanges);
router.post('/:submissionId/reject', rejectSubmission);

export default router;

