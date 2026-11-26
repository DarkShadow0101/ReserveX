import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, UserX, AlertCircle, CheckCircle2 } from 'lucide-react';
import { organizationsApi } from '../../api/organizations.api';
import { useOrg } from '../../context/OrgContext';
import { extractErrorMessage } from '../../utils/errors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import SelectDropdown from '../../components/ui/SelectDropdown';

export default function TeamManage() {
  const { activeOrgId, isOwner } = useOrg();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState('staff');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  async function loadMembers() {
    if (!activeOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await organizationsApi.getMembers(activeOrgId);
      setMembers(res.data?.members || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load organization members'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [activeOrgId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberUserId) return;

    try {
      setAdding(true);
      setAddError(null);
      await organizationsApi.addMember(activeOrgId, {
        userId: memberUserId.trim(),
        role: memberRole
      });
      setAddModalOpen(false);
      setMemberUserId('');
      setSuccess('Team member added successfully');
      await loadMembers();
    } catch (err) {
      setAddError(extractErrorMessage(err, 'Could not add member. Ensure User ID exists and is not already a member.'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this organization?`)) {
      return;
    }

    try {
      setError(null);
      await organizationsApi.removeMember(activeOrgId, userId);
      setSuccess('Member removed successfully');
      await loadMembers();
    } catch (err) {
      setError(extractErrorMessage(err, 'Cannot remove member. Last-owner protection or permissions error.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
            Collaboration & Permissions
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            Organization Team
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage owner and staff permissions for event publishing and gate check-in.
          </p>
        </div>

        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="rounded-xl gap-2 shadow-sm text-xs"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </Button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Retrieving team members..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const u = m.user || {};
                  return (
                    <tr key={m.id || m._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName || 'User'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {u._id || u.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">{u.email}</td>
                      <td className="py-4 px-4">
                        <Badge variant={m.role === 'owner' ? 'default' : 'neutral'} dot={true}>
                          {m.role?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(u._id || u.id, u.fullName)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
        onClose={() => setAddModalOpen(false)}
        title="Add Organization Member"
        description="Invite an existing user by their ReserveX User ID to manage events or scan passes."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {addError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {addError}
            </div>
          )}

          <Input
            label="User MongoDB ID"
            required
            placeholder="e.g. 673294ab12e0931289cf0021"
            value={memberUserId}
            onChange={(e) => setMemberUserId(e.target.value)}
            helperText="Users can copy their ID from their profile or registration."
          />

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Role Permission
            </label>
            <SelectDropdown
              value={memberRole}
              onChange={setMemberRole}
              options={[
                { value: 'staff', label: 'Staff (Event creation, editing, QR check-in)' },
                { value: 'owner', label: 'Owner (Full admin & billing control)' }
              ]}
              icon={Shield}
              theme="light"
              variant="boxed"
              ariaLabel="Select member role"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={adding}>
              Add to Team
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
