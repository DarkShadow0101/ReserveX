import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import OrganizerLayout from '../layouts/OrganizerLayout';

// Customer Pages
import Home from '../pages/customer/Home';
import EventsExplore from '../pages/customer/EventsExplore';
import EventDetail from '../pages/customer/EventDetail';
import Checkout from '../pages/customer/Checkout';
import MyTickets from '../pages/customer/MyTickets';
import MyBookings from '../pages/customer/MyBookings';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Organizer Pages
import Dashboard from '../pages/organizer/Dashboard';
import EventsManage from '../pages/organizer/EventsManage';
import CreateEvent from '../pages/organizer/CreateEvent';
import EventDetailManage from '../pages/organizer/EventDetailManage';
import TicketsManage from '../pages/organizer/TicketsManage';
import BookingsManage from '../pages/organizer/BookingsManage';
import CheckInScanner from '../pages/organizer/CheckInScanner';
import TeamManage from '../pages/organizer/TeamManage';
import OrgSettings from '../pages/organizer/OrgSettings';

export default function AppRoutes() {
  return (
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
  );
}
