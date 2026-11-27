import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  theme = 'dark',
  className = ''
}) {
  const lightVariants = {
    default: 'bg-[#FF4D2D]/10 text-[#E63E20] border-[#FF4D2D]/25',
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
    dark: 'bg-[#090A0E] text-white border-white/15'
  };

  const darkVariants = {
    default: 'bg-[#FF4D2D]/15 text-[#FF856D] border-[#FF4D2D]/30',
    published: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
    confirmed: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
    valid: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
    draft: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    pending_payment: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    cancelled: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    expired: 'bg-white/10 text-slate-300 border-white/15',
    used: 'bg-white/10 text-slate-300 border-white/15',
    neutral: 'bg-white/10 text-slate-300 border-white/15',
    dark: 'bg-[#090A0E] text-white border-white/15'
  };

  const dotColors = {
    published: 'bg-[#10B981]',
    confirmed: 'bg-[#10B981]',
    valid: 'bg-[#10B981]',
    draft: 'bg-amber-400',
    pending: 'bg-amber-400',
    pending_payment: 'bg-amber-400',
    cancelled: 'bg-rose-400',
    expired: 'bg-slate-400',
    used: 'bg-slate-400',
    default: 'bg-[#FF4D2D]',
    neutral: 'bg-slate-400',
    dark: 'bg-white'
  };

  const key = String(variant || 'default').toLowerCase();
  const palette = theme === 'light' ? lightVariants : darkVariants;
  const v = palette[key] || palette.default;
  const d = dotColors[key] || dotColors.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold border ${v} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${d}`} />}
      {children}
    </span>
  );
}
