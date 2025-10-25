import React from 'react';
import type { Permission, UserRole } from '@/types/user';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  userRole: UserRole; // In real app, this would come from auth context
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  allowedRoles = [],
  fallback = null,
  userRole
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions({ userRole });

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGate;