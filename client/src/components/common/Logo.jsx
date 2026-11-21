import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ light = false, className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-1.5 font-bold tracking-tight select-none ${className}`}>
      <span className={`text-2xl font-black ${light ? 'text-white' : 'text-slate-900'}`}>
        Reserve<span className="text-brand-purple">X</span>
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-brand-coral animate-pulse"></span>
    </Link>
  );
}
