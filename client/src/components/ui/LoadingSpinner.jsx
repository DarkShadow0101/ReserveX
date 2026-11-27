import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function LoadingSpinner({
  text = 'Loading...',
  size = 'md',
  theme,
  className = ''
}) {
  const { isDark } = useTheme();
  const resolvedTheme = theme || (isDark ? 'dark' : 'light');

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 gap-3 ${
        resolvedTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
      } ${className}`}
    >
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-[#D9381E]`} />
      {text && <p className="text-xs font-medium tracking-wide">{text}</p>}
    </div>
  );
}
