import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Search, Edit3, Eye, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { organizationsApi } from '../../api/organizations.api';
import { useOrg } from '../../context/OrgContext';
import { formatEventDate } from '../../utils/date';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function EventsManage() {
  const navigate = useNavigate();
  const { activeOrg, activeOrgId } = useOrg();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadEvents() {
      if (!activeOrgId) return;
      try {
        setLoading(true);
        const res = await organizationsApi.getOrganizationEvents(activeOrgId);
        setEvents(res.data?.events || []);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [activeOrgId]);

  const filteredEvents = events.filter((ev) => {
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
    const matchesSearch =
      !search ||
      (ev.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (ev.venue || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Organization Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage draft, published, and completed events for {activeOrg?.name}.
          </p>
        </div>

        <Link to="/organizer/events/new">
          <Button variant="primary" size="md" className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Create New Event
          </Button>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#12151E] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'published', 'draft', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#FF4D2D] text-white'
                  : 'bg-[#090A0E] text-slate-300 border border-white/10 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#090A0E] border border-white/15 text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#FF4D2D]"
          />
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <LoadingSpinner theme="dark" text="Loading events..." />
      ) : filteredEvents.length > 0 ? (
        <div className="bg-[#12151E] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#090A0E] text-slate-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Event</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEvents.map((ev) => {
                  const img = getEventImage(ev);
                  return (
                    <tr key={ev._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3.5 font-bold text-white">
                        <img
                          src={img}
                          alt={ev.title}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                          }}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{ev.title}</p>
                          <span className="text-[11px] font-normal text-slate-400 line-clamp-1">
                            {ev.description || 'No description provided'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatEventDate(ev.startsAt, 'dd MMM yyyy • hh:mm a')}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#FF4D2D]" />
                          <span className="truncate max-w-[140px]">{ev.venue || 'Venue TBD'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={ev.status} theme="dark" dot={true}>
                          {ev.status === 'published' ? 'Published' : ev.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/organizer/events/${ev._id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs py-1.5">
                              <Edit3 className="w-3.5 h-3.5 mr-1" /> Manage & Tiers
                            </Button>
                          </Link>

                          {ev.status === 'published' && (
                            <Link to={`/events/${ev._id}`} target="_blank">
                              <button
                                type="button"
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                                title="View public page"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#12151E] rounded-2xl border border-dashed border-white/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4D2D]/15 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No events found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search ? 'Try adjusting your search criteria.' : 'Create your first event to get started.'}
          </p>
          <Link to="/organizer/events/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Create Event
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
