import { useAuth0 } from "@auth0/auth0-react";
import { Dispatch, SetStateAction } from "react";
import { FormData } from "../types";

export const useCustomerData = (setFormData: Dispatch<SetStateAction<FormData>>) => {
  const { getAccessTokenSilently } = useAuth0();

  const fetchCustomerDetails = async (customerId: string | number) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch customer details");
      const data = await response.json();

      // Create full company name with ancillary if available
      const fullCompanyName = data.ancillaryName 
        ? `${data.name} - ${data.ancillaryName}`
        : data.name;

      // Update form with customer details BUT NOT contact person details
      setFormData((prev) => ({
        ...prev,
        companyId: data.id,
        companyName: fullCompanyName,
        
        wpcStreetAddress: data.wpcStreetAddress || "",
        wpcAddressLine2: data.wpcAddressLine2 || "",
        wpcPin: data.wpcPin || "",
        wpcCity: data.wpcCity || "",
        wpcDistrict: data.wpcDistrict || "",
        wpcState: data.wpcState || "",
        wpcCountry: data.wpcCountry || "",
        
        // Use undefined instead of empty string for numeric fields
        contactPersonId: undefined,
        contactPersonName: "",
        contactPersonNumber: "",
        contactPersonEmailId: "",
        contactPersonDesignation: "",
        contactPersonDepartment: ""
      }));
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  return { fetchCustomerDetails };
};