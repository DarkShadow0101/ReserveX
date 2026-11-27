import React, { useState, useEffect } from 'react';
import { organizationsApi } from '../../api/organizations.api';
import { bookingsApi } from '../../api/bookings.api';
import { useOrg } from '../../context/OrgContext';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import SelectDropdown from '../../components/ui/SelectDropdown';
import { Calendar } from 'lucide-react';

export default function BookingsManage() {
  const { activeOrgId } = useOrg();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookings, setBookings] = useState([]);
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
    async function loadBookings() {
      if (!selectedEventId) {
        setBookings([]);
        return;
      }
      try {
        setLoading(true);
        const res = await bookingsApi.getEventBookings(selectedEventId);
        setBookings(res.data?.bookings || []);
      } catch (err) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [selectedEventId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Event Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overview of customer reservations, confirmed sales, and payments.
          </p>
        </div>

        {events.length > 0 && (
          <div className="w-full sm:w-72">
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

      {loading ? (
        <LoadingSpinner text="Retrieving booking records..." />
      ) : bookings.length > 0 ? (
        <div className="bg-[#12151E] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#090A0E] text-slate-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Tickets</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((bk) => (
                  <tr key={bk._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#FF4D2D]">
                      {bk.bookingReference}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      <p>{bk.user?.fullName || 'Customer'}</p>
                      <p className="text-[11px] font-normal text-slate-400">{bk.user?.email}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-mono">
                      {bk.items?.map((item, idx) => (
                        <span key={idx} className="block">
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {formatPaiseToINR(bk.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {formatEventDate(bk.createdAt, 'dd MMM yyyy • hh:mm a')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant={bk.status} dot={true}>
                        {bk.status}
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
          <h3 className="text-base font-bold text-white">No bookings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no booking records for this event yet.
          </p>
        </div>
      )}
    </div>
  );
}
