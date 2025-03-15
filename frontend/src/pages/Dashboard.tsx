// src/pages/Dashboard.tsx

import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full text-white">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
          Welcome to Your Dashboard
        </h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-lg">
              <span className="font-semibold text-indigo-400">Username:</span> {user.username}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-indigo-400">Email:</span> {user.email}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-indigo-400">Role:</span> {user.role}
            </p>
            <p className="text-sm text-gray-400">
              Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
            </p>
            <button
              onClick={logout}
              className="w-full px-4 py-2 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400">Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;