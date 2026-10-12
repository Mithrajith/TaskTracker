import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  resetPassword,
  toggleStudentStatus,
  deleteStudent,
  importStudentsFromCSV,
} from '../controllers/studentController.js';
import { authenticate, requireRole, requirePasswordChanged } from '../middleware/auth.js';
import { uploadCsv } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// Admin-only endpoints
router.get('/', requireRole(ROLES.ADMIN), getAllStudents);
router.post('/', requireRole(ROLES.ADMIN), createStudent);
router.post(
  '/import-csv',
  requireRole(ROLES.ADMIN),
  uploadCsv.single('file'),
  importStudentsFromCSV
);
router.put('/:id', requireRole(ROLES.ADMIN), updateStudent);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteStudent);
router.post('/:id/reset-password', requireRole(ROLES.ADMIN), resetPassword);
router.patch('/:id/toggle-status', requireRole(ROLES.ADMIN), toggleStudentStatus);

// Student or Admin can view student profile by ID
router.get('/:id', requirePasswordChanged, getStudentById);

export default router;

