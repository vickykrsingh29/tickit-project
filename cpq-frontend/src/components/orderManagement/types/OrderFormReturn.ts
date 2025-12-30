import { CustomerOption } from "./OrderOptionTypes";
import { POCOption } from "./OrderOptionTypes";
import { OrderItem, OrderTotals } from "./OrderItems";
import { LicenseType } from "../../../types/LicenseType";
import OrderFormState from "./OrderFormState";
import { RefObject } from "react";
import { GetTokenSilently } from "../hooks/apiUtils";

export default interface OrderFormReturn extends OrderFormState {
    setOrderNumber: (value: string) => void;
    setOrderName: (value: string) => void;
    setExecutiveName: (value: string) => void;
    setOrderCreationDate: (value: string) => void;
    setOrderDate: (value: string) => void;
    setOrderStatus: (value: string) => void;
    
    handleCustomerChange: (customer: CustomerOption, skipPOCClear?: boolean) => void;
    setCustomerGST: (value: string) => void;
    setCustomerEmail: (value: string) => void;
    setCustomerPhone: (value: string) => void;
    handleCustomerAdded: (customer: CustomerOption) => void;
    
    setBillingAddress: (value: string) => void;
    setShippingAddress: (value: string) => void;
    setWpcAddress: (value: string) => void;
    
    handlePocChange: (poc: POCOption | null) => void;
    setPocEmail: (value: string) => void;
    setPocPhone: (value: string) => void;
    setPocDesignation: (value: string) => void;
    setPocDepartment: (value: string) => void;
    handlePocAdded: (poc: POCOption) => void;
    
    setPaymentTerm: (value: string) => void;
    setDeliveryInstruction: (value: string) => void;
    setModeOfDispatch: (value: string) => void;
    setWarranty: (value: string) => void;
    setOrderRemarks: (value: string) => void;
    
    setRequiresLicense: (value: boolean) => void;
    setLicenseType: (value: LicenseType) => void;
    setLicenseNumber: (value: string) => void;
    setLicenseIssueDate: (value: string) => void;
    setLicenseExpiryDate: (value: string) => void;
    setLicenseQuantity: (value: string) => void;
    setLiaisoningRemarks: (value: string) => void;
    setLiaisoningVerified: (value: boolean) => void;
    
    setLiquidatedDamagesInclusive: (value: boolean) => void;
    setLiquidatedDamagesAmount: (value: number) => void;
    setFreightChargeInclusive: (value: boolean) => void;
    setFreightChargeAmount: (value: number) => void;
    setTransitInsuranceInclusive: (value: boolean) => void;
    setTransitInsuranceAmount: (value: number) => void;
    setInstallationInclusive: (value: boolean) => void;
    setInstallationAmount: (value: number) => void;
    setSecurityDepositInclusive: (value: boolean) => void;
    setSecurityDepositAmount: (value: number) => void;
    setLiaisoningInclusive: (value: boolean) => void;
    setLiaisoningAmount: (value: number) => void;
    
    setDocuments: (value: File[]) => void;
    setPerformanceBankGuarantee: (value: File | null) => void;
    
    handleOrderItemsChange: (items: OrderItem[], totals: OrderTotals) => void;
    
    setActiveTab: (value: string) => void;
    handleNextTab: () => void;
    handlePreviousTab: () => void;
    isLastTab: () => boolean;
    isFirstTab: () => boolean;
    
    handleSubmit: () => Promise<any>;
    
    orderFormTableRef: RefObject<any>;
    
    selectStyles: Record<string, any>;
    
    loadCustomers: (getAccessTokenSilently: GetTokenSilently) => Promise<void>;
    loadPoc: (customerId: string | number, getAccessTokenSilently: GetTokenSilently) => Promise<void>;
    generateNewOrderNumber: (customerId: string, getAccessTokenSilently: GetTokenSilently, customerData?: CustomerOption) => Promise<string | null>;
} 