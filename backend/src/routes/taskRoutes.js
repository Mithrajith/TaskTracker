import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  publishTask,
  getEligibleStudents,
  deleteTask,
  backfillTaskAssignments,
} from '../controllers/taskController.js';
import { authenticate, requireRole, requirePasswordChanged } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requirePasswordChanged);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);

// Admin-only endpoints
router.post('/', requireRole(ROLES.ADMIN), createTask);
router.put('/:id', requireRole(ROLES.ADMIN), updateTask);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteTask);
router.post('/:id/publish', requireRole(ROLES.ADMIN), publishTask);
router.post('/:id/backfill', requireRole(ROLES.ADMIN), backfillTaskAssignments);
router.get('/:id/eligible-students', requireRole(ROLES.ADMIN), getEligibleStudents);

export default router;

