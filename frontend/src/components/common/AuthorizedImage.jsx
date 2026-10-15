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
        className={`flex items-center justify-center bg-[#E5DED2] rounded-lg border border-[#D6CEC1] text-[#77766F] ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin text-[#233DFF]" />
      </div>
    );
  }

  if (error || !imgSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F5F0E8] rounded-lg border border-[#D6CEC1] text-[#9A9890] p-2 text-center text-xs ${className}`}
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

