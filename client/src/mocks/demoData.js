/**
 * Isolated demo data for visual fidelity matching ReserveX Design 1
 * Used ONLY when database returns empty records or when demo mode is triggered.
 */

export const DEMO_ORGANIZER_DATA = {
  kpis: {
    revenue: 42500000, // 4,25,000 in paise
    revenueTrend: '+12%',
    ticketsSold: 12580,
    ticketsTrend: '+18%',
    activeEvents: 4,
    eventsTrend: '0%',
    totalBookings: 11240,
    bookingsTrend: '+14%'
  },
  revenueChart: [
    { period: 'Apr 1', thisPeriod: 140000, lastPeriod: 110000 },
    { period: 'Apr 8', thisPeriod: 220000, lastPeriod: 160000 },
    { period: 'Apr 15', thisPeriod: 210000, lastPeriod: 180000 },
    { period: 'Apr 22', thisPeriod: 320000, lastPeriod: 230000 },
    { period: 'Apr 30', thisPeriod: 425000, lastPeriod: 290000 },
  ],
  ticketSalesByEvent: [
    { name: 'Music Festival', value: 45, color: '#5B4CF2' },
    { name: 'Tech Summit', value: 30, color: '#38BDF8' },
    { name: 'Comedy Night', value: 15, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#94A3B8' }
  ],
  upcomingEvents: [
    {
      id: 'demo-1',
      title: 'EDM Paradise 2025',
      date: 'Sat, 24 May • Mumbai',
      status: 'published',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'demo-2',
      title: 'Tech Summit 2025',
      date: 'Fri, 06 Jun • Delhi',
      status: 'published',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'demo-3',
      title: 'Comedy Night Live',
      date: 'Sat, 14 Jun • Bangalore',
      status: 'draft',
      image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=300&q=80'
    }
  ],
  recentBookings: [
    {
      id: 'bk-1',
      customer: 'Priya Sharma',
      event: 'Music Festival',
      amount: 249900, // paise
      status: 'CONFIRMED'
    },
    {
      id: 'bk-2',
      customer: 'Rahul Mehta',
      event: 'Tech Summit',
      amount: 199900, // paise
      status: 'CONFIRMED'
    },
    {
      id: 'bk-3',
      customer: 'Ananya Singh',
      event: 'Comedy Night',
      amount: 149900, // paise
      status: 'PENDING_PAYMENT'
    }
  ]
};
