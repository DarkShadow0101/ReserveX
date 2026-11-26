import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Ticket } from 'lucide-react';
import Card from '../ui/Card';

export default function TicketSalesDonut({ data = [], totalTickets = '0', isDemo = false }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card className="p-6 border-slate-100 shadow-soft flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900">Ticket Sales by Event</h3>
        {isDemo && (
          <span className="text-[11px] text-brand-purple font-semibold">Demo</span>
        )}
      </div>

      {hasData ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
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

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl font-black text-slate-900 leading-tight">
                {totalTickets}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Tickets
              </span>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 w-full text-xs">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium truncate max-w-[110px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-56 flex flex-col items-center justify-center text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 px-6">
          <Ticket className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No tickets sold yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Ticket distribution by event appears once orders are confirmed.
          </p>
        </div>
      )}
    </Card>
  );
}
