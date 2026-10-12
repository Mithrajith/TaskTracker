import express from 'express';
import {
  getMyTasks,
  getStudentTaskById,
  toggleCheckbox,
} from '../controllers/studentTaskController.js';
import { authenticate, requireRole, requirePasswordChanged } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requirePasswordChanged);

router.get('/', requireRole(ROLES.STUDENT), getMyTasks);
router.get('/:id', getStudentTaskById);
router.patch('/:id/toggle-checkbox', requireRole(ROLES.STUDENT), toggleCheckbox);

export default router;

