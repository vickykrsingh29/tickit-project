import React from 'react';
import { LicenseData } from '../types';

interface DevicesInfoProps {
  license: LicenseData;
}

const DevicesInfo: React.FC<DevicesInfoProps> = ({ license }) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Licensed Devices</h2>
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {license.devices.length} {license.devices.length === 1 ? 'Device' : 'Devices'}
        </span>
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency Range</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Power Output</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technology</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {license.devices.map((device) => (
                <tr key={device.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.frequencyRange}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.powerOutput} W</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.quantityApproved}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.countryOfOrigin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.equipmentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.technologyUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DevicesInfo;