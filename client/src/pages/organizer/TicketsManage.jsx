import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizationsApi } from '../../api/organizations.api';
import { ticketsApi } from '../../api/tickets.api';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../context/ToastContext';
import { formatEventDate } from '../../utils/date';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SelectDropdown from '../../components/ui/SelectDropdown';
import { Ticket, Calendar, Copy, Sliders } from 'lucide-react';

export default function TicketsManage() {
  const { activeOrgId } = useOrg();
  const { showToast } = useToast();
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

  const handleCopyToken = async (qrToken, ticketNumber) => {
    if (!qrToken) return;
    try {
      await navigator.clipboard.writeText(qrToken);
      showToast(`Copied QR token for ${ticketNumber} — paste in Gate Check-In to test.`);
    } catch {
      showToast('Copy failed — select and copy token manually.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Issued Digital Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse confirmed attendee passes and live gate check-in status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedEventId && (
            <Link to={`/organizer/events/${selectedEventId}`}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#D9381E]" /> Manage Tiers
              </Button>
            </Link>
          )}
          {events.length > 0 && (
            <div className="w-full sm:w-64">
              <SelectDropdown
                value={selectedEventId}
                onChange={setSelectedEventId}
                options={events.map((ev) => ({ value: ev._id, label: ev.title }))}
                icon={Calendar}
                variant="boxed"
                menuAlign="right"
                ariaLabel="Select event"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving digital tickets..." />
      ) : tickets.length > 0 ? (
        <div className="bg-[#12151E] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#090A0E] text-slate-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket Number</th>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Tier</th>
                  <th className="py-3.5 px-4">QR Token</th>
                  <th className="py-3.5 px-4">Checked In At</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {t.ticketNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      <p>{t.customerName}</p>
                      <p className="text-[11px] font-normal text-slate-400">{t.customerEmail}</p>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#FF4D2D]">
                      {t.tierName}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="truncate max-w-[110px] inline-block">
                          {t.qrToken?.substring(0, 16)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyToken(t.qrToken, t.ticketNumber)}
                          title="Copy full signed QR token"
                          aria-label={`Copy QR token for ${t.ticketNumber}`}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
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
        <div className="text-center py-20 bg-[#12151E] rounded-2xl border border-dashed border-white/10 p-8 space-y-3">
          <Ticket className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No tickets issued yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tickets appear here as soon as attendees complete payment.
          </p>
        </div>
      )}
    </div>
  );
}
