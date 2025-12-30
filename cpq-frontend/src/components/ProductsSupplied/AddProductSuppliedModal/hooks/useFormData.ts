import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { User } from "@auth0/auth0-react";
import { ProductSupplied, Option, Product, Customer, POC, License } from "../types";

/**
 * Custom hook to manage form data and related operations
 */
export const useFormData = (
  user: User | undefined,
  products: Product[],
  filteredProducts: Product[],
  customers: Customer[],
  pocs: POC[],
  selectedBrand: string | null,
  setSelectedBrand: Dispatch<SetStateAction<string | null>>,
  setPocs: Dispatch<SetStateAction<POC[]>>,
  customersWithPocs: any[]
) => {
  // Initialize form data with default values
  const [formData, setFormData] = useState<ProductSupplied>({
    productId: "",
    productName: "",
    brand: "",
    sku: "",
    customerId: "",
    customerName: "",
    pocId: null,
    pocName: "",
    pocDesignation: "",
    pocDepartment: "",
    pocEmail: "",
    pocPhone: "",
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    totalAmount: 0,
    supplyDate: new Date(),
    orderInvoiceId: "",
    status: "Pending",
    executiveName: user ? `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.email || "Unknown" : "Unknown",
    executiveId: "",  // Make sure this is initialized
    warrantyUpto: null,
    serialNumbers: [""],
    wpcLicenseRequired: false,
    licenseDetails: null,  // Change this to null initially
    licenseId: undefined,  // Initialize optional fields
    licenseNumber: "",
  });

  // Calculate total amount whenever quantity, unitPrice or tax changes
  useEffect(() => {
    const subtotal = formData.quantity * formData.unitPrice;
    const taxAmount = subtotal * (formData.tax / 100);
    const total = subtotal + taxAmount;
    
    setFormData((prev) => ({
      ...prev,
      totalAmount: parseFloat(total.toFixed(2)),
    }));
  }, [formData.quantity, formData.unitPrice, formData.tax]);

  // Handle brand selection
  const handleBrandChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setSelectedBrand(selectedOption.value);
      
      // Reset product selection when brand changes
      setFormData((prev) => ({
        ...prev,
        brand: selectedOption.value,
        productId: "",
        productName: "",
        unitPrice: 0,
        tax: 0,
      }));
    } else {
      setSelectedBrand(null);
      setFormData((prev) => ({
        ...prev,
        brand: "",
        productId: "",
        productName: "",
        unitPrice: 0,
        tax: 0,
      }));
    }
  };

  // Handle product selection
  const handleProductChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      const product = filteredProducts.find((p) => p.id === selectedOption.value);
      if (product) {
        setFormData((prev) => ({
          ...prev,
          productId: product.id,
          productName: product.productName,
          brand: product.brand,
          sku: product.sku,
          unitPrice: product.pricePerPiece,
          tax: product.gst,
        }));
      }
    }
  };

  // Handle customer selection
  const handleCustomerChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      const customerWithPocs = customersWithPocs.find(
        (c) => c.id.toString() === selectedOption.value
      );
      
      if (customerWithPocs) {
        // Reset POC selection
        setFormData((prev) => ({
          ...prev,
          customerId: customerWithPocs.id.toString(),
          customerName: customerWithPocs.name,
          pocId: null,
          pocName: "",
          pocDesignation: "",
          pocDepartment: "",
          pocEmail: "",
          pocPhone: "",
        }));
        
        // Set POCs for the selected customer
        if (customerWithPocs.pocs && Array.isArray(customerWithPocs.pocs)) {
          setPocs(customerWithPocs.pocs);
        } else {
          setPocs([]);
        }
      }
    } else {
      // Reset customer and POC data
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
        pocId: null,
        pocName: "",
        pocDesignation: "",
        pocDepartment: "",
        pocEmail: "",
        pocPhone: "",
      }));
      setPocs([]);
    }
  };

  // Handle POC selection
  const handlePOCChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      const poc = pocs.find((p) => p.id.toString() === selectedOption.value);
      if (poc) {
        setFormData((prev) => ({
          ...prev,
          pocId: poc.id,
          pocName: poc.name,
          pocDesignation: poc.designation || "",
          pocDepartment: poc.department || "",
          pocEmail: poc.email || "",
          pocPhone: poc.phone || "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        pocId: null,
        pocName: "",
        pocDesignation: "",
        pocDepartment: "",
        pocEmail: "",
        pocPhone: "",
      }));
    }
  };

  // Handle serial number changes
  const handleSerialNumberChange = (index: number, value: string) => {
    const updatedSerialNumbers = [...formData.serialNumbers];
    updatedSerialNumbers[index] = value;
    
    setFormData((prev) => ({
      ...prev,
      serialNumbers: updatedSerialNumbers,
    }));
  };

  // Add more serial number fields
  const addSerialNumberField = () => {
    setFormData((prev) => ({
      ...prev,
      serialNumbers: [...prev.serialNumbers, ""],
    }));
  };

  const handleLicenseChange = (selectedLicense: License | null) => {
    setFormData(prev => ({
      ...prev,
      licenseDetails: selectedLicense,
      licenseId: selectedLicense?.id,
      licenseNumber: selectedLicense?.licenseNumber || "",
    }));
  };
  

  // Remove serial number field
  const removeSerialNumberField = (index: number) => {
    if (formData.serialNumbers.length > 1) {
      const updatedSerialNumbers = [...formData.serialNumbers];
      updatedSerialNumbers.splice(index, 1);
      
      setFormData((prev) => ({
        ...prev,
        serialNumbers: updatedSerialNumbers,
      }));
    }
  };

  return {
    formData,
    setFormData,
    handleBrandChange,
    handleProductChange,
    handleCustomerChange,
    handlePOCChange,
    handleSerialNumberChange,
    addSerialNumberField,
    removeSerialNumberField,
    handleLicenseChange  
  };
};