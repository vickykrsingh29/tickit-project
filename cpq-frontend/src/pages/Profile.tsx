import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaEdit } from 'react-icons/fa';
import Settings from './Settings'; // <--- Added import for Settings

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  companyName: string;
  teamName: string;
  role: string;
  approvalByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    companyName: '',
    teamName: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user?.sub) return;
      
      try {
        setIsLoading(true);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });
        
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user.sub}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        setProfile(data);
        setEditForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          designation: data.designation || '',
          companyName: data.companyName || '',
          teamName: data.teamName || ''
        });
      } catch (error) {
        console.error(error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, authLoading, user, getAccessTokenSilently]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user.sub}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setError('Failed to update profile');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-4 w-4 bg-[#057dcd] rounded-full animate-bounce"></div>
          <div className="text-[#00060a] font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-red-500 bg-[#e8eef1] px-6 py-3 rounded-lg border border-[#057dcd] shadow-sm">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-[#00060a] bg-[#e8eef1] px-6 py-4 rounded-lg shadow-sm border border-[#057dcd]">
          Please log in to view your profile
        </div>
      </div>
    );
  }

  // Updated return to show Profile on the left and Settings on the right
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Profile */}
      <div className="w-1/2 bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-[1000px] mx-8">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 rounded-lg bg-[#c8dce8] flex items-center justify-center text-xl font-bold text-gray-700 shadow-sm">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {profile.designation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-8 py-8">
          <div className="max-w-[600px]">
            {isEditing ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="First Name"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, firstName: e.target.value }))
                      }
                    />
                    <FormInput
                      label="Last Name"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, lastName: e.target.value }))
                      }
                    />
                    <FormInput
                      label="Designation"
                      value={editForm.designation}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, designation: e.target.value }))
                      }
                    />
                  
                    <FormInput
                      label="Team Name"
                      value={editForm.teamName}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, teamName: e.target.value }))
                      }
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-gray-900">User Information</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4 divide-y divide-gray-200">
                    <InfoItem label="Email" value={profile.email} />
                    <InfoItem label="Role" value={profile.role} className="pt-4" />
                    <InfoItem label="Team" value={profile.teamName} className="pt-4" />
                  </div>
                </div>

                {/* Company Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Company Details</h2>
                  <div className="space-y-4">
                    <InfoItem label="Company" value={profile.companyName} />
                    <InfoItem
                      label="Member Since"
                      value={new Date(profile.createdAt || '').toLocaleDateString()}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Settings */}
      <div className="w-1/2 mt-[128px]">
        <Settings />
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value, className = "" }: { 
  label: string; 
  value?: string;
  className?: string;
}) => (
  <div className={className}>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <p className="mt-1 text-gray-900">{value}</p>
  </div>
);

const FormInput = ({ label, value, onChange }: { 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default Profile;