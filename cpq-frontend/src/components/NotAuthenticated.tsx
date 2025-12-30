import React from 'react';
import { useHistory } from 'react-router-dom';

const NotAuthenticated: React.FC = () => {
  const history = useHistory();

  const handleRedirect = () => {
    history.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">You're not logged in</h2>
      <p className="mb-6">Please log in to continue.</p>
      <button
        onClick={handleRedirect}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Login
      </button>
    </div>
  );
};

export default NotAuthenticated;