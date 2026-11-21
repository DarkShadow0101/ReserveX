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
  Ticket,
  ArrowRight,
  Info
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

  // Initialize countdown based on booking.holdExpiresAt
  const { secondsLeft, formattedTime, isExpired } = useCountdown(booking?.holdExpiresAt);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError(null);
        const res = await bookingsApi.getBookingById(bookingId);
        const b = res.data?.booking;
        setBooking(b);
        if (b.status === 'CONFIRMED') {
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

  // Main payment processing with Razorpay integration and test fallback simulator
  const handlePayNow = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      // 1. Create Razorpay Order from backend
      const orderRes = await paymentsApi.createPaymentOrder(bookingId);
      const orderData = orderRes.data?.order;

      if (!orderData?.orderId) {
        throw new Error('Failed to create payment order from gateway');
      }

      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_reservex_local';

      // 2. Check if Razorpay script is loaded in window
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
              // 3. Verify Razorpay HMAC signature on backend
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
        // Fallback Razorpay Test Mode Simulator (handles local test credentials smoothly)
        // Simulate real Razorpay checkout completion and submit to backend verification
        const mockPaymentId = `pay_test_${Date.now()}`;
        // Generate HMAC signature or let backend verification run in test mode
        const verifyRes = await paymentsApi.verifyPayment({
          bookingId,
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: `test_sig_${orderData.orderId}_${mockPaymentId}`
        });

        if (verifyRes.success) {
          setSuccess(true);
        }
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
        <LoadingSpinner text="Securing booking details..." size="lg" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="pt-32 pb-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Checkout Error</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link to="/events">
          <Button variant="primary" size="md">
            Browse Events
          </Button>
        </Link>
      </div>
    );
  }

  // If already confirmed or just paid successfully
  if (success || booking.status === 'CONFIRMED') {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Payment Verified & Tickets Issued
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            You're Going! 🎉
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your booking <span className="font-mono font-bold text-slate-800">{booking.bookingReference}</span> is confirmed. Cryptographically signed QR tickets are now available in your digital wallet.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-tickets">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-glow">
              View My Tickets <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore More Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If booking hold has expired
  if (isExpired || booking.status === 'EXPIRED') {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Booking Hold Expired</h2>
        <p className="text-sm text-slate-500">
          The 10-minute hold window for this reservation has expired, and the tickets have been safely released to other customers.
        </p>
        <Link to={`/events/${booking.event?._id || booking.event}`}>
          <Button variant="primary" size="md">
            Reserve Again
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* 1. Hold Expiry Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Tickets Reserved on Hold</h4>
            <p className="text-xs text-slate-600">
              Complete checkout before your hold expires to guarantee inventory.
            </p>
          </div>
        </div>

        {/* Live Countdown Counter */}
        <div className="text-right">
          <span className="block text-2xl font-mono font-extrabold text-amber-600">
            {formattedTime}
          </span>
          <span className="block text-[10px] uppercase font-bold text-slate-400">Time Left</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Checkout Notice</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 2. Order Review & Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Event Summary & Ticket Items */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Booking Reference
              </span>
              <p className="font-mono text-xl font-extrabold text-brand-purple">
                {booking.bookingReference}
              </p>
            </div>

            {/* Event Info */}
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {booking.event?.title || 'Live Event Ticket'}
              </h3>
              <div className="space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatEventDate(booking.event?.startsAt)}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {booking.event?.venue || 'Venue TBD'}
                </p>
              </div>
            </div>

            {/* Ticket Breakdown List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ticket Details
              </h4>
              <div className="divide-y divide-slate-100">
                {booking.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x {formatPaiseToINR(item.pricePerUnit)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatPaiseToINR(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Price Breakdown & Payment Trigger */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <h3 className="text-lg font-serif font-bold text-slate-900">Payment Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPaiseToINR(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Convenience Fee</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-base">Total Amount</span>
                <span className="text-2xl font-black text-brand-purple">
                  {formatPaiseToINR(booking.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                loading={processingPayment}
                disabled={processingPayment || isExpired}
                onClick={handlePayNow}
                className="w-full rounded-2xl shadow-glow py-3.5 text-base gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay with Razorpay
              </Button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelHold}
                className="w-full py-2 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer text-center"
              >
                {cancelling ? 'Cancelling...' : 'Release Tickets / Cancel Hold'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
