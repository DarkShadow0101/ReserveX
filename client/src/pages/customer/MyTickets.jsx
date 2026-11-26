import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, QrCode, ShieldCheck } from 'lucide-react';
import { ticketsApi } from '../../api/tickets.api';
import { formatEventDate } from '../../utils/date';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export default function MyTickets() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-coral">
              Digital Pass Wallet
            </span>
            <span className="w-6 h-[1px] bg-brand-coral/60" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
            My Tickets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Present your cryptographically signed QR code at the entrance for instant check-in.
          </p>
        </div>

        <Link to="/my-bookings">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/[0.05] border-white/20 text-white hover:bg-white/10"
          >
            View All Bookings
          </Button>
        </Link>
      </div>

      {loading || authLoading ? (
        <LoadingSpinner theme="dark" text="Loading your digital tickets..." />
      ) : !isAuthenticated ? (
        <div className="text-center py-20 bg-[#12172A]/85 rounded-3xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">Sign in to access your QR wallet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your confirmed digital passes and scannable entry codes are stored securely in your account.
          </p>
          <Link to="/login?redirect=/my-tickets" className="inline-block pt-2">
            <Button variant="primary" size="md" className="bg-brand-purple hover:bg-indigo-500">
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
                className="bg-[#12172A]/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-indigo-400/45 shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/7] overflow-hidden bg-brand-navy">
                  <img
                    src={imageUrl}
                    alt={event.title || 'Event'}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12172A] via-brand-navy/45 to-black/20" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={ticket.status} theme="dark" dot={true} className="backdrop-blur-md">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-serif font-bold text-lg truncate">
                      {event.title || 'Event Pass'}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tier</span>
                      <span className="font-bold text-indigo-300 uppercase">{ticket.tierName}</span>
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
                      <Calendar className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                      <span>{formatEventDate(event.startsAt, 'EEE, dd MMM yyyy • hh:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-brand-coral shrink-0" />
                      <span className="truncate">{event.venue || 'Venue TBD'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/10 rounded-lg">
                        <QrCode className="w-4 h-4 text-indigo-300" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">
                        {ticket.qrToken?.substring(0, 16)}...
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                      className="rounded-xl bg-brand-purple hover:bg-indigo-500 shadow-sm text-xs"
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
        <div className="text-center py-20 bg-[#12172A]/85 rounded-3xl border border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-white">No tickets found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You don't have any event tickets yet. Explore upcoming experiences and book your passes now.
          </p>
          <Link to="/events" className="inline-block pt-2">
            <Button variant="primary" size="md" className="bg-brand-purple hover:bg-indigo-500">
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
        description="Present this QR code at the venue entrance for instant admission."
        maxWidth="max-w-sm"
        theme="dark"
      >
        {selectedTicket && (
          <div className="rounded-2xl bg-[#0B0F19] border border-white/10 overflow-hidden">
            {/* Top QR Section */}
            <div className="p-5 text-center space-y-4">
              <div className="flex justify-center">
                <Badge variant={selectedTicket.status} theme="dark" dot={true} className="text-[11px] px-3 py-1">
                  {selectedTicket.status} TICKET
                </Badge>
              </div>

              {/* High-contrast white QR pad for reliable gate scanning */}
              <div className="p-3.5 bg-white rounded-2xl inline-block shadow-lg">
                <QRCodeSVG
                  value={selectedTicket.qrToken || 'INVALID_TOKEN'}
                  size={172}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="font-mono text-xs text-indigo-300 font-bold tracking-wider">
                {selectedTicket.ticketNumber}
              </p>
            </div>

            {/* Perforated Ticket Stub Divider */}
            <div className="relative flex items-center my-1">
              <span className="w-4 h-4 rounded-full bg-[#12172A] border-r border-white/10 -ml-2 shrink-0" />
              <div className="flex-1 border-t border-dashed border-white/15 mx-1" />
              <span className="w-4 h-4 rounded-full bg-[#12172A] border-l border-white/10 -mr-2 shrink-0" />
            </div>

            {/* Bottom Event Stub */}
            <div className="p-5 space-y-3">
              <div className="text-left space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Event</span>
                  <span className="font-bold text-white text-right truncate">
                    {selectedTicket.event?.title}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Tier</span>
                  <span className="font-bold text-indigo-300">{selectedTicket.tierName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Holder</span>
                  <span className="font-semibold text-white truncate">
                    {selectedTicket.customerName}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Date</span>
                  <span className="font-semibold text-white">
                    {formatEventDate(selectedTicket.event?.startsAt, 'EEE, dd MMM yyyy • hh:mm a')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cryptographically signed QR token</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
