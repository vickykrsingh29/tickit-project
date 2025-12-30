import React, { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ProductSupplied } from "../types";

interface OrderDetailsSectionProps {
  formData: ProductSupplied;
  setFormData: React.Dispatch<React.SetStateAction<ProductSupplied>>;
  userOptions: any[];
  currentUser: any;
}

const OrderDetailsSection: React.FC<OrderDetailsSectionProps> = ({
  formData,
  setFormData,
  userOptions,
  currentUser,
}) => {

  // Auto-select current user when available
  useEffect(() => {
    if (currentUser && (!formData.executiveName || !formData.executiveId)) {
      setFormData(prev => ({
        ...prev,
        executiveName: currentUser.label,
        executiveId: currentUser.value
      }));
    }
  }, [currentUser, setFormData, formData.executiveName, formData.executiveId]);
  return (
    <>
      {/* Quantity */}
      <div>
        <label className="block text-gray-700">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Unit Price */}
      <div>
        <label className="block text-gray-700">Unit Price (₹)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.unitPrice}
          onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Tax */}
      <div>
        <label className="block text-gray-700">Tax (%)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.tax}
          onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Total Amount */}
      <div>
        <label className="block text-gray-700">Total Amount (₹)</label>
        <input
          type="text"
          value={formData.totalAmount.toLocaleString('en-IN')}
          readOnly
          className="bg-gray-100 w-full p-2 border rounded"
        />
      </div>
      
      {/* Supply Date */}
      <div>
        <label className="block text-gray-700">
          Supply Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          selected={formData.supplyDate}
          onChange={(date) => setFormData({ ...formData, supplyDate: date })}
          className="w-full p-2 border rounded"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
        />
      </div>
      
      {/* Order/Invoice ID */}
      <div>
        <label className="block text-gray-700">Order/Invoice ID</label>
        <input
          type="text"
          value={formData.orderInvoiceId}
          onChange={(e) => setFormData({ ...formData, orderInvoiceId: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Status */}
      <div>
        <label className="block text-gray-700">Status</label>
        <Select
          options={[
            { value: "Pending", label: "Pending" },
            { value: "In Progress", label: "In Progress" },
            { value: "Delivered", label: "Delivered" },
          ]}
          value={{ value: formData.status, label: formData.status }}
          onChange={(option) => option && setFormData({ ...formData, status: option.value })}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      
      {/* Executive Name - updated to React Select */}
      <div>
        <label className="block text-gray-700">Executive Name</label>
        <Select
          options={userOptions}
          value={userOptions.find(option => option.value === formData.executiveId) || 
                 userOptions.find(option => option.label === formData.executiveName) || 
                 null}
          onChange={(option) => option && setFormData({ 
            ...formData, 
            executiveName: option.label,
            executiveId: option.value
          })}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Select executive"
          isSearchable
        />
      </div>
      
      {/* Warranty Valid Upto */}
      <div>
        <label className="block text-gray-700">Warranty Valid Upto</label>
        <DatePicker
          selected={formData.warrantyUpto}
          onChange={(date) => setFormData({ ...formData, warrantyUpto: date })}
          className="w-full p-2 border rounded"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
        />
      </div>
    </>
  );
};

export default OrderDetailsSection;