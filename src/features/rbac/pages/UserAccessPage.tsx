import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Plus, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RbacAdminService,
  type LoginUser,
  type OrgEntity,
  type RbacRole,
  type UserAssignment,
} from '../services/rbacAdmin.service';

/**
 * Per-user role/entity assignments: "who can do what, where". A user may
 * hold several roles, each company-wide or scoped to a single entity.
 * Deactivated rows stay visible — the table doubles as the access audit.
 */
const UserAccessPage: React.FC = () => {
  const [users, setUsers] = useState<LoginUser[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [entities, setEntities] = useState<OrgEntity[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [newRoleId, setNewRoleId] = useState<number | ''>('');
  const [newEntityId, setNewEntityId] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      RbacAdminService.listUsers(),
      RbacAdminService.listRoles(),
      RbacAdminService.listEntities(),
    ])
      .then(([u, r, e]) => {
        setUsers(u);
        setRoles(r.filter(role => role.isActive));
        setEntities(e.filter(entity => entity.isActive));
      })
      .catch(() => toast.error('Failed to load users/roles/entities'));
  }, []);

  const loadAssignments = async (userId: number) => {
    setIsLoading(true);
    try {
      setAssignments(await RbacAdminService.getUserAssignments(userId));
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId !== '') {
      loadAssignments(selectedUserId as number);
    } else {
      setAssignments([]);
    }
  }, [selectedUserId]);

  const visibleAssignments = useMemo(
    () => assignments.filter(a => showInactive || a.isActive),
    [assignments, showInactive]
  );

  const handleAdd = async () => {
    if (selectedUserId === '' || newRoleId === '') {
      toast.error('Select a user and a role');
      return;
    }
    setIsSaving(true);
    try {
      await RbacAdminService.addAssignment(
        selectedUserId as number,
        newRoleId as number,
        newEntityId === '' ? null : (newEntityId as number)
      );
      toast.success('Assignment added');
      setNewRoleId('');
      setNewEntityId('');
      await loadAssignments(selectedUserId as number);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add assignment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (assignment: UserAssignment) => {
    if (
      !window.confirm(
        `Remove ${assignment.roleName || assignment.roleCode} (${
          assignment.entityName || 'All entities'
        }) from this user?`
      )
    ) {
      return;
    }
    try {
      await RbacAdminService.deactivateAssignment(assignment.id);
      toast.success('Assignment removed');
      await loadAssignments(selectedUserId as number);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to remove assignment'
      );
    }
  };

  const input =
    'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-gray-900'>User Access</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Assign roles to users, company-wide or per entity. A user can hold
          multiple roles.
        </p>
      </div>

      {/* User picker + add form */}
      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              User
            </label>
            <select
              className={input}
              value={selectedUserId}
              onChange={e =>
                setSelectedUserId(
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
            >
              <option value=''>Select user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.loginName}
                  {u.employeeName ? ` — ${u.employeeName}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Role
            </label>
            <select
              className={input}
              value={newRoleId}
              disabled={selectedUserId === ''}
              onChange={e =>
                setNewRoleId(
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
            >
              <option value=''>Select role...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roleName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Entity
            </label>
            <select
              className={input}
              value={newEntityId}
              disabled={selectedUserId === ''}
              onChange={e =>
                setNewEntityId(
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
            >
              <option value=''>All entities (company-wide)</option>
              {entities.map(en => (
                <option key={en.id} value={en.id}>
                  {en.entityName} ({en.entityCode})
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-end'>
            <button
              onClick={handleAdd}
              disabled={isSaving || selectedUserId === '' || newRoleId === ''}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors'
            >
              <Plus size={15} />
              {isSaving ? 'Adding...' : 'Add Assignment'}
            </button>
          </div>
        </div>
      </div>

      {/* Assignments table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='px-5 py-3 border-b border-gray-100 flex items-center justify-between'>
          <span className='text-sm font-semibold text-gray-700'>
            Assignments
          </span>
          <label className='flex items-center gap-2 text-sm text-gray-500'>
            <input
              type='checkbox'
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
              className='w-4 h-4 text-violet-600 rounded border-gray-300'
            />
            Show removed (history)
          </label>
        </div>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            </div>
          ) : selectedUserId === '' ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <ShieldCheck className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>
                Select a user to view their access
              </p>
            </div>
          ) : visibleAssignments.length > 0 ? (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Role
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Scope
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Status
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Granted
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {visibleAssignments.map(a => (
                  <tr key={a.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-gray-900'>
                        {a.roleName || a.roleCode}
                      </span>
                      <p className='text-xs text-gray-400'>{a.roleCode}</p>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {a.entityName || 'All entities'}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          a.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {a.isActive ? 'Active' : 'Removed'}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-500'>
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString('en-IN')
                        : '--'}
                    </td>
                    <td className='px-4 py-3.5'>
                      {a.isActive && (
                        <button
                          onClick={() => handleDeactivate(a)}
                          className='p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50'
                          title='Remove assignment'
                        >
                          <Ban className='w-4 h-4' />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='flex flex-col items-center justify-center py-16'>
              <p className='text-gray-600 font-medium'>No assignments</p>
              <p className='text-gray-400 text-sm mt-1'>
                Add a role above to grant this user access
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccessPage;
