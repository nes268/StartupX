import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left side - Welcome message */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          Welcome, {user?.role === 'admin' ? 'Admin' : user?.fullName || user?.username}
        </h1>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-4">
        {/* Profile icon */}
        <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;