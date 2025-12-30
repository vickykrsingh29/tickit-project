import React from 'react';
import { LicenseData } from '../types';

interface CustomerInfoProps {
  license: LicenseData;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ license }) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800">Customer Information</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ancillary Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.ancillaryName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type of Customer</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.typeOfCustomer}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Industry</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.industry}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">GST Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.customer.gstNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Website</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={license.customer.website.startsWith('http') ? license.customer.website : `https://${license.customer.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline">
                {license.customer.website}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default CustomerInfo;