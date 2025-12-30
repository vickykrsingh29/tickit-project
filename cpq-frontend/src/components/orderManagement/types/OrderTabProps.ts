import { CustomerOption } from "./OrderOptionTypes";
import { POCOption } from "./OrderOptionTypes";
import { OrderItem, OrderTotals } from "./OrderItems";
import { LicenseType } from "../../../types/LicenseType";
import { GetTokenSilently } from "../hooks/apiUtils";

export interface OrderBasicInfoTabProps {
    customers: CustomerOption[];
    selectedCustomer: CustomerOption | null;
    handleCustomerChange: (customer: CustomerOption) => void;
    poc: POCOption[];
    selectedPoc: POCOption | null;
    handlePocChange: (poc: POCOption | null) => void;
    onCustomerAdded: (customer: CustomerOption) => void;
    onPocAdded: (poc: POCOption) => void;
    selectStyles: Record<string, any>;
    orderNumber: string;
    setOrderNumber: (orderNumber: string) => void;
    orderName: string;
    setOrderName: (orderName: string) => void;
    executiveName: string;
    setExecutiveName: (executiveName: string) => void;
    orderCreationDate: string;
    setOrderCreationDate: (orderCreationDate: string) => void;
    orderDate: string;
    setOrderDate: (orderDate: string) => void;
    orderStatus: string;
    setOrderStatus: (orderStatus: string) => void;
    customerGST: string;
    setCustomerGST: (customerGST: string) => void;
    customerEmail: string;
    setCustomerEmail: (customerEmail: string) => void;
    customerPhone: string;
    setCustomerPhone: (customerPhone: string) => void;
    billingAddress: string;
    setBillingAddress: (billingAddress: string) => void;
    shippingAddress: string;
    setShippingAddress: (shippingAddress: string) => void;
    wpcAddress: string;
    setWpcAddress: (wpcAddress: string) => void;
    pocEmail: string;
    setPocEmail: (pocEmail: string) => void;
    pocPhone: string;
    setPocPhone: (pocPhone: string) => void;
    pocDesignation: string;
    setPocDesignation: (pocDesignation: string) => void;
    pocDepartment: string;
    setPocDepartment: (pocDepartment: string) => void;
    isGeneratingOrderNumber?: boolean;
    generateOrderNumber: (customerId: string, getAccessTokenSilently: GetTokenSilently, customerData?: CustomerOption) => Promise<string | null>;
}

export interface OrderItemsTabProps {
    OrderFormTable: React.ComponentType<any>;
    orderFormTableRef: React.RefObject<any>;
    initialItems: OrderItem[];
    onItemsChange: (items: OrderItem[], totals: OrderTotals) => void;
}

export interface AdditionalDetailsTabProps {
    paymentTerm: string;
    setPaymentTerm: (paymentTerm: string) => void;
    modeOfDispatch: string;
    setModeOfDispatch: (modeOfDispatch: string) => void;
    deliveryInstruction: string;
    setDeliveryInstruction: (deliveryInstruction: string) => void;
    warranty: string;
    setWarranty: (warranty: string) => void;
    orderRemarks: string;
    setOrderRemarks: (orderRemarks: string) => void;
}

export interface AdditionalCostTabProps {
    liquidatedDamages: boolean;
    setLiquidatedDamages: (liquidatedDamages: boolean) => void;
    liquidatedDamagesAmount: number;
    setLiquidatedDamagesAmount: (liquidatedDamagesAmount: number) => void;
    freightCharge: boolean;
    setFreightCharge: (freightCharge: boolean) => void;
    freightChargeAmount: number;
    setFreightChargeAmount: (freightChargeAmount: number) => void;
    transitInsurance: boolean;
    setTransitInsurance: (transitInsurance: boolean) => void;
    transitInsuranceAmount: number;
    setTransitInsuranceAmount: (transitInsuranceAmount: number) => void;
    installation: boolean;
    setInstallation: (installation: boolean) => void;
    installationAmount: number;
    setInstallationAmount: (installationAmount: number) => void;
    securityDeposit: boolean;
    setSecurityDeposit: (securityDeposit: boolean) => void;
    securityDepositAmount: number;
    setSecurityDepositAmount: (securityDepositAmount: number) => void;
    liaisoning: boolean;
    setLiaisoning: (liaisoning: boolean) => void;
    liaisoningAmount: number;
    setLiaisoningAmount: (liaisoningAmount: number) => void;
}

export interface LiaisoningTabProps {
    requiresLicense: boolean;
    setRequiresLicense: (requiresLicense: boolean) => void;
    licenseType: LicenseType;
    setLicenseType: (licenseType: LicenseType) => void;
    licenseNumber: string;
    setLicenseNumber: (licenseNumber: string) => void;
    wpcAddress: string;
    setWpcAddress: (wpcAddress: string) => void;
    licenseIssueDate: string;
    setLicenseIssueDate: (licenseIssueDate: string) => void;
    licenseExpiryDate: string;
    setLicenseExpiryDate: (licenseExpiryDate: string) => void;
    licenseQuantity: string;
    setLicenseQuantity: (licenseQuantity: string) => void;
    liaisoningRemarks: string;
    setLiaisoningRemarks: (liaisoningRemarks: string) => void;
    liaisoningVerified: boolean;
    setLiaisoningVerified: (liaisoningVerified: boolean) => void;
}

export interface DocumentsTabProps {
    documents: File[];
    setDocuments: React.Dispatch<React.SetStateAction<File[]>>;
    performanceBankGuarantee: File | null;
    setPerformanceBankGuarantee: React.Dispatch<React.SetStateAction<File | null>>;
} 
