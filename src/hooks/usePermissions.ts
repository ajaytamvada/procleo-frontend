import { usePermissionStore } from '@/store/permissionStore';
import type { PermissionAction } from '@/types/permissions';
import { useCallback } from 'react';

/**
 * Custom hook for checking permissions in components
 *
 * @example
 * ```tsx
 * const { hasModule, canPerform } = usePermissions();
 *
 * if (hasModule('PR_CREATE')) {
 *   // Show create PR button
 * }
 *
 * if (canPerform('PR_MANAGE', 'delete')) {
 *   // Show delete button
 * }
 * ```
 */
export const usePermissions = () => {
  const {
    modules,
    hasModule,
    canPerform,
    getModule,
    getModulesByParent,
    getAllowedRoutes,
    canAccessRoute,
    isLoaded,
  } = usePermissionStore();

  /**
   * Check if user has any of the specified modules
   */
  const hasAnyModule = useCallback(
    (moduleCodes: string[]) => {
      return moduleCodes.some(code => hasModule(code));
    },
    [hasModule]
  );

  /**
   * Check if user has all of the specified modules
   */
  const hasAllModules = useCallback(
    (moduleCodes: string[]) => {
      return moduleCodes.every(code => hasModule(code));
    },
    [hasModule]
  );

  /**
   * Check if user can perform action on any of the specified modules
   */
  const canPerformOnAny = useCallback(
    (moduleCodes: string[], action: PermissionAction) => {
      return moduleCodes.some(code => canPerform(code, action));
    },
    [canPerform]
  );

  /**
   * Get action permissions for a module
   */
  const getModulePermissions = useCallback(
    (moduleCode: string) => {
      const module = getModule(moduleCode);
      if (!module) {
        return {
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canApprove: false,
          canExport: false,
        };
      }

      return {
        canView: module.canView,
        canCreate: module.canCreate,
        canEdit: module.canEdit,
        canDelete: module.canDelete,
        canApprove: module.canApprove,
        canExport: module.canExport,
      };
    },
    [getModule]
  );

  return {
    modules,
    isLoaded,
    hasModule,
    hasAnyModule,
    hasAllModules,
    canPerform,
    canPerformOnAny,
    getModule,
    getModulePermissions,
    getModulesByParent,
    getAllowedRoutes,
    canAccessRoute,
  };
};
