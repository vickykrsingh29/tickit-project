import { AddressFields } from '../../types/OrderTypes';

/**
 * Formats an address object into a readable string
 * @param address The address fields object
 * @param type The type of address (billing, shipping, or wpc)
 * @returns Formatted address string
 */
export const formatAddress = (address: AddressFields, type: 'billing' | 'shipping' | 'wpc'): string => {
  const prefix = type === 'billing' ? 'billing' : type === 'shipping' ? 'shipping' : 'wpc';
  
  const parts = [
    address[`${prefix}StreetAddress`],
    address[`${prefix}AddressLine2`],
    address[`${prefix}City`],
    address[`${prefix}District`],
    address[`${prefix}State`],
    address[`${prefix}Pin`],
    address[`${prefix}Country`]
  ].filter(Boolean); // Remove empty or undefined values
  
  return parts.join(', ');
}; 