import React from 'react';
import { LicenseData } from '../types';

interface LocationInfoProps {
  license: LicenseData;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ license }) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800">WPC Address Details</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Street Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcStreetAddress}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address Line 2</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcAddressLine2}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcCity}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">District</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcDistrict || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">State</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcState}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcCountry}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">PIN Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.wpcPin}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default LocationInfo;