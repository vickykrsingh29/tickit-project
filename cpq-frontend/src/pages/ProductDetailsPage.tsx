import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";
import EditProductModal from "../components/EditProductModal";

export const ProductDetailsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sku = queryParams.get("sku");
  const [activeTab, setActiveTab] = useState("features");
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${sku}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Including JWT token in the request
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product data.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found.
      </div>
    );
  }
  const images = product.images;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} , ${day}/${month}/${year}`;
  };
  // On successful update, either refetch product or refresh the page
  const handleUpdate = () => {
    setIsEditModalOpen(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE! },
      });
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skuIds: [product.skuId] }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Close tab (only works if it was opened via script; otherwise consider redirect)
      window.close();
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {product.stockQuantity > 0 ? "Available" : "Out of Stock"}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
            <p className="whitespace-pre-line">
              {product.notes || "No notes available."}
            </p>
          </div>
          <div className="flex gap-2">
            <FaTrash
              className="text-gray-500 hover:text-red-600 cursor-pointer mt-2 mr-2 "
              size={24}
              onClick={handleDelete}
            />

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Edit Details
            </button>

            <EditProductModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              productSku={product?.skuId} // Pass SKU instead of numeric ID
              onUpdateProduct={handleUpdate}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="md:col-span-2">
            <div className="relative group bg-white rounded-lg shadow overflow-hidden">
              {/* Main Image Container */}
              <div className="relative ">
                <img
                  src={
                    images[currentIndex] ||
                    "https://cdn.shopify.com/app-store/listing_images/bae989bf4724d93e23eb869553c6d019/promotional_image/CIzfsvvWuoADEAE=.jpeg?height=720&quality=90&width=1280"
                  }
                  alt={product?.productName || "Product"}
                  className="w-full h-96 object-contain transform transition-transform duration-700 ease-in-out hover:scale-105"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg transform transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white"
                aria-label="Previous image"
              >
                <FaArrowLeft className="w-6 h-6 text-gray-800" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg transform transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white"
                aria-label="Next image"
              >
                <FaArrowRight className="w-6 h-6 text-gray-800" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Thumbnail Navigation */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4">
                {images.map((_: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Actions */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold mb-4">
                  ₹{product.priceWithGST.toFixed(2)}
                  <span className="text-sm text-gray-600">
                    {" "}
                    per {product.unitOfMeasurement}
                    (inclusive of {product.gst}% GST)
                  </span>
                </h2>
                <h3 className="text-lg font-bold">
                  Price without GST
                  <span className="text-lg text-gray-600">
                    : ₹{product.pricePerPiece}
                  </span>
                </h3>
                <h3 className="text-lg font-bold">
                  Stock
                  <span className="text-lg text-gray-600">
                    : {product.stockQuantity} {product.unitOfMeasurement}
                  </span>
                </h3>
                <h3 className="text-lg font-bold">
                  Brand
                  <span className="text-lg text-gray-600">
                    : {product.brand}
                  </span>
                </h3>
                <h3 className="text-lg font-bold">
                  SKU ID
                  <span className="text-lg text-gray-600">
                    : {product.skuId}
                  </span>
                </h3>
                <h3 className="text-lg font-bold">
                  Created At
                  <span className="text-lg text-gray-600">
                    : {formatDate(product.createdAt)}
                  </span>
                </h3>
                <h3 className="text-lg font-bold">
                  Updated At
                  <span className="text-lg text-gray-600">
                    : {formatDate(product.updatedAt)}
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["features", "specs", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium text-sm mr-4 ${
                    activeTab === tab
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            {activeTab === "features" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="whitespace-pre-line">
                  {product.features || "No features available."}
                </p>
              </div>
            )}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="whitespace-pre-line">
                  {product.specifications || "No specifications available."}
                </p>
              </div>
            )}
            {activeTab === "documents" && (
              <div className="space-y-4">
                {product.documents.map((doc: string, idx: number) => (
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
                      download
                      className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      <span>⬇️</span>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
