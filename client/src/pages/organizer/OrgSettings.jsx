import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { formatEventDate } from '../../utils/date';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function OrgSettings() {
  const { activeOrg, userRole } = useOrg();

  if (!activeOrg) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active organization selected.
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
          Organization Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Profile, identifiers, and tenant boundaries for {activeOrg.name}.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-white/10 bg-[#12151E] space-y-6">
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#FF4D2D]/15 border border-[#FF4D2D]/30 text-[#FF4D2D] flex items-center justify-center font-mono font-bold text-xl">
              {activeOrg.name ? activeOrg.name[0].toUpperCase() : 'O'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeOrg.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Slug: {activeOrg.slug}</p>
            </div>
          </div>

          <Badge variant={activeOrg.isActive ? 'published' : 'neutral'} theme="dark" dot={true}>
            {activeOrg.isActive ? 'Active' : 'Suspended'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Role</span>
            <p className="mt-1 font-mono font-bold text-[#FF4D2D] uppercase text-sm">
              {userRole}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Organization ID</span>
            <p className="mt-1 font-mono text-slate-200 select-all">
              {activeOrg._id}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created On</span>
            <p className="mt-1 font-mono font-semibold text-slate-200">
              {formatEventDate(activeOrg.createdAt, 'dd MMMM yyyy')}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Owner Count</span>
            <p className="mt-1 font-mono font-semibold text-slate-200">
              {activeOrg.ownerCount || 1} Registered Owner(s)
            </p>
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed bg-[#090A0E] p-4 rounded-xl border border-white/10">
            {activeOrg.description || 'No description added yet for this organization.'}
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#10B981] font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Tenant isolation enforced across all database queries and permissions.</span>
        </div>
      </Card>
    </div>
  );
}
