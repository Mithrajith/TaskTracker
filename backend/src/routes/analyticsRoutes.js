import express from 'express';
import { getOverview } from '../controllers/analyticsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.get('/overview', getOverview);

export default router;

