import { toast } from 'react-toastify';
import { API_URL, handleApiError, GetTokenSilently } from './apiUtils';

/**
 * Hook for generating a new order number
 * @param customerId Customer ID to generate order number for
 * @param getAccessTokenSilently Function to get the access token
 * @returns Generated order number or null if failed
 */
export const useGenerateOrderNumber = async (
  customerId: string,
  getAccessTokenSilently: GetTokenSilently,
): Promise<string | null> => {
  try {
    const token = await getAccessTokenSilently();
    
    console.log('Generating order number for customer ID:', customerId);
    
    const response = await fetch(`${API_URL}/orders/generate-order-number`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        customerId
      }),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'Failed to generate order number');
      return null;
    }
    
    const data = await response.json();
    console.log('Generated order number response:', data);
    
    if (data && data.orderNumber) {
      return data.orderNumber;
    } else {
      toast.error('Failed to generate order number: Invalid response format');
      return null;
    }
  } catch (error) {
    console.error('Exception in useGenerateOrderNumber:', error);
    toast.error('Failed to generate order number. Please check your network connection and try again.');
    return null;
  }
};
