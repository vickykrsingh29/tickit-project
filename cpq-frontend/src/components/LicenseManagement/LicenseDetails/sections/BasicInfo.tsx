import React from 'react';
import { LicenseData } from '../types';

interface BasicInfoProps {
  license: LicenseData;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ license }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800">Basic License Information</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">License Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.licenseNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">License Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.licenseType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                license.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {license.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issuing Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(license.issuingDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(license.expiryDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issuing Authority</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.issuingAuthority}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(license.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(license.updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default BasicInfo;