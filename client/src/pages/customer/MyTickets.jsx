import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, QrCode, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ticketsApi } from '../../api/tickets.api';
import { formatEventDate } from '../../utils/date';
import { getEventImage } from '../../mocks/eventImages';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const res = await ticketsApi.getMyTickets();
        setTickets(res.data?.tickets || []);
      } catch (err) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
            Digital Pass Wallet
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-1">
            My Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Present your cryptographically signed QR code at the entrance for instant check-in.
          </p>
        </div>

        <Link to="/my-bookings">
          <Button variant="outline" size="sm">
            View All Bookings
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your digital tickets..." />
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const event = ticket.event || {};
            const imageUrl = getEventImage(event);

            return (
              <div
                key={ticket._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col"
              >
                {/* Event header strip */}
                <div className="relative aspect-[16/7] overflow-hidden bg-slate-900">
                  <img
                    src={imageUrl}
                    alt={event.title || 'Event'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={ticket.status} dot={true} className="bg-black/60 text-white backdrop-blur-md">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base truncate">{event.title || 'Event Pass'}</h3>
                  </div>
                </div>

                {/* Ticket Details & Mini QR preview */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Tier:</span>
                      <span className="font-bold text-brand-purple uppercase">{ticket.tierName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Ticket #:</span>
                      <span className="font-mono font-medium text-slate-900">{ticket.ticketNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Attendee:</span>
                      <span className="font-medium text-slate-900">{ticket.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatEventDate(event.startsAt, 'EEE, dd MMM yyyy • hh:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{event.venue || 'Venue TBD'}</span>
                    </div>
                  </div>

                  {/* Scannable Token Trigger */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <QrCode className="w-4 h-4 text-slate-700" />
                      </div>
                      <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]">
                        {ticket.qrToken?.substring(0, 16)}...
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                      className="rounded-xl shadow-sm text-xs"
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
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-brand-purple flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-800">No tickets found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You don't have any event tickets yet. Explore upcoming experiences and book your seats now!
          </p>
          <Link to="/events">
            <Button variant="primary" size="md">
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
        description="Scan this QR code at the event entrance for fast-track entry."
        maxWidth="max-w-md"
      >
        {selectedTicket && (
          <div className="space-y-6 text-center">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant={selectedTicket.status} dot={true} className="text-xs px-3 py-1">
                {selectedTicket.status} TICKET
              </Badge>
            </div>

            {/* Cryptographically Signed QR Code Display */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG
                value={selectedTicket.qrToken || 'INVALID_TOKEN'}
                size={220}
                level="H"
                includeMargin={true}
              />
              <p className="font-mono text-xs text-slate-400 mt-2 tracking-wider">
                {selectedTicket.ticketNumber}
              </p>
            </div>

            {/* Event Summary */}
            <div className="text-left bg-slate-50/60 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="font-bold text-slate-900">{selectedTicket.event?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tier:</span>
                <span className="font-semibold text-brand-purple">{selectedTicket.tierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Holder:</span>
                <span className="font-semibold text-slate-900">{selectedTicket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-900">
                  {formatEventDate(selectedTicket.event?.startsAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cryptographically verified QR token</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
