import React, { useState, useEffect } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
  useFilters,
  Column,
  Row,
  IdType,
  useRowSelect,
} from "react-table";
import Select from "react-select";
import AddNewProductModal from "./AddNewProductModal";
import { useAuth0 } from "@auth0/auth0-react";
import { FaTrash } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

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
  createdAt: string;
  updatedAt: string;
  userId: string; // Added userId to the Product interface
}

function multiColumnGlobalFilter(
  rows: Array<Row<Product>>,
  columnIds: Array<IdType<Product>>,
  filterValue: string
) {
  if (!filterValue) return rows;
  if (!filterValue.includes(":")) {
    const lower = filterValue.toLowerCase();
    return rows.filter((row) =>
      columnIds.some((id) => {
        const val = row.values[id];
        return String(val).toLowerCase().includes(lower);
      })
    );
  }
  const pairs = filterValue.split(";").map((pair) => {
    const [col, vals] = pair.split(":");
    return { col, vals: vals?.split(",") ?? [] };
  });
  return rows.filter((row) =>
    pairs.every(({ col, vals }) => {
      if (!col || vals.length === 0) return true;
      const rowVal = row.values[col];
      return vals.includes(String(rowVal));
    })
  );
}

function openProductDetails(product: Product) {
  window.open(`/product-details?sku=${product.skuId}`, "_blank");
}

const ProductsTable: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { getAccessTokenSilently } = useAuth0();
  const [originalData, setOriginalData] = useState<Product[]>([]);
  const [tempFilters, setTempFilters] = useState({
    brand: [] as any[],
    category: [] as any[],
    priceRange: [0, 1000] as [number, number],
    stockStatus: "all",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Retrieve the access token from Auth0
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Including JWT token in the request
              "Content-Type": "application/json",
            },
          }
        );
        console.log(token);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const products: Product[] = await response.json();
        setData(products);
        setOriginalData(products); // Store original data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [getAccessTokenSilently]);

  const columns: Array<Column<Product>> = React.useMemo(
    () => [
      {
        id: "selection",
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <input
            type="checkbox"
            {...getToggleAllRowsSelectedProps()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        Cell: ({ row }: any) => (
          <input
            type="checkbox"
            {...row.getToggleRowSelectedProps()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      { Header: "Product Name", accessor: "productName" },
      { Header: "SKU", accessor: "skuId" },
      { Header: "Brand", accessor: "brand" },
      { Header: "Category", accessor: "category" },
      { Header: "Price Per Piece", accessor: "pricePerPiece" },
      { Header: "Stock Quantity", accessor: "stockQuantity" },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    selectedFlatRows,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      globalFilter: multiColumnGlobalFilter,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
  // Add these functions inside the ProductsTable component
  const handlePriceRangeFilter = (range: [number, number]) => {
    const filteredData = data.filter(
      (item) => item.pricePerPiece >= range[0] && item.pricePerPiece <= range[1]
    );
    setData(filteredData);
  };

  const handleStockFilter = (status: string) => {
    let filteredData = [...data];
    if (status === "in") {
      filteredData = data.filter((item) => item.stockQuantity > 0);
    } else if (status === "out") {
      filteredData = data.filter((item) => item.stockQuantity === 0);
    }
    setData(filteredData);
  };

  // Modify the existing handleFilterChange function
  const handleFilterChange = (column: string, selectedOptions: any) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      // Reset filter for this column
      const { [column]: removed, ...rest } = filters;
      setFilters(rest);
    } else {
      const selectedValues = selectedOptions.map((opt: any) => opt.value);
      setFilters((prev) => ({ ...prev, [column]: selectedValues }));
    }

    // Apply all active filters
    let filteredData = [...data];
    Object.entries(filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        filteredData = filteredData.filter((item) =>
          values.includes(String(item[key as keyof Product]))
        );
      }
    });
    setData(filteredData);
  };

  const getColumnFilterOptions = (key: string) => {
    const uniqueValues = Array.from(
      new Set(data.map((item) => item[key as keyof Product]))
    );
    return uniqueValues.map((value) => ({ label: value, value }));
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilters(false);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  async function handleDeleteSelected() {
    // Add confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to delete these product(s)?"
    );

    if (!confirmDelete) {
      return; // Exit if user cancels
    }
    try {
      const token = await getAccessTokenSilently();
      const skuIds = selectedFlatRows.map((row) => row.original.skuId);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skuIds }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product(s)");
      }

      // Remove deleted products from state
      setData((prev) =>
        prev.filter((product) => !skuIds.includes(product.skuId))
      );
      setOriginalData((prev) =>
        prev.filter((product) => !skuIds.includes(product.skuId))
      );
    } catch (error) {
      console.error("Delete error:", error);
    }
  }

  const handleTempFilterChange = (type: string, value: any) => {
    setTempFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const applyFilters = () => {
    let filteredData = [...originalData];

    // Apply brand filter
    if (tempFilters.brand.length > 0) {
      const brands = tempFilters.brand.map((b) => b.value);
      filteredData = filteredData.filter((item) => brands.includes(item.brand));
    }

    // Apply category filter
    if (tempFilters.category.length > 0) {
      const categories = tempFilters.category.map((c) => c.value);
      filteredData = filteredData.filter((item) =>
        categories.includes(item.category)
      );
    }

    // Apply price range filter
    filteredData = filteredData.filter(
      (item) =>
        item.pricePerPiece >= tempFilters.priceRange[0] &&
        item.pricePerPiece <= tempFilters.priceRange[1]
    );

    // Apply stock status filter
    if (tempFilters.stockStatus !== "all") {
      filteredData = filteredData.filter((item) =>
        tempFilters.stockStatus === "in"
          ? item.stockQuantity > 0
          : item.stockQuantity === 0
      );
    }

    setData(filteredData);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempFilters({
      brand: [],
      category: [],
      priceRange: [0, 1000],
      stockStatus: "all",
    });
    setData(originalData);
  };

  // Add this useEffect to handle Escape key for closing the modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isModalOpen]);

  const handleAddProduct = (newProduct: Product) => {
    setData((prev) => [...prev, newProduct]);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder="Search all columns..."
          className="p-2 border rounded w-1/4"
        />
        <div className="flex items-center space-x-2">
          {selectedFlatRows.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="text-gray-500 mr-4 hover:text-red-500 focus:outline-none"
              title="Delete Selected"
            >
              <FaTrash size={20} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add New Product
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Filter
            </button>
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-md rounded p-4 z-10 w-80">
                {/* Brand Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Brand
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.brand}
                    options={getColumnFilterOptions("brand")}
                    onChange={(selected) =>
                      handleTempFilterChange("brand", selected || [])
                    }
                    className="w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Category
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.category}
                    options={getColumnFilterOptions("category")}
                    onChange={(selected) =>
                      handleTempFilterChange("category", selected || [])
                    }
                    className="w-full"
                  />
                </div>

                {/* Price Range Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Price Range
                  </label>
                  <Slider
                    range
                    min={0}
                    max={Math.max(
                      ...originalData.map((item) => item.pricePerPiece)
                    )}
                    value={tempFilters.priceRange}
                    onChange={(value: number | number[]) => {
                      if (Array.isArray(value)) {
                        handleTempFilterChange("priceRange", value);
                      }
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span>₹{tempFilters.priceRange[0]}</span>
                    <span>₹{tempFilters.priceRange[1]}</span>
                  </div>
                </div>

                {/* Stock Status Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Stock Status
                  </label>
                  <select
                    value={tempFilters.stockStatus}
                    onChange={(e) =>
                      handleTempFilterChange("stockStatus", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>

                {/* Filter Action Buttons */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <table {...getTableProps()} className="w-full text-left border-collapse">
        <thead>
          {headerGroups.map((headerGroup: any) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="border-b">
              {headerGroup.headers.map((column: any) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="p-4 text-gray-700 cursor-pointer"
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => openProductDetails(row.original)}
              >
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="p-4">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <div>
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="ml-2 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="ml-2 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => gotoPage(pageOptions.length - 1)}
            disabled={!canNextPage}
            className="ml-2 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="ml-4 px-4 py-2 border rounded"
        >
          {[5, 10, 20, 30].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
      <AddNewProductModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAddProduct={handleAddProduct} // Pass the handler
      />
    </div>
  );
};

export default ProductsTable;
