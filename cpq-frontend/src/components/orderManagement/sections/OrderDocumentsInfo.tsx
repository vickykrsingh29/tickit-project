import React, { useState } from 'react';
import FilePreview from '../../utils/FilePreview';

const OrderDocumentsInfo = (props: {
    documents: string[];
    performanceBankGuarantee: string;
}) => {
    // State for modal
    const [viewingFile, setViewingFile] = useState<{ url: string; name: string; type: string } | null>(null);

    // Function to extract file name from URL
    const getFileNameFromUrl = (url: string): string => {
        try {
            // Try to extract the file name from the URL
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            const fileName = segments[segments.length - 1];
            
            // Decode URI components to handle special characters
            return decodeURIComponent(fileName) || 'Document';
        } catch (error) {
            // If URL parsing fails, try to get the last segment after the last slash
            const segments = url.split('/');
            const lastSegment = segments[segments.length - 1];
            return lastSegment || 'Document';
        }
    };

    // Function to view a file
    const handleViewFile = (url: string) => {
        const fileName = getFileNameFromUrl(url);
        // Determine file type from extension
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        let fileType = '';
        
        if (/\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(fileName)) {
            fileType = 'image/' + fileExtension;
        } else if (fileExtension === 'pdf') {
            fileType = 'application/pdf';
        } else if (/\.(docx?|xlsx?|pptx?|rtf)$/i.test(fileName)) {
            fileType = 'application/msword';
        } else if (/\.(mp4|webm|mov)$/i.test(fileName)) {
            fileType = 'video/' + fileExtension;
        } else if (/\.(mp3|wav|ogg)$/i.test(fileName)) {
            fileType = 'audio/' + fileExtension;
        } else {
            fileType = 'application/octet-stream';
        }
        
        setViewingFile({ 
            url, 
            name: fileName,
            type: fileType
        });
    };

    // Function to close modal
    const closeModal = () => {
        setViewingFile(null);
    };

    return (
        <div className="space-y-6">
            {/* File Preview Modal */}
            <FilePreview file={viewingFile} onClose={closeModal} />

            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Order Documents</h3>
                
                {props.documents.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No documents attached to this order
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {props.documents.map((doc, index) => (
                            <li key={index} className="py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <svg
                                            className="h-8 w-8 text-blue-500"
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
                                        <span className="ml-3 text-gray-800">{getFileNameFromUrl(doc)}</span>
                                    </div>
                                    <button 
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                        onClick={() => handleViewFile(doc)}
                                    >
                                        View
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {props.performanceBankGuarantee && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Performance Bank Guarantee</h3>
                    <div className="flex items-center justify-between p-3 border border-gray-200 bg-white rounded-md">
                        <div className="flex items-center">
                            <svg
                                className="h-8 w-8 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="ml-3 text-gray-800">
                                {getFileNameFromUrl(props.performanceBankGuarantee)}
                            </span>
                        </div>
                        <button 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            onClick={() => handleViewFile(props.performanceBankGuarantee)}
                        >
                            View
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderDocumentsInfo;