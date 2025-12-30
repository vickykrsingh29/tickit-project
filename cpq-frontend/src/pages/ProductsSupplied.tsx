import React, { useState, useEffect, useMemo } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  Column,
  Row,
  IdType,
} from "react-table";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "../components/utils/Spinner";
import Pagination from "../components/utils/Pagination";
import ConfirmationModal from "../components/utils/ConfirmationModal";
import AddProductSuppliedModal from "../components/ProductsSupplied/AddProductSuppliedModal";


interface ProductSupplied {
  id: string;
  productName: string;
  brand: string;
  sku: string;
  customerName: string;
  quantity: number;
  supplyDate: string;
  status: string;
}


interface BulkDeleteResponse {
  success: boolean;
  ids: string[];
}

// API functions
const fetchProductsSupplied = async (): Promise<ProductSupplied[]> => {
  // Replace with actual API endpoint
  // const response = await fetch('/api/products-supplied');
  // if (!response.ok) throw new Error('Network response was not ok');
  // return response.json();

  // Using dummy data for now
  return [
    {
      id: "1",
      productName: "Enterprise Server License",
      brand: "TechSoft",
      sku: "SVR001",
      customerName: "Acme Corporation",
      quantity: 20,
      supplyDate: "2025-03-01",
      status: "Delivered",
    },
    {
      id: "2",
      productName: "Cloud Storage Premium",
      brand: "CloudTech",
      sku: "CLD105",
      customerName: "Globex Industries",
      quantity: 50,
      supplyDate: "2025-02-28",
      status: "In Progress",
    },
    {
      id: "3",
      productName: "Security Suite Enterprise",
      brand: "SecureNet",
      sku: "SEC334",
      customerName: "Wayne Enterprises",
      quantity: 15,
      supplyDate: "2025-02-25",
      status: "Pending",
    },
    {
      id: "4",
      productName: "Analytics Dashboard Pro",
      brand: "DataViz",
      sku: "ANL221",
      customerName: "Stark Industries",
      quantity: 10,
      supplyDate: "2025-03-03",
      status: "Delivered",
    },
    {
      id: "5",
      productName: "CRM Professional License",
      brand: "RelationSoft",
      sku: "CRM087",
      customerName: "Oscorp",
      quantity: 35,
      supplyDate: "2025-03-05",
      status: "Pending",
    },
  ];
};


const bulkDeleteProductsSupplied = async (
  ids: string[]
): Promise<BulkDeleteResponse> => {
  // Replace with actual API endpoint
  // const response = await fetch('/api/products-supplied/bulk-delete', {
  //   method: 'DELETE',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ ids }),
  // });
  // if (!response.ok) throw new Error('Failed to delete products');
  // return response.json();

  // Mock successful deletion
  return { success: true, ids };
};

// Custom checkbox component for row selection
const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
>(({ indeterminate = false, ...rest }, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = (ref || defaultRef) as React.RefObject<HTMLInputElement>;

  React.useEffect(() => {
    if (resolvedRef && resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={resolvedRef}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      {...rest}
    />
  );
});

// Global search filter function
function globalFilter(
  rows: Row<ProductSupplied>[],
  columnIds: IdType<ProductSupplied>[],
  filterValue: string
) {
  if (!filterValue || filterValue === "") return rows;

  const lowercasedValue = filterValue.toLowerCase();

  return rows.filter((row) => {
    return columnIds.some((columnId) => {
      const rowValue = row.values[columnId];
      return rowValue !== undefined && rowValue !== null
        ? String(rowValue).toLowerCase().includes(lowercasedValue)
        : false;
    });
  });
}

const ProductsSupplied: React.FC = () => {
  const [data, setData] = useState<ProductSupplied[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<ProductSupplied[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [showBulkDeleteModal, setShowBulkDeleteModal] =
    useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);


  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProductsSupplied();
        setData(productsData);
        setIsError(false);
      } catch (error) {
        console.error("Error fetching products supplied:", error);
        setIsError(true);
        setErrorMessage((error as Error).message || "Failed to load data");
        toast.error("Failed to load products supplied");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Define columns
  const columns: Array<Column<ProductSupplied>> = useMemo(
    () => [
      {
        Header: "Product Name",
        accessor: "productName",
      },
      {
        Header: "Brand",
        accessor: "brand",
      },
      {
        Header: "SKU",
        accessor: "sku",
      },
      {
        Header: "Customer",
        accessor: "customerName",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
      },
      {
        Header: "Supply Date",
        accessor: "supplyDate",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }: { value: string }) => {
          let statusColor = "gray";

          switch (value) {
            case "Delivered":
              statusColor = "green";
              break;
            case "Pending":
              statusColor = "yellow";
              break;
            case "In Progress":
              statusColor = "blue";
              break;
            default:
              statusColor = "gray";
          }

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}
            >
              {value}
            </span>
          );
        },
      },
    ],
    []
  );

  const filterTypes = useMemo(
    () => ({
      global: globalFilter,
    }),
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
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    setGlobalFilter,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      globalFilter: globalFilter,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }: any) => (
            <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
          ),
          Cell: ({ row }: { row: Row<ProductSupplied> }) => (
            <div onClick={(e) => e.stopPropagation()}>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  // Update selected rows when selection changes
  useEffect(() => {
    setSelectedRows(selectedFlatRows.map((row) => row.original));
  }, [selectedFlatRows]);

  // Handler for global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || "";
    setGlobalFilterValue(value);
    setGlobalFilter(value);
  };

  // Handler functions
  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  // Add this new function to handle form submission
  const handleAddProductSubmit = (productSupplied: any) => {
    // Here you would typically make an API call to save the data
    // For now, we'll just update the local state
    const newProduct = {
      id: Date.now().toString(), // Temporary ID for demo
      productName: productSupplied.productName,
      brand: productSupplied.brand,
      sku: productSupplied.sku,
      customerName: productSupplied.customerName,
      quantity: productSupplied.quantity,
      supplyDate: productSupplied.supplyDate ? productSupplied.supplyDate.toISOString().split('T')[0] : '',
      status: productSupplied.status
    };

    setData((prevData) => [newProduct, ...prevData]);
    setIsAddModalOpen(false);
    toast.success("Product successfully added");
  };


  // Change handleDeleteSelected to show confirmation instead of deleting
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.warning("No items selected");
      return;
    }
    setShowBulkDeleteModal(true);
  };

  // Add this new function to perform the actual deletion
  const confirmBulkDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.id);
    setIsBulkDeleting(true);
    try {
      await bulkDeleteProductsSupplied(selectedIds);
      // Update local state to remove deleted items
      setData((prevData) =>
        prevData.filter((item) => !selectedIds.includes(item.id))
      );
      toast.success(`${selectedRows.length} items deleted successfully`);
    } catch (error) {
      console.error("Error bulk deleting records:", error);
      toast.error("Failed to delete selected records");
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">Error loading data: {errorMessage}</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products Supplied</h1>
        <div className="flex space-x-2">
          {selectedRows.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedRows.length})`}
            </button>
          )}
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Supplied Product
          </button>
        </div>
      </div>

      {/* Global Search Input */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          value={globalFilterValue}
          onChange={handleSearch}
          placeholder="Search in all columns..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg mb-4">
        <table
          {...getTableProps()}
          className="min-w-full divide-y divide-gray-200"
        >
          <thead className="bg-gray-50">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {column.render("Header")}
                      <span className="ml-1">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FaSortDown className="inline" />
                          ) : (
                            <FaSortUp className="inline" />
                          )
                        ) : column.canSort ? (
                          <FaSort className="inline text-gray-300" />
                        ) : null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            {...getTableBodyProps()}
            className="bg-white divide-y divide-gray-200"
          >
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className={`${
                    row.isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        gotoPage={gotoPage}
        previousPage={previousPage}
        nextPage={nextPage}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        pageOptions={pageOptions}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      {/* Add Modal */}
      <AddProductSuppliedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProductSubmit}
      />
      
      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <ConfirmationModal
          title="Confirm Bulk Deletion"
          message={`Are you sure you want to delete ${selectedRows.length} selected items?`}
          confirmLabel={isBulkDeleting ? "Deleting..." : "Delete"}
          cancelLabel="Cancel"
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteModal(false)}
          isDisabled={isBulkDeleting}
        />
      )}
    </div>
  );
};

export default ProductsSupplied;
