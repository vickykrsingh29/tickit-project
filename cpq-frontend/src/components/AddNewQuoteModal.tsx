import React, { useEffect } from "react";

interface AddNewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void; // Update with a proper type for quote data
}

const AddNewQuoteModal: React.FC<AddNewQuoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quoteData = Object.fromEntries(formData.entries());
    onSubmit(quoteData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      {/* Slide-in Panel */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
        <div
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </div>
        <h2 className="text-xl font-bold mb-6">Add New Quote</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-gray-700">Order ID*</label>
            <input
              name="orderId"
              type="number"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter order ID"
            />
          </div>
          <div>
            <label className="block text-gray-700">Customer Name*</label>
            <input
              name="customerName"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter customer name"
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-gray-700">Item*</label>
            <input
              name="item"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter item"
            />
          </div>
          <div>
            <label className="block text-gray-700">Status*</label>
            <select name="status" required className="w-full p-2 border rounded">
              <option value="">Choose status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-gray-700">Shipping Service*</label>
            <input
              name="shippingService"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter shipping service"
            />
          </div>
          <div>
            <label className="block text-gray-700">Validity*</label>
            <input
              name="validity"
              type="date"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewQuoteModal;
