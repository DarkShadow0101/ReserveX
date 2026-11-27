import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  text = 'Loading...',
  size = 'md',
  theme = 'dark',
  className = ''
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 gap-3 ${
        theme === 'light' ? 'text-slate-400' : 'text-slate-300'
      } ${className}`}
    >
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-[#FF4D2D]`} />
      {text && <p className="text-xs font-medium tracking-wide">{text}</p>}
    </div>
  );
}
