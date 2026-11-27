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

const CHART_COLORS = ['#FF4D2D', '#10B981', '#F59E0B', '#64748B'];

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
    return <LoadingSpinner theme="dark" text="Loading organization analytics..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome back, {firstName} — {activeOrg?.name || 'your organization'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setDemoMode((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              demoMode
                ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-[#12151E] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            {demoMode ? <X className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{demoMode ? 'Exit Sample Mode' : 'Preview Sample Data'}</span>
          </button>

          <Link to="/organizer/check-in" className="hidden sm:inline-block">
            <Button variant="outline" size="md" className="rounded-xl border-white/15 bg-[#12151E] text-slate-200 hover:text-white">
              Open Gate Scanner
            </Button>
          </Link>

          <Link to="/organizer/events/new">
            <Button variant="primary" size="md" className="rounded-xl gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Unmistakable Sample Mode Banner (only when explicitly toggled on) */}
      {demoMode && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start sm:items-center gap-2.5">
            <Eye className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Sample Preview Active:</strong> Illustrative numbers are shown. Live business records are hidden.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDemoMode(false)}
            className="shrink-0 font-bold text-amber-300 underline hover:text-white cursor-pointer text-left"
          >
            Return to Live Data
          </button>
        </div>
      )}

      {/* Four KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Confirmed Revenue"
          value={formatPaiseToINR(kpis.revenue)}
          trend={kpis.revenueTrend}
          icon={DollarSign}
          iconBg="bg-[#FF4D2D]/15 text-[#FF4D2D] border border-[#FF4D2D]/30"
        />
        <KPICard
          title="Tickets Issued"
          value={Number(kpis.ticketsSold).toLocaleString('en-IN')}
          trend={kpis.ticketsTrend}
          icon={Ticket}
          iconBg="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
        />
        <KPICard
          title="Published Events"
          value={kpis.activeEvents}
          trend={kpis.eventsTrend}
          icon={Calendar}
          iconBg="bg-white/[0.06] text-[#F4F1EA] border border-white/15"
        />
        <KPICard
          title="Total Bookings"
          value={Number(kpis.totalBookings).toLocaleString('en-IN')}
          trend={kpis.bookingsTrend}
          icon={Users}
          iconBg="bg-amber-500/15 text-amber-300 border border-amber-400/30"
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
          <Card className="p-6 border-white/10 bg-[#12151E]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">
                {demoMode ? 'Sample Upcoming Events' : 'Organization Events'}
              </h3>
              <Link
                to="/organizer/events"
                className="text-xs font-semibold text-[#FF4D2D] hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingList.length === 0 ? (
              <div className="py-12 text-center space-y-3 border border-dashed border-white/10 rounded-xl bg-[#090A0E]">
                <p className="text-xs font-semibold text-slate-300">No events created yet</p>
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
              <div className="divide-y divide-white/10">
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
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          {demoMode ? (
                            <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                          ) : (
                            <Link
                              to={`/organizer/events/${ev._id}`}
                              className="text-sm font-bold text-white hover:text-[#FF4D2D] transition-colors truncate block"
                            >
                              {ev.title}
                            </Link>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{dateText}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={ev.status} theme="dark" dot={true}>
                          {ev.status === 'published' ? 'Published' : ev.status || 'Draft'}
                        </Badge>
                        {!demoMode && (
                          <button
                            type="button"
                            onClick={() => navigate(`/organizer/events/${ev._id}`)}
                            aria-label={`Manage ${ev.title}`}
                            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
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
          <Card className="p-6 border-white/10 bg-[#12151E]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">
                {demoMode ? 'Sample Recent Bookings' : 'Recent Bookings'}
              </h3>
              <Link
                to="/organizer/bookings"
                className="text-xs font-semibold text-[#FF4D2D] hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentBookingsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-white/10 rounded-xl bg-[#090A0E]">
                No bookings recorded for your events yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Event</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentBookingsList.map((bk, idx) => {
                      const custName = bk.customer || bk.user?.fullName || 'Customer';
                      const evTitle = bk.eventTitle || bk.event?.title || bk.event || 'Event';
                      const amt = bk.amount ?? bk.totalAmount ?? 0;
                      const st = bk.status || 'PENDING_PAYMENT';

                      return (
                        <tr key={bk.id || bk._id || idx} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3.5 font-semibold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center font-mono font-bold text-slate-200 text-[10px] shrink-0">
                              {custName[0]}
                            </div>
                            <span className="truncate max-w-[110px]">{custName}</span>
                          </td>
                          <td className="py-3.5 text-slate-300 truncate max-w-[120px]">{evTitle}</td>
                          <td className="py-3.5 font-mono font-semibold text-white">{formatPaiseToINR(amt)}</td>
                          <td className="py-3.5 text-right">
                            <Badge variant={st} theme="dark" dot={true}>
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
    </div>
  );
}
