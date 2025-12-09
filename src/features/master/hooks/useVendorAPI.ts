import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Vendor {
  id: number;
  name: string;
  code?: string;
  legalForm?: string;
  webLink?: string;
  gst?: string;
  pan?: string;
  cin?: string;
  dunsNo?: string;
  industry?: string;
  email?: string;
  businessDescription?: string;

  // Address fields
  address1?: string;
  address2?: string;
  pinCode?: string;
  state?: string;
  phone?: string;
  mobileNo?: string;

  // Location IDs
  countryIds?: string;
  stateIds?: string;
  cityId?: number | null;

  // Contact person details
  contactFirstName?: string;
  contactLastName?: string;
  contactDesignation?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  password?: string;
  otp?: number;

  // Category IDs (comma-separated)
  categoryIds?: string;
  subCategoryIds?: string;

  // Certificate file paths
  gstFilePath?: string;
  panFilePath?: string;
  tdsFilePath?: string;
  msmeFilePath?: string;
  isoFilePath?: string;
  incorporationFilePath?: string;
  otherFilePath?: string;
  logoFilePath?: string;

  // Approval workflow
  approvalLevel1?: number;
  approvalRemarks?: string;
}

export interface VendorFilters {
  name?: string;
  code?: string;
  gst?: string;
  email?: string;
  industry?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const vendorAPI = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await apiClient.get('/master/suppliers/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: VendorFilters = {}
  ): Promise<PagedResponse<Vendor>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.gst) params.append('gst', filters.gst);
    if (filters.email) params.append('email', filters.email);
    if (filters.industry) params.append('industry', filters.industry);

    const response = await apiClient.get(`/master/suppliers?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Vendor> => {
    const response = await apiClient.get(`/master/suppliers/${id}`);
    return response.data;
  },

  create: async (vendor: Omit<Vendor, 'id'>): Promise<Vendor> => {
    const response = await apiClient.post('/master/suppliers', vendor);
    return response.data;
  },

  update: async (id: number, vendor: Omit<Vendor, 'id'>): Promise<Vendor> => {
    const response = await apiClient.put(`/master/suppliers/${id}`, vendor);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/suppliers/${id}`);
  },

  exportToExcel: async (filters: VendorFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.gst) params.append('gst', filters.gst);
    if (filters.email) params.append('email', filters.email);
    if (filters.industry) params.append('industry', filters.industry);

    const response = await apiClient.get(`/master/suppliers/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const useVendors = () => {
  return useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: vendorAPI.getAll,
  });
};

export const useVendorsPaged = (
  page: number,
  size: number,
  filters: VendorFilters
) => {
  return useQuery<PagedResponse<Vendor>>({
    queryKey: ['vendors', 'paged', page, size, filters],
    queryFn: () => vendorAPI.getPaged(page, size, filters),
  });
};

export const useVendor = (id: number) => {
  return useQuery<Vendor>({
    queryKey: ['vendor', id],
    queryFn: () => vendorAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Vendor, 'id'> }) =>
      vendorAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export default vendorAPI;
