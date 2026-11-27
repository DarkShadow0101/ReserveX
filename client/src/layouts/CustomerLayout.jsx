import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function CustomerLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#060709] text-[#F4F1EA] relative overflow-x-hidden">
      {/* Subtle warm stage horizon lighting for inner customer pages */}
      {!isHome && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: [
              'radial-gradient(ellipse 75% 45% at 50% 0%, rgba(255, 77, 45, 0.08), transparent 65%)',
              'radial-gradient(circle at 85% 20%, rgba(56, 189, 248, 0.05), transparent 45%)'
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
