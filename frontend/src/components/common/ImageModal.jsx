import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export const ImageModal = ({ isOpen, onClose, imgSrc, title = 'Proof Screenshot' }) => {
  if (!isOpen || !imgSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172E2A]/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] bg-white border border-[#DDE8DF] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(23,46,42,0.25)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DDE8DF] bg-[#FAF8F0] shrink-0">
          <span className="text-sm font-bold text-[#064E45]">{title}</span>
          <div className="flex items-center gap-2">
            <a
              href={imgSrc}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-[#71817B] hover:text-[#064E45] hover:bg-[#EAF7EF] transition-colors"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71817B] hover:text-[#172E2A] hover:bg-[#EAF7EF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex items-center justify-center bg-[#F4FAF6] max-h-[80vh]">
          <img
            src={imgSrc}
            alt="Enlarged Proof"
            className="max-h-full max-w-full object-contain rounded-xl shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

