import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { IoEyeSharp } from 'react-icons/io5';

interface FilePreviewListProps {
  files: File | File[] | undefined | null;
  onDelete: (index?: number) => void;
  className?: string;
}

const FilePreviewList: React.FC<FilePreviewListProps> = ({ files, onDelete, className = '' }) => {
  if (!files) return null;
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  if (fileArray.length === 0) return null;

  return (
    <div className={`mt-4 space-y-2 ${className}`}>
      {fileArray.map((file, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 bg-gray-50 rounded"
        >
          <span className="text-sm text-gray-600">{file.name}</span>
          <div className="flex items-center space-x-2">
            <a
              href={URL.createObjectURL(file)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <IoEyeSharp size={14} />
            </a>
            <button
              type="button"
              onClick={() => onDelete(Array.isArray(files) ? idx : undefined)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilePreviewList;