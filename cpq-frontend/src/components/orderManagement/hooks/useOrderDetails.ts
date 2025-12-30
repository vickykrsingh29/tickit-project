import { toast } from 'react-toastify';
import { API_URL, handleApiError, GetTokenSilently } from './apiUtils';
import OrderFormData from '../types/OrderFormData';
import { OrderItem } from '../types/OrderItems';

/**
 * Hook for fetching order details by order number
 * @param orderNumber Order number
 * @param getAccessTokenSilently Function to get the access token
 * @returns Order details or null if failed
 */
export const useOrderDetails = async (
  orderNumber: string,
  getAccessTokenSilently: GetTokenSilently
): Promise<Partial<OrderFormData> | null> => {
  try {
    const token = await getAccessTokenSilently();
    
    const apiUrl = `${API_URL}/orders/number/${orderNumber}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
        
    if (!response.ok) {
      return await handleApiError(response, 'Failed to fetch order details');
    }
    
    const data = await response.json();
    console.log('Order DETAILS RESPONSE:', data);
    
    const transformedData: Partial<OrderFormData> = {
      orderNumber: data.orderNumber,
      orderName: data.orderName || '',
      executiveName: data.executiveName || '',
      orderCreationDate: data.createdAt ? data.createdAt: '',
      orderDate: data.orderDate ? data.orderDate: '',
      
      // Customer info
      customerId: data.customer?.id,
      customerName: data.customer?.name || '',
      customerGST: data.customer?.gstNumber || '',
      customerEmail: data.customer?.email || '',
      customerPhone: data.customer?.phone || '',
      billingAddress: data.billingAddress || '',
      shippingAddress: data.shippingAddress || '',
      wpcAddress: data.wpcAddress || '',
      
      // POC info
      pocId: data.poc?.id,
      pocName: data.poc?.name || '',
      pocEmail: data.poc?.email || '',
      pocPhone: data.poc?.phone || '',
      pocDesignation: data.poc?.designation || '',
      pocDepartment: data.poc?.department || '',
      
      // Order settings
      paymentTerm: data.paymentTerm || '',
      deliveryInstruction: data.deliveryInstruction || '',
      modeOfDispatch: data.modeOfDispatch || '',
      warranty: data.warranty || '',
      orderRemarks: data.orderRemarks || '',
      orderStatus: data.orderStatus || '',
      requiresLicense: data.requiresLicense || false,
      licenseType: data.licenseType || '',
      licenseNumber: data.licenseNumber || '',
      licenseIssueDate: data.licenseIssueDate ? data.licenseIssueDate: '',
      licenseExpiryDate: data.licenseExpiryDate ? data.licenseExpiryDate: '',
      licenseQuantity: data.licenseQuantity || '',
      liaisoningRemarks: data.liaisoningRemarks || '',
      liaisoningVerified: data.liaisoningVerified || false,
      
      // Additional costs
      liquidatedDamagesInclusive: data.liquidatedDamagesInclusive || false,
      liquidatedDamagesAmount: parseFloat(data.liquidatedDamagesAmount || '0'),
      freightChargeInclusive: data.freightChargeInclusive || false,
      freightChargeAmount: parseFloat(data.freightChargeAmount || '0'),
      transitInsuranceInclusive: data.transitInsuranceInclusive || false,
      transitInsuranceAmount: parseFloat(data.transitInsuranceAmount || '0'),
      installationInclusive: data.installationInclusive || false,
      installationAmount: parseFloat(data.installationAmount || '0'),
      securityDepositInclusive: data.securityDepositInclusive || false,
      securityDepositAmount: parseFloat(data.securityDepositAmount || '0'),
      liaisoningInclusive: data.liaisoningInclusive || false,
      liaisoningAmount: parseFloat(data.liaisoningAmount || '0'),
      
      // Order items
      items: data.items?.map((item: any): OrderItem => ({
        id: item.id,
        productId: item.productId || (item.product?.id || 0),
        productName: item.productName || (item.product?.productName || ''),
        skuId: item.skuId || (item.product?.skuId || ''),
        unit: item.unit || (item.product?.unitOfMeasurement || ''),
        category: item.category || (item.product?.category || ''),
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        taxRate: Number(item.taxRate || 0),
        discountRate: Number(item.discountRate || 0),
        subtotal: Number(item.subtotal || 0),
        taxAmount: Number(item.taxAmount || 0),
        discountAmount: Number(item.discountAmount || 0),
        totalAmount: Number(item.totalAmount || 0),
        description: item.description || '',
        modelNo: item.modelNo || '',
        serialNo: item.serialNo || '',
        size: item.size || '',
        batchNo: item.batchNo || '',
        expDate: item.expDate || '',
        mfgDate: item.mfgDate || '',
        warranty: item.warranty || '',
        manufacturer: item.manufacturer || '',
        additionalDetails: item.additionalDetails || '',
        status: item.status || '',
        remarks: item.remarks || '',
        orderId: item.orderId || 0
      })) || [],
      
      // Documents
      documents: data.documents || [],
      performanceBankGuarantee: data.performanceBankGuarantee || '',
      
      // Totals
      subtotal: parseFloat(data.subtotal || '0'),
      taxAmount: parseFloat(data.totalGST || '0'),
      additionalCostTotal: parseFloat(data.additionalCostsTotal || '0'),
      grandTotal: parseFloat(data.grandTotal || '0')
    };
    
    return transformedData;
  } catch (error: any) {
    console.error('Exception in useOrderDetails:', error);
    toast.error('Failed to fetch order details. Please check your network connection and try again.');
    return null;
  }
};

