/**
 * Vendor/Supplier API Service
 */

import { apiClient } from '@/lib/api';
import type { Vendor } from '@/types/vendor';

const VENDOR_BASE_URL = '/master/suppliers';

export const vendorApi = {
  /**
   * Get all vendors/suppliers
   */
  getAllVendors: async (): Promise<Vendor[]> => {
    const response = await apiClient.get<Vendor[]>(`${VENDOR_BASE_URL}/all`);
    // Defensive programming: ensure we return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get vendor by ID
   */
  getVendorById: async (id: number): Promise<Vendor> => {
    const response = await apiClient.get<Vendor>(`${VENDOR_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new vendor
   */
  createVendor: async (vendor: Partial<Vendor>): Promise<Vendor> => {
    const response = await apiClient.post<Vendor>(VENDOR_BASE_URL, vendor);
    return response.data;
  },

  /**
   * Update an existing vendor
   */
  updateVendor: async (id: number, vendor: Partial<Vendor>): Promise<Vendor> => {
    const response = await apiClient.put<Vendor>(`${VENDOR_BASE_URL}/${id}`, vendor);
    return response.data;
  },

  /**
   * Delete a vendor
   */
  deleteVendor: async (id: number): Promise<void> => {
    await apiClient.delete(`${VENDOR_BASE_URL}/${id}`);
  },
};
