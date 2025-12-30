import React from "react";
import Select from "react-select";
import { Product, ProductSupplied, LoadingState, Option } from "../types";

interface ProductSectionProps {
  products: Product[];
  filteredProducts: Product[];
  brands: Option[];
  formData: ProductSupplied;
  loading: LoadingState;
  selectedBrand: string | null;
  handleBrandChange: (selectedOption: Option | null) => void;
  handleProductChange: (selectedOption: Option | null) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  filteredProducts,
  brands,
  formData,
  loading,
  selectedBrand,
  handleBrandChange,
  handleProductChange,
}) => {
  return (
    <>
      {/* Brand Selection */}
      <div>
        <label className="block text-gray-700">
          Brand <span className="text-red-500">*</span>
        </label>
        <Select
          options={brands}
          onChange={handleBrandChange}
          placeholder="Select Brand"
          isLoading={loading.products}
          value={formData.brand ? { value: formData.brand, label: formData.brand } : null}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      
      {/* Product Selection */}
      <div>
        <label className="block text-gray-700">
          Product <span className="text-red-500">*</span>
        </label>
        <Select
          options={filteredProducts.map(p => ({ value: p.id, label: p.productName }))}
          onChange={handleProductChange}
          placeholder={selectedBrand ? "Select Product" : "Select Brand First"}
          isLoading={loading.products}
          isDisabled={!selectedBrand}
          value={formData.productId ? { value: formData.productId, label: formData.productName } : null}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      

    </>
  );
};

export default ProductSection;