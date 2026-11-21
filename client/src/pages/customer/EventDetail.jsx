import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  ShieldCheck,
  Share2,
  Heart,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { ticketTypesApi } from '../../api/ticketTypes.api';
import { bookingsApi } from '../../api/bookings.api';
import { useAuth } from '../../context/AuthContext';
import { formatEventDate, formatDateBadge } from '../../utils/date';
import { formatPaiseToINR } from '../../utils/currency';
import { getEventImage } from '../../mocks/eventImages';
import { extractErrorMessage } from '../../utils/errors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        setError(null);

        // Fetch public event details and ticket tiers in parallel
        const [eventRes, ticketsRes] = await Promise.all([
          eventsApi.getPublicEventById(id),
          ticketTypesApi.getTicketTypesForEvent(id)
        ]);

        const ev = eventRes.data?.event;
        const tiers = ticketsRes.data?.ticketTypes || [];

        setEvent(ev);
        setTicketTypes(tiers);

        // Initialize zero quantities
        const initialQty = {};
        tiers.forEach((t) => {
          initialQty[t._id] = 0;
        });
        setQuantities(initialQty);
      } catch (err) {
        setError(extractErrorMessage(err, 'Could not load event details'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const handleQuantityChange = (ticketTypeId, delta, maxAvailable) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [ticketTypeId]: next };
    });
  };

  // Calculate order subtotal in paise
  const calculateTotalPaise = () => {
    let total = 0;
    ticketTypes.forEach((tier) => {
      const qty = quantities[tier._id] || 0;
      total += qty * (tier.price || 0);
    });
    return total;
  };

  const totalSelectedTickets = Object.values(quantities).reduce((acc, q) => acc + q, 0);
  const totalAmountPaise = calculateTotalPaise();

  const handleBookingHold = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }

    if (totalSelectedTickets === 0) {
      setError('Please select at least 1 ticket to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Construct booking items matching backend schema:
      // items: [{ ticketTypeId, quantity }]
      const items = ticketTypes
        .filter((tier) => (quantities[tier._id] || 0) > 0)
        .map((tier) => ({
          ticketTypeId: tier._id,
          quantity: quantities[tier._id]
        }));

      const res = await bookingsApi.createBookingHold({
        eventId: event._id,
        items
      });

      const booking = res.data?.booking;
      if (booking?._id) {
        // Redirect directly to checkout countdown
        navigate(`/checkout/${booking._id}`);
      } else {
        throw new Error('No booking returned from server');
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to reserve ticket hold. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20">
        <LoadingSpinner text="Loading event details..." size="lg" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link to="/events">
          <Button variant="primary" size="md">
            Back to All Events
          </Button>
        </Link>
      </div>
    );
  }

  const imageUrl = getEventImage(event);
  const dateBadge = formatDateBadge(event.startsAt);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* 1. Cinematic Hero Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[21/9] min-h-[340px] max-h-[500px] bg-slate-950">
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Top Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <Badge variant={event.status || 'published'} dot={true} className="text-xs px-3 py-1 bg-black/60 backdrop-blur-md text-white border-white/20">
            {event.status || 'Published'}
          </Badge>
        </div>

        {/* Event Header Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white tracking-tight drop-shadow-md">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-purple" />
                {formatEventDate(event.startsAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-coral" />
                {event.venue || 'Venue TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Two-Column Main Content & Booking Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Event Description, Schedule, Organizer */}
        <div className="lg:col-span-7 space-y-8">
          {/* About Event */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-4">
            <h2 className="text-2xl font-serif font-bold text-slate-900">About this Experience</h2>
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description ||
                'Join us for an unforgettable live experience packed with world-class performances, electric atmosphere, and state-of-the-art stage production. Reserve your tickets early to secure the best seats.'}
            </div>
          </div>

          {/* Date, Time & Venue Specs */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft space-y-6">
            <h2 className="text-xl font-serif font-bold text-slate-900">Schedule & Location</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-brand-purple shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400">Date & Time</h4>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {formatEventDate(event.startsAt)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Ends: {formatEventDate(event.endsAt, 'EEE, dd MMM • hh:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-brand-coral shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400">Location</h4>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {event.venue || 'Venue Address'}
                  </p>
                  <p className="text-xs text-slate-500">Official venue gate entry</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Trust Badge */}
          <div className="bg-gradient-to-r from-slate-900 to-brand-navy rounded-3xl p-6 text-white flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-purple">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Organized by</p>
                <h4 className="text-base font-bold text-white">
                  {event.organization?.name || 'Verified Event Producer'}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" /> Verified Organizer
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Tier Selection & Booking Action */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
                Instant Reservation
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">Select Tickets</h3>
              <p className="text-xs text-slate-500 mt-1">
                Prices include all booking fees. 10-minute hold guaranteed upon checkout.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Ticket Tier Cards */}
            <div className="space-y-4">
              {ticketTypes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No ticket tiers currently active for this event.
                </div>
              ) : (
                ticketTypes.map((tier) => {
                  const available = tier.availableCapacity !== undefined
                    ? tier.availableCapacity
                    : Math.max(0, tier.totalCapacity - ((tier.reservedCount || 0) + (tier.soldCount || 0)));
                  const isSoldOut = available <= 0;
                  const qty = quantities[tier._id] || 0;

                  return (
                    <div
                      key={tier._id}
                      className={`p-4 rounded-2xl border transition-all ${
                        qty > 0
                          ? 'border-brand-purple bg-indigo-50/40 ring-1 ring-brand-purple/20'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{tier.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{tier.description || 'General Admission'}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900">
                              {formatPaiseToINR(tier.price)}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                isSoldOut
                                  ? 'bg-rose-100 text-rose-700'
                                  : available < 10
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isSoldOut ? 'Sold Out' : `${available} left`}
                            </span>
                          </div>
                        </div>

                        {/* Stepper (+ / -) */}
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                          <button
                            type="button"
                            disabled={qty === 0}
                            onClick={() => handleQuantityChange(tier._id, -1, available)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            disabled={isSoldOut || qty >= available || qty >= 10}
                            onClick={() => handleQuantityChange(tier._id, 1, available)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total and Checkout Action */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Selected Tickets</span>
                <span className="font-bold text-slate-900">{totalSelectedTickets}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-brand-purple">
                  {formatPaiseToINR(totalAmountPaise)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={submitting}
                disabled={totalSelectedTickets === 0 || submitting}
                onClick={handleBookingHold}
                className="w-full rounded-2xl shadow-glow py-3.5 text-base"
              >
                {isAuthenticated ? 'Reserve Tickets' : 'Sign In to Reserve'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% money back guarantee on event cancellation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
