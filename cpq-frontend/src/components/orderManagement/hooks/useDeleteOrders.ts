import { toast } from 'react-toastify';
import { API_URL, handleApiError, GetTokenSilently } from './apiUtils';

/**
 * Hook for deleting multiple orders by their order numbers
 * @param orderNumbers Array of order numbers to delete
 * @param getAccessTokenSilently Function to get the access token
 * @returns Boolean indicating success or failure
 */
export const useDeleteOrders = async (
  orderNumbers: string[],
  getAccessTokenSilently: GetTokenSilently
): Promise<boolean> => {
  try {
    if (!orderNumbers || orderNumbers.length === 0) {
      toast.error('No orders selected for deletion');
      return false;
    }

    const token = await getAccessTokenSilently();
    
    // Convert order numbers to a format the backend expects
    // The backend expects an array of IDs, but we're sending order numbers
    // We'll need to modify the backend to handle this or fetch the IDs first
    const response = await fetch(`${API_URL}/orders/delete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNumbers }),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'Failed to delete orders');
      return false;
    }
    
    const result = await response.json();
    toast.success(`Successfully deleted ${result.deletedCount} orders`);
    return true;
  } catch (error) {
    console.error('Error in useDeleteOrders:', error);
    toast.error('Failed to delete orders. Please check your network connection and try again.');
    return false;
  }
}; 