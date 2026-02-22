import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Startup } from '../types';
import { startupsApi } from '../services/startupsApi';

export interface Application extends Startup {
  id: string;
  name: string;
  founder: string;
  sector: string;
  type: 'incubation' | 'innovation';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'dropout';
  email: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationsContextType {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  refreshApplications: (showLoading?: boolean) => Promise<void>;
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  approveApplication: (id: string) => Promise<void>;
  rejectApplication: (id: string) => Promise<void>;
  getApplicationsByStatus: (status: Application['status']) => Application[];
  getApplicationById: (id: string) => Application | undefined;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export const ApplicationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications from backend - memoized with useCallback
  const refreshApplications = useCallback(async (showLoading: boolean = false) => {
    // Only show loading state if explicitly requested (e.g., initial load or manual refresh)
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const startups = await startupsApi.getStartups();
      // Map startups to applications format
      const mappedApplications: Application[] = startups.map(startup => ({
        ...startup,
        status: startup.status as Application['status'],
        createdAt: startup.createdAt || new Date().toISOString(),
        updatedAt: startup.updatedAt || new Date().toISOString()
      }));
      setApplications(mappedApplications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch applications on mount - show loading on initial load
  useEffect(() => {
    refreshApplications(true);
  }, [refreshApplications]);

  const addApplication = (applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newApplication: Application = {
      ...applicationData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setApplications(prev => [newApplication, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev => 
      prev.map(application => 
        application.id === id 
          ? { ...application, ...updates, updatedAt: new Date().toISOString() }
          : application
      )
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(application => application.id !== id));
  };

  const approveApplication = async (id: string) => {
    try {
      // Use the dedicated approve endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/startups/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to approve application' }));
        throw new Error(errorData.error || 'Failed to approve application');
      }
      
      // Refresh applications to get updated data (silent refresh)
      await refreshApplications(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to approve application');
    }
  };

  const rejectApplication = async (id: string) => {
    try {
      // Use the dedicated reject endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/startups/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to reject application' }));
        throw new Error(errorData.error || 'Failed to reject application');
      }
      
      // Refresh applications to get updated data (silent refresh)
      await refreshApplications(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to reject application');
    }
  };

  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter(application => application.status === status);
  };

  const getApplicationById = (id: string) => {
    return applications.find(application => application.id === id);
  };

  return (
    <ApplicationsContext.Provider value={{
      applications,
      isLoading,
      error,
      refreshApplications,
      addApplication,
      updateApplication,
      deleteApplication,
      approveApplication,
      rejectApplication,
      getApplicationsByStatus,
      getApplicationById
    }}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};
