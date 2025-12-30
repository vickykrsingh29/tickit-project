import React, { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'react-table';
import Select from 'react-select';
import { FaTrash, FaSpinner, FaPlus, FaFilter, FaSortDown, FaSortUp, FaSort, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaInbox } from 'react-icons/fa';
import { useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Order from '../../../types/Order';
import { useDeleteOrders } from '../hooks/useDeleteOrders';
import { IndeterminateCheckbox } from '../../IndeterminateCheckbox';
import { toast } from 'react-toastify';


function multiColumnGlobalFilter(
  rows: Array<Row<Order>>,
  columnIds: Array<IdType<Order>>,
  filterValue: string
) {
  if (!filterValue) return rows;

  if (!filterValue.includes(':')) {
    const lower = filterValue.toLowerCase();
    return rows.filter((row) =>
      columnIds.some((id) => {
        const val = row.values[id];
        return String(val).toLowerCase().includes(lower);
      })
    );
  }

  const pairs = filterValue.split(';').map((pair) => {
    const [col, vals] = pair.split(':');
    return { col, vals: vals?.split(',') ?? [] };
  });

  return rows.filter((row) =>
    pairs.every(({ col, vals }) => {
      if (!col || vals.length === 0) return true;
      const rowVal = row.values[col];
      return vals.includes(String(rowVal));
    })
  );
}

const OrdersTable: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [originalData, setOriginalData] = useState<Order[]>([]);
  const [tempFilters, setTempFilters] = useState({
    customerName: [] as any[],
    orderStatus: [] as any[],
    executiveName: [] as any[],
    totalOrderValue: [0, 1000000] as [number, number],
    startDate: '',
    endDate: '',
  });
  const history = useHistory();
  const [isDeleting, setIsDeleting] = useState(false);
  const tableInstanceRef = useRef<any>(null);

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, [getAccessTokenSilently]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Handle different API response formats
      let ordersData;
      if (result && result.orders && Array.isArray(result.orders)) {
        ordersData = result.orders;
      } else if (Array.isArray(result)) {
        ordersData = result;
      } else if (result && result.rows && Array.isArray(result.rows)) {
        ordersData = result.rows;
      } else {
        ordersData = [];
      }

      setData(ordersData);
      setOriginalData(ordersData);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getColumnFilterOptions = (key: string) => {
    const uniqueValues = Array.from(
      new Set(
        data.map((item) => item[key as keyof Order])
      )
    );
    return uniqueValues.map((value) => ({ label: value, value }));
  };

  const columns = useMemo<Column<Order>[]>(
    () => [
      { Header: 'Order Number', accessor: 'orderNumber' },
      { Header: 'Order Name', accessor: 'orderName' },
      { Header: 'Customer', accessor: 'customerName' },
      { 
        Header: 'Order Date', 
        accessor: 'orderDate',
        Cell: ({ value }: { value: string }) => <span>{value ? new Date(value).toLocaleDateString() : '-'}</span>
      },
      { Header: 'Status', accessor: 'orderStatus' },
      { 
        Header: 'Total Value', 
        accessor: 'totalOrderValue',
        Cell: ({ value }: { value: number }) => <span>₹{value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
      },
      { Header: 'Executive', accessor: 'executiveName' },
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
    state: { pageIndex, pageSize, globalFilter, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      globalFilter: multiColumnGlobalFilter,
      autoResetSelectedRows: false,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Header: ({ getToggleAllPageRowsSelectedProps }: any) => (
            <div className="flex items-center justify-center">
              <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }: any) => (
            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
          disableSortBy: true,
          width: 40,
        },
        ...columns,
      ]);
    }
  );

  tableInstanceRef.current = {
    toggleAllRowsSelected: (value: boolean) => {
      if (value === false) {
        selectedFlatRows.forEach(row => {
          row.toggleRowSelected(false);
        });
      }
    }
  };

  useEffect(() => {
    if (tableInstanceRef.current) {
      tableInstanceRef.current.toggleAllRowsSelected(false);
    }
  }, [data]);

  const handleTempFilterChange = (type: string, value: any) => {
    setTempFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const applyFilters = () => {
    let filteredData = [...originalData];

    // Apply customer name filter
    if (tempFilters.customerName.length > 0) {
      const customerNames = tempFilters.customerName.map((c) => c.value);
      filteredData = filteredData.filter((item) =>
        customerNames.includes(item.customerName)
      );
    }

    // Apply order status filter
    if (tempFilters.orderStatus.length > 0) {
      const statuses = tempFilters.orderStatus.map((s) => s.value);
      filteredData = filteredData.filter((item) =>
        statuses.includes(item.orderStatus)
      );
    }

    // Apply executive name filter
    if (tempFilters.executiveName.length > 0) {
      const executives = tempFilters.executiveName.map((e) => e.value);
      filteredData = filteredData.filter((item) =>
        executives.includes(item.executiveName)
      );
    }

    // Apply total order value filter
    filteredData = filteredData.filter(
      (item) =>
        item.totalOrderValue >= tempFilters.totalOrderValue[0] &&
        item.totalOrderValue <= tempFilters.totalOrderValue[1]
    );

    // Apply date range filter
    if (tempFilters.startDate && tempFilters.endDate) {
      filteredData = filteredData.filter((item) =>
        item.orderDate >= tempFilters.startDate && item.orderDate <= tempFilters.endDate
      );
    }

    setData(filteredData);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempFilters({
      customerName: [],
      orderStatus: [],
      executiveName: [],
      totalOrderValue: [0, 1000000],
      startDate: '',
      endDate: '',
    });
    setData(originalData);
  };

  const handleBulkDelete = async () => {
    if (selectedFlatRows.length === 0) {
      toast.warning('No orders selected for deletion');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedFlatRows.length} selected orders?`)) {
      try {
        setIsDeleting(true);
        
        const orderIds = selectedFlatRows.map(row => row.original.orderNumber);
        const success = await useDeleteOrders(orderIds, getAccessTokenSilently);
        
        if (success) {
          fetchOrders();
          
          if (tableInstanceRef.current) {
            tableInstanceRef.current.toggleAllRowsSelected(false);
          }
        }
      } catch (error) {
        console.error('Error deleting orders:', error);
        toast.error('Failed to delete orders');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>

        <input
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder="Search all columns..."
          className="p-2 border rounded-md w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />

        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => history.push("/add-new-order-form")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <FaPlus className="mr-2" /> Add New Order
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`px-4 py-2 ${showFilters ? 'bg-blue-700' : 'bg-blue-600'} text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center`}
            >
              <FaFilter className="mr-2" /> Filter
            </button>
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md p-5 z-10 w-80 border border-gray-200">
                {/* Customer Name Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Customer Name
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.customerName}
                    options={getColumnFilterOptions('customerName')}
                    onChange={(selected) =>
                      handleTempFilterChange('customerName', selected || [])
                    }
                    className="w-full"
                    classNamePrefix="select"
                  />
                </div>

                {/* Order Status Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Order Status
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.orderStatus}
                    options={getColumnFilterOptions('orderStatus')}
                    onChange={(selected) =>
                      handleTempFilterChange('orderStatus', selected || [])
                    }
                    className="w-full"
                    classNamePrefix="select"
                  />
                </div>

                {/* Executive Name Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Executive Name
                  </label>
                  <Select
                    isMulti
                    value={tempFilters.executiveName}
                    options={getColumnFilterOptions('executiveName')}
                    onChange={(selected) =>
                      handleTempFilterChange('executiveName', selected || [])
                    }
                    className="w-full"
                    classNamePrefix="select"
                  />
                </div>

                {/* Date Range Filter */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Order Date Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={tempFilters.startDate || ''}
                      onChange={(e) =>
                        handleTempFilterChange('startDate', e.target.value)
                      }
                      className="p-2 border rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={tempFilters.endDate || ''}
                      onChange={(e) =>
                        handleTempFilterChange('endDate', e.target.value)
                      }
                      className="p-2 border rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action bar with selection count and delete button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {Object.keys(selectedRowIds || {}).length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className={`px-4 py-2 ${
                isDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              } text-white rounded-md transition-colors duration-200 flex items-center`}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" /> Delete Selected ({Object.keys(selectedRowIds || {}).length})
                </>
              )}
            </button>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {data.length} order{data.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-red-600 font-medium">Error loading orders: {error}</p>
          <p className="text-red-500 mt-2">Please try refreshing the page</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="w-full text-left border-collapse">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100 border-b border-gray-200">
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="p-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        <div className="flex items-center">
                          {column.render('Header')}
                          <span className="ml-1">
                            {column.isSorted
                              ? column.isSortedDesc
                                ? <FaSortDown className="text-blue-600" />
                                : <FaSortUp className="text-blue-600" />
                              : column.canSort ? <FaSort className="text-gray-400" /> : null}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaInbox className="text-4xl text-gray-300 mb-2" />
                        <p>No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => history.push(`/order-details/${row.original.orderNumber}`)}
                      >
                        {row.cells.map((cell) => {
                          if (cell.column.id === 'selection') {
                            return (
                              <td
                                {...cell.getCellProps()}
                                className="p-4 w-10"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {cell.render('Cell')}
                              </td>
                            );
                          }
                          return (
                            <td {...cell.getCellProps()} className="p-4">
                              {cell.render('Cell')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                <FaAngleLeft />
              </button>
              <span className="text-gray-700">
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>
              </span>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => gotoPage(pageOptions.length - 1)}
                disabled={!canNextPage}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">
                Showing <strong>{page.length}</strong> of{' '}
                <strong>{data.length}</strong> orders
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-2 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersTable;