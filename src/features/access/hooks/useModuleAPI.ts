import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE_URL = '/master/modules';

export interface Module {
    id: number;
    moduleCode: string;
    moduleName: string;
    parentModuleCode: string | null;
    routePath: string | null;
    iconName: string | null;
    sortOrder: number;
    isActive: boolean;
    moduleType: string;
    children?: Module[];
}

// Fetch all modules hierarchically
export const useHierarchicalModules = () => {
    return useQuery({
        queryKey: ['modules', 'hierarchical'],
        queryFn: async () => {
            const { data } = await apiClient.get<Module[]>(
                `${API_BASE_URL}/hierarchical`
            );
            return data;
        },
    });
};
