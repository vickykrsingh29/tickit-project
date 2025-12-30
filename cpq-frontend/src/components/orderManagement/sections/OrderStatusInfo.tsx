import React from "react";
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaClock, 
  FaShippingFast, 
  FaBoxOpen, 
  FaFileSignature,
  FaUserEdit,
  FaIdCard,
  FaComment,
  FaCalendarAlt 
} from "react-icons/fa";

interface OrderStatusInfoProps {
  status: string;
  licenseType?: string;
  licenseStatus?: boolean;
  liaisoningRemarks?: string;
  orderCreationDate?: string;
  orderDate?: string;
  executiveName?: string;
  requiresLicense?: boolean;
  liaisoningVerified?: boolean;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  orderRemarks?: string;
  // We'll simulate the timeline events for now
  // In the future, these would come from a real history/events table
}

const OrderStatusInfo: React.FC<OrderStatusInfoProps> = ({
  status,
  licenseType,
  licenseStatus,
  liaisoningRemarks,
  orderCreationDate,
  orderDate,
  executiveName,
  requiresLicense,
  liaisoningVerified,
  licenseNumber,
  licenseExpiryDate,
  orderRemarks
}) => {
  // Simulate order timeline events
  const orderEvents = [
    {
      id: 1,
      type: "created",
      date: orderCreationDate || new Date().toISOString().split('T')[0],
      user: executiveName || "System",
      description: "Order was created"
    },
    {
      id: 2,
      type: "updated",
      date: orderDate || new Date().toISOString().split('T')[0],
      user: executiveName || "System",
      description: "Order details were updated"
    },
    // You would fetch these from your backend in a real implementation
    {
      id: 3,
      type: "status_change",
      date: new Date().toISOString().split('T')[0],
      user: "System",
      description: `Order status changed to ${status}`
    }
  ];

  // Function to get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <FaCheckCircle className="text-green-500" />,
          textColor: "text-green-700"
        };
      case "shipped":
      case "in transit":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <FaShippingFast className="text-blue-500" />,
          textColor: "text-blue-700"
        };
      case "pending":
      case "processing":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <FaClock className="text-yellow-500" />,
          textColor: "text-yellow-700"
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <FaTimesCircle className="text-red-500" />,
          textColor: "text-red-700"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <FaExclamationTriangle className="text-gray-500" />,
          textColor: "text-gray-700"
        };
    }
  };

  const getLicenseDisplay = () => {
    if (!requiresLicense) {
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <FaIdCard className="text-gray-500" />,
        textColor: "text-gray-700",
        label: "No License Required"
      };
    }
    
    if (liaisoningVerified) {
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <FaCheckCircle className="text-green-500" />,
        textColor: "text-green-700",
        label: "License Verified"
      };
    }
    
    return {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <FaExclamationTriangle className="text-yellow-500" />,
      textColor: "text-yellow-700",
      label: "License Pending Verification"
    };
  };

  const statusDisplay = getStatusDisplay(status);
  const licenseDisplay = getLicenseDisplay();

  // Get icon for timeline event
  const getEventIcon = (type: string) => {
    switch (type) {
      case "created":
        return <FaFileSignature className="text-blue-500" />;
      case "updated":
        return <FaUserEdit className="text-indigo-500" />;
      case "status_change":
        return statusDisplay.icon;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Order Status</h3>
            <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${statusDisplay.color}`}>
              {statusDisplay.icon}
              <span className="font-medium">{status}</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-4">
            <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <FaFileSignature className="text-2xl text-blue-500 mb-2" />
              <span className="text-xs text-center text-gray-600">Created</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <FaBoxOpen className="text-2xl text-purple-500 mb-2" />
              <span className="text-xs text-center text-gray-600">Processing</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <FaShippingFast className="text-2xl text-blue-500 mb-2" />
              <span className="text-xs text-center text-gray-600">Shipped</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <FaCheckCircle className="text-2xl text-green-500 mb-2" />
              <span className="text-xs text-center text-gray-600">Delivered</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-200">
              <FaTimesCircle className="text-2xl text-red-500 mb-2" />
              <span className="text-xs text-center text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>

        {/* License Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">License Status</h3>
            <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${licenseDisplay.color}`}>
              {licenseDisplay.icon}
              <span className="font-medium">{licenseDisplay.label}</span>
            </div>
          </div>
          <div className="space-y-3 mt-2">
            {requiresLicense && (
              <>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">License Number:</span>
                  <span className="font-medium">{licenseNumber || "Not available"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-medium">{licenseExpiryDate || "Not available"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Status:</span>
                  <span className={`font-medium ${liaisoningVerified ? "text-green-600" : "text-yellow-600"}`}>
                    {liaisoningVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              </>
            )}
            {!requiresLicense && (
              <div className="text-gray-600 italic">
                This order does not require a license.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <FaComment className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-700">Liaising Remarks</h4>
                <p className="text-gray-600 mt-1">
                  {liaisoningRemarks || "No liaising remarks available"}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <FaComment className="text-indigo-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-700">Order Remarks</h4>
                <p className="text-gray-600 mt-1">
                  {orderRemarks || "No order remarks available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Timeline</h3>
        <div className="space-y-6">
          {orderEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline connector */}
              {index < orderEvents.length - 1 && (
                <div className="absolute left-6 top-6 h-full w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-white z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                    {getEventIcon(event.type)}
                  </div>
                </div>
                
                <div className="ml-4 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <h4 className="font-medium text-gray-800">{event.description}</h4>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <p className="text-gray-600 mt-1">By: {event.user}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusInfo;
