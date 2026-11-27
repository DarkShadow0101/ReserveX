import React from 'react';
import Card from '../ui/Card';

export default function KPICard({ title, value, trend, icon: Icon, iconBg = 'bg-[#FF4D2D]/15 text-[#FF4D2D] border border-[#FF4D2D]/30' }) {
  const isPositive = trend?.startsWith('+') || trend?.includes('↑') || trend?.includes('paid');

  return (
    <Card className="p-5 border-white/10 bg-[#12151E]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              isPositive
                ? 'text-[#10B981] bg-[#10B981]/15'
                : 'text-slate-300 bg-white/[0.06]'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
