import React, { useState, useEffect, useMemo } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
  useFilters,
  useRowSelect,
  Column,
  Row,
  IdType,
} from "react-table";
import { useAuth0 } from "@auth0/auth0-react";
import { FaSort, FaSortUp, FaSortDown, FaTrash, FaPlus } from "react-icons/fa";
import ConfirmationModal from "../components/utils/ConfirmationModal";
import Spinner from "../components/utils/Spinner";
import Pagination from "../components/utils/Pagination";
import AddLicenseModal from "../components/LicenseManagement/AddLicenseModal";
import { toast } from "react-toastify";

// Define interfaces based on the API response
interface Device {
  id: number;
  licenseId: number;
  productName: string;
  brand: string;
  frequencyRange: string;
  powerOutput: number;
  quantityApproved: number;
  countryOfOrigin: string;
  equipmentType: string;
  technologyUsed: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: number;
  name: string;
  ancillaryName: string | null;
}

interface ContactPerson {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface License {
  id: number;
  licenseNumber: string;
  licenseType: string;
  issuingDate: string;
  expiryDate: string;
  status: string;
  issuingAuthority: string;
  companyName: string;
  companyId: number;
  wpcCity: string;
  contactPersonId: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  contactPerson: ContactPerson;
  devices: Device[];
}

// Custom global filter function for advanced filtering
function multiColumnGlobalFilter(
  rows: Array<Row<License>>,
  columnIds: Array<IdType<License>>,
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

// Checkbox component for row selection with proper TypeScript typing
const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
>(({ indeterminate = false, ...rest }, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    // Check if resolvedRef is an object with a current property
    if (
      typeof resolvedRef === "object" &&
      resolvedRef !== null &&
      "current" in resolvedRef &&
      resolvedRef.current
    ) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={resolvedRef}
      className="h-4 w-4 rounded border-gray-300 text-blue-600"
      {...rest}
    />
  );
});
const Licenses: React.FC = () => {
  const [data, setData] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<License[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  // Fetch licenses from API
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/licenses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch licenses");
        }

        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, [getAccessTokenSilently]);

  // Calculate total quantity approved for each license
  const licensesWithTotalQuantity = useMemo(() => {
    return data.map((license) => ({
      ...license,
      totalQuantityApproved: license.devices.reduce(
        (sum, device) => sum + device.quantityApproved,
        0
      ),
    }));
  }, [data]);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // Define table columns
  const columns = useMemo<Column<License>[]>(
    () => [
      {
        Header: "License Number",
        accessor: "licenseNumber",
      },
      {
        Header: "License Type",
        accessor: "licenseType",
      },
      {
        Header: "Customer",
        accessor: (row) => {
          return row.customer.ancillaryName
            ? `${row.customer.name} - ${row.customer.ancillaryName}`
            : row.customer.name;
        },
        id: "customerName",
      },
      {
        Header: "WPC City",
        accessor: "wpcCity",
      },
      {
        Header: "Expiry Date",
        accessor: "expiryDate",
        Cell: ({ value }: { value: string }) => <>{formatDate(value)}</>,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value, row }: { value: string; row: any }) => {
          const expiryDate = row.original.expiryDate;
          const isExpired = new Date(expiryDate) < new Date();
          const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

          return (
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${
                isExpired
                  ? "bg-red-100 text-red-800"
                  : daysUntilExpiry <= 30
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isExpired
                ? "Expired"
                : daysUntilExpiry <= 30
                ? `Expiring in ${daysUntilExpiry} days`
                : "Active"}
            </span>
          );
        },
      },
    ],
    []
  );

  // Set up react-table
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
      data: licensesWithTotalQuantity,
      initialState: { pageIndex: 0, pageSize: 10 },
      globalFilter: multiColumnGlobalFilter,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
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

  // Handle adding a new license - this receives the result from the modal
  const handleAddLicense = async (licenseResult: any) => {
    try {
      // The modal has already sent the data to the API and returned the result
      // We just need to refresh the license list or add the new license to our data

      // Fetch the updated list
      setLoading(true);
      const token = await getAccessTokenSilently();
      const updatedLicensesResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/licenses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (updatedLicensesResponse.ok) {
        const updatedLicenses = await updatedLicensesResponse.json();
        setData(updatedLicenses);
        toast.success("License added successfully");
      } else {
        // Even if adding succeeded but refresh failed
        // Add the new license to the current data
        setData((prevData) => [licenseResult, ...prevData]);
        toast.success("License added successfully");
        toast.info("Some data may not be up to date. Please refresh.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error refreshing license data");
    } finally {
      setLoading(false);
    }
  };
  // Handle deleting selected licenses
  const handleDeleteSelected = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const licensesToDelete = selectedRows.map((row) => row.id);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/licenses/delete-many`,
        {
          method: "POST", // Changed from DELETE to POST to match your backend route
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ licenseIds: licensesToDelete }), // Changed from 'ids' to 'licenseIds'
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete licenses");
      }

      // Update data by removing deleted licenses
      setData((prevData) =>
        prevData.filter((license) => !licensesToDelete.includes(license.id))
      );

      toast.success("Selected licenses deleted successfully");
      setIsConfirmationModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete licenses");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Licenses</h1>
            <p className="text-gray-500">Manage all licenses and approvals</p>
          </div>
          <div className="flex space-x-4">
            {selectedRows.length > 0 && (
              <button
                onClick={() => setIsConfirmationModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <FaTrash />
                Delete Selected
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FaPlus />
              Add License
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                value={globalFilter || ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search licenses..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Search by any field, or use format "field:value" (e.g.,
            "licenseType:ETA")
          </p>
        </div>

        {/* Main Table Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table
                {...getTableProps()}
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.render("Header")}</span>
                            <span>
                              {column.id !== "selection" ? (
                                column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <FaSortDown className="inline" />
                                  ) : (
                                    <FaSortUp className="inline" />
                                  )
                                ) : (
                                  <FaSort className="inline opacity-40" />
                                )
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
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          // Stop propagation to prevent triggering checkbox clicks
                          if (
                            (e.target as HTMLElement).closest(
                              'input[type="checkbox"]'
                            )
                          ) {
                            return;
                          }
                          const licenseId = row.original.id;
                          window.open(`/licenses/${licenseId}`, "_blank");
                        }}
                      >
                        {row.cells.map((cell) => {
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-4 py-3">
              <Pagination
                pageIndex={pageIndex}
                pageCount={pageOptions.length}
                gotoPage={gotoPage}
                previousPage={previousPage}
                nextPage={nextPage}
                canPreviousPage={canPreviousPage}
                canNextPage={canNextPage}
                pageOptions={pageOptions}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLicense}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onCancel={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Licenses"
        message={`Are you sure you want to delete ${selectedRows.length} selected license(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDisabled={loading}
      />
    </div>
  );
};

export default Licenses;
