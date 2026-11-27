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
    theme = 'dark',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5 text-slate-300">
          {label} {required && <span className="text-[#FF4D2D]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full border text-sm rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 bg-[#090A0E] text-[#F4F1EA] placeholder-slate-500 border-white/15 hover:border-white/25 focus:border-[#FF4D2D] focus:ring-[#FF4D2D]/20 ${
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
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
