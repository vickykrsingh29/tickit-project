import { useAuth0 } from "@auth0/auth0-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import CreatableSelect from "react-select/creatable";

interface AddNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

interface Option {
  value: string;
  label: string;
}

interface Product {
  id: number;
  productName: string;
  brand: string;
  category: string;
  skuId: string;
  images: string[];
  pricePerPiece: number;
  stockQuantity: number;
  unitOfMeasurement: string;
  documents: string[];
  features: string;
  specifications: string;
  notes: string;
  gst: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const AddNewProductModal: React.FC<AddNewProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const { getAccessTokenSilently, user } = useAuth0();

  const [productName, setProductName] = useState("");
  const [skuId, setSkuId] = useState("");
  const [brand, setBrand] = useState<Option | null>(null);
  const [category, setCategory] = useState<Option | null>(null);
  const [unitOfMeasurement, setUnitOfMeasurement] = useState<Option | null>(null);
  const [pricePerPiece, setPricePerPiece] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<string>("");
  const [features, setFeatures] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [notes, setNotes] = useState("");
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [gst, setGst] = useState<string>("");
  const [images, setImages] = useState<FileList | null>(null);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleAddOption = (
    inputValue: string,
    setOptions: React.Dispatch<React.SetStateAction<Option[]>>,
    setSelected: React.Dispatch<React.SetStateAction<Option | null>>
  ) => {
    const newOption = { value: inputValue, label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    setSelected(newOption);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = newDocuments.concat(newFiles);

      if (allFiles.length > 10) {
        alert("You can only upload a maximum of 10 documents.");
        e.target.value = ""; // Reset the input field
        return;
      }

      setNewDocuments(allFiles);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = images ? Array.from(images).concat(newFiles) : newFiles;

      if (allFiles.length > 10) {
        alert("You can only upload a maximum of 10 images.");
        e.target.value = ""; // Reset the input field
        return;
      }

      setImages((prev) => {
        const dt = new DataTransfer();
        allFiles.forEach((file) => dt.items.add(file));
        return dt.files;
      });

      // Create new preview URLs
      const urls = allFiles.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls(urls);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  useEffect(() => {
    const fetchSkuId = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/generate-skuId`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch SKU ID");
        }

        const data = await response.json();
        setSkuId(data.skuId);
      } catch (error) {
        console.error("Error fetching SKU ID:", error);
      }
    };

    if (isOpen) {
      fetchSkuId();
    }
  }, [isOpen, getAccessTokenSilently]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const [brandsRes, categoriesRes, unitsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/brands`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/units`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!brandsRes.ok || !categoriesRes.ok || !unitsRes.ok) {
          throw new Error("Failed to fetch options");
        }

        const [brandsData, categoriesData, unitsData]: Option[][] =
          await Promise.all([
            brandsRes.json(),
            categoriesRes.json(),
            unitsRes.json(),
          ]);

        setBrands(brandsData);
        setCategories(categoriesData);
        setUnits(unitsData);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, getAccessTokenSilently]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("skuId", skuId);
      formData.append("brand", brand?.value || "");
      formData.append("category", category?.value || "");
      formData.append("unitOfMeasurement", unitOfMeasurement?.value || "");
      formData.append("pricePerPiece", pricePerPiece.toString());
      formData.append("stockQuantity", stockQuantity.toString());
      formData.append("gst", gst.toString());
      formData.append("features", features);
      formData.append("specifications", specifications);
      formData.append("notes", notes);
      formData.append("userId", user?.sub || "");

      // Append images
      if (images) {
        Array.from(images).forEach((file) => {
          formData.append("images", file);
        });
      }

      // Append documents
      newDocuments.forEach((file) => {
        formData.append("documents", file);
      });

      console.log("Submitting product with FormData");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error("Failed to submit product");
      }

      const addedProduct: Product = await response.json();
      onAddProduct(addedProduct);
      onClose();
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="absolute inset-y-0 right-0 w-full sm:w-3/5 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
        <div
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </div>
        <h2 className="text-xl font-bold mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Product Name*</label>
            <input
              name="productName"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">SKU ID*</label>
            <input
              name="skuId"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter SKU ID"
              value={skuId}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700">Brand</label>
            <CreatableSelect
              options={brands}
              isClearable
              onCreateOption={(inputValue) =>
                handleAddOption(inputValue, setBrands, setBrand)
              }
              value={brand}
              onChange={(selected) => setBrand(selected as Option)}
              placeholder="Select or type to create a brand"
            />
          </div>
          <div>
            <label className="block text-gray-700">Category</label>
            <CreatableSelect
              options={categories}
              isClearable
              onCreateOption={(inputValue) =>
                handleAddOption(inputValue, setCategories, setCategory)
              }
              value={category}
              onChange={(selected) => setCategory(selected as Option)}
              placeholder="Select or type to create a category"
            />
          </div>
          <div>
            <label className="block text-gray-700">Price Per Unit (without GST)*</label>
            <input
              type="number"
              min="0"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter price per piece (without GST)"
              value={pricePerPiece}
              onChange={(e) => setPricePerPiece(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Stock Quantity*</label>
            <input
              type="number"
              min="0"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter current stock quantity"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Unit of Measurement*</label>
            <CreatableSelect
              options={units}
              isClearable
              required
              onCreateOption={(inputValue) =>
                handleAddOption(inputValue, setUnits, setUnitOfMeasurement)
              }
              value={unitOfMeasurement}
              onChange={(selected) => setUnitOfMeasurement(selected as Option)}
              placeholder="Select or type to create a unit"
            />
          </div>
          <div>
            <label className="block text-gray-700">GST (%)*</label>
            <input
              name="gst"
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              className="w-full p-2 border rounded"
              placeholder="Enter GST percentage"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Features</label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Enter features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Specifications</label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Enter specifications"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Enter notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Images (Max 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="hidden"
              id="image-upload"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("image-upload") as HTMLInputElement;
                if (input) {
                  input.value = ""; // Reset the input field
                  input.click();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select Images
            </button>

            {/* Display new images */}
            <div className="mt-4 space-y-2">
              {Array.from(images || []).map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={URL.createObjectURL(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <IoEyeSharp size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(URL.createObjectURL(file));
                        setImagePreviewUrls((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                        setImages((prev) => {
                          if (!prev) return null;
                          const newFiles = Array.from(prev).filter((_, i) => i !== idx);
                          const dt = new DataTransfer();
                          newFiles.forEach((file) => dt.items.add(file));
                          return dt.files;
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Documents (Max 10)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="document-upload"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("document-upload") as HTMLInputElement;
                if (input) {
                  input.value = ""; // Reset the input field
                  input.click();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Select Documents
            </button>

            {/* Display new documents */}
            <div className="mt-4 space-y-2">
              {newDocuments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={URL.createObjectURL(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <IoEyeSharp size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDocuments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 text-right">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProductModal;