import sharp from 'sharp';
import { validateImageBuffer } from '../utils/fileValidation.js';

export const MAX_DIMENSION = 1600;
export const TARGET_MAX_BYTES = 300 * 1024; // 300 KB
export const TARGET_MIN_BYTES = 150 * 1024; // 150 KB

/**
 * Validates, resizes (max 1600x1600), and compresses an image buffer.
 * Targets 150-300 KB while preserving text readability for code screenshots.
 *
 * @param {Buffer} buffer - Raw file buffer from Multer
 * @param {string} originalFilename - Original filename
 * @param {Object} options - { preserveLossless: boolean, format: string }
 * @returns {Promise<Object>} Optimized buffer and metadata
 */
export const processAndOptimizeImage = async (
  buffer,
  originalFilename = 'proof.png',
  options = {}
) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid image buffer provided');
  }

  // 1. Magic bytes validation (PNG, JPEG, WebP)
  const validation = validateImageBuffer(buffer);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Extract dimensions and metadata with sharp
  const image = sharp(buffer, { failOnError: true });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to extract image dimensions');
  }

  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  const originalSize = buffer.length;
  const originalFormat = metadata.format; // 'jpeg', 'png', 'webp'

  // 3. Resize if width or height exceeds 1600px while maintaining aspect ratio
  const needsResize =
    originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION;

  let pipeline = sharp(buffer);
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // 4. Format & Compression strategy
  const preferLosslessPng =
    options.preserveLossless === true || options.format === 'png';

  let optimizedBuffer;
  let finalMimeType;
  let finalExtension;

  if (preferLosslessPng && (originalFormat === 'png' || options.format === 'png')) {
    // Lossless PNG for crisp code screenshot readability
    optimizedBuffer = await pipeline
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
    finalMimeType = 'image/png';
    finalExtension = 'png';
  } else {
    // Default: WebP for optimal compression & text edge retention
    let quality = 85;
    let webpBuffer = await pipeline
      .webp({
        quality,
        effort: 4,
      })
      .toBuffer();

    // If still > 300 KB, adaptive compression without degrading code readability
    if (webpBuffer.length > TARGET_MAX_BYTES) {
      const fallbackQualities = [78, 72];
      for (const q of fallbackQualities) {
        const nextBuffer = await sharp(buffer)
          .resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: q, effort: 4 })
          .toBuffer();

        webpBuffer = nextBuffer;
        if (webpBuffer.length <= TARGET_MAX_BYTES) break;
      }
    }

    optimizedBuffer = webpBuffer;
    finalMimeType = 'image/webp';
    finalExtension = 'webp';
  }

  // 5. Compute final metrics
  const finalMeta = await sharp(optimizedBuffer).metadata();
  const compressedSize = optimizedBuffer.length;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage =
    originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return {
    buffer: optimizedBuffer,
    mimeType: finalMimeType,
    extension: finalExtension,
    width: finalMeta.width,
    height: finalMeta.height,
    originalWidth,
    originalHeight,
    wasResized: needsResize,
    originalSize,
    compressedSize,
    savedPercentage,
  };
};

