interface OrderCostDetailsProps {
  additionalCost: {
    liquidatedDamages: { inclusive: boolean; amount: number };
    freightCharge: { inclusive: boolean; amount: number };
    transitInsurance: { inclusive: boolean; amount: number };
    installation: { inclusive: boolean; amount: number };
    securityDeposit: { inclusive: boolean; amount: number };
    liaisoning: { inclusive: boolean; amount: number };
  };
  additionalCostTotal?: number;
  grandTotal: number;
}

const OrderCostDetails = ({ props }: { props: OrderCostDetailsProps }) => {
  const calculateAdditionalCostTotal = (): number => {
    let total = 0;
    
    if (!props.additionalCost.liquidatedDamages.inclusive) {
      total += props.additionalCost.liquidatedDamages.amount || 0;
    }
    
    if (!props.additionalCost.freightCharge.inclusive) {
      total += props.additionalCost.freightCharge.amount || 0;
    }
    
    if (!props.additionalCost.transitInsurance.inclusive) {
      total += props.additionalCost.transitInsurance.amount || 0;
    }
    
    if (!props.additionalCost.installation.inclusive) {
      total += props.additionalCost.installation.amount || 0;
    }
    
    if (!props.additionalCost.securityDeposit.inclusive) {
      total += props.additionalCost.securityDeposit.amount || 0;
    }
    
    if (!props.additionalCost.liaisoning.inclusive) {
      total += props.additionalCost.liaisoning.amount || 0;
    }
    
    return total;
  };
  
  const additionalCostTotal = props.additionalCostTotal !== undefined ? 
    props.additionalCostTotal : 
    calculateAdditionalCostTotal();
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Additional Cost Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Liquidated Damages
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {props.additionalCost.liquidatedDamages.inclusive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Extra Cost
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {props.additionalCost.liquidatedDamages.inclusive
                    ? "-"
                    : `₹${(props.additionalCost.liquidatedDamages.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Freight Charge
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {props.additionalCost.freightCharge.inclusive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Extra Cost
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {props.additionalCost.freightCharge.inclusive
                    ? "-"
                    : `₹${(props.additionalCost.freightCharge.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Transit Insurance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {props.additionalCost.transitInsurance.inclusive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Extra Cost
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {props.additionalCost.transitInsurance.inclusive
                    ? "-"
                    : `₹${(props.additionalCost.transitInsurance.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Installation
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {props.additionalCost.installation.inclusive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Extra Cost
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {props.additionalCost.installation.inclusive
                    ? "-"
                    : `₹${(props.additionalCost.installation.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Security Deposit
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {props.additionalCost.securityDeposit.inclusive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Extra Cost
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {props.additionalCost.securityDeposit.inclusive
                    ? "-"
                    : `₹${(props.additionalCost.securityDeposit.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Liaisoning
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {props.additionalCost.liaisoning.inclusive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Extra Cost
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {props.additionalCost.liaisoning.inclusive
                    ? "-"
                    : `₹${(props.additionalCost.liaisoning.amount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-right font-medium">
                  Additional Costs Total:
                </td>
                <td className="px-6 py-4 text-right text-blue-600 font-bold">
                  ₹{additionalCostTotal > 0 ? additionalCostTotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : "0.00"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Grand Total</h3>
            <p className="text-blue-600 text-sm">
              Items total + Additional costs
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
  )
}

export default OrderCostDetails;