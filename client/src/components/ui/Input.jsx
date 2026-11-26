import React, { forwardRef } from 'react';

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
    theme = 'light',
    ...props
  },
  ref
) {
  const isDark = theme === 'dark';

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label} {required && <span className="text-brand-coral">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div
            className={`absolute left-3.5 pointer-events-none ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full border text-sm rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 ${
            isDark
              ? 'bg-brand-navy/80 text-white placeholder-slate-500 border-white/15 hover:border-white/25 focus:border-brand-purple focus:ring-brand-purple/25'
              : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 hover:border-slate-300 focus:border-brand-purple focus:ring-brand-purple/20'
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : ''
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className={`mt-1 text-xs ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>
      )}
      {helperText && !error && (
        <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
