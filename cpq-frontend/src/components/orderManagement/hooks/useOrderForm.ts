import { useState, useRef, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomers } from './useCustomers';
import { usePOC } from './usePOC';
import { useGenerateOrderNumber } from './useGenerateOrderNumber';
import { useSubmitOrderForm as useSubmitOrderFormHook } from './useSubmitOrderForm';
import { useOrderDetails } from './useOrderDetails';
import { calculateAdditionalCostsTotal, initializeFormState } from './utils';
import { GetTokenSilently } from './apiUtils';
import { OrderFormReturn } from '../types';
import { OrderItem, OrderTotals } from '../types/OrderItems';
import OrderFormData from '../types/OrderFormData';
import { CustomerOption } from '../types/OrderOptionTypes';
import { POCOption } from '../types/OrderOptionTypes';
import { LicenseType } from '../../../types/LicenseType';

interface UseOrderFormProps {
  isEditMode?: boolean;
  orderNumberProp?: string;
}

/**
 * Hook for managing the entire order form state and operations
 * @param props Configuration options for the hook
 * @returns All state and functions needed for the order form
 */
export const useOrderForm = (props?: UseOrderFormProps): OrderFormReturn => {
  const { isEditMode = false, orderNumberProp = '' } = props || {};
  const history = useHistory();
  const { getAccessTokenSilently, user } = useAuth0();

  // Form tabs management
  const [activeTab, setActiveTab] = useState('basicInfo');
  const orderFormTableRef = useRef<any>(null);

  // Loading and data tracking states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [customerPocSet, setCustomerPocSet] = useState(false);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [pocsLoadedForCustomerId, setPocsLoadedForCustomerId] = useState<string | number | null>(null);

  // Customer and POC data
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerGST, setCustomerGST] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [poc, setPoc] = useState<POCOption[]>([]);
  const [selectedPoc, setSelectedPoc] = useState<POCOption | null>(null);
  const [pocId, setPocId] = useState<number | null>(null);
  const [pocEmail, setPocEmail] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [pocDesignation, setPocDesignation] = useState('');
  const [pocDepartment, setPocDepartment] = useState('');

  // Order basic info
  const [orderNum, setOrderNum] = useState(orderNumberProp);
  const [orderName, setOrderName] = useState('');
  const [executiveName, setExecutiveName] = useState('');
  const [orderCreationDate, setOrderCreationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [orderStatus, setOrderStatus] = useState('');

  // Addresses
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [wpcAddress, setWpcAddress] = useState('');

  // Order settings
  const [paymentTerm, setPaymentTerm] = useState('');
  const [deliveryInstruction, setDeliveryInstruction] = useState('');
  const [modeOfDispatch, setModeOfDispatch] = useState('');
  const [warranty, setWarranty] = useState('');
  const [orderRemarks, setOrderRemarks] = useState('');

  // License and liaisoning
  const [requiresLicense, setRequiresLicense] = useState(false);
  const [licenseType, setLicenseType] = useState<LicenseType>('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseIssueDate, setLicenseIssueDate] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [licenseQuantity, setLicenseQuantity] = useState('');
  const [liaisoningRemarks, setLiaisoningRemarks] = useState('');
  const [liaisoningVerified, setLiaisoningVerified] = useState(false);

  // Additional costs
  const [liquidatedDamagesInclusive, setLiquidatedDamagesInclusive] = useState(false);
  const [liquidatedDamagesAmount, setLiquidatedDamagesAmount] = useState(0);
  const [freightChargeInclusive, setFreightChargeInclusive] = useState(false);
  const [freightChargeAmount, setFreightChargeAmount] = useState(0);
  const [transitInsuranceInclusive, setTransitInsuranceInclusive] = useState(false);
  const [transitInsuranceAmount, setTransitInsuranceAmount] = useState(0);
  const [installationInclusive, setInstallationInclusive] = useState(false);
  const [installationAmount, setInstallationAmount] = useState(0);
  const [securityDepositInclusive, setSecurityDepositInclusive] = useState(false);
  const [securityDepositAmount, setSecurityDepositAmount] = useState(0);
  const [liaisoningInclusive, setLiaisoningInclusive] = useState(false);
  const [liaisoningAmount, setLiaisoningAmount] = useState(0);

  // Order items and totals
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderTotals, setOrderTotals] = useState<OrderTotals>({
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    totalAmount: 0,
    additionalCostTotal: 0,
    grandTotal: 0
  });

  // Documents
  const [documents, setDocuments] = useState<File[]>([]);
  const [performanceBankGuarantee, setPerformanceBankGuarantee] = useState<File | null>(null);

  /**
   * Loads customers from the API
   */
  const loadCustomers = useCallback(async (getAccessTokenSilently: () => Promise<string>) => {
    console.log('Starting loadCustomers');

    try {
      setIsLoading(true);
      const customersData = await useCustomers(getAccessTokenSilently);

      if (customers.length !== customersData.length) {
        console.log('Customers count changed, updating state');
        setCustomers(customersData);
        setCustomersLoaded(true);
      } else {
        const currentIds = new Set(customers.map(c => c.id));
        const newIds = new Set(customersData.map(c => c.id));

        let isDifferent = false;
        for (const id of currentIds) {
          if (!newIds.has(id)) {
            isDifferent = true;
            break;
          }
        }

        for (const id of newIds) {
          if (!currentIds.has(id)) {
            isDifferent = true;
            break;
          }
        }

        if (isDifferent) {
          setCustomers(customersData);
          setCustomersLoaded(true);
        } else {
          setCustomersLoaded(true);
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customers]);

  /**
   * Loads POCs for a selected customer
   */
  const loadPoc = useCallback(async (
    customerId: string | number,
    getAccessTokenSilently: () => Promise<string>
  ) => {
    if (!customerId) {
      console.log('No customerId provided to loadContactPersons, skipping');
      return;
    }

    if (pocsLoadedForCustomerId === customerId) {
      console.log(`POCs already loaded for customerId: ${customerId}, skipping`);
      return;
    }

    try {
      setIsLoading(true);
      const pocsData = await usePOC(customerId, getAccessTokenSilently);

      setPoc(pocsData);
      setPocsLoadedForCustomerId(customerId);

    } catch (error) {
      console.error('Error loading POCs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [poc, pocsLoadedForCustomerId]);

  /**
   * Generates a new order number
   */
  const generateNewOrderNumber = useCallback(async (
    customerId: string,
    getAccessTokenSilently: () => Promise<string>
  ) => {
    try {
      setIsLoading(true);
      const newOrderNumber = await useGenerateOrderNumber(customerId, getAccessTokenSilently);

      if (newOrderNumber) {
        setOrderNum(newOrderNumber);
        return newOrderNumber;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error generating order number:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles customer selection change with additional logic for order number generation
   */
  const handleCustomerChange = useCallback(async (selectedOption: CustomerOption | null, skipPOCClear: boolean = false) => {
    console.log('Handling customer change:', selectedOption, 'skipPOCClear:', skipPOCClear);
    setSelectedCustomer(selectedOption);

    if (selectedOption) {
      // Set customer ID
      setCustomerId(selectedOption.id as number);

      // Auto-fill all customer-related fields
      setCustomerGST(selectedOption.gstNumber || '');
      setCustomerEmail(selectedOption.email || '');
      setCustomerPhone(selectedOption.phone || '');

      // Auto-fill all address fields
      setBillingAddress(selectedOption.billingAddress || '');
      setShippingAddress(selectedOption.shippingAddress || '');
      setWpcAddress(selectedOption.wpcAddress || '');

      // Only clear POC fields when customer changes and skipPOCClear is false
      // This allows us to preserve POC data during edit mode initial load
      if (!skipPOCClear) {
        console.log('Clearing POC fields because customer changed and skipPOCClear is false');
        setSelectedPoc(null);
        setPocId(null);
        setPocEmail('');
        setPocPhone('');
        setPocDesignation('');
        setPocDepartment('');
      } else {
        console.log('Preserving POC fields because skipPOCClear is true');
      }

      // Generate order number if not in edit mode and no order number exists
      if (!isEditMode && (!orderNum || orderNum === '')) {
        try {
          console.log('Generating order number for customer:', selectedOption.id);
          const newOrderNumber = await generateNewOrderNumber(
            selectedOption.id?.toString() || '',
            getAccessTokenSilently
          );
          console.log('Generated order number:', newOrderNumber);
        } catch (error) {
          console.error('Error generating order number:', error);
          toast.error('Failed to generate order number. Please try again.');
        }
      }

      if (selectedOption.id) {
        await loadPoc(selectedOption.id, getAccessTokenSilently);
      }
    } else {
      console.log('Customer selection cleared, clearing all customer fields');
      // Clear all customer-related fields if no customer is selected
      setCustomerId(null);
      setCustomerGST('');
      setCustomerEmail('');
      setCustomerPhone('');
      setBillingAddress('');
      setShippingAddress('');
      setWpcAddress('');
      
      // Always clear POC fields when customer is cleared
      setSelectedPoc(null);
      setPocId(null);
      setPocEmail('');
      setPocPhone('');
      setPocDesignation('');
      setPocDepartment('');
    }
  }, [isEditMode, orderNum, generateNewOrderNumber, getAccessTokenSilently, loadPoc]);

  /**
   * Handles POC selection change with additional state updates
   */
  const handlePocChange = useCallback((selectedOption: POCOption | null) => {
    console.log('Handling POC change:', selectedOption);

    if (selectedOption) {
      // Set POC ID
      setPocId(selectedOption.id as number);
      
      // Set the selectedPoc explicitly
      setSelectedPoc(selectedOption);

      // Auto-fill all POC-related fields
      setPocEmail(selectedOption.email || '');
      setPocPhone(selectedOption.phone || '');
      setPocDesignation(selectedOption.designation || '');
      setPocDepartment(selectedOption.department || '');

      console.log('Auto-filled POC fields:', {
        id: selectedOption.id,
        email: selectedOption.email,
        phone: selectedOption.phone,
        designation: selectedOption.designation,
        department: selectedOption.department
      });
    } else {
      console.log('Clearing POC fields because selectedOption is null');
      
      // Clear all POC-related fields if no POC is selected
      setPocId(null);
      setSelectedPoc(null);
      setPocEmail('');
      setPocPhone('');
      setPocDesignation('');
      setPocDepartment('');
    }
  }, []);

  /**
   * Handles order items change
   */
  const handleOrderItemsChange = useCallback((
    items: OrderItem[],
    totals: OrderTotals
  ) => {
    console.log('Order items changed:', items);
    console.log('Order totals before additional costs:', totals);
    
    setOrderItems(items);

    // Update order totals with additional costs
    const additionalCostTotal = calculateAdditionalCostsTotal({
      liquidatedDamagesInclusive,
      liquidatedDamagesAmount,
      freightChargeInclusive,
      freightChargeAmount,
      transitInsuranceInclusive,
      transitInsuranceAmount,
      installationInclusive,
      installationAmount,
      securityDepositInclusive,
      securityDepositAmount,
      liaisoningInclusive,
      liaisoningAmount
    });

    // Calculate grand total as items total + additional costs
    const grandTotal = Number(totals.totalAmount || 0) + Number(additionalCostTotal || 0);

    console.log('Additional cost calculation:', {
      liquidatedDamages: !liquidatedDamagesInclusive ? liquidatedDamagesAmount : 0,
      freightCharge: !freightChargeInclusive ? freightChargeAmount : 0,
      transitInsurance: !transitInsuranceInclusive ? transitInsuranceAmount : 0,
      installation: !installationInclusive ? installationAmount : 0,
      securityDeposit: !securityDepositInclusive ? securityDepositAmount : 0,
      liaisoning: !liaisoningInclusive ? liaisoningAmount : 0,
      additionalCostTotal: additionalCostTotal,
      itemsTotal: totals.totalAmount,
      calculatedGrandTotal: grandTotal
    });

    // Ensure all totals are properly set
    const updatedTotals = {
      ...totals,
      additionalCostTotal,
      grandTotal
    };
    
    console.log('Updated order totals with additional costs:', updatedTotals);
    setOrderTotals(updatedTotals);
  }, [
    liquidatedDamagesInclusive,
    liquidatedDamagesAmount,
    freightChargeInclusive,
    freightChargeAmount,
    transitInsuranceInclusive,
    transitInsuranceAmount,
    installationInclusive,
    installationAmount,
    securityDepositInclusive,
    securityDepositAmount,
    liaisoningInclusive,
    liaisoningAmount
  ]);

  // Load customers when component mounts
  useEffect(() => {
    if (!customersLoaded) {
      loadCustomers(getAccessTokenSilently);
    }
  }, [customersLoaded, loadCustomers, getAccessTokenSilently]);

  // Load order details for edit mode
  useEffect(() => {
    let isMounted = true;

    if (isEditMode && orderNumberProp && !dataFetched) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          console.log(`Fetching order data for order number: ${orderNumberProp}`);

          const data = await useOrderDetails(orderNumberProp, getAccessTokenSilently);

          if (!isMounted) return;

          if (!data) {
            throw new Error('Failed to fetch order data');
          }

          console.log('Order data fetched successfully:', data);
          setDataFetched(true);

          setCustomerId(data.customerId || null);
          setPocId(data.pocId || null);

          // Ensure we load POCs when in edit mode with customer ID
          if (data.customerId) {
            await loadPoc(data.customerId, getAccessTokenSilently);
          }

          setOrderNum(data.orderNumber || '');
          setOrderName(data.orderName || '');
          setExecutiveName(data.executiveName || '');

          setOrderCreationDate(data.orderCreationDate || '');
          setOrderDate(data.orderDate || '');

          setCustomerGST(data.customerGST || '');
          setCustomerEmail(data.customerEmail || '');
          setCustomerPhone(data.customerPhone || '');
          setBillingAddress(data.billingAddress || '');
          setShippingAddress(data.shippingAddress || '');
          setWpcAddress(data.wpcAddress || '');
          setPocEmail(data.pocEmail || '');
          setPocPhone(data.pocPhone || '');
          setPocDesignation(data.pocDesignation || '');
          setPocDepartment(data.pocDepartment || '');
          setPaymentTerm(data.paymentTerm || '');
          setDeliveryInstruction(data.deliveryInstruction || '');
          setModeOfDispatch(data.modeOfDispatch || '');
          setWarranty(data.warranty || '');
          setOrderRemarks(data.orderRemarks || '');

          setRequiresLicense(data.requiresLicense || false);
          setLicenseType(data.licenseType || '');
          setLicenseNumber(data.licenseNumber || '');
          setLicenseIssueDate(data.licenseIssueDate || '');
          setLicenseExpiryDate(data.licenseExpiryDate || '');
          setLicenseQuantity(data.licenseQuantity || '');
          setLiaisoningRemarks(data.liaisoningRemarks || '');
          setLiaisoningVerified(data.liaisoningVerified || false);

          // Additional costs
          if ('additionalCost' in data) {
            // Handle additional costs if they're in the nested structure
            const addCost = data.additionalCost as any;
            setLiquidatedDamagesInclusive(addCost?.liquidatedDamages?.inclusive || false);
            setLiquidatedDamagesAmount(addCost?.liquidatedDamages?.amount || 0);
            setFreightChargeInclusive(addCost?.freightCharge?.inclusive || false);
            setFreightChargeAmount(addCost?.freightCharge?.amount || 0);
            setTransitInsuranceInclusive(addCost?.transitInsurance?.inclusive || false);
            setTransitInsuranceAmount(addCost?.transitInsurance?.amount || 0);
            setInstallationInclusive(addCost?.installation?.inclusive || false);
            setInstallationAmount(addCost?.installation?.amount || 0);
            setSecurityDepositInclusive(addCost?.securityDeposit?.inclusive || false);
            setSecurityDepositAmount(addCost?.securityDeposit?.amount || 0);
            setLiaisoningInclusive(addCost?.liaisoning?.inclusive || false);
            setLiaisoningAmount(addCost?.liaisoning?.amount || 0);
          } else {
            // Handle additional costs if they're directly on the order object
            const dataAsAny = data as any;
            setLiquidatedDamagesInclusive(dataAsAny.liquidatedDamagesInclusive || false);
            setLiquidatedDamagesAmount(dataAsAny.liquidatedDamagesAmount || 0);
            setFreightChargeInclusive(dataAsAny.freightChargeInclusive || false);
            setFreightChargeAmount(dataAsAny.freightChargeAmount || 0);
            setTransitInsuranceInclusive(dataAsAny.transitInsuranceInclusive || false);
            setTransitInsuranceAmount(dataAsAny.transitInsuranceAmount || 0);
            setInstallationInclusive(dataAsAny.installationInclusive || false);
            setInstallationAmount(dataAsAny.installationAmount || 0);
            setSecurityDepositInclusive(dataAsAny.securityDepositInclusive || false);
            setSecurityDepositAmount(dataAsAny.securityDepositAmount || 0);
            setLiaisoningInclusive(dataAsAny.liaisoningInclusive || false);
            setLiaisoningAmount(dataAsAny.liaisoningAmount || 0);
          }

          if (data.items && data.items.length > 0) {
            const totals = {
              subtotal: data.subtotal || 0,
              taxTotal: data.taxAmount || 0,
              discountTotal: data.discountAmount || 0,
              totalAmount: data.totalAmount || 0,
              additionalCostTotal: data.additionalCostTotal || 0,
              grandTotal: data.grandTotal || 0
            };
            handleOrderItemsChange(data.items, totals);
          }
        } catch (error) {
          console.error('Error in fetchData:', error);
          if (isMounted) {
            toast.error('Failed to fetch order data');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [isEditMode, orderNumberProp, dataFetched, getAccessTokenSilently, handleOrderItemsChange, loadPoc]);

  useEffect(() => {
    let isMounted = true;

    const setCustomerAndPOC = async () => {
      if (!isLoading && customers.length > 0 && customerId && !customerPocSet && dataFetched) {
        try {
          if (isMounted) {
            setCustomerPocSet(true);
          }

          const customer = customers.find((c: CustomerOption) => c.id === customerId);

          if (customer) {
            if (isMounted) {
              setSelectedCustomer(customer);
            }
          } else {
            // Try to find by email or phone
            const fallbackCustomer = customers.find((c: CustomerOption) =>
              (c.email && c.email === customerEmail) ||
              (c.phone && c.phone === customerPhone)
            );

            if (fallbackCustomer) {
              console.log('Customer found by email or phone');
              if (isMounted) {
                setSelectedCustomer(fallbackCustomer);
              }
            } else {
              console.log('Could not find matching customer');
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
  }, [isLoading, customerId, customers, customerPocSet, dataFetched, customerGST, customerEmail, customerPhone]);

  useEffect(() => {
    let isMounted = true;

    const setPOCWhenLoaded = async () => {
      // Remove debug log
      // console.log("MAAA KA BHOSRA ")

      // Log relevant state for debugging
      console.log("Setting POC - poc length:", poc.length, "pocId:", pocId, "isEditMode:", isEditMode);
      
      // Modified condition to properly handle both edit mode and regular mode
      if (poc.length > 0 && pocId && (isEditMode || selectedCustomer)) {
        console.log('Attempting to set POC with ID:', pocId, 'in mode:', isEditMode ? 'edit' : 'create');
        const pocItem = poc.find((p: POCOption) => p.id === pocId);
        
        if (pocItem) {
          console.log('POC found by ID:', pocItem);
          setSelectedPoc(pocItem);
          
          // Set POC fields directly to ensure they're populated
          setPocEmail(pocItem.email || '');
          setPocPhone(pocItem.phone || '');
          setPocDesignation(pocItem.designation || '');
          setPocDepartment(pocItem.department || '');
        } else {
          console.log('POC not found by ID, trying alternative methods');
          // Try to find by email or phone
          const fallbackPoc = poc.find((p: POCOption) =>
            (p.email && p.email === pocEmail) ||
            (p.phone && p.phone === pocPhone)
          );

          if (fallbackPoc) {
            console.log('POC found by email or phone:', fallbackPoc);
            setSelectedPoc(fallbackPoc);
            
            // Only set fields from fallbackPoc if they're empty or we're in edit mode
            if (!pocEmail || isEditMode) setPocEmail(fallbackPoc.email || '');
            if (!pocPhone || isEditMode) setPocPhone(fallbackPoc.phone || '');
            if (!pocDesignation || isEditMode) setPocDesignation(fallbackPoc.designation || '');
            if (!pocDepartment || isEditMode) setPocDepartment(fallbackPoc.department || '');
          } else {
            console.log('Could not find matching POC');
          }
        }
      }
    };

    setPOCWhenLoaded();

    return () => {
      isMounted = false;
    };
  }, [poc, pocId, pocEmail, pocPhone, selectedCustomer, isEditMode]);

  // Add effect to ensure selectedPoc is set whenever the poc array changes and we have a pocId
  useEffect(() => {
    if (poc.length > 0 && pocId && !selectedPoc) {
      console.log('POC array changed or pocId changed, attempting to set selectedPoc');
      const pocItem = poc.find((p: POCOption) => p.id === pocId);
      if (pocItem) {
        console.log('Setting selectedPoc directly from poc array change:', pocItem);
        setSelectedPoc(pocItem);
      }
    }
  }, [poc, pocId, selectedPoc]);

  // Set executive name if not present
  useEffect(() => {
    if (!executiveName && user) {
      const name = user.given_name || user.name || '';
      setExecutiveName(name);
    }
  }, [user, executiveName]);

  /**
   * Updates order totals when additional costs change
   */
  useEffect(() => {
    if (orderTotals.totalAmount !== undefined) {
      const additionalCostTotal = calculateAdditionalCostsTotal({
        liquidatedDamagesInclusive,
        liquidatedDamagesAmount,
        freightChargeInclusive,
        freightChargeAmount,
        transitInsuranceInclusive,
        transitInsuranceAmount,
        installationInclusive,
        installationAmount,
        securityDepositInclusive,
        securityDepositAmount,
        liaisoningInclusive,
        liaisoningAmount
      });

      // Ensure we're handling numbers properly
      const itemsTotalAmount = Number(orderTotals.totalAmount);
      const additionalCostTotalNumber = Number(additionalCostTotal);
      const grandTotal = itemsTotalAmount + additionalCostTotalNumber;

      console.log('Updating order totals due to additional cost change:', {
        itemsTotalAmount,
        additionalCostTotal: additionalCostTotalNumber,
        grandTotal
      });

      setOrderTotals(prevTotals => ({
        ...prevTotals,
        additionalCostTotal: additionalCostTotalNumber,
        grandTotal
      }));
    }
  }, [
    orderTotals.totalAmount,
    liquidatedDamagesInclusive,
    liquidatedDamagesAmount,
    freightChargeInclusive,
    freightChargeAmount,
    transitInsuranceInclusive,
    transitInsuranceAmount,
    installationInclusive,
    installationAmount,
    securityDepositInclusive,
    securityDepositAmount,
    liaisoningInclusive,
    liaisoningAmount
  ]);

  /**
   * Prepares form data for submission
   */
  const prepareFormData = useCallback((): OrderFormData => {
    // Calculate final additional costs and grand total
    const additionalCostTotal = orderTotals.additionalCostTotal;
    const itemsTotalAmount = orderTotals.totalAmount;
    const grandTotal = Number(itemsTotalAmount) + Number(additionalCostTotal);

    // Log totals calculation for debugging
    console.log('Preparing form data with totals:', {
      orderTotals,
      itemsTotalAmount,
      additionalCostTotal,
      calculatedGrandTotal: grandTotal,
      storedGrandTotal: orderTotals.grandTotal
    });

    // Check if there's a discrepancy between stored and calculated grand total
    if (Math.abs(Number(orderTotals.grandTotal) - grandTotal) > 0.01) {
      console.warn(`Warning: Stored grandTotal (${orderTotals.grandTotal}) doesn't match calculated value (${grandTotal}). Using calculated value.`);
    }

    // Order items and totals
    return {
      orderNumber: orderNum,
      orderName,
      executiveName,
      orderCreationDate,
      orderDate,
      orderStatus,

      // Customer and POC info
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerGST,
      customerEmail,
      customerPhone,

      pocId: selectedPoc?.id,
      pocName: selectedPoc?.name,
      pocEmail,
      pocPhone,
      pocDesignation,
      pocDepartment,

      // Addresses
      billingAddress,
      shippingAddress,
      wpcAddress,

      // Order settings
      paymentTerm,
      deliveryInstruction,
      modeOfDispatch,
      warranty,
      orderRemarks,

      // License info
      requiresLicense,
      licenseType,
      licenseNumber,
      licenseIssueDate,
      licenseExpiryDate,
      licenseQuantity,
      liaisoningRemarks,
      liaisoningVerified,

      // Additional costs
      liquidatedDamagesInclusive,
      liquidatedDamagesAmount,
      freightChargeInclusive,
      freightChargeAmount,
      transitInsuranceInclusive,
      transitInsuranceAmount,
      installationInclusive,
      installationAmount,
      securityDepositInclusive,
      securityDepositAmount,
      liaisoningInclusive,
      liaisoningAmount,

      // Order items and totals
      items: orderItems,
      subtotal: orderTotals.subtotal,
      taxAmount: orderTotals.taxTotal,
      discountAmount: orderTotals.discountTotal,
      totalAmount: orderTotals.totalAmount,
      additionalCostTotal: orderTotals.additionalCostTotal,
      grandTotal: grandTotal,
      orderTotals: {
        ...orderTotals,
        grandTotal
      },

      // Documents
      documents,
      performanceBankGuarantee
    };
  }, [
    orderNum,
    orderName,
    executiveName,
    orderCreationDate,
    orderDate,
    orderStatus,
    selectedCustomer,
    customerGST,
    customerEmail,
    customerPhone,
    selectedPoc,
    pocEmail,
    pocPhone,
    pocDesignation,
    pocDepartment,
    billingAddress,
    shippingAddress,
    wpcAddress,
    paymentTerm,
    deliveryInstruction,
    modeOfDispatch,
    warranty,
    orderRemarks,
    requiresLicense,
    licenseType,
    licenseNumber,
    licenseIssueDate,
    licenseExpiryDate,
    licenseQuantity,
    liaisoningRemarks,
    liaisoningVerified,
    liquidatedDamagesInclusive,
    liquidatedDamagesAmount,
    freightChargeInclusive,
    freightChargeAmount,
    transitInsuranceInclusive,
    transitInsuranceAmount,
    installationInclusive,
    installationAmount,
    securityDepositInclusive,
    securityDepositAmount,
    liaisoningInclusive,
    liaisoningAmount,
    orderItems,
    orderTotals,
    documents,
    performanceBankGuarantee
  ]);

  /**
   * Submits the form
   */
  const submitForm = useCallback(
    async (getAccessTokenSilently: GetTokenSilently): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        const formData = prepareFormData();
        const result = await useSubmitOrderFormHook(
          formData,
          getAccessTokenSilently,
          isEditMode ? orderNum : undefined
        );

        if (result.success) {
          toast.success(result.message);
          history.push(`/orders/${orderNum}`);
          return true;
        } else {
          toast.error(result.message);
          return false;
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('Failed to submit form');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }, [prepareFormData, isEditMode, orderNum, history]);

  // Helper functions for the form
  const handleCustomerAdded = (customer: CustomerOption) => {
    setCustomers(prev => [...prev, customer]);
    setSelectedCustomer(customer);
    setCustomerId(customer.id as number);

    // Generate order number for new customer in non-edit mode
    if (!isEditMode && (!orderNum || orderNum === '')) {
      generateNewOrderNumber(customer.id?.toString() || '', getAccessTokenSilently);
    }
  };

  const handlePocAdded = (poc: POCOption) => {
    setPoc(prev => [...prev, poc]);
    setSelectedPoc(poc);
    setPocId(poc.id as number);
  };

  const handleNextTab = () => {
    if (activeTab === 'basicInfo') setActiveTab('orderItems');
    else if (activeTab === 'orderItems') setActiveTab('additionalDetails');
    else if (activeTab === 'additionalDetails') setActiveTab('additionalCost');
    else if (activeTab === 'additionalCost') setActiveTab('liaisoning');
    else if (activeTab === 'liaisoning') setActiveTab('documents');
  };

  const handlePreviousTab = () => {
    if (activeTab === 'documents') setActiveTab('liaisoning');
    else if (activeTab === 'liaisoning') setActiveTab('additionalCost');
    else if (activeTab === 'additionalCost') setActiveTab('additionalDetails');
    else if (activeTab === 'additionalDetails') setActiveTab('orderItems');
    else if (activeTab === 'orderItems') setActiveTab('basicInfo');
  };

  const isLastTab = () => activeTab === 'documents';
  const isFirstTab = () => activeTab === 'basicInfo';

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      borderRadius: '0.375rem',
      borderColor: '#E2E8F0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#CBD5E0'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3182CE' : state.isFocused ? '#EBF8FF' : 'white',
      color: state.isSelected ? 'white' : 'black'
    })
  };

  // Return all state and functions
  return {
    // Basic info
    orderNumber: orderNum,
    setOrderNumber: setOrderNum,
    orderName,
    setOrderName,
    executiveName,
    setExecutiveName,
    orderCreationDate,
    setOrderCreationDate,
    orderDate,
    setOrderDate,
    orderStatus,
    setOrderStatus,

    // Customer and POC
    customers,
    selectedCustomer,
    handleCustomerChange,
    customerGST,
    setCustomerGST,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    handleCustomerAdded,

    // Addresses
    billingAddress,
    setBillingAddress,
    shippingAddress,
    setShippingAddress,
    wpcAddress,
    setWpcAddress,

    // POC
    poc,
    selectedPoc,
    handlePocChange,
    pocEmail,
    setPocEmail,
    pocPhone,
    setPocPhone,
    pocDesignation,
    setPocDesignation,
    pocDepartment,
    setPocDepartment,
    handlePocAdded,

    // Order settings
    paymentTerm,
    setPaymentTerm,
    deliveryInstruction,
    setDeliveryInstruction,
    modeOfDispatch,
    setModeOfDispatch,
    warranty,
    setWarranty,
    orderRemarks,
    setOrderRemarks,

    // License info
    requiresLicense,
    setRequiresLicense,
    licenseType,
    setLicenseType,
    licenseNumber,
    setLicenseNumber,
    licenseIssueDate,
    setLicenseIssueDate,
    licenseExpiryDate,
    setLicenseExpiryDate,
    licenseQuantity,
    setLicenseQuantity,
    liaisoningRemarks,
    setLiaisoningRemarks,
    liaisoningVerified,
    setLiaisoningVerified,

    // Additional costs
    liquidatedDamagesInclusive,
    setLiquidatedDamagesInclusive,
    liquidatedDamagesAmount,
    setLiquidatedDamagesAmount,
    freightChargeInclusive,
    setFreightChargeInclusive,
    freightChargeAmount,
    setFreightChargeAmount,
    transitInsuranceInclusive,
    setTransitInsuranceInclusive,
    transitInsuranceAmount,
    setTransitInsuranceAmount,
    installationInclusive,
    setInstallationInclusive,
    installationAmount,
    setInstallationAmount,
    securityDepositInclusive,
    setSecurityDepositInclusive,
    securityDepositAmount,
    setSecurityDepositAmount,
    liaisoningInclusive,
    setLiaisoningInclusive,
    liaisoningAmount,
    setLiaisoningAmount,

    // Documents
    documents,
    setDocuments,
    performanceBankGuarantee,
    setPerformanceBankGuarantee,

    // Order items and totals
    orderItems,
    orderTotals,
    handleOrderItemsChange,

    // Form state and controls
    activeTab,
    setActiveTab,
    handleNextTab,
    handlePreviousTab,
    isLastTab,
    isFirstTab,
    isSubmitting,
    isGeneratingOrderNumber: isLoading,

    // Form submission
    handleSubmit: () => submitForm(getAccessTokenSilently),

    // Refs and styles
    orderFormTableRef,
    selectStyles,

    // Data loading functions
    loadCustomers,
    loadPoc,
    generateNewOrderNumber
  };
}; 