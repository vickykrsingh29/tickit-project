/**
 * Option type for react-select components
 */
export interface Option {
    value: string;
    label: string;
  }
  
/**
 * Brand with products API response structure
 */
// Add this interface
export interface BrandWithProducts {
    brand: string;
    products: {
      productName: string;
      pricePerPiece: number;
      gst: number;
    }[];
  }
    
  /**
   * Product information structure
   */
  export interface Product {
    id: string;
    productName: string;
    brand: string;
    sku: string;
    pricePerPiece: number;
    gst: number;
  }
  

  /**
   * Point of Contact information
   */
  export interface POC {
    id: number;
    name: string;
    designation?: string;
    department?: string;
    email?: string;
    phone?: string;
  }
  /**
   * Customer information structure
   */
  export interface Customer {
    id: string;
    name: string;
    pocs: POC[];
  }
  
  /**
   * License details for WPC licensing
   */
  export interface License {
    id: number;
    licenseNumber: string;
    licenseType: string;
    issuingDate: string;
    expiryDate: string;
    status: string;
    issuingAuthority: string;
    companyName: string;
    wpcStreetAddress: string;
    wpcAddressLine2: string;
    wpcPin: string;
    wpcCity: string;
    wpcDistrict: string;
    wpcState: string;
    wpcCountry: string;
    // Add other fields as needed
  }
  /**
   * Product supplied data structure
   */
  export interface ProductSupplied {
    productId: string;
    productName: string;
    brand: string;
    sku: string;
    customerId: string;
    customerName: string;
    pocId: number | null;
    pocName: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    totalAmount: number;
    supplyDate: Date | null;
    orderInvoiceId: string;
    status: string;
    executiveName: string;
    executiveId: string; 
    warrantyUpto: Date | null;
    serialNumbers: string[];
    wpcLicenseRequired: boolean;
    licenseDetails: License | null;
    licenseId?: number;
    licenseNumber?: string;
    pocDesignation: string;
    pocDepartment: string;
    pocEmail: string;
    pocPhone: string;
  }
  
  /**
   * Loading states for various operations
   */
  export interface LoadingState {
    products: boolean;
    customers: boolean;
    submitting: boolean;
    users: boolean;
    licenses: boolean; 
  }
  
  /**
   * Props for the AddProductSuppliedModal component
   */
  export interface AddProductSuppliedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (productSupplied: ProductSupplied) => void;
  }