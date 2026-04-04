import { ConnectionRequest, ConnectionRequestStatus, ConnectionRequestTargetType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface CreateConnectionRequestPayload {
  startupUserId: string;
  targetId: string;
  targetType: ConnectionRequestTargetType;
  message: string;
  details?: Record<string, unknown> | null;
  startupName?: string;
  requesterEmail?: string;
  requesterName?: string;
}

class ConnectionRequestsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async create(payload: CreateConnectionRequestPayload): Promise<{ message: string; request: ConnectionRequest }> {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  async listForUser(userId: string): Promise<ConnectionRequest[]> {
    const response = await fetch(`${API_URL}/api/requests/user/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse<ConnectionRequest[]>(response);
  }

  async listForAdmin(): Promise<ConnectionRequest[]> {
    const response = await fetch(`${API_URL}/api/requests/admin`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse<ConnectionRequest[]>(response);
  }

  async getById(id: string): Promise<ConnectionRequest> {
    const response = await fetch(`${API_URL}/api/requests/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse<ConnectionRequest>(response);
  }

  async updateStatus(id: string, status: ConnectionRequestStatus): Promise<ConnectionRequest> {
    const response = await fetch(`${API_URL}/api/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return this.handleResponse<ConnectionRequest>(response);
  }
}

export const connectionRequestsApi = new ConnectionRequestsApi();
