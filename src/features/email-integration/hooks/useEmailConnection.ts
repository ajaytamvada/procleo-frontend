import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConnections,
  disconnectEmail,
  pollNow,
} from '../services/email.service';

export const useEmailConnections = () => {
  return useQuery({
    queryKey: ['email-connections'],
    queryFn: getConnections,
    refetchInterval: 30000,
  });
};

export const useDisconnectEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => disconnectEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
    },
  });
};

export const usePollNow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pollNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
    },
  });
};
