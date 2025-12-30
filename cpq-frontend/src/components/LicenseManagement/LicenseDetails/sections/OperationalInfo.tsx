import React from 'react';
import { LicenseData } from '../types';

interface OperationalInfoProps {
  license: LicenseData;
}

const OperationalInfo: React.FC<OperationalInfoProps> = ({ license }) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800">Operational Information</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Geographical Coverage</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.geographicalCoverage}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">End Use Purpose</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.endUsePurpose}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name (Processed by)</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.companyName}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default OperationalInfo;