interface OrderCustomerDetailsProps {
    customerName: string;
    customerGST: string;
    customerEmail: string;
    customerPhone: string;
    // Billing address fields
    billingAddress: string;
    billingAddressLine2?: string;
    billingPin?: string;
    billingCity?: string;
    billingDistrict?: string;
    billingState?: string;
    billingCountry?: string;
    // Shipping address fields
    shippingAddress: string;
    shippingAddressLine2?: string;
    shippingPin?: string;
    shippingCity?: string;
    shippingDistrict?: string;
    shippingState?: string;
    shippingCountry?: string;
    // WPC address fields
    wpcAddress: string;
    wpcAddressLine2?: string;
    wpcPin?: string;
    wpcCity?: string;
    wpcDistrict?: string;
    wpcState?: string;
    wpcCountry?: string;
    // POC information
    pocName: string;
    pocEmail: string;
    pocPhone: string;
    pocDesignation: string;
    pocDepartment: string;
}

const OrderCustomerDetails = ({ props }: { props: OrderCustomerDetailsProps }) => {
    // Format address for display
    const formatAddress = (
        street: string,
        line2?: string,
        city?: string,
        district?: string,
        state?: string,
        pin?: string,
        country?: string
    ) => {
        const parts = [
            street,
            line2,
            [city, district].filter(Boolean).join(', '),
            [state, pin].filter(Boolean).join(' - '),
            country
        ].filter(Boolean);
        
        return parts.join('\n');
    };
    
    const billingAddress = formatAddress(
        props.billingAddress,
        props.billingAddressLine2,
        props.billingCity,
        props.billingDistrict,
        props.billingState,
        props.billingPin,
        props.billingCountry
    );
    
    const shippingAddress = formatAddress(
        props.shippingAddress,
        props.shippingAddressLine2,
        props.shippingCity,
        props.shippingDistrict,
        props.shippingState,
        props.shippingPin,
        props.shippingCountry
    );
    
    const wpcAddress = formatAddress(
        props.wpcAddress,
        props.wpcAddressLine2,
        props.wpcCity,
        props.wpcDistrict,
        props.wpcState,
        props.wpcPin,
        props.wpcCountry
    );
    
    return (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium">{props.customerName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">GST Number:</span>
                <span className="font-medium">{props.customerGST}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{props.customerEmail}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{props.customerPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Contact Person (POC)</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{props.pocName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{props.pocEmail}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{props.pocPhone}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Designation:</span>
                <span className="font-medium">{props.pocDesignation}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{props.pocDepartment}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
            <p className="text-gray-800 whitespace-pre-line">{billingAddress}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <p className="text-gray-800 whitespace-pre-line">{shippingAddress}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">WPC License Address</h3>
            <p className="text-gray-800 whitespace-pre-line">{wpcAddress}</p>
          </div>
        </div>
      </div>
    )
}

export default OrderCustomerDetails;