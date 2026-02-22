import { Startup } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class StartupsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (textError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async getStartups(userId?: string): Promise<Startup[]> {
    const url = userId 
      ? `${API_URL}/api/startups?userId=${userId}`
      : `${API_URL}/api/startups`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Startup[]>(response);
  }

  async getStartupByUserId(userId: string): Promise<Startup | null> {
    const startups = await this.getStartups(userId);
    return startups.length > 0 ? startups[0] : null;
  }

  async getStartupById(id: string): Promise<Startup> {
    const response = await fetch(`${API_URL}/api/startups/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Startup>(response);
  }

  async createStartup(startupData: Partial<Startup> & { name: string; founder: string; sector: string; type: 'innovation' | 'incubation'; email: string; submissionDate: string }): Promise<Startup> {
    const response = await fetch(`${API_URL}/api/startups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startupData),
    });
    return this.handleResponse<Startup>(response);
  }

  async updateStartup(id: string, startupData: Partial<Startup>): Promise<Startup> {
    const response = await fetch(`${API_URL}/api/startups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startupData),
    });
    return this.handleResponse<Startup>(response);
  }

  async deleteStartup(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/startups/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  }

  async updateStartupPhase(userId: string, startupPhase: 'idea' | 'mvp' | 'seed' | 'series-a' | 'growth' | 'scale'): Promise<Startup> {
    const response = await fetch(`${API_URL}/api/startups/phase/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startupPhase }),
    });
    return this.handleResponse<Startup>(response);
  }
}

export const startupsApi = new StartupsApi();

