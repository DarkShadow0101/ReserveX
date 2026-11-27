import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ light = true, className = '' }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 font-sans font-bold tracking-tight select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D2D] rounded-lg ${className}`}
    >
      {/* Machined Ticket Stub Emblem */}
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF5B3A] to-[#D13117] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-105">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="text-white"
        >
          <path
            d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="inline-flex items-baseline gap-0.5">
        <span className={`text-lg sm:text-xl tracking-[-0.03em] ${light ? 'text-[#F4F1EA]' : 'text-slate-900'}`}>
          ReserveX
        </span>
        <span className="text-lg sm:text-xl font-black text-[#FF4D2D]">.</span>
      </span>
    </Link>
  );
}
