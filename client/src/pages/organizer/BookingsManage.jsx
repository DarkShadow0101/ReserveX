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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
            Sales & Orders
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            Event Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time overview of customer holds, confirmed sales, and payments.
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
        <LoadingSpinner text="Retrieving booking records..." />
      ) : bookings.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Tickets</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((bk) => (
                  <tr key={bk._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-purple">
                      {bk.bookingReference}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <p>{bk.user?.fullName || 'Customer'}</p>
                      <p className="text-[11px] font-normal text-slate-400">{bk.user?.email}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {bk.items?.map((item, idx) => (
                        <span key={idx} className="block">
                          {item.name} x {item.quantity}
                        </span>
                      ))}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {formatPaiseToINR(bk.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
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
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no booking records for this event yet.
          </p>
        </div>
      )}
    </div>
  );
}
