import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import { FaDownload, FaEdit, FaSave, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import QuotationTable from "../components/QuotationTable";

interface QuoteDetails {
  id: number;
  customerId: number;
  invoiceDate: string;
  refNo: string;
  totalAmount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    productName: string;
    unitPrice: number;
    unit: string;
    tax: number;
    quantity: number;
    discount: number;
    amount: number;
    itemCategory: string | null;
    itemCode: string | null;
    description: string | null;
    serialNo: string | null;
    batchNo: string | null;
    expDate: string | null;
    mfgDate: string | null;
    modelNo: string | null;
    size: string | null;
  }>;
  customer: {
    id: number;
    name: string;
    email: string;
    gstNumber: string;
    billingStreetAddress: string;
    billingAddressLine2: string;
    billingPin: string;
    billingCity: string;
    billingDistrict: string;
    billingState: string;
    sameAsBilling: boolean;
    shippingStreetAddress: string;
    shippingAddressLine2: string;
    shippingPin: string;
    shippingCity: string;
    shippingDistrict: string;
    shippingState: string;
  };
  // Add these new optional properties:
  pendingApprovalByDetails?: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  pendingApprovalBy: string[];
  approvedByDetails?: { id: string; firstName: string; lastName: string }[];
  lastUpdatedBy: string;
  remarks?: string | null;
  visibleColumns?: string[]; // ADD THIS LINE
}

interface QuoteItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  tax: number;
  discount: number;
  amount: number;
  additionalDetails?: {
    itemCategory?: string;
    itemCode?: string;
    description?: string;
    serialNo?: string;
    batchNo?: string;
    expDate?: string;
    mfgDate?: string;
    modelNo?: string;
    size?: string;
  };
}
const QuoteDetailsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rawQuoteId = queryParams.get("quoteId");
  const quoteId = rawQuoteId ? parseInt(rawQuoteId, 10) : null;
  const { user, getAccessTokenSilently } = useAuth0();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const quotationTableRef = useRef<any>(null);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [originalQuote, setOriginalQuote] = useState<QuoteDetails | null>(null); // Add this line

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quotes/ref/${rawQuoteId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch quote details");
        const data = await response.json();
        setQuote(data);
        setOriginalQuote(data); // Store original quote data
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteDetails();
    }
  }, [quoteId, getAccessTokenSilently, rawQuoteId]);

  // filepath: src/pages/QuoteDetailsPage.tsx
  const handleSave = async () => {
    if (!quote || !quotationTableRef.current) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const updatedItems = quotationTableRef.current.getItems();

      // Remove the id field from new items, backend will generate new ids
      const itemsToSend = updatedItems.map((item: any) => {
        if (item.id === 0) {
          const { id, ...itemWithoutId } = item;
          return itemWithoutId;
        }
        return item;
      });

      const totalAmount = quotationTableRef.current.getTotalAmount();

      // Build only the fields that can be updated.
      const updatePayload = {
        items: itemsToSend, // this retains the changed product like add new row
        totalAmount,
        status: quote.status,
        remarks: quote.remarks,
        pendingApprovalBy: quote.pendingApprovalBy,
        approvedBy: quote.approvedByDetails?.map((user) => user.id) || [], // Send current approvedBy user IDs
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/quotes/ref/${rawQuoteId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) throw new Error("Failed to update quote");

      const updatedData = await response.json();

      // Optimistically update the state
      setQuote((prevQuote) => {
        if (!prevQuote) return prevQuote; // or handle the null case appropriately

        return {
          ...prevQuote,
          ...updatedData,
          items: updatedData.items, //  REPLACE the items array with the new one from the backend
          pendingApprovalBy: updatedData.pendingApprovalBy,
          approvedByDetails: updatedData.approvedByDetails,
          lastUpdatedBy: updatedData.lastUpdatedBy,
        };
      });

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (originalQuote) {
      setQuote(originalQuote); // Revert to original quote
    }
  };

  const handleExport = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/quotes/download/${rawQuoteId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quote-${quote?.refNo || "download"}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err: any) {
      console.error("Download failed:", err);
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quotes`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refNos: [quote?.refNo] }),
          }
        );

        if (!response.ok) throw new Error("Failed to delete quote");
        window.location.href = "/quotes";
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleApprove = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/quotes/approve/${rawQuoteId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to approve quote: ${response.status}`);
      }

      // Refresh the quote details after successful approval
      const updatedQuoteResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/quotes/ref/${rawQuoteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!updatedQuoteResponse.ok) {
        throw new Error("Failed to refresh quote details after approval");
      }

      const updatedQuoteData = await updatedQuoteResponse.json();
      setQuote(updatedQuoteData);
    } catch (error: any) {
      console.error("Error approving quote:", error);
      setError(error.message);
    }
  };

  // Fetch user options when in edit mode
  useEffect(() => {
    const fetchUserOptions = async () => {
      try {
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
        if (!response.ok) {
          throw new Error("Failed to fetch user options");
        }
        const data = await response.json();
        setUserOptions(data);
      } catch (err: any) {
        console.error("Error fetching user options:", err);
      }
    };

    if (isEditing) {
      fetchUserOptions();
    }
  }, [isEditing, getAccessTokenSilently]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!quote)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Quote not found
      </div>
    );

  const statusOptions = [
    { value: "Drafted", label: "Drafted" },
    { value: "Pending Approval", label: "Pending Approval" },
    { value: "Approved", label: "Approved" },
    { value: "Declined by customer", label: "Declined by Customer" },
    { value: "Order placed", label: "Order Placed" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quote #{quote.refNo}</h1>
              <p className="text-gray-600">Created by {quote.createdBy}</p>
            </div>
            <div className="flex gap-3">
              <FaTrash
                onClick={handleDelete}
                className="trash-icon mt-2 size-6"
              />

              {/* Render Approve button if the user is pending approval */}
              {user &&
                quote.pendingApprovalBy &&
                user?.sub &&
                quote.pendingApprovalBy.includes(user.sub) && (
                  <button
                    onClick={handleApprove}
                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Approve
                  </button>
                )}

              <button
                onClick={() => {
                  if (isEditing) {
                    handleCancelEdit();
                  } else {
                    setIsEditing(!isEditing);
                  }
                }}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <FaEdit className="mr-2" />
                {isEditing ? "Cancel Edit" : "Edit"}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FaSave className="mr-2" />
                  Save
                </button>
              )}
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Customer Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Customer Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>
                  {quote.customer.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>
                  {quote.customer.email}
                </p>
                <p>
                  <span className="font-medium">GST Number:</span>
                  {quote.customer.gstNumber}
                </p>
                <p>
                  <span className="font-medium">Billing Address:</span>
                </p>
                <p className="ml-4">
                  {quote.customer.billingStreetAddress}
                  <br />
                  {quote.customer.billingAddressLine2 && (
                    <>
                      {quote.customer.billingAddressLine2}
                      <br />
                    </>
                  )}
                  {quote.customer.billingCity}, {quote.customer.billingDistrict}
                  <br />
                  {quote.customer.billingState} - {quote.customer.billingPin}
                </p>
              </div>
            </div>

            {/* Quote Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quote Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>
                  {isEditing ? (
                    <Select
                      className="max-w-xs inline-block"
                      value={statusOptions.find(
                        (option) => option.value === quote.status
                      )}
                      onChange={(selectedOption) =>
                        setQuote({
                          ...quote,
                          status: selectedOption?.value || quote.status,
                        })
                      }
                      options={statusOptions}
                    />
                  ) : (
                    quote.status
                  )}
                </p>
                <p>
                  <span className="font-medium">Pending Approval by:</span>
                  {isEditing ? (
                    <Select
                      isMulti
                      className="max-w-xs inline-block"
                      options={userOptions}
                      value={userOptions.filter((opt) =>
                        quote.pendingApprovalBy?.includes(opt.value)
                      )}
                      onChange={(selectedOptions) =>
                        setQuote({
                          ...quote,
                          pendingApprovalBy: selectedOptions.map(
                            (opt) => opt.value
                          ),
                        })
                      }
                    />
                  ) : quote.pendingApprovalByDetails &&
                    quote.pendingApprovalByDetails.length > 0 ? (
                    quote.pendingApprovalByDetails
                      .map((user) => user.firstName + " " + user.lastName)
                      .join(", ")
                  ) : quote.pendingApprovalBy &&
                    quote.pendingApprovalBy.length > 0 ? (
                    userOptions
                      .filter((opt) =>
                        quote.pendingApprovalBy.includes(opt.value)
                      )
                      .map((opt) => opt.label)
                      .join(", ")
                  ) : (
                    "None"
                  )}
                </p>
                <p>
                  <span className="font-medium">Approved by:</span>
                  {quote.approvedByDetails && quote.approvedByDetails.length
                    ? quote.approvedByDetails
                        .map((user) => user.firstName + " " + user.lastName)
                        .join(", ")
                    : "None"}
                </p>
                <p>
                  <span className="font-medium">Invoice Date:</span>
                  {new Date(quote.invoiceDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Created:</span>
                  {new Date(quote.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Last Updated:</span>
                  {new Date(quote.updatedAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Last Updated By:</span>{" "}
                  {quote.lastUpdatedBy}
                </p>
              </div>
            </div>

            {/* Remarks Column */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Remarks</h2>
              <div className="space-y-2">
                {isEditing ? (
                  <textarea
                    className="w-full p-2 border rounded"
                    value={quote.remarks || ""}
                    onChange={(e) =>
                      setQuote({ ...quote, remarks: e.target.value })
                    }
                    placeholder="Enter remarks"
                  />
                ) : (
                  <p className="whitespace-pre-line">
                    {quote.remarks ? quote.remarks : "None"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table Using QuotationTable */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Quote Items</h2>
          {isEditing ? (
            <QuotationTable
              ref={quotationTableRef}
              initialData={quote.items.map((item, index) => ({
                id: index + 1, // Use actual item ID or fallback to index+1
                item: item.productName || "", // Use actual product name
                qty: parseFloat(item.quantity?.toString() || "0"), // Convert to number
                unit: item.unit || "",
                price: parseFloat(item.unitPrice?.toString() || "0"),
                tax: parseFloat(item.tax?.toString() || "0"),
                discount: parseFloat(item.discount?.toString() || "0"),
                amount: parseFloat(item.amount?.toString() || "0"),
                itemCategory: item?.itemCategory || "",
                itemCode: item?.itemCode || "",
                description: item?.description || "",
                serialNo: item?.serialNo || "",
                batchNo: item?.batchNo || "",
                expDate: item?.expDate || "",
                mfgDate: item?.mfgDate || "",
                modelNo: item?.modelNo || "",
                size: item?.size || "",
              }))}
              quoteRefNo={quote.refNo}
              isEditing={isEditing} // Pass isEditing prop
            />
          ) : (
            <QuotationTable
              initialData={quote.items.map((item, index) => ({
                id: index + 1, // Use actual item ID or fallback to index+1
                item: item.productName || "", // Use actual product name
                qty: parseFloat(item.quantity?.toString() || "0"), // Convert to number
                unit: item.unit || "",
                price: parseFloat(item.unitPrice?.toString() || "0"),
                tax: parseFloat(item.tax?.toString() || "0"),
                discount: parseFloat(item.discount?.toString() || "0"),
                amount: parseFloat(item.amount?.toString() || "0"),
                itemCategory: item?.itemCategory || "",
                itemCode: item?.itemCode || "",
                description: item?.description || "",
                serialNo: item?.serialNo || "",
                batchNo: item?.batchNo || "",
                expDate: item?.expDate || "",
                mfgDate: item?.mfgDate || "",
                modelNo: item?.modelNo || "",
                size: item?.size || "",
              }))}
              initialVisibleColumns={quote.visibleColumns} // Pass visibleColumns
              quoteRefNo={quote.refNo}
              isEditing={isEditing} // Pass isEditing prop
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailsPage;
