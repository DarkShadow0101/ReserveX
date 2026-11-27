import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { HERO_IMAGE, STAGE_HORIZON_IMAGE } from '../mocks/eventImages';

export default function CustomerLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#06080E] text-[#F4F1EA] relative overflow-x-hidden">
      {/* Continuous full-viewport ambient stage atmosphere across entire scroll */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src={STAGE_HORIZON_IMAGE}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-[0.36] blur-sm scale-105 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080E]/55 via-[#06080E]/42 to-[#05060B]/70" />
      </div>

      {/* Top atmospheric rig layer for inner customer pages */}
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
            className="w-full h-full object-cover object-center opacity-[0.26] blur-[1px] saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06080E]/45 via-[#06080E]/65 to-transparent" />
        </div>
      )}

      <Navbar transparent={isHome} />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
