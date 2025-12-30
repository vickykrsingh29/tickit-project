import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Product, Customer, POC, LoadingState, BrandWithProducts, Option, License } from "../types";

/**
 * Custom hook to fetch and manage products and customers data
 */
export const useFetchData = (isOpen: boolean) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pocs, setPocs] = useState<POC[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [currentUser, setCurrentUser] = useState<Option | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    products: false,
    customers: false,
    submitting: false,
    users: false,
    licenses: false
  });

  // Store the full customer data for reference
  const [customersWithPocs, setCustomersWithPocs] = useState<any[]>([]);

  // Fetch products and customers when modal is opened
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({ 
          ...prev, 
          products: true, 
          customers: true, 
          users: true,
          licenses: true 
        }));
        
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });
        
        // Fetch brands with products from API
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/brands-with-products`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const brandsData: BrandWithProducts[] = await response.json();
            
            // Create brand options for dropdown
            const brandOptions = brandsData.map(item => ({
              value: item.brand,
              label: item.brand
            }));
            
            // Process all products
            const allProducts: Product[] = [];
            brandsData.forEach(brandItem => {
              brandItem.products.forEach(product => {
                allProducts.push({
                  id: product.productName, // Using productName as id
                  productName: product.productName,
                  brand: brandItem.brand,
                  sku: "", // Not provided in API
                  pricePerPiece: product.pricePerPiece,
                  gst: product.gst
                });
              });
            });
            
            setBrands(brandOptions);
            setProducts(allProducts);
          } else {
            fallbackToDummyData();
          }
        } catch (error) {
          console.error("Error fetching brands and products:", error);
          fallbackToDummyData();
        }

        // Fetch customers with POCs from API
        try {
          const customersResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/with-pocs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            setCustomersWithPocs(customersData);
            
            // Extract customer info for dropdown
            const formattedCustomers = customersData.map((item: any) => ({
              id: item.id.toString(),
              name: item.name
            }));
            
            setCustomers(formattedCustomers);
          } else {
            console.error("Failed to fetch customers with POCs");
          }
        } catch (error) {
          console.error("Error fetching customers:", error);
        }
        
        // Fetch user options for executive name select
        try {
          const usersResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/getusersforselect`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUserOptions(usersData);
            
            // Find current user in options and set as default
            if (user?.sub) {
              const currentUserOption = usersData.find((option: Option) => 
                option.value === user.sub
              );
              
              if (currentUserOption) {
                setCurrentUser(currentUserOption);
              }
            }
          } else {
            console.error("Failed to fetch user options");
          }
        } catch (error) {
          console.error("Error fetching user options:", error);
        }

        // Fetch licenses
        try {
          const licensesResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/licenses`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (licensesResponse.ok) {
            const licensesData = await licensesResponse.json();
            setLicenses(licensesData);
          } else {
            console.error("Failed to fetch licenses");
          }
        } catch (error) {
          console.error("Error fetching licenses:", error);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading((prev) => ({ 
          ...prev, 
          products: false, 
          customers: false,
          users: false,
          licenses: false
        }));
      }
    };
    
    // Helper function for fallback data
    const fallbackToDummyData = () => {
      const dummyProducts: Product[] = [
        { id: "1", productName: "Enterprise Server", brand: "TechSoft", sku: "SVR001", pricePerPiece: 5000, gst: 18 },
        { id: "2", productName: "Cloud Storage", brand: "CloudTech", sku: "CLD105", pricePerPiece: 2000, gst: 18 },
        { id: "3", productName: "Security Suite", brand: "SecureNet", sku: "SEC334", pricePerPiece: 3000, gst: 12 },
        { id: "4", productName: "Network Monitor", brand: "TechSoft", sku: "NET450", pricePerPiece: 1500, gst: 18 },
      ];
      
      // Extract unique brands from products
      const uniqueBrands = Array.from(new Set(dummyProducts.map(p => p.brand)))
        .map(brand => ({ value: brand, label: brand }));
      
      setBrands(uniqueBrands);
      setProducts(dummyProducts);
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, getAccessTokenSilently, user]);
  
  // Filter products when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      const filteredByBrand = products.filter(p => p.brand === selectedBrand);
      setFilteredProducts(filteredByBrand);
    } else {
      setFilteredProducts([]);
    }
  }, [selectedBrand, products]);

  return { 
    products, 
    filteredProducts, 
    customers, 
    pocs, 
    brands,
    licenses,
    selectedBrand,
    setSelectedBrand,
    loading, 
    setPocs,
    customersWithPocs,
    userOptions,
    currentUser
  };
};