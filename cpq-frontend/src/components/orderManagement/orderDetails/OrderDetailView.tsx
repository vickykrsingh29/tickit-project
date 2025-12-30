import React, { useState, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from 'react-toastify';

import OrderInfoBasic from "../sections/OrderInfoBasic";
import OrderCustomerDetails from "../sections/OrderCustomerDetails";
import OrderItemsInfo from "../sections/OrderItemsInfo";
import OrderCostDetails from "../sections/OrderCostDetails";
import OrderLicenseInfo from "../sections/OrderLicenseInfo";
import OrderDocumentsInfo from "../sections/OrderDocumentsInfo";
import OrderStatusInfo from "../sections/OrderStatusInfo";
import { 
  useOrderDetails,
  useDeleteOrder,
  useDownloadOrderDocument
} from "../hooks";

interface OrderItemDetail {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  skuId: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  discountRate: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  unit?: string;
  description?: string;
  category?: string;
  modelNo?: string;
  serialNo?: string;
  size?: string;
  batchNo?: string;
  expDate?: string;
  mfgDate?: string;
  status?: string;
  deliveryDate?: string;
  additionalDetails?: string;
  warranty?: string;
  manufacturer?: string;
}

// Define the OrderDetail interface for this component
interface OrderDetail {
  id: string;
  orderNumber: string;
  orderName: string;
  customerName: string;
  customerGST: string;
  customerEmail: string;
  customerPhone: string;
  // Address fields aligned with backend model
  billingAddress: string;
  billingAddressLine2: string;
  billingPin: string;
  billingCity: string;
  billingDistrict: string;
  billingState: string;
  billingCountry: string;
  shippingAddress: string;
  shippingAddressLine2: string;
  shippingPin: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingState: string;
  shippingCountry: string;
  wpcAddress: string;
  wpcAddressLine2: string;
  wpcPin: string;
  wpcCity: string;
  wpcDistrict: string;
  wpcState: string;
  wpcCountry: string;
  // POC information
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  pocDesignation: string;
  pocDepartment: string;
  // Order details
  orderDate: string;
  orderCreationDate: string;
  orderStatus: string;
  executiveName: string;
  paymentTerm: string;
  deliveryInstruction: string;
  modeOfDispatch: string;
  warranty: string;
  orderRemarks: string;
  // License information
  requiresLicense: boolean;
  licenseType: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseIssueDate: string;
  licenseQuantity: string;
  liaisoningRemarks: string;
  liaisoningVerified: boolean;
  // Order items and costs
  items: OrderItemDetail[]; // Using the defined OrderItemDetail interface
  subtotal: number; // Sum of all items before tax and discount
  taxAmount: number; // Total tax amount
  discountAmount: number; // Total discount amount
  totalAmount: number; // Final amount after tax and discount
  additionalCost: {
    liquidatedDamages: { inclusive: boolean; amount: number };
    freightCharge: { inclusive: boolean; amount: number };
    transitInsurance: { inclusive: boolean; amount: number };
    installation: { inclusive: boolean; amount: number };
    securityDeposit: { inclusive: boolean; amount: number };
    liaisoning: { inclusive: boolean; amount: number };
  };
  additionalCostTotal: number;
  grandTotal: number;
  // Documents
  documents: string[];
  performanceBankGuarantee: string;
}

const OrderDetailView: React.FC = () => {
  const params = useParams<{ orderNumber: string }>();
  const history = useHistory();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  
  const orderNumber = params.orderNumber || location.pathname.split('/').pop();
  
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
    setLoading(true);
        
        if (!orderNumber) {
          throw new Error("Order number is missing from URL");
        }
        
        const data = await useOrderDetails(orderNumber, getAccessTokenSilently);
        
        if (!data) {
          throw new Error("Failed to fetch order details");
        }
        
        const apiData = data as any;
        
        // Process order items and calculate totals if needed
        const processedItems = Array.isArray(apiData.items) ? apiData.items.map((item: any) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          productName: item.productName || '',
          skuId: item.skuId || '',
          unitPrice: parseFloat(item.unitPrice) || 0,
          taxRate: parseFloat(item.taxRate) || 0,
          quantity: parseInt(item.quantity) || 0,
          discountRate: parseFloat(item.discountRate) || 0,
          subtotal: parseFloat(item.subtotal) || 0,
          taxAmount: parseFloat(item.taxAmount) || 0,
          discountAmount: parseFloat(item.discountAmount) || 0,
          totalAmount: parseFloat(item.totalAmount) || 0,
          unit: item.unit || '',
          description: item.description || '',
          category: item.category || '',
          modelNo: item.modelNo || '',
          serialNo: item.serialNo || '',
          size: item.size || '',
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          mfgDate: item.mfgDate || '',
          status: item.status || '',
          deliveryDate: item.deliveryDate || '',
          additionalDetails: item.additionalDetails || '',
          warranty: item.warranty || '',
          manufacturer: item.manufacturer || ''
        })) : [];
        
        // Calculate totals if not provided by the backend
        let calculatedSubtotal = 0;
        let calculatedTaxAmount = 0;
        let calculatedDiscountAmount = 0;
        let calculatedTotalAmount = 0;
        
        if (processedItems.length > 0) {
          // Calculate from items
          calculatedSubtotal = processedItems.reduce((sum: number, item: OrderItemDetail) => sum + item.subtotal, 0);
          calculatedTaxAmount = processedItems.reduce((sum: number, item: OrderItemDetail) => sum + item.taxAmount, 0);
          calculatedDiscountAmount = processedItems.reduce((sum: number, item: OrderItemDetail) => sum + item.discountAmount, 0);
          calculatedTotalAmount = processedItems.reduce((sum: number, item: OrderItemDetail) => sum + item.totalAmount, 0);
        }
        
        // Calculate additional costs total
        const additionalCostTotal = 
          (!apiData.liquidatedDamagesInclusive ? apiData.liquidatedDamagesAmount || 0 : 0) +
          (!apiData.freightChargeInclusive ? apiData.freightChargeAmount || 0 : 0) +
          (!apiData.transitInsuranceInclusive ? apiData.transitInsuranceAmount || 0 : 0) +
          (!apiData.installationInclusive ? apiData.installationAmount || 0 : 0) +
          (!apiData.securityDepositInclusive ? apiData.securityDepositAmount || 0 : 0) +
          (!apiData.liaisoningInclusive ? apiData.liaisoningAmount || 0 : 0);
        
        // Calculate grand total
        const grandTotal = (apiData.totalAmount || calculatedTotalAmount) + additionalCostTotal;
        
        // Format the order details
        const formattedOrderDetail: OrderDetail = {
          id: apiData.id || '',
          orderNumber: apiData.orderNumber || '',
          orderName: apiData.orderName || '',
          customerName: apiData.customerName || '',
          customerGST: apiData.customerGST || '',
          customerEmail: apiData.customerEmail || '',
          customerPhone: apiData.customerPhone || '',
          billingAddress: apiData.billingAddress || '',
          billingAddressLine2: apiData.billingAddressLine2 || '',
          billingPin: apiData.billingPin || '',
          billingCity: apiData.billingCity || '',
          billingDistrict: apiData.billingDistrict || '',
          billingState: apiData.billingState || '',
          billingCountry: apiData.billingCountry || '',
          shippingAddress: apiData.shippingAddress || '',
          shippingAddressLine2: apiData.shippingAddressLine2 || '',
          shippingPin: apiData.shippingPin || '',
          shippingCity: apiData.shippingCity || '',
          shippingDistrict: apiData.shippingDistrict || '',
          shippingState: apiData.shippingState || '',
          shippingCountry: apiData.shippingCountry || '',
          wpcAddress: apiData.wpcAddress || '',
          wpcAddressLine2: apiData.wpcAddressLine2 || '',
          wpcPin: apiData.wpcPin || '',
          wpcCity: apiData.wpcCity || '',
          wpcDistrict: apiData.wpcDistrict || '',
          wpcState: apiData.wpcState || '',
          wpcCountry: apiData.wpcCountry || '',
          pocName: apiData.pocName || '',
          pocEmail: apiData.pocEmail || apiData.poc?.email || '',
          pocPhone: apiData.pocPhone || apiData.poc?.phone || '',
          pocDesignation: apiData.pocDesignation || apiData.poc?.designation || '',
          pocDepartment: apiData.pocDepartment || apiData.poc?.department || '',
          orderDate: apiData.orderDate || '',
          orderCreationDate: apiData.orderCreationDate || '',
          executiveName: apiData.executiveName || '',
          paymentTerm: apiData.paymentTerm || '',
          deliveryInstruction: apiData.deliveryInstruction || '',
          modeOfDispatch: apiData.modeOfDispatch || '',
          warranty: apiData.warranty || '',
          orderRemarks: apiData.orderRemarks || '',
          additionalCost: {
            liquidatedDamages: {
              inclusive: apiData.liquidatedDamagesInclusive || false,
              amount: apiData.liquidatedDamagesAmount || 0,
            },
            freightCharge: {
              inclusive: apiData.freightChargeInclusive || false,
              amount: apiData.freightChargeAmount || 0,
            },
            transitInsurance: {
              inclusive: apiData.transitInsuranceInclusive || false,
              amount: apiData.transitInsuranceAmount || 0,
            },
            installation: {
              inclusive: apiData.installationInclusive || false,
              amount: apiData.installationAmount || 0,
            },
            securityDeposit: {
              inclusive: apiData.securityDepositInclusive || false,
              amount: apiData.securityDepositAmount || 0,
            },
            liaisoning: {
              inclusive: apiData.liaisoningInclusive || false,
              amount: apiData.liaisoningAmount || 0,
            }
          },
          additionalCostTotal: apiData.additionalCostTotal || additionalCostTotal,
          grandTotal: apiData.grandTotal || grandTotal,
          requiresLicense: apiData.requiresLicense || false,
          licenseType: apiData.licenseType || '',
          licenseNumber: apiData.licenseNumber || '',
          licenseExpiryDate: apiData.licenseExpiryDate || '',
          licenseIssueDate: apiData.licenseIssueDate || '',
          licenseQuantity: apiData.licenseQuantity || '',
          liaisoningRemarks: apiData.liaisoningRemarks || '',
          liaisoningVerified: apiData.liaisoningVerified || false,
          items: processedItems,
          subtotal: apiData.subtotal || calculatedSubtotal,
          taxAmount: apiData.taxAmount || calculatedTaxAmount,
          discountAmount: apiData.discountAmount || calculatedDiscountAmount,
          totalAmount: apiData.totalAmount || calculatedTotalAmount,
          documents: Array.isArray(apiData.documents) ? apiData.documents : [],
          performanceBankGuarantee: apiData.performanceBankGuarantee || '',
          orderStatus: apiData.orderStatus || 'Pending',
        };
        
        setOrderDetail(formattedOrderDetail);
      } catch (error: any) {
        console.error("Error loading order details:", error);
        setError(error.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      loadOrderDetails();
    } else {
      setError("Order number is missing from URL");
      setLoading(false);
    }
  }, [orderNumber, getAccessTokenSilently]);

  const handleEditOrder = () => {
    if (!orderDetail) return;
    
    // Navigate to the edit order page with the order number as a route parameter
    history.push(`/edit-order/${orderDetail.orderNumber}`);
  };

  const handleDeleteOrder = async () => {
    if (!orderDetail) return;
    
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        setIsDeleting(true);
        
        // Use the API function to delete the order
        const success = await useDeleteOrder(orderDetail.orderNumber, getAccessTokenSilently);
        
        if (success) {
          toast.success("Order deleted successfully");
          history.push("/orders");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDownloadOrder = async () => {
    if (!orderDetail) return;
    
    try {
      setIsDownloading(true);
      
      // Use the API function to download the order document
      await useDownloadOrderDocument(orderDetail.orderNumber, getAccessTokenSilently);
    } catch (error) {
      console.error("Error downloading order:", error);
      toast.error("Failed to download order");
    } finally {
      setIsDownloading(false);
    }
  };

  // Define tabs for better organization
  const tabs = [
    { id: "basic", name: "Order Info" },
    { id: "customer", name: "Customer Details" },
    { id: "items", name: "Order Items" },
    { id: "costs", name: "Cost Details" },
    { id: "license", name: "License Info" },
    { id: "documents", name: "Documents" },
    { id: "status", name: "Status" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center w-3/5 mx-auto">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => history.push("/orders")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Order Not Found</h2>
        <p className="mt-2 text-gray-600">The requested order could not be found.</p>
        <button
          onClick={() => history.push("/orders")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl mx-auto max-w-6xl my-8">
      {/* Header with status banner */}
      <div
        className={`rounded-t-lg p-6 flex justify-between items-center
          ${
            orderDetail.orderStatus === "Completed" || orderDetail.orderStatus === "Delivered"
              ? "bg-green-600"
              : orderDetail.orderStatus === "Shipped"
              ? "bg-blue-600"
              : orderDetail.orderStatus === "Pending"
              ? "bg-yellow-500"
              : orderDetail.orderStatus === "Cancelled"
              ? "bg-red-600"
              : "bg-gray-600"
          }
        `}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{orderDetail.orderName}</h1>
          <p className="text-white/90">
            Order #{orderDetail.orderNumber} • {orderDetail.orderDate}
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-full text-white font-bold">
          {orderDetail.orderStatus}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-b border-gray-200 bg-gray-50 p-4 justify-end space-x-2">
        <button
          onClick={handleEditOrder}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isDeleting || isDownloading}
        >
          <FaEdit className="mr-2" /> Edit
        </button>
        <button
          onClick={handleDeleteOrder}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={isDeleting || isDownloading}
        >
          {isDeleting ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
              Deleting...
            </>
          ) : (
            <>
          <FaTrash className="mr-2" /> Delete
            </>
          )}
        </button>
        <button
          onClick={handleDownloadOrder}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={isDeleting || isDownloading}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
              Downloading...
            </>
          ) : (
            <>
          <FaDownload className="mr-2" /> Download
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Order Info Tab */}
        {activeTab === "basic" && (
          <OrderInfoBasic props={{
            orderNumber: orderDetail.orderNumber,
            orderDate: orderDetail.orderDate,
            orderCreationDate: orderDetail.orderCreationDate,
            executiveName: orderDetail.executiveName,
            paymentTerm: orderDetail.paymentTerm,
            modeOfDispatch: orderDetail.modeOfDispatch,
            warranty: orderDetail.warranty,
            deliveryInstruction: orderDetail.deliveryInstruction,
            grandTotal: orderDetail.grandTotal,
          }} />
        )}

        {/* Customer Details Tab */}
        {activeTab === "customer" && (
          <OrderCustomerDetails props={{
            customerName: orderDetail.customerName,
            customerGST: orderDetail.customerGST,
            customerEmail: orderDetail.customerEmail,
            customerPhone: orderDetail.customerPhone,
            // Billing address fields
            billingAddress: orderDetail.billingAddress,
            billingAddressLine2: orderDetail.billingAddressLine2,
            billingPin: orderDetail.billingPin,
            billingCity: orderDetail.billingCity,
            billingDistrict: orderDetail.billingDistrict,
            billingState: orderDetail.billingState,
            billingCountry: orderDetail.billingCountry,
            // Shipping address fields
            shippingAddress: orderDetail.shippingAddress,
            shippingAddressLine2: orderDetail.shippingAddressLine2,
            shippingPin: orderDetail.shippingPin,
            shippingCity: orderDetail.shippingCity,
            shippingDistrict: orderDetail.shippingDistrict,
            shippingState: orderDetail.shippingState,
            shippingCountry: orderDetail.shippingCountry,
            // WPC address fields
            wpcAddress: orderDetail.wpcAddress,
            wpcAddressLine2: orderDetail.wpcAddressLine2,
            wpcPin: orderDetail.wpcPin,
            wpcCity: orderDetail.wpcCity,
            wpcDistrict: orderDetail.wpcDistrict,
            wpcState: orderDetail.wpcState,
            wpcCountry: orderDetail.wpcCountry,
            // POC information
            pocName: orderDetail.pocName,
            pocEmail: orderDetail.pocEmail,
            pocPhone: orderDetail.pocPhone,
            pocDesignation: orderDetail.pocDesignation,
            pocDepartment: orderDetail.pocDepartment,
          }} />
        )}

        {/* Order Items Tab */}
        {activeTab === "items" && (
          <OrderItemsInfo props={{
            items: orderDetail.items,
            totalAmount: orderDetail.totalAmount,
            subtotal: orderDetail.subtotal,
            taxAmount: orderDetail.taxAmount,
            discountAmount: orderDetail.discountAmount
          }} />
        )}

        {/* Cost Details Tab */}
        {activeTab === "costs" && (
          <OrderCostDetails props={{
            additionalCost: orderDetail.additionalCost,
            additionalCostTotal: orderDetail.additionalCostTotal,
            grandTotal: orderDetail.grandTotal,
          }} />
        )}

        {/* License Info Tab */}
        {activeTab === "license" && (
          <OrderLicenseInfo props={{
            licenseType: orderDetail.licenseType,
            licenseNumber: orderDetail.licenseNumber,
            licenseExpiryDate: orderDetail.licenseExpiryDate,
            licenseQuantity: orderDetail.licenseQuantity,
            wpcAddress: orderDetail.wpcAddress,
            liaisoningRemarks: orderDetail.liaisoningRemarks,
            liaisoningVerified: orderDetail.liaisoningVerified,
            requiresLicense: orderDetail.requiresLicense,
            licenseIssueDate: orderDetail.licenseIssueDate,
          }} />
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <OrderDocumentsInfo 
            documents={orderDetail.documents}
            performanceBankGuarantee={orderDetail.performanceBankGuarantee}
          />
        )}

        {/* Status Tab */}
        {activeTab === "status" && (
          <OrderStatusInfo 
            status={orderDetail.orderStatus}
            licenseType={orderDetail.licenseType}
            liaisoningRemarks={orderDetail.liaisoningRemarks}
            orderCreationDate={orderDetail.orderCreationDate}
            orderDate={orderDetail.orderDate}
            executiveName={orderDetail.executiveName}
            requiresLicense={orderDetail.requiresLicense}
            liaisoningVerified={orderDetail.liaisoningVerified}
            licenseNumber={orderDetail.licenseNumber}
            licenseExpiryDate={orderDetail.licenseExpiryDate}
            orderRemarks={orderDetail.orderRemarks}
          />
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <button
          onClick={() => history.push("/orders")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetailView;