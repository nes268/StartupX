import { Investor, CreateInvestorData, UpdateInvestorData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class InvestorsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
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

  async getInvestors(): Promise<Investor[]> {
    const response = await fetch(`${API_URL}/api/investors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Investor[]>(response);
  }

  async getInvestorById(id: string): Promise<Investor> {
    const response = await fetch(`${API_URL}/api/investors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Investor>(response);
  }

  async createInvestor(investorData: CreateInvestorData): Promise<Investor> {
    const response = await fetch(`${API_URL}/api/investors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investorData),
    });
    return this.handleResponse<Investor>(response);
  }

  async updateInvestor(investorData: UpdateInvestorData): Promise<Investor> {
    const { id, ...updateData } = investorData;
    const response = await fetch(`${API_URL}/api/investors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse<Investor>(response);
  }

  async deleteInvestor(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/investors/${id}`, {
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

  async requestIntro(investorEmail: string, startupName: string, requesterEmail: string, requesterName: string, message?: string): Promise<{ message: string; sent: boolean }> {
    const response = await fetch(`${API_URL}/api/investors/request-intro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        investorEmail,
        startupName,
        requesterEmail,
        requesterName,
        message: message || ''
      }),
    });
    return this.handleResponse<{ message: string; sent: boolean }>(response);
  }
}

export const investorsApi = new InvestorsApi();
