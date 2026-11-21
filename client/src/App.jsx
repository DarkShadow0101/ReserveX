import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Main Application Root Component
 * 
 * Provider Hierarchy (outside to inside):
 * 1. BrowserRouter: Enables client-side routing across all pages.
 * 2. AuthProvider: Manages user login, registration, and active session state.
 * 3. OrgProvider: Manages the organizer's active organization and member roles.
 * 4. AppRoutes: Defines the route mapping for customer and organizer pages.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <AppRoutes />
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
