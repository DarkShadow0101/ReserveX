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
    <Card className="p-6 border-white/10 bg-[#12151E] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Ticket Sales & Revenue</h3>
          {isDemo && (
            <span className="font-mono text-[11px] text-amber-300 font-semibold">
              Sample preview trend
            </span>
          )}
        </div>

        {hasData && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4D2D]" />
              <span>This Period</span>
            </div>
            {data.some((d) => d.lastPeriod !== undefined) && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
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
                  <stop offset="5%" stopColor="#FF4D2D" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#FF4D2D" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#242938" />
              <XAxis
                dataKey="period"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#090A0E',
                  color: '#F4F1EA',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#F4F1EA' }}
              />
              <Area
                type="monotone"
                dataKey="thisPeriod"
                stroke="#FF4D2D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              {data.some((d) => d.lastPeriod !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="lastPeriod"
                  stroke="#64748B"
                  strokeWidth={1.75}
                  strokeDasharray="4 4"
                  fillOpacity={0}
                  fill="transparent"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center bg-[#090A0E] rounded-xl border border-dashed border-white/10 px-6">
          <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-200">No confirmed revenue yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Confirmed ticket payments for your published events will plot here automatically.
          </p>
        </div>
      )}
    </Card>
  );
}
