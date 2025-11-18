import { Report, CreateReportData, UpdateReportData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ReportsApi {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getReports(): Promise<Report[]> {
    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Report[]>(response);
  }

  async getReportById(id: string): Promise<Report> {
    const response = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse<Report>(response);
  }

  async createReport(reportData: CreateReportData, files: File[], adminId?: string): Promise<Report> {
    const formData = new FormData();
    
    // Add report metadata
    formData.append('name', reportData.name);
    formData.append('type', reportData.type);
    formData.append('dateGenerated', reportData.dateGenerated);
    formData.append('fileSize', reportData.fileSize);
    if (adminId) {
      formData.append('adminId', adminId);
    }
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse<Report>(response);
  }

  async downloadReportFile(reportId: string, fileIndex: number): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/reports/${reportId}/download/${fileIndex}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  }

  async updateReport(reportData: UpdateReportData): Promise<Report> {
    const { id, ...updateData } = reportData;
    const response = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse<Report>(response);
  }

  async deleteReport(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/reports/${id}`, {
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

export const reportsApi = new ReportsApi();
