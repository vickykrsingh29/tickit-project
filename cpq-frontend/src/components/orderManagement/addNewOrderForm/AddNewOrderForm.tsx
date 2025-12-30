import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { FaAngleRight, FaAngleLeft, FaCheck, FaSpinner } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import { OrderBasicInfoTab, OrderItemsTab, AdditionalDetailsTab, AdditionalCostTab, LiaisoningTab, DocumentsTab, OrderFormTable } from "../sections";
import { useOrderForm, useSubmitOrderForm } from '../hooks';
import { CustomerOption, POCOption } from '../types';

const AddNewOrderForm: React.FC = () => {
  const history = useHistory();

  const { user, getAccessTokenSilently } = useAuth0();
  
  const orderForm = useOrderForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [isLoadingPOCs, setIsLoadingPOCs] = useState(false);
  const [pocsLoadedForCustomerId, setPocsLoadedForCustomerId] = useState<string | number | null>(null);
  
  useEffect(() => {
    if (!customersLoaded) {
      const loadCustomers = async () => {
        try {
          setIsLoadingCustomers(true);
          console.log('Loading customers...');
          await orderForm.loadCustomers(getAccessTokenSilently);
          console.log('Customers loaded:', orderForm.customers);
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
      const loadPOCs = async () => {
        try {
          setIsLoadingPOCs(true);
          console.log('Loading POCs for customer:', selectedCustomer.id);
          await orderForm.loadPoc(selectedCustomer.id, getAccessTokenSilently);
          console.log('POCs loaded:', orderForm.poc);
          setPocsLoadedForCustomerId(selectedCustomer.id);
        } catch (error) {
          console.error('Error loading POCs:', error);
          toast.error('Failed to load contact persons. Please try selecting the customer again.');
        } finally {
          setIsLoadingPOCs(false);
        }
      };
      
      loadPOCs();
    }
  }, [orderForm.selectedCustomer, getAccessTokenSilently, orderForm, pocsLoadedForCustomerId]);
  
  useEffect(() => {
    console.log('User:', user?.firstName);
    if (user && user.firstName) {
      console.log('Setting executive name from Auth0:', user.firstName);
      orderForm.setExecutiveName(user.firstName);
    } else if (user && user.name) {
      console.log('Setting executive name from Auth0 name:', user.name);
      orderForm.setExecutiveName(user.name);
    }
  }, [user, orderForm.setExecutiveName]);
  
  
  const validateOrderForm = (): string[] => {
    const errors: string[] = [];
    
    if (!orderForm.orderNumber) {
      errors.push('Order number is required');
    }
    
    if (!orderForm.orderName) {
      errors.push('Order name is required');
    }
    
    if (!orderForm.executiveName) {
      errors.push('Executive name is required');
    }
    
    if (!orderForm.selectedCustomer) {
      errors.push('Customer is required');
    }
    
    if (!orderForm.orderItems || orderForm.orderItems.length === 0) {
      errors.push('At least one order item is required');
    }
    
    return errors;
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const validationErrors = validateOrderForm();
      if (validationErrors.length > 0) {
        setSubmitError(validationErrors.join(', '));
        toast.error('Please fix the validation errors before submitting.');
        setIsSubmitting(false);
        return;
      }
      
      
      const orderData = {
        // Basic order information
        orderNumber: orderForm.orderNumber,
        orderName: orderForm.orderName,
        executiveName: orderForm.executiveName,
        orderCreationDate: orderForm.orderCreationDate,
        orderDate: orderForm.orderDate,
        orderStatus: orderForm.orderStatus,
        
        // Customer information
        customerId: orderForm.selectedCustomer?.id,
        customerName: orderForm.selectedCustomer?.label || '',
        customerGST: orderForm.customerGST,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        
        // POC information
        pocId: orderForm.selectedPoc?.id,
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
      
      const result = await useSubmitOrderForm(
        orderData,
        getAccessTokenSilently
      );
      
      if (result.success) { 
        toast.success(result.message);
        history.push('/orders');
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
  
  const isLastTab = orderForm.isLastTab();
  
  const isFirstTab = orderForm.activeTab === "basicInfo";

  return (
    <div className="bg-white rounded-lg shadow-xl mx-auto max-w-6xl my-8">
<div className="bg-[#057dcd] rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-white">New Order</h1>
        <p className="text-blue-100">
          Fill in the details to create a new customer order
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-green-600 h-2 transition-all duration-300"
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
      <div className="mb-2">
        <div className="border-b border-gray-200">
          <nav className="flex px-40 items-center justify-between">
            <button
              onClick={() => orderForm.setActiveTab("basicInfo")}
              className={`${
                orderForm.activeTab === "basicInfo"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Basic Info
            </button>
            <button
              onClick={() => orderForm.setActiveTab("orderItems")}
              className={`${
                orderForm.activeTab === "orderItems"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Order Items
            </button>
            <button
              onClick={() => orderForm.setActiveTab("additionalDetails")}
              className={`${
                orderForm.activeTab === "additionalDetails"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Additional Details
            </button>
            <button
              onClick={() => orderForm.setActiveTab("additionalCost")}
              className={`${
                orderForm.activeTab === "additionalCost"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Additional Cost
            </button>
            <button
              onClick={() => orderForm.setActiveTab("liaisoning")}
              className={`${
                orderForm.activeTab === "liaisoning"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Liaisoning
            </button>
            <button
              onClick={() => orderForm.setActiveTab("documents")}
              className={`${
                orderForm.activeTab === "documents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Documents
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 mb-8">
        {orderForm.activeTab === "basicInfo" && (
          <OrderBasicInfoTab
            customers={orderForm.customers || []}
            selectedCustomer={orderForm.selectedCustomer}
            handleCustomerChange={orderForm.handleCustomerChange}
            poc={orderForm.poc}
            selectedPoc={orderForm.selectedPoc}
            handlePocChange={orderForm.handlePocChange}
            onCustomerAdded={orderForm.handleCustomerAdded}
            onPocAdded={orderForm.handlePocAdded}
            selectStyles={orderForm.selectStyles}
            orderNumber={orderForm.orderNumber}
            setOrderNumber={orderForm.setOrderNumber}
            orderName={orderForm.orderName}
            setOrderName={orderForm.setOrderName}
            executiveName={orderForm.executiveName}
            setExecutiveName={orderForm.setExecutiveName}
            orderCreationDate={orderForm.orderCreationDate}
            setOrderCreationDate={orderForm.setOrderCreationDate}
            orderDate={orderForm.orderDate}
            setOrderDate={orderForm.setOrderDate}
            orderStatus={orderForm.orderStatus}
            setOrderStatus={orderForm.setOrderStatus}
            customerGST={orderForm.customerGST}
            setCustomerGST={orderForm.setCustomerGST}
            customerEmail={orderForm.customerEmail}
            setCustomerEmail={orderForm.setCustomerEmail}
            customerPhone={orderForm.customerPhone}
            setCustomerPhone={orderForm.setCustomerPhone}
            billingAddress={orderForm.billingAddress}
            setBillingAddress={orderForm.setBillingAddress}
            shippingAddress={orderForm.shippingAddress}
            setShippingAddress={orderForm.setShippingAddress}
            wpcAddress={orderForm.wpcAddress}
            setWpcAddress={orderForm.setWpcAddress}
            pocEmail={orderForm.pocEmail}
            setPocEmail={orderForm.setPocEmail}
            pocPhone={orderForm.pocPhone}
            setPocPhone={orderForm.setPocPhone}
            pocDesignation={orderForm.pocDesignation}
            setPocDesignation={orderForm.setPocDesignation}
            pocDepartment={orderForm.pocDepartment}
            setPocDepartment={orderForm.setPocDepartment}
            isGeneratingOrderNumber={orderForm.isGeneratingOrderNumber}
            generateOrderNumber={orderForm.generateNewOrderNumber}
          />
        )}
        {orderForm.activeTab === "orderItems" && (
          <OrderItemsTab
            OrderFormTable={OrderFormTable}
            orderFormTableRef={orderForm.orderFormTableRef}
            initialItems={orderForm.orderItems}
            onItemsChange={orderForm.handleOrderItemsChange}
          />
        )}
        {orderForm.activeTab === "additionalDetails" && (
          <AdditionalDetailsTab
            paymentTerm={orderForm.paymentTerm}
            setPaymentTerm={orderForm.setPaymentTerm}
            modeOfDispatch={orderForm.modeOfDispatch}
            setModeOfDispatch={orderForm.setModeOfDispatch}
            deliveryInstruction={orderForm.deliveryInstruction}
            setDeliveryInstruction={orderForm.setDeliveryInstruction}
            warranty={orderForm.warranty}
            setWarranty={orderForm.setWarranty}
            orderRemarks={orderForm.orderRemarks}
            setOrderRemarks={orderForm.setOrderRemarks}
          />
        )}
        {orderForm.activeTab === "additionalCost" && (
          <AdditionalCostTab
            liquidatedDamagesInclusive={orderForm.liquidatedDamagesInclusive}
            setLiquidatedDamagesInclusive={orderForm.setLiquidatedDamagesInclusive}
            liquidatedDamagesAmount={orderForm.liquidatedDamagesAmount}
            setLiquidatedDamagesAmount={orderForm.setLiquidatedDamagesAmount}
            freightChargeInclusive={orderForm.freightChargeInclusive}
            setFreightChargeInclusive={orderForm.setFreightChargeInclusive}
            freightChargeAmount={orderForm.freightChargeAmount}
            setFreightChargeAmount={orderForm.setFreightChargeAmount}
            transitInsuranceInclusive={orderForm.transitInsuranceInclusive}
            setTransitInsuranceInclusive={orderForm.setTransitInsuranceInclusive}
            transitInsuranceAmount={orderForm.transitInsuranceAmount}
            setTransitInsuranceAmount={orderForm.setTransitInsuranceAmount}
            installationInclusive={orderForm.installationInclusive}
            setInstallationInclusive={orderForm.setInstallationInclusive}
            installationAmount={orderForm.installationAmount}
            setInstallationAmount={orderForm.setInstallationAmount}
            securityDepositInclusive={orderForm.securityDepositInclusive}
            setSecurityDepositInclusive={orderForm.setSecurityDepositInclusive}
            securityDepositAmount={orderForm.securityDepositAmount}
            setSecurityDepositAmount={orderForm.setSecurityDepositAmount}
            liaisoningInclusive={orderForm.liaisoningInclusive}
            setLiaisoningInclusive={orderForm.setLiaisoningInclusive}
            liaisoningAmount={orderForm.liaisoningAmount}
            setLiaisoningAmount={orderForm.setLiaisoningAmount}
          />
        )}
        {orderForm.activeTab === "liaisoning" && (
          <LiaisoningTab
            requiresLicense={orderForm.requiresLicense}
            setRequiresLicense={orderForm.setRequiresLicense}
            licenseType={orderForm.licenseType}
            setLicenseType={orderForm.setLicenseType}
            licenseNumber={orderForm.licenseNumber}
            setLicenseNumber={orderForm.setLicenseNumber}
            wpcAddress={orderForm.wpcAddress}
            setWpcAddress={orderForm.setWpcAddress}
            licenseIssueDate={orderForm.licenseIssueDate}
            setLicenseIssueDate={orderForm.setLicenseIssueDate}
            licenseExpiryDate={orderForm.licenseExpiryDate}
            setLicenseExpiryDate={orderForm.setLicenseExpiryDate}
            licenseQuantity={orderForm.licenseQuantity}
            setLicenseQuantity={orderForm.setLicenseQuantity}
            liaisoningRemarks={orderForm.liaisoningRemarks}
            setLiaisoningRemarks={orderForm.setLiaisoningRemarks}
            liaisoningVerified={orderForm.liaisoningVerified}
            setLiaisoningVerified={orderForm.setLiaisoningVerified}
          />
        )}
        {orderForm.activeTab === "documents" && (
          <DocumentsTab
            documents={orderForm.documents}
            setDocuments={orderForm.setDocuments}
            performanceBankGuarantee={orderForm.performanceBankGuarantee}
            setPerformanceBankGuarantee={orderForm.setPerformanceBankGuarantee}
          />
        )}
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
          disabled={isFirstTab}
          className={`flex items-center px-4 py-2 rounded-md ${
            isFirstTab
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FaAngleLeft className="mr-2" />
          Previous
        </button>
          
          {isLastTab ? (
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

      {/* Add a loading indicator for the order number if it's generating */}
      {orderForm.isGeneratingOrderNumber && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg">
          <div className="flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            Generating order number...
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewOrderForm; 