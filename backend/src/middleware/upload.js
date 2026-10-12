import multer from 'multer';
import { UPLOAD_CONFIG } from '../config/constants.js';

const storage = multer.memoryStorage();

export const uploadProof = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES, // 3MB limit
  },
  fileFilter: (req, file, cb) => {
    if (UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Supported formats are JPEG, PNG, and WebP.'
        )
      );
    }
  },
});

export const uploadCsv = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/plain' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (isCsv) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a .csv file.'));
    }
  },
});


