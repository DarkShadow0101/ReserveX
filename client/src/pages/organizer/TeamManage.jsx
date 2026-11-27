import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, UserX, Mail } from 'lucide-react';
import { organizationsApi } from '../../api/organizations.api';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/errors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import SelectDropdown from '../../components/ui/SelectDropdown';

export default function TeamManage() {
  const { activeOrgId, isOwner } = useOrg();
  const { showToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('staff');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Remove Member Confirmation State
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function loadMembers(silent = false) {
    if (!activeOrgId) return;
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await organizationsApi.getMembers(activeOrgId);
      setMembers(res.data?.members || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load organization members'));
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [activeOrgId]);

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setMemberEmail('');
    setMemberRole('staff');
    setAddError(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    try {
      setAdding(true);
      setAddError(null);
      await organizationsApi.addMember(activeOrgId, {
        email: memberEmail.trim(),
        role: memberRole
      });
      handleCloseAddModal();
      setSuccess('Team member added successfully');
      showToast('Team member added to organization');
      await loadMembers(true);
    } catch (err) {
      setAddError(
        extractErrorMessage(err, 'Could not add member. Ensure this email has a ReserveX account.')
      );
    } finally {
      setAdding(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setRemoving(true);
      setError(null);
      await organizationsApi.removeMember(activeOrgId, memberToRemove.userId);
      setSuccess(`${memberToRemove.fullName} removed successfully`);
      showToast(`${memberToRemove.fullName} removed from team`, 'info');
      setMemberToRemove(null);
      await loadMembers(true);
    } catch (err) {
      setError(
        extractErrorMessage(err, 'Cannot remove member. Last-owner protection or permissions error.')
      );
      setMemberToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Organization Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage owner and staff permissions for event publishing and gate check-in.
          </p>
        </div>

        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="rounded-xl gap-2 text-xs"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </Button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-[#10B981]/15 border border-[#10B981]/35 rounded-xl text-xs text-[#34D399] font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-400/35 rounded-xl text-xs text-rose-200 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Retrieving team members..." />
      ) : (
        <div className="bg-[#12151E] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#090A0E] text-slate-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((m) => {
                  const u = m.user || {};
                  return (
                    <tr key={m.id || m._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center font-mono font-bold text-white text-xs">
                          {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.fullName || 'User'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-medium">{u.email}</td>
                      <td className="py-4 px-4">
                        <Badge variant={m.role === 'owner' ? 'default' : 'neutral'} dot={true}>
                          {m.role?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() =>
                              setMemberToRemove({
                                userId: u._id || u.id,
                                fullName: u.fullName || u.email
                              })
                            }
                            aria-label={`Remove ${u.fullName || u.email}`}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition-colors cursor-pointer"
                            title="Remove member"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        title="Add Organization Member"
        description="Invite an existing registered ReserveX user by their email address."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {addError && (
            <div className="p-3 bg-rose-500/15 text-rose-200 text-xs rounded-xl border border-rose-400/30">
              {addError}
            </div>
          )}

          <Input
            label="Member Email Address"
            type="email"
            required
            icon={Mail}
            placeholder="e.g. staff@example.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            helperText="The user must have registered an account on ReserveX."
          />

          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase text-slate-300 mb-1.5">
              Role Permission
            </label>
            <SelectDropdown
              value={memberRole}
              onChange={setMemberRole}
              options={[
                { value: 'staff', label: 'Staff (Event creation, editing, QR check-in)' },
                { value: 'owner', label: 'Owner (Full admin & team control)' }
              ]}
              icon={Shield}
              variant="boxed"
              ariaLabel="Select member role"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={adding}>
              Add to Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => !removing && setMemberToRemove(null)}
        title="Remove Team Member"
        description="This action revokes their organizer access for this workspace."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to remove <strong>{memberToRemove?.fullName}</strong> from this organization?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={removing}
              onClick={() => setMemberToRemove(null)}
            >
              Keep Member
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={removing}
              onClick={confirmRemoveMember}
            >
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
