import React from 'react';
import { LicenseData } from '../types';

interface ContactInfoProps {
  license: LicenseData;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ license }) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800">Contact Person Information</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Person Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.contactPersonName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Person Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.contactPersonNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Person Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={`mailto:${license.contactPersonEmailId}`} className="text-blue-600 hover:underline">
                {license.contactPersonEmailId}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact Person ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{license.contactPersonId}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ContactInfo;