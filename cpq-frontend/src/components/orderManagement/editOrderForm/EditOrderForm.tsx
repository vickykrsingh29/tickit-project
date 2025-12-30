import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { FaAngleRight, FaAngleLeft, FaCheck, FaSpinner } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import {
  OrderBasicInfoTab,
  OrderItemsTab,
  AdditionalDetailsTab,
  AdditionalCostTab,
  LiaisoningTab,
  DocumentsTab,
  OrderFormTable
} from "../sections";
import Spinner from "../../utils/Spinner";
import { CustomerOption, POCOption } from "../types";
import { LicenseType } from "../../../types/LicenseType";
import {
  useOrderForm,
  useOrderDetails,
  useSubmitOrderForm
} from "../hooks";

const EditOrderForm: React.FC = () => {
  const history = useHistory();
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber || location.pathname.split('/').pop() || '';
  const { getAccessTokenSilently, user } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [pocId, setPocId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [isLoadingPOCs, setIsLoadingPOCs] = useState(false);
  const [pocsLoadedForCustomerId, setPocsLoadedForCustomerId] = useState<string | number | null>(null);

  const orderForm = useOrderForm({ isEditMode: true });

  const [customerPocSet, setCustomerPocSet] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (!customersLoaded) {
      const loadCustomers = async () => {
        try {
          setIsLoadingCustomers(true);
          console.log('Loading customers in EditOrderForm...');
          await orderForm.loadCustomers(getAccessTokenSilently);
          console.log('Customers loaded in EditOrderForm:', orderForm.customers);
          setCustomersLoaded(true);
        } catch (error) {
          console.error('Error loading customers:', error);
          toast.error('Failed to load customers. Please refresh the page.');
        } finally {
          setIsLoadingCustomers(false);
        }
      };

      loadCustomers();
    }
  }, [customersLoaded, getAccessTokenSilently, orderForm]);

  useEffect(() => {
    const selectedCustomer = orderForm.selectedCustomer;
    if (selectedCustomer && selectedCustomer.id && pocsLoadedForCustomerId !== selectedCustomer.id) {
      const loadPoc = async () => {
        try {
          setIsLoadingPOCs(true);
          console.log('Loading POCs for customer in EditOrderForm:', selectedCustomer.id);
          await orderForm.loadPoc(selectedCustomer.id, getAccessTokenSilently);
          console.log('POCs loaded in EditOrderForm:', orderForm.poc);
          setPocsLoadedForCustomerId(selectedCustomer.id);
        } catch (error) {
          console.error('Error loading POCs:', error);
          toast.error('Failed to load contact persons. Please try selecting the customer again.');
        } finally {
          setIsLoadingPOCs(false);
        }
      };

      loadPoc();
    }
  }, [orderForm.selectedCustomer, getAccessTokenSilently, orderForm, pocsLoadedForCustomerId]);

  // Fetch order data when component mounts
  useEffect(() => {
    let isMounted = true; // Flag to track if component is mounted

    // Set a timeout to ensure loading state is cleared after a maximum time
    const loadingTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log('Loading timeout reached, forcing loading state to false');
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    const fetchData = async () => {
      // Prevent multiple fetches
      if (dataFetched) {
        console.log('Data already fetched, skipping fetch');
        // Make sure loading is set to false even if we skip fetching
        if (isLoading && isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }

        console.log(`Fetching order data for order number: ${orderNumber}`);

        const data = await useOrderDetails(orderNumber || '', getAccessTokenSilently);

        // Check if component is still mounted before updating state
        if (!isMounted) {
          console.log('Component unmounted, skipping state updates');
          return;
        }

        if (!data) {
          throw new Error('Failed to fetch order data');
        }

        console.log('Order data fetched successfully:', data);
        setDataFetched(true);

        setCustomerId(data.customerId || null);
        setPocId(data.pocId || null);

        // Load POCs immediately if we have a customer ID
        if (data.customerId) {
          try {
            console.log('Loading POCs for customer in fetchData:', data.customerId);
            await orderForm.loadPoc(data.customerId, getAccessTokenSilently);
            console.log('POCs loaded in fetchData');
            
            // Set pocId again after loading POCs to ensure the POCWhenLoaded effect is triggered
            if (data.pocId) {
              console.log('Setting POC ID again after loading POCs:', data.pocId);
              setPocId(data.pocId);
              
              // Directly find and set the selectedPoc after POCs are loaded
              const foundPoc = orderForm.poc.find((p: POCOption) => p.id === data.pocId);
              if (foundPoc) {
                console.log('Found POC, setting directly:', foundPoc);
                orderForm.handlePocChange(foundPoc);
              } else {
                console.log('Could not find POC with ID:', data.pocId, 'in loaded POCs:', orderForm.poc);
              }
            }
          } catch (error) {
            console.error('Error loading POCs in fetchData:', error);
          }
        }

        orderForm.setOrderNumber(data.orderNumber || '');
        orderForm.setOrderName(data.orderName || '');
        orderForm.setExecutiveName(data.executiveName || '');

        // Format dates properly
        const formatDateForPicker = (dateString: string | undefined): string => {
          if (!dateString) return '';
          
          try {
            // Create a Date object
            const date = new Date(dateString);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              console.warn('Invalid date:', dateString);
              return '';
            }
            
            // Format date as YYYY-MM-DD which is required for date input
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.error('Error formatting date:', error);
            return '';
          }
        };

        const orderCreationDate = formatDateForPicker(data.orderCreationDate);
        const orderDate = formatDateForPicker(data.orderDate);

        console.log('Formatted dates in fetchData:', {
          original: {
            orderCreationDate: data.orderCreationDate,
            orderDate: data.orderDate
          },
          formatted: {
            orderCreationDate,
            orderDate
          }
        });

        orderForm.setOrderCreationDate(orderCreationDate);
        orderForm.setOrderDate(orderDate);
        orderForm.setOrderStatus(data.orderStatus || 'Pending');

        // Set other form fields
        orderForm.setCustomerGST(data.customerGST || '');
        orderForm.setCustomerEmail(data.customerEmail || '');
        orderForm.setCustomerPhone(data.customerPhone || '');
        orderForm.setBillingAddress(data.billingAddress || '');
        orderForm.setShippingAddress(data.shippingAddress || '');
        orderForm.setWpcAddress(data.wpcAddress || '');
        orderForm.setPocEmail(data.pocEmail || '');
        orderForm.setPocPhone(data.pocPhone || '');
        orderForm.setPocDesignation(data.pocDesignation || '');
        orderForm.setPocDepartment(data.pocDepartment || '');
        orderForm.setPaymentTerm(data.paymentTerm || '');
        orderForm.setDeliveryInstruction(data.deliveryInstruction || '');
        orderForm.setModeOfDispatch(data.modeOfDispatch || '');
        orderForm.setWarranty(data.warranty || '');
        orderForm.setOrderRemarks(data.orderRemarks || '');

        // License info
        orderForm.setRequiresLicense(data.requiresLicense || false);
        orderForm.setLicenseType(data.licenseType || '');
        orderForm.setLicenseNumber(data.licenseNumber || '');

        // Format license dates properly
        const licenseIssueDate = data.licenseIssueDate;
        const licenseExpiryDate = data.licenseExpiryDate;

        console.log('Formatted license dates in fetchData:', {
          original: {
            licenseIssueDate: data.licenseIssueDate,
            licenseExpiryDate: data.licenseExpiryDate
          },
          formatted: {
            licenseIssueDate,
            licenseExpiryDate
          }
        });

        orderForm.setLicenseIssueDate(licenseIssueDate || '');
        orderForm.setLicenseExpiryDate(licenseExpiryDate || '');

        orderForm.setLicenseQuantity(data.licenseQuantity || '');
        orderForm.setLiaisoningRemarks(data.liaisoningRemarks || '');
        orderForm.setLiaisoningVerified(data.liaisoningVerified || false);

        // Additional costs
        if ('additionalCost' in data) {
          // Handle additional costs if they're in the nested structure
          const addCost = data.additionalCost as any;
          orderForm.setLiquidatedDamagesInclusive(addCost?.liquidatedDamages?.inclusive || false);
          orderForm.setLiquidatedDamagesAmount(addCost?.liquidatedDamages?.amount || 0);
          orderForm.setFreightChargeInclusive(addCost?.freightCharge?.inclusive || false);
          orderForm.setFreightChargeAmount(addCost?.freightCharge?.amount || 0);
          orderForm.setTransitInsuranceInclusive(addCost?.transitInsurance?.inclusive || false);
          orderForm.setTransitInsuranceAmount(addCost?.transitInsurance?.amount || 0);
          orderForm.setInstallationInclusive(addCost?.installation?.inclusive || false);
          orderForm.setInstallationAmount(addCost?.installation?.amount || 0);
          orderForm.setSecurityDepositInclusive(addCost?.securityDeposit?.inclusive || false);
          orderForm.setSecurityDepositAmount(addCost?.securityDeposit?.amount || 0);
          orderForm.setLiaisoningInclusive(addCost?.liaisoning?.inclusive || false);
          orderForm.setLiaisoningAmount(addCost?.liaisoning?.amount || 0);
        } else {
          // Handle additional costs if they're directly on the order object
          const dataAsAny = data as any;
          orderForm.setLiquidatedDamagesInclusive(dataAsAny.liquidatedDamagesInclusive || false);
          orderForm.setLiquidatedDamagesAmount(dataAsAny.liquidatedDamagesAmount || 0);
          orderForm.setFreightChargeInclusive(dataAsAny.freightChargeInclusive || false);
          orderForm.setFreightChargeAmount(dataAsAny.freightChargeAmount || 0);
          orderForm.setTransitInsuranceInclusive(dataAsAny.transitInsuranceInclusive || false);
          orderForm.setTransitInsuranceAmount(dataAsAny.transitInsuranceAmount || 0);
          orderForm.setInstallationInclusive(dataAsAny.installationInclusive || false);
          orderForm.setInstallationAmount(dataAsAny.installationAmount || 0);
          orderForm.setSecurityDepositInclusive(dataAsAny.securityDepositInclusive || false);
          orderForm.setSecurityDepositAmount(dataAsAny.securityDepositAmount || 0);
          orderForm.setLiaisoningInclusive(dataAsAny.liaisoningInclusive || false);
          orderForm.setLiaisoningAmount(dataAsAny.liaisoningAmount || 0);
        }

        // Set order items if they exist
        if (data.items && data.items.length > 0) {
          const totals = {
            subtotal: data.subtotal || 0,
            taxTotal: data.taxAmount || 0,
            discountTotal: data.discountAmount || 0,
            totalAmount: data.totalAmount || 0,
            additionalCostTotal: data.additionalCostTotal || 0,
            grandTotal: data.grandTotal || 0
          };
          orderForm.handleOrderItemsChange(data.items, totals);
        }

        if (isMounted) {
          setIsLoading(false);
          console.log('Loading state set to false after data processing');
        }

      } catch (error) {
        console.error('Exception in fetchData:', error);
        if (isMounted) {
          setError('Failed to fetch order data. Please try again later.');
          setIsLoading(false);
          console.log('Loading state set to false after error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('Loading state set to false in finally block');
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      console.log('EditOrderForm component unmounted, cleaning up');
      clearTimeout(loadingTimeout);
    };
  }, [orderNumber, getAccessTokenSilently, dataFetched, isLoading]);

  // Set customer and POC when customers are loaded
  useEffect(() => {
    let isMounted = true;

    const setCustomerAndPOC = async () => {
      // Only run this once when customers are loaded and we have a customerId
      if (!isLoading && orderForm.customers.length > 0 && customerId && !customerPocSet && dataFetched) {
        try {
          console.log('Setting customer and POC with customerId:', customerId);
          if (isMounted) {
            setCustomerPocSet(true); // Mark as set to prevent infinite loops
          }

          // Find the customer in the loaded customers list by ID
          const customer = orderForm.customers.find((c: CustomerOption) => c.id === customerId);

          // If not found by ID, try other methods
          if (!customer) {
            console.log('Customer not found by ID, trying alternative methods');
            // Try to find by GST number
            const gstCustomer = orderForm.customers.find((c: CustomerOption) =>
              c.gst === orderForm.customerGST ||
              c.gstNumber === orderForm.customerGST
            );

            if (gstCustomer) {
              console.log('Customer found by GST number');
              if (isMounted) {
                // Pass true to skipPOCClear to prevent clearing POC data during edit mode load
                await handleCustomerChange(gstCustomer);
              }
            } else {
              // Try to find by email or phone
              const fallbackCustomer = orderForm.customers.find((c: CustomerOption) =>
                (c.email && c.email === orderForm.customerEmail) ||
                (c.phone && c.phone === orderForm.customerPhone)
              );

              if (fallbackCustomer) {
                console.log('Customer found by email or phone');
                if (isMounted) {
                  // Pass true to skipPOCClear to prevent clearing POC data during edit mode load
                  await handleCustomerChange(fallbackCustomer);
                }
              } else {
                console.log('Could not find matching customer');
              }
            }
          } else {
            console.log('Customer found by ID');
            // Set the selected customer
            if (isMounted) {
              // Pass true to skipPOCClear to prevent clearing POC data during edit mode load
              await handleCustomerChange(customer);
            }
          }

          // Find and set the POC if pocId exists
          if (pocId && isMounted) {
            // Ensure POCs are loaded for this customer before trying to set the POC
            if (orderForm.poc.length === 0) {
              console.log('POCs not loaded yet, loading them now');
              try {
                await orderForm.loadPoc(customerId, getAccessTokenSilently);
                console.log('POCs loaded in setCustomerAndPOC');
              } catch (error) {
                console.error('Error loading POCs in setCustomerAndPOC:', error);
              }
            }

            // Now try to find the POC by ID
            if (orderForm.poc.length > 0) {
              const poc = orderForm.poc.find((p: POCOption) => p.id === pocId);

              if (poc) {
                console.log('POC found by ID:', poc);
                orderForm.handlePocChange(poc);
              } else {
                console.log('POC not found by ID');
              }
            } else {
              console.log('No POCs available to set');
            }
          }
        } catch (error) {
          console.error('Error setting customer and POC:', error);
        }
      }
    };

    setCustomerAndPOC();

    return () => {
      isMounted = false;
    };
  }, [isLoading, customerId, pocId, orderForm.customers.length, orderForm.poc.length, customerPocSet, dataFetched, orderForm.customerGST, orderForm.customerEmail, orderForm.customerPhone, orderForm.pocEmail, orderForm.pocPhone, getAccessTokenSilently]);

  // Set executive name if not present
  useEffect(() => {
    let isMounted = true;

    if (!isLoading && (!orderForm.executiveName || orderForm.executiveName === '') && user && dataFetched && isMounted) {
      console.log('Setting executive name from Auth0 in edit mode');
      const name = user.given_name || user.name || '';
      orderForm.setExecutiveName(name);
    }

    return () => {
      isMounted = false;
    };
  }, [isLoading, user, orderForm.executiveName, dataFetched]);

  // Find and set the POC if we have its ID and POCs are loaded
  useEffect(() => {
    if (pocId && orderForm.poc.length > 0 && !orderForm.selectedPoc && dataFetched) {
      console.log('We have pocId and POCs but no selectedPoc, attempting to set POC directly');
      const foundPoc = orderForm.poc.find((p: POCOption) => p.id === pocId);
      if (foundPoc) {
        console.log('Found POC to set directly:', foundPoc);
        orderForm.handlePocChange(foundPoc);
      } else {
        console.log('Could not find POC with ID:', pocId, 'in POCs:', orderForm.poc);
      }
    }
  }, [pocId, orderForm.poc, orderForm.selectedPoc, orderForm.handlePocChange, dataFetched]);

  // Add validateOrderForm function
  const validateOrderForm = (): string[] => {
    const errors: string[] = [];

    // Basic validation
    if (!orderForm.orderNumber) {
      errors.push('Order number is required');
    }

    if (!orderForm.orderName) {
      errors.push('Order name is required');
    }

    if (!orderForm.executiveName) {
      errors.push('Executive name is required');
    }

    // Validate customer information
    if (!customerId) {
      errors.push('Customer is required');
    }

    // Validate items
    if (!orderForm.orderItems || orderForm.orderItems.length === 0) {
      errors.push('At least one order item is required');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate form data
      const validationErrors = validateOrderForm();
      if (validationErrors.length > 0) {
        setSubmitError(validationErrors.join(', '));
        toast.error('Please fix the validation errors before submitting.');
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting order form...');

      const orderData = {
        // Basic order information
        orderNumber: orderForm.orderNumber,
        orderName: orderForm.orderName,
        executiveName: orderForm.executiveName,
        orderCreationDate: orderForm.orderCreationDate,
        orderDate: orderForm.orderDate,
        orderStatus: orderForm.orderStatus,

        // Customer information
        customerId: customerId || undefined,
        customerName: orderForm.selectedCustomer?.label || '',
        customerGST: orderForm.customerGST,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,

        // POC information
        pocId: pocId || undefined,
        pocName: orderForm.selectedPoc?.label || '',
        pocEmail: orderForm.pocEmail,
        pocPhone: orderForm.pocPhone,
        pocDesignation: orderForm.pocDesignation,
        pocDepartment: orderForm.pocDepartment,

        // Address information
        billingAddress: orderForm.billingAddress,
        shippingAddress: orderForm.shippingAddress,
        wpcAddress: orderForm.wpcAddress,

        // Payment and delivery information
        paymentTerm: orderForm.paymentTerm,
        deliveryInstruction: orderForm.deliveryInstruction,
        modeOfDispatch: orderForm.modeOfDispatch,
        warranty: orderForm.warranty,
        orderRemarks: orderForm.orderRemarks,

        // License information
        requiresLicense: orderForm.requiresLicense,
        licenseType: orderForm.licenseType,
        licenseNumber: orderForm.licenseNumber,
        licenseIssueDate: orderForm.licenseIssueDate,
        licenseExpiryDate: orderForm.licenseExpiryDate,
        licenseQuantity: orderForm.licenseQuantity,
        liaisoningRemarks: orderForm.liaisoningRemarks,
        liaisoningVerified: orderForm.liaisoningVerified,

        // Additional costs
        liquidatedDamagesInclusive: orderForm.liquidatedDamagesInclusive,
        liquidatedDamagesAmount: orderForm.liquidatedDamagesAmount,
        freightChargeInclusive: orderForm.freightChargeInclusive,
        freightChargeAmount: orderForm.freightChargeAmount,
        transitInsuranceInclusive: orderForm.transitInsuranceInclusive,
        transitInsuranceAmount: orderForm.transitInsuranceAmount,
        installationInclusive: orderForm.installationInclusive,
        installationAmount: orderForm.installationAmount,
        securityDepositInclusive: orderForm.securityDepositInclusive,
        securityDepositAmount: orderForm.securityDepositAmount,
        liaisoningInclusive: orderForm.liaisoningInclusive,
        liaisoningAmount: orderForm.liaisoningAmount,

        // Order items
        items: orderForm.orderItems || [],

        // Files - use the correct field names expected by the backend
        documents: orderForm.documents || [],
        attachments: [], // No direct equivalent in orderForm
        performanceBankGuarantee: orderForm.performanceBankGuarantee || null,
      };

      console.log('Order data prepared for submission:', orderData);

      // Submit the form
      const result = await useSubmitOrderForm(
        orderData,
        getAccessTokenSilently,
        orderNumber || ''
      );

      if (result.success) {
        toast.success(result.message);
        // Navigate to the order detail page
        history.push(`/orders/${orderNumber}`);
      } else {
        setSubmitError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setSubmitError(errorMessage);
      toast.error(`Failed to submit order: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceRefresh = () => {
    console.log('Force refreshing data...');
    setDataFetched(false);
    setCustomerPocSet(false);
    setIsLoading(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="large" color="blue-500" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-4xl mx-auto mb-4">⚠️</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => history.push('/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Add a more efficient function to handle field updates
  const handleFieldUpdate = (field: string, value: string | number | boolean): void => {
    console.log(`Updating field ${field} with value:`, value);
    
    // Get the setter function name based on the field name
    const setterName = `set${field.charAt(0).toUpperCase() + field.slice(1)}`;
    
    // Type assertion to handle dynamic property access
    const setter = orderForm[setterName as keyof typeof orderForm];
    
    // Check if the setter function exists in orderForm
    if (typeof setter === 'function') {
      // Call the appropriate setter function dynamically
      (setter as Function)(value);
    } else {
      console.warn(`No setter found for field: ${field}`);
    }
  };

  // Handle customer change with additional logic for edit mode
  const handleCustomerChange = (customer: CustomerOption) => {
    console.log('Handling customer change in EditOrderForm:', customer);

    // Check if this is the initial load in edit mode
    const isInitialLoad = dataFetched && !customerPocSet;
    
    // Use the orderForm's handleCustomerChange to update all related fields
    // Pass true to skipPOCClear during initial load in edit mode
    orderForm.handleCustomerChange(customer, isInitialLoad);

    // Update the customerId state
    setCustomerId(customer.id as number);

    // Only clear the POC if this is an explicit customer change by the user (not during initial load)
    if (!isInitialLoad) {
      console.log('Customer changed after initial load, clearing POC data');
      setPocId(null);
      // This is a user-initiated change, so we should clear the selected POC as well
      if (orderForm.selectedPoc) {
        orderForm.handlePocChange(null); // This will clear all POC fields in the form
      }
    } else {
      console.log('Initial customer load in edit mode, preserving POC data');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl mx-auto max-w-6xl my-8">
      <div className="bg-[#057dcd] rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white">Edit Order</h1>
        <p className="text-blue-100">
          Fill in the details to edit the order
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-green-600 h-1 transition-all duration-300"
          style={{
            width: `${(
              (orderForm.activeTab === "basicInfo" ? 1 :
                orderForm.activeTab === "orderItems" ? 2 :
                  orderForm.activeTab === "additionalDetails" ? 3 :
                    orderForm.activeTab === "additionalCost" ? 4 :
                      orderForm.activeTab === "liaisoning" ? 5 :
                        orderForm.activeTab === "documents" ? 6 : 0) / 6) * 100}%`
          }}
        />
      </div>
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => history.push('/orders')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {isLoading && !dataFetched && (
            <div className="flex justify-center items-center h-64">
              <Spinner size="large" />
              <span className="ml-2">Loading order data...</span>
            </div>
          )}

          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="px-40 flex space-x-8 items-center justify-between">
                <button
                  onClick={() => orderForm.setActiveTab("basicInfo")}
                  className={`${orderForm.activeTab === "basicInfo"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => orderForm.setActiveTab("orderItems")}
                  className={`${orderForm.activeTab === "orderItems"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Order Items
                </button>
                <button
                  onClick={() => orderForm.setActiveTab("additionalDetails")}
                  className={`${orderForm.activeTab === "additionalDetails"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Additional Details
                </button>
                <button
                  onClick={() => orderForm.setActiveTab("additionalCost")}
                  className={`${orderForm.activeTab === "additionalCost"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Additional Cost
                </button>
                <button
                  onClick={() => orderForm.setActiveTab("liaisoning")}
                  className={`${orderForm.activeTab === "liaisoning"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Liaisoning
                </button>
                <button
                  onClick={() => orderForm.setActiveTab("documents")}
                  className={`${orderForm.activeTab === "documents"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Documents
                </button>
              </nav>
            </div>

              <div className="mt-8 bg-white shadow rounded-lg p-6">
                {console.log('ORDER FORM:', orderForm)}
              {orderForm.activeTab === "basicInfo" && (
                <OrderBasicInfoTab
                  customers={orderForm.customers || []}
                  selectedCustomer={orderForm.selectedCustomer}
                  handleCustomerChange={handleCustomerChange}
                  poc={orderForm.poc || []}
                  selectedPoc={orderForm.selectedPoc}
                  handlePocChange={orderForm.handlePocChange}
                  onCustomerAdded={orderForm.handleCustomerAdded}
                  onPocAdded={orderForm.handlePocAdded}
                  selectStyles={orderForm.selectStyles}
                  orderNumber={orderForm.orderNumber}
                  setOrderNumber={(value) => handleFieldUpdate('orderNumber', value)}
                  orderName={orderForm.orderName}
                  setOrderName={(value) => handleFieldUpdate('orderName', value)}
                  executiveName={orderForm.executiveName}
                  setExecutiveName={(value) => handleFieldUpdate('executiveName', value)}
                  orderCreationDate={orderForm.orderCreationDate}
                  setOrderCreationDate={(value) => handleFieldUpdate('orderCreationDate', value)}
                  orderDate={orderForm.orderDate}
                  setOrderDate={(value) => handleFieldUpdate('orderDate', value)}
                  orderStatus={orderForm.orderStatus}
                  setOrderStatus={(value) => handleFieldUpdate('orderStatus', value)}
                  customerGST={orderForm.customerGST}
                  setCustomerGST={(value) => handleFieldUpdate('customerGST', value)}
                  customerEmail={orderForm.customerEmail}
                  setCustomerEmail={(value) => handleFieldUpdate('customerEmail', value)}
                  customerPhone={orderForm.customerPhone}
                  setCustomerPhone={(value) => handleFieldUpdate('customerPhone', value)}
                  billingAddress={orderForm.billingAddress}
                  setBillingAddress={(value) => handleFieldUpdate('billingAddress', value)}
                  shippingAddress={orderForm.shippingAddress}
                  setShippingAddress={(value) => handleFieldUpdate('shippingAddress', value)}
                  wpcAddress={orderForm.wpcAddress}
                  setWpcAddress={(value) => handleFieldUpdate('wpcAddress', value)}
                  pocEmail={orderForm.pocEmail}
                  setPocEmail={(value) => handleFieldUpdate('pocEmail', value)}
                  pocPhone={orderForm.pocPhone}
                  setPocPhone={(value) => handleFieldUpdate('pocPhone', value)}
                  pocDesignation={orderForm.pocDesignation}
                  setPocDesignation={(value) => handleFieldUpdate('pocDesignation', value)}
                  pocDepartment={orderForm.pocDepartment}
                  setPocDepartment={(value) => handleFieldUpdate('pocDepartment', value)}
                  isGeneratingOrderNumber={orderForm.isGeneratingOrderNumber}
                  generateOrderNumber={orderForm.generateNewOrderNumber}
                />
              )}
              {orderForm.activeTab === "orderItems" && (
                <OrderItemsTab
                  OrderFormTable={OrderFormTable}
                  orderFormTableRef={orderForm.orderFormTableRef}
                  initialItems={orderForm.orderItems || []}
                  onItemsChange={orderForm.handleOrderItemsChange}
                />
              )}
              {orderForm.activeTab === "additionalDetails" && (
                <AdditionalDetailsTab
                  paymentTerm={orderForm.paymentTerm || ''}
                  setPaymentTerm={(value: string) => handleFieldUpdate('paymentTerm', value)}
                  modeOfDispatch={orderForm.modeOfDispatch || ''}
                  setModeOfDispatch={(value: string) => handleFieldUpdate('modeOfDispatch', value)}
                  deliveryInstruction={orderForm.deliveryInstruction || ''}
                  setDeliveryInstruction={(value: string) => handleFieldUpdate('deliveryInstruction', value)}
                  warranty={orderForm.warranty || ''}
                  setWarranty={(value: string) => handleFieldUpdate('warranty', value)}
                  orderRemarks={orderForm.orderRemarks || ''}
                  setOrderRemarks={(value: string) => handleFieldUpdate('orderRemarks', value)}
                />
              )}
              {orderForm.activeTab === "additionalCost" && (
                <AdditionalCostTab
                  liquidatedDamagesInclusive={orderForm.liquidatedDamagesInclusive}
                  setLiquidatedDamagesInclusive={(value: boolean) => handleFieldUpdate('liquidatedDamagesInclusive', value)}
                  liquidatedDamagesAmount={orderForm.liquidatedDamagesAmount}
                  setLiquidatedDamagesAmount={(value: number) => handleFieldUpdate('liquidatedDamagesAmount', value)}
                  freightChargeInclusive={orderForm.freightChargeInclusive}
                  setFreightChargeInclusive={(value: boolean) => handleFieldUpdate('freightChargeInclusive', value)}
                  freightChargeAmount={orderForm.freightChargeAmount}
                  setFreightChargeAmount={(value: number) => handleFieldUpdate('freightChargeAmount', value)}
                  transitInsuranceInclusive={orderForm.transitInsuranceInclusive}
                  setTransitInsuranceInclusive={(value: boolean) => handleFieldUpdate('transitInsuranceInclusive', value)}
                  transitInsuranceAmount={orderForm.transitInsuranceAmount}
                  setTransitInsuranceAmount={(value: number) => handleFieldUpdate('transitInsuranceAmount', value)}
                  installationInclusive={orderForm.installationInclusive}
                  setInstallationInclusive={(value: boolean) => handleFieldUpdate('installationInclusive', value)}
                  installationAmount={orderForm.installationAmount}
                  setInstallationAmount={(value: number) => handleFieldUpdate('installationAmount', value)}
                  securityDepositInclusive={orderForm.securityDepositInclusive}
                  setSecurityDepositInclusive={(value: boolean) => handleFieldUpdate('securityDepositInclusive', value)}
                  securityDepositAmount={orderForm.securityDepositAmount}
                  setSecurityDepositAmount={(value: number) => handleFieldUpdate('securityDepositAmount', value)}
                  liaisoningInclusive={orderForm.liaisoningInclusive}
                  setLiaisoning={(value: boolean) => handleFieldUpdate('liaisoning', value)}
                  liaisoningAmount={orderForm.liaisoningAmount}
                  setLiaisoningAmount={(value: number) => handleFieldUpdate('liaisoningAmount', value)}
                />
              )}
              {orderForm.activeTab === "liaisoning" && (
                <LiaisoningTab
                  requiresLicense={orderForm.requiresLicense}
                  setRequiresLicense={(value: boolean) => handleFieldUpdate('requiresLicense', value)}
                  licenseType={orderForm.licenseType}
                  setLicenseType={(value: any) => handleFieldUpdate('licenseType', value)}
                  licenseNumber={orderForm.licenseNumber || ''}
                  setLicenseNumber={(value: string) => handleFieldUpdate('licenseNumber', value)}
                  wpcAddress={orderForm.wpcAddress || ''}
                  setWpcAddress={(value: string) => handleFieldUpdate('wpcAddress', value)}
                  licenseIssueDate={orderForm.licenseIssueDate || ''}
                  setLicenseIssueDate={(value: string) => handleFieldUpdate('licenseIssueDate', value)}
                  licenseExpiryDate={orderForm.licenseExpiryDate || ''}
                  setLicenseExpiryDate={(value: string) => handleFieldUpdate('licenseExpiryDate', value)}
                  licenseQuantity={orderForm.licenseQuantity || ''}
                  setLicenseQuantity={(value: string) => handleFieldUpdate('licenseQuantity', value)}
                  liaisoningRemarks={orderForm.liaisoningRemarks || ''}
                  setLiaisoningRemarks={(value: string) => handleFieldUpdate('liaisoningRemarks', value)}
                  liaisoningVerified={orderForm.liaisoningVerified}
                  setLiaisoningVerified={(value: boolean) => handleFieldUpdate('liaisoningVerified', value)}
                />
              )}
              {orderForm.activeTab === "documents" && (
                <DocumentsTab
                  documents={orderForm.documents || []}
                  setDocuments={orderForm.setDocuments}
                  performanceBankGuarantee={orderForm.performanceBankGuarantee}
                  setPerformanceBankGuarantee={orderForm.setPerformanceBankGuarantee}
                />
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between px-6 pb-10">
            <button
              type="button"
              onClick={() => history.push('/orders')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
            >
              Cancel
            </button>


            <div className="flex space-x-4">
              <button
                onClick={orderForm.handlePreviousTab}
                disabled={orderForm.isFirstTab()}
                className={`flex items-center px-4 py-2 rounded-md ${orderForm.isFirstTab()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <FaAngleLeft className="mr-2" />
                Previous
              </button>

              {orderForm.isLastTab() ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Submit Order
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={orderForm.handleNextTab}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next
                  <FaAngleRight className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditOrderForm;