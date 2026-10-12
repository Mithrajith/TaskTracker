import express from 'express';
import { getProofImage } from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/:fileId', getProofImage);

export default router;

