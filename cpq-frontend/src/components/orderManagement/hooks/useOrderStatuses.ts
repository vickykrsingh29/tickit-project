import { GetTokenSilently } from './apiUtils';

/**
 * Hook for fetching all available order statuses
 * @param getAccessTokenSilently Function to get the access token
 * @returns Array of order status options in the format {value, label}
 */
export const useOrderStatuses = async (
  getAccessTokenSilently: GetTokenSilently
): Promise<{ value: string; label: string }[]> => {
  try {
    const token = await getAccessTokenSilently();
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/orders/statuses`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch order statuses');
    }
    
    const statuses = await response.json();
    return statuses;
  } catch (error) {
    console.error('Error fetching order statuses:', error);
    
    // Return default statuses if API call fails
    return [
      { value: 'Pending', label: 'Pending' },
      { value: 'Processing', label: 'Processing' },
      { value: 'Shipped', label: 'Shipped' },
      { value: 'Delivered', label: 'Delivered' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Cancelled', label: 'Cancelled' }
    ];
  }
}; 