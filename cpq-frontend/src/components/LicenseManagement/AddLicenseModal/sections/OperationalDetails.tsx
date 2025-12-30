import React from "react";
import CreatableSelect from "react-select/creatable";
import { SelectSectionProps } from "../types";

const OperationalDetails: React.FC<SelectSectionProps> = ({
  formData,
  options,
  onChange,
  onSelectChange,
  onCreateOption,
}) => {
  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold mb-4">Operational Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label
            htmlFor="geographicalCoverage"
            className="block text-sm font-medium text-gray-700"
          >
            Geographical Coverage
          </label>
          <CreatableSelect
            id="geographicalCoverage"
            name="geographicalCoverage"
            options={options.geographicalCoverages}
            value={
              formData.geographicalCoverage
                ? {
                    value: formData.geographicalCoverage,
                    label: formData.geographicalCoverage,
                  }
                : null
            }
            onChange={(selected) => {
              // Handle both selection and creation in one place
              onSelectChange(selected, "geographicalCoverage");
              
              // If this is a new option (not found in existing options), add it
              if (selected && !options.geographicalCoverages.some(opt => opt.value === selected.value)) {
                onCreateOption(selected.value, "geographicalCoverages", "geographicalCoverage");
              }
            }}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            className="mt-1"
            isClearable
            placeholder="Select or enter coverage area"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">End-Use Purpose</label>
          <CreatableSelect
            options={options.endUsePurposes}
            value={
              formData.endUsePurpose
                ? {
                    value: formData.endUsePurpose,
                    label: formData.endUsePurpose,
                  }
                : null
            }
            onChange={(selected) => {
              // Handle both selection and creation in one place
              onSelectChange(selected, "endUsePurpose");
              
              // If this is a new option (not found in existing options), add it
              if (selected && !options.endUsePurposes.some(opt => opt.value === selected?.value)) {
                onCreateOption(selected.value, "endUsePurposes", "endUsePurpose");
              }
            }}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            placeholder="Select or enter purpose"
            isClearable
          />
        </div>
      </div>
    </div>
  );
};

export default OperationalDetails;