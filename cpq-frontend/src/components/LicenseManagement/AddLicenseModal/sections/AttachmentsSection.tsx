import React, { useRef } from 'react';
import { FormData, FilePreviewUrls } from '../types';
import FilePreviewList from '../../../utils/FilePreviewList';

interface AttachmentsSectionProps {
  formData: FormData;
  filePreviewUrls: FilePreviewUrls;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onMultipleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onDeleteFile: (field: string) => void;
  onDeleteMultipleFile: (field: string, index: number) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  formData,
  filePreviewUrls,
  onFileChange,
  onMultipleFileChange,
  onDeleteFile,
  onDeleteMultipleFile,
}) => {
  // Create refs for each file input
  const licenseDocumentRef = useRef<HTMLInputElement>(null);
  const etaCertificateRef = useRef<HTMLInputElement>(null);
  const importLicenseRef = useRef<HTMLInputElement>(null);
  const otherDocumentsRef = useRef<HTMLInputElement>(null);

  // Handle file deletion and reset the file input
  const handleDeleteFile = (field: string) => {
    onDeleteFile(field);
    
    // Reset the corresponding file input
    switch(field) {
      case "licenseDocument":
        if (licenseDocumentRef.current) licenseDocumentRef.current.value = "";
        break;
      case "etaCertificate":
        if (etaCertificateRef.current) etaCertificateRef.current.value = "";
        break;
      case "importLicense":
        if (importLicenseRef.current) importLicenseRef.current.value = "";
        break;
    }
  };

  // Handle multiple file deletion with index
  const handleDeleteMultipleFile = (field: string, index: number) => {
    onDeleteMultipleFile(field, index);
    
    // If all files are deleted, reset the input
    if (field === "otherDocuments" && formData.otherDocuments?.length === 1) {
      if (otherDocumentsRef.current) otherDocumentsRef.current.value = "";
    }
  };

  // Handle clearing all files in otherDocuments
  const handleClearAllFiles = () => {
    // Loop through all files and remove them
    if (formData.otherDocuments && formData.otherDocuments.length > 0) {
      formData.otherDocuments.forEach((_, index) => {
        // Always remove index 0 since the array will shift after each deletion
        onDeleteMultipleFile("otherDocuments", 0);
      });
      
      // Reset the input field
      if (otherDocumentsRef.current) otherDocumentsRef.current.value = "";
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Attachments & Compliance</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">
            License Document (PDF)
          </label>
          <input
            ref={licenseDocumentRef}
            type="file"
            accept=".pdf"
            onChange={(e) => onFileChange(e, "licenseDocument")}
            className="w-full p-2 border rounded"
          />
          <FilePreviewList 
            files={formData.licenseDocument} 
            onDelete={() => handleDeleteFile("licenseDocument")} 
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Equipment Type Approval (ETA) Certificate
          </label>
          <input
            ref={etaCertificateRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => onFileChange(e, "etaCertificate")}
            className="w-full p-2 border rounded"
          />
          <FilePreviewList 
            files={formData.etaCertificate} 
            onDelete={() => handleDeleteFile("etaCertificate")} 
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Import License (if applicable)
          </label>
          <input
            ref={importLicenseRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => onFileChange(e, "importLicense")}
            className="w-full p-2 border rounded"
          />
          <FilePreviewList 
            files={formData.importLicense} 
            onDelete={() => handleDeleteFile("importLicense")} 
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Other Documents
          </label>
          <div className="flex items-center space-x-2">
            <input
              ref={otherDocumentsRef}
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => onMultipleFileChange(e, "otherDocuments")}
              className="w-full p-2 border rounded"
            />
            {formData.otherDocuments && formData.otherDocuments.length > 0 && (
              <button 
                type="button"
                onClick={handleClearAllFiles}
                className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded text-sm"
              >
                Clear All
              </button>
            )}
          </div>
          {formData.otherDocuments && formData.otherDocuments.length > 0 && (
            <div className="mt-1 text-sm text-gray-500">
              {formData.otherDocuments.length} file(s) selected
            </div>
          )}
          <FilePreviewList 
            files={formData.otherDocuments} 
            onDelete={(index) => index !== undefined && handleDeleteMultipleFile("otherDocuments", index)} 
          />
        </div>
      </div>
    </div>
  );
};

export default AttachmentsSection;