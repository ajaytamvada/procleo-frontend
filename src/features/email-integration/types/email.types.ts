export interface EmailConnection {
  id: number;
  emailAddress: string;
  provider: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'DISCONNECTED';
  lastPolledAt: string | null;
  invoicesIngested: number;
  lastError: string | null;
  createdAt: string;
  createdBy: string;
}

export interface ConnectResponse {
  authorizationUrl: string;
}
