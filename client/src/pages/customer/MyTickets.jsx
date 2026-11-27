import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, QrCode, ShieldCheck, Copy } from 'lucide-react';
import { ticketsApi } from '../../api/tickets.api';
import { formatEventDate } from '../../utils/date';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export default function MyTickets() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleCopyToken = async (qrToken) => {
    if (!qrToken) return;
    try {
      await navigator.clipboard.writeText(qrToken);
      showToast('Signed QR token copied to clipboard!');
    } catch {
      showToast('Could not copy QR token.', 'error');
    }
  };

  useEffect(() => {
    async function loadTickets() {
      if (!isAuthenticated) {
        setTickets([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await ticketsApi.getMyTickets();
        setTickets(res.data?.tickets || []);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadTickets();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display uppercase text-3xl sm:text-4xl font-bold text-white">
            My Tickets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Show your QR gate pass at the venue entrance for fast entry.
          </p>
        </div>

        <Link to="/my-bookings">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/[0.05] border-white/15 text-white hover:bg-white/10"
          >
            View All Bookings
          </Button>
        </Link>
      </div>

      {loading || authLoading ? (
        <LoadingSpinner text="Loading your passes..." />
      ) : !isAuthenticated ? (
        <div className="text-center py-20 bg-[#101219] rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-sans font-bold text-white">Sign in to view your passes</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your confirmed digital passes and QR entry codes are stored securely in your account.
          </p>
          <Link to="/login?redirect=/my-tickets" className="inline-block pt-2">
            <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
              Sign In
            </Button>
          </Link>
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const event = ticket.event || {};
            const imageUrl = getEventImage(event);

            return (
              <div
                key={ticket._id}
                className="bg-[#101219] rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF4D2D]/50 shadow-card transition-all duration-300 flex flex-col"
              >
                <div data-photo-overlay="true" className="relative aspect-[16/7] overflow-hidden bg-[#060709]">
                  <img
                    src={imageUrl}
                    alt={event.title || 'Event'}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101219] via-[#060709]/45 to-black/20" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={ticket.status} theme="dark" dot={true} className="backdrop-blur-md">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-sans font-bold text-lg truncate">
                      {event.title || 'Event Pass'}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tier</span>
                      <span className="font-mono font-bold text-[#FF4D2D] uppercase">{ticket.tierName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ticket #</span>
                      <span className="font-mono font-medium text-white">{ticket.ticketNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Attendee</span>
                      <span className="font-medium text-white">{ticket.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatEventDate(event.startsAt, 'EEE, dd MMM yyyy • hh:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-[#FF4D2D] shrink-0" />
                      <span className="truncate">{event.venue || 'Venue TBD'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/[0.06] border border-white/10 rounded-lg">
                        <QrCode className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">
                        {ticket.qrToken?.substring(0, 16)}...
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                      className="rounded-xl bg-[#FF4D2D] hover:bg-[#E63E20] text-xs"
                    >
                      Show QR Pass
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#101219] rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-sans font-bold text-white">No tickets found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You don't have any event tickets yet. Explore upcoming live shows and book your passes now.
          </p>
          <Link to="/events" className="inline-block pt-2">
            <Button variant="primary" size="md" className="bg-[#FF4D2D] hover:bg-[#E63E20]">
              Explore Events
            </Button>
          </Link>
        </div>
      )}

      {/* Individual Digital Pass QR Code Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Event Gate Pass"
        description="Present this QR code at the entrance."
        maxWidth="max-w-xs sm:max-w-sm"
      >
        {selectedTicket && (
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-[#0B0D13] border-white/15' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Gate Pass Header + Metadata */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  ReserveX GATE PASS
                </span>
                <Badge variant={selectedTicket.status} dot={true} className="text-[10px] px-2.5 py-0.5">
                  {selectedTicket.status} TICKET
                </Badge>
              </div>

              <h4 className="font-sans text-lg font-bold text-white leading-snug">
                {selectedTicket.event?.title || 'Live Event Pass'}
              </h4>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs pt-1">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">Tier</span>
                  <span className="font-semibold text-white truncate block mt-0.5">
                    {selectedTicket.tierName}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">Holder</span>
                  <span className="font-semibold text-white truncate block mt-0.5">
                    {selectedTicket.customerName}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">Venue</span>
                  <span className="font-medium text-slate-200 truncate block mt-0.5">
                    {selectedTicket.event?.venue || 'Venue TBD'}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">Date</span>
                  <span className="font-mono font-medium text-slate-200 truncate block mt-0.5">
                    {formatEventDate(selectedTicket.event?.startsAt, 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforated Ticket Stub Divider */}
            <div className="relative flex items-center">
              <span
                className={`w-4 h-4 rounded-full border-r -ml-2 shrink-0 ${
                  isDark ? 'bg-[#101219] border-white/15' : 'bg-white border-slate-200'
                }`}
              />
              <div className={`flex-1 border-t border-dashed mx-1 ${isDark ? 'border-white/20' : 'border-slate-300'}`} />
              <span
                className={`w-4 h-4 rounded-full border-l -mr-2 shrink-0 ${
                  isDark ? 'bg-[#101219] border-white/15' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            {/* Bottom QR Code & Serial Section */}
            <div className={`p-5 text-center space-y-3 ${isDark ? 'bg-[#08090E]' : 'bg-white'}`}>
              <div className="p-3 bg-[#F4F1EA] rounded-2xl inline-block shadow-lg border border-slate-200/80">
                <QRCodeSVG
                  value={selectedTicket.qrToken || 'INVALID_TOKEN'}
                  size={144}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="font-mono text-xs text-slate-300 font-semibold tracking-wider">
                {selectedTicket.ticketNumber}
              </p>

              <div className="pt-1 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span>Verified single-use entry pass</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyToken(selectedTicket.qrToken)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copy Gate Token
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
