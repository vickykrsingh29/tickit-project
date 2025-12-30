import React from 'react'
import { LiaisoningTabProps } from '../types';

const LiaisoningTab = (props: LiaisoningTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          License Requirements
        </h3>
        <p className="text-gray-600 text-sm">
          Specify license requirements and verification for this order.
        </p>
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <input
          id="requiresLicenseCheckbox"
          type="checkbox"
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={props.requiresLicense}
          onChange={(e) => props.setRequiresLicense(e.target.checked)}
        />
        <label htmlFor="requiresLicenseCheckbox" className="text-gray-700 font-medium">
          This order requires license/permit
        </label>
      </div>

      {props.requiresLicense && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-1">
                License Type
              </label>
              <select
                id="licenseType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={props.licenseType}
                onChange={(e) => props.setLicenseType(e.target.value as "" | "no-license" | "has-license-no-issues" | "has-license-needs-additional")}
              >
                <option value="">Select License Type</option>
                <option value="no-license">No License Required</option>
                <option value="has-license-no-issues">Has License - No Issues</option>
                <option value="has-license-needs-additional">Has License - Needs Additional Documentation</option>
              </select>
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                id="licenseNumber"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={props.licenseNumber}
                onChange={(e) => props.setLicenseNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="licenseIssueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                id="licenseIssueDate"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={props.licenseIssueDate ? props.licenseIssueDate.split('T')[0] : ''}
                onChange={(e) => props.setLicenseIssueDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                id="licenseExpiryDate"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={props.licenseExpiryDate ? props.licenseExpiryDate.split('T')[0] : ''}
                onChange={(e) => props.setLicenseExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="licenseQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              License Quantity
            </label>
            <input
              type="text"
              id="licenseQuantity"
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={props.licenseQuantity}
              onChange={(e) => props.setLicenseQuantity(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="wpcAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Work/Project/Consignee Address
            </label>
            <textarea
              id="wpcAddress"
              rows={3}
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={props.wpcAddress}
              onChange={(e) => props.setWpcAddress(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="liaisoningRemarks" className="block text-sm font-medium text-gray-700 mb-1">
              Liaisoning Remarks
            </label>
            <textarea
              id="liaisoningRemarks"
              rows={3}
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={props.liaisoningRemarks}
              onChange={(e) => props.setLiaisoningRemarks(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              id="liaisoningVerifiedCheckbox"
              type="checkbox"
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={props.liaisoningVerified}
              onChange={(e) => props.setLiaisoningVerified(e.target.checked)}
            />
            <label htmlFor="liaisoningVerifiedCheckbox" className="text-gray-700 font-medium">
              License/Permit verified
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiaisoningTab 