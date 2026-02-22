const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface UserNotification {
  id: string;
  userId: string;
  message: string;
  type: 'approval' | 'rejection' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

class NotificationsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getUserNotifications(userId: string): Promise<UserNotification[]> {
    const response = await fetch(`${API_URL}/api/notifications/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<UserNotification[]>(response);
  }

  async markAsRead(notificationId: string): Promise<UserNotification> {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<UserNotification>(response);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const response = await fetch(`${API_URL}/api/notifications/user/${userId}/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<{ count: number }>(response);
  }
}

export const notificationsApi = new NotificationsApi();


