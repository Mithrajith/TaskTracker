import React, { useState, useEffect } from 'react';
import { getCachedFileUrl } from '../../utils/imageCache';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export const AuthorizedImage = ({
  fileId,
  alt = 'Proof Image',
  className = '',
  onClick = null,
  thumbnail = false,
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!fileId) {
      setLoading(false);
      setError(true);
      return undefined;
    }

    setLoading(true);
    setError(false);

    getCachedFileUrl(fileId)
      .then((objectUrl) => {
        if (isMounted) {
          setImgSrc(objectUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-[#EAF7EF] rounded-lg border border-[#DDE8DF] text-[#71817B] ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin text-[#064E45]" />
      </div>
    );
  }

  if (error || !imgSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#FAF8F0] rounded-lg border border-[#DDE8DF] text-[#71817B] p-2 text-center text-xs ${className}`}
      >
        <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
        <span>No image</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${className}`}
      onClick={() => onClick && onClick(imgSrc)}
    />
  );
};
