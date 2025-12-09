import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserModulePermission,
  PermissionAction,
} from '@/types/permissions';
import { createPathRegex } from '@/utils/route-utils';

/**
 * Permission Store State
 */
interface PermissionState {
  modules: UserModulePermission[];
  isLoaded: boolean;

  // Actions
  setModules: (modules: UserModulePermission[]) => void;
  clearModules: () => void;
  hasModule: (moduleCode: string) => boolean;
  canPerform: (moduleCode: string, action: PermissionAction) => boolean;
  getModule: (moduleCode: string) => UserModulePermission | undefined;
  getModulesByParent: (parentCode?: string) => UserModulePermission[];
  getAllowedRoutes: () => string[];
  canAccessRoute: (routePath: string) => boolean;
}

/**
 * Permission Store
 * Manages user's module permissions and provides helper functions to check access
 */
export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      modules: [],
      isLoaded: false,

      /**
       * Set user's modules (called after login)
       */
      setModules: (modules: UserModulePermission[]) => {
        set({ modules, isLoaded: true });
      },

      /**
       * Clear all modules (called on logout)
       */
      clearModules: () => {
        set({ modules: [], isLoaded: false });
      },

      /**
       * Check if user has access to a module
       */
      hasModule: (moduleCode: string) => {
        const { modules } = get();
        const module = modules.find(m => m.moduleCode === moduleCode);
        return module?.canView ?? false;
      },

      /**
       * Check if user can perform a specific action on a module
       */
      canPerform: (moduleCode: string, action: PermissionAction) => {
        const { modules } = get();
        const module = modules.find(m => m.moduleCode === moduleCode);

        if (!module) return false;

        switch (action) {
          case 'view':
            return module.canView;
          case 'create':
            return module.canCreate;
          case 'edit':
            return module.canEdit;
          case 'delete':
            return module.canDelete;
          case 'approve':
            return module.canApprove;
          case 'export':
            return module.canExport;
          default:
            return false;
        }
      },

      /**
       * Get a specific module's permissions
       */
      getModule: (moduleCode: string) => {
        const { modules } = get();
        return modules.find(m => m.moduleCode === moduleCode);
      },

      /**
       * Get modules by parent (for building hierarchical navigation)
       */
      getModulesByParent: (parentCode?: string) => {
        const { modules } = get();
        return modules
          .filter(m => m.parentModuleCode === parentCode)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      /**
       * Get all routes user has access to
       */
      getAllowedRoutes: () => {
        const { modules } = get();
        return modules
          .filter(m => m.canView && m.routePath)
          .map(m => m.routePath as string);
      },

      /**
       * Check if user can access a specific route
       * Handles both static routes and dynamic routes with parameters
       */
      canAccessRoute: (routePath: string) => {
        const { modules } = get();

        // Normalize route path (remove trailing slash)
        const normalizedPath =
          routePath.endsWith('/') && routePath !== '/'
            ? routePath.slice(0, -1)
            : routePath;

        return modules.some(m => {
          if (!m.routePath) return false;

          const normalizedModulePath =
            m.routePath.endsWith('/') && m.routePath !== '/'
              ? m.routePath.slice(0, -1)
              : m.routePath;

          // Check exact match first
          if (normalizedModulePath === normalizedPath && m.canView) {
            return true;
          }

          // Check dynamic routes
          if (m.routePath.includes(':')) {
            const regex = createPathRegex(m.routePath);
            if (regex.test(normalizedPath)) {
              return m.canView;
            }
          }

          return false;
        });
      },
    }),
    {
      name: 'permission-storage', // localStorage key
      partialize: state => ({
        modules: state.modules,
        isLoaded: state.isLoaded,
      }),
    }
  )
);
