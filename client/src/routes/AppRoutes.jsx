import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Eager shell + landing page for fast first paint
import CustomerLayout from '../layouts/CustomerLayout';
import Home from '../pages/customer/Home';

// Lazy customer & auth routes
const EventsExplore = lazy(() => import('../pages/customer/EventsExplore'));
const EventDetail = lazy(() => import('../pages/customer/EventDetail'));
const Checkout = lazy(() => import('../pages/customer/Checkout'));
const MyTickets = lazy(() => import('../pages/customer/MyTickets'));
const MyBookings = lazy(() => import('../pages/customer/MyBookings'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

// Lazy organizer studio bundle (keeps customer initial payload small)
const OrganizerLayout = lazy(() => import('../layouts/OrganizerLayout'));
const Dashboard = lazy(() => import('../pages/organizer/Dashboard'));
const EventsManage = lazy(() => import('../pages/organizer/EventsManage'));
const CreateEvent = lazy(() => import('../pages/organizer/CreateEvent'));
const EventDetailManage = lazy(() => import('../pages/organizer/EventDetailManage'));
const TicketsManage = lazy(() => import('../pages/organizer/TicketsManage'));
const BookingsManage = lazy(() => import('../pages/organizer/BookingsManage'));
const CheckInScanner = lazy(() => import('../pages/organizer/CheckInScanner'));
const TeamManage = lazy(() => import('../pages/organizer/TeamManage'));
const OrgSettings = lazy(() => import('../pages/organizer/OrgSettings'));

function RouteLoader() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center">
      <LoadingSpinner text="Loading view..." size="md" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Customer Storefront & Public Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsExplore />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/checkout/:bookingId" element={<Checkout />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Organizer Portal Routes */}
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventsManage />} />
          <Route path="events/new" element={<CreateEvent />} />
          <Route path="events/:id" element={<EventDetailManage />} />
          <Route path="tickets" element={<TicketsManage />} />
          <Route path="bookings" element={<BookingsManage />} />
          <Route path="check-in" element={<CheckInScanner />} />
          <Route path="team" element={<TeamManage />} />
          <Route path="settings" element={<OrgSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
