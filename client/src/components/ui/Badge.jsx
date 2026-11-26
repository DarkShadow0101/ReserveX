import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  theme = 'light',
  className = ''
}) {
  const lightVariants = {
    default: 'bg-indigo-50 text-brand-purple border-indigo-100',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    valid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    expired: 'bg-slate-100 text-slate-600 border-slate-200',
    used: 'bg-slate-100 text-slate-600 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-brand-navy text-white border-slate-800'
  };

  const darkVariants = {
    default: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
    published: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    valid: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    draft: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    pending_payment: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    cancelled: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    expired: 'bg-white/10 text-slate-300 border-white/15',
    used: 'bg-white/10 text-slate-300 border-white/15',
    neutral: 'bg-white/10 text-slate-300 border-white/15',
    dark: 'bg-brand-navy text-white border-white/15'
  };

  const dotColors = {
    published: 'bg-emerald-400',
    confirmed: 'bg-emerald-400',
    valid: 'bg-emerald-400',
    draft: 'bg-amber-400',
    pending: 'bg-amber-400',
    pending_payment: 'bg-amber-400',
    cancelled: 'bg-rose-400',
    expired: 'bg-slate-400',
    used: 'bg-slate-400',
    default: 'bg-brand-purple',
    neutral: 'bg-slate-400',
    dark: 'bg-white'
  };

  const key = String(variant || 'default').toLowerCase();
  const palette = theme === 'dark' ? darkVariants : lightVariants;
  const v = palette[key] || palette.default;
  const d = dotColors[key] || dotColors.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${d}`} />}
      {children}
    </span>
  );
}
