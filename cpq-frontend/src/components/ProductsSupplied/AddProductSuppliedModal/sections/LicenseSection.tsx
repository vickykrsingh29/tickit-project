import React from "react";
import Select from "react-select";
import { ProductSupplied, License, LoadingState } from "../types";

interface LicenseSectionProps {
  formData: ProductSupplied;
  setFormData: React.Dispatch<React.SetStateAction<ProductSupplied>>;
  licenses: License[];
  loading: LoadingState;
}

const LicenseSection: React.FC<LicenseSectionProps> = ({
  formData,
  setFormData,
  licenses,
  loading
}) => {
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Format WPC address
  const formatAddress = (license: License | undefined) => {
    if (!license) return "-";
    
    const addressParts = [
      license.wpcStreetAddress,
      license.wpcAddressLine2,
      license.wpcPin && `PIN: ${license.wpcPin}`,
      license.wpcCity,
      license.wpcDistrict,
      license.wpcState,
      license.wpcCountry
    ].filter(Boolean);
    
    return addressParts.join(", ");
  };

  // Find the selected license
  const selectedLicense = licenses.find(license => license.id === formData.licenseId);

  // Handle license selection
  const handleLicenseChange = (selectedOption: any) => {
    if (selectedOption) {
      const license = licenses.find(lic => lic.id === selectedOption.value);
      setFormData({
        ...formData,
        licenseId: selectedOption.value,
        licenseNumber: selectedOption.label
      });
    } else {
      setFormData({
        ...formData,
        licenseId: undefined,
        licenseNumber: undefined
      });
    }
  };

  return (
    <>
      {/* License Selection */}
      <div>
        <label className="block text-gray-700">License Number</label>
        <Select
          options={licenses.map(license => ({ 
            value: license.id, 
            label: license.licenseNumber 
          }))}
          onChange={handleLicenseChange}
          placeholder="Select License"
          isLoading={loading.licenses}
          value={formData.licenseId ? { 
            value: formData.licenseId, 
            label: formData.licenseNumber || "" 
          } : null}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* License Details - Only show when license is selected */}
      {selectedLicense && (
        <div className="col-span-2 grid grid-cols-2 gap-4 border p-3 rounded bg-gray-50 mt-2">
          <div>
            <label className="block text-sm text-gray-600">License Type</label>
            <p className="font-medium">{selectedLicense.licenseType || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Status</label>
            <p className="font-medium">{selectedLicense.status || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Issue Date</label>
            <p className="font-medium">{formatDate(selectedLicense.issuingDate)}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Expiry Date</label>
            <p className="font-medium">{formatDate(selectedLicense.expiryDate)}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Issuing Authority</label>
            <p className="font-medium">{selectedLicense.issuingAuthority || "-"}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600">WPC Address</label>
            <p className="font-medium">{formatAddress(selectedLicense)}</p>
          </div>
        </div>
      )}

      {/* Other license-related fields can go here */}
    </>
  );
};

export default LicenseSection;