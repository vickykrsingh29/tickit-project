import React from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { SelectSectionProps, Option } from "../types";

const BasicLicenseDetails: React.FC<SelectSectionProps> = ({
  formData,
  options,
  onChange,
  onSelectChange,
  onCreateOption,
}) => {
  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold mb-4">Basic License Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">License Number*</label>
          <input
            type="text"
            name="licenseNumber"
            required
            className="w-full p-2 border rounded"
            value={formData.licenseNumber}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Type of License*</label>
          <CreatableSelect
            options={options.licenseTypes}
            value={
              formData.licenseType
                ? { value: formData.licenseType, label: formData.licenseType }
                : null
            }
            onChange={(selected) => {
              // Handle both selection and creation in one place
              onSelectChange(selected, "licenseType");
              
              // If this is a new option (not found in existing options), add it
              if (selected && !options.licenseTypes.some(opt => opt.value === selected.value)) {
                onCreateOption(selected.value, "licenseTypes", "licenseType");
              }
            }}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            placeholder="Select or enter license type"
            isClearable
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Issue Date*</label>
          <input
            type="date"
            name="issuingDate"
            required
            className="w-full p-2 border rounded"
            value={formData.issuingDate}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Expiry Date*</label>
          <input
            type="date"
            name="expiryDate"
            required
            className="w-full p-2 border rounded"
            value={formData.expiryDate}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Status*</label>
          <CreatableSelect
            options={options.statuses}
            value={
              formData.status
                ? { value: formData.status, label: formData.status }
                : null
            }
            onChange={(selected) => {
              // Handle both selection and creation in one place
              onSelectChange(selected, "status");
              
              // If this is a new option (not found in existing options), add it
              if (selected && !options.statuses.some(opt => opt.value === selected.value)) {
                onCreateOption(selected.value, "statuses", "status");
              }
            }}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            placeholder="Select or enter status"
            isClearable
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Issuing Authority*</label>
          <CreatableSelect
            options={options.issuingAuthorities}
            value={
              formData.issuingAuthority
                ? {
                    value: formData.issuingAuthority,
                    label: formData.issuingAuthority,
                  }
                : null
            }
            onChange={(selected) => {
              // Handle both selection and creation in one place
              onSelectChange(selected, "issuingAuthority");
              
              // If this is a new option (not found in existing options), add it
              if (selected && !options.issuingAuthorities.some(opt => opt.value === selected?.value)) {
                onCreateOption(selected.value, "issuingAuthorities", "issuingAuthority");
              }
            }}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            placeholder="Select or enter authority"
            isClearable
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Processed By*</label>
          <Select
            options={options.employees}
            value={
              formData.processedBy
                ? options.employees.find(
                    (emp) => emp.value === formData.processedBy
                  ) || { value: formData.processedBy, label: "Unknown User" }
                : null
            }
            onChange={(selected) => onSelectChange(selected, "processedBy")}
            placeholder="Select processor"
            className="basic-select"
            classNamePrefix="select"
            isClearable
          />
        </div>
      </div>
    </div>
  );
};

export default BasicLicenseDetails;