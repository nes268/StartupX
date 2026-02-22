import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dots-pattern flex flex-col pt-4">
      <Header />

      {/* Page Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
