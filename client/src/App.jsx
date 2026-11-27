import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Main Application Root Component
 *
 * Provider Hierarchy (outside to inside):
 * 1. BrowserRouter: Client-side routing across customer, auth, and organizer views.
 * 2. ThemeProvider: Persistent Dark / Light theme switching with smooth transitions.
 * 3. ToastProvider: Instant interactive click/action toast feedback.
 * 4. AuthProvider: User authentication and active session state.
 * 5. OrgProvider: Active organization and gate/team roles.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <OrgProvider>
              <AppRoutes />
            </OrgProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
