import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createContract, getContracts, getContractById, updateContract, deleteContract } from '../services/contractService';
import { Contract } from '../types';

// Keys
export const CONTRACT_KEYS = {
    all: ['contracts'] as const,
    lists: () => [...CONTRACT_KEYS.all, 'list'] as const,
    details: () => [...CONTRACT_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...CONTRACT_KEYS.details(), id] as const,
};

// Hooks

export const useContracts = () => {
    return useQuery({
        queryKey: CONTRACT_KEYS.lists(),
        queryFn: getContracts,
    });
};

export const useContract = (id: number) => {
    return useQuery({
        queryKey: CONTRACT_KEYS.detail(id),
        queryFn: () => getContractById(id),
        enabled: !!id,
    });
};

export const useCreateContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Contract>) => createContract(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists() });
        },
    });
};

export const useUpdateContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Contract> }) => updateContract(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists() });
        },
    });
};

export const useDeleteContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteContract(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists() });
        },
    });
};

// Get approved RFPs for contract creation (PURCHASE_AGREEMENT type)
export const useApprovedRFPsForContract = () => {
    return useQuery({
        queryKey: [...CONTRACT_KEYS.all, 'approved-rfps'] as const,
        queryFn: () => import('../services/contractService').then(m => m.getApprovedRFPsForContract()),
    });
};

// Create contract from RFP
export const useCreateContractFromRFP = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rfpId: number) => import('../services/contractService').then(m => m.createContractFromRFP(rfpId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: [...CONTRACT_KEYS.all, 'approved-rfps'] });
        },
    });
};

