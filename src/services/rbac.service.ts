import { apiClient } from '@/lib/api';
import type { EntityInfo } from '@/store/entityStore';

export interface MyScope {
  unrestricted: boolean;
  roles: string[];
  defaultEntityId: number | null;
  entities: EntityInfo[];
}

/**
 * RBAC scope API — which roles the caller holds and which entities (plants)
 * they may work in. Backend: RbacController /api/rbac/my-scope.
 */
export const RbacService = {
  async getMyScope(): Promise<MyScope> {
    const response = await apiClient.get<MyScope>('/rbac/my-scope');
    return response.data;
  },
};
