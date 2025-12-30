import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from "react";
import { useTable, Column } from "react-table";
import Select from "react-select";
import { useAuth0 } from "@auth0/auth0-react";
import { FaTrash } from "react-icons/fa";
import AddNewProductModal from "./AddNewProductModal";

interface OrderFormTableProps {
  initialData?: OrderItem[];
  isEditing?: boolean;
  onItemsChange?: (items: OrderItem[], totals: OrderTotals) => void;
}

interface OrderItem {
  id: number;
  name: string;
  description: string;
  qty: number;
  unitPrice: number;
  tax: number;
  value: number;
  remarks: string;
  // Additional fields needed for the backend
  orderId?: number;
  productId?: number;
  productName?: string;
  skuId?: string;
  taxRate?: number;
  quantity?: number;
  discountRate?: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  unit?: string;
  category?: string;
  modelNo?: string;
  serialNo?: string;
  size?: string;
  batchNo?: string;
  expDate?: string | null;
  mfgDate?: string | null;
  status?: string;
  additionalDetails?: string;
  warranty?: string;
  manufacturer?: string;
}

interface Product {
  id: number;
  productName: string;
  brand: string;
  category: string;
  skuId: string;
  pricePerPiece: number;
  gst: number;
  unitOfMeasurement: string;
  notes: string;
}

interface OrderTotals {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
}

const OrderFormTable = forwardRef(
  ({ initialData, isEditing, onItemsChange }: OrderFormTableProps, ref) => {
    const { getAccessTokenSilently } = useAuth0();
    const [currentEditingRow, setCurrentEditingRow] = useState<OrderItem | null>(null);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [data, setData] = useState<OrderItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productOptions, setProductOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productsLoaded, setProductsLoaded] = useState(false);
    const [totals, setTotals] = useState<OrderTotals>({
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 0
    });
    
    // Use a ref to track if the update is coming from parent
    const isUpdatingFromParent = useRef(false);
    // Use a ref to track the previous data for comparison
    const prevDataRef = useRef<string>("");

    // Calculate totals for the entire order
    const calculateTotals = () => {
      let subtotal = 0;
      let taxTotal = 0;
      let discountTotal = 0;
      let grandTotal = 0;
      
      data.forEach(row => {
        const qty = Number(row.qty);
        const unitPrice = Number(row.unitPrice);
        const tax = Number(row.tax);
        const discount = Number(row.discountRate || 0);
        
        const rowSubtotal = qty * unitPrice;
        const rowTaxAmount = (rowSubtotal * tax) / 100;
        const rowDiscountAmount = (rowSubtotal * discount) / 100;
        const rowTotal = rowSubtotal + rowTaxAmount - rowDiscountAmount;
        
        subtotal += rowSubtotal;
        taxTotal += rowTaxAmount;
        discountTotal += rowDiscountAmount;
        grandTotal += rowTotal;
      });
      
      return {
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal
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
        onItemsChange(data, newTotals);
        prevDataRef.current = currentDataString;
      }
      
      // Reset the flag after the update
      isUpdatingFromParent.current = false;
    }, [data, onItemsChange]);

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      getItems: () => {
        return data.map(item => ({
          // Required fields with exact backend model names
          productId: Number(item.productId) || 0,
          productName: item.name || "",
          skuId: item.skuId || "",
          unitPrice: Number(item.unitPrice) || 0,
          taxRate: Number(item.tax) || 0,
          quantity: Number(item.qty) || 0,
          discountRate: Number(item.discountRate || 0) || 0,
          subtotal: Number(item.qty) * Number(item.unitPrice) || 0,
          taxAmount: (Number(item.qty) * Number(item.unitPrice) * Number(item.tax)) / 100 || 0,
          discountAmount: (Number(item.qty) * Number(item.unitPrice) * Number(item.discountRate || 0)) / 100 || 0,
          totalAmount: Number(item.value) || 0,
          
          // Optional fields with exact backend model names
          unit: item.unit || "",
          description: item.description || "",
          category: item.category || "",
          modelNo: item.modelNo || "",
          serialNo: item.serialNo || "",
          size: item.size || "",
          batchNo: item.batchNo || "",
          expDate: item.expDate || null,
          mfgDate: item.mfgDate || null,
          status: item.status || "Pending",
          additionalDetails: item.additionalDetails || "",
          warranty: item.warranty || "",
          manufacturer: item.manufacturer || "",
          
          // Include orderId if available (will be set by backend if not)
          ...(item.orderId ? { orderId: Number(item.orderId) } : {})
        }));
      },
      getTotalValue: () => {
        return totals.grandTotal;
      },
      getTotalTax: () => {
        return totals.taxTotal;
      },
      getTotalDiscount: () => {
        return totals.discountTotal;
      },
      getSubtotal: () => {
        return totals.subtotal;
      },
      // Add method to update data from parent
      updateItems: (newItems: OrderItem[]) => {
        if (newItems && newItems.length > 0) {
          isUpdatingFromParent.current = true;
          setData(newItems);
        }
      }
    }), [data, totals]);

    // Fetch products on component mount
    useEffect(() => {
      const fetchProducts = async () => {
        if (productsLoaded) return; // Prevent multiple fetches
        
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
          setProductsLoaded(true);
          
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
    }, [getAccessTokenSilently]); // Only depend on getAccessTokenSilently

    const addRow = () => {
      const newRow: OrderItem = {
        id: data.length + 1,
        name: "",
        description: "",
        qty: 0,
        unitPrice: 0,
        tax: 0,
        value: 0,
        remarks: "",
        // Backend model fields
        productId: 0,
        productName: "",
        skuId: "",
        taxRate: 0,
        quantity: 0,
        discountRate: 0,
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        unit: "",
        category: "",
        modelNo: "",
        serialNo: "",
        size: "",
        batchNo: "",
        expDate: null,
        mfgDate: null,
        status: "Pending",
        additionalDetails: "",
        warranty: "",
        manufacturer: ""
      };
      setData([...data, newRow]);
    };

    const deleteRow = (id: number) => {
      if (window.confirm("Are you sure you want to delete this row?")) {
        setData((prevData) => prevData.filter((row) => row.id !== id));
      }
    };

    const handleInputChange = (id: number, field: keyof OrderItem, value: any) => {
      // Prevent negative values for number fields
      if (["qty", "unitPrice", "tax", "discountRate"].includes(field) && Number(value) < 0) {
        value = 0;
      }
    
      setData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            const updatedRow = {
              ...row,
              [field]: value,
            };
    
            // Update calculated fields
            if (field === "qty" || field === "unitPrice" || field === "tax") {
              const qty = field === "qty" ? Number(value) : Number(row.qty);
              const unitPrice = field === "unitPrice" ? Number(value) : Number(row.unitPrice);
              const tax = field === "tax" ? Number(value) : Number(row.tax);
              const discountRate = Number(row.discountRate || 0);
    
              const subtotal = qty * unitPrice;
              const taxAmount = (subtotal * tax) / 100;
              const discountAmount = (subtotal * discountRate) / 100;
              const totalAmount = subtotal + taxAmount - discountAmount;
    
              return {
                ...updatedRow,
                value: subtotal,
                // Update backend model fields
                quantity: qty,
                taxRate: tax,
                subtotal: subtotal,
                taxAmount: taxAmount,
                discountAmount: discountAmount,
                totalAmount: totalAmount
              };
            } else if (field === "discountRate") {
              const qty = Number(row.qty);
              const unitPrice = Number(row.unitPrice);
              const tax = Number(row.tax);
              const discountRate = Number(value);
    
              const subtotal = qty * unitPrice;
              const taxAmount = (subtotal * tax) / 100;
              const discountAmount = (subtotal * discountRate) / 100;
              const totalAmount = subtotal + taxAmount - discountAmount;
    
              return {
                ...updatedRow,
                value: subtotal,
                // Update backend model fields
                discountAmount: discountAmount,
                totalAmount: totalAmount
              };
            }
    
            return updatedRow;
          }
          return row;
        })
      );
    };

    const handleProductSelect = (id: number, selectedSkuId: string) => {
      const selectedProduct = products.find(product => product.skuId === selectedSkuId);
      
      if (selectedProduct) {
        setData((prevData) =>
          prevData.map((row) => {
            if (row.id === id) {
              const qty = Number(row.qty) || 1; // Default to 1 if qty is 0
              const unitPrice = selectedProduct.pricePerPiece;
              const tax = selectedProduct.gst;
              const subtotal = qty * unitPrice;
              const taxAmount = (subtotal * tax) / 100;
              const totalAmount = subtotal + taxAmount;
              
              return {
                ...row,
                name: selectedProduct.productName,
                description: selectedProduct.notes || "",
                unitPrice: unitPrice,
                tax: tax,
                qty: qty,
                value: subtotal,
                // Backend model fields
                productId: selectedProduct.id,
                productName: selectedProduct.productName,
                skuId: selectedProduct.skuId,
                taxRate: tax,
                quantity: qty,
                subtotal: subtotal,
                taxAmount: taxAmount,
                discountAmount: 0,
                totalAmount: totalAmount,
                unit: selectedProduct.unitOfMeasurement,
                category: selectedProduct.category,
                status: "Pending"
              };
            }
            return row;
          })
        );
      }
    };

    const handleAddProduct = async (newProduct: any) => {
      try {
        // Refresh products list after adding a new product
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
        
        // Update options
        const options = productsData.map((product: Product) => ({
          value: product.skuId,
          label: `${product.productName} (${product.skuId})`,
        }));
        setProductOptions(options);

        // Find the newly added product
        const addedProduct = productsData.find(
          (p: Product) => p.productName === newProduct.productName
        );

        if (addedProduct && currentEditingRow) {
          // Update the current row with the new product
          handleProductSelect(currentEditingRow.id, addedProduct.skuId);
        }
      } catch (error) {
        console.error("Error refreshing products after add:", error);
        setError("Failed to refresh products. Please try again.");
      }
    };

    const calculateValue = (row: OrderItem) => {
      const qty = Number(row.qty);
      const unitPrice = Number(row.unitPrice);

      const subtotal = qty * unitPrice;

      const taxAmount = calculateTax(row);

      return subtotal + taxAmount;
    };

    const calculateTax = (row: OrderItem) => {
      const qty = Number(row.qty);
      const unitPrice = Number(row.unitPrice);
      const taxPercentage = Number(row.tax);
      const subtotal = qty * unitPrice;
      return (subtotal * taxPercentage) / 100;
    };

    const columns: Column<OrderItem>[] = useMemo(
      () => [
        {
          Header: "#",
          accessor: "id",
          Cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <span>{row.original.id}</span>
              {isEditing && (
                <FaTrash
                  className="text-gray-500 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  size={14}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRow(row.original.id);
                  }}
                />
              )}
            </div>
          ),
        },
        {
          Header: "Product",
          accessor: "name",
          Cell: ({ value, row }) => (
            <Select
              className="w-full"
              value={productOptions.find((option) => {
                const product = products.find(p => p.productName === value);
                return product ? option.value === product.skuId : false;
              })}
              options={[
                {
                  value: "add_new",
                  label: "+ Add New Product",
                  isDisabled: false,
                },
                ...productOptions,
              ]}
              isDisabled={!isEditing}
              isLoading={isLoading}
              placeholder="Select a product..."
              onChange={(selected: any) => {
                if (selected.value === "add_new") {
                  setCurrentEditingRow(row.original);
                  setIsAddProductModalOpen(true);
                  return;
                }
                handleProductSelect(row.original.id, selected.value);
              }}
            />
          ),
        },
        {
          Header: "Description",
          accessor: "description",
          Cell: ({ value, row }) => (
            <textarea
              className="w-full resize-none"
              value={value}
              disabled={!isEditing}
              onChange={(e) =>
                handleInputChange(row.original.id, "description", e.target.value)
              }
            />
          ),
        },
        {
          Header: "Qty",
          accessor: "qty",
          Cell: ({ value, row }) => (
            <input
              type="number"
              className="w-full"
              value={value}
              disabled={!isEditing}
              onChange={(e) =>
                handleInputChange(row.original.id, "qty", e.target.value)
              }
            />
          ),
        },
        {
          Header: "Unit Price",
          accessor: "unitPrice",
          Cell: ({ value, row }) => (
            <input
              type="number"
              className="w-full"
              value={value}
              disabled={!isEditing}
              onChange={(e) =>
                handleInputChange(row.original.id, "unitPrice", e.target.value)
              }
            />
          ),
        },
        {
          Header: "Tax %",
          accessor: "tax",
          Cell: ({ value, row }) => (
            <input
              type="number"
              className="w-full"
              value={value}
              disabled={!isEditing}
              onChange={(e) =>
                handleInputChange(row.original.id, "tax", e.target.value)
              }
            />
          ),
        },
        {
          Header: "Value",
          accessor: "value",
          Cell: ({ value }) => (
            <span className="text-right block">
              ₹{value.toFixed(2)}
            </span>
          ),
        },
        {
          Header: "Tax Amount",
          id: "taxAmount",
          Cell: ({ row }) => {
            const taxAmount = calculateTax(row.original);
            return (
              <span className="text-right block">
                ₹{taxAmount.toFixed(2)}
              </span>
            );
          },
        },
        {
          Header: "Remarks",
          accessor: "remarks",
          Cell: ({ value, row }) => (
            <textarea
              className="w-full resize-none"
              value={value}
              disabled={!isEditing}
              onChange={(e) =>
                handleInputChange(row.original.id, "remarks", e.target.value)
              }
            />
          ),
        },
      ],
      [isEditing, productOptions, products, isLoading]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable<OrderItem>({ columns, data });

    const totalValue = totals.grandTotal;

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white shadow rounded p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <table {...getTableProps()} className="w-full border-collapse">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200 text-left">
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps()} className="border p-2">
                          {column.render("Header")}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className="group hover:bg-gray-50">
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className="border p-2">
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {isEditing && (
                <button onClick={addRow} className="px-4 py-2 bg-blue-500 text-white rounded mt-4">
                  Add Row
                </button>
              )}
            </>
          )}
          <AddNewProductModal
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            onAddProduct={handleAddProduct}
          />
        </div>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex justify-between items-center">
          <div>
            <span className="text-blue-700 font-medium">Total Order Value:</span>
          </div>
          <div className="text-xl font-bold text-blue-800">
            ₹
            {totalValue > 0 ? totalValue.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : "0.00"}
          </div>
        </div>
      </>
    );
  }
);

export default OrderFormTable;