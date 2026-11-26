import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card';

export default function RevenueChart({ data = [], isDemo = false }) {
  const hasData = Array.isArray(data) && data.length > 0;

  const formatYAxis = (val) => {
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <Card className="p-6 border-slate-100 shadow-soft flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
          {isDemo && (
            <span className="text-[11px] text-brand-purple font-semibold">
              Demo Preview • Sample trend
            </span>
          )}
        </div>

        {hasData && (
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
              <span>This Period</span>
            </div>
            {data.some((d) => d.lastPeriod !== undefined) && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Last Period</span>
              </div>
            )}
          </div>
        )}
      </div>

      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B4CF2" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#5B4CF2" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="thisPeriod"
                stroke="#5B4CF2"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              {data.some((d) => d.lastPeriod !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="lastPeriod"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={0}
                  fill="transparent"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 px-6">
          <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No confirmed revenue yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Confirmed ticket payments for your published events will plot here automatically.
          </p>
        </div>
      )}
    </Card>
  );
}
