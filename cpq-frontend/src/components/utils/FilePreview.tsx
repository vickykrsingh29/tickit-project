import React, { useEffect } from 'react';

interface FilePreviewProps {
  file: {
    url: string;
    name: string;
    type: string;
  } | null;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  // Add event listener for ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (file) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [file, onClose]);

  if (!file) return null;

  // Function to render file preview based on file type
  const renderFilePreview = () => {
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Image files
    if (file.type.startsWith('image/') || /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(fileExtension)) {
      return (
        <img 
          src={file.url} 
          alt={file.name} 
          className="max-w-full max-h-[70vh] mx-auto object-contain"
        />
      );
    }
    
    // PDF files
    if (file.type === 'application/pdf' || fileExtension === 'pdf') {
      return (
        <iframe 
          src={file.url} 
          className="w-full h-full min-h-[70vh]" 
          title={file.name}
        ></iframe>
      );
    }
    
    // Text files
    if (file.type.startsWith('text/') || 
        /\.(txt|md|json|xml|html|css|js|ts|jsx|tsx|csv)$/i.test(fileExtension)) {
      return (
        <iframe 
          src={file.url} 
          className="w-full h-full min-h-[70vh] bg-white" 
          title={file.name}
        ></iframe>
      );
    }
    
    // Video files
    if (file.type.startsWith('video/') || 
        /\.(mp4|webm|ogg|mov|avi)$/i.test(fileExtension)) {
      return (
        <video 
          src={file.url} 
          controls 
          className="max-w-full max-h-[70vh] mx-auto" 
          autoPlay={false}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    
    // Audio files
    if (file.type.startsWith('audio/') || 
        /\.(mp3|wav|ogg|aac)$/i.test(fileExtension)) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="mt-2 text-lg font-medium text-gray-700">{file.name}</p>
          </div>
          <audio 
            src={file.url} 
            controls 
            className="w-full max-w-md" 
            autoPlay={false}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    
    // Microsoft Office documents and other common document types
    if (/\.(docx?|xlsx?|pptx?|rtf)$/i.test(fileExtension)) {
      // Use Google Docs Viewer for Office documents
      const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
      return (
        <iframe 
          src={googleDocsViewerUrl}
          className="w-full h-full min-h-[70vh]" 
          title={file.name}
        ></iframe>
      );
    }
    
    // For other file types, provide download option
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 rounded-lg p-6 mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{file.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              File type: {file.type || fileExtension.toUpperCase() || 'Unknown'}
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            This file type cannot be previewed directly in the browser.
          </p>
          <a 
            href={file.url} 
            download={file.name} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download File
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 truncate max-w-[calc(100%-3rem)]">{file.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 p-4 overflow-hidden bg-gray-50">
          {renderFilePreview()}
        </div>
        <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded-b-lg flex justify-between items-center">
          <a 
            href={file.url} 
            download={file.name} 
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-1.5 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview; 