import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { bookingsApi } from '../../api/bookings.api';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await bookingsApi.getMyBookings();
        setBookings(res.data?.bookings || []);
      } catch (err) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
            Order History
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">
            My Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review past reservations, complete pending payments, or view your digital passes.
          </p>
        </div>

        <Link to="/my-tickets">
          <Button variant="primary" size="sm">
            View My Tickets
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your bookings..." />
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand-purple">
                    {booking.bookingReference}
                  </span>
                  <Badge variant={booking.status} dot={true}>
                    {booking.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {booking.event?.title || 'Event Booking'}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatEventDate(booking.event?.startsAt)}
                </p>

                {/* Items summary */}
                <div className="text-xs text-slate-600">
                  {booking.items?.map((item, idx) => (
                    <span key={idx} className="mr-3">
                      • {item.name} x {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amount and Action */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Paid</span>
                  <span className="text-xl font-black text-slate-900">
                    {formatPaiseToINR(booking.totalAmount)}
                  </span>
                </div>

                {booking.status === 'PENDING_PAYMENT' && (
                  <Link to={`/checkout/${booking._id}`}>
                    <Button variant="primary" size="sm" className="shadow-sm">
                      Complete Payment <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}

                {booking.status === 'CONFIRMED' && (
                  <Link to="/my-tickets">
                    <Button variant="outline" size="sm">
                      View Tickets <Ticket className="w-3.5 h-3.5 ml-1 text-brand-purple" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-brand-purple flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-800">No bookings found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You haven't made any event bookings yet.
          </p>
          <Link to="/events">
            <Button variant="primary" size="md">
              Find an Event
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
