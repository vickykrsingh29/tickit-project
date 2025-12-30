import { useState, useEffect } from 'react';
import Select from 'react-select'
import AddNewCustomerModal from '../../AddNewCustomerModal';
import AddNewPOCModal from '../../AddNewPOCModal';
import { CustomerOption, POCOption } from '../types';
import { OrderBasicInfoTabProps } from '../types';
import { POC } from '../../../types';
import { useAuth0 } from '@auth0/auth0-react';
import { useOrderStatuses } from '../hooks';

const OrderBasicInfo = (props: OrderBasicInfoTabProps) => {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAddPOCModalOpen, setIsAddPOCModalOpen] = useState(false);
  const [newPOCName, setNewPOCName] = useState("");
  const { getAccessTokenSilently } = useAuth0();
  const [isGeneratingOrderNumber, setIsGeneratingOrderNumber] = useState(false);
  const [userOptions, setUserOptions] = useState<{ value: string, label: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [orderStatusOptions, setOrderStatusOptions] = useState<{ value: string, label: string }[]>([]);
  const [isLoadingOrderStatuses, setIsLoadingOrderStatuses] = useState(false);

  // Fetch user options for executive name select
  useEffect(() => {
    const fetchUserOptions = async () => {
      try {
        setIsLoadingUsers(true);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/getusersforselect`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.ok) {
          const users = await response.json();
          setUserOptions(users);
        } else {
          console.error("Failed to fetch user options");
        }
      } catch (error) {
        console.error("Error fetching user options:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUserOptions();
  }, [getAccessTokenSilently]);

  // Fetch order status options
  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        setIsLoadingOrderStatuses(true);
        const statuses = await useOrderStatuses(getAccessTokenSilently);
        setOrderStatusOptions(statuses);
      } catch (error) {
        console.error("Error fetching order statuses:", error);
        
        // Set default statuses if API call fails
        setOrderStatusOptions([
          { value: 'Pending', label: 'Pending' },
          { value: 'Processing', label: 'Processing' },
          { value: 'Shipped', label: 'Shipped' },
          { value: 'Delivered', label: 'Delivered' },
          { value: 'Completed', label: 'Completed' },
          { value: 'Cancelled', label: 'Cancelled' }
        ]);
      } finally {
        setIsLoadingOrderStatuses(false);
      }
    };

    fetchOrderStatuses();
  }, [getAccessTokenSilently]);

  // Handle customer selection/creation
  const handleCustomerSelectChange = async (option: CustomerOption | null) => {
    if (option?.value === 'add_new') {
      setIsAddCustomerModalOpen(true);
      return;
    }
    if (option) {
      // Use the parent's handleCustomerChange function which will handle order number generation
      props.handleCustomerChange(option);
    }
  };

  // Handle POC selection/creation
  const handlePOCSelectChange = (option: POCOption | null) => {
    if (option?.value === 'add_new') {
      setIsAddPOCModalOpen(true);
      return;
    }
    if (option) {
      props.handlePocChange(option);
    }
  };

  // Handle POC addition with type conversion
  const handlePOCSubmit = (poc: POC) => {
    // Convert POC to POCOption
    const pocOption: POCOption = {
      id: poc.id,
      name: poc.name,
      value: poc.id.toString(),
      label: poc.name,
      email: poc.email,
      phone: poc.phone,
      designation: poc.designation,
      department: poc.department,
      remarks: poc.remarks
    };

    props.onPocAdded(pocOption);
  };

  // Handle adding a new customer
  const handleAddCustomer = async (addedCustomer: any) => {
    try {
      // Format the new customer for the select component
      const formattedCustomer = {
        id: addedCustomer.id,
        label: addedCustomer.ancillaryName ? `${addedCustomer.name} - ${addedCustomer.ancillaryName}` : addedCustomer.name,
        value: addedCustomer.id.toString(),
        name: addedCustomer.name,
        ancillaryName: addedCustomer.ancillaryName || '',
        gstNumber: addedCustomer.gstNumber || "",
        email: addedCustomer.email || "",
        phone: addedCustomer.phone || "",
        // Format addresses using the helper function
        billingAddress: formatAddress({
          billingStreetAddress: addedCustomer.billingStreetAddress,
          billingAddressLine2: addedCustomer.billingAddressLine2,
          billingCity: addedCustomer.billingCity,
          billingDistrict: addedCustomer.billingDistrict,
          billingState: addedCustomer.billingState,
          billingPin: addedCustomer.billingPin,
          billingCountry: addedCustomer.billingCountry
        }, "billing"),
        shippingAddress: formatAddress({
          shippingStreetAddress: addedCustomer.shippingStreetAddress,
          shippingAddressLine2: addedCustomer.shippingAddressLine2,
          shippingCity: addedCustomer.shippingCity,
          shippingDistrict: addedCustomer.shippingDistrict,
          shippingState: addedCustomer.shippingState,
          shippingPin: addedCustomer.shippingPin,
          shippingCountry: addedCustomer.shippingCountry
        }, "shipping"),
        wpcAddress: formatAddress({
          wpcStreetAddress: addedCustomer.wpcStreetAddress,
          wpcAddressLine2: addedCustomer.wpcAddressLine2,
          wpcCity: addedCustomer.wpcCity,
          wpcDistrict: addedCustomer.wpcDistrict,
          wpcState: addedCustomer.wpcState,
          wpcPin: addedCustomer.wpcPin,
          wpcCountry: addedCustomer.wpcCountry
        }, "wpc"),
      };

      // Close the modal
      setIsAddCustomerModalOpen(false);

      // Call parent's onCustomerAdded handler
      console.log("formattedCustomer", formattedCustomer);
      props.onCustomerAdded(formattedCustomer as CustomerOption);
    } catch (error) {
      console.error("Error handling new customer:", error);
    }
  };

  // Helper function to format address
  const formatAddress = (customer: any, type: "billing" | "shipping" | "wpc") => {
    const prefix = type === "billing" ? "billing" : type === "shipping" ? "shipping" : "wpc";

    const parts = [
      customer[`${prefix}StreetAddress`],
      customer[`${prefix}AddressLine2`],
      customer[`${prefix}City`],
      customer[`${prefix}District`],
      customer[`${prefix}State`],
      customer[`${prefix}Pin`],
      customer[`${prefix}Country`]
    ].filter(Boolean); // Remove empty or undefined values

    return parts.join(", ");
  };

  // Add "Add New" option to customers list
  const customerOptions = [
    ...(Array.isArray(props.customers) ? props.customers : []),
    { value: 'add_new', label: '+ Add New Customer', id: -1 }
  ];

  // Add "Add New" option to POC list
  const pocOptions = props.selectedCustomer
    ? [
      ...(Array.isArray(props.poc) ? props.poc : []),
      { value: 'add_new', label: '+ Add New POC', id: -1 }
    ]
    : [];

  return (
    <div className="space-y-6">
      {/* Basic info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={props.orderNumber || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => props.setOrderNumber(e.target.value)}
              placeholder="Enter order number or leave blank to auto-generate"
            />
            {isGeneratingOrderNumber && (
              <div className="absolute right-3 top-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            You can manually enter an order number or leave it blank to auto-generate when a customer is selected
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Executive Name
          </label>
          <Select
            options={userOptions}
            value={userOptions.find(option => option.label === props.executiveName) || null}
            onChange={(selectedOption) => {
              if (selectedOption) {
                props.setExecutiveName(selectedOption.label);
              }
            }}
            placeholder="Select an executive..."
            styles={props.selectStyles}
            className="w-full"
            isLoading={isLoadingUsers}
            menuPlacement="auto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Name
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={props.orderName}
            onChange={(e) => props.setOrderName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company (Customer) Name <span className="text-red-500">*</span>
          </label>
          <Select
            options={customerOptions as CustomerOption[]}
            value={props.selectedCustomer}
            onChange={handleCustomerSelectChange}
            placeholder="Select or add new customer..."
            styles={props.selectStyles}
            className="w-full"
            menuPlacement="auto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person (POC) <span className="text-red-500">*</span>
          </label>
          <Select
            options={pocOptions as POCOption[]}
            value={props.selectedPoc}
            onChange={handlePOCSelectChange}
            placeholder={props.selectedCustomer ? "Select or add new POC..." : "Please select a customer first"}
            styles={props.selectStyles}
            className="w-full"
            isDisabled={!props.selectedCustomer}
            menuPlacement="auto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Order Form Creation
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={props.orderCreationDate}
            onChange={(e) => props.setOrderCreationDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={props.orderDate}
            onChange={(e) => props.setOrderDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <Select
            options={orderStatusOptions}
            value={orderStatusOptions.find(option => option.value === props.orderStatus) || null}
            onChange={(selectedOption) => {
              if (selectedOption) {
                props.setOrderStatus(selectedOption.value);
              }
            }}
            placeholder="Select order status..."
            styles={props.selectStyles}
            className="w-full"
            isLoading={isLoadingOrderStatuses}
            menuPlacement="auto"
          />
        </div>
      </div>

      {/* Customer Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-800">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.customerGST}
              onChange={(e) => props.setCustomerGST(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.customerEmail}
              onChange={(e) => props.setCustomerEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.customerPhone}
              onChange={(e) => props.setCustomerPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              value={props.billingAddress}
              onChange={(e) => props.setBillingAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Address
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              value={props.shippingAddress}
              onChange={(e) => props.setShippingAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WPC License Address
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              value={props.wpcAddress}
              onChange={(e) => props.setWpcAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contact Person Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-800">
          Contact Person Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              POC Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.pocEmail}
              onChange={(e) => props.setPocEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              POC Phone
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.pocPhone}
              onChange={(e) => props.setPocPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              POC Designation
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.pocDesignation}
              onChange={(e) => props.setPocDesignation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              POC Department
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={props.pocDepartment}
              onChange={(e) => props.setPocDepartment(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddNewCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSubmit={props.onCustomerAdded}
      />

      <AddNewPOCModal
        isOpen={isAddPOCModalOpen}
        onClose={() => setIsAddPOCModalOpen(false)}
        onSubmit={(poc) => {
          handlePOCSubmit({...poc, id: 0});
        }}
        customerId={props.selectedCustomer?.id ? props.selectedCustomer.id.toString() : ""}
        initialData={newPOCName ? {
          name: newPOCName,
          email: "",
          phone: "",
          designation: "",
          department: ""
        } : undefined}
      />
    </div>
  );
}

export default OrderBasicInfo