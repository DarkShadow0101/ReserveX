import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    type = 'text',
    required = false,
    theme,
    ...props
  },
  ref
) {
  const { isDark: ctxDark } = useTheme();
  const useDark = theme === 'light' ? false : ctxDark;

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5 ${
            useDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label} {required && <span className="text-[#D9381E]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className={`absolute left-3.5 pointer-events-none ${useDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full border text-sm rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 ${
            useDark
              ? 'bg-[#090A0E] text-[#F4F1EA] placeholder-slate-400 border-white/15 hover:border-white/25 focus:border-[#FF4D2D] focus:ring-[#FF4D2D]/20'
              : 'bg-white text-slate-900 placeholder-slate-500 border-slate-900/15 hover:border-slate-900/30 focus:border-[#D9381E] focus:ring-[#D9381E]/15'
          } ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && (
        <p className={`mt-1 text-xs ${useDark ? 'text-slate-400' : 'text-slate-600'}`}>{helperText}</p>
      )}
    </div>
  );
});

export default Input;
