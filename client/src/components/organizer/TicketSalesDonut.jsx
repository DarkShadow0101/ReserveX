import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';

export default function TicketSalesDonut({ data, totalTickets = '12.6K', isDemo = false }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Music Festival', value: 45, color: '#5B4CF2' },
    { name: 'Tech Summit', value: 30, color: '#38BDF8' },
    { name: 'Comedy Night', value: 15, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#94A3B8' }
  ];

  return (
    <Card className="p-6 border-slate-100 shadow-soft flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900">Ticket Sales by Event</h3>
        {isDemo && (
          <span className="text-[10px] text-brand-purple font-semibold">Demo</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut with center label */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#5B4CF2'} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, 'Share']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-xl font-black text-slate-900 leading-tight">
              {totalTickets}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Tickets
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 flex-1 w-full text-xs">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium truncate max-w-[100px]">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
