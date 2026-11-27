import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/organizer/Sidebar';
import Topbar from '../components/organizer/Topbar';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Building2, Plus } from 'lucide-react';

export default function OrganizerLayout() {
  const location = useLocation();
  const { isDark } = useTheme();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { activeOrg, organizations, loading: orgLoading, createOrganization } = useOrg();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0F14]">
        <LoadingSpinner theme="dark" text="Connecting to ReserveX Organizer Studio..." size="lg" />
      </div>
    );
  }

  // Guard: Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/organizer" replace />;
  }

  // If user has zero organizations yet, prompt them to create one
  if (organizations.length === 0) {
    const handleQuickCreate = async (e) => {
      e.preventDefault();
      if (!newOrgName) return;
      try {
        setCreating(true);
        setCreateError(null);
        await createOrganization({ name: newOrgName });
      } catch (err) {
        setCreateError(err.response?.data?.message || err.message || 'Could not create organization');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center p-4">
        <div className="bg-[#12151E] rounded-2xl p-8 max-w-md w-full shadow-card border border-white/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display uppercase text-2xl font-bold text-white">
              Organizer Studio Setup
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              To start creating events and managing ticket tiers, create your organization profile.
            </p>
          </div>

          <form onSubmit={handleQuickCreate} className="space-y-4 text-left">
            {createError && (
              <div className="p-3 bg-rose-500/15 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                {createError}
              </div>
            )}
            <div>
              <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Music & Events"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF4D2D]"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" loading={creating} className="w-full rounded-xl">
              Launch Organization <Plus className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <Link to="/" className="block text-xs font-semibold text-slate-400 hover:text-white">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-[#F4F1EA] flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Topbar onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
