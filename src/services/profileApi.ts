import { Profile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ProfileApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getProfileByUserId(userId: string): Promise<Profile> {
    const response = await fetch(`${API_URL}/api/profiles/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Profile>(response);
  }

  async saveProfile(profileData: Partial<Profile> & { userId: string }): Promise<Profile> {
    const response = await fetch(`${API_URL}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return this.handleResponse<Profile>(response);
  }

  async updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
    const response = await fetch(`${API_URL}/api/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return this.handleResponse<Profile>(response);
  }
}

export const profileApi = new ProfileApi();

