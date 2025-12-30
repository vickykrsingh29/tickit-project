import React, { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SearchByName from "../components/SearchByName";
import ReferenceDetails from "../components/ReferenceDetails";
import QuotationTable from "../components/QuotationTable";

interface QuoteData {
  customerId: number;
  invoiceDate: string;
  createdBy: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    discount: number;
    amount: number;
    unit: string;
    itemCategory?: string;
    itemCode?: string;
    description?: string;
    serialNo?: string;
    batchNo?: string;
    expDate?: string;
    mfgDate?: string;
    modelNo?: string;
    size?: string;
  }>;
  totalAmount: number;
  visibleColumns?: string[]; // Add this line
}

const AddNewQuote: React.FC = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Refs to access child component data
  const customerRef = useRef<any>(null);
  const referenceRef = useRef<any>(null);
  const quotationTableRef = useRef<any>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!customerRef.current?.selectedCustomer) {
        throw new Error("Please select a customer");
      }

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      // Get visibleColumns from the QuotationTable
      const visibleColumns = quotationTableRef.current.getVisibleColumns();

      const quoteData: QuoteData = {
        customerId: customerRef.current.selectedCustomer.id,
        invoiceDate: referenceRef.current.getInvoiceDate(),
        items: quotationTableRef.current.getItems(),
        totalAmount: quotationTableRef.current.getTotalAmount(),
        createdBy: user?.name || "Unknown",
        visibleColumns: visibleColumns, // Include visibleColumns
      };

      console.log(quoteData);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/quotes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quoteData),
        }
      );
      console.log(quoteData);
      if (!response.ok) {
        throw new Error("Failed to save quote");
      }

      const savedQuote = await response.json();
      alert(`Quote created with Ref No: ${savedQuote.refNo}`);
      // Optionally redirect to quote details page
      // window.location.href = `/quote-details?quoteId=${savedQuote.id}`;
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Estimate/Quotation</h1>

      <div className="flex justify-between mb-4">
        <SearchByName ref={customerRef} />
        <ReferenceDetails ref={referenceRef} />
      </div>
      <QuotationTable ref={quotationTableRef} isEditing={true} />
      {error && <div className="text-red-500 mt-4">{error}</div>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 absolute right-6 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Quote"}
      </button>
    </div>
  );
};

export default AddNewQuote;
