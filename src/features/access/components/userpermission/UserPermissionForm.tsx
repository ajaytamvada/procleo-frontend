import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { UserType } from '../../hooks/useUserTypeAPI';
import { useHierarchicalModules, Module } from '../../hooks/useModuleAPI';
import {
  useUserPermissions,
  useAssignPermissions,
  ModulePermissionRequest,
} from '../../hooks/usePermissionAPI';

interface UserPermissionFormProps {
  userType: UserType;
  onClose: () => void;
  onSuccess: () => void;
}

const UserPermissionForm: React.FC<UserPermissionFormProps> = ({
  userType,
  onClose,
  onSuccess,
}) => {
  const { data: modules, isLoading: isLoadingModules } = useHierarchicalModules();
  const { data: existingPermissions, isLoading: isLoadingPerms } =
    useUserPermissions(userType.id);
  const assignMutation = useAssignPermissions();

  const [permissions, setPermissions] = useState<
    Record<string, ModulePermissionRequest>
  >({});

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Initialize permissions state when data is loaded
  useEffect(() => {
    if (existingPermissions) {
      const permMap: Record<string, ModulePermissionRequest> = {};
      existingPermissions.forEach(p => {
        permMap[p.moduleCode] = {
          userTypeId: userType.id!,
          moduleCode: p.moduleCode,
          canView: p.canView,
          canCreate: p.canCreate,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
          canApprove: p.canApprove,
          canExport: p.canExport,
        };
      });
      setPermissions(permMap);
    }
  }, [existingPermissions, userType.id]);

  // Initialize expanded state (expand all by default)
  useEffect(() => {
    if (modules) {
      const expanded: Record<string, boolean> = {};
      const traverse = (mods: Module[]) => {
        mods.forEach(m => {
          if (m.children && m.children.length > 0) {
            expanded[m.moduleCode] = true;
            traverse(m.children);
          }
        });
      };
      traverse(modules);
      setExpandedModules(expanded);
    }
  }, [modules]);

  const toggleExpand = (moduleCode: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleCode]: !prev[moduleCode],
    }));
  };

  const handlePermissionChange = (
    moduleCode: string,
    field: keyof Omit<ModulePermissionRequest, 'userTypeId' | 'moduleCode'>,
    value: boolean
  ) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };

      // Helper to ensure permission object exists
      const ensurePermission = (code: string) => {
        if (!newPermissions[code]) {
          newPermissions[code] = {
            userTypeId: userType.id!,
            moduleCode: code,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canApprove: false,
            canExport: false,
          };
        }
        return newPermissions[code];
      };

      const current = ensurePermission(moduleCode);
      const updated = { ...current, [field]: value };

      // If View is turned off, turn off everything else
      if (field === 'canView' && !value) {
        updated.canCreate = false;
        updated.canEdit = false;
        updated.canDelete = false;
        updated.canApprove = false;
        updated.canExport = false;
      }

      // If any action is turned on, View must be on
      if (field !== 'canView' && value) {
        updated.canView = true;
      }

      newPermissions[moduleCode] = updated;

      // Auto-enable parent if child is enabled (View)
      if (updated.canView && modules) {
        const findParent = (mods: Module[], childCode: string): Module | null => {
          for (const m of mods) {
            if (m.children?.some(c => c.moduleCode === childCode)) {
              return m;
            }
            if (m.children) {
              const found = findParent(m.children, childCode);
              if (found) return found;
            }
          }
          return null;
        };

        const parent = findParent(modules, moduleCode);
        if (parent) {
          const parentPerm = ensurePermission(parent.moduleCode);
          if (!parentPerm.canView) {
            newPermissions[parent.moduleCode] = {
              ...parentPerm,
              canView: true,
            };
          }
        }
      }

      return newPermissions;
    });
  };

  const handleSave = async () => {
    try {
      const permissionsList = Object.values(permissions);
      await assignMutation.mutateAsync({
        userTypeId: userType.id!,
        permissions: permissionsList,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update permissions');
    }
  };

  const renderModuleRow = (module: Module, level: number = 0) => {
    const perm = permissions[module.moduleCode] || {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canExport: false,
    };

    const hasChildren = module.children && module.children.length > 0;
    const isExpanded = expandedModules[module.moduleCode];

    return (
      <React.Fragment key={module.id}>
        <tr className={`hover:bg-gray-50 ${level === 0 ? 'bg-gray-50/50' : ''}`}>
          <td className='px-4 py-3 whitespace-nowrap'>
            <div
              className='flex items-center gap-2'
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(module.moduleCode)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className='w-4' />
              )}
              <span className={`text-sm ${level === 0 ? 'font-semibold' : 'text-gray-700'}`}>
                {module.moduleName}
              </span>
            </div>
          </td>
          <td className='px-4 py-3 text-center'>
            <input
              type='checkbox'
              checked={perm.canView}
              onChange={e => handlePermissionChange(module.moduleCode, 'canView', e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
          </td>
          <td className='px-4 py-3 text-center'>
            <input
              type='checkbox'
              checked={perm.canCreate}
              onChange={e => handlePermissionChange(module.moduleCode, 'canCreate', e.target.checked)}
              disabled={!perm.canView}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50'
            />
          </td>
          <td className='px-4 py-3 text-center'>
            <input
              type='checkbox'
              checked={perm.canEdit}
              onChange={e => handlePermissionChange(module.moduleCode, 'canEdit', e.target.checked)}
              disabled={!perm.canView}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50'
            />
          </td>
          <td className='px-4 py-3 text-center'>
            <input
              type='checkbox'
              checked={perm.canDelete}
              onChange={e => handlePermissionChange(module.moduleCode, 'canDelete', e.target.checked)}
              disabled={!perm.canView}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50'
            />
          </td>
          <td className='px-4 py-3 text-center'>
            <input
              type='checkbox'
              checked={perm.canApprove}
              onChange={e => handlePermissionChange(module.moduleCode, 'canApprove', e.target.checked)}
              disabled={!perm.canView}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50'
            />
          </td>
          <td className='px-4 py-3 text-center'>
            <input
              type='checkbox'
              checked={perm.canExport}
              onChange={e => handlePermissionChange(module.moduleCode, 'canExport', e.target.checked)}
              disabled={!perm.canView}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50'
            />
          </td>
        </tr>
        {hasChildren && isExpanded && module.children?.map(child => renderModuleRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const isLoading = isLoadingModules || isLoadingPerms;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>Edit Permissions</h2>
            <p className='text-sm text-gray-600 mt-1'>
              User Type: <span className='font-medium'>{userType.name}</span>
            </p>
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto p-6'>
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <Loader2 className='animate-spin text-blue-600' size={32} />
            </div>
          ) : (
            <table className='min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden'>
              <thead className='bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3'>Module</th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>View</th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Create</th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Edit</th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Delete</th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Approve</th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Export</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {modules?.map(module => renderModuleRow(module))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={onClose}
            className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={assignMutation.isPending}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'
          >
            {assignMutation.isPending ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionForm;
