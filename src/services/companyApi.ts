/**
 * Company/Organization API Service
 */

import { apiClient } from '@/lib/api';
import type { Company } from '@/types/company';

const COMPANY_BASE_URL = '/master/companies';

export const companyApi = {
  /**
   * Get all active companies
   */
  getAllActiveCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>(`${COMPANY_BASE_URL}/active`);
    // Defensive programming: ensure we return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get company by ID
   */
  getCompanyById: async (id: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`${COMPANY_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new company
   */
  createCompany: async (company: Partial<Company>): Promise<Company> => {
    const response = await apiClient.post<Company>(COMPANY_BASE_URL, company);
    return response.data;
  },

  /**
   * Update an existing company
   */
  updateCompany: async (id: number, company: Partial<Company>): Promise<Company> => {
    const response = await apiClient.put<Company>(`${COMPANY_BASE_URL}/${id}`, company);
    return response.data;
  },

  /**
   * Delete a company
   */
  deleteCompany: async (id: number): Promise<void> => {
    await apiClient.delete(`${COMPANY_BASE_URL}/${id}`);
  },
};
