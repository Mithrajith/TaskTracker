import express from 'express';
import { createUser } from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.post('/', createUser);

export default router;
