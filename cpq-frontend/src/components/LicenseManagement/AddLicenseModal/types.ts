export interface Option {
  value: string ;
  label: string;
}

export interface DeviceDetail {
  id: number;
  productName: string;
  brand: string;
  frequencyRange: string;
  powerOutput: number;
  quantityApproved: number;
  countryOfOrigin: string;
  equipmentType: string;
  technologyUsed: string;
}

export interface ProductData {
  productName: string;
  pricePerPiece: number;
  gst: number;
}

export interface BrandProductsData {
  brand: string;
  products: ProductData[];
}

export interface FormData {
  // Basic License Details
  licenseNumber: string;
  licenseType: string;
  issuingDate: string;
  expiryDate: string;
  status: string;
  issuingAuthority: string;
  processedBy: string;

  // Company/Applicant Details
  companyId: string;
  companyName: string;
  wpcStreetAddress: string;
  wpcAddressLine2: string;
  wpcPin: string;
  wpcCity: string;
  wpcDistrict: string;
  wpcState: string;
  wpcCountry: string;
  contactPersonName: string;
  contactPersonNumber: string;
  contactPersonEmailId: string;
  contactPersonId?: number;
  contactPersonDesignation?: string;
  contactPersonDepartment?: string;

  // Device-Specific Details (multiple)
  devices: DeviceDetail[];

  // Operational Details
  geographicalCoverage: string;
  endUsePurpose: string;

  // Attachments & Compliance
  licenseDocument: File | null;
  etaCertificate: File | null;
  importLicense: File | null;
  otherDocuments: File[];
}

export interface OptionsState {
  licenseTypes: Option[];
  statuses: Option[];
  issuingAuthorities: Option[];
  countriesOfOrigin: Option[];
  equipmentTypes: Option[];
  technologiesUsed: Option[];
  endUsePurposes: Option[];
  geographicalCoverages: Option[]; 
  employees: Option[];
}

export interface PocOption extends Option {
    id: number;
    name: string;
    phone: string;
    email: string;
    designation: string;
    department: string;
  }

export interface FilePreviewUrls {
  [key: string]: string;
}

export interface SectionProps {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export interface SelectSectionProps extends SectionProps {
  options: OptionsState;
  onSelectChange: (selectedOption: Option | null, fieldName: string) => void;
  onCreateOption: (
    inputValue: string,
    field: string,
    formField: string
  ) => void;
}
