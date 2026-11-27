import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Ticket } from 'lucide-react';
import Card from '../ui/Card';

export default function TicketSalesDonut({ data = [], totalTickets = '0', isDemo = false }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card className="p-6 border-white/10 bg-[#12151E] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-white">Sales by Event</h3>
        {isDemo && (
          <span className="font-mono text-[11px] text-amber-300 font-semibold">Sample</span>
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
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#FF4D2D'} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#090A0E',
                    color: '#F4F1EA',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="font-mono text-xl font-bold text-white leading-tight">
                {totalTickets}
              </span>
              <span className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Passes
              </span>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 w-full text-xs">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-300 font-medium truncate max-w-[110px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-56 flex flex-col items-center justify-center text-center bg-[#090A0E] rounded-xl border border-dashed border-white/10 px-6">
          <Ticket className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-200">No tickets sold yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Ticket distribution by event appears once orders are confirmed.
          </p>
        </div>
      )}
    </Card>
  );
}
