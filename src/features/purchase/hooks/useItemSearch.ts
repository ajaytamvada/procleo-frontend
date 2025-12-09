import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Item as ItemDto } from '@/features/master/hooks/useItemAPI';

export type { ItemDto };

const searchItems = async (query: string): Promise<ItemDto[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const response = await apiClient.get(
    `/master/items/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const useItemSearch = (query: string, enabled: boolean = true) => {
  return useQuery<ItemDto[]>({
    queryKey: ['items', 'search', query],
    queryFn: () => searchItems(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
};
