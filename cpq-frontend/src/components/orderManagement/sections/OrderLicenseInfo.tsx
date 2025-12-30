
interface OrderLicenseInfoProps {
    requiresLicense: boolean;
    licenseType: string;
    licenseNumber: string;
    licenseIssueDate: string;
    licenseExpiryDate: string;
    licenseQuantity: string;
    wpcAddress: string;
    liaisoningRemarks: string;
    liaisoningVerified: boolean;
}

const OrderLicenseInfo = ({ props }: { props: OrderLicenseInfoProps }) => {
    return (
        <div className="space-y-6">
        {!props.requiresLicense ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No License Required</h3>
            <p className="mt-1 text-gray-500">
              This order does not require any license or WPC approval.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">License Status</h3>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    props.licenseType === "has-license-no-issues"
                      ? "bg-green-100 text-green-800"
                      : props.licenseType === "has-license-needs-additional"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {props.licenseType === "has-license-no-issues"
                    ? "Valid License"
                    : props.licenseType === "has-license-needs-additional"
                    ? "Needs Additional"
                    : "No License"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">License Number:</span>
                      <span className="font-medium">{props.licenseNumber || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="font-medium">{props.licenseIssueDate || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">{props.licenseExpiryDate || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Licensed Quantity:</span>
                      <span className="font-medium">{props.licenseQuantity || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">WPC License Address:</span>
                      <span className="font-medium">{props.wpcAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {props.liaisoningRemarks && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="text-md font-medium text-yellow-800 mb-2">Liaisoning Remarks</h3>
                <p className="text-yellow-800">{props.liaisoningRemarks}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-6 w-6 rounded-full ${
                    props.liaisoningVerified ? "bg-green-100" : "bg-red-100"
                  } flex items-center justify-center mr-3`}
                >
                  {props.liaisoningVerified ? (
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    props.liaisoningVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {props.liaisoningVerified
                    ? "License details verified by liaisoning department"
                    : "License details not verified"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    )
}

export default OrderLicenseInfo;