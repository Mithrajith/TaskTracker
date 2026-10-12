import mongoose from 'mongoose';
import crypto from 'crypto';
import { Readable } from 'stream';
import { getGridFSBucket } from '../config/db.js';

export const uploadFileToGridFS = async ({
  buffer,
  originalName,
  mimeType,
  metadata = {},
}) => {
  const bucket = getGridFSBucket();
  if (!bucket) {
    throw new Error('GridFS bucket is not initialized');
  }

  // Generate randomized storage identifier
  const extension = originalName.includes('.')
    ? originalName.split('.').pop().toLowerCase()
    : 'bin';
  const randomStorageName = `${crypto.randomUUID()}.${extension}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(randomStorageName, {
      contentType: mimeType,
      metadata: {
        originalName,
        uploadedAt: new Date(),
        ...metadata,
      },
    });

    const readable = Readable.from(buffer);

    readable.on('error', (err) => {
      reject(err);
    });

    uploadStream.on('error', (err) => {
      reject(err);
    });

    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id,
        storageFilename: randomStorageName,
        size: buffer.length,
        mimeType,
      });
    });

    readable.pipe(uploadStream);
  });
};

export const getFileStreamFromGridFS = async (fileId) => {
  const bucket = getGridFSBucket();
  if (!bucket) {
    throw new Error('GridFS bucket is not initialized');
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error('Invalid file ID format');
  }

  const objectId = new mongoose.Types.ObjectId(fileId);
  const files = await bucket.find({ _id: objectId }).toArray();

  if (!files || files.length === 0) {
    return null;
  }

  const fileDoc = files[0];
  const downloadStream = bucket.openDownloadStream(objectId);

  return {
    fileDoc,
    downloadStream,
  };
};

export const deleteFileFromGridFS = async (fileId) => {
  const bucket = getGridFSBucket();
  if (!bucket) {
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return;
  }

  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
  } catch (error) {
    console.error(`Error deleting file ${fileId} from GridFS:`, error.message);
  }
};

