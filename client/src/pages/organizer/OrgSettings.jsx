import React from 'react';
import { Building2, Shield, Calendar, Hash, Globe, CheckCircle2 } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { formatEventDate } from '../../utils/date';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function OrgSettings() {
  const { activeOrg, userRole } = useOrg();

  if (!activeOrg) {
    return (
      <div className="p-8 text-center text-slate-500">
        No active organization selected.
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
          Account & Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
          Organization Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Profile, identifiers, and tenant boundaries for {activeOrg.name}.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-100 shadow-soft space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-brand-purple flex items-center justify-center font-bold text-xl">
              {activeOrg.name ? activeOrg.name[0].toUpperCase() : 'O'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeOrg.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Slug: {activeOrg.slug}</p>
            </div>
          </div>

          <Badge variant={activeOrg.isActive ? 'published' : 'neutral'} dot={true}>
            {activeOrg.isActive ? 'Active' : 'Suspended'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Your Role</span>
            <p className="mt-1 font-extrabold text-brand-purple uppercase text-sm">
              {userRole}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Organization ID</span>
            <p className="mt-1 font-mono text-slate-700 select-all">
              {activeOrg._id}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Created On</span>
            <p className="mt-1 font-semibold text-slate-800">
              {formatEventDate(activeOrg.createdAt, 'dd MMMM yyyy')}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Owner Count</span>
            <p className="mt-1 font-semibold text-slate-800">
              {activeOrg.ownerCount || 1} Registered Owner(s)
            </p>
          </div>
        </div>

        <div>
          <span className="font-bold text-slate-400 uppercase tracking-wider block text-xs">Description</span>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {activeOrg.description || 'No description added yet for this organization.'}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Tenant isolation enforced across all database queries and permissions.</span>
        </div>
      </Card>
    </div>
  );
}
