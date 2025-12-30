import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { BrandProductsData } from '../types';

export const useBrandProducts = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [brandProductsData, setBrandProductsData] = useState<BrandProductsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandProducts = async () => {
      setLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/brands-with-products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch brands and products');
        }
        
        const data = await response.json();
        setBrandProductsData(data);
      } catch (err) {
        console.error('Error fetching brand-products data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrandProducts();
  }, [getAccessTokenSilently]);
  
  return { brandProductsData, loading, error };
};