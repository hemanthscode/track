// src/pages/Unauthorized.tsx

import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full text-white text-center">
        <h1 className="text-3xl font-bold mb-6 text-red-500">Access Denied</h1>
        <p className="text-gray-300 mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;