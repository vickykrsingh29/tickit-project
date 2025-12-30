import { OrderFormData } from '../types';
import { OrderItem, OrderTotals } from '../types';
import { LicenseType } from '../../../types/LicenseType';

/**
 * Calculates the total for additional costs
 * @param state Current state of additional costs
 * @returns Total amount of additional costs
 */
export const calculateAdditionalCostsTotal = (state: {
  liquidatedDamagesInclusive: boolean;
  liquidatedDamagesAmount: number;
  freightChargeInclusive: boolean;
  freightChargeAmount: number;
  transitInsuranceInclusive: boolean;
  transitInsuranceAmount: number;
  installationInclusive: boolean;
  installationAmount: number;
  securityDepositInclusive: boolean;
  securityDepositAmount: number;
  liaisoningInclusive: boolean;
  liaisoningAmount: number;
}): number => {
  let total = 0;
  if (!state.liquidatedDamagesInclusive) total += state.liquidatedDamagesAmount || 0;
  if (!state.freightChargeInclusive) total += state.freightChargeAmount || 0;
  if (!state.transitInsuranceInclusive) total += state.transitInsuranceAmount || 0;
  if (!state.installationInclusive) total += state.installationAmount || 0;
  if (!state.securityDepositInclusive) total += state.securityDepositAmount || 0;
  if (!state.liaisoningInclusive) total += state.liaisoningAmount || 0;
  return total;
};

/**
 * Prepares form data for submission
 * @param state Current state of the form
 * @returns FormData object ready for submission
 */
export const prepareFormData = (state: {
  orderNumber: string;
  orderName: string;
  executiveName: string;
  orderCreationDate: string;
  orderDate: string;
  selectedCustomer: any;
  customerGST: string;
  customerEmail: string;
  customerPhone: string;
  selectedContactPerson: any;
  pocEmail: string;
  pocPhone: string;
  pocDesignation: string;
  pocDepartment: string;
  billingAddress: string;
  shippingAddress: string;
  wpcAddress: string;
  paymentTerm: string;
  deliveryInstruction: string;
  modeOfDispatch: string;
  warranty: string;
  requiresLicense: boolean;
  licenseType: LicenseType;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseQuantity: string;
  liaisoningRemarks: string;
  liaisoningVerified: boolean;
  liquidatedDamagesInclusive: boolean;
  liquidatedDamagesAmount: number;
  freightChargeInclusive: boolean;
  freightChargeAmount: number;
  transitInsuranceInclusive: boolean;
  transitInsuranceAmount: number;
  installationInclusive: boolean;
  installationAmount: number;
  securityDepositInclusive: boolean;
  securityDepositAmount: number;
  liaisoningInclusive: boolean;
  liaisoningAmount: number;
  documents: File[];
  performanceBankGuarantee: File | null;
  orderItems: OrderItem[];
  orderTotals: OrderTotals;
}): FormData => {
  const formData = new FormData();
  formData.append('orderNumber', state.orderNumber);
  formData.append('orderName', state.orderName);
  formData.append('executiveName', state.executiveName);
  formData.append('orderDate', state.orderDate);
  formData.append('orderCreationDate', state.orderCreationDate);

  if (state.selectedCustomer) {
    formData.append('customerId', state.selectedCustomer.id.toString());
    formData.append('customerName', state.selectedCustomer.label);
  }

  formData.append('customerGST', state.customerGST);
  formData.append('customerEmail', state.customerEmail);
  formData.append('customerPhone', state.customerPhone);

  if (state.selectedContactPerson) {
    formData.append('pocId', state.selectedContactPerson.id.toString());
    formData.append('pocName', state.selectedContactPerson.label);
  }

  formData.append('pocEmail', state.pocEmail);
  formData.append('pocPhone', state.pocPhone);
  formData.append('pocDesignation', state.pocDesignation);
  formData.append('pocDepartment', state.pocDepartment);
  
  formData.append('billingAddress', state.billingAddress);
  formData.append('shippingAddress', state.shippingAddress);
  formData.append('wpcAddress', state.wpcAddress);
  
  formData.append('paymentTerm', state.paymentTerm);
  formData.append('deliveryInstruction', state.deliveryInstruction);
  formData.append('modeOfDispatch', state.modeOfDispatch);
  formData.append('warranty', state.warranty);
  
  formData.append('requiresLicense', state.requiresLicense.toString());
  
  if (state.requiresLicense) {
    formData.append('licenseType', state.licenseType.toString());
    formData.append('licenseNumber', state.licenseNumber);
    formData.append('licenseIssueDate', state.licenseIssueDate);
    formData.append('licenseExpiryDate', state.licenseExpiryDate);
    formData.append('licenseQuantity', state.licenseQuantity.toString());
    formData.append('liaisoningRemarks', state.liaisoningRemarks);
    formData.append('liaisoningVerified', state.liaisoningVerified.toString());
  }
  
  formData.append('liquidatedDamagesInclusive', state.liquidatedDamagesInclusive.toString());
  formData.append('liquidatedDamagesAmount', state.liquidatedDamagesAmount.toString());
  formData.append('freightChargeInclusive', state.freightChargeInclusive.toString());
  formData.append('freightChargeAmount', state.freightChargeAmount.toString());
  formData.append('transitInsuranceInclusive', state.transitInsuranceInclusive.toString());
  formData.append('transitInsuranceAmount', state.transitInsuranceAmount.toString());
  formData.append('installationInclusive', state.installationInclusive.toString());
  formData.append('installationAmount', state.installationAmount.toString());
  formData.append('securityDepositInclusive', state.securityDepositInclusive.toString());
  formData.append('securityDepositAmount', state.securityDepositAmount.toString());
  formData.append('liaisoningInclusive', state.liaisoningInclusive.toString());
  formData.append('liaisoningAmount', state.liaisoningAmount.toString());
  
  if (state.documents.length > 0) {
    for (let i = 0; i < state.documents.length; i++) {
      formData.append('documents', state.documents[i]);
    }
  }
  
  if (state.performanceBankGuarantee) {
    formData.append('performanceBankGuarantee', state.performanceBankGuarantee);
  }
  
  if (state.orderItems && state.orderItems.length > 0) {
    const validatedItems = state.orderItems.map(item => ({
      productId: item.productId || 0,
      productName: item.productName || '',
      skuId: item.skuId || '',
      unitPrice: parseFloat(item.unitPrice?.toString() || '0') || 0,
      taxRate: parseFloat(item.taxRate?.toString() || '0') || 0,
      quantity: parseInt(item.quantity?.toString() || '0') || 0,
      discountRate: parseFloat(item.discountRate?.toString() || '0') || 0,
      subtotal: parseFloat(item.subtotal?.toString() || '0') || 0,
      taxAmount: parseFloat(item.taxAmount?.toString() || '0') || 0,
      discountAmount: parseFloat(item.discountAmount?.toString() || '0') || 0,
      totalAmount: parseFloat(item.totalAmount?.toString() || '0') || 0,
      unit: item.unit || '',
      description: item.description || '',
      category: item.category || '',
      modelNo: item.modelNo || '',
      serialNo: item.serialNo || '',
      size: item.size || '',
    }));
    
    formData.append('items', JSON.stringify(validatedItems));
  } else {
    formData.append('items', JSON.stringify([]));
  }
  
  formData.append('subtotal', state.orderTotals.subtotal?.toString() || '0');
  formData.append('taxTotal', state.orderTotals.taxTotal?.toString() || '0');
  formData.append('discountTotal', state.orderTotals.discountTotal?.toString() || '0');
  formData.append('totalAmount', state.orderTotals.totalAmount?.toString() || '0');
  formData.append('additionalCostTotal', state.orderTotals.additionalCostTotal?.toString() || '0');
  formData.append('grandTotal', state.orderTotals.grandTotal?.toString() || '0');
  
  return formData;
};

/**
 * Initializes the form state from initial data (for edit mode)
 * @param initialData Initial data for the form
 * @returns Initialized state object
 */
export const initializeFormState = (initialData: Partial<OrderFormData>) => {
  return {
    orderNumber: initialData.orderNumber || '',
    orderName: initialData.orderName || '',
    executiveName: initialData.executiveName || '',
    orderCreationDate: initialData.orderCreationDate || new Date().toISOString().split('T')[0],
    orderDate: initialData.orderDate || new Date().toISOString().split('T')[0],
    customerGST: initialData.customerGST || '',
    customerEmail: initialData.customerEmail || '',
    customerPhone: initialData.customerPhone || '',
    pocEmail: initialData.pocEmail || '',
    pocPhone: initialData.pocPhone || '',
    pocDesignation: initialData.pocDesignation || '',
    pocDepartment: initialData.pocDepartment || '',
    billingAddress: initialData.billingAddress || '',
    shippingAddress: initialData.shippingAddress || '',
    wpcAddress: initialData.wpcAddress || '',
    paymentTerm: initialData.paymentTerm || '',
    deliveryInstruction: initialData.deliveryInstruction || '',
    modeOfDispatch: initialData.modeOfDispatch || '',
    warranty: initialData.warranty || '',
    requiresLicense: initialData.requiresLicense || false,
    licenseType: (initialData.licenseType as LicenseType) || '',
    licenseNumber: initialData.licenseNumber || '',
    licenseIssueDate: initialData.licenseIssueDate || '',
    licenseExpiryDate: initialData.licenseExpiryDate || '',
    licenseQuantity: initialData.licenseQuantity?.toString() || '',
    liaisoningRemarks: initialData.liaisoningRemarks || '',
    liaisoningVerified: initialData.liaisoningVerified || false,
    liquidatedDamagesInclusive: initialData.liquidatedDamagesInclusive || false,
    liquidatedDamagesAmount: initialData.liquidatedDamagesAmount || 0,
    freightChargeInclusive: initialData.freightChargeInclusive || false,
    freightChargeAmount: initialData.freightChargeAmount || 0,
    transitInsuranceInclusive: initialData.transitInsuranceInclusive || false,
    transitInsuranceAmount: initialData.transitInsuranceAmount || 0,
    installationInclusive: initialData.installationInclusive || false,
    installationAmount: initialData.installationAmount || 0,
    securityDepositInclusive: initialData.securityDepositInclusive || false,
    securityDepositAmount: initialData.securityDepositAmount || 0,
    liaisoningInclusive: initialData.liaisoningInclusive || false,
    liaisoningAmount: initialData.liaisoningAmount || 0,
    documents: initialData.documents || [],
    performanceBankGuarantee: initialData.performanceBankGuarantee || null,
    items: initialData.items || [],
  };
}; 