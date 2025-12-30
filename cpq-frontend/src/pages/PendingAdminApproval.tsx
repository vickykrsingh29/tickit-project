import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory } from 'react-router-dom';

const PendingAdminApproval = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const history = useHistory();

  const checkApprovalStatus = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/checkUser`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await response.json();
      if (response.status === 200 && data.exists && data.approvedByAdmin) {
        history.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkApprovalStatus();
  }, [user, getAccessTokenSilently, history]);

  const handleRefresh = async () => {
    await checkApprovalStatus();
    alert("Still awaiting approval. Please try again later.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 shadow-md rounded text-center">
        <p className="mb-4">User has been created, awaiting company admin approval. Please get approval and refresh the page.</p>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default PendingAdminApproval;