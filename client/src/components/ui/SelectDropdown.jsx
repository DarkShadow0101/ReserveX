import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  icon: Icon,
  iconClassName = '',
  theme = 'dark',
  variant = 'boxed',
  ariaLabel = 'Select option',
  className = '',
  menuAlign = 'left'
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (optValue) => {
    if (onChange) {
      onChange(optValue);
    }
    setOpen(false);
  };

  const triggerStyles =
    variant === 'inline'
      ? `w-full flex items-center justify-between gap-2 bg-transparent px-4 py-2.5 lg:py-2 text-sm font-medium cursor-pointer focus:outline-none ${
          isDark ? 'text-slate-200 hover:text-white' : 'text-slate-800 hover:text-slate-950'
        }`
      : isDark
      ? `w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer transition-all focus:outline-none ${
          open
            ? 'bg-white/[0.08] border-brand-purple ring-2 ring-brand-purple/25 text-white'
            : 'bg-white/[0.04] border-white/10 hover:border-white/25 text-slate-200'
        }`
      : `w-full flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all shadow-sm focus:outline-none ${
          open
            ? 'bg-white border-brand-purple ring-2 ring-brand-purple/20 text-slate-900'
            : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
        }`;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerStyles}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 ${
                iconClassName || (isDark ? 'text-slate-300' : 'text-slate-400')
              }`}
            />
          )}
          <span className="truncate">{displayLabel}</span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute z-50 mt-2 min-w-full w-max max-w-xs rounded-2xl border p-1.5 shadow-2xl backdrop-blur-2xl max-h-64 overflow-y-auto ${
            menuAlign === 'right' ? 'right-0' : 'left-0'
          } ${
            isDark
              ? 'bg-[#12172A]/95 border-white/15 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
              : 'bg-white border-slate-200 text-slate-800 shadow-xl'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-brand-purple text-white'
                      : 'bg-indigo-50 text-brand-purple font-semibold'
                    : isDark
                    ? 'text-slate-200 hover:bg-white/[0.08] hover:text-white'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isDark ? 'text-white' : 'text-brand-purple'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
