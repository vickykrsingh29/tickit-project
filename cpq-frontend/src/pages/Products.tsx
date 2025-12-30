import React from "react";
import ProductsTable from "../components/ProductsTable";

const ProductsPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-full min-w-full">
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <ProductsTable />
    </div>
  );
};

export default ProductsPage;
