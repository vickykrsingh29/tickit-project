import { toast } from 'react-toastify';
import { POCOption } from '../types/OrderOptionTypes';
import { API_URL, handleApiError, GetTokenSilently } from './apiUtils';

/**
 * Hook for fetching POCs for a specific customer
 * @param customerId ID of the customer
 * @param getAccessTokenSilently Function to get the access token
 * @returns Array of formatted POC options
 */
export const usePOC = async (
  customerId: string | number,
  getAccessTokenSilently: GetTokenSilently
): Promise<POCOption[]> => {
  try {
    const token = await getAccessTokenSilently();
    const apiUrl = `${API_URL}/poc/get-poc-details-for-select/${customerId}`;
    
    console.log('Fetching POCs from:', apiUrl);
    console.log('API_URL:', API_URL);
    console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
    console.log('Customer ID:', customerId);
    
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('POC API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      return await handleApiError(response, 'Failed to fetch POCs') as any || [];
    }
    
    // Parse the response
    const data = await response.json();
    console.log('POC API response data:', data);
    
    // Format the POCs for the dropdown
    const formattedPOCs = data.map((poc: any) => ({
      id: poc.id || poc.value,
      value: poc.id || poc.value,
      label: poc.name || poc.label,
      name: poc.name || poc.label,
      email: poc.email || '',
      phone: poc.phone || '',
      designation: poc.designation || '',
      department: poc.department || '',
      remarks: poc.remarks || '',
    }));
    
    console.log('Formatted POCs:', formattedPOCs);
    return formattedPOCs;
  } catch (error) {
    console.error('Exception in usePOC:', error);
    toast.error('Failed to fetch POCs. Please check your network connection and try again.');
    return [];
  }
};
  