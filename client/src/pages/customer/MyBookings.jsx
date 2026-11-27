import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, ArrowRight } from 'lucide-react';
import { bookingsApi } from '../../api/bookings.api';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function MyBookings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      if (!isAuthenticated) {
        setBookings([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await bookingsApi.getMyBookings();
        setBookings(res.data?.bookings || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadBookings();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display uppercase text-3xl sm:text-4xl font-bold text-white">
            My Bookings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review reservations, complete pending checkouts, or view your passes.
          </p>
        </div>

        <Link to="/my-tickets">
          <Button variant="primary" size="sm" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
            View My Tickets
          </Button>
        </Link>
      </div>

      {loading || authLoading ? (
        <LoadingSpinner text="Loading your bookings..." />
      ) : !isAuthenticated ? (
        <div className="text-center py-20 bg-[#101219] rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-sans font-bold text-white">Sign in to view your bookings</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Access active reservations, payment statuses, and confirmed passes.
          </p>
          <Link to="/login?redirect=/my-bookings" className="inline-block pt-2">
            <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
              Sign In
            </Button>
          </Link>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-[#101219] rounded-2xl p-6 border border-white/10 hover:border-[#FF4D2D]/45 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#FF4D2D]">
                    {booking.bookingReference}
                  </span>
                  <Badge variant={booking.status} dot={true}>
                    {booking.status}
                  </Badge>
                </div>

                <h3 className="text-xl font-sans font-bold text-white">
                  {booking.event?.title || 'Event Booking'}
                </h3>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF4D2D]" />
                  {formatEventDate(booking.event?.startsAt)}
                </p>

                <div className="text-xs text-slate-300 flex flex-wrap gap-3 pt-1">
                  {booking.items?.map((item, idx) => (
                    <span
                      key={idx}
                      className="font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10"
                    >
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                <div className="md:text-right">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 block">
                    Total Amount
                  </span>
                  <span className="font-mono text-xl font-bold text-white">
                    {formatPaiseToINR(booking.totalAmount)}
                  </span>
                </div>

                {booking.status === 'PENDING_PAYMENT' && (
                  <Link to={`/checkout/${booking._id}`}>
                    <Button variant="primary" size="sm" className="bg-[#FF4D2D] hover:bg-[#E63E20] shadow-sm">
                      Complete Payment <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}

                {booking.status === 'CONFIRMED' && (
                  <Link to="/my-tickets">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/[0.05] border-white/15 text-white hover:bg-white/10"
                    >
                      View Tickets <Ticket className="w-3.5 h-3.5 ml-1 text-[#10B981]" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#101219] rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-sans font-bold text-white">No bookings found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You haven't made any event bookings yet. Explore live concerts and festivals to book your first pass.
          </p>
          <Link to="/events" className="inline-block pt-2">
            <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
              Find an Event
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
