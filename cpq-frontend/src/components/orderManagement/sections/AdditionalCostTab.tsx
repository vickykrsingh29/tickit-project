import React from 'react'

const AdditionalCostTab = (props : any) => {
  const isInclusive = (amount: number | string) => {
    return !amount || Number(amount) === 0;
  };

  const formatAmount = (amount: number | string) => {
    const value = Number(amount);
    return value > 0 ? value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) : "0.00";
  };

  const handleAmountChange = (value: string, setter: (value: string) => void) => {
    const sanitizedValue = value.replace(/-/g, '');
    
    if (sanitizedValue === '' || !isNaN(Number(sanitizedValue))) {
      setter(sanitizedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const calculateTotalAdditionalCosts = () => {
    return (
      Number(props.liquidatedDamagesAmount || 0) +
      Number(props.freightChargeAmount || 0) +
      Number(props.transitInsuranceAmount || 0) +
      Number(props.installationAmount || 0) +
      Number(props.securityDepositAmount || 0) +
      Number(props.liaisoningAmount || 0)
    );
  };

  const totalAdditionalCosts = calculateTotalAdditionalCosts();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Liquidated Damages */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Liquidated Damages
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isInclusive(props.liquidatedDamagesAmount) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Additional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 text-right border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={props.liquidatedDamagesAmount || ''}
                    onChange={(e) => handleAmountChange(e.target.value, props.setLiquidatedDamagesAmount)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                  />
                </td>
              </tr>

              {/* Freight Charge */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Freight Charge
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isInclusive(props.freightChargeAmount) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Additional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 text-right border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={props.freightChargeAmount || ''}
                    onChange={(e) => handleAmountChange(e.target.value, props.setFreightChargeAmount)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                  />
                </td>
              </tr>

              {/* Transit Insurance */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Transit Insurance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isInclusive(props.transitInsuranceAmount) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Additional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 text-right border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={props.transitInsuranceAmount || ''}
                    onChange={(e) => handleAmountChange(e.target.value, props.setTransitInsuranceAmount)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                  />
                </td>
              </tr>

              {/* Installation */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Installation
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isInclusive(props.installationAmount) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Additional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 text-right border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={props.installationAmount || ''}
                    onChange={(e) => handleAmountChange(e.target.value, props.setInstallationAmount)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                  />
                </td>
              </tr>

              {/* Security Deposit */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Security Deposit
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isInclusive(props.securityDepositAmount) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Additional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 text-right border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={props.securityDepositAmount || ''}
                    onChange={(e) => handleAmountChange(e.target.value, props.setSecurityDepositAmount)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                  />
                </td>
              </tr>

              {/* Liaisoning */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Liaisoning
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isInclusive(props.liaisoningAmount) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inclusive
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Additional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 text-right border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={props.liaisoningAmount || ''}
                    onChange={(e) => handleAmountChange(e.target.value, props.setLiaisoningAmount)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Additional Costs */}
      <div className="mt-6 flex justify-end">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 w-64">
          <div className="flex justify-between font-bold">
            <span>Total Additional Costs:</span>
            <span>₹{formatAmount(totalAdditionalCosts)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdditionalCostTab