import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, Sparkles, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

const ToastContext = createContext({
  showToast: () => {}
});

/**
 * Lightweight global toast feedback system providing immediate visual confirmation on interactive clicks.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { isDark } = useTheme();

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2400);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Status Toast Viewport */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-5 right-5 z-[120] flex flex-col gap-2 max-w-xs w-full sm:w-auto"
      >
        {toasts.map((toast) => {
          const Icon =
            toast.variant === 'info' ? Info : toast.variant === 'accent' ? Sparkles : CheckCircle2;
          const iconColor =
            toast.variant === 'info'
              ? 'text-sky-400'
              : toast.variant === 'accent'
              ? 'text-[#FF4D2D]'
              : 'text-[#10B981]';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto animate-dropdown-in flex items-center gap-2.5 pl-3.5 pr-2.5 py-2.5 rounded-xl border shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-medium ${
                isDark
                  ? 'bg-[#0C0F18]/92 border-white/15 text-[#F4F1EA]'
                  : 'bg-white/95 border-slate-900/12 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.14)]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span className="truncate">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
