import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  AlertCircle,
  Ticket,
  Receipt
} from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { ticketTypesApi } from '../../api/ticketTypes.api';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import { extractErrorMessage } from '../../utils/errors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function EventDetailManage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit Event State
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  // Ticket Tier Modal State
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [tierName, setTierName] = useState('');
  const [tierDesc, setTierDesc] = useState('');
  const [tierPriceRupees, setTierPriceRupees] = useState('');
  const [tierCapacity, setTierCapacity] = useState('');
  const [savingTier, setSavingTier] = useState(false);
  const [tierError, setTierError] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [evRes, tiersRes] = await Promise.all([
        eventsApi.getEventForOrganizer(id),
        ticketTypesApi.getTicketTypesForEvent(id, true)
      ]);

      const ev = evRes.data?.event;
      setEvent(ev);
      setTicketTypes(tiersRes.data?.ticketTypes || []);

      if (ev) {
        setEditTitle(ev.title || '');
        setEditDesc(ev.description || '');
        setEditVenue(ev.venue || '');
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load event details'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      setSavingEvent(true);
      setError(null);
      await eventsApi.updateEvent(id, {
        title: editTitle,
        description: editDesc,
        venue: editVenue
      });
      setSuccessMsg('Event details updated successfully');
      setIsEditingEvent(false);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to update event'));
    } finally {
      setSavingEvent(false);
    }
  };

  const handlePublish = async () => {
    if (ticketTypes.length === 0) {
      alert('You must add at least one ticket tier before publishing the event.');
      return;
    }
    if (!window.confirm('Are you sure you want to publish this event to the public marketplace?')) {
      return;
    }
    try {
      await eventsApi.publishEvent(id);
      setSuccessMsg('Event published live to marketplace!');
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to publish event'));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Warning: Cancelling this event will prevent any new bookings. Proceed?')) {
      return;
    }
    try {
      await eventsApi.cancelEvent(id);
      setSuccessMsg('Event cancelled successfully');
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to cancel event'));
    }
  };

  const handleToggleTier = async (tierId) => {
    try {
      await ticketTypesApi.toggleTicketTypeStatus(tierId);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not toggle tier status'));
    }
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();
    if (!tierName || !tierCapacity) {
      setTierError('Tier Name and Total Capacity are required');
      return;
    }

    const priceRupees = parseFloat(tierPriceRupees || '0');
    if (isNaN(priceRupees) || priceRupees < 0) {
      setTierError('Price must be a valid positive amount');
      return;
    }

    const capacityNum = parseInt(tierCapacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      setTierError('Total capacity must be at least 1');
      return;
    }

    try {
      setSavingTier(true);
      setTierError(null);

      // Convert rupees to integer paise for backend
      const priceInPaise = Math.round(priceRupees * 100);

      await ticketTypesApi.createTicketType(id, {
        name: tierName,
        description: tierDesc,
        price: priceInPaise,
        totalCapacity: capacityNum
      });

      setTierModalOpen(false);
      setTierName('');
      setTierDesc('');
      setTierPriceRupees('');
      setTierCapacity('');
      setSuccessMsg('Ticket tier created successfully');
      await loadData();
    } catch (err) {
      setTierError(extractErrorMessage(err, 'Failed to create ticket tier'));
    } finally {
      setSavingTier(false);
    }
  };

  if (loading) {
    return <LoadingSpinner theme="dark" text="Loading event configuration..." size="lg" />;
  }

  if (error && !event) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link to="/organizer/events">
          <Button variant="primary" size="sm">
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {event.status === 'published' && (
            <Link to={`/events/${event._id}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                View Public Page <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          )}

          {event.status === 'draft' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              className="bg-[#10B981] hover:bg-emerald-600 text-[#060709] text-xs font-bold"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Publish Event
            </Button>
          )}

          {event.status !== 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-rose-400 hover:bg-rose-500/15 border-rose-400/35 text-xs"
            >
              <XCircle className="w-4 h-4 mr-1" /> Cancel Event
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-[#10B981]/15 border border-[#10B981]/35 rounded-xl text-xs text-[#34D399] font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-400/35 rounded-xl text-xs text-rose-200 font-medium">
          {error}
        </div>
      )}

      {/* Event Overview Card */}
      <Card className="p-6 sm:p-8 border-white/10 bg-[#12151E]">
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-sans font-bold text-white">{event.title}</h1>
              <Badge variant={event.status} theme="dark" dot={true}>
                {event.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">{event.venue || 'Venue TBD'}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingEvent(!isEditingEvent)}
            className="text-xs"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" /> {isEditingEvent ? 'Cancel Edit' : 'Edit Details'}
          </Button>
        </div>

        {/* Edit Form or Read View */}
        {isEditingEvent ? (
          <form onSubmit={handleUpdateEvent} className="pt-6 space-y-4">
            <Input
              label="Title"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div>
              <label className="block font-mono text-[11px] font-semibold uppercase text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-[#090A0E] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF4D2D]"
              />
            </div>
            <Input
              label="Venue"
              value={editVenue}
              onChange={(e) => setEditVenue(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingEvent(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={savingEvent}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
              <p className="mt-1 font-mono font-semibold text-white">
                {formatEventDate(event.startsAt)}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Date</span>
              <p className="mt-1 font-mono font-semibold text-white">
                {formatEventDate(event.endsAt)}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tiers</span>
              <p className="mt-1 font-mono font-semibold text-white">{ticketTypes.length} configured</p>
            </div>
          </div>
        )}
      </Card>

      {/* Ticket Tier Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-sans font-bold text-white">Ticket Tiers & Inventory</h2>
            <p className="text-xs text-slate-400">
              Configure seat categories, prices in INR, and live capacity allocations.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setTierModalOpen(true)}
            className="rounded-xl text-xs gap-1"
          >
            <Plus className="w-4 h-4" /> Add Ticket Tier
          </Button>
        </div>

        {ticketTypes.length === 0 ? (
          <div className="text-center py-12 bg-[#12151E] rounded-2xl border border-dashed border-white/10 p-6 space-y-3">
            <Ticket className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No ticket tiers yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create at least one ticket tier (e.g. Early Bird, VIP, General Admission) before publishing.
            </p>
            <Button variant="primary" size="sm" onClick={() => setTierModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Tier
            </Button>
          </div>
        ) : (
          <div className="bg-[#12151E] rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#090A0E] text-slate-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Tier Name</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Total Cap</th>
                    <th className="py-3.5 px-4">Reserved</th>
                    <th className="py-3.5 px-4">Sold</th>
                    <th className="py-3.5 px-4">Available</th>
                    <th className="py-3.5 px-4">Active</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ticketTypes.map((tier) => {
                    const available = tier.availableCapacity !== undefined
                      ? tier.availableCapacity
                      : Math.max(0, tier.totalCapacity - ((tier.reservedCount || 0) + (tier.soldCount || 0)));

                    return (
                      <tr key={tier._id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-white">{tier.name}</p>
                          <p className="text-[11px] text-slate-400">{tier.description || 'General Admission'}</p>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          {formatPaiseToINR(tier.price)}
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-slate-300">{tier.totalCapacity}</td>
                        <td className="py-4 px-4 font-mono text-amber-300 font-semibold">{tier.reservedCount || 0}</td>
                        <td className="py-4 px-4 font-mono text-[#10B981] font-semibold">{tier.soldCount || 0}</td>
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          <span className={`px-2 py-0.5 rounded-md ${available <= 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-[#10B981]/20 text-[#34D399]'}`}>
                            {available}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${tier.isActive ? 'bg-[#10B981]/15 text-[#34D399]' : 'bg-white/10 text-slate-400'}`}>
                            {tier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleTier(tier._id)}
                            className="p-1.5 text-slate-400 hover:text-[#FF4D2D] cursor-pointer"
                            title={tier.isActive ? 'Deactivate tier' : 'Activate tier'}
                          >
                            {tier.isActive ? (
                              <ToggleRight className="w-6 h-6 text-[#10B981]" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-500" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Ticket Tier */}
      <Modal
        isOpen={tierModalOpen}
        onClose={() => setTierModalOpen(false)}
        title="Add Ticket Tier"
        description="Configure tier pricing, capacity, and sales parameters."
        theme="dark"
      >
        <form onSubmit={handleCreateTier} className="space-y-4">
          {tierError && (
            <div className="p-3 bg-rose-500/15 text-rose-200 text-xs rounded-xl border border-rose-400/30">
              {tierError}
            </div>
          )}

          <Input
            label="Tier Name"
            required
            placeholder="e.g. VIP Early Bird, General Pass"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Includes welcome drinks & fast-track entry"
            value={tierDesc}
            onChange={(e) => setTierDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (INR ₹)"
              type="number"
              min="0"
              required
              placeholder="e.g. 999"
              value={tierPriceRupees}
              onChange={(e) => setTierPriceRupees(e.target.value)}
            />

            <Input
              label="Total Capacity"
              type="number"
              min="1"
              required
              placeholder="e.g. 500"
              value={tierCapacity}
              onChange={(e) => setTierCapacity(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={() => setTierModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={savingTier}>
              Save Tier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
