import { toast } from 'react-toastify';
import { API_URL, GetTokenSilently } from './apiUtils';

/**
 * Hook for downloading order documents
 * @param orderNumber Order number to download document for
 * @param getAccessTokenSilently Function to get the access token
 * @returns Boolean indicating success or failure
 */
export const useDownloadOrderDocument = async (
  orderNumber: string,
  getAccessTokenSilently: GetTokenSilently
): Promise<boolean> => {
  try {
    const token = await getAccessTokenSilently();
    
    // Create the download URL
    const downloadUrl = `${API_URL}/orders/download/${orderNumber}`;
    console.log('Download URL:', downloadUrl);
    
    // Open the download URL in a new tab
    window.open(`${downloadUrl}?token=${token}`, '_blank');
    
    return true;
  } catch (error) {
    console.error('Exception in useDownloadOrderDocument:', error);
    toast.error('Failed to download order document. Please check your network connection and try again.');
    return false;
  }
}; 