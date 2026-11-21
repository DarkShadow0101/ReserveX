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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-brand-purple hover:bg-indigo-600 text-white shadow-sm hover:shadow focus:ring-brand-purple',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
    outline: 'border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 focus:ring-brand-purple',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
    dark: 'bg-brand-navy hover:bg-slate-800 text-white shadow-sm focus:ring-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    coral: 'bg-brand-coral hover:bg-rose-600 text-white focus:ring-rose-400'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-2xl gap-2.5 font-semibold',
    pill: 'text-sm px-5 py-2.5 rounded-full gap-2 font-medium',
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
