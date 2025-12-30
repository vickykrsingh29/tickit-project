import React, { forwardRef, useImperativeHandle, useState } from "react";

const ReferenceDetails = forwardRef((props, ref) => {
  const [refNo, setRefNo] = useState("2");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  useImperativeHandle(ref, () => ({
    getRefNo: () => refNo,
    getInvoiceDate: () => invoiceDate
  }));

  return (
    <div className="text-right">
      <div>
        <label className="block text-sm font-medium mb-2">Invoice Date</label>
        <input
          type="date"
          className="border border-gray-300 rounded p-2 w-full"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
        />
      </div>
    </div>
  );
});

export default ReferenceDetails;