import { UPLOAD_CONFIG } from '../config/constants.js';

/**
 * Validates file buffer against allowed MIME types and magic bytes.
 * Returns { valid: true, mimeType } or { valid: false, error }
 */
export const validateImageBuffer = (buffer, reportedMimeType) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { valid: false, error: 'No image buffer provided' };
  }

  if (buffer.length > UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  // Check magic bytes
  let detectedMime = null;

  // JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    detectedMime = 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  else if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detectedMime = 'image/png';
  }
  // WebP: RIFF (bytes 0-3: 52 49 46 46) and WEBP (bytes 8-11: 57 45 42 50)
  else if (
    buffer.length >= 12 &&
    buffer.toString('utf8', 0, 4) === 'RIFF' &&
    buffer.toString('utf8', 8, 12) === 'WEBP'
  ) {
    detectedMime = 'image/webp';
  }

  if (!detectedMime) {
    return {
      valid: false,
      error: 'Invalid file format. Only valid JPEG, PNG, or WebP images are allowed.',
    };
  }

  if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(detectedMime)) {
    return {
      valid: false,
      error: `File format ${detectedMime} is not allowed. Supported formats: JPEG, PNG, WebP.`,
    };
  }

  return { valid: true, mimeType: detectedMime };
};

