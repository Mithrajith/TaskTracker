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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172E2A]/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full bg-white border border-[#DDE8DF] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DDE8DF] bg-[#FAF8F0] shrink-0">
          <span className="text-sm font-bold text-[#064E45]">{title}</span>
          <div className="flex items-center gap-2">
            {resolvedSrc && (
              <a
                href={resolvedSrc}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
                title="Open full image in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71817B] hover:text-[#172E2A] hover:bg-[#EAF7EF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex items-center justify-center bg-[#FAF8F0] max-h-[80vh] min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#71817B] gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-[#064E45]" />
              <span className="text-xs font-medium">Loading image...</span>
            </div>
          ) : failed || !resolvedSrc ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#71817B] gap-2">
              <ImageOff className="w-8 h-8 text-[#71817B]/60" />
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
