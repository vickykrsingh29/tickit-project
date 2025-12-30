import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FormData, Option, PocOption } from "../types";

interface CompanyDetailsProps {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  customerOptions: Option[];
  onCustomerSelect: (selected: Option | null) => void;
  pocOptions: PocOption[];
  fetchPocByCustomerId: (customerId: string | number) => Promise<any>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  formData,
  onChange,
  customerOptions,
  onCustomerSelect,
  pocOptions,
  fetchPocByCustomerId,
  setFormData,
}) => {
  const [selectedPoc, setSelectedPoc] = useState<Option | null>(null);
  // Handle POC selection
  const handlePocSelect = (selected: Option | null) => {
    if (!selected) {
      setSelectedPoc(null);
      return;
    }

    setSelectedPoc(selected);

    // Find the complete POC data from the options
    const pocData = pocOptions.find((poc) => poc.value === selected.value);

    if (pocData) {
      // Update form with POC details
      setFormData((prevData) => ({
        ...prevData,
        contactPersonId: pocData.id,
        contactPersonName: pocData.name,
        contactPersonNumber: pocData.phone,
        contactPersonEmailId: pocData.email,
        contactPersonDesignation: pocData.designation,
        contactPersonDepartment: pocData.department,
      }));
    }
  };

  // Reset POC selection when company changes
  useEffect(() => {
    setSelectedPoc(null);
  }, [formData.companyId]);

  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold mb-4">
        Company/Applicant (Customer) Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">
            Company/Applicant Name*
          </label>
          <Select
            options={customerOptions}
            value={
              formData.companyId
                ? {
                    value: formData.companyId,
                    label: formData.companyName,
                  }
                : null
            }
            // In the onChange handler for the company Select component
            onChange={(selected) => {
              onCustomerSelect(selected);
              if (selected) {
                fetchPocByCustomerId(selected.value);

                // Clear any existing POC details when company changes
                setFormData((prevData) => ({
                  ...prevData,
                  contactPersonId: undefined,
                  contactPersonName: "",
                  contactPersonNumber: "",
                  contactPersonEmailId: "",
                  contactPersonDesignation: "",
                  contactPersonDepartment: "",
                }));
              }
            }}
            placeholder="Select a customer"
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        {formData.companyId && (
          <div>
            <label className="block text-gray-700 mb-1">Contact Person*</label>
            <Select
              options={pocOptions}
              value={selectedPoc}
              onChange={handlePocSelect}
              placeholder="Select contact person"
              className="basic-select"
              classNamePrefix="select"
              isClearable
            />
          </div>
        )}

        {formData.companyId && (
          <div>
            <label className="block text-gray-700 mb-1">
              Contact Person Number
            </label>
            <input
              type="text"
              name="contactPersonNumber"
              className="w-full p-2 border rounded"
              value={formData.contactPersonNumber || ""}
              onChange={onChange}
            />
          </div>
        )}

        {formData.companyId && (
          <div>
            <label className="block text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              name="contactPersonEmailId"
              className="w-full p-2 border rounded"
              value={formData.contactPersonEmailId || ""}
              onChange={onChange}
            />
          </div>
        )}

        {formData.companyId && (
          <div>
            <label className="block text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              name="contactPersonDesignation"
              className="w-full p-2 border rounded"
              value={formData.contactPersonDesignation || ""}
              onChange={onChange}
            />
          </div>
        )}

        {formData.companyId && (
          <div>
            <label className="block text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="contactPersonDepartment"
              className="w-full p-2 border rounded"
              value={formData.contactPersonDepartment || ""}
              onChange={onChange}
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-lg font-bold text-gray-700 mb-2">
            WPC Address
          </label>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="wpcStreetAddress"
              placeholder="Street Address"
              className="w-full p-2 border rounded"
              value={formData.wpcStreetAddress}
              onChange={onChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              name="wpcAddressLine2"
              placeholder="Address Line 2"
              className="w-full p-2 border rounded"
              value={formData.wpcAddressLine2}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">PIN Code</label>
              <input
                type="text"
                name="wpcPin"
                placeholder="PIN Code"
                className="w-full p-2 border rounded"
                value={formData.wpcPin}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="wpcCity"
                placeholder="City"
                className="w-full p-2 border rounded"
                value={formData.wpcCity}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">District</label>
              <input
                type="text"
                name="wpcDistrict"
                placeholder="District"
                className="w-full p-2 border rounded"
                value={formData.wpcDistrict}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="wpcState"
                placeholder="State"
                className="w-full p-2 border rounded"
                value={formData.wpcState}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="wpcCountry"
                placeholder="Country"
                className="w-full p-2 border rounded"
                value={formData.wpcCountry}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
