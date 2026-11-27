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
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

const RESERVEX_RZP_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#D9381E"/><path d="M38 38L90 90M90 38L38 90" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/></svg>'
  );

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { showToast } = useToast();

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
          image: RESERVEX_RZP_LOGO,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              setProcessingPayment(true);
              setError(null);
              const verifyRes = await paymentsApi.verifyPayment({
                bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyRes.success) {
                showToast('Payment verified & QR tickets issued!');
                setSuccess(true);
                return;
              }
            } catch (vErr) {
              // Refetch booking status in case webhook confirmed the booking concurrently
              try {
                const refreshed = await bookingsApi.getBookingById(bookingId);
                const latestBooking = refreshed.data?.booking;
                if (latestBooking) {
                  setBooking(latestBooking);
                  if (latestBooking.status === 'CONFIRMED') {
                    setError(null);
                    setSuccess(true);
                    return;
                  }
                }
              } catch {
                // Ignore secondary fetch error and surface original verification error
              }
              setError(extractErrorMessage(vErr, 'Payment verification failed'));
            } finally {
              setProcessingPayment(false);
            }
          },
          modal: {
            backdropclose: false,
            escape: true,
            confirm_close: true,
            animation: true,
            ondismiss: function () {
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: booking.user?.fullName,
            email: booking.user?.email
          },
          theme: {
            color: '#D9381E',
            backdrop_color: isDark ? '#06080E' : '#F5F3EE'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setProcessingPayment(false);
          setError(`Payment Failed: ${resp.error.description || 'Card/UPI declined'}`);
        });
        rzp.open();
        return;
      } else {
        setError(
          'Razorpay checkout is not configured. Set valid VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET test keys in your environment to complete payment.'
        );
        setProcessingPayment(false);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Payment processing encountered an error'));
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
        <h2 className="text-2xl font-sans font-bold text-white">Checkout Error</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <Link to="/events" className="inline-block pt-2">
          <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
            Browse Events
          </Button>
        </Link>
      </div>
    );
  }

  if (success || booking?.status === 'CONFIRMED') {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#10B981]">
            Payment Verified & Tickets Issued
          </span>
          <h1 className="font-display uppercase text-4xl sm:text-5xl font-bold text-white">
            Booking Confirmed
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Your booking <span className="font-mono font-bold text-[#FF4D2D]">{booking.bookingReference}</span> is confirmed. Your QR gate passes are ready in My Tickets.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-tickets">
            <Button variant="primary" size="lg" className="w-full sm:w-auto bg-[#FF4D2D] hover:bg-[#E63E20] shadow-glow">
              View My Tickets <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/[0.05] border-white/15 text-white hover:bg-white/10">
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
        <h2 className="text-2xl font-sans font-bold text-white">
          {booking?.status === 'CANCELLED' ? 'Booking Cancelled' : 'Reservation Time Expired'}
        </h2>
        <p className="text-sm text-slate-400">
          {booking?.status === 'CANCELLED'
            ? 'This reservation was cancelled and your selected seats were released.'
            : 'The 10-minute checkout window expired and the seats were released.'}
        </p>
        <Link to={`/events/${booking.event?._id || booking.event}`} className="inline-block pt-2">
          <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
            Reserve Again
          </Button>
        </Link>
      </div>
    );
  }

  const checkoutBackdropImg = booking?.event ? getEventImage(booking.event) : FALLBACK_EVENT_IMAGE;

  return (
    <div className="relative">
      {/* Event stage atmosphere backdrop behind Checkout */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[440px] z-0 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)'
        }}
      >
        <img
          src={checkoutBackdropImg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-[0.22] blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090D]/55 via-[#07090D]/75 to-[#07090D]" />
      </div>

      {/* Obsidian transition shield while Razorpay opens / verifies */}
      {processingPayment && (
        <div className="fixed inset-0 z-40 bg-[#07090D]/88 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-[#10131C] border border-white/15 rounded-2xl p-6 max-w-sm w-full text-center space-y-3 shadow-2xl">
            <LoadingSpinner theme="dark" size="md" text="Securing Razorpay session..." />
            <p className="text-xs text-slate-400">
              Complete payment inside the Razorpay window. Do not close or refresh this tab.
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Booking Progress Steps */}
        <div className="flex items-center justify-between text-xs font-semibold border-b border-white/10 pb-5">
          <div className="flex items-center gap-2 text-[#10B981]">
            <span className="font-mono w-6 h-6 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Tickets Selected</span>
          </div>
          <div className="flex-1 h-[1px] bg-white/15 mx-3" />
          <div className="flex items-center gap-2 text-white">
            <span className="font-mono w-6 h-6 rounded-full bg-[#D9381E] text-white flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Payment</span>
          </div>
          <div className="flex-1 h-[1px] bg-white/15 mx-3" />
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-mono w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>QR Tickets</span>
          </div>
        </div>

      {/* Hold Expiry Countdown Banner */}
      <div className="bg-[#101219] border border-amber-400/35 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Seats Held for Checkout</h4>
            <p className="text-xs text-slate-400">
              Complete payment before the timer runs out to confirm your passes.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-2xl font-mono font-bold text-amber-300">
            {formattedTime}
          </span>
          <span className="block font-mono text-[10px] uppercase font-semibold text-slate-400">Time Left</span>
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
          <div className="bg-[#101219] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Booking Reference
              </span>
              <p className="font-mono text-xl font-bold text-[#FF4D2D] mt-0.5">
                {booking.bookingReference}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-sans font-bold text-white">
                {booking.event?.title || 'Live Event Ticket'}
              </h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF4D2D]" />
                  {formatEventDate(booking.event?.startsAt)}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {booking.event?.venue || 'Venue TBD'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Ticket Breakdown
              </h4>
              <div className="divide-y divide-white/10">
                {booking.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="font-mono text-xs text-slate-400">
                        {item.quantity} × {formatPaiseToINR(item.pricePerUnit)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {formatPaiseToINR(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#101219] rounded-2xl p-6 sm:p-8 border border-white/15 shadow-card space-y-6">
            <h3 className="text-xl font-sans font-bold text-white">Payment Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono">{formatPaiseToINR(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Convenience Fee</span>
                <span className="font-mono text-[#10B981] font-medium">FREE</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-white text-base">Total Amount</span>
                <span className="font-mono text-2xl font-bold text-white">
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
                className="w-full rounded-xl bg-[#D9381E] hover:bg-[#C92C12] py-3.5 text-base gap-2"
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
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>256-bit SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
