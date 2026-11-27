import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Receipt,
  Users,
  Settings,
  Building2,
  ChevronDown,
  Plus,
  ExternalLink,
  ScanLine
} from 'lucide-react';
import Logo from '../common/Logo';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
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
    { label: 'Ticket Tiers', path: '/organizer/tickets', icon: Ticket },
    { label: 'Bookings', path: '/organizer/bookings', icon: Receipt },
    { label: 'QR Check-In', path: '/organizer/check-in', icon: ScanLine, liveDot: true },
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

  const roleLabel = userRole === 'owner' ? 'Owner' : userRole === 'staff' ? 'Gate Staff' : 'Organizer';
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OR';

  return (
    <>
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#090A0E] text-slate-300 flex flex-col justify-between border-r border-white/10 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* 1. Brand Logo + Studio tag */}
          <div className="p-5 pb-4 flex items-center justify-between gap-2">
            <Logo light={true} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
              Studio
            </span>
          </div>

          {/* 2. Organization Switcher */}
          <div className="px-4 mb-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#12151E] border border-white/10 hover:border-white/20 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 flex items-center justify-center text-[#FF4D2D] shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {activeOrg ? activeOrg.name : 'Select Organization'}
                    </h4>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mt-0.5">
                      {roleLabel}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {orgDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#12151E] border border-white/15 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Your Organizations
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-white/5">
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
                          className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#FF4D2D] text-white'
                              : 'text-slate-300 hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="truncate">{org?.name}</span>
                          <span className="font-mono text-[10px] uppercase opacity-75">{item.role}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/10 mt-1 pt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOrgDropdownOpen(false);
                        setCreateOrgModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#FF4D2D] hover:bg-white/[0.05] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> New Organization
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Navigation Links */}
          <nav className="px-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#FF4D2D]/15 text-white border border-[#FF4D2D]/35'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF4D2D]' : ''}`} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.liveDot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 4. Bottom Account & Storefront Switcher (clean spacing, zero overflow) */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.fullName || 'Organizer'}
                </p>
                <p className="font-mono text-[10px] text-slate-400 truncate">
                  {roleLabel}
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#12151E] border border-white/10 hover:border-white/25 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <span>Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Create Organization Modal */}
      <Modal
        isOpen={createOrgModalOpen}
        onClose={() => setCreateOrgModalOpen(false)}
        title="Create New Organization"
        description="Launch a new event organization on ReserveX."
        theme="dark"
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-500/15 text-rose-200 text-xs rounded-xl border border-rose-400/30">
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
