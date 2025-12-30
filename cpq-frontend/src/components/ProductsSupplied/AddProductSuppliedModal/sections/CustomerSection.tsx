import React from "react";
import Select from "react-select";
import { Customer, POC, ProductSupplied, LoadingState, Option } from "../types";

interface CustomerSectionProps {
  customers: Customer[];
  pocs: POC[];
  formData: ProductSupplied;
  loading: LoadingState;
  handleCustomerChange: (selectedOption: Option | null) => void;
  handlePOCChange: (selectedOption: Option | null) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  customers,
  pocs,
  formData,
  loading,
  handleCustomerChange,
  handlePOCChange,
}) => {
  // Determine if a customer is selected
  const isCustomerSelected = Boolean(formData.customerId);
  const isPocSelected = Boolean(formData.pocId);

  return (
    <>
      {/* Customer Selection */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-1">
          Customer <span className="text-red-500">*</span>
        </label>
        <Select
          options={customers.map(c => ({ value: c.id, label: c.name }))}
          onChange={handleCustomerChange}
          placeholder="Select Customer"
          isLoading={loading.customers}
          value={formData.customerId ? { value: formData.customerId, label: formData.customerName } : null}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      
      {/* POC Selection */}
      <div className="col-span-1">
        <label className="block text-gray-700 mb-1">
          Point of Contact
          {isCustomerSelected && pocs.length === 0 && (
            <span className="text-xs text-gray-500 ml-2">(No POCs available)</span>
          )}
        </label>
        <Select
          options={pocs.map(p => ({ value: p.id.toString(), label: p.name }))}
          onChange={handlePOCChange}
          placeholder={isCustomerSelected ? "Select POC" : "Select Customer First"}
          isDisabled={!isCustomerSelected}
          value={formData.pocId ? { value: formData.pocId.toString(), label: formData.pocName } : null}
          className="react-select-container"
          classNamePrefix="react-select"
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: !isCustomerSelected ? '#f9fafb' : 'white'
            })
          }}
        />
      </div>

      {/* POC Details - Only show when POC is selected */}
      {isPocSelected && (
        <div className="col-span-2 grid grid-cols-2 gap-4 border p-3 rounded bg-gray-50 mt-2">
          <div>
            <label className="block text-sm text-gray-600">Designation</label>
            <p className="font-medium">{formData.pocDesignation || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Department</label>
            <p className="font-medium">{formData.pocDepartment || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <p className="font-medium">{formData.pocEmail || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone</label>
            <p className="font-medium">{formData.pocPhone || "-"}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerSection;