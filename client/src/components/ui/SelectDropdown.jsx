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
  const [activeIndex, setActiveIndex] = useState(-1);
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
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(options.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
      } else if (e.key === 'Enter' && open && activeIndex >= 0 && options[activeIndex]) {
        e.preventDefault();
        handleSelect(options[activeIndex].value);
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
  }, [open, activeIndex, options]);

  const handleSelect = (optValue) => {
    if (onChange) {
      onChange(optValue);
    }
    setOpen(false);
    setActiveIndex(-1);
  };

  const triggerStyles =
    variant === 'inline'
      ? `w-full flex items-center justify-between gap-2 bg-transparent px-3.5 py-2.5 lg:py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
          isDark ? 'text-slate-200 hover:text-white' : 'text-slate-200 hover:text-white'
        }`
      : isDark
      ? `w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
          open
            ? 'bg-white/[0.08] border-[#FF4D2D] ring-2 ring-[#FF4D2D]/20 text-white'
            : 'bg-[#0B0D12] border-white/10 hover:border-white/25 text-slate-200'
        }`
      : `w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
          open
            ? 'bg-[#12151E] border-[#FF4D2D] ring-2 ring-[#FF4D2D]/20 text-white'
            : 'bg-[#12151E] border-white/15 hover:border-white/30 text-slate-200'
        }`;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) {
              const selIdx = options.findIndex((o) => o.value === value);
              setActiveIndex(selIdx >= 0 ? selIdx : 0);
            }
            return next;
          });
        }}
        className={triggerStyles}
      >
        <span className="flex items-center gap-2 min-w-0">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 ${iconClassName || 'text-slate-400'}`}
            />
          )}
          <span className="truncate">{displayLabel}</span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } text-slate-400`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute z-50 mt-2 min-w-full w-max max-w-xs rounded-xl border p-1.5 shadow-2xl max-h-64 overflow-y-auto bg-[#101219] border-white/15 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.75)] ${
            menuAlign === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === activeIndex;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#D9381E] text-white'
                    : isHighlighted
                    ? 'bg-white/[0.1] text-white'
                    : 'text-slate-200 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
