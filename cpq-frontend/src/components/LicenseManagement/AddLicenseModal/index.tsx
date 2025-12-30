import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { FormData, Option, DeviceDetail } from "./types";

// Import section components
import BasicLicenseDetails from "./sections/BasicLicenseDetails";
import CompanyDetails from "./sections/CompanyDetails";
import DeviceDetails from "./sections/DeviceDetails";
import OperationalDetails from "./sections/OperationalDetails";
import AttachmentsSection from "./sections/AttachmentsSection";

// Import custom hooks
import { useFetchOptions } from "./hooks/useFetchOptions";
import { useFileUpload } from "./hooks/useFileUpload";
import { useCustomerData } from "./hooks/useCustomerData";

interface AddLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (license: any) => void;
}

const AddLicenseModal: React.FC<AddLicenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { getAccessTokenSilently } = useAuth0();

  // Initialize form state
  const [formData, setFormData] = useState<FormData>({
    // Basic License Details
    licenseNumber: "",
    licenseType: "",
    issuingDate: "",
    expiryDate: "",
    status: "",
    issuingAuthority: "",
    processedBy: "",

    // Company/Applicant Details
    companyId: "",
    companyName: "",
    wpcStreetAddress: "",
    wpcAddressLine2: "",
    wpcPin: "",
    wpcCity: "",
    wpcDistrict: "",
    wpcState: "",
    wpcCountry: "",
    contactPersonName: "",
    contactPersonNumber: "",
    contactPersonEmailId: "",

    // Device-Specific Details
    devices: [
      {
        id: 1,
        productName: "",
        brand: "",
        frequencyRange: "",
        powerOutput: 0,
        quantityApproved: 0,
        countryOfOrigin: "",
        equipmentType: "",
        technologyUsed: "",
      },
    ],

    // Operational Details
    geographicalCoverage: "",
    endUsePurpose: "",

    // Attachments & Compliance
    licenseDocument: null,
    etaCertificate: null,
    importLicense: null,
    otherDocuments: [],
  });

  // Custom hooks
  const { options, customerOptions, pocOptions, fetchPocByCustomerId } =
    useFetchOptions(isOpen, setFormData);
  const { 
    filePreviewUrls, 
    handleFileChange, 
    handleMultipleFileChange,
    handleDeleteFile,
    handleDeleteMultipleFile
  } = useFileUpload(setFormData);
  const { fetchCustomerDetails } = useCustomerData(setFormData);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Form field change handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeviceChange = (
    id: number,
    field: keyof DeviceDetail,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      devices: prev.devices.map((device) =>
        device.id === id ? { ...device, [field]: value } : device
      ),
    }));
  };

  const handleSelectChange = (
    selectedOption: Option | null,
    fieldName: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedOption?.value || "",
    }));
  };

  const handleCreateOption = (
    inputValue: string,
    field: string,
    formField: string
  ) => {
    const newOption = { value: inputValue, label: inputValue };
    // @ts-ignore - We know this is a valid option field
    setOptions((prev) => ({
      ...prev,
      [field]: [...prev[field], newOption],
    }));
    setFormData((prev) => ({ ...prev, [formField]: inputValue }));
  };

  // Device handlers
  const addDeviceDetail = () => {
    setFormData((prev) => ({
      ...prev,
      devices: [
        ...prev.devices,
        {
          id: prev.devices.length + 1,
          productName: "",
          brand: "",
          frequencyRange: "",
          powerOutput: 0,
          quantityApproved: 0,
          countryOfOrigin: "",
          equipmentType: "",
          technologyUsed: "",
        },
      ],
    }));
  };

  const removeDeviceDetail = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      devices: prev.devices.filter((device) => device.id !== id),
    }));
  };

  // Customer selection handler
  const handleCustomerSelect = (selected: Option | null) => {
    if (selected && selected.value) {
      fetchCustomerDetails(selected.value);
    } else {
      // Clear customer-related fields if no customer is selected
      setFormData((prev) => ({
        ...prev,
        companyId: "",
        companyName: "",
        wpcStreetAddress: "",
        wpcAddressLine2: "",
        wpcPin: "",
        wpcCity: "",
        wpcDistrict: "",
        wpcState: "",
        wpcCountry: "",
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const formDataToSend = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "devices") {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === "otherDocuments") {
          // Change this part - use the same field name for all files
          (value as File[]).forEach((file) => {
            formDataToSend.append("otherDocuments", file);
          });
        } else if (value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      // Add better error handling
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/licenses`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add license");
      }

      const result = await response.json();
      onSubmit(result);
      onClose();
    } catch (error) {
      console.error("Error adding license:", error);
      alert(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="absolute inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
        <div
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </div>
        <h2 className="text-xl font-bold mb-6">Add License</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicLicenseDetails
            formData={formData}
            options={options}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            onCreateOption={handleCreateOption}
          />

          <CompanyDetails
            formData={formData}
            onChange={handleChange}
            customerOptions={customerOptions}
            onCustomerSelect={handleCustomerSelect}
            pocOptions={pocOptions}
            fetchPocByCustomerId={fetchPocByCustomerId}
            setFormData={setFormData}
          />

          <DeviceDetails
            devices={formData.devices}
            options={options}
            onDeviceChange={handleDeviceChange}
            onAddDevice={addDeviceDetail}
            onRemoveDevice={removeDeviceDetail}
          />

          <OperationalDetails
            formData={formData}
            options={options}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            onCreateOption={handleCreateOption}
          />

          <AttachmentsSection
            formData={formData}
            filePreviewUrls={filePreviewUrls}
            onFileChange={handleFileChange}
            onMultipleFileChange={handleMultipleFileChange}
            onDeleteFile={handleDeleteFile}
            onDeleteMultipleFile={handleDeleteMultipleFile}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save License
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLicenseModal;