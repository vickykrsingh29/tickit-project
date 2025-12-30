// filepath: /Users/abhaygupta/Desktop/cpq-frontend/src/components/QuotesTable.tsx
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
  useRowSelect, // Added
} from "react-table";
import Select from "react-select";
import { useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaTrash } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface Quote {
  refNo: string;
  status: string;
  updatedAt: string;
  createdBy: string;
  totalAmount: number;
  customer: {
    name: string;
  };
  items: Array<{
    productName: string;
    // ...other item fields
  }>;
}

function multiColumnGlobalFilter(
  rows: Array<Row<Quote>>,
  columnIds: Array<IdType<Quote>>,
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

const QuotesTable: React.FC = () => {
  const [data, setData] = useState<Quote[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const history = useHistory();
  const { getAccessTokenSilently } = useAuth0();
  const [originalData, setOriginalData] = useState<Quote[]>([]);
  const [tempFilters, setTempFilters] = useState({
    customerName: [] as any[],
    status: [] as any[],
    createdBy: [] as any[],
    totalAmount: [0, 1000000] as [number, number],
    productNames: [] as any[],
  });

  const getColumnFilterOptions = (key: string) => {
    const uniqueValues = Array.from(
      new Set(
        data.map((item) => {
          const value = key.includes(".")
            ? key.split(".").reduce((o, i) => (o as any)[i], item)
            : item[key as keyof Quote];
          return value;
        })
      )
    );
    return uniqueValues.map((value) => ({ label: value, value }));
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quotes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setData(result);
        setOriginalData(result); // Store original data
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    fetchQuotes();

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilters(false);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [getAccessTokenSilently]);

  const columns: Array<Column<Quote>> = React.useMemo(
    () => [
      {
        id: "selection",
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <input
            type="checkbox"
            {...getToggleAllRowsSelectedProps()}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Added
          />
        ),
        Cell: ({ row }: any) => (
          <input
            type="checkbox"
            {...row.getToggleRowSelectedProps()}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Added
          />
        ),
      },
      { Header: "Reference No", accessor: "refNo" },
      {
        Header: "Customer Name",
        accessor: (row: Quote) => row.customer.name,
        id: "customer.name",
      },
      { Header: "Status", accessor: "status" },
      { Header: "Created By", accessor: "createdBy" },
      {
        Header: "Total Amount",
        accessor: "totalAmount",
        Cell: ({ value }: { value: number }) => (
          <span>₹{value.toFixed(2)}</span>
        ),
      },
      {
        Header: "Product Names",
        id: "productNames",
        Cell: ({ row }: any) =>
          row.original.items.map((item: any) => item.productName).join(", "),
      },
      {
        Header: "Last Updated At",
        accessor: "updatedAt",
        Cell: ({ value }: { value: string }) => {
          const date = new Date(value);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(-2);
          return <span>{`${hours}:${minutes} , ${day}/${month}/${year}`}</span>;
        },
      },
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
    selectedFlatRows, // Added
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
    useRowSelect // Added
  );

  // Handle Delete Selected Quotes
  async function handleDeleteSelected() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the selected quote(s)?"
    );
    if (!confirmDelete) return;
    try {
      const token = await getAccessTokenSilently();
      const refNos = selectedFlatRows.map((row) => row.original.refNo);
  
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/quotes`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refNos }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to delete quote(s)");
      }
  
      // Remove deleted quotes from state
      setData((prev) => prev.filter((quote) => !refNos.includes(quote.refNo)));
      setOriginalData((prev) => prev.filter((quote) => !refNos.includes(quote.refNo))); // Update originalData
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

    // Apply customer name filter
    if (tempFilters.customerName.length > 0) {
      const customerNames = tempFilters.customerName.map((c) => c.value);
      filteredData = filteredData.filter((item) =>
        customerNames.includes(item.customer.name)
      );
    }

    // Apply status filter
    if (tempFilters.status.length > 0) {
      const statuses = tempFilters.status.map((s) => s.value);
      filteredData = filteredData.filter((item) =>
        statuses.includes(item.status)
      );
    }

    // Apply created by filter
    if (tempFilters.createdBy.length > 0) {
      const creators = tempFilters.createdBy.map((c) => c.value);
      filteredData = filteredData.filter((item) =>
        creators.includes(item.createdBy)
      );
    }

    // Apply total amount filter
    filteredData = filteredData.filter(
      (item) =>
        item.totalAmount >= tempFilters.totalAmount[0] &&
        item.totalAmount <= tempFilters.totalAmount[1]
    );

    // Apply product names filter
    if (tempFilters.productNames.length > 0) {
      const products = tempFilters.productNames.map((p) => p.value);
      filteredData = filteredData.filter((item) =>
        item.items.some((i) => products.includes(i.productName))
      );
    }

    setData(filteredData);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempFilters({
      customerName: [],
      status: [],
      createdBy: [],
      totalAmount: [0, 1000000],
      productNames: [],
    });
    setData(originalData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quotes</h1>
        {/* Normal search input */}
        <input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder="Search all columns..."
          className="p-2 border rounded w-1/4"
        />

        {/* Add New Quote and Filter buttons */}
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
              onClick={() => history.push("/add-new-quote")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add New Quote
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
                {/* Customer Name Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Customer Name
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.customerName}
                    options={getColumnFilterOptions("customer.name")}
                    onChange={(selected) =>
                      handleTempFilterChange("customerName", selected || [])
                    }
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.status}
                    options={getColumnFilterOptions("status")}
                    onChange={(selected) =>
                      handleTempFilterChange("status", selected || [])
                    }
                    className="w-full"
                  />
                </div>

                {/* Created By Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Created By
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.createdBy}
                    options={getColumnFilterOptions("createdBy")}
                    onChange={(selected) =>
                      handleTempFilterChange("createdBy", selected || [])
                    }
                    className="w-full"
                  />
                </div>

                {/* Total Amount Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Total Amount Range
                  </label>
                  <Slider
                    range
                    min={0}
                    max={Math.max(
                      ...originalData.map((item) => item.totalAmount)
                    )}
                    value={tempFilters.totalAmount}
                    onChange={(value: number | number[]) => {
                      if (Array.isArray(value)) {
                        handleTempFilterChange("totalAmount", value);
                      }
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span>₹{tempFilters.totalAmount[0]}</span>
                    <span>₹{tempFilters.totalAmount[1]}</span>
                  </div>
                </div>

                {/* Product Names Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Product Names
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.productNames}
                    options={originalData
                      .flatMap((quote) =>
                        quote.items.map((item) => item.productName)
                      )
                      .filter(
                        (value, index, self) => self.indexOf(value) === index
                      )
                      .map((value) => ({ label: value, value }))}
                    onChange={(selected) =>
                      handleTempFilterChange("productNames", selected || [])
                    }
                    className="w-full"
                  />
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
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="border-b">
              {headerGroup.headers.map((column) => (
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
                className="border-b cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  history.push(`/quote-details?quoteId=${row.original.refNo}`)
                }
              >
                {row.cells.map((cell) => {
                  if (cell.column.id === "selection") {
                    return (
                      <td
                        {...cell.getCellProps()}
                        className="p-4"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  }
                  return (
                    <td {...cell.getCellProps()} className="p-4">
                      {cell.render("Cell")}
                    </td>
                  );
                })}
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
    </div>
  );
};

export default QuotesTable;
