import { useAuth0 } from "@auth0/auth0-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Select from "react-select";
import AddNewCustomerModal from "./AddNewCustomerModal";

interface Customer {
  id: number;
  name: string;
  ancillaryName?: string; // Add ancillaryName to interface
  pocName: string;
  pocDesignation: string;
  pocEmail: string;
  phone: string;
  industry: string;
  billingCity: string;
}

const SearchByName = forwardRef((props, ref) => {
  const { getAccessTokenSilently } = useAuth0();
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Local data/error states if you want to see new entries or handle errors here
  const [data, setData] = useState<Customer[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/customers`, // Changed from /companies to get all customer data
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        // Insert "Add New Customer" at the top and format company names
        const newOptions = [
          { label: "Add New Customer", value: "add_new_customer" },
          ...data.map((company: any) => ({
            label: company.ancillaryName
              ? `${company.name} - ${company.ancillaryName}`
              : company.name,
            value: company.id.toString(),
            id: company.id,
          })),
        ];
        setOptions(newOptions);
        setData(data); // Store the full customer data
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, [getAccessTokenSilently]);

  const handleAddCustomer = async (newCustomer: Customer) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCustomer),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add new customer.");
      }

      const addedCustomer = await response.json();
      setData((prevData) => [...prevData, addedCustomer]);
      // Add the new customer to options
      const newOption = {
        label: newCustomer.ancillaryName
          ? `${newCustomer.name} - ${newCustomer.ancillaryName}`
          : newCustomer.name,
        value: addedCustomer.id.toString(),
      };
      setOptions((prevOptions) => [newOption, ...prevOptions]);

      // Set the new customer as the selected option
      setSelectedOption(newOption);

      setCompanyInfo({
        gstNumber: addedCustomer.gstNumber,
        email: addedCustomer.email,
        billingStreetAddress: addedCustomer.billingStreetAddress,
        billingAddressLine2: addedCustomer.billingAddressLine2,
        billingCity: addedCustomer.billingCity,
        billingState: addedCustomer.billingState,
        billingPin: addedCustomer.billingPin,
        shippingStreetAddress: addedCustomer.shippingStreetAddress,
        shippingAddressLine2: addedCustomer.shippingAddressLine2,
        shippingCity: addedCustomer.shippingCity,
        shippingState: addedCustomer.shippingState,
        shippingPin: addedCustomer.shippingPin,
        sameAsBilling: addedCustomer.sameAsBilling,
      });

      // Close the modal
      setIsAddCustomerModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelect = async (selectedOption: any) => {
    if (!selectedOption) return;
    if (selectedOption.value === "add_new_customer") {
      setIsAddCustomerModalOpen(true);
      return;
    }
    setSelectedOption(selectedOption);

    // Find the customer data from our stored data instead of making another API call
    const selectedCustomer = data.find(
      (customer) => customer.id.toString() === selectedOption.value
    );
    if (selectedCustomer) {
      setCompanyInfo(selectedCustomer);
    }
  };

  useImperativeHandle(ref, () => ({
    selectedCustomer: companyInfo,
  }));

  return (
    <div className="p-4  rounded-lg ">
      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Company Name <span className="text-red-500">*</span>
        </label>
        <Select
          options={options}
          onChange={handleSelect}
          value={selectedOption}
          placeholder="Type to search by company name"
        />
      </div>
      {companyInfo && (
        <div className=" rounded-lg ">
          <p className="text-sm text-gray-600">
            <span className="font-bold">GST Number:</span>{" "}
            {companyInfo.gstNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-bold">Email:</span> {companyInfo.email}
          </p>
          <div>
            {companyInfo.sameAsBilling ? (
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">
                    Billing & Shipping Address:{" "}
                  </span>
                  {companyInfo.billingStreetAddress},{" "}
                  {companyInfo.billingAddressLine2}, {companyInfo.billingCity},{" "}
                  {companyInfo.billingState}, {companyInfo.billingPin}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Billing Address: </span>
                  {companyInfo.billingStreetAddress},{" "}
                  {companyInfo.billingAddressLine2}, {companyInfo.billingCity},{" "}
                  {companyInfo.billingState}, {companyInfo.billingPin}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Shipping Address: </span>
                  {companyInfo.shippingStreetAddress},{" "}
                  {companyInfo.shippingAddressLine2}, {companyInfo.shippingCity}
                  , {companyInfo.shippingState}, {companyInfo.shippingPin}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <AddNewCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </div>
  );
});

export default SearchByName;
