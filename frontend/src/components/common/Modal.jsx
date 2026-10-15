import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242424]/40 backdrop-blur-xs animate-fade-in">
      <div
        className={`bg-white border border-[#D6CEC1] rounded-2xl sm:rounded-3xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#D6CEC1] shrink-0 bg-[#F5F0E8]/70">
          <div>
            <h3 className="text-lg font-bold text-[#233DFF]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#77766F] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#77766F] hover:text-[#242424] hover:bg-[#E5DED2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-white">{children}</div>
      </div>
    </div>
  );
};

