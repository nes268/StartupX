import { Document, CreateDocumentData, UpdateDocumentData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class DocumentsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getDocuments(userId?: string): Promise<Document[]> {
    const url = userId 
      ? `${API_URL}/api/documents?userId=${userId}`
      : `${API_URL}/api/documents`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Document[]>(response);
  }

  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    const response = await fetch(`${API_URL}/api/documents/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return this.handleResponse<Document[]>(response);
  }

  async getDocumentsByStartupId(startupId: string): Promise<Document[]> {
    console.log('Fetching documents by startupId:', startupId);
    const response = await fetch(`${API_URL}/api/documents/startup/${startupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      let errorMessage = 'Unknown error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('API Error response:', errorData);
      } catch (e) {
        const text = await response.text().catch(() => '');
        errorMessage = text || `HTTP error! status: ${response.status}`;
        console.error('API Error (text):', text);
      }
      throw new Error(errorMessage);
    }
    return this.handleResponse<Document[]>(response);
  }

  async getDocumentById(id: string): Promise<Document> {
    const response = await fetch(`${API_URL}/api/documents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Document>(response);
  }

  async uploadDocument(file: File, userId: string, location?: string): Promise<Document> {
    if (!userId) {
      throw new Error('User ID is required to upload documents');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    if (location) {
      formData.append('location', location);
    }

    console.log('Uploading file:', file.name, 'with userId:', userId, 'location:', location || 'default');

    const response = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      console.error('Upload error response:', errorData);
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }
    
    return response.json();
  }

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const response = await fetch(`${API_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    });
    return this.handleResponse<Document>(response);
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/documents/${id}/download`, {
      method: 'GET',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.blob();
  }

  async updateDocument(documentData: UpdateDocumentData): Promise<Document> {
    const { id, ...updateData } = documentData;
    const response = await fetch(`${API_URL}/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse<Document>(response);
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/documents/${id}`, {
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
}

export const documentsApi = new DocumentsApi();
