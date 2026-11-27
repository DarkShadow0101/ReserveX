import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { HERO_IMAGE, STAGE_HORIZON_IMAGE } from '../mocks/eventImages';

export default function CustomerLayout() {
  const location = useLocation();
  const { isDark } = useTheme();
  const isHome = location.pathname === '/';

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden ${
        isDark ? 'bg-[#06080E] text-[#F4F1EA]' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {isDark ? (
        <>
          {/* Dark Mode: continuous full-viewport ambient stage atmosphere */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <img
              src={STAGE_HORIZON_IMAGE}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center scale-105 opacity-[0.36] blur-sm saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06080E]/55 via-[#06080E]/[0.42] to-[#05060B]/70" />
          </div>

          {!isHome && (
            <div
              className="pointer-events-none fixed inset-x-0 top-0 h-[360px] z-0 overflow-hidden"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)'
              }}
            >
              <img
                src={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center blur-[1px] opacity-[0.26] saturate-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#06080E]/45 via-[#06080E]/65 to-transparent" />
            </div>
          )}
        </>
      ) : (
        /* Light Mode: crisp gallery daylight wash with delicate coral horizon tint at top */
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-[520px] z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(217, 56, 30, 0.08), transparent 70%), linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)'
          }}
        />
      )}

      <Navbar transparent={isHome} />
      <main className="flex-1 relative z-10">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
