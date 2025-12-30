import { toast } from 'react-toastify';
import OrderFormData from '../types/OrderFormData';
import { OrderItem, OrderTotals } from '../types/OrderItems';
import { API_URL, handleApiError, GetTokenSilently } from './apiUtils';
import { useOrderDetails } from './useOrderDetails';

/**
 * Hook for submitting order form data to the API
 * @param orderData Order data to submit
 * @param getAccessTokenSilently Function to get the access token
 * @param orderNumber Order number (used in edit mode)
 * @returns Submitted order data or null if failed
 */
export const useSubmitOrderForm = async (
  orderData: OrderFormData,
  getAccessTokenSilently: GetTokenSilently,
  orderNumber?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const token = await getAccessTokenSilently();
    console.log('Submitting order form with data:', orderData);
    
    // If orderNumber is provided, update an existing order
    if (orderNumber) {
      let orderId = '';
      
      // First, get the order ID using the order number
      const orderResponse = await fetch(`${API_URL}/orders/number/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!orderResponse.ok) {
        await handleApiError(orderResponse, 'Failed to find order for update');
        return { success: false, message: 'Failed to find order' };
      }
      
      const orderInfo = await orderResponse.json();
      if (!orderInfo || !orderInfo.id) {
        toast.error('Order not found');
        return { success: false, message: 'Order not found' };
      }
      
      orderId = orderInfo.id;
      
      // Prepare order data for update
      const sanitizedOrderData = { ...orderData };
      const formData = transformOrderDataToFormData(sanitizedOrderData);
      
      const updateResponse = await fetch(`${API_URL}/orders/number/${orderNumber}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!updateResponse.ok) {
        await handleApiError(updateResponse, 'Failed to update order');
        return { success: false, message: 'Failed to update order' };
      }
      
      const updatedOrder = await updateResponse.json();
      toast.success('Order updated successfully');
      
      return {
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder
      };
    } 
    // Otherwise, create a new order
    else {
      // Prepare order data for submission
      const sanitizedOrderData = { ...orderData };
      const formData = transformOrderDataToFormData(sanitizedOrderData);
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        await handleApiError(response, 'Failed to create order');
        return { success: false, message: 'Failed to create order' };
      }
      
      const newOrder = await response.json();
      toast.success('Order created successfully');
      
      return {
        success: true,
        message: 'Order created successfully',
        data: newOrder
      };
    }
  } catch (error) {
    console.error('Exception in useSubmitOrderForm:', error);
    toast.error('Failed to submit order. Please check your network connection and try again.');
    return { success: false, message: 'Failed to submit order' };
  }
};

/**
 * Transforms order data to form data for submission
 * @param orderData Order data to transform
 * @returns FormData object ready for submission
 */
const transformOrderDataToFormData = (orderData: OrderFormData): FormData => {
  const formData = new FormData();
  
  // Add order details
  formData.append('orderNumber', orderData.orderNumber || '');
  formData.append('orderName', orderData.orderName || '');
  formData.append('executiveName', orderData.executiveName || '');
  
  // Convert date fields
  if (orderData.orderDate) {
    formData.append('orderDate', new Date(orderData.orderDate).toISOString());
  }
  
  // Add customer information
  if (orderData.customerId) {
    formData.append('customerId', orderData.customerId.toString());
  }
  
  formData.append('customerGST', orderData.customerGST || '');
  formData.append('customerEmail', orderData.customerEmail || '');
  formData.append('customerPhone', orderData.customerPhone || '');
  
  // Add point of contact information
  if (orderData.pocId) {
    formData.append('pocId', orderData.pocId.toString());
  }
  
  formData.append('pocEmail', orderData.pocEmail || '');
  formData.append('pocPhone', orderData.pocPhone || '');
  formData.append('pocDesignation', orderData.pocDesignation || '');
  formData.append('pocDepartment', orderData.pocDepartment || '');
  
  // Add addresses
  formData.append('billingAddress', orderData.billingAddress || '');
  formData.append('shippingAddress', orderData.shippingAddress || '');
  formData.append('wpcAddress', orderData.wpcAddress || '');
  formData.append('orderStatus', orderData.orderStatus || '');
  
  // Add order settings
  formData.append('paymentTerm', orderData.paymentTerm || '');
  formData.append('deliveryInstruction', orderData.deliveryInstruction || '');
  formData.append('modeOfDispatch', orderData.modeOfDispatch || '');
  formData.append('warranty', orderData.warranty || '');
  formData.append('orderRemarks', orderData.orderRemarks || '');
  
  // Add license information
  formData.append('requiresLicense', orderData.requiresLicense ? 'true' : 'false');
  
  formData.append('licenseType', orderData.licenseType?.toString() || '');
  formData.append('licenseNumber', orderData.licenseNumber || '');
  
  if (orderData.licenseIssueDate) {
    formData.append('licenseIssueDate', new Date(orderData.licenseIssueDate).toISOString());
  }
  
  if (orderData.licenseExpiryDate) {
    formData.append('licenseExpiryDate', new Date(orderData.licenseExpiryDate).toISOString());
  }
  
  formData.append('licenseQuantity', orderData.licenseQuantity || '');
  formData.append('liaisoningRemarks', orderData.liaisoningRemarks || '');
  formData.append('liaisoningVerified', orderData.liaisoningVerified ? 'true' : 'false');
  
  // Add additional costs
  formData.append('liquidatedDamagesInclusive', orderData.liquidatedDamagesAmount > 0 ? 'false' : 'true');
  formData.append('liquidatedDamagesAmount', orderData.liquidatedDamagesAmount.toString());
  
  formData.append('freightChargeInclusive', orderData.freightChargeAmount > 0 ? 'false' : 'true');
  formData.append('freightChargeAmount', orderData.freightChargeAmount.toString());
  
  formData.append('transitInsuranceInclusive', orderData.transitInsuranceAmount > 0 ? 'false' : 'true');
  formData.append('transitInsuranceAmount', orderData.transitInsuranceAmount.toString());
  
  formData.append('installationInclusive', orderData.installationAmount > 0 ? 'false' : 'true');
  formData.append('installationAmount', orderData.installationAmount.toString());
  
  formData.append('securityDepositInclusive', orderData.securityDepositAmount > 0 ? 'false' : 'true');
  formData.append('securityDepositAmount', orderData.securityDepositAmount.toString());
  
  formData.append('liaisoningInclusive', orderData.liaisoningInclusive ? 'true' : 'false');
  formData.append('liaisoningAmount', orderData.liaisoningAmount.toString());
  
  // Add order items with explicit calculation of totals
  if (orderData.items && orderData.items.length > 0) {
    // Calculate order totals based on items
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;
    let itemsTotalAmount = 0;

    // Process items to ensure all fields are properly formatted
    const processedItems = orderData.items.map(item => {
      // Ensure proper number types
      const itemSubtotal = Number(item.subtotal || 0);
      const itemTaxAmount = Number(item.taxAmount || 0);
      const itemDiscountAmount = Number(item.discountAmount || 0);
      const itemTotalAmount = Number(item.totalAmount || 0);

      // Accumulate totals
      subtotal += itemSubtotal;
      taxTotal += itemTaxAmount;
      discountTotal += itemDiscountAmount;
      itemsTotalAmount += itemTotalAmount;

      return {
        ...item,
        // Convert numeric values to ensure they're numbers
        id: item.id || undefined,
        productId: Number(item.productId || 0),
        unitPrice: Number(item.unitPrice || 0),
        quantity: Number(item.quantity || 0),
        taxRate: Number(item.taxRate || 0),
        discountRate: Number(item.discountRate || 0),
        subtotal: itemSubtotal,
        taxAmount: itemTaxAmount,
        discountAmount: itemDiscountAmount,
        totalAmount: itemTotalAmount,
        orderId: item.orderId || undefined
      };
    });
    
    formData.append('items', JSON.stringify(processedItems));

    // Calculate additional costs
    const additionalCostTotal = calculateAdditionalCostsForSubmission(orderData);
    
    // Calculate grand total explicitly
    const calculatedGrandTotal = itemsTotalAmount + additionalCostTotal;
    
    // Use calculated values if not provided
    if (orderData.subtotal === undefined) orderData.subtotal = subtotal;
    if (orderData.taxAmount === undefined) orderData.taxAmount = taxTotal;
    if (orderData.discountAmount === undefined) orderData.discountAmount = discountTotal;
    if (orderData.totalAmount === undefined) orderData.totalAmount = itemsTotalAmount;
    if (orderData.additionalCostTotal === undefined) orderData.additionalCostTotal = additionalCostTotal;
    if (orderData.grandTotal === undefined) orderData.grandTotal = calculatedGrandTotal;
  } else {
    formData.append('items', JSON.stringify([]));
  }
  
  // Add totals with clear logging
  console.log("Order data before submission:", {
    subtotal: orderData.subtotal,
    taxAmount: orderData.taxAmount, 
    discountAmount: orderData.discountAmount,
    totalAmount: orderData.totalAmount,
    additionalCostTotal: orderData.additionalCostTotal,
    grandTotal: orderData.grandTotal
  });

  // Ensure we have at least default values for required totals
  const subtotal = Number(orderData.subtotal || 0);
  const taxAmount = Number(orderData.taxAmount || 0);
  const discountAmount = Number(orderData.discountAmount || 0);
  const totalAmount = Number(orderData.totalAmount || 0);
  const additionalCostTotal = Number(orderData.additionalCostTotal || 0);

  // Calculate grand total again to ensure consistency
  let grandTotal = totalAmount + additionalCostTotal;

  // If the provided grandTotal seems incorrect, use the calculated one
  if (Math.abs(Number(orderData.grandTotal || 0) - grandTotal) > 0.01) {
    console.log(`Warning: Provided grandTotal ${orderData.grandTotal} doesn't match calculated ${grandTotal}. Using calculated value.`);
  } else {
    grandTotal = Number(orderData.grandTotal || grandTotal);
  }

  console.log("Final totals being sent to API:", {
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    additionalCostTotal,
    grandTotal
  });

  // Add individual totals to form data
  formData.append('subtotal', subtotal.toString());
  formData.append('taxAmount', taxAmount.toString());
  formData.append('discountAmount', discountAmount.toString());
  formData.append('totalAmount', totalAmount.toString());
  formData.append('additionalCostTotal', additionalCostTotal.toString());
  formData.append('grandTotal', grandTotal.toString());

  // Explicitly add orders total for backend fields that might use different names
  formData.append('taxTotal', taxAmount.toString());
  formData.append('discountTotal', discountAmount.toString());

  // Create a complete orderTotals object to ensure all fields are included
  const completeOrderTotals = {
    subtotal: subtotal,
    taxTotal: taxAmount,
    discountTotal: discountAmount,
    totalAmount: totalAmount,
    additionalCostTotal: additionalCostTotal,
    grandTotal: grandTotal
  };

  // Include the complete orderTotals as JSON
  formData.append('orderTotals', JSON.stringify(completeOrderTotals));
  
  // Add documents
  if (orderData.documents && orderData.documents.length > 0) {
    for (let i = 0; i < orderData.documents.length; i++) {
      formData.append('documents', orderData.documents[i]);
    }
  }
  
  // Add performance bank guarantee
  if (orderData.performanceBankGuarantee) {
    formData.append('performanceBankGuarantee', orderData.performanceBankGuarantee);
  }
  
  return formData;
};

// Helper function to calculate additional costs consistently
function calculateAdditionalCostsForSubmission(data: OrderFormData): number {
  let total = 0;
  if (!data.liquidatedDamagesInclusive) total += Number(data.liquidatedDamagesAmount || 0);
  if (!data.freightChargeInclusive) total += Number(data.freightChargeAmount || 0);
  if (!data.transitInsuranceInclusive) total += Number(data.transitInsuranceAmount || 0);
  if (!data.installationInclusive) total += Number(data.installationAmount || 0);
  if (!data.securityDepositInclusive) total += Number(data.securityDepositAmount || 0);
  if (!data.liaisoningInclusive) total += Number(data.liaisoningAmount || 0);
  
  console.log('Additional costs calculation:', {
    liquidatedDamages: !data.liquidatedDamagesInclusive ? Number(data.liquidatedDamagesAmount || 0) : 0,
    freightCharge: !data.freightChargeInclusive ? Number(data.freightChargeAmount || 0) : 0,
    transitInsurance: !data.transitInsuranceInclusive ? Number(data.transitInsuranceAmount || 0) : 0,
    installation: !data.installationInclusive ? Number(data.installationAmount || 0) : 0,
    securityDeposit: !data.securityDepositInclusive ? Number(data.securityDepositAmount || 0) : 0,
    liaisoning: !data.liaisoningInclusive ? Number(data.liaisoningAmount || 0) : 0,
    total
  });
  
  return total;
} 