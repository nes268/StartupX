import { Event, CreateEventData, UpdateEventData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class EventsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Event[]>(response);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const response = await fetch(`${API_URL}/api/events/upcoming`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Event[]>(response);
  }

  async getCompletedEvents(): Promise<Event[]> {
    const response = await fetch(`${API_URL}/api/events/completed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Event[]>(response);
  }

  async getEventById(id: string): Promise<Event> {
    const response = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Event>(response);
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return this.handleResponse<Event>(response);
  }

  async updateEvent(eventData: UpdateEventData): Promise<Event> {
    const { id, ...updateData } = eventData;
    const response = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse<Event>(response);
  }

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/events/${id}`, {
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

  async getEventCategories(): Promise<string[]> {
    const response = await fetch(`${API_URL}/api/events/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<string[]>(response);
  }
}

export const eventsApi = new EventsApi();
