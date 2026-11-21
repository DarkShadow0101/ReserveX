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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
          Step 1 of 2
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
          Create New Event
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Set up basic event details. You can configure ticket tiers and publish it on the next step.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 border-slate-100 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Event Title"
            required
            placeholder="e.g. Sunburn Festival Goa 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the experience, lineup, schedule, and gate entry guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
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

          <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
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
              className="rounded-2xl shadow-glow px-6"
            >
              Continue to Ticket Tiers →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
