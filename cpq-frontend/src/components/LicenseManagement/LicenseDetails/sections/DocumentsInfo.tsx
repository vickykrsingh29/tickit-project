import React from 'react';
import { LicenseData } from '../types';

interface DocumentsInfoProps {
  license: LicenseData;
}

const DocumentsInfo: React.FC<DocumentsInfoProps> = ({ license }) => {
  const hasDocuments = 
    license.licenseDocumentUrl || 
    license.etaCertificateUrl || 
    license.importLicenseUrl || 
    (license.otherDocumentsUrls && license.otherDocumentsUrls.length > 0);

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800">License Documents</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {!hasDocuments ? (
          <div className="text-center py-4 text-gray-500">
            No documents available for this license.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {license.licenseDocumentUrl && (
              <li className="py-3 flex justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">License Document</span>
                </div>
                <a 
                  href={license.licenseDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              </li>
            )}
            
            {license.etaCertificateUrl && (
              <li className="py-3 flex justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">ETA Certificate</span>
                </div>
                <a 
                  href={license.etaCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              </li>
            )}
            
            {license.importLicenseUrl && (
              <li className="py-3 flex justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Import License</span>
                </div>
                <a 
                  href={license.importLicenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              </li>
            )}
            
            {license.otherDocumentsUrls && license.otherDocumentsUrls.map((url, index) => (
              <li key={index} className="py-3 flex justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Additional Document {index + 1}</span>
                </div>
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentsInfo;