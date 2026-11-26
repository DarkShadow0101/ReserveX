import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { bookingsApi } from '../../api/bookings.api';
import { paymentsApi } from '../../api/payments.api';
import { useCountdown } from '../../hooks/useCountdown';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import { extractErrorMessage } from '../../utils/errors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { formattedTime, isExpired } = useCountdown(booking?.holdExpiresAt);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError(null);
        const res = await bookingsApi.getBookingById(bookingId);
        const b = res.data?.booking;
        setBooking(b);
        if (b?.status === 'CONFIRMED') {
          setSuccess(true);
        }
      } catch (err) {
        setError(extractErrorMessage(err, 'Failed to retrieve booking information'));
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const handleCancelHold = async () => {
    if (!window.confirm('Are you sure you want to cancel this ticket hold? The tickets will be released back to other customers.')) {
      return;
    }

    try {
      setCancelling(true);
      await bookingsApi.cancelBookingHold(bookingId);
      navigate(`/events/${booking.event?._id || booking.event}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not cancel booking hold'));
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      const orderRes = await paymentsApi.createPaymentOrder(bookingId);
      const orderData = orderRes.data?.order;

      if (!orderData?.orderId) {
        throw new Error('Failed to create payment order from gateway');
      }

      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_reservex_local';

      if (window.Razorpay && !keyId.includes('placeholder') && !keyId.includes('local')) {
        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'ReserveX Events',
          description: `Booking ${booking.bookingReference}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await paymentsApi.verifyPayment({
                bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyRes.success) {
                setSuccess(true);
              }
            } catch (vErr) {
              setError(extractErrorMessage(vErr, 'Payment verification failed'));
            }
          },
          prefill: {
            name: booking.user?.fullName,
            email: booking.user?.email
          },
          theme: {
            color: '#5B4CF2'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(`Payment Failed: ${resp.error.description || 'Card/UPI declined'}`);
        });
        rzp.open();
      } else {
        setError(
          'Razorpay checkout is not configured. Set valid VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET test keys in your environment to complete payment.'
        );
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Payment processing encountered an error'));
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20">
        <LoadingSpinner theme="dark" text="Securing booking details..." size="lg" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="pt-32 pb-24 max-w-lg mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">Checkout Error</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <Link to="/events" className="inline-block pt-2">
          <Button variant="primary" size="md" className="bg-brand-purple hover:bg-indigo-500">
            Browse Events
          </Button>
        </Link>
      </div>
    );
  }

  if (success || booking?.status === 'CONFIRMED') {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Payment Verified & Tickets Issued
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Booking Confirmed
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Your booking <span className="font-mono font-bold text-indigo-300">{booking.bookingReference}</span> is confirmed. Cryptographically signed QR tickets are ready in your digital wallet.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-tickets">
            <Button variant="primary" size="lg" className="w-full sm:w-auto bg-brand-purple hover:bg-indigo-500 shadow-glow">
              View My Tickets <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/[0.05] border-white/20 text-white hover:bg-white/10">
              Explore More Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isExpired || booking?.status === 'EXPIRED' || booking?.status === 'CANCELLED') {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          {booking?.status === 'CANCELLED' ? 'Booking Cancelled' : 'Booking Hold Expired'}
        </h2>
        <p className="text-sm text-slate-400">
          {booking?.status === 'CANCELLED'
            ? 'This reservation was cancelled and its tickets were released back to inventory.'
            : 'The 10-minute hold window for this reservation has expired, and the tickets have been safely released.'}
        </p>
        <Link to={`/events/${booking.event?._id || booking.event}`} className="inline-block pt-2">
          <Button variant="primary" size="md" className="bg-brand-purple hover:bg-indigo-500">
            Reserve Again
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Booking Progress Steps */}
      <div className="flex items-center justify-between text-xs font-semibold border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[11px]">
            1
          </span>
          <span>Tickets Selected</span>
        </div>
        <div className="flex-1 h-[1px] bg-white/15 mx-3" />
        <div className="flex items-center gap-2 text-white">
          <span className="w-6 h-6 rounded-full bg-brand-purple text-white flex items-center justify-center text-[11px] shadow-glow">
            2
          </span>
          <span>Hold & Payment</span>
        </div>
        <div className="flex-1 h-[1px] bg-white/15 mx-3" />
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px]">
            3
          </span>
          <span>QR Tickets</span>
        </div>
      </div>

      {/* Hold Expiry Countdown Banner */}
      <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Tickets Reserved on Hold</h4>
            <p className="text-xs text-slate-300">
              Complete payment before your hold expires to lock in your passes.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-2xl font-mono font-extrabold text-amber-300">
            {formattedTime}
          </span>
          <span className="block text-[10px] uppercase font-bold text-slate-400">Time Left</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-400/30 rounded-2xl text-sm text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Checkout Notice</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Order Review & Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#12172A]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Booking Reference
              </span>
              <p className="font-mono text-xl font-extrabold text-indigo-300 mt-0.5">
                {booking.bookingReference}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-white">
                {booking.event?.title || 'Live Event Ticket'}
              </h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  {formatEventDate(booking.event?.startsAt)}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-coral" />
                  {booking.event?.venue || 'Venue TBD'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ticket Breakdown
              </h4>
              <div className="divide-y divide-white/10">
                {booking.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.quantity} × {formatPaiseToINR(item.pricePerUnit)}
                      </p>
                    </div>
                    <span className="font-bold text-white">
                      {formatPaiseToINR(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#12172A]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-400/25 shadow-2xl space-y-6">
            <h3 className="text-xl font-serif font-bold text-white">Payment Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{formatPaiseToINR(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Convenience Fee</span>
                <span className="text-emerald-400 font-medium">FREE</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-white text-base">Total Amount</span>
                <span className="text-2xl font-black text-indigo-300">
                  {formatPaiseToINR(booking.totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                loading={processingPayment}
                disabled={processingPayment || isExpired}
                onClick={handlePayNow}
                className="w-full rounded-2xl bg-brand-purple hover:bg-indigo-500 shadow-glow py-3.5 text-base gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay with Razorpay
              </Button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelHold}
                className="w-full py-2 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer text-center"
              >
                {cancelling ? 'Cancelling...' : 'Release Tickets / Cancel Hold'}
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
