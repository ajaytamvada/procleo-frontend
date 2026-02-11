import { apiClient } from '@/lib/api';
import { Contract } from '../types';

const API_URL = '/contracts';

// Create new contract
export const createContract = async (data: Partial<Contract>): Promise<Contract> => {
    const response = await apiClient.post<Contract>(API_URL, data);
    return response.data;
};

// Create contract from RFP
export const createContractFromRFP = async (rfpId: number): Promise<Contract> => {
    const response = await apiClient.post<Contract>(`${API_URL}/from-rfp/${rfpId}`);
    return response.data;
};

// Get all contracts
export const getContracts = async (): Promise<Contract[]> => {
    const response = await apiClient.get<Contract[]>(API_URL);
    return response.data;
};

// Get contract by ID
export const getContractById = async (id: number): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`${API_URL}/${id}`);
    return response.data;
};

// Update contract
export const updateContract = async (id: number, data: Partial<Contract>): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`${API_URL}/${id}`, data);
    return response.data;
};

// Delete contract
export const deleteContract = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_URL}/${id}`);
};

// Get approved RFPs for contract creation (PURCHASE_AGREEMENT type)
export const getApprovedRFPsForContract = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`${API_URL}/approved-rfps`);
    return response.data;
};

