import React, { useState } from 'react';
import FilePreview from '../../utils/FilePreview';

interface DocumentsTabProps {
  documents: File[];
  setDocuments: (files: File[]) => void;
  performanceBankGuarantee: File | null;
  setPerformanceBankGuarantee: (file: File | null) => void;
}

const DocumentsTab = (props: DocumentsTabProps) => {
  // State for modal
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string; type: string } | null>(null);

  // Function to view a file
  const handleViewFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setViewingFile({ 
      url: fileUrl, 
      name: file.name,
      type: file.type 
    });
  };

  // Function to close modal
  const closeModal = () => {
    if (viewingFile) {
      URL.revokeObjectURL(viewingFile.url); // Clean up the URL object
      setViewingFile(null);
    }
  };

  // Function to remove a document
  const handleRemoveDocument = (indexToRemove: number) => {
    props.setDocuments(props.documents.filter((_, index) => index !== indexToRemove));
  };

  // Function to remove performance bank guarantee
  const handleRemovePBG = () => {
    props.setPerformanceBankGuarantee(null);
  };

  return (
    <div className="space-y-6">
      {/* File Preview Modal */}
      <FilePreview file={viewingFile} onClose={closeModal} />

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Supporting Documents
        </h3>
        <p className="text-gray-600 text-sm">
          Upload any documents related to this order.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Documents
          </label>
          <div className="flex items-center justify-center">
            <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors w-full">
              <svg
                className="h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">
                {props.documents.length
                  ? `${props.documents.length} files selected`
                  : "Click to upload files"}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </span>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) =>
                  props.setDocuments(Array.from(e.target.files || []))
                }
              />
            </label>
          </div>
          {props.documents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Files:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {Array.from(props.documents).map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </span>
                      <span>{file.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleViewFile(file)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View file"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove file"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Performance Bank Guarantee
          </label>
          <div className="flex items-center justify-center">
            <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors w-full">
              <svg
                className="h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">
                {props.performanceBankGuarantee
                  ? props.performanceBankGuarantee.name
                  : "Click to upload PBG document"}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                PDF, DOC, DOCX up to 10MB
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  props.setPerformanceBankGuarantee(e.target.files?.[0] || null)
                }
              />
            </label>
          </div>
          {props.performanceBankGuarantee && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </span>
                  <span>{props.performanceBankGuarantee.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleViewFile(props.performanceBankGuarantee!)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View file"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePBG}
                    className="text-red-600 hover:text-red-800"
                    title="Remove file"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentsTab