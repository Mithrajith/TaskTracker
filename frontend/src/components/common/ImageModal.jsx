import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Loader2, ImageOff } from 'lucide-react';
import { getCachedFileUrl } from '../../utils/imageCache';

export const ImageModal = ({ isOpen, onClose, imgSrc, fileId, title = 'Proof Screenshot' }) => {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isOpen) {
      setResolvedSrc(null);
      setFailed(false);
      return undefined;
    }

    if (fileId) {
      // Reuse the cached blob if this proof was already loaded, so the
      // enlarged view opens instantly without another network request.
      setLoading(true);
      setFailed(false);
      getCachedFileUrl(fileId)
        .then((objectUrl) => {
          if (isMounted) {
            setResolvedSrc(objectUrl);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setFailed(true);
            setLoading(false);
          }
        });
    } else {
      setResolvedSrc(imgSrc || null);
      setFailed(false);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, fileId, imgSrc]);

  if (!isOpen || (!imgSrc && !fileId)) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242424]/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full bg-white border border-[#D6CEC1] rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D6CEC1] bg-[#F5F0E8] shrink-0">
          <span className="text-sm font-bold text-[#233DFF]">{title}</span>
          <div className="flex items-center gap-2">
            {resolvedSrc && (
              <a
                href={resolvedSrc}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-[#77766F] hover:text-[#233DFF] hover:bg-[#E5DED2] transition-colors"
                title="Open full image in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#77766F] hover:text-[#242424] hover:bg-[#E5DED2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex items-center justify-center bg-[#F1ECE2] max-h-[80vh] min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#77766F] gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-[#233DFF]" />
              <span className="text-xs font-medium">Loading image...</span>
            </div>
          ) : failed || !resolvedSrc ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#77766F] gap-2">
              <ImageOff className="w-8 h-8 text-[#9A9890]" />
              <span className="text-xs font-medium">Unable to load this image.</span>
            </div>
          ) : (
            <img
              src={resolvedSrc}
              alt="Enlarged Proof"
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};
