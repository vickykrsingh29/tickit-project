
interface OrderInfoBasicProps {
    orderNumber: string;
    orderDate: string;
    orderCreationDate: string;
    executiveName: string;
    paymentTerm: string;
    modeOfDispatch: string;
    warranty: string;
    deliveryInstruction: string;
    grandTotal: number;
}

const OrderInfoBasic = ({ props }: { props: OrderInfoBasicProps }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{props.orderNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{props.orderDate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Creation Date:</span>
                    <span className="font-medium">{props.orderCreationDate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Executive Name:</span>
                    <span className="font-medium">{props.executiveName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Delivery & Payment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Payment Term:</span>
                    <span className="font-medium">{props.paymentTerm}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Mode of Dispatch:</span>
                    <span className="font-medium">{props.modeOfDispatch}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Warranty:</span>
                    <span className="font-medium">{props.warranty}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Delivery Instructions</h3>
              <p className="text-gray-800">{props.deliveryInstruction}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Total Order Value</h3>
                  <p className="text-blue-600 text-sm">
                    Including all items, taxes, and additional costs
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  ₹{props.grandTotal > 0 ? props.grandTotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : "0.00"}
                </div>
              </div>
            </div>
        </div>
    );
};

export default OrderInfoBasic;
