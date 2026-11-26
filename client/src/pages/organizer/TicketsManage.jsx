import React, { useState, useEffect } from 'react';
import { organizationsApi } from '../../api/organizations.api';
import { ticketsApi } from '../../api/tickets.api';
import { useOrg } from '../../context/OrgContext';
import { formatEventDate } from '../../utils/date';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import SelectDropdown from '../../components/ui/SelectDropdown';
import { Ticket, Calendar } from 'lucide-react';

export default function TicketsManage() {
  const { activeOrgId } = useOrg();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      if (!activeOrgId) return;
      try {
        setLoading(true);
        const res = await organizationsApi.getOrganizationEvents(activeOrgId);
        const list = res.data?.events || [];
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0]._id);
        }
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [activeOrgId]);

  useEffect(() => {
    async function loadTickets() {
      if (!selectedEventId) {
        setTickets([]);
        return;
      }
      try {
        setLoading(true);
        const res = await ticketsApi.getEventTickets(selectedEventId);
        setTickets(res.data?.tickets || []);
      } catch (err) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [selectedEventId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
            Audience & Passes
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            Issued Digital Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all confirmed attendee tickets and gate check-in status.
          </p>
        </div>

        {events.length > 0 && (
          <div className="w-full sm:w-72">
            <SelectDropdown
              value={selectedEventId}
              onChange={setSelectedEventId}
              options={events.map((ev) => ({ value: ev._id, label: ev.title }))}
              icon={Calendar}
              theme="light"
              variant="boxed"
              menuAlign="right"
              ariaLabel="Select event"
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving digital tickets..." />
      ) : tickets.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket Number</th>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Tier</th>
                  <th className="py-3.5 px-4">QR Token</th>
                  <th className="py-3.5 px-4">Checked In At</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {t.ticketNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <p>{t.customerName}</p>
                      <p className="text-[11px] font-normal text-slate-400">{t.customerEmail}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-brand-purple">
                      {t.tierName}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                      <span className="truncate max-w-[120px] inline-block">
                        {t.qrToken?.substring(0, 18)}...
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {t.usedAt ? formatEventDate(t.usedAt, 'dd MMM • hh:mm a') : '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant={t.status} dot={true}>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tickets issued yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tickets will appear here as soon as customers complete confirmed payments.
          </p>
        </div>
      )}
    </div>
  );
}
