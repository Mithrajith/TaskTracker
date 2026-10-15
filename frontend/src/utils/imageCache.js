import apiClient from '../api/client';

// In-memory cache of authenticated proof images.
// key: fileId -> { url: blob object URL, promise: Promise<string> }
const imageCache = new Map();

export const getCachedFileUrl = (fileId) => {
  if (!fileId) {
    return Promise.reject(new Error('fileId is required'));
  }

  const cached = imageCache.get(fileId);
  if (cached) {
    return cached.promise;
  }

  const entry = { url: null, promise: null };
  entry.promise = apiClient
    .get(`/files/${fileId}`, { responseType: 'blob' })
    .then((res) => {
      const objectUrl = URL.createObjectURL(res.data);
      entry.url = objectUrl;
      return objectUrl;
    })
    .catch((err) => {
      // Drop failed entries so a later attempt can retry
      imageCache.delete(fileId);
      throw err;
    });

  imageCache.set(fileId, entry);
  return entry.promise;
};

export const clearImageCache = () => {
  imageCache.forEach((entry) => {
    if (entry.url) {
      URL.revokeObjectURL(entry.url);
    }
  });
  imageCache.clear();
};
