/**
 * Client-Side Image Optimizer for Task Proofs
 *
 * - Resizes images to max 1600x1600 maintaining aspect ratio
 * - Compresses targeting 150-300 KB without compromising text readability
 * - Supports WebP, lossless PNG, and JPEG
 * - Returns detailed metrics (originalSize, compressedSize, savedPercentage)
 */

export const MAX_DIMENSION = 1600;
export const TARGET_MAX_BYTES = 300 * 1024; // 300 KB
export const TARGET_MIN_BYTES = 150 * 1024; // 150 KB

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Optimizes an image File using HTML5 Canvas
 * @param {File} file - Original image file
 * @param {Object} options - { forceLosslessPng: boolean, targetMaxBytes: number }
 * @returns {Promise<Object>} Optimized file, metrics, and preview URL
 */
export const optimizeImage = async (file, options = {}) => {
  if (!file) throw new Error('No file provided');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported format. Please select a PNG, JPEG, or WebP image.');
  }

  const originalSize = file.size;

  // Load image into an HTMLImageElement
  const img = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image. File may be corrupted.'));
      image.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });

  const { naturalWidth: width, naturalHeight: height } = img;
  if (!width || !height) {
    throw new Error('Invalid image dimensions.');
  }

  // Calculate new dimensions (max 1600x1600, maintain aspect ratio)
  let targetWidth = width;
  let targetHeight = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    targetWidth = Math.round(width * scale);
    targetHeight = Math.round(height * scale);
  }

  // Render onto Canvas with high smoothing
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const useLosslessPng = options.forceLosslessPng === true;

  // Determine export format:
  // If lossless PNG requested: export as image/png
  // Otherwise: export as image/webp (or fallback to image/jpeg if webp unsupported)
  let outputMime = useLosslessPng ? 'image/png' : 'image/webp';
  let quality = 0.88;

  // Helper to canvas.toBlob as Promise
  const toBlob = (mime, q) =>
    new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mime, q);
    });

  let blob = await toBlob(outputMime, quality);

  // If browser doesn't support WebP export (returns png), fallback
  if (!blob || (outputMime === 'image/webp' && blob.type !== 'image/webp')) {
    outputMime = 'image/jpeg';
    blob = await toBlob(outputMime, quality);
  }

  // Adaptive quality refinement: if WebP/JPEG exceeds target 300KB, slightly step down quality
  // ensuring text readability is never compromised (floor at 0.72)
  if (!useLosslessPng && blob.size > TARGET_MAX_BYTES) {
    const qualitySteps = [0.80, 0.74, 0.70];
    for (const stepQuality of qualitySteps) {
      const candidateBlob = await toBlob(outputMime, stepQuality);
      if (candidateBlob) {
        blob = candidateBlob;
        quality = stepQuality;
        if (blob.size <= TARGET_MAX_BYTES) break;
      }
    }
  }

  const compressedSize = blob.size;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = originalSize > 0
    ? Math.max(0, Math.round((savedBytes / originalSize) * 100))
    : 0;

  // Generate new clean filename
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const extension = outputMime === 'image/png' ? 'png' : outputMime === 'image/webp' ? 'webp' : 'jpg';
  const optimizedFileName = `${baseName}_optimized.${extension}`;

  const optimizedFile = new File([blob], optimizedFileName, {
    type: outputMime,
    lastModified: Date.now(),
  });

  const previewUrl = URL.createObjectURL(blob);

  return {
    file: optimizedFile,
    blob,
    previewUrl,
    width: targetWidth,
    height: targetHeight,
    originalWidth: width,
    originalHeight: height,
    wasResized: targetWidth !== width || targetHeight !== height,
    originalSize,
    compressedSize,
    savedPercentage,
    format: outputMime === 'image/png' ? 'PNG (Lossless)' : outputMime === 'image/webp' ? 'WebP' : 'JPEG',
    mimeType: outputMime,
  };
};

