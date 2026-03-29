import { apiClient } from '@/lib/api';
import type { EmailConnection, ConnectResponse } from '../types/email.types';

const API_BASE = '/email';

export const getConnectUrl = async (): Promise<ConnectResponse> => {
  const response = await apiClient.get<ConnectResponse>(`${API_BASE}/connect`);
  return response.data;
};

export const getConnections = async (): Promise<EmailConnection[]> => {
  const response = await apiClient.get<EmailConnection[]>(
    `${API_BASE}/connections`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getConnectionStatus = async (
  id: number
): Promise<EmailConnection> => {
  const response = await apiClient.get<EmailConnection>(
    `${API_BASE}/connections/${id}`
  );
  return response.data;
};

export const disconnectEmail = async (
  id: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `${API_BASE}/connections/${id}`
  );
  return response.data;
};

export const pollNow = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `${API_BASE}/poll-now`
  );
  return response.data;
};
