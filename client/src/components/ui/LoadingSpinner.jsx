import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  text = 'Loading...',
  size = 'md',
  theme = 'light',
  className = ''
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 gap-3 ${
        isDark ? 'text-slate-300' : 'text-slate-500'
      } ${className}`}
    >
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-purple`} />
      {text && <p className="text-xs font-medium tracking-wide">{text}</p>}
    </div>
  );
}
