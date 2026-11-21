import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import Sidebar from '../components/organizer/Sidebar';
import Topbar from '../components/organizer/Topbar';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Building2, Plus } from 'lucide-react';

export default function OrganizerLayout() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { activeOrg, organizations, loading: orgLoading, createOrganization } = useOrg();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner text="Connecting to ReserveX Organizer Network..." size="lg" />
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
        await createOrganization({ name: newOrgName });
      } catch (err) {
        alert(err.message || 'Could not create organization');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-card border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-brand-purple flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Welcome to Organizer Portal
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              To start creating events and managing ticket tiers, please set up your organization profile.
            </p>
          </div>

          <form onSubmit={handleQuickCreate} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Music & Events"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-purple"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" loading={creating} className="w-full rounded-2xl">
              Launch Organization <Plus className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <Link to="/" className="block text-xs font-semibold text-slate-400 hover:text-slate-600">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Topbar onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
