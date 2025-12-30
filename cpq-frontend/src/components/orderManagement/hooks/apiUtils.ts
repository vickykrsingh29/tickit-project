import { toast } from 'react-toastify';

export type GetTokenSilently = () => Promise<string>;

export const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const formatAddress = (
  addressParts: {
    [key: string]: string | undefined;
  },
  prefix: string
): string => {
  const addressLine1 = addressParts[`${prefix}AddressLine1`] || '';
  const addressLine2 = addressParts[`${prefix}AddressLine2`] || '';
  const city = addressParts[`${prefix}City`] || '';
  const district = addressParts[`${prefix}District`] || '';
  const state = addressParts[`${prefix}State`] || '';
  const pincode = addressParts[`${prefix}Pincode`] || '';
  const country = addressParts[`${prefix}Country`] || '';

  return [
    addressLine1,
    addressLine2,
    city,
    district,
    state,
    pincode,
    country
  ].filter(Boolean).join(', ');
};

export const handleApiError = async (response: Response, errorMessage: string): Promise<null> => {
  const statusText = response.statusText;
  const status = response.status;
  
  try {
    const text = await response.text();

    if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
      toast.error('Authentication error. Please try logging out and back in.');
      return null;
    }
    
    try {
      const errorData = JSON.parse(text);
      toast.error(errorData.message || `${errorMessage}: ${status} ${statusText}`);
    } catch (parseError) {
      toast.error(`${errorMessage}: ${text.substring(0, 100)}...`);
    }
  } catch (textError) {
    toast.error(`${errorMessage}: ${status} ${statusText}`);
  }
  
  return null;
};