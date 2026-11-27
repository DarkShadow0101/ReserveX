import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showClose = true
}) {
  const { isDark } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 backdrop-blur-sm animate-backdrop-in ${
          isDark ? 'bg-black/80' : 'bg-slate-950/45'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full ${maxWidth} max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden z-10 animate-modal-in ${
          isDark
            ? 'border-white/15 bg-[#101219] text-[#F4F1EA]'
            : 'border-slate-900/12 bg-white text-slate-900'
        }`}
      >
        {(title || showClose) && (
          <div
            className={`flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-900/10 bg-slate-50/70'
            }`}
          >
            <div className="pr-4">
              {title && (
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {title}
                </h3>
              )}
              {description && (
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className={`p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
