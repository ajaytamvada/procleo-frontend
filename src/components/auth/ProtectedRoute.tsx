import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getModuleCode } from '@/config/moduleMapping';
import type { PermissionAction } from '@/types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;

  // Legacy permission props (deprecated but still supported)
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  allowedRoles?: string[];

  // New module-based permission props
  requiredModule?: string;
  requiredModules?: string[];
  requiredAction?: PermissionAction;

  fallbackPath?: string;
}

/**
 * Protected Route Component
 *
 * Protects routes based on authentication and module permissions.
 * Supports both legacy permission system and new module-based system.
 *
 * @example
 * ```tsx
 * // Protect by module
 * <Route path="/purchase-requisition/create" element={
 *   <ProtectedRoute requiredModule="PR_CREATE">
 *     <CreatePRPage />
 *   </ProtectedRoute>
 * } />
 *
 * // Protect by action permission
 * <Route path="/purchase-requisition/manage" element={
 *   <ProtectedRoute requiredModule="PR_MANAGE" requiredAction="delete">
 *     <ManagePRPage />
 *   </ProtectedRoute>
 * } />
 *
 * // Auto-detect from route path
 * <Route path="/rfp/approve" element={
 *   <ProtectedRoute>
 *     <ApproveRFPPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  allowedRoles = [],
  requiredModule,
  requiredModules = [],
  requiredAction,
  fallbackPath = '/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const {
    hasModule,
    hasAllModules,
    hasAnyModule,
    canPerform,
    canAccessRoute,
    isLoaded: permissionsLoaded,
  } = usePermissions();

  // Show loading while checking authentication or permissions
  if (isLoading || !permissionsLoaded) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto'></div>
          <p className='mt-4 text-gray-600 font-medium'>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // === Module-Based Permission Checks (New System) ===

  // Auto-detect module from current route if no module specified
  const currentModuleCode = requiredModule || getModuleCode(location.pathname);

  // Check single module access
  if (currentModuleCode && !hasModule(currentModuleCode)) {
    return <Navigate to='/unauthorized' state={{ from: location }} replace />;
  }

  // Check multiple modules (require all)
  if (requiredModules.length > 0 && !hasAllModules(requiredModules)) {
    return <Navigate to='/unauthorized' state={{ from: location }} replace />;
  }

  // Check action permission on module
  if (currentModuleCode && requiredAction) {
    if (!canPerform(currentModuleCode, requiredAction)) {
      return (
        <Navigate
          to='/unauthorized'
          state={{ from: location, missingAction: requiredAction }}
          replace
        />
      );
    }
  }

  // Check route access (fallback)
  if (!currentModuleCode && !canAccessRoute(location.pathname)) {
    // Allow access if no module code found (for non-module routes)
    if (getModuleCode(location.pathname)) {
      return <Navigate to='/unauthorized' state={{ from: location }} replace />;
    }
  }

  // === Legacy Permission Checks (Backward Compatibility) ===

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return <Navigate to='/unauthorized' state={{ from: location }} replace />;
  }

  // Check single permission (legacy)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to='/unauthorized' state={{ from: location }} replace />;
  }

  // Check multiple permissions (legacy)
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : requiredPermissions.some(permission => hasPermission(permission));

    if (!hasAccess) {
      return <Navigate to='/unauthorized' state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
