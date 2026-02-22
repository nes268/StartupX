import { useState, useEffect, useCallback } from 'react';
import { Startup } from '../types';
import { startupsApi } from '../services/startupsApi';

export interface UseStartupsReturn {
  startups: Startup[];
  loading: boolean;
  error: string | null;
  refreshStartups: () => Promise<void>;
  updateStartup: (id: string, updates: Partial<Startup>) => Promise<Startup>;
  updateStartupPhase: (userId: string, phase: 'idea' | 'mvp' | 'seed' | 'series-a' | 'growth' | 'scale') => Promise<Startup>;
  deleteStartup: (id: string) => Promise<void>;
}

export const useStartups = (): UseStartupsReturn => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStartups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startupsData = await startupsApi.getStartups();
      setStartups(startupsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch startups');
      console.error('Error fetching startups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStartup = useCallback(async (id: string, updates: Partial<Startup>): Promise<Startup> => {
    try {
      setError(null);
      const updatedStartup = await startupsApi.updateStartup(id, updates);
      
      // Update local state
      setStartups(prev => prev.map(startup => 
        startup.id === updatedStartup.id ? updatedStartup : startup
      ));
      
      return updatedStartup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update startup';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteStartup = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await startupsApi.deleteStartup(id);
      
      // Remove from local state
      setStartups(prev => prev.filter(startup => startup.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete startup';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateStartupPhase = useCallback(async (userId: string, phase: 'idea' | 'mvp' | 'seed' | 'series-a' | 'growth' | 'scale'): Promise<Startup> => {
    try {
      setError(null);
      const updatedStartup = await startupsApi.updateStartupPhase(userId, phase);
      
      // Update local state
      setStartups(prev => prev.map(startup => 
        startup.id === updatedStartup.id ? updatedStartup : startup
      ));
      
      return updatedStartup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update startup phase';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshStartups = useCallback(async (): Promise<void> => {
    await fetchStartups();
  }, [fetchStartups]);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  return {
    startups,
    loading,
    error,
    refreshStartups,
    updateStartup,
    updateStartupPhase,
    deleteStartup,
  };
};

