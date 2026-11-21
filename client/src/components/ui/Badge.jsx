import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  className = ''
}) {
  const variants = {
    default: 'bg-indigo-50 text-brand-purple border-indigo-100',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    valid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    expired: 'bg-slate-100 text-slate-600 border-slate-200',
    used: 'bg-slate-100 text-slate-600 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-brand-navy text-white border-slate-800'
  };

  const dotColors = {
    published: 'bg-emerald-500',
    confirmed: 'bg-emerald-500',
    valid: 'bg-emerald-500',
    draft: 'bg-amber-500',
    pending: 'bg-amber-500',
    cancelled: 'bg-rose-500',
    expired: 'bg-slate-400',
    used: 'bg-slate-400',
    default: 'bg-brand-purple',
    neutral: 'bg-slate-400',
    dark: 'bg-white'
  };

  const v = variants[variant.toLowerCase()] || variants.default;
  const d = dotColors[variant.toLowerCase()] || dotColors.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${d}`}></span>}
      {children}
    </span>
  );
}
