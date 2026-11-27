import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

/**
 * Tactile Light/Dark mode toggle button with animated Sun/Moon swap and toast feedback.
 */
export default function ThemeToggle({ className = '', compact = false }) {
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleToggle = () => {
    const next = toggleTheme();
    showToast(next === 'light' ? 'Light mode activated' : 'Dark stage mode activated', 'accent');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] ${
        compact ? 'p-2' : 'px-3 py-1.5 text-xs font-medium'
      } ${
        isDark
          ? 'bg-white/[0.06] hover:bg-white/[0.14] border-white/15 text-slate-200 hover:text-white'
          : 'bg-slate-900/[0.06] hover:bg-slate-900/[0.12] border-slate-900/12 text-slate-700 hover:text-slate-950'
      } ${className}`}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </span>
      {!compact && <span className="hidden xl:inline">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
