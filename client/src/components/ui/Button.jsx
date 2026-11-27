import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const { isDark } = useTheme();

  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] active:translate-y-[1px] select-none';

  const variants = {
    primary: 'bg-[#D9381E] hover:bg-[#C92C12] text-white shadow-sm',
    secondary: isDark
      ? 'bg-white/[0.08] hover:bg-white/[0.15] text-[#F4F1EA] border border-white/10'
      : 'bg-slate-900/[0.07] hover:bg-slate-900/[0.12] text-slate-900 border border-slate-900/12',
    outline: isDark
      ? 'border border-white/15 hover:border-white/30 bg-transparent hover:bg-white/[0.06] text-[#F4F1EA]'
      : 'border border-slate-900/15 hover:border-slate-900/35 bg-transparent hover:bg-slate-900/[0.05] text-slate-900',
    ghost: isDark
      ? 'hover:bg-white/[0.08] text-slate-300 hover:text-white'
      : 'hover:bg-slate-900/[0.06] text-slate-600 hover:text-slate-950',
    dark: isDark
      ? 'bg-[#090A0E] hover:bg-[#12151E] text-[#F4F1EA] border border-white/15'
      : 'bg-[#11131B] hover:bg-[#1E2230] text-white border border-slate-900/20',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500',
    coral: 'bg-[#D9381E] hover:bg-[#C92C12] text-white',
    ivory: isDark
      ? 'bg-[#F4F1EA] hover:bg-white text-[#060709]'
      : 'bg-[#11131B] hover:bg-[#1E2230] text-white'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
    pill: 'text-sm px-5 py-2.5 rounded-full gap-2 font-semibold',
    icon: 'p-2 rounded-xl'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${isDark ? 'focus-visible:ring-offset-[#060709]' : 'focus-visible:ring-offset-[#F8FAFC]'} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
