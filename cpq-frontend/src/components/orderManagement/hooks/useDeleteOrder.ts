import { toast } from 'react-toastify';
import { API_URL, handleApiError, GetTokenSilently } from './apiUtils';

/**
 * Hook for deleting an order by order number
 * @param orderNumber Order number to delete
 * @param getAccessTokenSilently Function to get the access token
 * @returns Boolean indicating success or failure
 */
export const useDeleteOrder = async (
  orderNumber: string,
  getAccessTokenSilently: GetTokenSilently
): Promise<boolean> => {
  try {
    const token = await getAccessTokenSilently();
    
    // Delete order directly using the order number endpoint
    const response = await fetch(`${API_URL}/orders/number/${orderNumber}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      await handleApiError(response, 'Failed to delete order');
      return false;
    }
    
    toast.success('Order deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in useDeleteOrder:', error);
    toast.error('Failed to delete order. Please check your network connection and try again.');
    return false;
  }
}; 