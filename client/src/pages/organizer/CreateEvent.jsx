import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { organizationsApi } from '../../api/organizations.api';
import { useOrg } from '../../context/OrgContext';
import { extractErrorMessage } from '../../utils/errors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { activeOrgId } = useOrg();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startsAt || !endsAt) {
      setError('Title, Start Date, and End Date are required');
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (endDate <= startDate) {
      setError('Event end date must be after the start date');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await organizationsApi.createEvent(activeOrgId, {
        title,
        description,
        venue,
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString()
      });

      const newEvent = res.data?.event;
      if (newEvent?._id) {
        // Redirect to event management to configure ticket tiers
        navigate(`/organizer/events/${newEvent._id}`);
      } else {
        navigate('/organizer/events');
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create event'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF4D2D]">
          Step 1 of 2
        </span>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white mt-1">
          Create New Event
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Set up basic event details, then configure ticket tiers and publish.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-400/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 border-white/10 bg-[#12151E]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Event Title"
            required
            placeholder="e.g. Sunburn Festival Goa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block font-mono text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the lineup, schedule, and gate entry guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090A0E] border border-white/15 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF4D2D] focus:ring-1 focus:ring-[#FF4D2D]"
            />
          </div>

          <Input
            label="Venue / Location"
            placeholder="e.g. Jio World Garden, BKC, Mumbai"
            icon={MapPin}
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              required
              icon={Calendar}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />

            <Input
              label="End Date & Time"
              type="datetime-local"
              required
              icon={Calendar}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>

          <div className="border-t border-white/10 pt-5 flex items-center justify-end gap-3">
            <Link to="/organizer/events">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              className="rounded-xl px-6"
            >
              Continue to Ticket Tiers →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
