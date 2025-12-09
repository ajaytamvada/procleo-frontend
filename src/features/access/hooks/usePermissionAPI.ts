import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE_URL = '/master/permissions';

export interface UserTypeModulePermission {
    id?: number;
    userTypeId: number;
    moduleCode: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canExport: boolean;
}

export interface ModulePermissionRequest {
    userTypeId: number;
    moduleCode: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canExport: boolean;
}

// Fetch permissions for a user type
export const useUserPermissions = (userTypeId: number | undefined) => {
    return useQuery({
        queryKey: ['permissions', 'userType', userTypeId],
        queryFn: async () => {
            if (!userTypeId) throw new Error('User Type ID is required');
            const { data } = await apiClient.get<UserTypeModulePermission[]>(
                `${API_BASE_URL}/user-type/${userTypeId}`
            );
            return data;
        },
        enabled: !!userTypeId,
    });
};

// Bulk assign permissions
export const useAssignPermissions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userTypeId,
            permissions,
        }: {
            userTypeId: number;
            permissions: ModulePermissionRequest[];
        }) => {
            const { data } = await apiClient.post<UserTypeModulePermission[]>(
                `${API_BASE_URL}/bulk?userTypeId=${userTypeId}`,
                permissions
            );
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['permissions', 'userType', variables.userTypeId],
            });
        },
    });
};
