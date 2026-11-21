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
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { organizationsApi } from '../../api/organizations.api';
import { bookingsApi } from '../../api/bookings.api';
import { DEMO_ORGANIZER_DATA } from '../../mocks/demoData';
import { getEventImage } from '../../mocks/eventImages';
import { formatPaiseToINR } from '../../utils/currency';
import { formatEventDate } from '../../utils/date';
import KPICard from '../../components/organizer/KPICard';
import RevenueChart from '../../components/organizer/RevenueChart';
import TicketSalesDonut from '../../components/organizer/TicketSalesDonut';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrg, activeOrgId } = useOrg();

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!activeOrgId) return;

      try {
        setLoading(true);
        // Load organization events
        const eventsRes = await organizationsApi.getOrganizationEvents(activeOrgId);
        const eventList = eventsRes.data?.events || [];
        setEvents(eventList);

        // If active events exist, load bookings from first event
        let allBookings = [];
        if (eventList.length > 0) {
          try {
            const bRes = await bookingsApi.getEventBookings(eventList[0]._id);
            allBookings = bRes.data?.bookings || [];
          } catch {
            allBookings = [];
          }
        }
        setBookings(allBookings);

        // If no events in DB yet, show demo state so dashboard looks vibrant as approved
        if (eventList.length === 0) {
          setIsDemoData(true);
        } else {
          setIsDemoData(false);
        }
      } catch (err) {
        setIsDemoData(true);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [activeOrgId]);

  // Derive real KPI metrics from loaded database events & bookings, or fallback to demo
  const activeEventsCount = events.filter((e) => e.status === 'published').length;
  const totalBookingsCount = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenuePaise = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalTicketsSold = confirmedBookings.reduce(
    (sum, b) => sum + (b.items?.reduce((iSum, item) => iSum + (item.quantity || 0), 0) || 0),
    0
  );

  const kpis = isDemoData
    ? DEMO_ORGANIZER_DATA.kpis
    : {
        revenue: totalRevenuePaise || DEMO_ORGANIZER_DATA.kpis.revenue,
        revenueTrend: '+12%',
        ticketsSold: totalTicketsSold || DEMO_ORGANIZER_DATA.kpis.ticketsSold,
        ticketsTrend: '+18%',
        activeEvents: activeEventsCount || DEMO_ORGANIZER_DATA.kpis.activeEvents,
        eventsTrend: '0%',
        totalBookings: totalBookingsCount || DEMO_ORGANIZER_DATA.kpis.totalBookings,
        bookingsTrend: '+14%'
      };

  const upcomingList = events.length > 0 ? events.slice(0, 3) : DEMO_ORGANIZER_DATA.upcomingEvents;
  const recentBookingsList = bookings.length > 0 ? bookings.slice(0, 3) : DEMO_ORGANIZER_DATA.recentBookings;

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Organizer';

  return (
    <div className="space-y-8">
      {/* 1. Header with Welcome Message & Date Range Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening with your events across {activeOrg?.name || 'your organization'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer hover:border-slate-300">
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

      {/* 2. Four KPI Cards (Design 1) */}
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

      {/* 3. Analytics Charts (Revenue Area Chart & Ticket Sales Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueChart data={DEMO_ORGANIZER_DATA.revenueChart} isDemo={isDemoData} />
        </div>
        <div className="lg:col-span-4">
          <TicketSalesDonut
            data={DEMO_ORGANIZER_DATA.ticketSalesByEvent}
            totalTickets="12.6K"
            isDemo={isDemoData}
          />
        </div>
      </div>

      {/* 4. Operational Sections (Upcoming Events & Recent Bookings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Events List */}
        <div className="lg:col-span-6">
          <Card className="p-6 border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
              <Link
                to="/organizer/events"
                className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingList.map((ev, idx) => {
                const img = ev.image || getEventImage(ev);
                const dateText = ev.date || formatEventDate(ev.startsAt, 'EEE, dd MMM • Venue');

                return (
                  <div key={ev.id || ev._id || idx} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={img}
                        alt={ev.title}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <Link
                          to={`/organizer/events/${ev._id || ev.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-brand-purple transition-colors line-clamp-1"
                        >
                          {ev.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{dateText}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={ev.status} dot={true}>
                        {ev.status === 'published' ? 'Published' : ev.status || 'Draft'}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => navigate(`/organizer/events/${ev._id || ev.id}`)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-6">
          <Card className="p-6 border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Recent Bookings</h3>
              <Link
                to="/organizer/bookings"
                className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

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
                    const custName = bk.customer || bk.user?.fullName || 'Attendee';
                    const evTitle = bk.event?.title || bk.event || 'Music Festival';
                    const amt = bk.amount || bk.totalAmount || 199900;
                    const st = bk.status || 'CONFIRMED';

                    return (
                      <tr key={bk.id || bk._id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                            {custName[0]}
                          </div>
                          <span className="truncate max-w-[120px]">{custName}</span>
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
          </Card>
        </div>
      </div>

      {/* 5. Bottom Promotional Banner (Design 1) */}
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
