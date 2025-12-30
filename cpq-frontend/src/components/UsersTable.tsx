import React, { useState, useEffect, useMemo } from "react";
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
import { useAuth0 } from "@auth0/auth0-react";
import { FaTrash } from "react-icons/fa";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  companyName: string;
  teamName: string;
  approvalByAdmin: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ...existing code (multiColumnGlobalFilter)...
function multiColumnGlobalFilter(
  rows: Array<Row<User>>,
  columnIds: Array<IdType<User>>,
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

const UsersTable: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently, user } = useAuth0();

  // ...existing code (fetchUsers useEffect)...
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/getcompanyusers`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user?.email, id: user?.sub }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAccessTokenSilently, user]);

  // { changed code: added a selection column at the start }
  const columns: Array<Column<User>> = useMemo(
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
        Header: "Name",
        accessor: (row: User) => `${row.firstName} ${row.lastName}`,
        id: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Designation",
        accessor: "designation",
      },
      {
        Header: "Team Name",
        accessor: "teamName",
      },
      {
        Header: "Approval Status",
        accessor: (row: User) => (row.approvalByAdmin ? "Approved" : "Pending"),
        id: "approvalStatus",
      },
    ],
    []
  );

  // { changed code: added selectedFlatRows to the table state }
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

  // ...existing code (handleFilterChange and getColumnFilterOptions)...
  const handleFilterChange = (column: string, selectedOptions: any) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((opt: any) => opt.value)
      : [];
    setFilters((prev) => ({ ...prev, [column]: selectedValues }));

    const filterString = Object.entries({
      ...filters,
      [column]: selectedValues,
    })
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => `${key}:${values.join(",")}`)
      .join(";");

    setGlobalFilter(filterString || undefined);
  };

  const getColumnFilterOptions = (key: string) => {
    const uniqueValues = Array.from(
      new Set(data.map((item) => item[key as keyof User]))
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

  // { changed code: added handleDeleteSelected and handleApproveSelected }
  async function handleDeleteSelected() {
    try {
      const token = await getAccessTokenSilently();
      const userIds = selectedFlatRows.map((row) => row.original.id);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user(s).");
      }
      // Remove deleted users from state
      setData((prev) => prev.filter((u) => !userIds.includes(u.id)));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  async function handleApproveSelected() {
    try {
      const token = await getAccessTokenSilently();
      const userIds = selectedFlatRows.map((row) => row.original.id);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve user(s).");
      }
      // Update local data to reflect approval
      setData((prev) =>
        prev.map((u) =>
          userIds.includes(u.id) ? { ...u, approvalByAdmin: true } : u
        )
      );
    } catch (err) {
      console.error("Approval error:", err);
    }
  }

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

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder="Search all columns..."
          className="p-2 border rounded w-1/4"
        />
        <div className="flex items-center space-x-2">
          {/* { changed code: show approve & delete buttons if at least one row is selected } */}
          {selectedFlatRows.length > 0 && (
            <>
              <button
                onClick={handleApproveSelected}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Approve Selected
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete Selected
              </button>
            </>
          )}
          <div className="relative">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Filter
            </button>
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-md rounded p-4 z-10 w-80">
                {columns.map((column) => (
                  <div
                    key={column.id || (column.accessor as string)}
                    className="mb-4"
                  >
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {column.Header as React.ReactNode}
                    </label>
                    {column.id !== "selection" && (
                      <Select
                        isMulti
                        options={getColumnFilterOptions(
                          column.id || (column.accessor as string)
                        )}
                        onChange={(selected) =>
                          handleFilterChange(
                            column.id || (column.accessor as string),
                            selected
                          )
                        }
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
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
                className="border-b hover:bg-gray-100"
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
          Page <strong>{pageIndex + 1}</strong> of {pageOptions.length}
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

export default UsersTable;