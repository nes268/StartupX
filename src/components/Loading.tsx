import React from 'react';
import { Building2 } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-dots-pattern flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="h-12 w-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
            <Building2 className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">StartupX</h1>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--accent)] border-t-transparent"></div>
          </div>
          
          <h2 className="text-xl font-semibold text-[var(--text)]">Loading your dashboard...</h2>
          <p className="text-[var(--text-muted)] max-w-md">
            We're setting up your personalized workspace and preparing all your startup tools.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-[var(--bg-muted)] rounded-full h-2">
            <div className="bg-[var(--accent)] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-2">Almost ready...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
