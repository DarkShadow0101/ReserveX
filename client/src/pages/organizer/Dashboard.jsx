import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Ticket,
  Calendar,
  Users,
  ArrowRight,
  MoreVertical,
  Plus,
  ChevronDown,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { organizationsApi } from '../../api/organizations.api';
import { bookingsApi } from '../../api/bookings.api';
import { DEMO_ORGANIZER_DATA } from '../../mocks/demoData';
import { getEventImage, FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import KPICard from '../../components/organizer/KPICard';
import RevenueChart from '../../components/organizer/RevenueChart';
import TicketSalesDonut from '../../components/organizer/TicketSalesDonut';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const CHART_COLORS = ['#5B4CF2', '#38BDF8', '#F59E0B', '#94A3B8'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrg, activeOrgId } = useOrg();

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!activeOrgId) return;

      try {
        setLoading(true);
        const eventsRes = await organizationsApi.getOrganizationEvents(activeOrgId);
        const eventList = eventsRes.data?.events || [];
        setEvents(eventList);

        if (eventList.length === 0) {
          setBookings([]);
          return;
        }

        // Aggregate bookings across ALL organization events
        const bookingResponses = await Promise.all(
          eventList.map((ev) =>
            bookingsApi
              .getEventBookings(ev._id)
              .then((res) =>
                (res.data?.bookings || []).map((bk) => ({
                  ...bk,
                  eventTitle: bk.event?.title || ev.title
                }))
              )
              .catch(() => [])
          )
        );

        const merged = bookingResponses
          .flat()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setBookings(merged);
      } catch {
        setEvents([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [activeOrgId]);

  const activeEventsCount = events.filter((e) => e.status === 'published').length;
  const totalBookingsCount = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenuePaise = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalTicketsSold = confirmedBookings.reduce(
    (sum, b) => sum + (b.items?.reduce((iSum, item) => iSum + (item.quantity || 0), 0) || 0),
    0
  );

  // Real revenue chart points grouped by date when confirmed bookings exist
  const realRevenueChartData = (() => {
    if (confirmedBookings.length === 0) return [];
    const byDate = {};
    confirmedBookings.forEach((bk) => {
      const label = formatEventDate(bk.createdAt, 'MMM d');
      byDate[label] = (byDate[label] || 0) + Math.round((bk.totalAmount || 0) / 100);
    });
    return Object.entries(byDate).map(([period, thisPeriod]) => ({
      period,
      thisPeriod
    }));
  })();

  // Real ticket distribution across events when confirmed tickets exist
  const realDonutData = (() => {
    if (totalTicketsSold === 0) return [];
    const byEvent = {};
    confirmedBookings.forEach((bk) => {
      const title = bk.eventTitle || bk.event?.title || 'Event';
      const qty = bk.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
      byEvent[title] = (byEvent[title] || 0) + qty;
    });
    return Object.entries(byEvent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, qty], idx) => ({
        name,
        value: Math.round((qty / totalTicketsSold) * 100),
        color: CHART_COLORS[idx % CHART_COLORS.length]
      }));
  })();

  const kpis = demoMode
    ? DEMO_ORGANIZER_DATA.kpis
    : {
        revenue: totalRevenuePaise,
        revenueTrend: confirmedBookings.length > 0 ? `${confirmedBookings.length} paid` : null,
        ticketsSold: totalTicketsSold,
        ticketsTrend: null,
        activeEvents: activeEventsCount,
        eventsTrend: events.length > 0 ? `${events.length} total` : null,
        totalBookings: totalBookingsCount,
        bookingsTrend: null
      };

  const upcomingList = demoMode ? DEMO_ORGANIZER_DATA.upcomingEvents : events.slice(0, 4);
  const recentBookingsList = demoMode ? DEMO_ORGANIZER_DATA.recentBookings : bookings.slice(0, 5);

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Organizer';

  if (loading) {
    return <LoadingSpinner text="Loading organization analytics..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is what is happening with your events across {activeOrg?.name || 'your organization'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setDemoMode((prev) => !prev)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              demoMode
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {demoMode ? <X className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{demoMode ? 'Exit Demo Mode' : 'Preview Demo Data'}</span>
          </button>

          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last 30 days</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <Link to="/organizer/events/new">
            <Button variant="primary" size="md" className="rounded-2xl gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Unmistakable Demo Mode Banner (only when explicitly toggled on) */}
      {demoMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <Eye className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Demo Mode Active:</strong> Sample metrics and charts are displayed for demonstration. Live business data is hidden.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDemoMode(false)}
            className="shrink-0 font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer text-left"
          >
            Return to Live Data
          </button>
        </div>
      )}

      {/* Four KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Revenue"
          value={formatPaiseToINR(kpis.revenue)}
          trend={kpis.revenueTrend}
          icon={DollarSign}
          iconBg="bg-indigo-50 text-brand-purple"
        />
        <KPICard
          title="Tickets Sold"
          value={Number(kpis.ticketsSold).toLocaleString('en-IN')}
          trend={kpis.ticketsTrend}
          icon={Ticket}
          iconBg="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Active Events"
          value={kpis.activeEvents}
          trend={kpis.eventsTrend}
          icon={Calendar}
          iconBg="bg-purple-50 text-purple-600"
        />
        <KPICard
          title="Total Bookings"
          value={Number(kpis.totalBookings).toLocaleString('en-IN')}
          trend={kpis.bookingsTrend}
          icon={Users}
          iconBg="bg-sky-50 text-sky-600"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueChart
            data={demoMode ? DEMO_ORGANIZER_DATA.revenueChart : realRevenueChartData}
            isDemo={demoMode}
          />
        </div>
        <div className="lg:col-span-4">
          <TicketSalesDonut
            data={demoMode ? DEMO_ORGANIZER_DATA.ticketSalesByEvent : realDonutData}
            totalTickets={
              demoMode ? '12.6K' : Number(totalTicketsSold).toLocaleString('en-IN')
            }
            isDemo={demoMode}
          />
        </div>
      </div>

      {/* Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card className="p-6 border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">
                {demoMode ? 'Sample Upcoming Events' : 'Organization Events'}
              </h3>
              <Link
                to="/organizer/events"
                className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingList.length === 0 ? (
              <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs font-semibold text-slate-600">No events created yet</p>
                <p className="text-xs text-slate-400">
                  Create your first event to start selling tickets.
                </p>
                <Link to="/organizer/events/new" className="inline-block">
                  <Button variant="primary" size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingList.map((ev, idx) => {
                  const img = ev.image || getEventImage(ev);
                  const dateText =
                    ev.date || `${formatEventDate(ev.startsAt, 'EEE, dd MMM')} • ${ev.venue || 'Venue TBD'}`;

                  return (
                    <div key={ev.id || ev._id || idx} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={img}
                          alt={ev.title}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                          }}
                          className="w-12 h-12 rounded-2xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          {demoMode ? (
                            <p className="text-sm font-bold text-slate-900 truncate">{ev.title}</p>
                          ) : (
                            <Link
                              to={`/organizer/events/${ev._id}`}
                              className="text-sm font-bold text-slate-900 hover:text-brand-purple transition-colors truncate block"
                            >
                              {ev.title}
                            </Link>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{dateText}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={ev.status} dot={true}>
                          {ev.status === 'published' ? 'Published' : ev.status || 'Draft'}
                        </Badge>
                        {!demoMode && (
                          <button
                            type="button"
                            onClick={() => navigate(`/organizer/events/${ev._id}`)}
                            aria-label={`Manage ${ev.title}`}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card className="p-6 border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">
                {demoMode ? 'Sample Recent Bookings' : 'Recent Bookings'}
              </h3>
              <Link
                to="/organizer/bookings"
                className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentBookingsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No bookings recorded for your events yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Event</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentBookingsList.map((bk, idx) => {
                      const custName = bk.customer || bk.user?.fullName || 'Customer';
                      const evTitle = bk.eventTitle || bk.event?.title || bk.event || 'Event';
                      const amt = bk.amount ?? bk.totalAmount ?? 0;
                      const st = bk.status || 'PENDING_PAYMENT';

                      return (
                        <tr key={bk.id || bk._id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px] shrink-0">
                              {custName[0]}
                            </div>
                            <span className="truncate max-w-[110px]">{custName}</span>
                          </td>
                          <td className="py-3.5 text-slate-600 truncate max-w-[120px]">{evTitle}</td>
                          <td className="py-3.5 font-semibold text-slate-900">{formatPaiseToINR(amt)}</td>
                          <td className="py-3.5 text-right">
                            <Badge variant={st} dot={true}>
                              {st === 'CONFIRMED' ? 'Confirmed' : st === 'PENDING_PAYMENT' ? 'Pending' : st}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Promotional Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-brand-navy p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80"
            alt="Crowd background"
            className="w-full h-full object-cover object-right opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-transparent" />
        </div>

        <div className="relative z-10 space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Ready to host your next big event?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-light">
            Create, manage and grow your events with ReserveX. Real-time ticket inventory and QR validation included.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link to="/organizer/events/new">
            <Button
              variant="primary"
              size="pill"
              className="bg-brand-purple hover:bg-indigo-600 text-white font-semibold shadow-glow px-6"
            >
              Create Event <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
