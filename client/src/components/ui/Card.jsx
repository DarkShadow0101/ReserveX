import React from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-[#12151E] text-[#F4F1EA] rounded-2xl border border-white/10 shadow-soft transition-all duration-200 ${
        hover ? 'hover:border-white/25 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
