interface OrderItemDetail {
  id: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  // Additional fields
  orderId?: number;
  productId?: number;
  skuId?: string;
  unit?: string;
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

interface OrderItemsInfoProps {
  items: OrderItemDetail[];
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
}

const OrderItemsInfo = ({ props }: { props: OrderItemsInfoProps }) => {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax (%)
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {props.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {item.description || ''}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.quantity}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  ₹{item.unitPrice.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.taxRate}%
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-right">
                  ₹{item.totalAmount > 0 ? item.totalAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : "0.00"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals Card */}
      <div className="mt-6 flex justify-end">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 w-64">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Subtotal:</span>
            <span>₹{props.subtotal ? props.subtotal.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : "0.00"}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Tax:</span>
            <span>₹{props.taxAmount ? props.taxAmount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : "0.00"}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{props.totalAmount ? props.totalAmount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : "0.00"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderItemsInfo;