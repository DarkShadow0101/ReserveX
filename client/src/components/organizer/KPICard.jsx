import React from 'react';
import Card from '../ui/Card';

export default function KPICard({ title, value, trend, icon: Icon, iconBg = 'bg-indigo-50 text-brand-purple' }) {
  const isPositive = trend?.startsWith('+') || trend?.includes('↑');

  return (
    <Card className="p-5 sm:p-6 border-slate-100 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-600 bg-slate-100'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
