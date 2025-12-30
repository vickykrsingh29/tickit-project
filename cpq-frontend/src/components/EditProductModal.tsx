import { useAuth0 } from "@auth0/auth0-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import CreatableSelect from "react-select/creatable";

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
  priceWithGST?: number; // Add this line
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSku: number | null;
  onUpdateProduct: (updated: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  productSku,
  onUpdateProduct,
}) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [formData, setFormData] = useState({
    productName: "",
    skuId: "",
    brand: "",
    category: "",
    unitOfMeasurement: "",
    pricePerPiece: "",
    stockQuantity: "",
    gst: "",
    features: "",
    specifications: "",
    notes: "",
    existingImages: [] as string[],
    existingDocuments: [] as string[],
    newImages: [] as File[],
    newDocuments: [] as File[],
    imagesToDelete: [] as string[],
    documentsToDelete: [] as string[],
  });

  const [brandOption, setBrandOption] = useState<Option | null>(null);
  const [categoryOption, setCategoryOption] = useState<Option | null>(null);
  const [unitOption, setUnitOption] = useState<Option | null>(null);
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, option: Option | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: option?.value || "",
    }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<FileList | null>>
  ) => {
    setFile(e.target.files);
  };

  // Update the handleImagesChange function to reset the input value
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages =
        formData.existingImages.length +
        formData.newImages.length +
        newFiles.length;
      if (totalImages > 10) {
        alert("You can only upload a maximum of 10 images.");
        e.target.value = ""; // Reset the input value
        return;
      }
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...newFiles],
      }));
    }
  };

  const handleDeleteNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formData.newDocuments.length + newFiles.length > 10) {
        alert("You can only upload a maximum of 10 documents.");
        e.target.value = ""; // Reset the input value
        return;
      }
      setFormData((prev) => ({
        ...prev,
        newDocuments: [...prev.newDocuments, ...newFiles],
      }));
    }
  };
  const handleDeleteNewDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newDocuments: prev.newDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteExistingImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img !== imageUrl),
      imagesToDelete: [...prev.imagesToDelete, imageUrl],
    }));
  };

  const handleDeleteExistingDocument = (docUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((doc) => doc !== docUrl),
      documentsToDelete: [...prev.documentsToDelete, docUrl],
    }));
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSku || !isOpen) return;
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${productSku}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch product");
        const data: Product = await response.json();

        setFormData({
          ...data,
          pricePerPiece: String(data.pricePerPiece),
          stockQuantity: String(data.stockQuantity),
          gst: String(data.gst),
          existingImages: data.images || [],
          existingDocuments: data.documents || [],
          newImages: [],
          newDocuments: [],
          imagesToDelete: [],
          documentsToDelete: [],
        });

        setBrandOption(
          data.brand ? { value: data.brand, label: data.brand } : null
        );
        setCategoryOption(
          data.category ? { value: data.category, label: data.category } : null
        );
        setUnitOption(
          data.unitOfMeasurement
            ? { value: data.unitOfMeasurement, label: data.unitOfMeasurement }
            : null
        );
      } catch (error) {
        console.error(error);
      }
    };

    const fetchOptions = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });
        const [brandsRes, categoriesRes, unitsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/brands`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/units`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!brandsRes.ok || !categoriesRes.ok || !unitsRes.ok) {
          throw new Error("Failed to fetch dropdown options");
        }
        const [b, c, u]: Option[][] = await Promise.all([
          brandsRes.json(),
          categoriesRes.json(),
          unitsRes.json(),
        ]);
        setBrands(b);
        setCategories(c);
        setUnits(u);
      } catch (error) {
        console.error(error);
      }
    };

    if (isOpen) {
      fetchProduct();
      fetchOptions();
    }
  }, [isOpen, productSku, getAccessTokenSilently]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!productSku) return;
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const formDataToSend = new FormData();

      // Calculate price with GST
      const pricePerPiece = parseFloat(formData.pricePerPiece);
      const gstRate = parseFloat(formData.gst);
      const priceWithGST = pricePerPiece * (1 + gstRate / 100);

      const productData = {
        ...formData,
        pricePerPiece: parseFloat(formData.pricePerPiece),
        gst: parseFloat(formData.gst),
        priceWithGST: parseFloat(priceWithGST.toFixed(2)), // Add this line
        brand: brandOption?.value || "",
        category: categoryOption?.value || "",
        unitOfMeasurement: unitOption?.value || "",
        newImages: undefined,
        newDocuments: undefined,
        imagesToDelete: undefined,
        documentsToDelete: undefined,
        existingImages: formData.existingImages.filter(
          (img) => !formData.imagesToDelete.includes(img)
        ),
        existingDocuments: formData.existingDocuments.filter(
          (doc) => !formData.documentsToDelete.includes(doc)
        ),
      };

      formDataToSend.append("product", JSON.stringify(productData));
      formDataToSend.append(
        "imagesToDelete",
        JSON.stringify(formData.imagesToDelete)
      );
      formDataToSend.append(
        "documentsToDelete",
        JSON.stringify(formData.documentsToDelete)
      );

      formData.newImages.forEach((image) => {
        formDataToSend.append("images", image);
      });

      formData.newDocuments.forEach((doc) => {
        formDataToSend.append("documents", doc);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productSku}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );
      if (!response.ok) throw new Error("Failed to update product");
      const updated = await response.json();
      onUpdateProduct(updated);
      onClose();
    } catch (err) {
      console.error(err);
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
        <h2 className="text-xl font-bold mb-6">Edit Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Product Name*</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">SKU ID*</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.skuId}
              onChange={(e) => handleChange("skuId", e.target.value)}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700">Brand</label>
            <CreatableSelect
              options={brands}
              isClearable
              value={brandOption}
              onChange={(newValue) => {
                setBrandOption(newValue);
                handleSelectChange("brand", newValue);
              }}
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setBrands((prev) => [...prev, newOption]);
                setBrandOption(newOption);
                handleSelectChange("brand", newOption);
              }}
              placeholder="Brand"
            />
          </div>
          <div>
            <label className="block text-gray-700">Category</label>
            <CreatableSelect
              options={categories}
              isClearable
              value={categoryOption}
              onChange={(newValue) => {
                setCategoryOption(newValue);
                handleSelectChange("category", newValue);
              }}
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setCategories((prev) => [...prev, newOption]);
                setCategoryOption(newOption);
                handleSelectChange("category", newOption);
              }}
              placeholder="Category"
            />
          </div>
          <div>
            <label className="block text-gray-700">
              Price Per Unit (without GST)*
            </label>
            <input
              type="number"
              required
              className="w-full p-2 border rounded"
              value={formData.pricePerPiece}
              onChange={(e) => handleChange("pricePerPiece", e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700">Stock Quantity*</label>
            <input
              type="number"
              required
              className="w-full p-2 border rounded"
              value={formData.stockQuantity}
              onChange={(e) => handleChange("stockQuantity", e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700">Unit of Measurement*</label>
            <CreatableSelect
              options={units}
              isClearable
              required
              value={unitOption}
              onChange={(newValue) => {
                setUnitOption(newValue);
                handleSelectChange("unitOfMeasurement", newValue);
              }}
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setUnits((prev) => [...prev, newOption]);
                setUnitOption(newOption);
                handleSelectChange("unitOfMeasurement", newOption);
              }}
              placeholder="Unit"
            />
          </div>
          <div>
            <label className="block text-gray-700">GST (%)*</label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              className="w-full p-2 border rounded"
              value={formData.gst}
              onChange={(e) => handleChange("gst", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Features</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.features}
              onChange={(e) => handleChange("features", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Specifications</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.specifications}
              onChange={(e) => handleChange("specifications", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
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
              onClick={() => document.getElementById("image-upload")?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Select Images
            </button>

            {/* Display existing and new images */}
            <div className="mt-4 space-y-2">
              {formData.existingImages.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600">
                    {img.split("/").pop()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <IoEyeSharp size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {formData.newImages.map((file, idx) => (
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
                      onClick={() => handleDeleteNewImage(idx)}
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
              onChange={handleDocumentsChange}
              className="hidden"
              id="document-upload"
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("document-upload")?.click()
              }
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Select Documents
            </button>

            {/* Display existing and new documents */}
            <div className="mt-4 space-y-2">
              {formData.existingDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600">
                    {doc.split("/").pop()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <IoEyeSharp size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingDocument(doc)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {formData.newDocuments.map((file, idx) => (
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
                      onClick={() => handleDeleteNewDocument(idx)}
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

export default EditProductModal;
