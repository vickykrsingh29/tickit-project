import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useMemo, useState } from "react";
import { FaTrash } from "react-icons/fa";
import Select from "react-select";
import {
  Column,
  IdType,
  Row,
  useFilters,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import AddNewCustomerModal from "./AddNewCustomerModal";
import Customer from "../types/Customer";

// Updated interface to reflect new fields


// Updated custom global filter function to also handle normal text searches
function multiColumnGlobalFilter(
  rows: Array<Row<Customer>>,
  columnIds: Array<IdType<Customer>>,
  filterValue: string
) {
  if (!filterValue) return rows;

  // If the filter string doesn't contain ":", treat it as a normal substring search
  if (!filterValue.includes(":")) {
    const lower = filterValue.toLowerCase();
    return rows.filter((row) =>
      columnIds.some((id) => {
        const val = row.values[id];
        return String(val).toLowerCase().includes(lower);
      })
    );
  }

  // Otherwise, parse semicolon-delimited filters
  // e.g. "status:active,pending;name:John"
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

const CustomersTable: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const [originalData, setOriginalData] = useState<Customer[]>([]);
  const [tempFilters, setTempFilters] = useState({
    name: [] as any[],
    industry: [] as any[],
    billingCity: [] as any[],
    typeOfCustomer: [] as any[],
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/customers`,
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
        setData(data);
        setOriginalData(data); // Store original data
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [getAccessTokenSilently]);

  const handleAddCustomer = async (newCustomer: Customer) => {
    // Update both data and originalData with the new customer
    setData((prevData) => [...prevData, newCustomer]);
    setOriginalData((prevData) => [...prevData, newCustomer]);
  };

  const handleDeleteCustomers = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: deletingIds }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete customers. Status: ${response.status}`
        );
      }

      setData((prevData) =>
        prevData.filter((customer) => !deletingIds.includes(customer.id))
      );
      setShowDeleteModal(false);
      setDeletingIds([]);
    } catch (err: any) {
      console.error("Error deleting customers:", err);
      setDeleteError(err.message);
    }
  };

  // Updated columns to display new fields
  const columns: Array<Column<Customer>> = useMemo(
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
      {
        Header: "Company Name",
        accessor: (row: Customer) => {
          if (row.ancillaryName) {
            return `${row.name} - ${row.ancillaryName}`;
          }
          return row.name;
        },
        id: 'companyName'
      },
      {
        Header: "Industry",
        accessor: "industry",
      },
      {
        Header: "Type",
        accessor: "typeOfCustomer",
      },
      {
        Header: "Phone",
        accessor: "phone",
      },
      {
        Header: "City",
        accessor: "billingCity",
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

  const getColumnFilterOptions = (key: string) => {
    const uniqueValues = Array.from(
      new Set(originalData.map((item) => item[key as keyof Customer]))
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

  const handleRowClick = (customerId: number) => {
    console.log("Opening customer details page for ID:", customerId); // Debugging
    window.open(`/customer-details?customerId=${customerId}`, "_blank");
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

  // Add these functions inside the CustomersTable component
  const handleTempFilterChange = (type: string, value: any) => {
    setTempFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const applyFilters = () => {
    let filteredData = [...data]; // Use current data instead of originalData
  
    // Apply industry filter
    if (tempFilters.industry.length > 0) {
      const industries = tempFilters.industry.map((i) => i.value);
      filteredData = filteredData.filter((item) =>
        industries.includes(item.industry)
      );
    }
  
    // Apply city filter
    if (tempFilters.billingCity.length > 0) {
      const cities = tempFilters.billingCity.map((c) => c.value);
      filteredData = filteredData.filter((item) =>
        cities.includes(item.billingCity)
      );
    }
  
    // Apply name filter
    if (tempFilters.name.length > 0) {
      const names = tempFilters.name.map((n) => n.value);
      filteredData = filteredData.filter((item) =>
        names.includes(item.name)
      );
    }
  
    // Apply type of customer filter
    if (tempFilters.typeOfCustomer.length > 0) {
      const types = tempFilters.typeOfCustomer.map((t) => t.value);
      filteredData = filteredData.filter((item) =>
        types.includes(item.typeOfCustomer)
      );
    }
  
    setData(filteredData);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempFilters({
      name: [],
      industry: [],
      billingCity: [],
      typeOfCustomer: [],
    });
    setData(originalData);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Customers</h1>
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value || undefined)}
            placeholder="Search all columns..."
            className="p-2 border rounded w-1/4"
          />
          <div className="flex items-center space-x-2">
            {selectedFlatRows.length > 0 && (
              <button
                onClick={() => {
                  setDeletingIds(
                    selectedFlatRows.map((row) => row.original.id)
                  );
                  setShowDeleteModal(true);
                }}
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
                Add New Customer
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
                  {/* Industry Filter */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Industry
                    </label>
                    <Select
                      isMulti
                      value={tempFilters.industry}
                      options={getColumnFilterOptions("industry")}
                      onChange={(selected) =>
                        handleTempFilterChange("industry", selected || [])
                      }
                      className="w-full"
                    />
                  </div>
                  { /*parent company filter*/}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Company
                      </label>
                      <Select
                        isMulti
                        value={tempFilters.name}
                        options={getColumnFilterOptions("name")}
                        onChange={(selected) =>
                          handleTempFilterChange("name", selected || [])
                        }
                        className="w-full"
                      />
                  </div>

                  { /* type of customer filter*/}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Type of Customer
                      </label>
                      <Select
                        isMulti
                        value={tempFilters.typeOfCustomer}
                        options={getColumnFilterOptions("typeOfCustomer")}
                        onChange={(selected) =>
                          handleTempFilterChange("typeOfCustomer", selected || [])
                        }
                        className="w-full"
                      />
                  </div>

                  {/* City Filter */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      City
                    </label>
                    <Select
                      isMulti
                      value={tempFilters.billingCity}
                      options={getColumnFilterOptions("billingCity")}
                      onChange={(selected) =>
                        handleTempFilterChange("billingCity", selected || [])
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

        <table
          {...getTableProps()}
          className="w-full text-left border-collapse"
        >
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
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.cells.map((cell) => {
                    // For the selection column, stop propagation.
                    if (cell.column.id === "selection") {
                      return (
                        <td
                          {...cell.getCellProps()}
                          className="p-4"
                          onClick={(e) => e.stopPropagation()}
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
        <AddNewCustomerModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddCustomer}
        />
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Customers</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the selected customers? This
              action cannot be undone.
            </p>
            {deleteError && <p className="text-red-500 mb-4">{deleteError}</p>}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                  setDeletingIds([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomers}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomersTable;
