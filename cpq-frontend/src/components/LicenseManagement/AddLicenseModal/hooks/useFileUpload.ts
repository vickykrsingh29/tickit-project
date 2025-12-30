import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { FormData, FilePreviewUrls } from "../types";

export const useFileUpload = (setFormData: Dispatch<SetStateAction<FormData>>) => {
  const [filePreviewUrls, setFilePreviewUrls] = useState<FilePreviewUrls>({});

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(filePreviewUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [filePreviewUrls]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke old URL if it exists
      if (filePreviewUrls[field]) {
        URL.revokeObjectURL(filePreviewUrls[field]);
      }
      
      setFormData((prev) => ({ ...prev, [field]: file }));
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrls((prev) => ({ ...prev, [field]: previewUrl }));
    }
  };

  const handleMultipleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      setFormData((prev) => ({
        ...prev,
        [field]: [
          ...(prev[field as keyof FormData] as File[] || []),
          ...newFiles,
        ],
      }));
    }
  };

  const handleDeleteFile = (field: string) => {
    // For single file fields
    if (filePreviewUrls[field]) {
      URL.revokeObjectURL(filePreviewUrls[field]);
      setFilePreviewUrls((prev) => ({ ...prev, [field]: "" }));
      setFormData((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDeleteMultipleFile = (field: string, index: number) => {
    // For multiple file fields
    setFormData((prev) => {
      const files = prev[field as keyof FormData] as File[];
      if (!files || !Array.isArray(files)) return prev;
      
      const updatedFiles = [...files];
      updatedFiles.splice(index, 1);
      return { ...prev, [field]: updatedFiles };
    });
  };

  return {
    filePreviewUrls,
    handleFileChange,
    handleMultipleFileChange,
    handleDeleteFile,
    handleDeleteMultipleFile
  };
};