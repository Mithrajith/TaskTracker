import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg) => showToast(msg, 'error', 5000), [showToast]);
  const info = useCallback((msg) => showToast(msg, 'info'), [showToast]);
  const warning = useCallback((msg) => showToast(msg, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-[#DDE8DF] text-[#172E2A] shadow-md';
          let icon = <Info className="w-5 h-5 text-[#064E45] shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-[#EAF7EF] border-[#DDE8DF] text-[#064E45] shadow-md';
            icon = <CheckCircle2 className="w-5 h-5 text-[#2D9B70] shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-[#FFF0ED] border-[#FAD3CC] text-[#E86A5B] shadow-md';
            icon = <AlertCircle className="w-5 h-5 text-[#E86A5B] shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-[#FFF8EA] border-[#FCE6BD] text-[#A86B0F] shadow-md';
            icon = <AlertTriangle className="w-5 h-5 text-[#F3B74F] shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 animate-slide-in ${bgClass}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded text-current"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
