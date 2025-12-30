import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  FaArrowLeft, FaArrowRight, FaTrash,  FaFacebookSquare,
  FaTwitterSquare,
  FaLinkedin,
  FaInstagramSquare,
  FaYoutubeSquare,  
} from "react-icons/fa";
import EditCustomerModal from "../components/EditCustomerModal";
import TransactionsTable from "../components/TransactionsTable";
import POCsTable from "../components/POCsTable";

// Simplified interfaces to match actual data model
interface Customer {
  id: number;
  name: string;
  ancillaryName: string;
  email: string;
  phone: string;
  industry: string;
  typeOfCustomer: string;
  website: string;
  socialHandles: [{ platform: string; link: string }];
  gstNumber?: string;
  salesRep: string;
  billingStreetAddress: string;
  billingAddressLine2?: string;
  billingPin: string;
  billingCity: string;
  billingDistrict: string;
  billingState: string;
  billingCountry: string;
  shippingStreetAddress: string;
  shippingAddressLine2?: string;
  shippingPin: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingState: string;
  shippingCountry: string;
  sameAsBilling: boolean;
  wpcSameAsBilling: boolean;
  wpcStreetAddress: string;
  wpcAddressLine2?: string;
  wpcPin: string;
  wpcCity: string;
  wpcDistrict: string;
  wpcState: string;
  wpcCountry: string;
  userId: string;
  logoUrl?: string;
  documents: string[]; // Change to simple string array like ProductDetailsPage
  images?: string[]; // Add this property for images
}

const CustomerDetailsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get("customerId");
  const [activeTab, setActiveTab] = useState("documents");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCustomer),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      const data = await response.json();
      setCustomer(data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer? This will also delete all associated transactions and documents."
    );
    if (!confirmDelete) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      // Prepare an array of customer IDs to delete
      const customerIdsToDelete = [customerId];

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: customerIdsToDelete }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete customer");
      }

      alert("Customer deleted successfully");
      window.location.href = "/customers";
    } catch (err: any) {
      console.error("Error deleting customer:", err);
      alert(err.message || "Failed to delete customer. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} , ${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch customer data.");
        }
        const data = await response.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    } else {
      setLoading(false);
      setError("Customer ID is missing in the URL.");
    }
  }, [customerId, getAccessTokenSilently]);

  const goToPrevious = () => {
    const images = customer?.images || [];
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    const images = customer?.images || [];
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleUpdate = async () => {
    // Fetch updated customer data
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch updated customer");
      const data = await response.json();
      setCustomer(data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Logo and Basic Info */}
        <div className="flex gap-6 mb-6">
          {/* Company Logo/Image - Match height with info box */}
          <div className="w-52 h-[180px] bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
            <div className="relative h-full group">
              <img
                src={
                  customer.images?.[currentIndex] ||
                  "https://www.nextiva.com/cdn-cgi/image/width=1979,height=1115,fit=cover,gravity=auto,format=auto/blog/wp-content/uploads/sites/10/customer-service-examples-feature-image2.png"
                }
                alt={customer.name}
                className="w-full h-full object-contain"
              />

              {/* Navigation Buttons */}
              {(customer.images?.length || 0) > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                  <button
                    onClick={goToPrevious}
                    className="p-1.5 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
                  >
                    <FaArrowLeft className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="p-1.5 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
                  >
                    <FaArrowRight className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="flex-1 bg-white rounded-lg shadow-sm h-[180px]">
            <div className="p-6 h-full flex flex-col justify-between">
              {/* Header Section */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 inline-block mb-2">
                      {customer.industry} - {customer.typeOfCustomer}
                    </span>
                    <h1 className="text-2xl font-bold">
                      {customer.name} - {customer.ancillaryName}
                    </h1>
                    {/* <p className="text-gray-600 text-sm">
                      POC: {customer.pocName} ({customer.pocDesignation})
                    </p> */}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      {
                        customer.socialHandles.map((social) => (
                          <a href={social.link} target="_blank" rel="noopener noreferrer">
                            {
                              social.platform === "facebook" && (
                                <FaFacebookSquare className="text-[#4267B2]" size={28} />
                              )
                            }
                            {
                              social.platform === "twitter" && (
                                <FaTwitterSquare className="text-[#1DA1F2]" size={28} />
                              )
                            }
                            {
                              social.platform === "linkedin" && (
                                <FaLinkedin className="text-[#0077B5]" size={28}  />
                              )
                            }
                            {
                              social.platform === "instagram" && (
                                <FaInstagramSquare className="text-[#E4405F]" size={28} />
                              )
                            }
                            {
                              social.platform === "youtube" && (
                                <FaYoutubeSquare className="text-[#FF0000]" size={28} />
                              )
                            }
                          </a>
                        ))
                      }
                    </div>
                    <button
                      onClick={handleDeleteCustomer}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FaTrash size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="h-9 px-4 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Info Grid - Single Line */}
              <div className="flex justify-between">
                <div className="w-fit">
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <p className="text-sm font-medium truncate">
                    <a href={`mailto:${customer.email}`} className="text-blue-500">
                      {customer.email}
                    </a>
                  </p>
                </div>
                <div className="w-fit">
                  <p className="text-gray-500 text-xs mb-1">Phone</p>
                  <p className="text-sm font-medium">
                    <a href={`tel:${customer.phone}`} className="text-blue-500">
                      {customer.phone}
                    </a>
                  </p>
                </div>
                {/* <div>
                  <p className="text-gray-500 text-xs mb-1">POC Email</p>
                  <p className="text-sm font-medium truncate">
                    {customer.pocEmail}
                  </p>
                </div> */}
                <div className="w-fit">
                  <p className="text-gray-500 text-xs mb-1">Website</p>
                  <p className="text-sm text-blue-500 font-medium truncate">
                    <a href={customer.website} target="_blank" rel="noopener noreferrer">
                      {customer.website}
                    </a>
                  </p>
                </div>
                {customer.gstNumber && (
                  <div className="w-fit">
                    <p className="text-gray-500 text-xs mb-1">GST Number</p>
                    <p className="text-sm font-medium">{customer.gstNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex px-6">
              {["documents", "address", "transactions", "POCs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-4 text-sm font-medium relative ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* ...existing tab content... */}
            {activeTab === "documents" && (
              <div className="space-y-4">
                {customer.documents?.map((doc: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📄</span>
                      <p className="font-medium">{doc.split("/").pop()}</p>
                    </div>
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      <span>⬇️</span>
                      Download
                    </a>
                  </div>
                ))}

                {(!customer.documents || customer.documents.length === 0) && (
                  <p className="text-gray-500 text-center py-4">
                    No documents available
                  </p>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div className="grid grid-cols-1 gap-6">
                {customer.sameAsBilling && customer.wpcSameAsBilling ? (
                  <div className="bg-white rounded-lg p-6 shadow">
                    <h3 className="text-lg font-medium mb-4">
                      Billing, Shipping, and WPC Address
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Street:</span>{" "}
                        {customer.billingStreetAddress}
                      </p>
                      {customer.billingAddressLine2 && (
                        <p className="text-gray-700">
                          <span className="font-medium">Line 2:</span>{" "}
                          {customer.billingAddressLine2}
                        </p>
                      )}
                      <p className="text-gray-700">
                        <span className="font-medium">City:</span> {customer.billingCity}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">District:</span>{" "}
                        {customer.billingDistrict}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">State:</span> {customer.billingState}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Country:</span>{" "}
                        {customer.billingCountry}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">PIN:</span> {customer.billingPin}
                      </p>
                    </div>
                  </div>
                ) : customer.sameAsBilling || customer.wpcSameAsBilling ? (
                  <>
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-medium mb-4">
                        {customer.sameAsBilling ? "Billing and Shipping Address" : "Billing and WPC Address"}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Street:</span>{" "}
                          {customer.billingStreetAddress}
                        </p>
                        {customer.billingAddressLine2 && (
                          <p className="text-gray-700">
                            <span className="font-medium">Line 2:</span>{" "}
                            {customer.billingAddressLine2}
                          </p>
                        )}
                        <p className="text-gray-700">
                          <span className="font-medium">City:</span> {customer.billingCity}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">District:</span>{" "}
                          {customer.billingDistrict}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">State:</span> {customer.billingState}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Country:</span>{" "}
                          {customer.billingCountry}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">PIN:</span> {customer.billingPin}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-medium mb-4">
                        {customer.sameAsBilling ? "WPC Address" : "Shipping Address"}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Street:</span>{" "}
                          {customer.sameAsBilling ? customer.wpcStreetAddress : customer.shippingStreetAddress}
                        </p>
                        {(customer.sameAsBilling ? customer.wpcAddressLine2 : customer.shippingAddressLine2) && (
                          <p className="text-gray-700">
                            <span className="font-medium">Line 2:</span>{" "}
                            {customer.sameAsBilling ? customer.wpcAddressLine2 : customer.shippingAddressLine2}
                          </p>
                        )}
                        <p className="text-gray-700">
                          <span className="font-medium">City:</span>{" "}
                          {customer.sameAsBilling ? customer.wpcCity : customer.shippingCity}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">District:</span>{" "}
                          {customer.sameAsBilling ? customer.wpcDistrict : customer.shippingDistrict}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">State:</span>{" "}
                          {customer.sameAsBilling ? customer.wpcState : customer.shippingState}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Country:</span>{" "}
                          {customer.sameAsBilling ? customer.wpcCountry : customer.shippingCountry}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">PIN:</span>{" "}
                          {customer.sameAsBilling ? customer.wpcPin : customer.shippingPin}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  // All addresses are different
                  <>
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Street:</span>{" "}
                          {customer.billingStreetAddress}
                        </p>
                        {customer.billingAddressLine2 && (
                          <p className="text-gray-700">
                            <span className="font-medium">Line 2:</span>{" "}
                            {customer.billingAddressLine2}
                          </p>
                        )}
                        <p className="text-gray-700">
                          <span className="font-medium">City:</span> {customer.billingCity}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">District:</span>{" "}
                          {customer.billingDistrict}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">State:</span> {customer.billingState}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Country:</span>{" "}
                          {customer.billingCountry}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">PIN:</span> {customer.billingPin}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Street:</span>{" "}
                          {customer.shippingStreetAddress}
                        </p>
                        {customer.shippingAddressLine2 && (
                          <p className="text-gray-700">
                            <span className="font-medium">Line 2:</span>{" "}
                            {customer.shippingAddressLine2}
                          </p>
                        )}
                        <p className="text-gray-700">
                          <span className="font-medium">City:</span> {customer.shippingCity}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">District:</span>{" "}
                          {customer.shippingDistrict}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">State:</span> {customer.shippingState}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Country:</span>{" "}
                          {customer.shippingCountry}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">PIN:</span> {customer.shippingPin}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow">
                      <h3 className="text-lg font-medium mb-4">WPC Address</h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Street:</span>{" "}
                          {customer.wpcStreetAddress}
                        </p>
                        {customer.wpcAddressLine2 && (
                          <p className="text-gray-700">
                            <span className="font-medium">Line 2:</span>{" "}
                            {customer.wpcAddressLine2}
                          </p>
                        )}
                        <p className="text-gray-700">
                          <span className="font-medium">City:</span> {customer.wpcCity}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">District:</span>{" "}
                          {customer.wpcDistrict}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">State:</span> {customer.wpcState}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Country:</span>{" "}
                          {customer.wpcCountry}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">PIN:</span> {customer.wpcPin}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "transactions" && (
              <TransactionsTable customerId={customerId || ""} />
            )}

            {activeTab === "POCs" && (
              <POCsTable customerId={customerId || ""} />
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customerId={customerId || ""}
          onUpdateCustomer={handleUpdate} // Use the new handler
        />
      )}
    </div>
  );
};

export default CustomerDetailsPage;
