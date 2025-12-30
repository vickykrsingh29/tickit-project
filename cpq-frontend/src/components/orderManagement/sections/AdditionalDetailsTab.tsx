import React from 'react'

const AdditionalDetailsTab = (props : any) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Term
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={props.paymentTerm}
            onChange={(e) => props.setPaymentTerm(e.target.value)}
            placeholder="e.g., 30 days net"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mode of Dispatch
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={props.modeOfDispatch}
            onChange={(e) => props.setModeOfDispatch(e.target.value)}
            placeholder="e.g., Road, Air, Ship"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Instruction / Period
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            value={props.deliveryInstruction}
            onChange={(e) => props.setDeliveryInstruction(e.target.value)}
            rows={3}
            placeholder="Enter delivery instructions or expected delivery period..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warranty
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={props.warranty}
            onChange={(e) => props.setWarranty(e.target.value)}
            placeholder="e.g., 12 months from date of installation"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Remarks
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            value={props.orderRemarks}
            onChange={(e) => props.setOrderRemarks(e.target.value)}
            rows={4}
            placeholder="Enter any additional notes or remarks about this order..."
          />
        </div>
      </div>
    </div>
  );
}

export default AdditionalDetailsTab