import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useUpdateUserType } from '../../hooks/useUserTypeAPI';
import type { UserType } from '../../hooks/useUserTypeAPI';
import { AVAILABLE_PERMISSIONS, getPermissionName, parsePermissions } from '../../constants/permissions';

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
  const [availablePerms, setAvailablePerms] = useState<string[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [tempAvailable, setTempAvailable] = useState<string[]>([]);
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  const updateMutation = useUpdateUserType();

  // Initialize permissions when user type is loaded
  useEffect(() => {
    const existingPerms = parsePermissions(userType.permissionClass ?? null);

    setSelectedPerms(existingPerms);
    setAvailablePerms(
      AVAILABLE_PERMISSIONS
        .map(p => p.id)
        .filter(id => !existingPerms.includes(id))
    );
    setTempAvailable([]);
    setTempSelected([]);
  }, [userType]);

  const handleMoveRight = () => {
    const toMove = availablePerms.filter(p => tempAvailable.includes(p));
    setSelectedPerms([...selectedPerms, ...toMove]);
    setAvailablePerms(availablePerms.filter(p => !tempAvailable.includes(p)));
    setTempAvailable([]);
  };

  const handleMoveLeft = () => {
    const toMove = selectedPerms.filter(p => tempSelected.includes(p));
    setAvailablePerms([...availablePerms, ...toMove]);
    setSelectedPerms(selectedPerms.filter(p => !tempSelected.includes(p)));
    setTempSelected([]);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: userType.id!,
        userType: {
          ...userType,
          permissionClass: selectedPerms.join(','),
        },
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update permissions');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Permissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              User Type: <span className="font-medium">{userType.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <span className="text-red-500">*</span> Module Permissions
          </label>

          <div className="grid grid-cols-7 gap-4">
            {/* Available Permissions */}
            <div className="col-span-3">
              <p className="text-sm text-gray-600 mb-2">(Hold Ctrl key for multiple selection)</p>
              <select
                multiple
                size={12}
                value={tempAvailable}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  setTempAvailable(selected);
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availablePerms.map((perm) => (
                  <option key={perm} value={perm}>
                    {getPermissionName(perm)}
                  </option>
                ))}
              </select>
            </div>

            {/* Move Buttons */}
            <div className="col-span-1 flex flex-col justify-center items-center gap-4">
              <button
                type="button"
                onClick={handleMoveRight}
                disabled={tempAvailable.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                type="button"
                onClick={handleMoveLeft}
                disabled={tempSelected.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Selected Permissions */}
            <div className="col-span-3">
              <p className="text-sm text-gray-600 mb-2">(Selected Modules for Access Permission)</p>
              <select
                multiple
                size={12}
                value={tempSelected}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  setTempSelected(selected);
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {selectedPerms.map((perm) => (
                  <option key={perm} value={perm}>
                    {getPermissionName(perm)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save & Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionForm;
