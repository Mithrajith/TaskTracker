import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5 py-1">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            danger
              ? 'bg-[#FFF0ED] text-[#E86A5B] border border-[#FAD3CC]'
              : 'bg-[#FFF8EA] text-[#D88918] border border-[#FCE6BD]'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-[#77766F] leading-relaxed pt-0.5">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D6CEC1] mt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-[#77766F] hover:text-[#242424] hover:bg-[#E5DED2] transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-all ${
            danger
              ? 'bg-[#E86A5B] hover:bg-[#d45849]'
              : 'bg-[#233DFF] hover:bg-[#1B2FCC]'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

