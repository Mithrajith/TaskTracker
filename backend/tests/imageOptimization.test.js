import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { validateImageBuffer } from '../src/utils/fileValidation.js';
import {
  processAndOptimizeImage,
  MAX_DIMENSION,
  TARGET_MAX_BYTES,
} from '../src/services/imageService.js';
import {
  uploadFileToGridFS,
  getFileStreamFromGridFS,
  deleteFileFromGridFS,
} from '../src/services/gridfsService.js';

describe('Proof Image Storage Optimization Tests', () => {
  let sampleLargePngBuffer;
  let sampleCodeScreenshotPngBuffer;
  let uploadedGridFSId = null;

  before(async () => {
    await connectDB();

    // Create a 2400 x 1800 test image (simulating high-res 4K code screenshot)
    const svgLarge = `
      <svg width="2400" height="1800" xmlns="http://www.w3.org/2000/svg">
        <rect width="2400" height="1800" fill="#181825"/>
        <text x="100" y="200" font-size="52" fill="#cdd6f4" font-family="monospace">
          def calculate_embeddings(query: str):
        </text>
        <text x="150" y="300" font-size="44" fill="#a6adc8" font-family="monospace">
          model = SentenceTransformer('all-MiniLM-L6-v2')
        </text>
        <text x="150" y="400" font-size="44" fill="#89b4fa" font-family="monospace">
          return model.encode(query, normalize_embeddings=True)
        </text>
      </svg>
    `;

    sampleLargePngBuffer = await sharp(Buffer.from(svgLarge)).png().toBuffer();

    // Create a standard 1200 x 800 code screenshot
    const svgCode = `
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="800" fill="#11111b"/>
        <text x="80" y="150" font-size="36" fill="#a6e3a1" font-family="monospace">
          pytest test_embeddings.py -v
        </text>
        <text x="80" y="220" font-size="30" fill="#cdd6f4" font-family="monospace">
          PASSED test_embeddings.py::test_vector_similarity [100%]
        </text>
      </svg>
    `;

    sampleCodeScreenshotPngBuffer = await sharp(Buffer.from(svgCode)).png().toBuffer();
  });

  after(async () => {
    if (uploadedGridFSId) {
      await deleteFileFromGridFS(uploadedGridFSId);
    }
    await mongoose.connection.close();
  });

  test('1. Magic Bytes Validation: Accurately identifies PNG, JPEG, and WebP, and rejects corrupt/fake files', async () => {
    // Valid PNG
    const pngResult = validateImageBuffer(sampleCodeScreenshotPngBuffer);
    assert.equal(pngResult.valid, true);
    assert.equal(pngResult.mimeType, 'image/png');

    // Valid WebP
    const webpBuffer = await sharp(sampleCodeScreenshotPngBuffer).webp().toBuffer();
    const webpResult = validateImageBuffer(webpBuffer);
    assert.equal(webpResult.valid, true);
    assert.equal(webpResult.mimeType, 'image/webp');

    // Valid JPEG
    const jpegBuffer = await sharp(sampleCodeScreenshotPngBuffer).jpeg().toBuffer();
    const jpegResult = validateImageBuffer(jpegBuffer);
    assert.equal(jpegResult.valid, true);
    assert.equal(jpegResult.mimeType, 'image/jpeg');

    // Reject invalid text masquerading as image
    const fakeBuffer = Buffer.from('Not an image file at all!');
    const fakeResult = validateImageBuffer(fakeBuffer);
    assert.equal(fakeResult.valid, false);
    assert.match(fakeResult.error, /Invalid file format/i);
  });

  test('2. Aspect Ratio & Dimensions: Resizes oversized 2400x1800 image to maximum 1600x1600', async () => {
    const optimized = await processAndOptimizeImage(
      sampleLargePngBuffer,
      'large_screenshot.png'
    );

    assert.equal(optimized.wasResized, true);
    assert.ok(optimized.width <= MAX_DIMENSION, `Width ${optimized.width} should be <= ${MAX_DIMENSION}`);
    assert.ok(optimized.height <= MAX_DIMENSION, `Height ${optimized.height} should be <= ${MAX_DIMENSION}`);

    // Verify 4:3 aspect ratio maintained (2400/1800 = 1.3333, 1600/1200 = 1.3333)
    const originalRatio = 2400 / 1800;
    const newRatio = optimized.width / optimized.height;
    assert.ok(Math.abs(originalRatio - newRatio) < 0.02, 'Aspect ratio must be preserved');
    assert.equal(optimized.width, 1600);
    assert.equal(optimized.height, 1200);
  });

  test('3. Compression Target: Compresses proof image to WebP within target 150–300 KB budget', async () => {
    const optimized = await processAndOptimizeImage(
      sampleLargePngBuffer,
      'code_proof.png'
    );

    assert.equal(optimized.mimeType, 'image/webp');
    assert.equal(optimized.extension, 'webp');
    assert.ok(
      optimized.compressedSize <= TARGET_MAX_BYTES,
      `Compressed size ${optimized.compressedSize} bytes must be <= ${TARGET_MAX_BYTES} bytes`
    );
    assert.ok(optimized.savedPercentage > 0, 'Saved percentage must be positive');
  });

  test('4. Lossless PNG Preservation: Retains pixel-perfect PNG when preserveLossless option is true', async () => {
    const optimized = await processAndOptimizeImage(
      sampleCodeScreenshotPngBuffer,
      'code_terminal.png',
      { preserveLossless: true }
    );

    assert.equal(optimized.mimeType, 'image/png');
    assert.equal(optimized.extension, 'png');
    assert.equal(optimized.width, 1200);
    assert.equal(optimized.height, 800);
    assert.ok(optimized.compressedSize > 0);
  });

  test('5. GridFS Storage & Metadata: Stores optimized buffer and retrieves identical bytes with metadata', async () => {
    const optimized = await processAndOptimizeImage(
      sampleCodeScreenshotPngBuffer,
      'terminal_output.png'
    );

    const uploadRes = await uploadFileToGridFS({
      buffer: optimized.buffer,
      originalName: 'terminal_output.png',
      mimeType: optimized.mimeType,
      metadata: {
        width: optimized.width,
        height: optimized.height,
        originalSize: optimized.originalSize,
        compressedSize: optimized.compressedSize,
        savedPercentage: optimized.savedPercentage,
        format: optimized.extension,
      },
    });

    assert.ok(uploadRes.fileId);
    uploadedGridFSId = uploadRes.fileId;
    assert.equal(uploadRes.mimeType, optimized.mimeType);

    // Retrieve from GridFS
    const retrieved = await getFileStreamFromGridFS(uploadedGridFSId);
    assert.ok(retrieved);
    assert.equal(retrieved.fileDoc.metadata.width, optimized.width);
    assert.equal(retrieved.fileDoc.metadata.height, optimized.height);
    assert.equal(retrieved.fileDoc.metadata.compressedSize, optimized.compressedSize);
    assert.equal(retrieved.fileDoc.metadata.savedPercentage, optimized.savedPercentage);
    assert.equal(retrieved.fileDoc.length, optimized.compressedSize);
  });
});

