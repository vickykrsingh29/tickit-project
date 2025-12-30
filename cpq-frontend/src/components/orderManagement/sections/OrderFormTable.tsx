import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from "react";
import { useTable, Column, useRowSelect } from "react-table";
import Select from "react-select";
import { useAuth0 } from "@auth0/auth0-react";
import { FaTrash } from "react-icons/fa";
import AddNewProductModal from "../../AddNewProductModal";
import { OrderItem, OrderTotals } from "../types";
import { Product } from "../../../types";

interface OrderFormTableProps {
  initialData?: OrderItem[];
  isEditing?: boolean;
  onItemsChange?: (items: OrderItem[], totals: OrderTotals) => void;
}

// Checkbox component for row selection
const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
>(({ indeterminate = false, ...rest }, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
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
      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      {...rest}
    />
  );
});

const OrderFormTable = forwardRef(
  ({ initialData, isEditing, onItemsChange }: OrderFormTableProps, ref) => {
    const { getAccessTokenSilently } = useAuth0();
    const [currentEditingRow, setCurrentEditingRow] = useState<OrderItem | null>(null);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [data, setData] = useState<OrderItem[]>(initialData || []);
    const [products, setProducts] = useState<Product[]>([]);
    const [productOptions, setProductOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totals, setTotals] = useState<OrderTotals>({
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      totalAmount: 0,
      additionalCostTotal: 0,
      grandTotal: 0
    });

    // Refs for tracking updates
    const isUpdatingFromParent = useRef(false);
    const prevDataRef = useRef<string>("");
    const tableInstanceRef = useRef<any>(null);

    // Calculate totals for the order
    const calculateTotals = () => {
      let subtotal = 0;
      let taxTotal = 0;
      let discountTotal = 0;

      data.forEach((item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemTax = (itemSubtotal * item.taxRate) / 100;
        
        subtotal += itemSubtotal;
        taxTotal += itemTax;
        // Discount is not implemented yet, but we'll include it for future use
        discountTotal += 0;
      });

      const totalAmount = subtotal + taxTotal - discountTotal;
      
      return {
        subtotal,
        taxTotal,
        discountTotal,
        totalAmount,
        additionalCostTotal: 0, // This is handled at a higher level
        grandTotal: totalAmount // At this level, grandTotal is the same as totalAmount
      };
    };

    // Initialize data from initialData prop
    useEffect(() => {
      if (initialData && initialData.length > 0) {
        isUpdatingFromParent.current = true;
        setData(initialData);
      }
    }, [initialData]);

    // Update totals whenever data changes
    useEffect(() => {
      // Skip if data is empty
      if (data.length === 0) return;
      
      const newTotals = calculateTotals();
      setTotals(newTotals);
      
      // Stringify data for comparison to prevent unnecessary updates
      const currentDataString = JSON.stringify(data);
      
      // Only notify parent if data actually changed and it's not an update from parent
      if (onItemsChange && !isUpdatingFromParent.current && currentDataString !== prevDataRef.current) {
        onItemsChange(data, totals);
        prevDataRef.current = currentDataString;
      }
      
      // Reset the flag after the update
      isUpdatingFromParent.current = false;
    }, [data, onItemsChange]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getData: () => data,
      addRow,
      deleteRow,
    }));

    // Fetch products on component mount
    useEffect(() => {
      const fetchProducts = async () => {
        if (productOptions.length > 0) return; // Prevent multiple fetches
        
        setIsLoading(true);
        setError(null);
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
          }

          const productsData = await response.json();
          console.log("Products data:", productsData);
          
          // Store the full product data
          setProducts(productsData);
          
          // Create options for the dropdown
          const options = productsData.map((product: Product) => ({
            value: product.skuId,
            label: `${product.productName} (${product.skuId})`,
          }));
          
          setProductOptions(options);
          
          // Add an empty row if in editing mode and no initial data
          if (isEditing && data.length === 0 && (!initialData || initialData.length === 0)) {
            addRow();
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          setError("Failed to load products. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    }, [getAccessTokenSilently]);

    const addRow = () => {
      const newId = Math.random();
      setData([
        ...data,
        {
          id: newId,
          productId: 0,
          productName: "",
          description: "",
          quantity: 0,
          unitPrice: 0,
          taxRate: 0,
          totalAmount: 0,
          remarks: "",
          skuId: "",
          discountRate: 0,
          subtotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          unit: "",
          category: "",
          modelNo: "",
          serialNo: "",
          size: "",
          batchNo: "",
          expDate: "",
          mfgDate: "",
          warranty: "",
          manufacturer: "",
          additionalDetails: "",
          status: "",
          orderId: 0
        },
      ]);
    };

    const deleteRow = (id: number) => {
      if (window.confirm("Are you sure you want to delete this row?")) {
        setData((prevData) => prevData.filter((row) => row.id !== id));
      }
    };

    const handleInputChange = (id: number, field: keyof OrderItem, value: any) => {
      setData((prevData) => {
        return prevData.map((row) => {
          if (row.id === id) {
            const updatedRow = {
              ...row,
              [field]: value,
            };
            
            if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
              const quantity = field === "quantity" ? Number(value) : Number(row.quantity || 0);
              const unitPrice = field === "unitPrice" ? Number(value) : Number(row.unitPrice || 0);
              const taxRate = field === "taxRate" ? Number(value) : Number(row.taxRate || 0);
              const discountRate = Number(row.discountRate || 0);
              
              const subtotal = quantity * unitPrice;
              const taxAmount = (subtotal * taxRate) / 100;
              const discountAmount = (subtotal * discountRate) / 100;
              const totalAmount = subtotal + taxAmount - discountAmount;
              
              return {
                ...updatedRow,
                subtotal: subtotal,
                taxAmount: taxAmount,
                discountAmount: discountAmount,
                totalAmount: totalAmount
              };
            } else if (field === "discountRate") {
              const quantity = Number(row.quantity || 0);
              const unitPrice = Number(row.unitPrice || 0);
              const taxRate = Number(row.taxRate || 0);
              const discountRate = Number(value || 0);
              
              const subtotal = quantity * unitPrice;
              const taxAmount = (subtotal * taxRate) / 100;
              const discountAmount = (subtotal * discountRate) / 100;
              const totalAmount = subtotal + taxAmount - discountAmount;
              
              return {
                ...updatedRow,
                discountAmount: discountAmount,
                totalAmount: totalAmount
              };
            }
            
            return updatedRow;
          }
          return row;
        });
      });
    };

    const handleProductSelect = (id: number, selectedSkuId: string) => {
      if (!selectedSkuId) {
        setData((prevData) =>
          prevData.map((row) =>
            row.id === id
              ? {
                  ...row,
                  productId: 0,
                  productName: "",
                  skuId: "",
                  unitPrice: 0,
                  taxRate: 0,
                  subtotal: 0,
                  taxAmount: 0,
                  totalAmount: 0,
                  unit: "",
                  category: "",
                }
              : row
          )
        );
        return;
      }

      const selectedProduct = products.find((p) => p.skuId === selectedSkuId);
      if (!selectedProduct) return;

      setData((prevData) => {
        return prevData.map((row) => {
          if (row.id === id) {
            const quantity = Number(row.quantity || 1);
            const unitPrice = selectedProduct.pricePerPiece;
            const taxRate = selectedProduct.gst;
            const subtotal = quantity * unitPrice;
            const taxAmount = (subtotal * taxRate) / 100;
            const totalAmount = subtotal + taxAmount;
            
            return {
              ...row,
              productId: selectedProduct.id,
              productName: selectedProduct.productName,
              description: selectedProduct.notes || "",
              unitPrice: unitPrice,
              taxRate: taxRate,
              quantity: quantity,
              subtotal: subtotal,
              taxAmount: taxAmount,
              discountAmount: 0,
              totalAmount: totalAmount,
              unit: selectedProduct.unitOfMeasurement,
              category: selectedProduct.category,
              skuId: selectedProduct.skuId
            };
          }
          return row;
        });
      });
    };

    const handleAddProduct = async (newProduct: any) => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to refresh products: ${response.statusText}`);
        }

        const productsData = await response.json();
        setProducts(productsData);
        
        const options = productsData.map((product: Product) => ({
          value: product.skuId,
          label: `${product.productName} (${product.skuId})`,
        }));
        setProductOptions(options);

        const addedProduct = productsData.find(
          (p: Product) => p.productName === newProduct.productName
        );

        if (addedProduct && currentEditingRow) {
          handleProductSelect(currentEditingRow.id, addedProduct.skuId);
        }
      } catch (error) {
        console.error("Error refreshing products after add:", error);
        setError("Failed to refresh products. Please try again.");
      }
    };

    const calculateValue = (row: OrderItem) => {
      const quantity = Number(row.quantity);
      const unitPrice = Number(row.unitPrice);
      const subtotal = quantity * unitPrice;
      const taxAmount = calculateTax(row);
      return subtotal + taxAmount;
    };

    const calculateTax = (row: OrderItem) => {
      const quantity = Number(row.quantity);
      const unitPrice = Number(row.unitPrice);
      const taxRate = Number(row.taxRate);
      const subtotal = quantity * unitPrice;
      return (subtotal * taxRate) / 100;
    };

    const columns = useMemo<Column<OrderItem>[]>(
      () => [
        {
          Header: "Product",
          accessor: "productName",
          Cell: ({ value, row }) => (
            <div className="flex flex-col">
              <Select
                options={[
                  ...products.map((product) => ({
                    value: product.skuId,
                    label: `${product.productName} (${product.skuId})`,
                    ...product,
                  })),
                  { value: "add_new", label: "+ Add New Product" }
                ]}
                value={
                  row.original.skuId
                    ? {
                        value: row.original.skuId,
                        label: `${row.original.productName} (${row.original.skuId})`,
                      }
                    : null
                }
                onChange={(option) => {
                  if (option && option.value === "add_new") {
                    setCurrentEditingRow(row.original);
                    setIsAddProductModalOpen(true);
                    return;
                  }
                  handleProductSelect(row.original.id, option ? option.value : "");
                }}
                isDisabled={!isEditing}
                placeholder="Select product..."
                isClearable
                className="w-full"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  control: base => ({ ...base, minWidth: '250px' })
                }}
              />
            </div>
          ),
          width: 300
        },
        {
          Header: "Quantity",
          accessor: "quantity",
          Cell: ({ value, row }) => (
            <input
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleInputChange(
                  row.original.id as number,
                  "quantity",
                  e.target.value
                )
              }
              disabled={!isEditing}
              className="w-20 p-1 border rounded"
              min="1"
            />
          ),
          width: 100
        },
        {
          Header: "Unit Price",
          accessor: "unitPrice",
          Cell: ({ value, row }) => (
            <input
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleInputChange(
                  row.original.id as number,
                  "unitPrice",
                  e.target.value
                )
              }
              disabled={!isEditing}
              className="w-24 p-1 border rounded"
              min="0"
              step="0.01"
            />
          ),
          width: 120
        },
        {
          Header: "Tax Rate (%)",
          accessor: "taxRate",
          Cell: ({ value, row }) => (
            <input
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleInputChange(
                  row.original.id as number,
                  "taxRate",
                  e.target.value
                )
              }
              disabled={!isEditing}
              className="w-20 p-1 border rounded"
              min="0"
              max="100"
              step="0.01"
            />
          ),
          width: 120
        },
        {
          Header: "Subtotal",
          accessor: "subtotal",
          Cell: ({ row }) => {
            const quantity = Number(row.original.quantity) || 0;
            const unitPrice = Number(row.original.unitPrice) || 0;
            const subtotal = quantity * unitPrice;
            return <span>₹{subtotal.toFixed(2)}</span>;
          },
          width: 120
        },
        {
          Header: "Tax",
          accessor: "taxAmount",
          Cell: ({ row }) => {
            const tax = calculateTax(row.original);
            return <span>₹{tax.toFixed(2)}</span>;
          },
          width: 100
        },
        {
          Header: "Total",
          accessor: "totalAmount",
          Cell: ({ row }) => {
            const total = calculateValue(row.original);
            return <span>₹{total.toFixed(2)}</span>;
          },
          width: 120
        },
      ],
      [isEditing, products, isAddProductModalOpen]
    );

    // Create a table instance with the necessary hooks
    const tableInstance = useTable(
      {
        columns,
        data,
        autoResetSelectedRows: false, // Prevent auto-reset of selection
      },
      useRowSelect,
      hooks => {
        hooks.visibleColumns.push(columns => [
          // First column is the selection column
          {
            id: 'selection',
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div className="flex items-center justify-center">
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            Cell: ({ row }) => (
              <div className="flex items-center justify-center">
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} onClick={(e) => e.stopPropagation()} />
              </div>
            ),
          },
          ...columns,
        ]);
      }
    );

    // Store the table instance in a ref for access in effects
    tableInstanceRef.current = tableInstance;

    // Reset selection when data changes
    useEffect(() => {
      if (tableInstanceRef.current && !isUpdatingFromParent.current) {
        // Only reset if not updating from parent to avoid losing selection during parent updates
        tableInstanceRef.current.toggleAllRowsSelected(false);
      }
      isUpdatingFromParent.current = false;
    }, [data]);

    // Extract table props
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
      selectedFlatRows,
      state: { selectedRowIds },
    } = tableInstance;

    const totalValue = totals.totalAmount;

    // Delete selected rows using react-table's selection
    const deleteSelectedRows = () => {
      // Get the selected rows from selectedFlatRows
      const selectedIds = selectedFlatRows.map(row => row.original.id);
      
      if (selectedIds.length === 0) {
        console.log("No rows selected for deletion");
        return;
      }
      
      console.log("Selected flat rows:", selectedFlatRows);
      console.log("Deleting selected rows with IDs:", selectedIds);
      console.log("Current data before deletion:", data);
      
      // Filter out the selected rows from the data
      const newData = data.filter(item => !selectedIds.includes(item.id));
      console.log("New data after deletion:", newData);
      
      setData(newData);
      
      if (tableInstanceRef.current) {
        tableInstanceRef.current.toggleAllRowsSelected(false);
      }
      
      if (onItemsChange) {
        const newTotals = calculateTotals();
        onItemsChange(newData, newTotals);
      }
    };

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="mt-2 text-gray-600">Loading products...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={addRow}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                + Add Row
              </button>
              {Object.keys(selectedRowIds).length > 0 && (
                <button
                  onClick={deleteSelectedRows}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                >
                  <FaTrash className="mr-2" /> Delete Selected ({Object.keys(selectedRowIds).length})
                </button>
              )}
            </div>
          )}
          <div className="text-sm text-gray-500">
            {data.length} item{data.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50">
                    {row.cells.map((cell, cellIndex) => {
                      return (
                        <td
                          {...cell.getCellProps()}
                          className={`px-4 py-2 ${cellIndex === 0 ? 'text-center' : ''}`}
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 w-64">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tax:</span>
              <span>₹{totals.taxTotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {isAddProductModalOpen && (
          <AddNewProductModal
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            onAddProduct={handleAddProduct}
          />
        )}
      </div>
    );
  }
);

export default OrderFormTable;