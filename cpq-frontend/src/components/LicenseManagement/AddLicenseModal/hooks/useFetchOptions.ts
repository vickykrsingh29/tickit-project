import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Option, OptionsState, PocOption } from "../types";

export const useFetchOptions = (isOpen: boolean, setFormData: any) => {
  const { getAccessTokenSilently, user } = useAuth0();
  
  const [options, setOptions] = useState<OptionsState>({
    licenseTypes: [],
    statuses: [],
    issuingAuthorities: [],
    countriesOfOrigin: [],
    equipmentTypes: [],
    technologiesUsed: [],
    endUsePurposes: [],
    geographicalCoverages: [], // Add this new field
    employees: [],
  });
  
  const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
  const [pocOptions, setPocOptions] = useState<PocOption[]>([]);

  // Fetch POC options by customer ID
  const fetchPocByCustomerId = async (customerId: string | number) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/poc/get-poc-details-for-select/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch POCs");
      const pocData = await response.json();
      setPocOptions(pocData);
      return pocData;
    } catch (error) {
      console.error("Error fetching POCs:", error);
      setPocOptions([]);
      return [];
    }
  };


  const fetchCustomers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers/all-customers-for-select`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomerOptions(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  
  // New function to fetch employees from backend
  const fetchEmployees = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/getusersforselect`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch employees");
      const employeesList = await response.json();
      return employeesList;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };
  
  // New function to fetch select options from backend
  const fetchSelectOptions = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/licenses/select-options`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch license select options");
      return await response.json();
    } catch (error) {
      console.error("Error fetching license select options:", error);
      return null;
    }
  };

  // Populate select options when the modal opens
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch data from backend
        await fetchCustomers();
        const employeesList = await fetchEmployees();
        const selectOptions = await fetchSelectOptions();
        
        // Set the current user as the processed by default value
        if (user?.sub && employeesList.length > 0) {
            const currentUserOption = employeesList.find(
              (employee: Option) => employee.value === user.sub
            );
            
            if (currentUserOption) {
              setFormData((prevData: any) => ({
                ...prevData,
                processedBy: currentUserOption.value
              }));
            }
        }

        // If we successfully got options from the API
        if (selectOptions) {
          setOptions({
            licenseTypes: selectOptions.licenseTypes.map((item: string) => ({ value: item, label: item })),
            statuses: selectOptions.statuses.map((item: string) => ({ value: item, label: item })),
            issuingAuthorities: selectOptions.issuingAuthorities.map((item: string) => ({ value: item, label: item })),
            countriesOfOrigin: selectOptions.countriesOfOrigin.map((item: string) => ({ value: item, label: item })),
            equipmentTypes: selectOptions.equipmentTypes.map((item: string) => ({ value: item, label: item })),
            technologiesUsed: selectOptions.technologiesUsed.map((item: string) => ({ value: item, label: item })),
            endUsePurposes: selectOptions.endUsePurposes.map((item: string) => ({ value: item, label: item })),
            geographicalCoverages: selectOptions.geographicalCoverages.map((item: string) => ({ value: item, label: item })),
            employees: employeesList,
          });
        } else {
          // Fallback to empty arrays if API call fails
          setOptions({
            licenseTypes: [],
            statuses: [],
            issuingAuthorities: [],
            countriesOfOrigin: [],
            equipmentTypes: [],
            technologiesUsed: [],
            endUsePurposes: [],
            geographicalCoverages: [],
            employees: employeesList,
          });
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, getAccessTokenSilently, user, setFormData]);

  return { options, setOptions, customerOptions, pocOptions, fetchPocByCustomerId };
};