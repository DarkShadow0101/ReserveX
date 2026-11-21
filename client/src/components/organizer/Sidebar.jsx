import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Receipt,
  Users,
  Settings,
  Headphones,
  Crown,
  Building2,
  ChevronDown,
  Plus,
  ArrowRight,
  LogOut,
  ScanLine
} from 'lucide-react';
import Logo from '../common/Logo';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizations, activeOrg, switchOrganization, createOrganization, userRole } = useOrg();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const navItems = [
    { label: 'Dashboard', path: '/organizer', icon: LayoutDashboard, end: true },
    { label: 'Events', path: '/organizer/events', icon: Calendar },
    { label: 'Tickets', path: '/organizer/tickets', icon: Ticket },
    { label: 'Bookings', path: '/organizer/bookings', icon: Receipt },
    { label: 'QR Check-in', path: '/organizer/check-in', icon: ScanLine },
    { label: 'Team', path: '/organizer/team', icon: Users },
    { label: 'Settings', path: '/organizer/settings', icon: Settings },
  ];

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrgName) return;

    try {
      setCreating(true);
      setCreateError(null);
      await createOrganization({ name: newOrgName, description: newOrgDesc });
      setCreateOrgModalOpen(false);
      setNewOrgName('');
      setNewOrgDesc('');
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const roleLabel = userRole === 'owner' ? 'Owner' : userRole === 'staff' ? 'Staff' : 'Pro Organiser';

  return (
    <>
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-sidebar text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* 1. Brand Logo */}
          <div className="p-6 pb-4 flex items-center justify-between">
            <Logo light={true} />
          </div>

          {/* 2. Organization Switcher Card */}
          <div className="px-4 mb-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-brand-purple shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-white truncate">
                      {activeOrg ? activeOrg.name : 'Select Organization'}
                    </h4>
                    <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                      {roleLabel}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Org Switcher Dropdown */}
              {orgDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Your Organizations
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/50">
                    {organizations.map((item) => {
                      const org = item.organization;
                      const isActive = activeOrg?._id === org?._id;
                      return (
                        <button
                          key={org?._id}
                          type="button"
                          onClick={() => {
                            switchOrganization(org?._id);
                            setOrgDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                            isActive
                              ? 'bg-brand-purple text-white'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{org?.name}</span>
                          <span className="text-[10px] uppercase opacity-75">{item.role}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 mt-1 pt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOrgDropdownOpen(false);
                        setCreateOrgModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-brand-purple hover:bg-white/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> New Organization
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Navigation Links */}
          <nav className="px-3 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-purple text-white shadow-glow'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* 4. Bottom Cards: Need Help & Upgrade Plan */}
          <div className="p-4 space-y-3">
            {/* Need Help Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-brand-purple" />
                <span className="text-slate-300 font-medium">Need help?</span>
              </div>
              <a
                href="#support"
                className="text-brand-purple hover:text-indigo-400 font-semibold flex items-center gap-1"
              >
                Contact Support <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Upgrade Plan Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Upgrade Plan <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Unlock higher booking capacities and team management.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-brand-purple hover:bg-indigo-600 rounded-xl text-xs py-2"
              >
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Create Organization Modal */}
      <Modal
        isOpen={createOrgModalOpen}
        onClose={() => setCreateOrgModalOpen(false)}
        title="Create New Organization"
        description="Launch a new event company or brand profile on ReserveX."
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {createError}
            </div>
          )}
          <Input
            label="Organization Name"
            required
            placeholder="e.g. Dream Events Co."
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
          <Input
            label="Description (Optional)"
            placeholder="Brief bio or mission statement"
            value={newOrgDesc}
            onChange={(e) => setNewOrgDesc(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setCreateOrgModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={creating}>
              Create Organization
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
