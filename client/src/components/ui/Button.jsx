import React from 'react';
import { Loader2 } from 'lucide-react';

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
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#060709] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-y-[1px]';

  const variants = {
    primary: 'bg-[#D9381E] hover:bg-[#C92C12] text-white shadow-sm focus:ring-[#FF4D2D]',
    secondary: 'bg-white/[0.08] hover:bg-white/[0.14] text-[#F4F1EA] border border-white/10 focus:ring-white/30',
    outline: 'border border-white/15 hover:border-white/30 bg-transparent hover:bg-white/[0.06] text-[#F4F1EA] focus:ring-white/30',
    ghost: 'hover:bg-white/[0.06] text-slate-300 hover:text-white focus:ring-white/25',
    dark: 'bg-[#090A0E] hover:bg-[#12151E] text-[#F4F1EA] border border-white/15 focus:ring-white/30',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    coral: 'bg-[#D9381E] hover:bg-[#C92C12] text-white focus:ring-[#FF4D2D]',
    ivory: 'bg-[#F4F1EA] hover:bg-white text-[#060709] focus:ring-[#F4F1EA]'
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
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
