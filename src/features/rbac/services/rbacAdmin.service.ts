import { apiClient } from '@/lib/api';

// ---- Types ----

export interface OrgEntity {
  id: number;
  tenantId: number | null;
  companyId: number | null;
  entityCode: string;
  entityName: string;
  entityType: string;
  gstin: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  cityId: number | null;
  stateId: number | null;
  pincode: string | null;
  isActive: boolean;
  createdAt: string | null;
}

export interface RbacRole {
  id: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}

export interface UserAssignment {
  id: number;
  userLoginId: number;
  roleId: number;
  roleCode: string | null;
  roleName: string | null;
  entityId: number | null;
  entityName: string | null;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string | null;
  createdBy: number | null;
}

export interface LoginUser {
  id: number;
  loginName: string;
  email: string | null;
  employeeName?: string | null;
  status?: number;
}

// ---- API ----

export const RbacAdminService = {
  // Entities
  async listEntities(): Promise<OrgEntity[]> {
    const res = await apiClient.get<OrgEntity[]>('/rbac/admin/entities');
    return Array.isArray(res.data) ? res.data : [];
  },
  async createEntity(entity: Partial<OrgEntity>): Promise<OrgEntity> {
    const res = await apiClient.post<OrgEntity>('/rbac/admin/entities', entity);
    return res.data;
  },
  async updateEntity(
    id: number,
    entity: Partial<OrgEntity>
  ): Promise<OrgEntity> {
    const res = await apiClient.put<OrgEntity>(
      `/rbac/admin/entities/${id}`,
      entity
    );
    return res.data;
  },

  // Roles
  async listRoles(): Promise<RbacRole[]> {
    const res = await apiClient.get<RbacRole[]>('/rbac/admin/roles');
    return Array.isArray(res.data) ? res.data : [];
  },

  // User assignments
  async getUserAssignments(userLoginId: number): Promise<UserAssignment[]> {
    const res = await apiClient.get<UserAssignment[]>(
      `/rbac/admin/users/${userLoginId}/assignments`
    );
    return Array.isArray(res.data) ? res.data : [];
  },
  async addAssignment(
    userLoginId: number,
    roleId: number,
    entityId: number | null
  ): Promise<UserAssignment> {
    const res = await apiClient.post<UserAssignment>(
      `/rbac/admin/users/${userLoginId}/assignments`,
      { roleId, entityId }
    );
    return res.data;
  },
  async deactivateAssignment(assignmentId: number): Promise<void> {
    await apiClient.put(`/rbac/admin/assignments/${assignmentId}/deactivate`);
  },

  // Users (existing master endpoint)
  async listUsers(): Promise<LoginUser[]> {
    const res = await apiClient.get<LoginUser[]>('/master/login-provision');
    return Array.isArray(res.data) ? res.data : [];
  },
};
