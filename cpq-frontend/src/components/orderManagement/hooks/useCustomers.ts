import { toast } from 'react-toastify';
import { CustomerOption } from '../types/OrderOptionTypes';
import { API_URL, formatAddress, handleApiError, GetTokenSilently } from './apiUtils';

/**
 * Hook for fetching customers from the API
 * @param getAccessTokenSilently Function to get the access token
 * @returns Array of formatted customer options
 */
export const useCustomers = async (getAccessTokenSilently: GetTokenSilently): Promise<CustomerOption[]> => {
  try {
    const token = await getAccessTokenSilently();
    const apiUrl = `${API_URL}/customers`;
    
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return await handleApiError(response, 'Failed to fetch customers') as any || [];
    }
    
    const data = await response.json();
    
    const formattedCustomers = data.map((customer: any) => ({
      id: customer.id,
      value: customer.id,
      label: `${customer.name} - ${customer.ancillaryName}`,
      name: customer.name,
      ancillaryName: customer.ancillaryName || '',
      gstNumber: customer.gstNumber || '',
      email: customer.email || '',
      phone: customer.phone || '',
      billingAddress: formatAddress({
        billingAddressLine1: customer.billingAddressLine1,
        billingAddressLine2: customer.billingAddressLine2,
        billingCity: customer.billingCity,
        billingDistrict: customer.billingDistrict,
        billingState: customer.billingState,
        billingPincode: customer.billingPincode,
        billingCountry: customer.billingCountry
      }, 'billing'),
      shippingAddress: formatAddress({
        shippingAddressLine1: customer.shippingAddressLine1,
        shippingAddressLine2: customer.shippingAddressLine2,
        shippingCity: customer.shippingCity,
        shippingDistrict: customer.shippingDistrict,
        shippingState: customer.shippingState,
        shippingPincode: customer.shippingPincode,
        shippingCountry: customer.shippingCountry
      }, 'shipping'),
      wpcAddress: formatAddress({
        wpcAddressLine1: customer.wpcAddressLine1,
        wpcAddressLine2: customer.wpcAddressLine2,
        wpcCity: customer.wpcCity,
        wpcDistrict: customer.wpcDistrict,
        wpcState: customer.wpcState,
        wpcPincode: customer.wpcPincode,
        wpcCountry: customer.wpcCountry
      }, 'wpc'),
    }));
    
    console.log('Formatted customers:', formattedCustomers);
    return formattedCustomers;
  } catch (error) {
    console.error('Exception in useCustomers:', error);
    toast.error('Failed to fetch customers. Please check your network connection and try again.');
    return [];
  }
};