import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Spinner from '../components/utils/Spinner';

import { 
  BasicInfo, 
  CustomerInfo, 
  ContactInfo, 
  LocationInfo, 
  OperationalInfo,
  DevicesInfo,
  DocumentsInfo,
  LicenseData 
} from '../components/LicenseManagement/LicenseDetails';

const LicenseDetails: React.FC = () => {
  const { licenseId } = useParams<{ licenseId: string }>();
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchLicenseDetails = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/licenses/${licenseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch license details");
        }

        const data = await response.json();
        setLicense(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (licenseId) {
      fetchLicenseDetails();
    }
  }, [licenseId, getAccessTokenSilently]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">No license data found.</span>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'customer', label: 'Customer Details' },
    { id: 'contact', label: 'Contact Person' },
    { id: 'location', label: 'Location' },
    { id: 'operational', label: 'Operational Details' },
    { id: 'devices', label: 'Devices' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-2xl leading-6 font-medium text-gray-900">
          License Details
        </h3>
        {/* <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            // onClick={() => navigate('/licenses')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Licenses
          </button>
        </div> */}
      </div>

      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'basic' && <BasicInfo license={license} />}
        {activeTab === 'customer' && <CustomerInfo license={license} />}
        {activeTab === 'contact' && <ContactInfo license={license} />}
        {activeTab === 'location' && <LocationInfo license={license} />}
        {activeTab === 'operational' && <OperationalInfo license={license} />}
        {activeTab === 'devices' && <DevicesInfo license={license} />}
        {activeTab === 'documents' && <DocumentsInfo license={license} />}
      </div>
    </div>
  );
};

export default LicenseDetails;