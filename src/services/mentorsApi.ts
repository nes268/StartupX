import { Mentor, CreateMentorData, UpdateMentorData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class MentorsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getMentors(): Promise<Mentor[]> {
    const response = await fetch(`${API_URL}/api/mentors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Mentor[]>(response);
  }

  async getMentorById(id: string): Promise<Mentor> {
    const response = await fetch(`${API_URL}/api/mentors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Mentor>(response);
  }

  async createMentor(mentorData: CreateMentorData): Promise<Mentor> {
    const response = await fetch(`${API_URL}/api/mentors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mentorData),
    });
    return this.handleResponse<Mentor>(response);
  }

  async updateMentor(mentorData: UpdateMentorData): Promise<Mentor> {
    const { id, ...updateData } = mentorData;
    const response = await fetch(`${API_URL}/api/mentors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse<Mentor>(response);
  }

  async deleteMentor(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/mentors/${id}`, {
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

  async requestSession(data: {
    mentorEmail: string;
    startupName: string;
    topic: string;
    preferredTimeSlot: string;
    additionalNotes?: string;
    requesterEmail?: string;
    requesterName?: string;
  }): Promise<{ message: string; sent?: boolean; logged?: boolean }> {
    const response = await fetch(`${API_URL}/api/mentors/request-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string; sent?: boolean; logged?: boolean }>(response);
  }
}

export const mentorsApi = new MentorsApi();
