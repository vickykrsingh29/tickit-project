import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AddProductSuppliedModalProps } from "./types";
import { useFetchData } from "./hooks/useFetchData";
import { useFormData } from "./hooks/useFormData";
import ProductSection from "./sections/ProductSection";
import CustomerSection from "./sections/CustomerSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import SerialNumbersSection from "./sections/SerialNumbersSection";
import LicenseSection from "./sections/LicenseSection";

const AddProductSuppliedModal: React.FC<AddProductSuppliedModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth0();

  // Custom hooks
  const {
    products,
    filteredProducts,
    customers,
    pocs,
    brands,
    licenses,
    selectedBrand,
    setSelectedBrand,
    loading,
    setPocs,
    customersWithPocs,
    userOptions,
    currentUser
  } = useFetchData(isOpen);

  const {
    formData,
    setFormData,
    handleBrandChange,
    handleProductChange,
    handleCustomerChange,
    handlePOCChange,
    handleSerialNumberChange,
    addSerialNumberField,
    removeSerialNumberField,
  } = useFormData(
    user,
    products,
    filteredProducts,
    customers,
    pocs,
    selectedBrand,
    setSelectedBrand,
    setPocs,
    customersWithPocs
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loading.submitting = true;

    try {
      // Validate form
      if (
        !formData.brand ||
        !formData.productId ||
        !formData.customerId ||
        !formData.supplyDate
      ) {
        throw new Error("Please fill all required fields");
      }

      // Submit the form data
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert((error as Error).message);
    } finally {
      loading.submitting = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content - Slide-in Panel */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
        {/* Close button */}
        <div
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </div>

        <h2 className="text-xl font-bold mb-6">Add Supplied Product</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 flex-1">
          {/* Product and Brand Section */}
          <ProductSection
            products={products}
            filteredProducts={filteredProducts}
            brands={brands}
            formData={formData}
            loading={loading}
            selectedBrand={selectedBrand}
            handleBrandChange={handleBrandChange}
            handleProductChange={handleProductChange}
          />

          {/* Customer and POC Section */}
          <CustomerSection
            customers={customers}
            pocs={pocs}
            formData={formData}
            loading={loading}
            handleCustomerChange={handleCustomerChange}
            handlePOCChange={handlePOCChange}
          />

          {/* Order Details Section */}
          <OrderDetailsSection
            formData={formData}
            setFormData={setFormData}
            userOptions={userOptions}
            currentUser={currentUser}
          />

          {/* Serial Numbers Section */}
          <SerialNumbersSection
            serialNumbers={formData.serialNumbers}
            handleSerialNumberChange={handleSerialNumberChange}
            addSerialNumberField={addSerialNumberField}
            removeSerialNumberField={removeSerialNumberField}
          />

          {/* WPC License Section */}
          <LicenseSection 
          formData={formData} 
          setFormData={setFormData} 
          licenses={licenses}
          loading={loading}
        />
          {/* Form Actions */}
          <div className="col-span-2 text-right">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading.submitting}
            >
              {loading.submitting ? "Adding..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductSuppliedModal;
