import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function CustomerLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-brand-navy text-white relative overflow-x-hidden">
      {/* Subtle atmospheric lighting for inner customer pages (Home provides its own full backdrop) */}
      {!isHome && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: [
              'radial-gradient(circle at 15% 15%, rgba(91, 76, 242, 0.16), transparent 40%)',
              'radial-gradient(circle at 85% 70%, rgba(255, 90, 95, 0.08), transparent 42%)'
            ].join(', ')
          }}
        />
      )}

      <Navbar transparent={isHome} />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
